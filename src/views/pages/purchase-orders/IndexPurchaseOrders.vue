<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PurchaseOrderService from '@/service/PurchaseOrderService';
import SupplierService from '@/service/SupplierService';

export default {
    name: 'IndexPurchaseOrders',
    setup() {
        const router = useRouter();
        const toast = useToast();
        const confirm = useConfirm();

        // Estado
        const loading = ref(false);
        const purchaseOrders = ref([]);
        const suppliers = ref([]);
        const totalRecords = ref(0);
        const lazyParams = ref({});
        const filters = reactive({
            global: { value: null, matchMode: 'contains' },
            status: { value: null, matchMode: 'equals' },
            supplier_id: { value: null, matchMode: 'equals' }
        });

        // Computed
        const statusOptions = computed(() => [
            { label: 'Todos', value: null },
            ...PurchaseOrderService.getPurchaseOrderStatuses()
        ]);

        const supplierOptions = computed(() => [
            { label: 'Todos Fornecedores', value: null },
            ...suppliers.value.map(supplier => ({
                label: supplier.name,
                value: supplier.id
            }))
        ]);

        // Métodos
        const loadPurchaseOrders = async (event = {}) => {
            loading.value = true;
            
            const page = event.first ? Math.floor(event.first / event.rows) + 1 : 1;
            const limit = event.rows || 25;
            const search = filters.global.value || '';
            const status = filters.status.value || '';
            const supplier_id = filters.supplier_id.value || '';

            try {
                const response = await PurchaseOrderService.getAllPurchaseOrders({
                    page,
                    limit,
                    search,
                    status,
                    supplier_id
                });

                purchaseOrders.value = response.items || [];
                totalRecords.value = response.meta?.totalItems || 0;

                lazyParams.value = { ...event };
            } catch (error) {
                console.error('Erro ao carregar ordens de compra:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar ordens de compra',
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
            loadPurchaseOrders(lazyParams.value);
        };

        const clearFilters = () => {
            filters.global.value = null;
            filters.status.value = null;
            filters.supplier_id.value = null;
            loadPurchaseOrders();
        };

        const createPurchaseOrder = () => {
            router.push({ name: 'purchase-orders.create' });
        };

        const viewPurchaseOrder = (id) => {
            router.push({ name: 'purchase-orders.show', params: { id } });
        };

        const editPurchaseOrder = (id) => {
            router.push({ name: 'purchase-orders.edit', params: { id } });
        };

        const duplicatePurchaseOrder = async (order) => {
            try {
                const duplicatedOrder = await PurchaseOrderService.duplicatePurchaseOrder(order.id);
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Ordem ${duplicatedOrder.order_number} criada com sucesso`,
                    life: 3000
                });
                loadPurchaseOrders(lazyParams.value);
            } catch (error) {
                console.error('Erro ao duplicar ordem de compra:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao duplicar ordem de compra',
                    life: 5000
                });
            }
        };

        const updateStatus = async (order, newStatus) => {
            try {
                await PurchaseOrderService.updatePurchaseOrderStatus(order.id, newStatus);
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Status atualizado para ${PurchaseOrderService.getPurchaseOrderStatusLabel(newStatus)}`,
                    life: 3000
                });
                loadPurchaseOrders(lazyParams.value);
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

        const deletePurchaseOrder = (order) => {
            if (!PurchaseOrderService.canDeleteOrder(order.status)) {
                toast.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: 'Não é possível excluir uma ordem já recebida',
                    life: 3000
                });
                return;
            }

            confirm.require({
                message: `Tem certeza que deseja excluir a ordem "${order.order_number}"?`,
                header: 'Confirmar Exclusão',
                icon: 'pi pi-exclamation-triangle',
                rejectClass: 'p-button-text p-button-text',
                acceptClass: 'p-button-danger',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Excluir',
                accept: async () => {
                    try {
                        await PurchaseOrderService.deletePurchaseOrder(order.id);
                        toast.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Ordem de compra excluída com sucesso',
                            life: 3000
                        });
                        loadPurchaseOrders(lazyParams.value);
                    } catch (error) {
                        console.error('Erro ao excluir ordem de compra:', error);
                        toast.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: error.message || 'Erro ao excluir ordem de compra',
                            life: 5000
                        });
                    }
                }
            });
        };

        const getStatusSeverity = (status) => {
            return PurchaseOrderService.getStatusSeverity(status);
        };

        const getStatusLabel = (status) => {
            return PurchaseOrderService.getPurchaseOrderStatusLabel(status);
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

        const canEdit = (order) => {
            return PurchaseOrderService.canEditOrder(order.status);
        };

        // Lifecycle
        onMounted(async () => {
            await loadSuppliers();
            loadPurchaseOrders();
        });

        return {
            // Estado
            loading,
            purchaseOrders,
            totalRecords,
            filters,

            // Computed
            statusOptions,
            supplierOptions,

            // Métodos
            loadPurchaseOrders,
            onFilter,
            clearFilters,
            createPurchaseOrder,
            viewPurchaseOrder,
            editPurchaseOrder,
            duplicatePurchaseOrder,
            updateStatus,
            deletePurchaseOrder,
            getStatusSeverity,
            getStatusLabel,
            formatDate,
            formatCurrency,
            canEdit
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Ordens de Compra</h5>
                    <Button label="Nova Ordem" icon="pi pi-plus" @click="createPurchaseOrder" />
                </div>

                <!-- Filtros -->
                <div class="grid mb-4">
                    <div class="col-12 md:col-4">
                        <div class="field">
                            <label for="search" class="font-medium">Pesquisar</label>
                            <InputText id="search" v-model="filters.global.value" placeholder="Número da ordem, fornecedor..." @input="onFilter" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="status" class="font-medium">Status</label>
                            <Dropdown id="status" v-model="filters.status.value" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Selecione" @change="onFilter" class="w-full" showClear />
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="field">
                            <label for="supplier" class="font-medium">Fornecedor</label>
                            <Dropdown id="supplier" v-model="filters.supplier_id.value" :options="supplierOptions" optionLabel="label" optionValue="value" placeholder="Selecione" @change="onFilter" class="w-full" showClear />
                        </div>
                    </div>
                    <div class="col-12 md:col-2">
                        <div class="field">
                            <label class="font-medium">&nbsp;</label>
                            <div class="flex">
                                <Button label="Limpar" icon="pi pi-filter-slash" @click="clearFilters" class="p-button-outlined" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabela -->
                <DataTable
                    :value="purchaseOrders"
                    :loading="loading"
                    :paginator="true"
                    :rows="25"
                    :totalRecords="totalRecords"
                    :lazy="true"
                    @page="loadPurchaseOrders"
                    @sort="loadPurchaseOrders"
                    pageLinkSize="3"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ordens"
                    :rowsPerPageOptions="[10, 25, 50]"
                    responsiveLayout="scroll"
                    class="p-datatable-gridlines"
                >
                    <template #loading>
                        <div class="text-center py-4">
                            <ProgressSpinner style="width: 50px; height: 50px" />
                            <p class="mt-3">Carregando ordens de compra...</p>
                        </div>
                    </template>

                    <template #empty>
                        <div class="text-center py-8">
                            <i class="pi pi-search" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                            <p class="mt-3 text-lg">Nenhuma ordem de compra encontrada</p>
                            <p class="text-600">Tente ajustar os filtros ou criar uma nova ordem</p>
                        </div>
                    </template>

                    <Column field="order_number" header="Número" sortable class="min-w-12rem">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.order_number }}</div>
                            <div class="text-sm text-600">{{ formatDate(data.order_date) }}</div>
                        </template>
                    </Column>

                    <Column field="supplier.name" header="Fornecedor" sortable class="min-w-16rem">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.supplier?.name || '-' }}</div>
                            <div class="text-sm text-600">{{ data.supplier?.email || '-' }}</div>
                        </template>
                    </Column>

                    <Column field="status" header="Status" sortable class="min-w-10rem">
                        <template #body="{ data }">
                            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                        </template>
                    </Column>

                    <Column field="expected_delivery_date" header="Entrega Prevista" sortable class="min-w-10rem">
                        <template #body="{ data }">
                            {{ formatDate(data.expected_delivery_date) }}
                        </template>
                    </Column>

                    <Column field="total" header="Total" sortable class="min-w-10rem">
                        <template #body="{ data }">
                            <div class="font-medium">{{ formatCurrency(data.total) }}</div>
                        </template>
                    </Column>

                    <Column header="Ações" class="min-w-14rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" @click="viewPurchaseOrder(data.id)" class="p-button-text p-button-sm" v-tooltip.top="'Visualizar'" />
                                <Button icon="pi pi-pencil" @click="editPurchaseOrder(data.id)" class="p-button-text p-button-sm" v-tooltip.top="'Editar'" :disabled="!canEdit(data)" />
                                <Button icon="pi pi-copy" @click="duplicatePurchaseOrder(data)" class="p-button-text p-button-sm" v-tooltip.top="'Duplicar'" />
                                
                                <!-- Menu de Status -->
                                <SplitButton 
                                    v-if="data.status !== 'received'" 
                                    icon="pi pi-check" 
                                    class="p-button-text p-button-sm"
                                    :model="[
                                        { label: 'Confirmar', icon: 'pi pi-check', command: () => updateStatus(data, 'confirmed') },
                                        { label: 'Enviar', icon: 'pi pi-send', command: () => updateStatus(data, 'sent') },
                                        { label: 'Cancelar', icon: 'pi pi-times', command: () => updateStatus(data, 'cancelled') }
                                    ]"
                                    v-tooltip.top="'Alterar Status'"
                                />

                                <Button icon="pi pi-trash" @click="deletePurchaseOrder(data)" class="p-button-text p-button-sm text-red-600" v-tooltip.top="'Excluir'" :disabled="!canEdit(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
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