<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">
                        {{ isEditing ? 'Editar Pagamento' : 'Novo Pagamento' }}
                        <span v-if="paymentType" class="ml-2 text-sm">
                            ({{ getPaymentTypeLabel(paymentType) }})
                        </span>
                    </h5>
                    <Button 
                        label="Voltar" 
                        icon="pi pi-arrow-left" 
                        @click="goBack"
                        class="p-button-text"
                    />
                </div>

                <form @submit.prevent="savePayment">
                    <div class="grid">
                        <!-- Tipo de Pagamento -->
                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="type" class="font-medium">Tipo de Pagamento *</label>
                                <Dropdown
                                    id="type"
                                    v-model="payment.type"
                                    :options="paymentTypes"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione o tipo"
                                    :disabled="isEditing || !!paymentType"
                                    :class="{ 'p-invalid': errors.type }"
                                    class="w-full"
                                    @change="onTypeChange"
                                />
                                <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
                            </div>
                        </div>

                        <!-- Cliente (apenas para pagamentos recebidos) -->
                        <div v-if="payment.type === 'received'" class="col-12 md:col-4">
                            <div class="field">
                                <label for="customer" class="font-medium">Cliente *</label>
                                <Dropdown
                                    id="customer"
                                    v-model="payment.costumer_id"
                                    :options="customers"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Selecione o cliente"
                                    :filter="true"
                                    filterBy="name"
                                    :loading="loadingCustomers"
                                    :class="{ 'p-invalid': errors.costumer_id }"
                                    class="w-full"
                                    @change="onCustomerChange"
                                />
                                <small v-if="errors.costumer_id" class="p-error">{{ errors.costumer_id }}</small>
                            </div>
                        </div>

                        <!-- Fatura (para pagamentos recebidos) -->
                        <div v-if="payment.type === 'received' && payment.costumer_id" class="col-12 md:col-4">
                            <div class="field">
                                <label for="invoice" class="font-medium">Fatura</label>
                                <Dropdown
                                    id="invoice"
                                    v-model="payment.invoice_id"
                                    :options="customerInvoices"
                                    optionLabel="invoice_number"
                                    optionValue="id"
                                    placeholder="Selecione a fatura (opcional)"
                                    :loading="loadingInvoices"
                                    class="w-full"
                                    showClear
                                />
                                <small class="text-xs text-600">Deixe em branco para pagamento avulso</small>
                            </div>
                        </div>

                        <!-- Fornecedor (apenas para pagamentos feitos) -->
                        <div v-if="payment.type === 'made'" class="col-12 md:col-4">
                            <div class="field">
                                <label for="supplier" class="font-medium">Fornecedor *</label>
                                <Dropdown
                                    id="supplier"
                                    v-model="payment.supplier_id"
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

                        <!-- Número do Pagamento -->
                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="payment_number" class="font-medium">Número do Pagamento</label>
                                <InputText
                                    id="payment_number"
                                    v-model="payment.payment_number"
                                    placeholder="Será gerado automaticamente se vazio"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Valor -->
                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="amount" class="font-medium">Valor *</label>
                                <InputNumber
                                    id="amount"
                                    v-model="payment.amount"
                                    :min="0"
                                    :maxFractionDigits="2"
                                    :minFractionDigits="2"
                                    mode="currency"
                                    currency="MZN"
                                    locale="pt-MZ"
                                    placeholder="0,00"
                                    :class="{ 'p-invalid': errors.amount }"
                                    class="w-full"
                                />
                                <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
                            </div>
                        </div>

                        <!-- Método de Pagamento -->
                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="payment_method" class="font-medium">Método de Pagamento *</label>
                                <Dropdown
                                    id="payment_method"
                                    v-model="payment.payment_method"
                                    :options="paymentMethods"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione o método"
                                    :class="{ 'p-invalid': errors.payment_method }"
                                    class="w-full"
                                />
                                <small v-if="errors.payment_method" class="p-error">{{ errors.payment_method }}</small>
                            </div>
                        </div>

                        <!-- Data do Pagamento -->
                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="payment_date" class="font-medium">Data do Pagamento *</label>
                                <Calendar
                                    id="payment_date"
                                    v-model="payment.payment_date"
                                    dateFormat="dd/mm/yy"
                                    :showIcon="true"
                                    placeholder="Selecione a data"
                                    :class="{ 'p-invalid': errors.payment_date }"
                                    class="w-full"
                                />
                                <small v-if="errors.payment_date" class="p-error">{{ errors.payment_date }}</small>
                            </div>
                        </div>

                        <!-- Status -->
                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label for="status" class="font-medium">Status *</label>
                                <Dropdown
                                    id="status"
                                    v-model="payment.status"
                                    :options="paymentStatuses"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione o status"
                                    :class="{ 'p-invalid': errors.status }"
                                    class="w-full"
                                />
                                <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
                            </div>
                        </div>

                        <!-- Referência -->
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="reference" class="font-medium">Referência</label>
                                <InputText
                                    id="reference"
                                    v-model="payment.reference"
                                    placeholder="Ex: Número do cheque, referência bancária, etc."
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Data de Vencimento -->
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="due_date" class="font-medium">Data de Vencimento</label>
                                <Calendar
                                    id="due_date"
                                    v-model="payment.due_date"
                                    dateFormat="dd/mm/yy"
                                    :showIcon="true"
                                    placeholder="Selecione a data (opcional)"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Descrição -->
                        <div class="col-12">
                            <div class="field">
                                <label for="description" class="font-medium">Descrição</label>
                                <Textarea
                                    id="description"
                                    v-model="payment.description"
                                    rows="3"
                                    placeholder="Observações sobre o pagamento..."
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="flex justify-content-end gap-2 mt-4">
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            @click="goBack" 
                            class="p-button-text"
                        />
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

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import PaymentService from '@/service/PaymentService';
import CustomerService from '@/service/CustomerService';
import InvoiceService from '@/service/InvoiceService';

export default {
    name: 'CreateEditPayment',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const toast = useToast();

        // Estado
        const loading = ref(false);
        const saving = ref(false);
        const loadingCustomers = ref(false);
        const loadingSuppliers = ref(false);
        const loadingInvoices = ref(false);

        // Dados
        const customers = ref([]);
        const suppliers = ref([]);
        const customerInvoices = ref([]);

        // Estado do formulário
        const payment = reactive({
            type: '',
            costumer_id: null,
            supplier_id: null,
            invoice_id: null,
            purchase_invoice_id: null,
            payment_number: '',
            amount: null,
            payment_method: '',
            payment_date: new Date(),
            due_date: null,
            status: 'pending',
            reference: '',
            description: ''
        });

        const errors = reactive({});

        // Computed
        const isEditing = computed(() => !!route.params.id);
        const paymentType = computed(() => route.params.type || payment.type);
        const paymentTypes = computed(() => PaymentService.getPaymentTypes());
        const paymentStatuses = computed(() => PaymentService.getPaymentStatuses());
        const paymentMethods = computed(() => PaymentService.getPaymentMethods());

        // Watchers
        watch(() => payment.costumer_id, (newCustomerId) => {
            if (newCustomerId && payment.type === 'received') {
                loadCustomerInvoices(newCustomerId);
            } else {
                customerInvoices.value = [];
                payment.invoice_id = null;
            }
        });

        // Métodos
        const loadPayment = async () => {
            if (!isEditing.value) return;

            loading.value = true;
            try {
                const response = await PaymentService.getPaymentById(route.params.id);
                Object.assign(payment, {
                    ...response,
                    payment_date: response.payment_date ? new Date(response.payment_date) : new Date(),
                    due_date: response.due_date ? new Date(response.due_date) : null
                });

                // Carregar dados relacionados baseado no tipo
                if (payment.type === 'received') {
                    await loadCustomers();
                    if (payment.costumer_id) {
                        await loadCustomerInvoices(payment.costumer_id);
                    }
                } else if (payment.type === 'made') {
                    await loadSuppliers();
                }
            } catch (error) {
                console.error('Erro ao carregar pagamento:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar pagamento',
                    life: 5000
                });
                goBack();
            } finally {
                loading.value = false;
            }
        };

        const loadCustomers = async () => {
            loadingCustomers.value = true;
            try {
                const response = await CustomerService.getCustomers({ limit: 1000 });
                customers.value = response.data || [];
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar clientes',
                    life: 3000
                });
            } finally {
                loadingCustomers.value = false;
            }
        };

        const loadSuppliers = async () => {
            loadingSuppliers.value = true;
            try {
                // Implementar quando SupplierService estiver disponível
                suppliers.value = [];
                console.log('SupplierService not implemented yet');
            } catch (error) {
                console.error('Erro ao carregar fornecedores:', error);
            } finally {
                loadingSuppliers.value = false;
            }
        };

        const loadCustomerInvoices = async (customerId) => {
            if (!customerId) return;

            loadingInvoices.value = true;
            try {
                const response = await InvoiceService.getInvoices({ 
                    costumer_id: customerId,
                    status: 'draft,sent,pending',
                    limit: 100
                });
                customerInvoices.value = response.data || [];
            } catch (error) {
                console.error('Erro ao carregar faturas do cliente:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar faturas do cliente',
                    life: 3000
                });
            } finally {
                loadingInvoices.value = false;
            }
        };

        const onTypeChange = () => {
            // Limpar campos relacionados ao tipo anterior
            payment.costumer_id = null;
            payment.supplier_id = null;
            payment.invoice_id = null;
            payment.purchase_invoice_id = null;
            customerInvoices.value = [];

            // Carregar dados para o novo tipo
            if (payment.type === 'received') {
                loadCustomers();
            } else if (payment.type === 'made') {
                loadSuppliers();
            }
        };

        const onCustomerChange = () => {
            payment.invoice_id = null;
            if (payment.costumer_id) {
                loadCustomerInvoices(payment.costumer_id);
            }
        };

        const validateForm = () => {
            Object.keys(errors).forEach(key => delete errors[key]);

            if (!payment.type) {
                errors.type = 'Tipo de pagamento é obrigatório';
            }

            if (payment.type === 'received' && !payment.costumer_id) {
                errors.costumer_id = 'Cliente é obrigatório para pagamentos recebidos';
            }

            if (payment.type === 'made' && !payment.supplier_id) {
                errors.supplier_id = 'Fornecedor é obrigatório para pagamentos feitos';
            }

            if (!payment.amount || payment.amount <= 0) {
                errors.amount = 'Valor deve ser maior que zero';
            }

            if (!payment.payment_method) {
                errors.payment_method = 'Método de pagamento é obrigatório';
            }

            if (!payment.payment_date) {
                errors.payment_date = 'Data do pagamento é obrigatória';
            }

            if (!payment.status) {
                errors.status = 'Status é obrigatório';
            }

            return Object.keys(errors).length === 0;
        };

        const savePayment = async () => {
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
                const paymentData = { ...payment };
                
                // Formatar datas para ISO string
                if (paymentData.payment_date) {
                    paymentData.payment_date = paymentData.payment_date.toISOString();
                }
                if (paymentData.due_date) {
                    paymentData.due_date = paymentData.due_date.toISOString();
                }

                let response;
                if (isEditing.value) {
                    response = await PaymentService.updatePayment(route.params.id, paymentData);
                    toast.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Pagamento atualizado com sucesso',
                        life: 3000
                    });
                } else {
                    response = await PaymentService.createPayment(paymentData);
                    toast.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Pagamento criado com sucesso',
                        life: 3000
                    });
                }

                // Redirecionar para visualização do pagamento
                router.push({ name: 'ShowPayment', params: { id: response.id } });
            } catch (error) {
                console.error('Erro ao salvar pagamento:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao salvar pagamento',
                    life: 5000
                });
            } finally {
                saving.value = false;
            }
        };

        const goBack = () => {
            router.push({ name: 'IndexPayments' });
        };

        const getPaymentTypeLabel = (type) => {
            return PaymentService.getPaymentTypeLabel(type);
        };

        // Lifecycle
        onMounted(async () => {
            // Definir tipo inicial se passado via rota
            if (route.params.type) {
                payment.type = route.params.type;
                onTypeChange();
            }

            // Carregar pagamento se for edição
            if (isEditing.value) {
                await loadPayment();
            }
        });

        return {
            // Estado
            loading,
            saving,
            loadingCustomers,
            loadingSuppliers,
            loadingInvoices,
            
            // Dados
            payment,
            errors,
            customers,
            suppliers,
            customerInvoices,
            
            // Computed
            isEditing,
            paymentType,
            paymentTypes,
            paymentStatuses,
            paymentMethods,
            
            // Métodos
            onTypeChange,
            onCustomerChange,
            savePayment,
            goBack,
            getPaymentTypeLabel
        };
    }
};
</script>

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