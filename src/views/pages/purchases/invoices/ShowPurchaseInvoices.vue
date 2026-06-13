<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PurchaseInvoiceService from '@/service/PurchaseInvoiceService';

export default {
    name: 'ShowPurchaseInvoices',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const toast = useToast();
        const confirm = useConfirm();

        // Estado
        const loading = ref(false);
        const invoice = ref(null);
        const showPaymentModal = ref(false);

        // Métodos
        const loadPurchaseInvoice = async () => {
            loading.value = true;
            try {
                const response = await PurchaseInvoiceService.getPurchaseInvoiceById(route.params.id);
                invoice.value = response;
            } catch (error) {
                console.error('Erro ao carregar fatura:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar fatura de compra',
                    life: 5000
                });
                router.push({ name: 'purchases.invoices.index' });
            } finally {
                loading.value = false;
            }
        };

        const editPurchaseInvoice = () => {
            router.push({ name: 'purchases.invoices.edit', params: { id: route.params.id } });
        };

        const viewPdf = () => {
            router.push({ name: 'purchases.invoices.pdf', params: { id: route.params.id } });
        };

        const openPaymentModal = () => {
            showPaymentModal.value = true;
        };

        const updateStatus = async (newStatus) => {
            try {
                await PurchaseInvoiceService.updatePurchaseInvoiceStatus(invoice.value.id, newStatus);
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Status atualizado para ${PurchaseInvoiceService.getPurchaseInvoiceStatusLabel(newStatus)}`,
                    life: 3000
                });
                await loadPurchaseInvoice();
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao atualizar status',
                    life: 5000
                });
            }
        };

        const deletePurchaseInvoice = () => {
            if (!PurchaseInvoiceService.canDeleteInvoice(invoice.value.status)) {
                toast.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: 'Não é possível excluir uma fatura que não está em rascunho',
                    life: 3000
                });
                return;
            }

            confirm.require({
                message: `Tem certeza que deseja excluir a fatura "${invoice.value.invoice_number}"?`,
                header: 'Confirmar Exclusão',
                icon: 'pi pi-exclamation-triangle',
                rejectClass: 'p-button-text',
                acceptClass: 'p-button-danger',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Excluir',
                accept: async () => {
                    try {
                        await PurchaseInvoiceService.deletePurchaseInvoice(invoice.value.id);
                        toast.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Fatura excluída com sucesso',
                            life: 3000
                        });
                        router.push({ name: 'purchases.invoices.index' });
                    } catch (error) {
                        console.error('Erro ao excluir fatura:', error);
                        toast.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: error.message || 'Erro ao excluir fatura',
                            life: 5000
                        });
                    }
                }
            });
        };

        const onPaymentComplete = () => {
            showPaymentModal.value = false;
            loadPurchaseInvoice();
        };

        const goBack = () => {
            router.push({ name: 'purchases.invoices.index' });
        };

        const getStatusSeverity = (status) => {
            return PurchaseInvoiceService.getStatusSeverity(status);
        };

        const getStatusLabel = (status) => {
            return PurchaseInvoiceService.getPurchaseInvoiceStatusLabel(status);
        };

        const getPaymentTermLabel = (term) => {
            return PurchaseInvoiceService.getPaymentTermLabel(term);
        };

        const formatDate = (date) => {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('pt-BR');
        };

        const formatCurrency = (value) => {
            if (!value) return 'MZN 0,00';
            return new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN'
            }).format(value);
        };

        const canEdit = () => {
            return invoice.value && PurchaseInvoiceService.canEditInvoice(invoice.value.status);
        };

        const canDelete = () => {
            return invoice.value && PurchaseInvoiceService.canDeleteInvoice(invoice.value.status);
        };

        const canRecordPayment = () => {
            return invoice.value && PurchaseInvoiceService.canRecordPayment(invoice.value.status);
        };

        const isOverdue = () => {
            if (!invoice.value || !invoice.value.due_date || invoice.value.status === 'paid') return false;
            return new Date(invoice.value.due_date) < new Date();
        };

        const calculateLineTotal = (item) => {
            const lineTotal = PurchaseInvoiceService.calculateLineTotal(
                item.quantity,
                item.unit_price,
                item.discount_percentage || 0,
                item.discount_amount || 0
            );
            const taxAmount = PurchaseInvoiceService.calculateLineTax(lineTotal, item.tax_rate || 0);
            return lineTotal + taxAmount;
        };

        // Lifecycle
        onMounted(loadPurchaseInvoice);

        return {
            // Estado
            loading,
            invoice,
            showPaymentModal,

            // Métodos
            editPurchaseInvoice,
            viewPdf,
            openPaymentModal,
            updateStatus,
            deletePurchaseInvoice,
            onPaymentComplete,
            goBack,
            getStatusSeverity,
            getStatusLabel,
            getPaymentTermLabel,
            formatDate,
            formatCurrency,
            canEdit,
            canDelete,
            canRecordPayment,
            isOverdue,
            calculateLineTotal
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!-- Cabeçalho -->
                <div class="flex align-items-center justify-content-between mb-4">
                    <div class="flex align-items-center gap-3">
                        <Button icon="pi pi-arrow-left" @click="goBack" class="p-button-text" />
                        <div>
                            <h5 class="m-0">{{ invoice?.invoice_number || 'Carregando...' }}</h5>
                            <p class="m-0 text-600">Fatura de Compra</p>
                        </div>
                    </div>

                    <div v-if="invoice" class="flex gap-2">
                        <Button 
                            label="PDF" 
                            icon="pi pi-file-pdf" 
                            @click="viewPdf" 
                            class="p-button-outlined" 
                        />
                        <Button 
                            label="Editar" 
                            icon="pi pi-pencil" 
                            @click="editPurchaseInvoice" 
                            :disabled="!canEdit()" 
                        />
                        
                        <!-- Menu de Ações -->
                        <SplitButton 
                            label="Ações" 
                            icon="pi pi-cog" 
                            :model="[
                                { 
                                    label: 'Registrar Pagamento', 
                                    icon: 'pi pi-credit-card', 
                                    command: openPaymentModal,
                                    disabled: !canRecordPayment()
                                },
                                { separator: true },
                                { 
                                    label: 'Marcar como Recebida', 
                                    icon: 'pi pi-check', 
                                    command: () => updateStatus('received'),
                                    disabled: invoice?.status !== 'draft'
                                },
                                { 
                                    label: 'Marcar como Paga', 
                                    icon: 'pi pi-credit-card', 
                                    command: () => updateStatus('paid'),
                                    disabled: !['received', 'partially_paid', 'overdue'].includes(invoice?.status)
                                },
                                { 
                                    label: 'Cancelar', 
                                    icon: 'pi pi-times', 
                                    command: () => updateStatus('cancelled'),
                                    disabled: invoice?.status === 'paid'
                                },
                                { separator: true },
                                { 
                                    label: 'Excluir', 
                                    icon: 'pi pi-trash', 
                                    command: deletePurchaseInvoice,
                                    disabled: !canDelete(),
                                    class: 'text-red-500'
                                }
                            ]"
                            class="p-button-outlined"
                        />
                    </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-content-center py-8">
                    <ProgressSpinner />
                </div>

                <!-- Conteúdo da Fatura -->
                <div v-else-if="invoice">
                    <!-- Status e Informações Principais -->
                    <div class="grid mb-4">
                        <div class="col-12 md:col-8">
                            <div class="flex align-items-center gap-3 mb-3">
                                <Tag :value="getStatusLabel(invoice.status)" :severity="getStatusSeverity(invoice.status)" />
                                <span v-if="isOverdue()" class="text-orange-600 font-medium">
                                    <i class="pi pi-exclamation-triangle mr-1"></i>
                                    Vencida
                                </span>
                            </div>

                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <h6 class="text-600 mb-2">Fornecedor</h6>
                                    <div class="font-medium text-lg">{{ invoice.supplier?.name || '-' }}</div>
                                    <div class="text-600">{{ invoice.supplier?.email || '-' }}</div>
                                    <div class="text-600">{{ invoice.supplier?.phone || '-' }}</div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <h6 class="text-600 mb-2">Purchase Order</h6>
                                    <div v-if="invoice.purchase_order" class="font-medium">
                                        {{ invoice.purchase_order.order_number }}
                                    </div>
                                    <div v-else class="text-600">-</div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                            <div class="p-3 border-1 surface-border border-round">
                                <div class="flex justify-content-between mb-2">
                                    <span>Data da Fatura:</span>
                                    <span class="font-medium">{{ formatDate(invoice.invoice_date) }}</span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>Data de Vencimento:</span>
                                    <span :class="{ 'text-orange-600 font-medium': isOverdue() }">
                                        {{ formatDate(invoice.due_date) }}
                                    </span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>Condições:</span>
                                    <span>{{ getPaymentTermLabel(invoice.payment_terms) }}</span>
                                </div>
                                <div v-if="invoice.reference_number" class="flex justify-content-between">
                                    <span>Referência:</span>
                                    <span class="font-medium">{{ invoice.reference_number }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Itens -->
                    <div class="mb-4">
                        <h6 class="mb-3">Itens da Fatura</h6>
                        <DataTable :value="invoice.items" class="p-datatable-gridlines">
                            <Column header="Produto" class="min-w-20rem">
                                <template #body="{ data }">
                                    <div class="font-medium">{{ data.product?.name || '-' }}</div>
                                    <div class="text-600 text-sm">{{ data.product?.sku || '-' }}</div>
                                    <div v-if="data.description" class="text-600 text-sm mt-1">
                                        {{ data.description }}
                                    </div>
                                </template>
                            </Column>

                            <Column header="Quantidade" class="min-w-8rem">
                                <template #body="{ data }">
                                    {{ data.quantity }} {{ data.unit || 'un' }}
                                </template>
                            </Column>

                            <Column header="Preço Unit." class="min-w-10rem">
                                <template #body="{ data }">
                                    {{ formatCurrency(data.unit_price) }}
                                </template>
                            </Column>

                            <Column header="Desconto" class="min-w-8rem">
                                <template #body="{ data }">
                                    <span v-if="data.discount_percentage > 0">
                                        {{ data.discount_percentage }}%
                                    </span>
                                    <span v-else-if="data.discount_amount > 0">
                                        {{ formatCurrency(data.discount_amount) }}
                                    </span>
                                    <span v-else>-</span>
                                </template>
                            </Column>

                            <Column header="IVA" class="min-w-8rem">
                                <template #body="{ data }">
                                    {{ data.tax_rate || 0 }}%
                                </template>
                            </Column>

                            <Column header="Total" class="min-w-10rem">
                                <template #body="{ data }">
                                    <div class="text-right font-medium">
                                        {{ formatCurrency(calculateLineTotal(data)) }}
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <!-- Totais e Observações -->
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div v-if="invoice.notes">
                                <h6 class="mb-2">Observações</h6>
                                <div class="p-3 surface-50 border-round">
                                    {{ invoice.notes }}
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="p-3 border-1 surface-border border-round">
                                <div class="flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>{{ formatCurrency(invoice.subtotal) }}</span>
                                </div>
                                <div class="flex justify-content-between mb-2">
                                    <span>IVA:</span>
                                    <span>{{ formatCurrency(invoice.tax_amount) }}</span>
                                </div>
                                <div v-if="invoice.shipping_cost > 0" class="flex justify-content-between mb-2">
                                    <span>Frete:</span>
                                    <span>{{ formatCurrency(invoice.shipping_cost) }}</span>
                                </div>
                                <div v-if="invoice.discount_amount > 0" class="flex justify-content-between mb-2">
                                    <span>Desconto:</span>
                                    <span class="text-red-500">-{{ formatCurrency(invoice.discount_amount) }}</span>
                                </div>

                                <Divider />

                                <div class="flex justify-content-between mb-3">
                                    <span class="font-bold text-lg">Total:</span>
                                    <span class="font-bold text-lg text-primary">{{ formatCurrency(invoice.total_amount) }}</span>
                                </div>

                                <div v-if="invoice.amount_paid > 0" class="flex justify-content-between mb-2">
                                    <span class="text-green-600">Valor Pago:</span>
                                    <span class="text-green-600 font-medium">{{ formatCurrency(invoice.amount_paid) }}</span>
                                </div>

                                <div v-if="invoice.balance_due > 0" class="flex justify-content-between">
                                    <span class="text-orange-600 font-medium">Saldo Devedor:</span>
                                    <span class="text-orange-600 font-bold">{{ formatCurrency(invoice.balance_due) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Pagamento -->
    <!-- TODO: Implementar PaymentModal -->
</template>

<style scoped>
.text-red-500 {
    color: #ef4444;
}
</style>