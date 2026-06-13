<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import moment from 'moment';
import InvoiceService from '@/service/InvoiceService';
import PaymentService from '@/service/PaymentService';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

// Estado da fatura
const invoice = ref(null);
const isLoading = ref(true);
const isUpdatingStatus = ref(false);

// Estado dos pagamentos
const payments = ref([]);
const loadingPayments = ref(false);

// Opções de status
const statusOptions = [
    { label: 'Rascunho', value: 'DRAFT', severity: 'info', color: '#6366f1' },
    { label: 'Enviado', value: 'SENT', severity: 'warning', color: '#f59e0b' },
    { label: 'Parcialmente Pago', value: 'PARTIALLY_PAID', severity: 'warning', color: '#f59e0b' },
    { label: 'Pago', value: 'PAID', severity: 'success', color: '#10b981' },
    { label: 'Vencido', value: 'OVERDUE', severity: 'danger', color: '#ef4444' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'secondary', color: '#6b7280' }
];

// Computed properties
const canEdit = computed(() => {
    return invoice.value?.status?.toUpperCase() === 'DRAFT';
});

const canDelete = computed(() => {
    return invoice.value?.status?.toUpperCase() === 'DRAFT';
});

const canCancel = computed(() => {
    const status = invoice.value?.status?.toUpperCase();
    return status === 'SENT' || status === 'OVERDUE';
});

const isOverdue = computed(() => {
    if (!invoice.value?.due_date) return false;
    return new Date(invoice.value.due_date) < new Date() && 
           invoice.value?.status?.toUpperCase() !== 'PAID' &&
           invoice.value?.status?.toUpperCase() !== 'CANCELLED';
});

const statusInfo = computed(() => {
    if (!invoice.value?.status) return statusOptions[0];
    return statusOptions.find((opt) => opt.value === invoice.value.status.toUpperCase()) || statusOptions[0];
});

const remainingAmount = computed(() => {
    if (!invoice.value) return 0;
    return invoice.value.total - (invoice.value.paid_amount || 0);
});

const paymentPercentage = computed(() => {
    if (!invoice.value || !invoice.value.total) return 0;
    return Math.round((invoice.value.paid_amount || 0) / invoice.value.total * 100);
});

// Métodos
// Carregar dados da fatura
const loadInvoice = async () => {
    const invoiceId = route.params.id;
    if (!invoiceId) return;

    try {
        invoice.value = await InvoiceService.getInvoiceById(invoiceId);
        await loadInvoicePayments();
    } catch (error) {
        console.error('Erro ao carregar fatura:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar fatura',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Formatação
const formatCurrency = (value) => {
    if (!value && value !== 0) return 'MT 0,00';
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2
    }).format(value).replace('MZN', 'MT');
};

const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY') : '-';
};

// Formatação específica para pagamentos
const getPaymentStatusLabel = (status) => {
    return PaymentService.getPaymentStatusLabel(status);
};

const getPaymentMethodLabel = (method) => {
    return PaymentService.getPaymentMethodLabel(method);
};

const getStatusSeverity = (status) => {
    return PaymentService.getStatusSeverity(status);
};

const formatDateTime = (date) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
};

const editInvoice = () => {
    router.push(`/sales/invoices/${invoice.value.id}/edit`);
};

const duplicateInvoice = async () => {
    try {
        const response = await InvoiceService.duplicateInvoice(invoice.value.id);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Fatura duplicada com sucesso', 
            life: 3000 
        });
        router.push(`/sales/invoices/${response.id}/edit`);
    } catch (error) {
        console.error('Erro ao duplicar fatura:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao duplicar fatura', 
            life: 3000 
        });
    }
};

const updateStatus = async (newStatus) => {
    try {
        isUpdatingStatus.value = true;
        await InvoiceService.updateInvoiceStatus(invoice.value.id, newStatus);
        invoice.value.status = newStatus;
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Status atualizado com sucesso', 
            life: 3000 
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao atualizar status', 
            life: 3000 
        });
    } finally {
        isUpdatingStatus.value = false;
    }
};

const deleteInvoice = () => {
    confirm.require({
        message: `Tem certeza que deseja excluir a fatura ${invoice.value.invoice_number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await InvoiceService.deleteInvoice(invoice.value.id);
                toast.add({ 
                    severity: 'success', 
                    summary: 'Sucesso', 
                    detail: 'Fatura excluída com sucesso', 
                    life: 3000 
                });
                router.push('/sales/invoices');
            } catch (error) {
                console.error('Erro ao excluir fatura:', error);
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Erro ao excluir fatura', 
                    life: 3000 
                });
            }
        }
    });
};

const generatePdf = async () => {
    try {
        const pdfBlob = await InvoiceService.generatePdf(invoice.value.id);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Fatura-${invoice.value.invoice_number}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'PDF gerado com sucesso', 
            life: 3000 
        });
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao gerar PDF', 
            life: 3000 
        });
    }
};

const viewPdf = () => {
    router.push(`/sales/invoices/${invoice.value.id}/pdf`);
};

// Métodos para pagamentos
const loadInvoicePayments = async () => {
    if (!invoice.value?.id) return;
    
    loadingPayments.value = true;
    try {
        const response = await PaymentService.getPaymentsByInvoice(invoice.value.id);
        payments.value = response.data || [];
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar pagamentos da fatura',
            life: 3000
        });
    } finally {
        loadingPayments.value = false;
    }
};

const createPaymentForInvoice = () => {
    router.push({ 
        name: 'CreatePayment', 
        params: { type: 'received' },
        query: { 
            invoice_id: invoice.value.id,
            customer_id: invoice.value.costumer?.id,
            amount: remainingAmount.value
        }
    });
};

const viewPayment = (paymentId) => {
    router.push({ name: 'ShowPayment', params: { id: paymentId } });
};

const openPaymentModal = () => {
    createPaymentForInvoice();
};

const goBack = () => {
    router.push('/sales/invoices');
};

onMounted(() => {
    loadInvoice();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <!-- Loading State -->
            <div v-if="isLoading" class="card">
                <div class="text-center p-6">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                    <p class="mt-3">Carregando fatura...</p>
                </div>
            </div>

            <!-- Content -->
            <div v-else-if="invoice" class="card">
                <!-- Header -->
                <div class="flex justify-content-between align-items-start mb-4">
                    <div>
                        <div class="flex align-items-center gap-3 mb-2">
                            <Button 
                                icon="pi pi-arrow-left" 
                                class="p-button-text p-button-plain"
                                @click="goBack"
                                v-tooltip="'Voltar'"
                            />
                            <h3 class="m-0">Fatura {{ invoice.invoice_number }}</h3>
                            <Tag 
                                :value="statusInfo.label" 
                                :severity="statusInfo.severity"
                                :style="{ backgroundColor: statusInfo.color }"
                            />
                            <Tag 
                                v-if="isOverdue"
                                value="Vencida" 
                                severity="danger"
                            />
                        </div>
                        <div class="text-500">
                            <i class="pi pi-calendar mr-1"></i>
                            Criada em {{ formatDateTime(invoice.created_at) }}
                            <span v-if="invoice.createdByUser" class="ml-2">
                                por <strong>{{ invoice.createdByUser.name }}</strong>
                            </span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <Button 
                            label="Ver PDF" 
                            icon="pi pi-eye" 
                            class="p-button-outlined"
                            @click="viewPdf"
                        />
                        <Button 
                            label="Baixar PDF" 
                            icon="pi pi-download" 
                            class="p-button-outlined"
                            @click="generatePdf"
                        />
                        <Button 
                            label="Duplicar" 
                            icon="pi pi-copy" 
                            class="p-button-outlined"
                            @click="duplicateInvoice"
                        />
                        <Button 
                            v-if="canEdit"
                            label="Editar" 
                            icon="pi pi-pencil" 
                            @click="editInvoice"
                        />
                        <Button 
                            v-if="remainingAmount > 0 && !canEdit"
                            label="Registrar Pagamento" 
                            icon="pi pi-money-bill" 
                            class="p-button-success"
                            @click="openPaymentModal"
                        />
                        <Button 
                            v-if="canDelete"
                            icon="pi pi-trash" 
                            class="p-button-danger p-button-outlined"
                            @click="deleteInvoice"
                            v-tooltip="'Excluir'"
                        />
                    </div>
                </div>

                <!-- Main Content -->
                <div class="grid">
                    <!-- Left Column - Customer and Details -->
                    <div class="col-12 md:col-8">
                        <!-- Customer Info -->
                        <div class="card mb-4">
                            <h5><i class="pi pi-user mr-2"></i>Informações do Cliente</h5>
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field-group">
                                        <label class="font-semibold">Nome:</label>
                                        <span class="ml-2">{{ invoice.costumer.name }}</span>
                                    </div>
                                    <div class="field-group" v-if="invoice.costumer.email">
                                        <label class="font-semibold">Email:</label>
                                        <span class="ml-2">{{ invoice.costumer.email }}</span>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field-group" v-if="invoice.costumer.phone">
                                        <label class="font-semibold">Telefone:</label>
                                        <span class="ml-2">{{ invoice.costumer.phone }}</span>
                                    </div>
                                    <div class="field-group" v-if="invoice.costumer.address">
                                        <label class="font-semibold">Endereço:</label>
                                        <span class="ml-2">{{ invoice.costumer.address }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Items -->
                        <div class="card">
                            <h5><i class="pi pi-list mr-2"></i>Items da Fatura</h5>
                            <DataTable 
                                :value="invoice.items" 
                                class="p-datatable-sm"
                                responsiveLayout="scroll"
                            >
                                <Column header="#" style="width: 60px">
                                    <template #body="{ index }">
                                        {{ index + 1 }}
                                    </template>
                                </Column>
                                <Column field="description" header="Descrição">
                                    <template #body="{ data }">
                                        <div>
                                            <div class="font-semibold">{{ data.description }}</div>
                                            <div v-if="data.product" class="text-sm text-500">
                                                Produto: {{ data.product.name }}
                                            </div>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="quantity" header="Qtd" style="width: 80px" class="text-center">
                                    <template #body="{ data }">
                                        {{ data.quantity }}
                                    </template>
                                </Column>
                                <Column field="unit_price" header="Preço Unit." style="width: 120px" class="text-right">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.unit_price) }}
                                    </template>
                                </Column>
                                <Column field="discount_amount" header="Desconto" style="width: 120px" class="text-right">
                                    <template #body="{ data }">
                                        <span v-if="data.discount_amount > 0" class="text-orange-500">
                                            -{{ formatCurrency(data.discount_amount) }}
                                        </span>
                                        <span v-else>-</span>
                                    </template>
                                </Column>
                                <Column field="line_total" header="Total" style="width: 120px" class="text-right">
                                    <template #body="{ data }">
                                        <span class="font-semibold">{{ formatCurrency(data.line_total) }}</span>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Right Column - Summary and Actions -->
                    <div class="col-12 md:col-4">
                        <!-- Payment Status -->
                        <div class="card mb-4">
                            <div class="flex justify-content-between align-items-center mb-3">
                                <h5 class="m-0"><i class="pi pi-money-bill mr-2"></i>Status do Pagamento</h5>
                                <Button 
                                    v-if="remainingAmount > 0"
                                    label="Novo Pagamento" 
                                    icon="pi pi-plus"
                                    size="small"
                                    @click="createPaymentForInvoice"
                                    class="p-button-success p-button-outlined"
                                />
                            </div>
                            
                            <div class="field-group">
                                <label>Valor Total:</label>
                                <span class="ml-auto font-semibold">{{ formatCurrency(invoice.total) }}</span>
                            </div>
                            
                            <div class="field-group">
                                <label>Valor Pago:</label>
                                <span class="ml-auto text-green-500">{{ formatCurrency(invoice.paid_amount || 0) }}</span>
                            </div>
                            
                            <div class="field-group">
                                <label>Valor Restante:</label>
                                <span class="ml-auto font-bold" :class="remainingAmount > 0 ? 'text-orange-500' : 'text-green-500'">
                                    {{ formatCurrency(remainingAmount) }}
                                </span>
                            </div>

                            <div class="mt-3">
                                <label class="block mb-2">Progresso do Pagamento</label>
                                <ProgressBar :value="paymentPercentage" :showValue="true" />
                            </div>

                            <div v-if="invoice.payment_date" class="field-group mt-3">
                                <label>Último Pagamento:</label>
                                <span class="ml-auto text-sm">{{ formatDate(invoice.payment_date) }}</span>
                            </div>

                            <!-- Lista de Pagamentos -->
                            <div v-if="payments.length > 0" class="mt-4">
                                <Divider />
                                <h6 class="mb-3">Histórico de Pagamentos</h6>
                                <div class="max-h-20rem overflow-y-auto">
                                    <div 
                                        v-for="payment in payments" 
                                        :key="payment.id"
                                        class="payment-item p-3 border-1 surface-border border-round mb-2 cursor-pointer hover:surface-hover"
                                        @click="viewPayment(payment.id)"
                                    >
                                        <div class="flex justify-content-between align-items-center">
                                            <div>
                                                <div class="font-medium">{{ formatCurrency(payment.amount) }}</div>
                                                <div class="text-sm text-600">
                                                    {{ formatDate(payment.payment_date) }} • 
                                                    {{ getPaymentMethodLabel(payment.payment_method) }}
                                                </div>
                                                <div v-if="payment.reference" class="text-xs text-500">
                                                    Ref: {{ payment.reference }}
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <Tag 
                                                    :value="getPaymentStatusLabel(payment.status)" 
                                                    :severity="getStatusSeverity(payment.status)"
                                                    class="mb-1"
                                                />
                                                <div class="text-xs text-500">
                                                    #{{ payment.payment_number || payment.id }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Loading dos pagamentos -->
                            <div v-else-if="loadingPayments" class="text-center py-3">
                                <ProgressSpinner style="width:30px;height:30px" strokeWidth="4"/>
                                <p class="mt-2 text-sm text-600">Carregando pagamentos...</p>
                            </div>

                            <!-- Sem pagamentos -->
                            <div v-else-if="!loadingPayments && payments.length === 0" class="text-center py-3">
                                <i class="pi pi-info-circle text-3xl text-400 mb-2"></i>
                                <p class="text-600">Nenhum pagamento registrado para esta fatura.</p>
                            </div>
                        </div>

                        <!-- Summary -->
                        <div class="card mb-4">
                            <h5><i class="pi pi-calculator mr-2"></i>Resumo Financeiro</h5>
                            
                            <div class="field-group">
                                <label>Subtotal:</label>
                                <span class="ml-auto font-semibold">{{ formatCurrency(invoice.subtotal) }}</span>
                            </div>
                            
                            <div class="field-group" v-if="invoice.discount_amount > 0">
                                <label>Desconto ({{ invoice.discount_rate }}%):</label>
                                <span class="ml-auto text-orange-500">-{{ formatCurrency(invoice.discount_amount) }}</span>
                            </div>
                            
                            <div class="field-group">
                                <label>Impostos ({{ invoice.tax_rate }}%):</label>
                                <span class="ml-auto">{{ formatCurrency(invoice.tax_amount) }}</span>
                            </div>
                            
                            <Divider class="my-3" />
                            
                            <div class="field-group">
                                <label class="text-xl font-bold">Total:</label>
                                <span class="ml-auto text-xl font-bold text-primary">{{ formatCurrency(invoice.total) }}</span>
                            </div>
                        </div>

                        <!-- Dates -->
                        <div class="card mb-4">
                            <h5><i class="pi pi-calendar mr-2"></i>Datas Importantes</h5>
                            
                            <div class="field-group">
                                <label>Data da Fatura:</label>
                                <span class="ml-auto">{{ formatDate(invoice.invoice_date) }}</span>
                            </div>
                            
                            <div class="field-group">
                                <label>Data de Vencimento:</label>
                                <span class="ml-auto" :class="{ 'text-red-500': isOverdue }">
                                    {{ formatDate(invoice.due_date) }}
                                </span>
                            </div>
                            
                            <div class="field-group" v-if="invoice.updated_at !== invoice.created_at">
                                <label>Última atualização:</label>
                                <span class="ml-auto text-sm">{{ formatDateTime(invoice.updated_at) }}</span>
                            </div>
                        </div>

                        <!-- Status Actions -->
                        <div class="card" v-if="canCancel">
                            <h5><i class="pi pi-cog mr-2"></i>Ações de Status</h5>
                            
                            <div class="flex flex-column gap-2">
                                <Button 
                                    label="Cancelar Fatura" 
                                    icon="pi pi-times" 
                                    class="p-button-danger p-button-outlined p-button-sm"
                                    :loading="isUpdatingStatus"
                                    @click="updateStatus('CANCELLED')"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                <div v-if="invoice.notes" class="card mt-4">
                    <h5><i class="pi pi-comment mr-2"></i>Observações</h5>
                    <p class="text-700 line-height-3 m-0">{{ invoice.notes }}</p>
                </div>
            </div>
        </div>
    </div>


</template>

<style scoped>
.field-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding: 0.25rem 0;
}

.field-group label {
    font-weight: 500;
    color: var(--text-color-secondary);
}

.card {
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    background: var(--surface-card);
}

.card h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-color);
    font-weight: 600;
}
</style>