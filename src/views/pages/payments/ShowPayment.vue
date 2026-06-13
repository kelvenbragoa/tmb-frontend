<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!-- Cabeçalho -->
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">
                        Detalhes do Pagamento
                        <Tag 
                            v-if="payment.status" 
                            :value="getPaymentStatusLabel(payment.status)" 
                            :severity="getStatusSeverity(payment.status)"
                            class="ml-2"
                        />
                    </h5>
                    <div class="flex gap-2">
                        <Button 
                            label="Editar" 
                            icon="pi pi-pencil" 
                            @click="editPayment"
                            :disabled="!canEdit(payment)"
                            class="p-button-outlined"
                        />
                        <Button 
                            label="Voltar" 
                            icon="pi pi-arrow-left" 
                            @click="goBack"
                            class="p-button-text"
                        />
                    </div>
                </div>

                <div v-if="loading" class="text-center py-8">
                    <ProgressSpinner />
                    <p class="mt-3 text-600">Carregando detalhes do pagamento...</p>
                </div>

                <div v-else-if="payment.id" class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12">
                        <Panel header="Informações Básicas" class="mb-4">
                            <div class="grid">
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Número do Pagamento</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatPaymentNumber(payment.payment_number) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Tipo</label>
                                        <p class="mt-2 mb-0 text-700">{{ getPaymentTypeLabel(payment.type) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Valor</label>
                                        <p class="mt-2 mb-0 text-700 font-semibold text-xl">{{ formatCurrency(payment.amount) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Status</label>
                                        <div class="mt-2 mb-0">
                                            <Tag 
                                                :value="getPaymentStatusLabel(payment.status)" 
                                                :severity="getStatusSeverity(payment.status)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Cliente/Fornecedor -->
                    <div class="col-12 md:col-6">
                        <Panel :header="payment.type === 'received' ? 'Cliente' : 'Fornecedor'" class="mb-4">
                            <div v-if="payment.costumer && payment.type === 'received'">
                                <div class="grid">
                                    <div class="col-12">
                                        <div class="field">
                                            <label class="font-medium text-900">Nome</label>
                                            <p class="mt-2 mb-0 text-700">{{ payment.costumer.name }}</p>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Email</label>
                                            <p class="mt-2 mb-0 text-700">{{ payment.costumer.email || '-' }}</p>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Telefone</label>
                                            <p class="mt-2 mb-0 text-700">{{ payment.costumer.mobile || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="payment.supplier && payment.type === 'made'">
                                <div class="grid">
                                    <div class="col-12">
                                        <div class="field">
                                            <label class="font-medium text-900">Nome</label>
                                            <p class="mt-2 mb-0 text-700">{{ payment.supplier.name }}</p>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Email</label>
                                            <p class="mt-2 mb-0 text-700">{{ payment.supplier.email || '-' }}</p>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Telefone</label>
                                            <p class="mt-2 mb-0 text-700">{{ payment.supplier.phone || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-center py-4">
                                <i class="pi pi-user text-4xl text-400 mb-3"></i>
                                <p class="text-600">Informações não disponíveis</p>
                            </div>
                        </Panel>
                    </div>

                    <!-- Fatura Relacionada -->
                    <div class="col-12 md:col-6">
                        <Panel header="Fatura Relacionada" class="mb-4">
                            <div v-if="payment.invoice && payment.type === 'received'">
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Número da Fatura</label>
                                            <div class="mt-2 mb-0">
                                                <Button 
                                                    :label="payment.invoice.invoice_number"
                                                    class="p-button-link p-0"
                                                    @click="viewInvoice(payment.invoice.id)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Valor da Fatura</label>
                                            <p class="mt-2 mb-0 text-700">{{ formatCurrency(payment.invoice.total) }}</p>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="field">
                                            <label class="font-medium text-900">Status da Fatura</label>
                                            <div class="mt-2 mb-0">
                                                <Tag 
                                                    :value="getInvoiceStatusLabel(payment.invoice.status)" 
                                                    :severity="getInvoiceStatusSeverity(payment.invoice.status)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="payment.purchase_invoice && payment.type === 'made'">
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Número da Fatura</label>
                                            <div class="mt-2 mb-0">
                                                <Button 
                                                    :label="payment.purchase_invoice.invoice_number"
                                                    class="p-button-link p-0"
                                                    @click="viewPurchaseInvoice(payment.purchase_invoice.id)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Valor da Fatura</label>
                                            <p class="mt-2 mb-0 text-700">{{ formatCurrency(payment.purchase_invoice.total_amount) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-center py-4">
                                <i class="pi pi-file text-4xl text-400 mb-3"></i>
                                <p class="text-600">Pagamento avulso - sem fatura relacionada</p>
                            </div>
                        </Panel>
                    </div>

                    <!-- Detalhes do Pagamento -->
                    <div class="col-12">
                        <Panel header="Detalhes do Pagamento" class="mb-4">
                            <div class="grid">
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Método de Pagamento</label>
                                        <p class="mt-2 mb-0 text-700">{{ getPaymentMethodLabel(payment.payment_method) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Data do Pagamento</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDate(payment.payment_date) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Data de Vencimento</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDate(payment.due_date) || '-' }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Referência</label>
                                        <p class="mt-2 mb-0 text-700">{{ payment.reference || '-' }}</p>
                                    </div>
                                </div>
                                <div v-if="payment.description" class="col-12">
                                    <div class="field">
                                        <label class="font-medium text-900">Descrição</label>
                                        <p class="mt-2 mb-0 text-700 white-space-pre-line">{{ payment.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Informações do Sistema -->
                    <div class="col-12">
                        <Panel header="Informações do Sistema" class="mb-4">
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium text-900">Criado em</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDateTime(payment.createdAt) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium text-900">Última atualização</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDateTime(payment.updatedAt) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium text-900">ID</label>
                                        <p class="mt-2 mb-0 text-700 font-mono">{{ payment.id }}</p>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Ações -->
                    <div class="col-12">
                        <div class="flex justify-content-end gap-2">
                            <Button 
                                v-if="canCancel(payment)"
                                label="Cancelar Pagamento" 
                                icon="pi pi-times" 
                                @click="confirmCancel"
                                class="p-button-warning"
                            />
                            <Button 
                                v-if="canEdit(payment)"
                                label="Editar" 
                                icon="pi pi-pencil" 
                                @click="editPayment"
                                class="p-button-outlined"
                            />
                            <Button 
                                label="Duplicar" 
                                icon="pi pi-copy" 
                                @click="duplicatePayment"
                                class="p-button-outlined"
                            />
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-8">
                    <i class="pi pi-exclamation-triangle text-4xl text-400 mb-3"></i>
                    <p class="text-600">Pagamento não encontrado</p>
                    <Button label="Voltar" @click="goBack" class="p-button-outlined mt-3" />
                </div>
            </div>
        </div>
    </div>

    <!-- Dialog de Confirmação para Cancelamento -->
    <Dialog v-model:visible="showCancelDialog" :style="{width: '450px'}" header="Confirmar Cancelamento" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>
                Tem certeza que deseja cancelar o pagamento <strong>{{ formatPaymentNumber(payment.payment_number) }}</strong>?
            </span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="showCancelDialog = false" class="p-button-text"/>
            <Button label="Sim" icon="pi pi-check" @click="cancelPayment" class="p-button-warning" :loading="processing"/>
        </template>
    </Dialog>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import PaymentService from '@/service/PaymentService';
import moment from 'moment';

export default {
    name: 'ShowPayment',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const toast = useToast();

        // Estado
        const loading = ref(true);
        const processing = ref(false);
        const payment = ref({});
        const showCancelDialog = ref(false);

        // Métodos
        const loadPayment = async () => {
            loading.value = true;
            try {
                const response = await PaymentService.getPaymentById(route.params.id);
                payment.value = response;
            } catch (error) {
                console.error('Erro ao carregar pagamento:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar pagamento',
                    life: 5000
                });
            } finally {
                loading.value = false;
            }
        };

        const editPayment = () => {
            router.push({ name: 'EditPayment', params: { id: payment.value.id } });
        };

        const duplicatePayment = () => {
            // Criar uma cópia do pagamento sem ID para criar um novo
            const duplicatedData = {
                ...payment.value,
                payment_number: '', // Será gerado automaticamente
                status: 'pending' // Reset status para pendente
            };
            
            // Remover campos que não devem ser duplicados
            delete duplicatedData.id;
            delete duplicatedData.created_at;
            delete duplicatedData.updated_at;

            // Navegar para criação com dados pré-preenchidos
            router.push({ 
                name: 'CreatePayment', 
                params: { type: payment.value.type },
                state: { duplicatedData }
            });
        };

        const viewInvoice = (invoiceId) => {
            router.push({ name: 'ShowInvoices', params: { id: invoiceId } });
        };

        const viewPurchaseInvoice = (invoiceId) => {
            // Implementar quando existir a rota para faturas de compra
            console.log('View purchase invoice:', invoiceId);
        };

        const confirmCancel = () => {
            showCancelDialog.value = true;
        };

        const cancelPayment = async () => {
            processing.value = true;
            try {
                await PaymentService.updatePaymentStatus(payment.value.id, 'cancelled');
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Pagamento cancelado com sucesso',
                    life: 3000
                });
                
                showCancelDialog.value = false;
                // Recarregar dados para atualizar o status
                await loadPayment();
            } catch (error) {
                console.error('Erro ao cancelar pagamento:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao cancelar pagamento',
                    life: 5000
                });
            } finally {
                processing.value = false;
            }
        };

        const goBack = () => {
            router.push({ name: 'IndexPayments' });
        };

        // Métodos de formatação
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

        const formatDateTime = (date) => {
            return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
        };

        const formatPaymentNumber = (number) => {
            return PaymentService.formatPaymentNumber(number);
        };

        const getPaymentTypeLabel = (type) => {
            return PaymentService.getPaymentTypeLabel(type);
        };

        const getPaymentStatusLabel = (status) => {
            return PaymentService.getPaymentStatusLabel(status);
        };

        const getPaymentMethodLabel = (method) => {
            return PaymentService.getPaymentMethodLabel(method);
        };

        const getStatusSeverity = (status) => {
            return PaymentService.getStatusSeverity(status);
        };

        const canEdit = (payment) => {
            return PaymentService.canEdit(payment);
        };

        const canCancel = (payment) => {
            return PaymentService.canCancel(payment);
        };

        // Métodos específicos para faturas (podem ser movidos para InvoiceService)
        const getInvoiceStatusLabel = (status) => {
            const statusMap = {
                'draft': 'Rascunho',
                'sent': 'Enviada',
                'pending': 'Pendente',
                'paid': 'Paga',
                'overdue': 'Vencida',
                'cancelled': 'Cancelada'
            };
            return statusMap[status] || status;
        };

        const getInvoiceStatusSeverity = (status) => {
            const severityMap = {
                'draft': 'secondary',
                'sent': 'info',
                'pending': 'warning',
                'paid': 'success',
                'overdue': 'danger',
                'cancelled': 'secondary'
            };
            return severityMap[status] || 'secondary';
        };

        // Lifecycle
        onMounted(() => {
            loadPayment();
        });

        return {
            // Estado
            loading,
            processing,
            payment,
            showCancelDialog,
            
            // Métodos
            editPayment,
            duplicatePayment,
            viewInvoice,
            viewPurchaseInvoice,
            confirmCancel,
            cancelPayment,
            goBack,
            
            // Formatação
            formatCurrency,
            formatDate,
            formatDateTime,
            formatPaymentNumber,
            getPaymentTypeLabel,
            getPaymentStatusLabel,
            getPaymentMethodLabel,
            getStatusSeverity,
            getInvoiceStatusLabel,
            getInvoiceStatusSeverity,
            canEdit,
            canCancel
        };
    }
};
</script>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
}

.field label {
    display: block;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-bottom: 0.5rem;
}

.field p {
    color: var(--text-color);
    font-size: 1rem;
    line-height: 1.5;
}

.white-space-pre-line {
    white-space: pre-line;
}

.font-mono {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
}

:deep(.p-button-link) {
    padding: 0;
    text-decoration: none;
}

:deep(.p-button-link:hover) {
    text-decoration: underline;
}

:deep(.p-panel .p-panel-content) {
    padding: 1.5rem;
}
</style>