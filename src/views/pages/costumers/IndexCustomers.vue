<script setup>
import CustomerService from '@/service/CustomerService';
import TicketTypeService from '@/service/TicketTypeService';
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';

const toast = useToast();
const loading = ref(false);
const isLoadingDiv = ref(true);
const loadingButtonDelete = ref(false);
const dataIdBeingDeleted = ref(null);
const searchQuery = ref('');
const retrievedData = ref([]);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalRecords = ref(0);
const displayConfirmation = ref(false);
const ticketTypes = ref([]);

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
        const response = await CustomerService.getAllCustomers({
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
            detail: 'Erro ao carregar clientes',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const getTicketTypes = async () => {
    try {
        const response = await TicketTypeService.getAllTicketTypes({ limit: 1000 });
        ticketTypes.value = response.items.reduce((acc, type) => {
            acc[type.id] = type;
            return acc;
        }, {});
    } catch (error) {
        console.error('Erro ao carregar tipos de bilhete:', error);
    }
};

const deleteData = async () => {
    loadingButtonDelete.value = true;
    try {
        await CustomerService.deleteCustomer(dataIdBeingDeleted.value);
        retrievedData.value = retrievedData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente removido com sucesso',
            life: 3000
        });
        closeConfirmation();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao remover cliente',
            life: 3000
        });
    } finally {
        loadingButtonDelete.value = false;
    }
};

const onPageChange = (event) => {
    currentPage.value = event.page + 1;
    getData(currentPage.value);
};

const debouncedSearch = debounce(() => {
    currentPage.value = 1;
    getData();
}, 300);

watch(searchQuery, debouncedSearch);

onMounted(() => {
    getData();
    getTicketTypes();
});
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
                    <h5 class="m-0">Gestão de Clientes</h5>
                    <router-link to="/costumers/create">
                        <Button icon="pi pi-plus" label="Novo Cliente" />
                    </router-link>
                </div>

                <DataTable :value="retrievedData" :paginator="true" :rows="rowsPerPage" :totalRecords="totalRecords" :lazy="true" :loading="loading" @page="onPageChange" showGridlines>
                    <template #header>
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText v-model="searchQuery" placeholder="Pesquisar clientes..." />
                        </IconField>
                    </template>
                    <template #empty>Nenhum cliente encontrado.</template>

                    <Column header="Nº Cliente">
                        <template #body="{ data }">
                            <span class="font-medium">{{ data.customer_number }}</span>
                        </template>
                    </Column>

                    <Column header="Nome">
                        <template #body="{ data }">
                            {{ data.name }}
                        </template>
                    </Column>

                    <Column header="Email">
                        <template #body="{ data }">
                            {{ data.email }}
                        </template>
                    </Column>

                    <Column header="Celular">
                        <template #body="{ data }">
                            {{ data.mobile }}
                        </template>
                    </Column>

                    <Column header="NUIT">
                        <template #body="{ data }">
                            {{ data.nuit }}
                        </template>
                    </Column>

                    <Column header="Tipo de Bilhete">
                        <template #body="{ data }">
                            <Tag v-if="data.ticketType" :value="data.ticketType.code" severity="info" />
                        </template>
                    </Column>

                    <Column header="Registrado em">
                        <template #body="{ data }">
                            {{ moment(data.createdAt).format('DD/MM/YYYY') }}
                        </template>
                    </Column>

                    <Column header="Ações">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <router-link :to="'/costumers/' + data.id">
                                    <Button icon="pi pi-eye" class="p-button-text p-button-sm" v-tooltip.top="'Visualizar'" />
                                </router-link>
                                <router-link :to="'/costumers/' + data.id + '/edit'">
                                    <Button icon="pi pi-pencil" class="p-button-text p-button-sm" v-tooltip.top="'Editar'" />
                                </router-link>
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="confirmDeletion(data.id)" v-tooltip.top="'Excluir'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="displayConfirmation" :style="{ width: '350px' }" header="Confirmar" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza de que deseja excluir este cliente?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteData" :loading="loadingButtonDelete" />
        </template>
    </Dialog>
</template>