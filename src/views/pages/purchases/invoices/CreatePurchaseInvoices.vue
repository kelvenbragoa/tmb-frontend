<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import PurchaseInvoiceService from '@/service/PurchaseInvoiceService';
import SupplierService from '@/service/SupplierService';
import ProductService from '@/service/ProductService';

export default {
    name: 'CreatePurchaseInvoices',
    setup() {
        const router = useRouter();
        const toast = useToast();

        // Estado
        const loading = ref(false);
        const suppliers = ref([]);
        const products = ref([]);

        // Formulário
        const form = reactive({
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            supplier_id: null,
            payment_terms: 'net_30',
            tax_rate: 17,
            discount_amount: 0,
            discount_percentage: 0,
            shipping_cost: 0,
            notes: '',
            reference_number: '',
            items: []
        });

        // Item template
        const createEmptyItem = () => ({
            product_id: null,
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_rate: 17,
            description: '',
            unit: 'un'
        });

        // Computed
        const paymentTermsOptions = computed(() => PurchaseInvoiceService.getPaymentTerms());
        
        const supplierOptions = computed(() => 
            suppliers.value.map(supplier => ({
                label: supplier.name,
                value: supplier.id
            }))
        );

        const productOptions = computed(() => 
            products.value.map(product => ({
                label: `${product.name} (${product.sku})`,
                value: product.id,
                product
            }))
        );

        const totals = computed(() => {
            return PurchaseInvoiceService.calculateInvoiceTotals(
                form.items,
                form.shipping_cost,
                form.discount_amount,
                form.discount_percentage
            );
        });

        // Métodos
        const loadSuppliers = async () => {
            try {
                const response = await SupplierService.getAllSuppliers({ limit: 1000 });
                suppliers.value = response.items || [];
            } catch (error) {
                console.error('Erro ao carregar fornecedores:', error);
            }
        };

        const loadProducts = async () => {
            try {
                const response = await ProductService.getAllProducts({ limit: 1000 });
                products.value = response.items || [];
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            }
        };

        const addItem = () => {
            form.items.push(createEmptyItem());
        };

        const removeItem = (index) => {
            form.items.splice(index, 1);
        };

        const onProductSelect = (item, productId) => {
            const product = products.value.find(p => p.id === productId);
            if (product) {
                item.unit_price = product.sale_price || 0;
                item.description = product.description || product.name;
                item.unit = product.unit || 'un';
                item.tax_rate = product.tax_rate || 17;
            }
        };

        const calculateLineTotals = (item) => {
            const lineTotal = PurchaseInvoiceService.calculateLineTotal(
                item.quantity,
                item.unit_price,
                item.discount_percentage,
                item.discount_amount
            );
            const taxAmount = PurchaseInvoiceService.calculateLineTax(lineTotal, item.tax_rate);
            
            return {
                lineTotal,
                taxAmount,
                total: lineTotal + taxAmount
            };
        };

        const calculateDueDate = () => {
            if (!form.invoice_date || !form.payment_terms) return;
            
            const invoiceDate = new Date(form.invoice_date);
            let dueDate = new Date(invoiceDate);
            
            switch (form.payment_terms) {
                case 'immediate':
                    dueDate = invoiceDate;
                    break;
                case 'net_15':
                    dueDate.setDate(dueDate.getDate() + 15);
                    break;
                case 'net_30':
                    dueDate.setDate(dueDate.getDate() + 30);
                    break;
                case 'net_45':
                    dueDate.setDate(dueDate.getDate() + 45);
                    break;
                case 'net_60':
                    dueDate.setDate(dueDate.getDate() + 60);
                    break;
                case 'net_90':
                    dueDate.setDate(dueDate.getDate() + 90);
                    break;
            }
            
            form.due_date = dueDate.toISOString().split('T')[0];
        };

        const validateForm = () => {
            const errors = [];

            if (!form.invoice_date) errors.push('Data da fatura é obrigatória');
            if (!form.due_date) errors.push('Data de vencimento é obrigatória');
            if (!form.supplier_id) errors.push('Fornecedor é obrigatório');
            if (form.items.length === 0) errors.push('Adicione pelo menos um item');

            form.items.forEach((item, index) => {
                if (!item.product_id) errors.push(`Item ${index + 1}: Produto é obrigatório`);
                if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
                if (item.unit_price < 0) errors.push(`Item ${index + 1}: Preço unitário não pode ser negativo`);
            });

            return errors;
        };

        const savePurchaseInvoice = async () => {
            const errors = validateForm();
            if (errors.length > 0) {
                toast.add({
                    severity: 'error',
                    summary: 'Erro de Validação',
                    detail: errors.join(', '),
                    life: 5000
                });
                return;
            }

            loading.value = true;
            try {
                // Preparar dados com cálculos dos itens
                const preparedData = {
                    ...form,
                    items: form.items.map((item) => {
                        const lineTotal = PurchaseInvoiceService.calculateLineTotal(item.quantity, item.unit_price, item.discount_percentage || 0, item.discount_amount || 0);
                        const taxAmount = PurchaseInvoiceService.calculateLineTax(lineTotal, item.tax_rate || 0);
                        
                        return {
                            ...item,
                            line_total: lineTotal,
                            tax_amount: taxAmount
                        };
                    })
                };

                const response = await PurchaseInvoiceService.createPurchaseInvoice(preparedData);
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Fatura ${response.invoice_number} criada com sucesso`,
                    life: 3000
                });

                router.push({ name: 'purchases.invoices.index' });
            } catch (error) {
                console.error('Erro ao criar fatura:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao criar fatura de compra',
                    life: 5000
                });
            } finally {
                loading.value = false;
            }
        };

        const goBack = () => {
            router.push({ name: 'purchases.invoices.index' });
        };

        const formatCurrency = (value) => {
            if (!value) return 'MZN 0,00';
            return new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN'
            }).format(value);
        };

        // Watchers
        watch([() => form.invoice_date, () => form.payment_terms], calculateDueDate);

        // Lifecycle
        onMounted(async () => {
            await Promise.all([loadSuppliers(), loadProducts()]);
            addItem(); // Adicionar primeiro item
            calculateDueDate();
        });

        return {
            // Estado
            loading,
            form,

            // Computed
            paymentTermsOptions,
            supplierOptions,
            productOptions,
            totals,

            // Métodos
            addItem,
            removeItem,
            onProductSelect,
            calculateLineTotals,
            savePurchaseInvoice,
            goBack,
            formatCurrency,
            PurchaseInvoiceService
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Nova Fatura de Compra</h5>
                    <div class="flex gap-2">
                        <Button label="Cancelar" icon="pi pi-times" @click="goBack" class="p-button-outlined" />
                        <Button label="Salvar" icon="pi pi-check" @click="savePurchaseInvoice" :loading="loading" />
                    </div>
                </div>

                <!-- Informações Gerais -->
                <div class="grid mb-4">
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="invoice_date" class="font-medium">Data da Fatura *</label>
                            <Calendar id="invoice_date" v-model="form.invoice_date" dateFormat="yy-mm-dd" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="payment_terms" class="font-medium">Condições de Pagamento</label>
                            <Dropdown id="payment_terms" v-model="form.payment_terms" :options="paymentTermsOptions" optionLabel="label" optionValue="value" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="due_date" class="font-medium">Data de Vencimento *</label>
                            <Calendar id="due_date" v-model="form.due_date" dateFormat="yy-mm-dd" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="reference_number" class="font-medium">Número de Referência</label>
                            <InputText id="reference_number" v-model="form.reference_number" class="w-full" />
                        </div>
                    </div>
                </div>

                <div class="grid mb-4">
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="supplier" class="font-medium">Fornecedor *</label>
                            <Dropdown id="supplier" v-model="form.supplier_id" :options="supplierOptions" optionLabel="label" optionValue="value" placeholder="Selecione um fornecedor" class="w-full" filter />
                        </div>
                    </div>
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="notes" class="font-medium">Observações</label>
                            <Textarea id="notes" v-model="form.notes" rows="3" class="w-full" />
                        </div>
                    </div>
                </div>

                <!-- Itens -->
                <div class="mb-4">
                    <div class="flex align-items-center justify-content-between mb-3">
                        <h6 class="m-0">Itens da Fatura</h6>
                        <Button label="Adicionar Item" icon="pi pi-plus" @click="addItem" class="p-button-sm" />
                    </div>

                    <DataTable :value="form.items" class="p-datatable-gridlines">
                        <template #empty>
                            <div class="text-center py-4">
                                <p>Nenhum item adicionado</p>
                            </div>
                        </template>

                        <Column header="Produto" class="min-w-20rem">
                            <template #body="{ data }">
                                <Dropdown v-model="data.product_id" :options="productOptions" optionLabel="label" optionValue="value" placeholder="Selecione um produto" @change="onProductSelect(data, data.product_id)" class="w-full" filter />
                            </template>
                        </Column>

                        <Column header="Descrição" class="min-w-15rem">
                            <template #body="{ data }">
                                <InputText v-model="data.description" class="w-full" />
                            </template>
                        </Column>

                        <Column header="Qtd" class="min-w-8rem">
                            <template #body="{ data }">
                                <InputNumber v-model="data.quantity" :min="0" :maxFractionDigits="3" class="w-full" />
                            </template>
                        </Column>

                        <Column header="Unidade" class="min-w-8rem">
                            <template #body="{ data }">
                                <InputText v-model="data.unit" class="w-full" />
                            </template>
                        </Column>

                        <Column header="Preço Unit." class="min-w-10rem">
                            <template #body="{ data }">
                                <InputNumber v-model="data.unit_price" mode="currency" currency="MZN" locale="pt-MZ" class="w-full" />
                            </template>
                        </Column>

                        <Column header="Desc. %" class="min-w-8rem">
                            <template #body="{ data }">
                                <InputNumber v-model="data.discount_percentage" :min="0" :max="100" suffix="%" class="w-full" />
                            </template>
                        </Column>

                        <Column header="Taxa IVA %" class="min-w-8rem">
                            <template #body="{ data }">
                                <InputNumber v-model="data.tax_rate" :min="0" :max="100" suffix="%" class="w-full" />
                            </template>
                        </Column>

                        <Column header="Total Linha" class="min-w-10rem">
                            <template #body="{ data }">
                                <div class="text-right font-medium">
                                    {{ formatCurrency(calculateLineTotals(data).total) }}
                                </div>
                            </template>
                        </Column>

                        <Column header="Ações" class="min-w-8rem">
                            <template #body="{ index }">
                                <Button icon="pi pi-trash" @click="removeItem(index)" class="p-button-danger p-button-text p-button-sm" v-tooltip.top="'Remover'" />
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <!-- Totais -->
                <div class="grid">
                    <div class="col-12 md:col-8"></div>
                    <div class="col-12 md:col-4">
                        <div class="p-3 border-1 surface-border border-round">
                            <div class="grid mb-2">
                                <div class="col-12 md:col-6">
                                    <label for="shipping_cost" class="font-medium">Frete</label>
                                    <InputNumber id="shipping_cost" v-model="form.shipping_cost" mode="currency" currency="MZN" locale="pt-MZ" class="w-full" />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="discount" class="font-medium">Desconto %</label>
                                    <InputNumber id="discount" v-model="form.discount_percentage" :min="0" :max="100" suffix="%" class="w-full" />
                                </div>
                            </div>

                            <Divider />

                            <div class="flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span class="font-medium">{{ formatCurrency(totals.subtotal) }}</span>
                            </div>
                            <div class="flex justify-content-between mb-2">
                                <span>IVA:</span>
                                <span>{{ formatCurrency(totals.taxAmount) }}</span>
                            </div>
                            <div class="flex justify-content-between mb-2">
                                <span>Frete:</span>
                                <span>{{ formatCurrency(totals.shippingCost) }}</span>
                            </div>
                            <div v-if="totals.discountAmount > 0" class="flex justify-content-between mb-2">
                                <span>Desconto:</span>
                                <span class="text-red-500">-{{ formatCurrency(totals.discountAmount) }}</span>
                            </div>
                            
                            <Divider />
                            
                            <div class="flex justify-content-between">
                                <span class="font-bold text-lg">Total:</span>
                                <span class="font-bold text-lg text-primary">{{ formatCurrency(totals.total) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
}
</style>
