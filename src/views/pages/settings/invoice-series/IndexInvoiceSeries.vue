<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import { FilterMatchMode } from 'primevue/api';
import moment from 'moment';

// Services
import InvoiceSeriesService from '@/service/InvoiceSeriesService';
import InvoiceSeriesDemoService from '@/service/InvoiceSeriesDemoService';

const toast = useToast();
const isLoadingDiv = ref(true);
const loadingButtonDelete = ref(false);
let dataIdBeingDeleted = ref(null);
const searchQuery = ref('');
const retriviedData = ref([]);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalRecords = ref(0);
const displayConfirmation = ref(false);

// Filtros
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    prefix: { value: null, matchMode: FilterMatchMode.CONTAINS },
    document_type: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Estatísticas
const statistics = ref({
    total: 0,
    active: 0,
    inactive: 0,
    byDocumentType: []
});

const getData = async (page = 1) => {
    try {
        isLoadingDiv.value = true;
        
        const requestFilters = {
            page,
            limit: rowsPerPage.value,
            search: searchQuery.value || undefined
        };

        // Usar service demo como fallback
        let response;
        try {
            response = await InvoiceSeriesService.getSeriesList(requestFilters);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            response = await InvoiceSeriesDemoService.getSeriesList(requestFilters);
        }

        retriviedData.value = response.data || [];
        totalRecords.value = response.total || 0;
        currentPage.value = page;

        // Carregar estatísticas
        await loadStatistics();

    } catch (error) {
        console.error('Erro ao carregar séries:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar séries de faturação',
            life: 3000
        });
    } finally {
        isLoadingDiv.value = false;
    }
};

const loadStatistics = async () => {
    try {
        let summaryData;
        try {
            summaryData = await InvoiceSeriesService.getSeriesSummary();
        } catch (error) {
            summaryData = await InvoiceSeriesDemoService.getSeriesSummary();
        }

        // Calcular estatísticas totais
        statistics.value.total = retriviedData.value.length;
        statistics.value.active = retriviedData.value.filter((s) => s.status === 'active').length;
        statistics.value.inactive = retriviedData.value.filter((s) => s.status !== 'active').length;
        statistics.value.byDocumentType = summaryData || [];

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
};

const deleteData = async () => {
    try {
        loadingButtonDelete.value = true;

        // Usar service demo como fallback
        try {
            await InvoiceSeriesService.deleteSeries(dataIdBeingDeleted.value);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            await InvoiceSeriesDemoService.deleteSeries(dataIdBeingDeleted.value);
        }

        // Remover da lista local
        retriviedData.value = retriviedData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
        displayConfirmation.value = false;
        
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Série de faturação apagada com sucesso', 
            life: 3000 
        });

        // Recarregar estatísticas
        await loadStatistics();

    } catch (error) {
        console.error('Erro ao apagar série:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.message || 'Erro ao apagar série de faturação', 
            life: 3000 
        });
    } finally {
        loadingButtonDelete.value = false;
    }
};

const toggleActiveSeries = async (seriesId) => {
    try {
        let updatedSeries;
        try {
            updatedSeries = await InvoiceSeriesService.toggleActiveSeries(seriesId);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            updatedSeries = await InvoiceSeriesDemoService.toggleActiveSeries(seriesId);
        }

        // Atualizar na lista local
        const index = retriviedData.value.findIndex((s) => s.id === seriesId);
        if (index !== -1) {
            retriviedData.value[index] = updatedSeries;
        }

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Série ${updatedSeries.is_active ? 'ativada' : 'desativada'} com sucesso`,
            life: 3000
        });

        // Recarregar estatísticas
        await loadStatistics();

    } catch (error) {
        console.error('Erro ao alternar série:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao alternar status da série',
            life: 3000
        });
    }
};

const getDocumentTypeLabel = (type) => {
    const labels = {
        quotation: 'Cotação',
        cash_sale: 'Venda a Dinheiro',
        invoice: 'Fatura',
        receipt_payment: 'Pagamento de Recibo',
        invoice_payment: 'Pagamento de Fatura'
    };
    return labels[type] || type;
};

const getDocumentTypeSeverity = (type) => {
    const severities = {
        quotation: 'info',
        cash_sale: 'success',
        invoice: 'primary',
        receipt_payment: 'warning',
        invoice_payment: 'secondary'
    };
    return severities[type] || 'info';
};

const getStatusSeverity = (status) => {
    return status === 'active' ? 'success' : 'secondary';
};

const getActiveBadgeSeverity = (isActive) => {
    return isActive ? 'success' : 'danger';
};

const formatNextNumber = (data) => {
    const paddedNumber = String(data.current_number).padStart(data.number_padding || 3, '0');
    return `${data.prefix}${data.separator || '/'}${paddedNumber}`;
};

const confirmDelete = (id) => {
    dataIdBeingDeleted.value = id;
    displayConfirmation.value = true;
};

const onPageChange = (event) => {
    currentPage.value = event.page + 1;
    rowsPerPage.value = event.rows;
    getData(currentPage.value);
};

const debouncedSearch = debounce(() => {
    getData(currentPage.value);
}, 300);

watch(searchQuery, debouncedSearch);

onMounted(() => {
    getData();
});
</script>

<template>
    <!-- Loading State -->
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner 
                style="width: 50px; height: 50px" 
                strokeWidth="8" 
                fill="var(--surface-ground)" 
                animationDuration=".5s" 
                aria-label="Carregando séries de faturação" 
            />
        </div>
    </div>

    <!-- Main Content -->
    <div class="grid" v-else>
        <!-- Statistics Cards -->
        <div class="col-12">
            <div class="grid">
                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Total de Séries</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.total }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-list text-blue-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Séries Ativas</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.active }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-check-circle text-green-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Séries Inativas</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.inactive }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-times-circle text-orange-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Tipos de Documento</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.byDocumentType.length }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-folder text-purple-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5 class="m-0">Gestão de Séries de Faturação</h5>
                    <router-link to="/settings/invoice-series/create">
                        <Button 
                            label="Nova Série" 
                            icon="pi pi-plus" 
                            class="p-button-primary"
                            size="small"
                        />
                    </router-link>
                </div>

                <DataTable
                    :value="retriviedData"
                    :paginator="true"
                    :rows="rowsPerPage"
                    :totalRecords="totalRecords"
                    dataKey="id"
                    :lazy="true"
                    :rowHover="true"
                    :loading="isLoadingDiv"
                    :first="(currentPage - 1) * rowsPerPage"
                    @page="onPageChange"
                    showGridlines
                    stripedRows
                    responsiveLayout="scroll"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <div class="flex align-items-center">
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText 
                                        v-model="searchQuery" 
                                        placeholder="Pesquisar séries..." 
                                        class="w-full sm:w-auto"
                                    />
                                </IconField>
                            </div>
                        </div>
                    </template>
                    
                    <template #empty>
                        <div class="text-center py-4">
                            <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                            <p class="text-600 font-medium">Nenhuma série de faturação encontrada</p>
                            <router-link to="/settings/invoice-series/create">
                                <Button label="Criar primeira série" icon="pi pi-plus" class="p-button-sm" />
                            </router-link>
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center py-4">
                            <ProgressSpinner style="width: 30px; height: 30px" />
                            <p class="text-600 mt-2">Carregando séries...</p>
                        </div>
                    </template>
                    
                    <Column field="id" header="ID" sortable style="min-width: 6rem">
                        <template #body="{ data }">
                            <span class="font-semibold text-primary">#{{ data.id }}</span>
                        </template>
                    </Column>

                    <Column field="name" header="Nome" sortable style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ data.name }}</span>
                                <small class="text-600" v-if="data.description">{{ data.description }}</small>
                            </div>
                        </template>
                    </Column>

                    <Column field="document_type" header="Tipo de Documento" sortable style="min-width: 10rem">
                        <template #body="{ data }">
                            <Tag 
                                :value="getDocumentTypeLabel(data.document_type)" 
                                :severity="getDocumentTypeSeverity(data.document_type)"
                                class="font-semibold"
                            />
                        </template>
                    </Column>

                    <Column field="prefix" header="Prefixo" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            <Tag :value="data.prefix" severity="info" class="font-semibold" />
                        </template>
                    </Column>

                    <Column field="nextNumber" header="Próximo Número" sortable style="min-width: 10rem">
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ data.nextNumber || formatNextNumber(data) }}</span>
                                <small class="text-600">Atual: {{ data.current_number }}</small>
                            </div>
                        </template>
                    </Column>

                    <Column field="status" header="Status" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            <Tag 
                                :value="data.status === 'active' ? 'Ativa' : 'Inativa'" 
                                :severity="getStatusSeverity(data.status)"
                                class="font-semibold"
                            />
                        </template>
                    </Column>

                    <Column field="is_active" header="Série Ativa" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            <Tag 
                                :value="data.is_active ? 'Sim' : 'Não'" 
                                :severity="getActiveBadgeSeverity(data.is_active)"
                                class="font-semibold"
                            />
                        </template>
                    </Column>

                    <Column field="created_at" header="Data de Criação" sortable style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span>{{ moment(data.created_at).format('DD/MM/YYYY') }}</span>
                                <small class="text-600">{{ moment(data.created_at).format('HH:mm') }}</small>
                            </div>
                        </template>
                    </Column>

                    <Column header="Ações" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <router-link :to="`/settings/invoice-series/${data.id}`">
                                    <Button 
                                        icon="pi pi-eye" 
                                        class="p-button-rounded p-button-text p-button-sm" 
                                        v-tooltip.top="'Visualizar'"
                                    />
                                </router-link>
                                <router-link :to="`/settings/invoice-series/${data.id}/edit`">
                                    <Button 
                                        icon="pi pi-pencil" 
                                        class="p-button-rounded p-button-text p-button-sm" 
                                        severity="warning"
                                        v-tooltip.top="'Editar'"
                                    />
                                </router-link>
                                <Button 
                                    :icon="data.is_active ? 'pi pi-times' : 'pi pi-check'" 
                                    class="p-button-rounded p-button-text p-button-sm" 
                                    :severity="data.is_active ? 'danger' : 'success'"
                                    @click="toggleActiveSeries(data.id)"
                                    v-tooltip.top="data.is_active ? 'Desativar' : 'Ativar'"
                                />
                                <Button 
                                    icon="pi pi-trash" 
                                    class="p-button-rounded p-button-text p-button-sm" 
                                    severity="danger"
                                    @click="confirmDelete(data.id)"
                                    :disabled="data.is_active"
                                    v-tooltip.top="data.is_active ? 'Não é possível excluir série ativa' : 'Excluir'"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <Dialog 
        header="Confirmar Exclusão" 
        v-model:visible="displayConfirmation" 
        :style="{ width: '450px' }" 
        :modal="true"
        class="p-fluid"
    >
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--yellow-500)" />
            <span>
                Tem certeza que deseja excluir esta série de faturação? 
                <br><br>
                <strong>Esta ação não pode ser desfeita.</strong>
            </span>
        </div>
        
        <template #footer>
            <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                @click="displayConfirmation = false" 
                class="p-button-text" 
            />
            <Button 
                label="Excluir" 
                icon="pi pi-check" 
                @click="deleteData" 
                severity="danger"
                autofocus 
                :loading="loadingButtonDelete" 
            />
        </template>
    </Dialog>
</template>
