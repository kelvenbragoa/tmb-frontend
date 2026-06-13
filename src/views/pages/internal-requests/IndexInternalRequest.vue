<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';

// Services
import InternalRequestService from '@/service/InternalRequestService';

const router = useRouter();
const toast = useToast();

// State
const loading = ref(false);
const requests = ref([]);
const totalRecords = ref(0);
const first = ref(0);
const rows = ref(10);
const searchQuery = ref('');
const selectedStatus = ref('');
const selectedPriority = ref('');

// Summary statistics
const summary = ref({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    total: 0
});



// Options
const statusOptions = computed(() => InternalRequestService.getStatusOptions());
const priorityOptions = computed(() => InternalRequestService.getPriorityOptions());

// Methods
const loadRequests = async (page = 1) => {
    try {
        loading.value = true;
        
        const params = {
            page,
            limit: rows.value
        };

        if (searchQuery.value) {
            params.search = searchQuery.value;
        }
        if (selectedStatus.value) {
            params.status = selectedStatus.value;
        }
        if (selectedPriority.value) {
            params.priority = selectedPriority.value;
        }

        const response = await InternalRequestService.getInternalRequests(params);
        
        requests.value = response.items || [];
        totalRecords.value = response.meta?.totalItems || 0;
        
        // Load summary
        await loadSummary();
    } catch (error) {
        console.error('Erro ao carregar requisições:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar requisições internas',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const loadSummary = async () => {
    try {
        const summaryData = await InternalRequestService.getInternalRequestsSummary();
        summary.value = {
            ...summaryData,
            total: Object.values(summaryData).reduce((sum, count) => sum + count, 0)
        };
    } catch (error) {
        console.error('Erro ao carregar resumo:', error);
    }
};

const onPage = (event) => {
    first.value = event.first;
    rows.value = event.rows;
    const page = Math.floor(event.first / event.rows) + 1;
    loadRequests(page);
};

const debouncedSearch = debounce(() => {
    first.value = 0;
    loadRequests(1);
}, 300);

const onSearch = () => {
    debouncedSearch();
};

const onFilterChange = () => {
    first.value = 0;
    loadRequests(1);
};

const clearFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = '';
    selectedPriority.value = '';
    first.value = 0;
    loadRequests(1);
};

// Navigation
const goToCreate = () => {
    router.push('/internal-requests/create');
};

const goToShow = (id) => {
    router.push(`/internal-requests/${id}`);
};

const goToEdit = (id) => {
    router.push(`/internal-requests/${id}/edit`);
};

// Actions
const duplicateRequest = async (request) => {
    try {
        const duplicated = await InternalRequestService.duplicateInternalRequest(request.id);
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Requisição duplicada: ${duplicated.request_number}`,
            life: 3000
        });
        loadRequests(Math.floor(first.value / rows.value) + 1);
    } catch (error) {
        console.error('Erro ao duplicar requisição:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao duplicar requisição',
            life: 3000
        });
    }
};

// Utility methods
const getStatusLabel = (status) => InternalRequestService.getStatusLabel(status);
const getStatusSeverity = (status) => InternalRequestService.getStatusSeverity(status);
const getPriorityLabel = (priority) => InternalRequestService.getPriorityLabel(priority);
const getPrioritySeverity = (priority) => InternalRequestService.getPrioritySeverity(priority);
const formatCurrency = (value) => InternalRequestService.formatCurrency(value);
const formatDate = (date) => InternalRequestService.formatDate(date);

onMounted(() => {
    loadRequests();
});
</script>

<template>
    <div class="card">
        <div class="flex justify-content-between align-items-center mb-3">
            <h3>Gestão de Requisições Internas</h3>
            <Button label="Nova Requisição" icon="pi pi-plus" @click="goToCreate" />
        </div>

        <!-- Filtros -->
        <div class="grid mb-3">
            <div class="col-12 md:col-4">
                <div class="p-fluid">
                    <label for="search">Pesquisar</label>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText id="search" v-model="searchQuery" placeholder="Número, título..." @input="onSearch" />
                    </IconField>
                </div>
            </div>

            <div class="col-12 md:col-3">
                <div class="p-fluid">
                    <label for="statusFilter">Status</label>
                    <Dropdown id="statusFilter" v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Todos os status" :showClear="true" @change="onFilterChange" />
                </div>
            </div>

            <div class="col-12 md:col-3">
                <div class="p-fluid">
                    <label for="priorityFilter">Prioridade</label>
                    <Dropdown id="priorityFilter" v-model="selectedPriority" :options="priorityOptions" optionLabel="label" optionValue="value" placeholder="Todas as prioridades" :showClear="true" @change="onFilterChange" />
                </div>
            </div>

            <div class="col-12 md:col-2">
                <div class="p-fluid">
                    <label>&nbsp;</label>
                    <Button label="Limpar" icon="pi pi-refresh" outlined @click="clearFilters" />
                </div>
            </div>
        </div>

        <!-- Tabela de Requisições -->
        <DataTable
            :value="requests"
            :loading="loading"
            :paginator="true"
            :rows="rows"
            :totalRecords="totalRecords"
            :lazy="true"
            :first="first"
            @page="onPage"
            dataKey="id"
            :rowHover="true"
            responsiveLayout="scroll"
            :globalFilterFields="['request_number', 'title']"
            showGridlines
        >
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <span class="text-xl font-bold"> Total: {{ totalRecords }} requisições</span>
                </div>
            </template>

            <template #empty>
                <div class="text-center p-4">
                    <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                    <p class="text-600 text-lg">Nenhuma requisição encontrada</p>
                    <Button label="Criar requisição" icon="pi pi-plus" @click="goToCreate" />
                </div>
            </template>

            <template #loading> Carregando requisições...</template>

            <Column field="request_number" header="Número" sortable style="min-width: 150px">
                <template #body="{ data }">
                    <div class="flex align-items-center">
                        <i class="pi pi-list mr-2 text-500"></i>
                        <span class="font-semibold">{{ data.request_number }}</span>
                    </div>
                </template>
            </Column>

            <Column field="title" header="Título" sortable style="min-width: 200px">
                <template #body="{ data }">
                    <div>
                        <div class="font-semibold">{{ data.title || 'Título não informado' }}</div>
                        <div class="text-sm text-500" v-if="data.requestedByUser">Por: {{ data.requestedByUser.name }}</div>
                    </div>
                </template>
            </Column>

            <Column field="request_date" header="Data Requisição" sortable style="min-width: 120px">
                <template #body="{ data }">
                    {{ formatDate(data.request_date) }}
                </template>
            </Column>

            <Column field="required_date" header="Data Necessária" sortable style="min-width: 120px">
                <template #body="{ data }">
                    <span v-if="data.required_date" :class="{ 'text-red-500': new Date(data.required_date) < new Date() && data.status !== 'completed' }">
                        {{ formatDate(data.required_date) }}
                    </span>
                    <span v-else class="text-500">Não definida</span>
                </template>
            </Column>

            <Column field="total" header="Valor Total" sortable style="min-width: 120px">
                <template #body="{ data }">
                    <span class="font-bold text-primary">
                        {{ formatCurrency(data.total) }}
                    </span>
                </template>
            </Column>

            <Column field="items" header="Items" style="min-width: 80px">
                <template #body="{ data }">
                    {{ data.items?.length || 0 }}
                </template>
            </Column>

            <Column field="priority" header="Prioridade" style="min-width: 120px">
                <template #body="{ data }">
                    <Tag :value="getPriorityLabel(data.priority)" :severity="getPrioritySeverity(data.priority)" />
                </template>
            </Column>

            <Column field="status" header="Status" style="min-width: 120px">
                <template #body="{ data }">
                    <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                </template>
            </Column>

            <Column header="Ações" :exportable="false" style="min-width: 120px">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button icon="pi pi-eye" outlined rounded @click="goToShow(data.id)" v-tooltip="'Ver detalhes'" />
                        <Button icon="pi pi-pencil" outlined rounded @click="goToEdit(data.id)" v-tooltip="'Editar requisição'" :disabled="data.status !== 'pending'" />
                        <Button icon="pi pi-copy" outlined rounded severity="info" @click="duplicateRequest(data)" v-tooltip="'Duplicar requisição'" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Informações de Paginação -->
        <div class="flex justify-content-between align-items-center mt-3">
            <small class="text-500"> Exibindo {{ Math.min(Math.floor(first / rows) * rows + 1, totalRecords) }} a {{ Math.min((Math.floor(first / rows) + 1) * rows, totalRecords) }} de {{ totalRecords }} registros</small>
            <small class="text-500"> Página {{ Math.floor(first / rows) + 1 }} de {{ Math.ceil(totalRecords / rows) }}</small>
        </div>
    </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.cursor-pointer:hover {
    text-decoration: underline;
}
</style>
