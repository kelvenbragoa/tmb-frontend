<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PurchaseInvoiceService from '@/service/PurchaseInvoiceService';
import SupplierService from '@/service/SupplierService';

export default {
    name: 'IndexPurchaseInvoices',
    setup() {
        const router = useRouter();
        const toast = useToast();
        const confirm = useConfirm();

        // Estado
        const loading = ref(false);
        const purchaseInvoices = ref([]);
        const suppliers = ref([]);
        const totalRecords = ref(0);
        const lazyParams = ref({});
        const filters = reactive({
            global: { value: null, matchMode: 'contains' },
            status: { value: null, matchMode: 'equals' },
            supplier_id: { value: null, matchMode: 'equals' },
            overdue: { value: null, matchMode: 'equals' }
        });

        // Modal de conversão de PO
        const showConvertModal = ref(false);
        const selectedPO = ref(null);

        // Modal de pagamento
        const showPaymentModal = ref(false);
        const selectedInvoice = ref(null);

        // Computed
        const statusOptions = computed(() => [
            { label: 'Todos', value: null },
            ...PurchaseInvoiceService.getPurchaseInvoiceStatuses()
        ]);

        const supplierOptions = computed(() => [
            { label: 'Todos Fornecedores', value: null },
            ...suppliers.value.map(supplier => ({
                label: supplier.name,
                value: supplier.id
            }))
        ]);

        const overdueOptions = computed(() => [
            { label: 'Todas', value: null },
            { label: 'Apenas Vencidas', value: true },
            { label: 'Não Vencidas', value: false }
        ]);

        // Métodos
        const loadPurchaseInvoices = async (event = {}) => {
            loading.value = true;
            
            const page = event.first ? Math.floor(event.first / event.rows) + 1 : 1;
            const limit = event.rows || 25;
            const search = filters.global.value || '';
            const status = filters.status.value || '';
            const supplier_id = filters.supplier_id.value || '';
            const overdue = filters.overdue.value;

            try {
                const response = await PurchaseInvoiceService.getAllPurchaseInvoices({
                    page,
                    limit,
                    search,
                    status,
                    supplier_id,
                    overdue
                });

                purchaseInvoices.value = response.data || [];
                totalRecords.value = response.total || 0;

                lazyParams.value = { ...event };
            } catch (error) {
                console.error('Erro ao carregar faturas de compra:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar faturas de compra',
                    life: 5000
                });
            } finally {
                loading.value = false;
            }
        };

        const loadSuppliers = async () => {
            try {
                const response = await SupplierService.getAllSuppliers({ limit: 1000 });
                suppliers.value = response.items || [];
            } catch (error) {
                console.error('Erro ao carregar fornecedores:', error);
            }
        };

        const onFilter = () => {
            loadPurchaseInvoices(lazyParams.value);
        };

        const clearFilters = () => {
            filters.global.value = null;
            filters.status.value = null;
            filters.supplier_id.value = null;
            filters.overdue.value = null;
            loadPurchaseInvoices();
        };

        const createPurchaseInvoice = () => {
            router.push({ name: 'purchases.invoices.create' });
        };

        const viewPurchaseInvoice = (id) => {
            router.push({ name: 'purchases.invoices.show', params: { id } });
        };

        const editPurchaseInvoice = (id) => {
            router.push({ name: 'purchases.invoices.edit', params: { id } });
        };

        const viewPdf = (id) => {
            router.push({ name: 'purchases.invoices.pdf', params: { id } });
        };

        const openConvertModal = () => {
            showConvertModal.value = true;
        };

        const openPaymentModal = (invoice) => {
            selectedInvoice.value = invoice;
            showPaymentModal.value = true;
        };

        const updateStatus = async (invoice, newStatus) => {
            try {
                await PurchaseInvoiceService.updatePurchaseInvoiceStatus(invoice.id, newStatus);
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Status atualizado para ${PurchaseInvoiceService.getPurchaseInvoiceStatusLabel(newStatus)}`,
                    life: 3000
                });
                loadPurchaseInvoices(lazyParams.value);
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

        const deletePurchaseInvoice = (invoice) => {
            if (!PurchaseInvoiceService.canDeleteInvoice(invoice.status)) {
                toast.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: 'Não é possível excluir uma fatura que não está em rascunho',
                    life: 3000
                });
                return;
            }

            confirm.require({
                message: `Tem certeza que deseja excluir a fatura "${invoice.invoice_number}"?`,
                header: 'Confirmar Exclusão',
                icon: 'pi pi-exclamation-triangle',
                rejectClass: 'p-button-text p-button-text',
                acceptClass: 'p-button-danger',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Excluir',
                accept: async () => {
                    try {
                        await PurchaseInvoiceService.deletePurchaseInvoice(invoice.id);
                        toast.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Fatura de compra excluída com sucesso',
                            life: 3000
                        });
                        loadPurchaseInvoices(lazyParams.value);
                    } catch (error) {
                        console.error('Erro ao excluir fatura de compra:', error);
                        toast.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: error.message || 'Erro ao excluir fatura de compra',
                            life: 5000
                        });
                    }
                }
            });
        };

        const onConversionComplete = () => {
            showConvertModal.value = false;
            loadPurchaseInvoices(lazyParams.value);
        };

        const onPaymentComplete = () => {
            showPaymentModal.value = false;
            selectedInvoice.value = null;
            loadPurchaseInvoices(lazyParams.value);
        };

        const getStatusSeverity = (status) => {
            return PurchaseInvoiceService.getStatusSeverity(status);
        };

        const getStatusLabel = (status) => {
            return PurchaseInvoiceService.getPurchaseInvoiceStatusLabel(status);
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

        const canEdit = (invoice) => {
            return PurchaseInvoiceService.canEditInvoice(invoice.status);
        };

        const canDelete = (invoice) => {
            return PurchaseInvoiceService.canDeleteInvoice(invoice.status);
        };

        const canRecordPayment = (invoice) => {
            return PurchaseInvoiceService.canRecordPayment(invoice.status);
        };

        const isOverdue = (invoice) => {
            if (!invoice.due_date || invoice.status === 'paid') return false;
            return new Date(invoice.due_date) < new Date();
        };

        // Lifecycle
        onMounted(async () => {
            await loadSuppliers();
            loadPurchaseInvoices();
        });

        return {
            // Estado
            loading,
            purchaseInvoices,
            totalRecords,
            filters,
            showConvertModal,
            showPaymentModal,
            selectedInvoice,

            // Computed
            statusOptions,
            supplierOptions,
            overdueOptions,

            // Métodos
            loadPurchaseInvoices,
            onFilter,
            clearFilters,
            createPurchaseInvoice,
            viewPurchaseInvoice,
            editPurchaseInvoice,
            viewPdf,
            openConvertModal,
            openPaymentModal,
            updateStatus,
            deletePurchaseInvoice,
            onConversionComplete,
            onPaymentComplete,
            getStatusSeverity,
            getStatusLabel,
            formatDate,
            formatCurrency,
            canEdit,
            canDelete,
            canRecordPayment,
            isOverdue
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Faturas de Compra</h5>
                    <div class="flex gap-2">
                        <Button 
                            label="Converter PO" 
                            icon="pi pi-refresh" 
                            class="p-button-outlined" 
                            @click="openConvertModal" 
                        />
                        <Button 
                            label="Nova Fatura" 
                            icon="pi pi-plus" 
                            @click="createPurchaseInvoice" 
                        />
                    </div>
                </div>

                <!-- Filtros -->
                <div class="grid mb-4">
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="search" class="font-medium">Pesquisar</label>
                            <InputText 
                                id="search" 
                                v-model="filters.global.value" 
                                placeholder="Número, fornecedor, referência..." 
                                @input="onFilter" 
                                class="w-full" 
                            />
                        </div>
                    </div>
                    <div class="col-12 md:col-2">
                        <div class="field">
                            <label for="status" class="font-medium">Status</label>
                            <Dropdown 
                                id="status" 
                                v-model="filters.status.value" 
                                :options="statusOptions" 
                                optionLabel="label" 
                                optionValue="value" 
                                placeholder="Selecione" 
                                @change="onFilter" 
                                class="w-full" 
                                showClear 
                            />
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="supplier" class="font-medium">Fornecedor</label>
                            <Dropdown 
                                id="supplier" 
                                v-model="filters.supplier_id.value" 
                                :options="supplierOptions" 
                                optionLabel="label" 
                                optionValue="value" 
                                placeholder="Selecione" 
                                @change="onFilter" 
                                class="w-full" 
                                showClear 
                            />
                        </div>
                    </div>
                    <div class="col-12 md:col-2">
                        <div class="field">
                            <label for="overdue" class="font-medium">Vencimento</label>
                            <Dropdown 
                                id="overdue" 
                                v-model="filters.overdue.value" 
                                :options="overdueOptions" 
                                optionLabel="label" 
                                optionValue="value" 
                                placeholder="Selecione" 
                                @change="onFilter" 
                                class="w-full" 
                                showClear 
                            />
                        </div>
                    </div>
                    <div class="col-12 md:col-2">
                        <div class="field">
                            <label class="font-medium">&nbsp;</label>
                            <div class="flex">
                                <Button 
                                    label="Limpar" 
                                    icon="pi pi-filter-slash" 
                                    @click="clearFilters" 
                                    class="p-button-outlined" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabela -->
                <DataTable
                    :value="purchaseInvoices"
                    :loading="loading"
                    :paginator="true"
                    :rows="25"
                    :totalRecords="totalRecords"
                    :lazy="true"
                    @page="loadPurchaseInvoices"
                    @sort="loadPurchaseInvoices"
                    pageLinkSize="3"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} faturas"
                    :rowsPerPageOptions="[10, 25, 50]"
                    responsiveLayout="scroll"
                    class="p-datatable-gridlines"
                >
                    <template #loading>
                        <div class="text-center py-4">
                            <ProgressSpinner style="width: 50px; height: 50px" />
                            <p class="mt-3">Carregando faturas de compra...</p>
                        </div>
                    </template>

                    <template #empty>
                        <div class="text-center py-8">
                            <i class="pi pi-search" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                            <p class="mt-3 text-lg">Nenhuma fatura de compra encontrada</p>
                            <p class="text-600">Tente ajustar os filtros ou criar uma nova fatura</p>
                        </div>
                    </template>

                    <Column field="invoice_number" header="Número" sortable class="min-w-12rem">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.invoice_number }}</div>
                            <div class="text-sm text-600">{{ formatDate(data.invoice_date) }}</div>
                        </template>
                    </Column>

                    <Column field="supplier.name" header="Fornecedor" sortable class="min-w-16rem">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.supplier?.name || '-' }}</div>
                            <div class="text-sm text-600">{{ data.reference_number || '-' }}</div>
                        </template>
                    </Column>

                    <Column field="status" header="Status" sortable class="min-w-10rem">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                                <i v-if="isOverdue(data)" class="pi pi-exclamation-triangle text-orange-500" v-tooltip.top="'Vencida'" />
                            </div>
                        </template>
                    </Column>

                    <Column field="due_date" header="Vencimento" sortable class="min-w-10rem">
                        <template #body="{ data }">
                            <div :class="{ 'text-orange-600 font-medium': isOverdue(data) }">
                                {{ formatDate(data.due_date) }}
                            </div>
                        </template>
                    </Column>

                    <Column field="total_amount" header="Total" sortable class="min-w-10rem">
                        <template #body="{ data }">
                            <div class="font-medium">{{ formatCurrency(data.total_amount) }}</div>
                            <div v-if="data.balance_due > 0" class="text-sm text-orange-600">
                                Saldo: {{ formatCurrency(data.balance_due) }}
                            </div>
                        </template>
                    </Column>

                    <Column header="Ações" class="min-w-16rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button 
                                    icon="pi pi-eye" 
                                    @click="viewPurchaseInvoice(data.id)" 
                                    class="p-button-text p-button-sm" 
                                    v-tooltip.top="'Visualizar'" 
                                />
                                <Button 
                                    icon="pi pi-file-pdf" 
                                    @click="viewPdf(data.id)" 
                                    class="p-button-text p-button-sm" 
                                    v-tooltip.top="'PDF'" 
                                />
                                <Button 
                                    icon="pi pi-pencil" 
                                    @click="editPurchaseInvoice(data.id)" 
                                    class="p-button-text p-button-sm" 
                                    v-tooltip.top="'Editar'" 
                                    :disabled="!canEdit(data)" 
                                />
                                <Button 
                                    icon="pi pi-credit-card" 
                                    @click="openPaymentModal(data)" 
                                    class="p-button-text p-button-sm" 
                                    v-tooltip.top="'Registrar Pagamento'" 
                                    :disabled="!canRecordPayment(data)" 
                                />
                                
                                <!-- Menu de Status -->
                                <SplitButton 
                                    v-if="data.status !== 'paid' && data.status !== 'cancelled'" 
                                    icon="pi pi-check" 
                                    class="p-button-text p-button-sm"
                                    :model="[
                                        { label: 'Marcar como Recebida', icon: 'pi pi-check', command: () => updateStatus(data, 'received') },
                                        { label: 'Marcar como Paga', icon: 'pi pi-credit-card', command: () => updateStatus(data, 'paid') },
                                        { label: 'Cancelar', icon: 'pi pi-times', command: () => updateStatus(data, 'cancelled') }
                                    ]"
                                    v-tooltip.top="'Alterar Status'"
                                />

                                <Button 
                                    icon="pi pi-trash" 
                                    @click="deletePurchaseInvoice(data)" 
                                    class="p-button-text p-button-sm text-red-600" 
                                    v-tooltip.top="'Excluir'" 
                                    :disabled="!canDelete(data)" 
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- Modal de Conversão de PO -->
    <!-- TODO: Implementar ConvertPOModal -->
    
    <!-- Modal de Pagamento -->
    <!-- TODO: Implementar PaymentModal -->
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