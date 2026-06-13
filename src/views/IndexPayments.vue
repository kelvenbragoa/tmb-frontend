<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Gestão de Pagamentos</h5>
                
                <!-- Tabs para tipos de pagamento -->
                <TabView v-model:activeIndex="activeTab" @tab-change="onTabChange">
                    <!-- Tab de Pagamentos Recebidos -->
                    <TabPanel header="Pagamentos Recebidos">
                        <div class="flex flex-column md:flex-row justify-content-between mb-3">
                            <div class="flex flex-wrap gap-2">
                                <Button 
                                    label="Novo Pagamento Recebido" 
                                    icon="pi pi-plus" 
                                    @click="createPayment('received')"
                                    class="p-button-primary"
                                />
                                <Button 
                                    label="Atualizar" 
                                    icon="pi pi-refresh" 
                                    @click="loadPayments"
                                    class="p-button-outlined"
                                />
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText 
                                        v-model="filters.search" 
                                        placeholder="Pesquisar..." 
                                        @input="onFilterChange"
                                        class="w-full md:w-auto"
                                    />
                                </span>
                                <Dropdown
                                    v-model="filters.status"
                                    :options="paymentStatuses"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Status"
                                    showClear
                                    @change="onFilterChange"
                                    class="w-full md:w-auto"
                                />
                                <Dropdown
                                    v-model="filters.payment_method"
                                    :options="paymentMethods"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Método"
                                    showClear
                                    @change="onFilterChange"
                                    class="w-full md:w-auto"
                                />
                            </div>
                        </div>

                        <DataTable 
                            :value="receivedPayments" 
                            :loading="loading"
                            :paginator="true" 
                            :rows="10" 
                            :totalRecords="totalRecords"
                            :lazy="true"
                            @page="onPage"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25, 50]"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagamentos recebidos"
                            responsiveLayout="scroll"
                        >
                            <Column field="payment_number" header="Número" sortable class="min-w-12rem">
                                <template #body="slotProps">
                                    <span class="font-medium">{{ formatPaymentNumber(slotProps.data.payment_number) }}</span>
                                </template>
                            </Column>
                            
                            <Column field="costumer" header="Cliente" sortable class="min-w-14rem">
                                <template #body="slotProps">
                                    <div v-if="slotProps.data.costumer">
                                        <div class="font-medium">{{ slotProps.data.costumer.name }}</div>
                                        <div class="text-sm text-600">{{ slotProps.data.costumer.email }}</div>
                                    </div>
                                    <span v-else class="text-500">-</span>
                                </template>
                            </Column>

                            <Column field="invoice" header="Fatura" class="min-w-10rem">
                                <template #body="slotProps">
                                    <div v-if="slotProps.data.invoice">
                                        <Button 
                                            :label="slotProps.data.invoice.invoice_number"
                                            class="p-button-link p-0"
                                            @click="viewInvoice(slotProps.data.invoice.id)"
                                        />
                                    </div>
                                    <span v-else class="text-500">Sem fatura</span>
                                </template>
                            </Column>

                            <Column field="amount" header="Valor" sortable class="min-w-10rem">
                                <template #body="slotProps">
                                    <span class="font-semibold">{{ formatCurrency(slotProps.data.amount) }}</span>
                                </template>
                            </Column>

                            <Column field="payment_method" header="Método" sortable class="min-w-10rem">
                                <template #body="slotProps">
                                    {{ getPaymentMethodLabel(slotProps.data.payment_method) }}
                                </template>
                            </Column>

                            <Column field="status" header="Status" sortable class="min-w-8rem">
                                <template #body="slotProps">
                                    <Tag 
                                        :value="getPaymentStatusLabel(slotProps.data.status)" 
                                        :severity="getStatusSeverity(slotProps.data.status)"
                                    />
                                </template>
                            </Column>

                            <Column field="payment_date" header="Data Pagamento" sortable class="min-w-10rem">
                                <template #body="slotProps">
                                    {{ formatDate(slotProps.data.payment_date) }}
                                </template>
                            </Column>

                            <Column header="Ações" class="min-w-10rem">
                                <template #body="slotProps">
                                    <div class="flex gap-2">
                                        <Button 
                                            icon="pi pi-eye" 
                                            v-tooltip.top="'Visualizar'"
                                            @click="viewPayment(slotProps.data)"
                                            class="p-button-rounded p-button-text"
                                        />
                                        <Button 
                                            icon="pi pi-pencil" 
                                            v-tooltip.top="'Editar'"
                                            @click="editPayment(slotProps.data)"
                                            :disabled="!canEdit(slotProps.data)"
                                            class="p-button-rounded p-button-text"
                                        />
                                        <Button 
                                            icon="pi pi-times" 
                                            v-tooltip.top="'Cancelar'"
                                            @click="confirmCancel(slotProps.data)"
                                            :disabled="!canCancel(slotProps.data)"
                                            class="p-button-rounded p-button-text p-button-warning"
                                        />
                                        <Button 
                                            icon="pi pi-trash" 
                                            v-tooltip.top="'Excluir'"
                                            @click="confirmDelete(slotProps.data)"
                                            class="p-button-rounded p-button-text p-button-danger"
                                        />
                                    </div>
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center py-4">
                                    <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                                    <p class="text-600">Nenhum pagamento recebido encontrado.</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>

                    <!-- Tab de Pagamentos Feitos -->
                    <TabPanel header="Pagamentos Feitos">
                        <div class="flex flex-column md:flex-row justify-content-between mb-3">
                            <div class="flex flex-wrap gap-2">
                                <Button 
                                    label="Novo Pagamento Feito" 
                                    icon="pi pi-plus" 
                                    @click="createPayment('made')"
                                    class="p-button-primary"
                                />
                                <Button 
                                    label="Atualizar" 
                                    icon="pi pi-refresh" 
                                    @click="loadPayments"
                                    class="p-button-outlined"
                                />
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText 
                                        v-model="filters.search" 
                                        placeholder="Pesquisar..." 
                                        @input="onFilterChange"
                                        class="w-full md:w-auto"
                                    />
                                </span>
                                <Dropdown
                                    v-model="filters.status"
                                    :options="paymentStatuses"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Status"
                                    showClear
                                    @change="onFilterChange"
                                    class="w-full md:w-auto"
                                />
                                <Dropdown
                                    v-model="filters.payment_method"
                                    :options="paymentMethods"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Método"
                                    showClear
                                    @change="onFilterChange"
                                    class="w-full md:w-auto"
                                />
                            </div>
                        </div>

                        <DataTable 
                            :value="madePayments" 
                            :loading="loading"
                            :paginator="true" 
                            :rows="10" 
                            :totalRecords="totalRecords"
                            :lazy="true"
                            @page="onPage"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25, 50]"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagamentos feitos"
                            responsiveLayout="scroll"
                        >
                            <Column field="payment_number" header="Número" sortable class="min-w-12rem">
                                <template #body="slotProps">
                                    <span class="font-medium">{{ formatPaymentNumber(slotProps.data.payment_number) }}</span>
                                </template>
                            </Column>
                            
                            <Column field="supplier" header="Fornecedor" sortable class="min-w-14rem">
                                <template #body="slotProps">
                                    <div v-if="slotProps.data.supplier">
                                        <div class="font-medium">{{ slotProps.data.supplier.name }}</div>
                                        <div class="text-sm text-600">{{ slotProps.data.supplier.email }}</div>
                                    </div>
                                    <span v-else class="text-500">-</span>
                                </template>
                            </Column>

                            <Column field="purchase_invoice" header="Fatura Compra" class="min-w-10rem">
                                <template #body="slotProps">
                                    <div v-if="slotProps.data.purchase_invoice">
                                        <Button 
                                            :label="slotProps.data.purchase_invoice.invoice_number"
                                            class="p-button-link p-0"
                                            @click="viewPurchaseInvoice(slotProps.data.purchase_invoice.id)"
                                        />
                                    </div>
                                    <span v-else class="text-500">Sem fatura</span>
                                </template>
                            </Column>

                            <Column field="amount" header="Valor" sortable class="min-w-10rem">
                                <template #body="slotProps">
                                    <span class="font-semibold">{{ formatCurrency(slotProps.data.amount) }}</span>
                                </template>
                            </Column>

                            <Column field="payment_method" header="Método" sortable class="min-w-10rem">
                                <template #body="slotProps">
                                    {{ getPaymentMethodLabel(slotProps.data.payment_method) }}
                                </template>
                            </Column>

                            <Column field="status" header="Status" sortable class="min-w-8rem">
                                <template #body="slotProps">
                                    <Tag 
                                        :value="getPaymentStatusLabel(slotProps.data.status)" 
                                        :severity="getStatusSeverity(slotProps.data.status)"
                                    />
                                </template>
                            </Column>

                            <Column field="payment_date" header="Data Pagamento" sortable class="min-w-10rem">
                                <template #body="slotProps">
                                    {{ formatDate(slotProps.data.payment_date) }}
                                </template>
                            </Column>

                            <Column header="Ações" class="min-w-10rem">
                                <template #body="slotProps">
                                    <div class="flex gap-2">
                                        <Button 
                                            icon="pi pi-eye" 
                                            v-tooltip.top="'Visualizar'"
                                            @click="viewPayment(slotProps.data)"
                                            class="p-button-rounded p-button-text"
                                        />
                                        <Button 
                                            icon="pi pi-pencil" 
                                            v-tooltip.top="'Editar'"
                                            @click="editPayment(slotProps.data)"
                                            :disabled="!canEdit(slotProps.data)"
                                            class="p-button-rounded p-button-text"
                                        />
                                        <Button 
                                            icon="pi pi-times" 
                                            v-tooltip.top="'Cancelar'"
                                            @click="confirmCancel(slotProps.data)"
                                            :disabled="!canCancel(slotProps.data)"
                                            class="p-button-rounded p-button-text p-button-warning"
                                        />
                                        <Button 
                                            icon="pi pi-trash" 
                                            v-tooltip.top="'Excluir'"
                                            @click="confirmDelete(slotProps.data)"
                                            class="p-button-rounded p-button-text p-button-danger"
                                        />
                                    </div>
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center py-4">
                                    <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                                    <p class="text-600">Nenhum pagamento feito encontrado.</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>

    <!-- Dialog de Confirmação para Cancelamento -->
    <Dialog v-model:visible="showCancelDialog" :style="{width: '450px'}" header="Confirmar Cancelamento" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="paymentToCancel">
                Tem certeza que deseja cancelar o pagamento <strong>{{ formatPaymentNumber(paymentToCancel.payment_number) }}</strong>?
            </span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="showCancelDialog = false" class="p-button-text"/>
            <Button label="Sim" icon="pi pi-check" @click="cancelPayment" class="p-button-warning" :loading="processing"/>
        </template>
    </Dialog>

    <!-- Dialog de Confirmação para Exclusão -->
    <Dialog v-model:visible="showDeleteDialog" :style="{width: '450px'}" header="Confirmar Exclusão" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="paymentToDelete">
                Tem certeza que deseja excluir o pagamento <strong>{{ formatPaymentNumber(paymentToDelete.payment_number) }}</strong>?
                <br><small class="text-red-500">Esta ação não pode ser desfeita.</small>
            </span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="showDeleteDialog = false" class="p-button-text"/>
            <Button label="Excluir" icon="pi pi-trash" @click="deletePayment" class="p-button-danger" :loading="processing"/>
        </template>
    </Dialog>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PaymentService from '@/service/PaymentService';
import moment from 'moment';

export default {
    name: 'IndexPayments',
    setup() {
        const router = useRouter();
        const toast = useToast();
        const confirm = useConfirm();

        // Estado reativo
        const loading = ref(false);
        const processing = ref(false);
        const activeTab = ref(0);
        const receivedPayments = ref([]);
        const madePayments = ref([]);
        const totalRecords = ref(0);
        const currentPage = ref(0);
        const rowsPerPage = ref(10);

        // Dialogs
        const showCancelDialog = ref(false);
        const showDeleteDialog = ref(false);
        const paymentToCancel = ref(null);
        const paymentToDelete = ref(null);

        // Filtros
        const filters = reactive({
            search: '',
            status: null,
            payment_method: null,
            type: 'received'
        });

        // Dados para dropdowns
        const paymentStatuses = computed(() => PaymentService.getPaymentStatuses());
        const paymentMethods = computed(() => PaymentService.getPaymentMethods());

        // Watchers
        watch(activeTab, (newValue) => {
            filters.type = newValue === 0 ? 'received' : 'made';
            resetFilters();
            loadPayments();
        });

        // Métodos
        const loadPayments = async () => {
            loading.value = true;
            try {
                const params = {
                    page: currentPage.value + 1,
                    limit: rowsPerPage.value,
                    type: filters.type,
                    ...filters
                };

                // Remove campos vazios
                Object.keys(params).forEach(key => {
                    if (params[key] === null || params[key] === '') {
                        delete params[key];
                    }
                });

                const response = await PaymentService.getPayments(params);
                
                if (filters.type === 'received') {
                    receivedPayments.value = response.data || [];
                } else {
                    madePayments.value = response.data || [];
                }
                
                totalRecords.value = response.total || 0;
            } catch (error) {
                console.error('Erro ao carregar pagamentos:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar pagamentos',
                    life: 5000
                });
            } finally {
                loading.value = false;
            }
        };

        const onPage = (event) => {
            currentPage.value = event.page;
            rowsPerPage.value = event.rows;
            loadPayments();
        };

        const onFilterChange = () => {
            currentPage.value = 0;
            loadPayments();
        };

        const onTabChange = () => {
            resetFilters();
        };

        const resetFilters = () => {
            filters.search = '';
            filters.status = null;
            filters.payment_method = null;
            currentPage.value = 0;
        };

        const createPayment = (type) => {
            router.push({ name: 'CreatePayment', params: { type } });
        };

        const viewPayment = (payment) => {
            router.push({ name: 'ShowPayment', params: { id: payment.id } });
        };

        const editPayment = (payment) => {
            router.push({ name: 'EditPayment', params: { id: payment.id } });
        };

        const viewInvoice = (invoiceId) => {
            router.push({ name: 'ShowInvoices', params: { id: invoiceId } });
        };

        const viewPurchaseInvoice = (invoiceId) => {
            // Implementar quando existir a rota para faturas de compra
            console.log('View purchase invoice:', invoiceId);
        };

        const confirmCancel = (payment) => {
            paymentToCancel.value = payment;
            showCancelDialog.value = true;
        };

        const cancelPayment = async () => {
            if (!paymentToCancel.value) return;

            processing.value = true;
            try {
                await PaymentService.updatePaymentStatus(paymentToCancel.value.id, 'cancelled');
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Pagamento cancelado com sucesso',
                    life: 3000
                });
                
                showCancelDialog.value = false;
                paymentToCancel.value = null;
                loadPayments();
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

        const confirmDelete = (payment) => {
            paymentToDelete.value = payment;
            showDeleteDialog.value = true;
        };

        const deletePayment = async () => {
            if (!paymentToDelete.value) return;

            processing.value = true;
            try {
                await PaymentService.deletePayment(paymentToDelete.value.id);
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Pagamento excluído com sucesso',
                    life: 3000
                });
                
                showDeleteDialog.value = false;
                paymentToDelete.value = null;
                loadPayments();
            } catch (error) {
                console.error('Erro ao excluir pagamento:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao excluir pagamento',
                    life: 5000
                });
            } finally {
                processing.value = false;
            }
        };

        // Métodos de formatação e utilidade
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

        const formatPaymentNumber = (number) => {
            return PaymentService.formatPaymentNumber(number);
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

        // Lifecycle
        onMounted(() => {
            loadPayments();
        });

        return {
            // Estado
            loading,
            processing,
            activeTab,
            receivedPayments,
            madePayments,
            totalRecords,
            currentPage,
            rowsPerPage,
            filters,
            paymentStatuses,
            paymentMethods,
            
            // Dialogs
            showCancelDialog,
            showDeleteDialog,
            paymentToCancel,
            paymentToDelete,
            
            // Métodos
            loadPayments,
            onPage,
            onFilterChange,
            onTabChange,
            createPayment,
            viewPayment,
            editPayment,
            viewInvoice,
            viewPurchaseInvoice,
            confirmCancel,
            cancelPayment,
            confirmDelete,
            deletePayment,
            
            // Formatação
            formatCurrency,
            formatDate,
            formatPaymentNumber,
            getPaymentStatusLabel,
            getPaymentMethodLabel,
            getStatusSeverity,
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

:deep(.p-tabview .p-tabview-panels) {
    padding: 1rem 0;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--surface-100);
}

:deep(.p-button-link) {
    padding: 0;
    text-decoration: none;
}

:deep(.p-button-link:hover) {
    text-decoration: underline;
}
</style>