<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import SupplierService from '@/service/SupplierService';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// Estado
const loading = ref(false);
const suppliers = ref([]);
const totalRecords = ref(0);
const lazyParams = ref({});
const filters = reactive({
    global: { value: null, matchMode: 'contains' },
    name: { value: null, matchMode: 'contains' },
    email: { value: null, matchMode: 'contains' },
    status: { value: null, matchMode: 'equals' }
});

// Métodos
const loadSuppliers = async (event = {}) => {
    loading.value = true;
    
    const page = event.first ? Math.floor(event.first / event.rows) + 1 : 1;
    const limit = event.rows || 25;
    const search = filters.global.value || '';
    const status = filters.status.value || '';

    try {
        const response = await SupplierService.getAllSuppliers({
            page,
            limit,
            search,
            status
        });

        suppliers.value = response.items || [];
        totalRecords.value = response.meta?.totalItems || 0;

        lazyParams.value = { ...event };
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao carregar fornecedores',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

const onFilter = () => {
    loadSuppliers(lazyParams.value);
};

const clearFilters = () => {
    filters.global.value = null;
    filters.name.value = null;
    filters.email.value = null;
    filters.status.value = null;
    loadSuppliers();
};

const createSupplier = () => {
    router.push({ name: 'suppliers.create' });
};

const viewSupplier = (id) => {
    router.push({ name: 'suppliers.show', params: { id } });
};

const editSupplier = (id) => {
    router.push({ name: 'suppliers.edit', params: { id } });
};

const deleteSupplier = (supplier) => {
    confirm.require({
        message: `Tem certeza que deseja excluir o fornecedor "${supplier.name}"?`,
        header: 'Confirmar Exclusão',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-text p-button-text',
        acceptClass: 'p-button-danger',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Excluir',
        accept: async () => {
            try {
                await SupplierService.deleteSupplier(supplier.id);
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Fornecedor excluído com sucesso',
                    life: 3000
                });
                loadSuppliers(lazyParams.value);
            } catch (error) {
                console.error('Erro ao excluir fornecedor:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao excluir fornecedor',
                    life: 5000
                });
            }
        }
    });
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'inactive':
            return 'danger';
        default:
            return 'info';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'Ativo';
        case 'inactive':
            return 'Inativo';
        default:
            return status;
    }
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
};

const statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Ativo', value: 'active' },
    { label: 'Inativo', value: 'inactive' }
];

// Lifecycle
onMounted(() => {
    loadSuppliers();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Gestão de Fornecedores</h5>
                    <Button label="Novo Fornecedor" icon="pi pi-plus" @click="createSupplier" class="p-button-primary" />
                </div>

                <!-- Filtros -->
                <div class="grid mb-4">
                    <div class="col-12 md:col-4">
                        <div class="field">
                            <label for="search" class="font-medium">Pesquisar</label>
                            <InputText id="search" v-model="filters.global.value" placeholder="Nome, email..." @input="onFilter" class="w-full" />
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
                            <label class="font-medium">&nbsp;</label>
                            <div class="flex">
                                <Button label="Limpar" icon="pi pi-filter-slash" @click="clearFilters" class="p-button-outlined" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabela -->
                <DataTable
                    :value="suppliers"
                    :loading="loading"
                    :paginator="true"
                    :rows="25"
                    :totalRecords="totalRecords"
                    :lazy="true"
                    @page="loadSuppliers"
                    @sort="loadSuppliers"
                    pageLinkSize="3"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} fornecedores"
                    :rowsPerPageOptions="[10, 25, 50]"
                    responsiveLayout="scroll"
                    class="p-datatable-gridlines"
                >
                    <template #loading>
                        <div class="text-center py-4">
                            <ProgressSpinner style="width: 50px; height: 50px" />
                            <p class="mt-3">Carregando fornecedores...</p>
                        </div>
                    </template>

                    <template #empty>
                        <div class="text-center py-8">
                            <i class="pi pi-search" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                            <p class="mt-3 text-lg">Nenhum fornecedor encontrado</p>
                            <p class="text-600">Tente ajustar os filtros ou criar um novo fornecedor</p>
                        </div>
                    </template>

                    <Column field="name" header="Nome" sortable class="min-w-12rem">
                        <template #body="{ data }">
                            <div class="flex align-items-center">
                                <div>
                                    <div class="font-medium">{{ data.name }}</div>
                                    <div class="text-sm text-600">{{ data.company || '-' }}</div>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="email" header="Email" sortable class="min-w-12rem">
                        <template #body="{ data }">
                            <span>{{ data.email || '-' }}</span>
                        </template>
                    </Column>

                    <Column field="phone" header="Telefone" class="min-w-10rem">
                        <template #body="{ data }">
                            <span>{{ data.mobile || '-' }}</span>
                        </template>
                    </Column>

                    <Column field="nuit" header="NUIT" class="min-w-10rem">
                        <template #body="{ data }">
                            <span>{{ data.nuit || '-' }}</span>
                        </template>
                    </Column>

                    <!-- <Column field="status" header="Status" sortable class="min-w-8rem">
                        <template #body="{ data }">
                            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                        </template>
                    </Column> -->

                    <Column field="created_at" header="Criado em" sortable class="min-w-10rem">
                        <template #body="{ data }">
                            <span>{{ formatDate(data.created_at) }}</span>
                        </template>
                    </Column>

                    <Column header="Ações" class="min-w-12rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" @click="viewSupplier(data.id)" class="p-button-text p-button-sm" v-tooltip.top="'Visualizar'" />
                                <Button icon="pi pi-pencil" @click="editSupplier(data.id)" class="p-button-text p-button-sm" v-tooltip.top="'Editar'" />
                                <Button icon="pi pi-trash" @click="deleteSupplier(data)" class="p-button-text p-button-sm text-red-600" v-tooltip.top="'Excluir'" />
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
