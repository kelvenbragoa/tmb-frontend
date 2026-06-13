<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import InvoiceService from '@/service/InvoiceService';
import CustomerService from '@/service/CustomerService';
import ProductService from '@/service/ProductService';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

// Estado do formulário
const originalData = ref(null);
const formData = ref({
    invoice_number: '',
    invoice_date: new Date(),
    due_date: new Date(),
    status: 'DRAFT',
    costumer_id: null,
    notes: '',
    paid_amount: 0,
    payment_date: null,
    items: []
});

// Estado de carregamento
const isLoading = ref(true);
const isSaving = ref(false);
const loadingCustomers = ref(false);
const loadingProducts = ref(false);

// Dados auxiliares
const customers = ref([]);
const selectedCustomer = ref(null);
const products = ref([]);
const errors = ref({});

// Opções de status
const statusOptions = [
    { label: 'Rascunho', value: 'DRAFT' },
    { label: 'Enviado', value: 'SENT' },
    { label: 'Parcialmente Pago', value: 'PARTIALLY_PAID' },
    { label: 'Pago', value: 'PAID' },
    { label: 'Vencido', value: 'OVERDUE' },
    { label: 'Cancelado', value: 'CANCELLED' }
];

// Computed properties
const canEdit = computed(() => {
    return formData.value.status === 'DRAFT';
});

const hasChanges = computed(() => {
    if (!originalData.value) return false;
    return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

const subtotal = computed(() => {
    return formData.value.items.reduce((sum, item) => {
        const itemTotal = (item.quantity * item.unit_price) - (item.discount || 0);
        return sum + itemTotal;
    }, 0);
});

const discountTotal = computed(() => {
    return formData.value.items.reduce((sum, item) => sum + (item.discount || 0), 0);
});

const taxTotal = computed(() => {
    return subtotal.value * 0.17; // 17% IVA
});

const grandTotal = computed(() => {
    return subtotal.value + taxTotal.value;
});

// Métodos
const loadInvoice = async () => {
    try {
        isLoading.value = true;
        const response = await InvoiceService.getInvoiceById(route.params.id);
        
        // Verificar se pode editar
        if (response.status?.toUpperCase() !== 'DRAFT') {
            toast.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Esta fatura não pode ser editada pois não está em estado de rascunho',
                life: 5000
            });
            router.push(`/sales/quotations/${route.params.id}`);
            return;
        }

        // Preparar dados para edição
        formData.value = {
            invoice_number: response.invoice_number,
            invoice_date: new Date(response.invoice_date),
            due_date: new Date(response.due_date),
            status: response.status,
            costumer_id: response.costumer.id,
            notes: response.notes || '',
            items: response.items.map(item => ({
                id: item.id,
                product_id: item.product?.id || null,
                product_name: item.product?.name || '',
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount_amount || 0,
                tax_rate: 17,
                total: item.line_total
            }))
        };

        // Guardar dados originais para comparação
        originalData.value = JSON.parse(JSON.stringify(formData.value));

        // Definir cliente selecionado
        await loadCustomers();
        selectedCustomer.value = customers.value.find(c => c.id === formData.value.costumer_id) || null;

    } catch (error) {
        console.error('Erro ao carregar cotação:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar cotação para edição',
            life: 3000
        });
        router.push('/sales/invoices');
    } finally {
        isLoading.value = false;
    }
};

const loadCustomers = async () => {
    try {
        loadingCustomers.value = true;
        const response = await CustomerService.getActiveCustomers();
        customers.value = response.items.map((customer) => ({
            id: customer.id,
            name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente sem nome',
            email: customer.email || '',
            phone: customer.phone || customer.mobile || '',
            address: customer.address || `${customer.street || ''}, ${customer.city || ''}, ${customer.province || ''}`.trim() || 'Endereço não informado'
        }));
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar lista de clientes',
            life: 3000
        });
    } finally {
        loadingCustomers.value = false;
    }
};

const loadProducts = async () => {
    try {
        loadingProducts.value = true;
        const response = await ProductService.getActiveProducts();
        products.value = response.items.map((product) => ({
            id: product.id,
            name: product.name || product.product_name || 'Produto sem nome',
            description: product.description || '',
            price: parseFloat(product.price || product.unit_price || 0),
            category: product.category || '',
            sku: product.sku || product.code || ''
        }));
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        products.value = [
            {
                id: 1,
                name: 'Serviço de Consultoria',
                description: 'Hora de consultoria técnica',
                price: 1500.0,
                category: 'Serviços',
                sku: 'SERV-CONS'
            }
        ];
        toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Não foi possível carregar produtos da API. Usando dados de exemplo.',
            life: 5000
        });
    } finally {
        loadingProducts.value = false;
    }
};

const onCustomerChange = () => {
    selectedCustomer.value = customers.value.find((c) => c.id === formData.value.costumer_id) || null;
};

const addItem = () => {
    formData.value.items.push({
        product_id: null,
        product_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount: 0,
        tax_rate: 17,
        total: 0
    });
};

const removeItem = (index) => {
    if (formData.value.items.length > 1) {
        formData.value.items.splice(index, 1);
    }
};

const onProductSelect = (productId, index) => {
    const selectedProduct = products.value.find((p) => p.id === productId);
    if (selectedProduct) {
        const item = formData.value.items[index];
        item.product_id = selectedProduct.id;
        item.product_name = selectedProduct.name;
        item.description = selectedProduct.description || selectedProduct.name;
        item.unit_price = selectedProduct.price;
        calculateItemTotal(index);
    }
};

const calculateItemTotal = (index) => {
    const item = formData.value.items[index];
    item.total = (item.quantity * item.unit_price) - (item.discount || 0);
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const validateForm = () => {
    errors.value = {};

    if (!formData.value.costumer_id) {
        errors.value.costumer_id = 'Cliente é obrigatório';
    }

    if (!formData.value.quotation_date) {
        errors.value.quotation_date = 'Data da cotação é obrigatória';
    }

    if (!formData.value.expiry_date) {
        errors.value.expiry_date = 'Data de validade é obrigatória';
    }

    if (formData.value.items.length === 0) {
        errors.value.items = 'Pelo menos um item é obrigatório';
    }

    // Validar items
    formData.value.items.forEach((item, index) => {
        if (!item.description) {
            errors.value[`item_${index}_description`] = 'Descrição é obrigatória';
        }
        if (!item.quantity || item.quantity <= 0) {
            errors.value[`item_${index}_quantity`] = 'Quantidade deve ser maior que zero';
        }
        if (!item.unit_price || item.unit_price <= 0) {
            errors.value[`item_${index}_unit_price`] = 'Preço unitário deve ser maior que zero';
        }
    });

    return Object.keys(errors.value).length === 0;
};

const saveInvoice = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'error',
            summary: 'Erro de Validação',
            detail: 'Por favor, corrija os erros no formulário',
            life: 3000
        });
        return;
    }

    try {
        isSaving.value = true;

        const invoiceData = {
            invoice_date: formData.value.invoice_date.toISOString().split('T')[0],
            due_date: formData.value.due_date.toISOString().split('T')[0],
            status: formData.value.status,
            costumer_id: formData.value.costumer_id,
            notes: formData.value.notes,
            subtotal: subtotal.value,
            discount_amount: discountTotal.value,
            tax_amount: taxTotal.value,
            total: grandTotal.value,
            items: formData.value.items.map((item, index) => ({
                id: item.id || null,
                product_id: item.product_id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount_amount: item.discount || 0,
                line_total: item.total,
                order_index: index
            }))
        };

        await InvoiceService.updateInvoice(route.params.id, invoiceData);

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Fatura atualizada com sucesso',
            life: 3000
        });

        router.push(`/sales/quotations/${route.params.id}`);

    } catch (error) {
        console.error('Erro ao salvar cotação:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao salvar cotação. Tente novamente.',
            life: 3000
        });
    } finally {
        isSaving.value = false;
    }
};

const cancelEdit = () => {
    if (hasChanges.value) {
        confirm.require({
            message: 'Existem alterações não salvas. Deseja realmente cancelar?',
            header: 'Confirmar Cancelamento',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            accept: () => {
                router.push(`/sales/invoices/${route.params.id}`);
            }
        });
    } else {
        router.push(`/sales/quotations/${route.params.id}`);
    }
};

// Watch para recalcular totals quando items mudarem
watch(() => formData.value.items, () => {
    formData.value.items.forEach((item, index) => {
        calculateItemTotal(index);
    });
}, { deep: true });

onMounted(async () => {
    await Promise.all([
        loadInvoice(),
        loadProducts()
    ]);
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <!-- Loading State -->
            <div v-if="isLoading" class="card">
                <div class="text-center p-6">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                    <p class="mt-3">Carregando cotação...</p>
                </div>
            </div>

            <!-- Edit Form -->
            <div v-else class="card">
                <!-- Header -->
                <div class="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3><i class="pi pi-pencil mr-2"></i>Editar Cotação</h3>
                        <p class="text-600 m-0">{{ formData.quotation_number }}</p>
                    </div>

                    <div class="flex gap-2">
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            class="p-button-outlined"
                            @click="cancelEdit"
                        />
                        <Button 
                            label="Salvar Alterações" 
                            icon="pi pi-save" 
                            :loading="isSaving"
                            @click="saveInvoice"
                            :disabled="!canEdit"
                        />
                    </div>
                </div>

                <!-- Alert se não pode editar -->
                <Message v-if="!canEdit" severity="warn" class="mb-4">
                    <template #default>
                        <i class="pi pi-exclamation-triangle mr-2"></i>
                        Esta cotação não pode ser editada pois não está em estado de rascunho.
                    </template>
                </Message>

                <!-- Form Content -->
                <div v-if="canEdit">
                    <!-- Basic Information -->
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="quotation_number">Número da Cotação <span class="text-red-500">*</span></label>
                                <InputText 
                                    id="quotation_number" 
                                    v-model="formData.quotation_number" 
                                    :class="{ 'p-invalid': errors.quotation_number }"
                                    readonly
                                />
                                <small v-if="errors.quotation_number" class="p-error">{{ errors.quotation_number }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="status">Status</label>
                                <Dropdown 
                                    id="status"
                                    v-model="formData.status" 
                                    :options="statusOptions" 
                                    optionLabel="label" 
                                    optionValue="value" 
                                    placeholder="Selecione o status" 
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="quotation_date">Data da Cotação <span class="text-red-500">*</span></label>
                                <Calendar 
                                    id="quotation_date" 
                                    v-model="formData.quotation_date" 
                                    dateFormat="dd/mm/yy" 
                                    :showIcon="true" 
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.quotation_date }"
                                />
                                <small v-if="errors.quotation_date" class="p-error">{{ errors.quotation_date }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="expiry_date">Data de Validade <span class="text-red-500">*</span></label>
                                <Calendar 
                                    id="expiry_date" 
                                    v-model="formData.expiry_date" 
                                    dateFormat="dd/mm/yy" 
                                    :showIcon="true" 
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.expiry_date }"
                                />
                                <small v-if="errors.expiry_date" class="p-error">{{ errors.expiry_date }}</small>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label for="customer">Cliente <span class="text-red-500">*</span></label>
                                <Dropdown 
                                    id="customer"
                                    v-model="formData.costumer_id" 
                                    :options="customers" 
                                    optionLabel="name" 
                                    optionValue="id" 
                                    placeholder="Selecione um cliente" 
                                    :loading="loadingCustomers" 
                                    filter 
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.costumer_id }"
                                    @change="onCustomerChange"
                                />
                                <small v-if="errors.costumer_id" class="p-error">{{ errors.costumer_id }}</small>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Info -->
                    <div v-if="selectedCustomer" class="card mb-4">
                        <h5>Informações do Cliente</h5>
                        <div class="grid">
                            <div class="col-12 md:col-6">
                                <p><strong>Nome:</strong> {{ selectedCustomer.name }}</p>
                                <p v-if="selectedCustomer.email"><strong>Email:</strong> {{ selectedCustomer.email }}</p>
                            </div>
                            <div class="col-12 md:col-6">
                                <p v-if="selectedCustomer.phone"><strong>Telefone:</strong> {{ selectedCustomer.phone }}</p>
                                <p v-if="selectedCustomer.address"><strong>Endereço:</strong> {{ selectedCustomer.address }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Items -->
                    <div class="card mb-4">
                        <div class="flex justify-content-between align-items-center mb-3">
                            <h5>Items da Cotação</h5>
                            <Button 
                                label="Adicionar Item" 
                                icon="pi pi-plus" 
                                class="p-button-sm"
                                @click="addItem"
                            />
                        </div>

                        <div v-for="(item, index) in formData.items" :key="index" class="p-3 border-1 surface-border border-round mb-3">
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label>Produto</label>
                                        <Dropdown 
                                            v-model="item.product_id"
                                            :options="products" 
                                            optionLabel="name" 
                                            optionValue="id" 
                                            placeholder="Selecione um produto" 
                                            :loading="loadingProducts"
                                            filter 
                                            class="w-full"
                                            @change="onProductSelect(item.product_id, index)"
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-8">
                                    <div class="field">
                                        <label>Descrição <span class="text-red-500">*</span></label>
                                        <InputText 
                                            v-model="item.description" 
                                            placeholder="Descrição do item"
                                            class="w-full"
                                            :class="{ 'p-invalid': errors[`item_${index}_description`] }"
                                        />
                                        <small v-if="errors[`item_${index}_description`]" class="p-error">
                                            {{ errors[`item_${index}_description`] }}
                                        </small>
                                    </div>
                                </div>

                                <div class="col-12 md:col-2">
                                    <div class="field">
                                        <label>Quantidade <span class="text-red-500">*</span></label>
                                        <InputNumber 
                                            v-model="item.quantity" 
                                            :min="1" 
                                            class="w-full"
                                            :class="{ 'p-invalid': errors[`item_${index}_quantity`] }"
                                            @input="calculateItemTotal(index)"
                                        />
                                        <small v-if="errors[`item_${index}_quantity`]" class="p-error">
                                            {{ errors[`item_${index}_quantity`] }}
                                        </small>
                                    </div>
                                </div>

                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label>Preço Unitário <span class="text-red-500">*</span></label>
                                        <InputNumber 
                                            v-model="item.unit_price" 
                                            mode="currency" 
                                            currency="MZN" 
                                            locale="pt-MZ" 
                                            :min="0" 
                                            class="w-full"
                                            :class="{ 'p-invalid': errors[`item_${index}_unit_price`] }"
                                            @input="calculateItemTotal(index)"
                                        />
                                        <small v-if="errors[`item_${index}_unit_price`]" class="p-error">
                                            {{ errors[`item_${index}_unit_price`] }}
                                        </small>
                                    </div>
                                </div>

                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label>Desconto</label>
                                        <InputNumber 
                                            v-model="item.discount" 
                                            mode="currency" 
                                            currency="MZN" 
                                            locale="pt-MZ" 
                                            :min="0" 
                                            class="w-full"
                                            @input="calculateItemTotal(index)"
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label>Total</label>
                                        <InputText 
                                            :value="formatCurrency(item.total)" 
                                            readonly 
                                            class="w-full font-bold"
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-1">
                                    <div class="field">
                                        <label>&nbsp;</label>
                                        <Button 
                                            icon="pi pi-trash" 
                                            class="p-button-danger p-button-outlined w-full"
                                            @click="removeItem(index)"
                                            :disabled="formData.items.length === 1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <small v-if="errors.items" class="p-error">{{ errors.items }}</small>
                    </div>

                    <!-- Totals -->
                    <div class="card mb-4">
                        <h5>Resumo Financeiro</h5>
                        <div class="grid">
                            <div class="col-12 md:col-8"></div>
                            <div class="col-12 md:col-4">
                                <div class="flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span class="font-semibold">{{ formatCurrency(subtotal) }}</span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>Desconto:</span>
                                    <span class="text-orange-500">-{{ formatCurrency(discountTotal) }}</span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>IVA (17%):</span>
                                    <span>{{ formatCurrency(taxTotal) }}</span>
                                </div>
                                <Divider />
                                <div class="flex justify-content-between">
                                    <span class="text-xl font-bold">Total:</span>
                                    <span class="text-xl font-bold text-primary">{{ formatCurrency(grandTotal) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="card">
                        <h5>Observações</h5>
                        <Textarea 
                            v-model="formData.notes" 
                            rows="4" 
                            class="w-full" 
                            placeholder="Observações adicionais..."
                        />
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

.card {
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    background: var(--surface-card);
    padding: 1.5rem;
}

.card h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-color);
    font-weight: 600;
}
</style>