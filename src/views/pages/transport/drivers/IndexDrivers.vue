<script setup>
import DriverService from '@/service/DriverService';
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';
import { usePermissions } from '@/composables/usePermissions';

const router = useRouter();
const toast = useToast();
const { permissions, isAdmin, hasRole } = usePermissions();
const loading = ref(false);
const isLoadingDiv = ref(true);
const loadingButtonDelete = ref(false);
let dataIdBeingDeleted = ref(null);
const searchQuery = ref('');
const retrievedData = ref(null);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalRecords = ref(0);
const displayConfirmation = ref(false);

const closeConfirmation = () => {
    displayConfirmation.value = false;
};

const confirmDeletion = (id) => {
    displayConfirmation.value = true;
    dataIdBeingDeleted.value = id;
};

const getData = async (page = 1) => {
    loading.value = true;
    try {
        const response = await DriverService.getAllDrivers({
            page,
            limit: rowsPerPage.value,
            search: searchQuery.value
        });
        retrievedData.value = response.items;
        totalRecords.value = response.meta.totalItems;
        rowsPerPage.value = response.meta.itemsPerPage;
        isLoadingDiv.value = false;
    } catch (error) {
        isLoadingDiv.value = false;
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao carregar motoristas', 
            life: 3000 
        });
    } finally {
        loading.value = false;
    }
};

const deleteData = async () => {
    loadingButtonDelete.value = true;
    try {
        await DriverService.deleteDriver(dataIdBeingDeleted.value);
        retrievedData.value = retrievedData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
        closeConfirmation();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Motorista excluído com sucesso', life: 3000 });
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao excluir motorista', 
            life: 3000 
        });
    } finally {
        loadingButtonDelete.value = false;
    }
};

const onPageChange = (event) => {
    currentPage.value = event.page + 1;
    rowsPerPage.value = event.rows;
    getData(currentPage.value);
};

const debouncedSearch = debounce(() => {
    currentPage.value = 1;
    getData(currentPage.value);
}, 300);

watch(searchQuery, debouncedSearch);

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Motoristas</h5>
                    <router-link to="/transport/drivers/create" v-if="permissions.canCreate">
                        <Button label="Novo Motorista" class="mr-2 mb-2"><i class="pi pi-plus"></i></Button>
                    </router-link>
                </div>

                <DataTable
                    :value="retrievedData"
                    :paginator="true"
                    :rows="rowsPerPage"
                    :totalRecords="totalRecords"
                    dataKey="id"
                    :lazy="true"
                    :rowHover="true"
                    :loading="loading"
                    :first="(currentPage - 1) * rowsPerPage"
                    :onPage="onPageChange"
                    showGridlines
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="searchQuery" placeholder="Pesquisar motoristas..." />
                            </IconField>
                        </div>
                    </template>
                    <template #empty>Nenhum motorista encontrado.</template>
                    <template #loading>Carregando, por favor espere.</template>

                    <!-- <Column header="ID" style="min-width: 6rem">
                        <template #body="{ data }">
                            {{ data.id }}
                        </template>
                    </Column> -->

                    <Column header="Nome" style="min-width: 15rem">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.name }}</div>
                        </template>
                    </Column>

                    <Column header="Contacto" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div v-if="data.mobile" class="flex align-items-center gap-2">
                                <i class="pi pi-phone text-600"></i>
                                <span>{{ data.mobile }}</span>
                            </div>
                            <span v-else class="text-600">-</span>
                        </template>
                    </Column>

                    <!-- <Column header="Carta de Condução" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div v-if="data.document">
                                <Tag :value="data.document" severity="secondary" />
                            </div>
                            <span v-else class="text-600">-</span>
                        </template>
                    </Column>

                    <Column header="Data de Validade do Documento" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div v-if="data.document_expiry_date">
                                {{ moment(data.document_expiry_date).format('DD/MM/YYYY') }}
                            </div>
                            <span v-else class="text-600">-</span>
                        </template>
                    </Column> -->

                    <Column header="Status" style="min-width: 8rem">
                        <template #body="{ data }">
                            <Tag :value="data.is_active ? 'Ativo' : 'Inativo'" :severity="data.is_active ? 'success' : 'danger'" />
                        </template>
                    </Column>

                    <Column header="Data de Criação" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ moment(data.createdAt).format('DD/MM/YYYY HH:mm') }}
                        </template>
                    </Column>

                    <Column header="Ações" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <router-link :to="'/transport/drivers/' + data.id">
                                    <Button icon="pi pi-eye" class="p-button-text p-button-sm" v-tooltip.top="'Visualizar'" />
                                </router-link>
                                <router-link :to="'/transport/drivers/' + data.id + '/edit'" v-if="permissions.canEdit">
                                    <Button icon="pi pi-pencil" class="p-button-text p-button-sm" v-tooltip.top="'Editar'" />
                                </router-link>
                                <Button 
                                    v-if="permissions.canDelete"
                                    icon="pi pi-trash" 
                                    class="p-button-text p-button-sm text-red-600" 
                                    @click="confirmDeletion(data.id)"
                                    v-tooltip.top="'Excluir'" 
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog header="Confirmação" v-model:visible="displayConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja excluir este motorista?</span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Excluir" icon="pi pi-check" @click="deleteData" class="p-button-text" :loading="loadingButtonDelete" autofocus />
        </template>
    </Dialog>
</template>
