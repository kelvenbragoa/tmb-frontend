<script setup>
import RouteTicketService from '@/service/RouteTicketService';
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';

const toast = useToast();
const loading = ref(false);
const isLoadingDiv = ref(true);
const searchQuery = ref('');
const retrievedData = ref([]);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalRecords = ref(0);
let dataIdBeingDeleted = ref(null);
const displayConfirmation = ref(false);
const loadingButtonDelete = ref(false);


const confirmDeletion = (id) => {
    displayConfirmation.value = true;
    dataIdBeingDeleted.value = id;
};
const closeConfirmation = () => {
    displayConfirmation.value = false;
};

const getData = async (page = 1) => {
    loading.value = true;
    try {
        const response = await RouteTicketService.getAllRouteTickets({
            page,
            limit: rowsPerPage.value,
            search: searchQuery.value
        });
        retrievedData.value = response.items;
        totalRecords.value = response.meta.totalItems;
        isLoadingDiv.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar bilhetes de rota',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const deleteData = async () => {
    loadingButtonDelete.value = true;
    try {
        await RouteTicketService.deleteRouteTicket(dataIdBeingDeleted.value);
        retrievedData.value = retrievedData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
        closeConfirmation();
        toast.add({ severity: 'success', summary: `Sucesso`, detail: 'Sucesso ao apagar', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: `Erro`, detail: `${error.response?.data?.message || error.message}`, life: 3000 });
    } finally {
        loadingButtonDelete.value = false;
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const onPageChange = (event) => {
    currentPage.value = event.page + 1;
    getData(currentPage.value);
};

const debouncedSearch = debounce(() => {
    currentPage.value = 1;
    getData(currentPage.value);
}, 300);

watch(searchQuery, debouncedSearch);
onMounted(() => getData());
</script>

<template>
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>
    </div>
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Bilhetes por Rota</h5>
                    <router-link to="/transport/route-tickets/create">
                        <Button label="Novo Bilhete" icon="pi pi-plus" />
                    </router-link>
                </div>

                <DataTable :value="retrievedData" :paginator="true" :rows="rowsPerPage" :totalRecords="totalRecords" :lazy="true" :loading="loading" @page="onPageChange" showGridlines>
                    <template #header>
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText v-model="searchQuery" placeholder="Pesquisar..." />
                        </IconField>
                    </template>
                    <template #empty>Nenhum bilhete encontrado.</template>

                    <Column header="Rota">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.route?.name }}</div>
                            <div class="text-sm text-600">{{ data.route?.origin }} → {{ data.route?.destination }}</div>
                        </template>
                    </Column>

                    <Column header="Tipo de Bilhete">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <Tag :value="data.ticketType?.code" severity="info" />
                                <span>{{ data.ticketType?.name }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column header="Preço">
                        <template #body="{ data }">
                            <span class="font-medium">{{ formatCurrency(data.price) }}</span>
                        </template>
                    </Column>

                    <Column header="Preço da Multa">
                        <template #body="{ data }">
                            <span class="font-medium">{{ formatCurrency(data.penalty_price) }}</span>
                        </template>
                    </Column>

                    <Column header="Status">
                        <template #body="{ data }">
                            <Tag :value="data.is_active ? 'Ativo' : 'Inativo'" :severity="data.is_active ? 'success' : 'danger'" />
                        </template>
                    </Column>

                    <Column header="Ações">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <router-link :to="'/transport/route-tickets/' + data.id">
                                    <Button icon="pi pi-eye" class="p-button-text p-button-sm" />
                                </router-link>
                                <router-link :to="'/transport/route-tickets/' + data.id + '/edit'">
                                    <Button icon="pi pi-pencil" class="p-button-text p-button-sm" />
                                </router-link>
                                <Button icon="pi pi-trash" class="p-button-text p-button-sm text-red-600" @click="confirmDeletion(data.id)" v-tooltip.top="'Excluir'" />
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
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteData" class="p-button-text" :loading="loadingButtonDelete" autofocus />
        </template>
    </Dialog>
</template>