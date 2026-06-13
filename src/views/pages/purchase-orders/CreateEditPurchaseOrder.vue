<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import PurchaseOrderService from '@/service/PurchaseOrderService';
import SupplierService from '@/service/SupplierService';
import ProductService from '@/service/ProductService';

export default {
    name: 'CreateEditPurchaseOrder',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const toast = useToast();

        // Estado
        const loading = ref(false);
        const saving = ref(false);
        const loadingSuppliers = ref(false);
        const loadingProducts = ref(false);

        // Dados
        const suppliers = ref([]);
        const products = ref([]);

        // Estado do formulário
        const purchaseOrder = reactive({
            supplier_id: null,
            order_number: '',
            status: 'draft',
            order_date: new Date(),
            expected_delivery_date: null,
            delivery_terms: '',
            delivery_address: '',
            tax_rate: 16.0,
            discount_rate: 0,
            discount_amount: 0,
            shipping_cost: 0,
            notes: '',
            terms_and_conditions: '',
            reference_number: '',
            items: []
        });

        const errors = reactive({});

        // Computed
        const isEditing = computed(() => !!route.params.id);
        const statusOptions = computed(() => PurchaseOrderService.getPurchaseOrderStatuses());
        const deliveryTermsOptions = computed(() => PurchaseOrderService.getDeliveryTerms());

        // Cálculos automáticos
        const totals = computed(() => {
            return PurchaseOrderService.calculateOrderTotals(
                purchaseOrder.items,
                purchaseOrder.tax_rate || 0,
                purchaseOrder.discount_rate || 0,
                purchaseOrder.discount_amount || 0,
                purchaseOrder.shipping_cost || 0
            );
        });

        // Watchers para cálculos automáticos
        watch([
            () => purchaseOrder.items,
            () => purchaseOrder.tax_rate,
            () => purchaseOrder.discount_rate,
            () => purchaseOrder.discount_amount,
            () => purchaseOrder.shipping_cost
        ], () => {
            // Os cálculos são feitos automaticamente pelo computed 'totals'
        }, { deep: true });

        // Métodos
        const loadPurchaseOrder = async () => {
            if (!isEditing.value) return;

            loading.value = true;
            try {
                const response = await PurchaseOrderService.getPurchaseOrderById(route.params.id);
                Object.assign(purchaseOrder, {
                    ...response,
                    order_date: response.order_date ? new Date(response.order_date) : new Date(),
                    expected_delivery_date: response.expected_delivery_date ? new Date(response.expected_delivery_date) : null,
                    items: response.items || []
                });
            } catch (error) {
                console.error('Erro ao carregar ordem de compra:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar ordem de compra',
                    life: 5000
                });
                goBack();
            } finally {
                loading.value = false;
            }
        };

        const loadSuppliers = async () => {
            loadingSuppliers.value = true;
            try {
                const response = await SupplierService.getAllSuppliers({ limit: 1000 });
                suppliers.value = response.items || [];
            } catch (error) {
                console.error('Erro ao carregar fornecedores:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar fornecedores',
                    life: 3000
                });
            } finally {
                loadingSuppliers.value = false;
            }
        };

        const loadProducts = async () => {
            loadingProducts.value = true;
            try {
                const response = await ProductService.getAllProducts({ limit: 1000 });
                products.value = response.items || [];
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar produtos',
                    life: 3000
                });
            } finally {
                loadingProducts.value = false;
            }
        };

        // Gerenciamento de itens
        const addItem = () => {
            purchaseOrder.items.push({
                product_id: null,
                description: '',
                quantity: 1,
                unit_price: 0,
                discount_rate: 0,
                discount_amount: 0
            });
        };

        const removeItem = (index) => {
            purchaseOrder.items.splice(index, 1);
        };

        const onProductChange = (item, productId) => {
            const product = products.value.find(p => p.id === productId);
            if (product) {
                item.description = product.name;
                item.unit_price = parseFloat(product.sale_price || product.price || 0);
            }
        };

        const calculateItemTotal = (item) => {
            return PurchaseOrderService.calculateItemTotal(
                item.quantity || 0,
                item.unit_price || 0,
                item.discount_rate || 0,
                item.discount_amount || 0
            );
        };

        // Validação
        const validateForm = () => {
            Object.keys(errors).forEach(key => delete errors[key]);

            if (!purchaseOrder.supplier_id) {
                errors.supplier_id = 'Fornecedor é obrigatório';
            }

            if (!purchaseOrder.order_date) {
                errors.order_date = 'Data da ordem é obrigatória';
            }

            if (!purchaseOrder.expected_delivery_date) {
                errors.expected_delivery_date = 'Data de entrega prevista é obrigatória';
            }

            if (!purchaseOrder.items.length) {
                errors.items = 'Pelo menos um item é obrigatório';
            } else {
                // Validar itens
                purchaseOrder.items.forEach((item, index) => {
                    if (!item.description) {
                        errors[`item_${index}_description`] = 'Descrição é obrigatória';
                    }
                    if (!item.quantity || item.quantity <= 0) {
                        errors[`item_${index}_quantity`] = 'Quantidade deve ser maior que zero';
                    }
                    if (item.unit_price < 0) {
                        errors[`item_${index}_unit_price`] = 'Preço unitário deve ser maior ou igual a zero';
                    }
                });
            }

            return Object.keys(errors).length === 0;
        };

        const formatDateForAPI = (date) => {
            if (!date) return null;
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const savePurchaseOrder = async () => {
            if (!validateForm()) {
                toast.add({
                    severity: 'warn',
                    summary: 'Validação',
                    detail: 'Por favor, corrija os erros no formulário',
                    life: 3000
                });
                return;
            }

            saving.value = true;
            try {
                const orderData = { ...purchaseOrder };

                // Formatar datas
                if (orderData.order_date) {
                    orderData.order_date = formatDateForAPI(orderData.order_date);
                }
                if (orderData.expected_delivery_date) {
                    orderData.expected_delivery_date = formatDateForAPI(orderData.expected_delivery_date);
                }

                // Garantir que valores numéricos sejam números
                orderData.tax_rate = parseFloat(orderData.tax_rate) || 0;
                orderData.discount_rate = parseFloat(orderData.discount_rate) || 0;
                orderData.discount_amount = parseFloat(orderData.discount_amount) || 0;
                orderData.shipping_cost = parseFloat(orderData.shipping_cost) || 0;

                // Formatar itens
                orderData.items = orderData.items.map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity) || 1,
                    unit_price: parseFloat(item.unit_price) || 0,
                    discount_rate: parseFloat(item.discount_rate) || 0,
                    discount_amount: parseFloat(item.discount_amount) || 0
                }));

                let response;
                if (isEditing.value) {
                    response = await PurchaseOrderService.updatePurchaseOrder(route.params.id, orderData);
                    toast.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Ordem de compra atualizada com sucesso',
                        life: 3000
                    });
                } else {
                    response = await PurchaseOrderService.createPurchaseOrder(orderData);
                    toast.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Ordem de compra criada com sucesso',
                        life: 3000
                    });
                }

                // Redirecionar para visualização
                router.push({ name: 'purchase-orders.show', params: { id: response.id } });
            } catch (error) {
                console.error('Erro ao salvar ordem de compra:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao salvar ordem de compra',
                    life: 5000
                });
            } finally {
                saving.value = false;
            }
        };

        const goBack = () => {
            router.push({ name: 'purchase-orders.index' });
        };

        // Lifecycle
        onMounted(async () => {
            await Promise.all([
                loadSuppliers(),
                loadProducts()
            ]);

            if (isEditing.value) {
                await loadPurchaseOrder();
            } else {
                // Adicionar primeiro item para nova ordem
                addItem();
            }
        });

        return {
            // Estado
            loading,
            saving,
            loadingSuppliers,
            loadingProducts,

            // Dados
            purchaseOrder,
            errors,
            suppliers,
            products,

            // Computed
            isEditing,
            statusOptions,
            deliveryTermsOptions,
            totals,

            // Métodos
            addItem,
            removeItem,
            onProductChange,
            calculateItemTotal,
            savePurchaseOrder,
            goBack
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">
                        {{ isEditing ? 'Editar Ordem de Compra' : 'Nova Ordem de Compra' }}
                    </h5>
                    <Button label="Voltar" icon="pi pi-arrow-left" @click="goBack" class="p-button-text" />
                </div>

                <form @submit.prevent="savePurchaseOrder">
                    <!-- Informações Básicas -->
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="supplier" class="font-medium">Fornecedor *</label>
                                <Dropdown
                                    id="supplier"
                                    v-model="purchaseOrder.supplier_id"
                                    :options="suppliers"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Selecione o fornecedor"
                                    :filter="true"
                                    filterBy="name"
                                    :loading="loadingSuppliers"
                                    :class="{ 'p-invalid': errors.supplier_id }"
                                    class="w-full"
                                />
                                <small v-if="errors.supplier_id" class="p-error">{{ errors.supplier_id }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-3">
                            <div class="field">
                                <label for="order_date" class="font-medium">Data da Ordem *</label>
                                <Calendar
                                    id="order_date"
                                    v-model="purchaseOrder.order_date"
                                    dateFormat="dd/mm/yy"
                                    :showIcon="true"
                                    placeholder="Selecione a data"
                                    :class="{ 'p-invalid': errors.order_date }"
                                    class="w-full"
                                />
                                <small v-if="errors.order_date" class="p-error">{{ errors.order_date }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-3">
                            <div class="field">
                                <label for="expected_delivery_date" class="font-medium">Entrega Prevista *</label>
                                <Calendar
                                    id="expected_delivery_date"
                                    v-model="purchaseOrder.expected_delivery_date"
                                    dateFormat="dd/mm/yy"
                                    :showIcon="true"
                                    placeholder="Selecione a data"
                                    :class="{ 'p-invalid': errors.expected_delivery_date }"
                                    class="w-full"
                                />
                                <small v-if="errors.expected_delivery_date" class="p-error">{{ errors.expected_delivery_date }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="status" class="font-medium">Status</label>
                                <Dropdown
                                    id="status"
                                    v-model="purchaseOrder.status"
                                    :options="statusOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione o status"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="delivery_terms" class="font-medium">Termos de Entrega</label>
                                <Dropdown
                                    id="delivery_terms"
                                    v-model="purchaseOrder.delivery_terms"
                                    :options="deliveryTermsOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione"
                                    class="w-full"
                                    showClear
                                />
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="reference_number" class="font-medium">Número de Referência</label>
                                <InputText
                                    id="reference_number"
                                    v-model="purchaseOrder.reference_number"
                                    placeholder="Ex: REF-001"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label for="delivery_address" class="font-medium">Endereço de Entrega</label>
                                <Textarea
                                    id="delivery_address"
                                    v-model="purchaseOrder.delivery_address"
                                    rows="2"
                                    placeholder="Endereço completo para entrega..."
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Itens -->
                    <div class="mb-4">
                        <div class="flex align-items-center justify-content-between mb-3">
                            <h6 class="m-0">Itens da Ordem</h6>
                            <Button
                                label="Adicionar Item"
                                icon="pi pi-plus"
                                @click="addItem"
                                class="p-button-outlined p-button-sm"
                            />
                        </div>

                        <div v-if="errors.items" class="mb-3">
                            <small class="p-error">{{ errors.items }}</small>
                        </div>

                        <div class="border-1 border-300 border-round p-3">
                            <div v-for="(item, index) in purchaseOrder.items" :key="index" class="grid align-items-end mb-3">
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium">Produto</label>
                                        <Dropdown
                                            v-model="item.product_id"
                                            :options="products"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Selecione o produto"
                                            :filter="true"
                                            filterBy="name"
                                            :loading="loadingProducts"
                                            @change="onProductChange(item, $event.value)"
                                            class="w-full"
                                            showClear
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-2">
                                    <div class="field">
                                        <label class="font-medium">Descrição *</label>
                                        <InputText
                                            v-model="item.description"
                                            placeholder="Descrição do item"
                                            :class="{ 'p-invalid': errors[`item_${index}_description`] }"
                                            class="w-full"
                                        />
                                        <small v-if="errors[`item_${index}_description`]" class="p-error">{{ errors[`item_${index}_description`] }}</small>
                                    </div>
                                </div>

                                <div class="col-12 md:col-1">
                                    <div class="field">
                                        <label class="font-medium">Qtd *</label>
                                        <InputNumber
                                            v-model="item.quantity"
                                            :min="0.001"
                                            :maxFractionDigits="3"
                                            :class="{ 'p-invalid': errors[`item_${index}_quantity`] }"
                                            class="w-full"
                                        />
                                        <small v-if="errors[`item_${index}_quantity`]" class="p-error">{{ errors[`item_${index}_quantity`] }}</small>
                                    </div>
                                </div>

                                <div class="col-12 md:col-2">
                                    <div class="field">
                                        <label class="font-medium">Preço Unit.</label>
                                        <InputNumber
                                            v-model="item.unit_price"
                                            :min="0"
                                            :maxFractionDigits="2"
                                            mode="currency"
                                            currency="MZN"
                                            locale="pt-MZ"
                                            :class="{ 'p-invalid': errors[`item_${index}_unit_price`] }"
                                            class="w-full"
                                        />
                                        <small v-if="errors[`item_${index}_unit_price`]" class="p-error">{{ errors[`item_${index}_unit_price`] }}</small>
                                    </div>
                                </div>

                                <div class="col-12 md:col-1">
                                    <div class="field">
                                        <label class="font-medium">Desc. %</label>
                                        <InputNumber
                                            v-model="item.discount_rate"
                                            :min="0"
                                            :max="100"
                                            :maxFractionDigits="2"
                                            suffix="%"
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-2">
                                    <div class="field">
                                        <label class="font-medium">Total</label>
                                        <InputText
                                            :value="calculateItemTotal(item).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })"
                                            readonly
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-1">
                                    <div class="field">
                                        <Button
                                            icon="pi pi-trash"
                                            @click="removeItem(index)"
                                            class="p-button-danger p-button-text"
                                            :disabled="purchaseOrder.items.length === 1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cálculos e Totais -->
                    <div class="grid">
                        <div class="col-12 md:col-8">
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label for="tax_rate" class="font-medium">Taxa de Imposto (%)</label>
                                        <InputNumber
                                            id="tax_rate"
                                            v-model="purchaseOrder.tax_rate"
                                            :min="0"
                                            :max="100"
                                            :maxFractionDigits="2"
                                            suffix="%"
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label for="discount_rate" class="font-medium">Desconto (%)</label>
                                        <InputNumber
                                            id="discount_rate"
                                            v-model="purchaseOrder.discount_rate"
                                            :min="0"
                                            :max="100"
                                            :maxFractionDigits="2"
                                            suffix="%"
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label for="shipping_cost" class="font-medium">Custo de Envio</label>
                                        <InputNumber
                                            id="shipping_cost"
                                            v-model="purchaseOrder.shipping_cost"
                                            :min="0"
                                            :maxFractionDigits="2"
                                            mode="currency"
                                            currency="MZN"
                                            locale="pt-MZ"
                                            class="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                            <div class="card bg-gray-50">
                                <h6 class="m-0 mb-3">Resumo dos Totais</h6>
                                <div class="flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span class="font-medium">{{ totals.subtotal.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) }}</span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>Desconto:</span>
                                    <span class="font-medium">{{ totals.discountAmount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) }}</span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>Imposto:</span>
                                    <span class="font-medium">{{ totals.taxAmount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) }}</span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>Envio:</span>
                                    <span class="font-medium">{{ (purchaseOrder.shipping_cost || 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) }}</span>
                                </div>
                                <div class="border-top-1 border-300 pt-2">
                                    <div class="flex justify-content-between">
                                        <span class="font-bold text-lg">Total:</span>
                                        <span class="font-bold text-lg text-primary">{{ totals.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Observações -->
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="notes" class="font-medium">Observações</label>
                                <Textarea
                                    id="notes"
                                    v-model="purchaseOrder.notes"
                                    rows="3"
                                    placeholder="Observações sobre a ordem..."
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="terms_and_conditions" class="font-medium">Termos e Condições</label>
                                <Textarea
                                    id="terms_and_conditions"
                                    v-model="purchaseOrder.terms_and_conditions"
                                    rows="3"
                                    placeholder="Termos e condições..."
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="flex justify-content-end gap-2 mt-4">
                        <Button label="Cancelar" icon="pi pi-times" @click="goBack" class="p-button-text" />
                        <Button
                            :label="isEditing ? 'Atualizar' : 'Criar'"
                            :icon="isEditing ? 'pi pi-check' : 'pi pi-plus'"
                            type="submit"
                            :loading="saving"
                            class="p-button-primary"
                        />
                    </div>
                </form>
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

.p-error {
    color: var(--red-500);
    font-size: 0.875rem;
}

.p-invalid {
    border-color: var(--red-500);
}
</style>