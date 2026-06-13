<script setup>
import CustomerService from '@/service/CustomerService';
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';

const toast = useToast();
const isLoadingDiv = ref(true);
const loadingButtonDelete = ref(false);
const dataIdBeingDeleted = ref(null);
const searchCostumerQuery = ref('');
const retriviedCostumerData = ref([]);
const currentCostumerPage = ref(1);
const rowsPerPage = ref(10);
const totalCostumerRecords = ref(0);
const displayConfirmation = ref(false);

const closeConfirmation = () => {
    displayConfirmation.value = false;
};

const confirmDeletion = (id) => {
    displayConfirmation.value = true;
    dataIdBeingDeleted.value = id;
};

const getCostumerData = async (page = 1) => {
    isLoadingDiv.value = true;
    try {
        const response = await CustomerService.getAllCustomers(page, searchCostumerQuery.value);
        retriviedCostumerData.value = response.items || [];
        totalCostumerRecords.value = response.meta?.totalItems || 0;
        rowsPerPage.value = response.meta?.itemsPerPage || 10;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao carregar dados',
            life: 3000
        });
    } finally {
        isLoadingDiv.value = false;
    }
};

const deleteData = async () => {
    loadingButtonDelete.value = true;
    try {
        await CustomerService.deleteCustomer(dataIdBeingDeleted.value);
        retriviedCostumerData.value = retriviedCostumerData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
        closeConfirmation();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente excluído com sucesso', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir cliente', life: 3000 });
    } finally {
        loadingButtonDelete.value = false;
    }
};

const onPageChangeCostumer = (event) => {
    currentCostumerPage.value = event.page + 1;
    rowsPerPage.value = event.rows;
    getCostumerData(currentCostumerPage.value);
};

const debouncedCostumerSearch = debounce(() => {
    getCostumerData(1);
}, 300);

watch(searchCostumerQuery, debouncedCostumerSearch);

onMounted(() => {
    getCostumerData();
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
                <TabView>
                    <TabPanel header="Clientes">
                        <DataTable
                            :value="retriviedCostumerData"
                            :paginator="true"
                            :rows="rowsPerPage"
                            :totalRecords="totalCostumerRecords"
                            dataKey="id"
                            :lazy="true"
                            :rowHover="true"
                            :loading="isLoadingDiv"
                            :first="(currentCostumerPage - 1) * rowsPerPage"
                            :onPage="onPageChangeCostumer"
                            showGridlines
                        >
                            <template #header>
                                <div class="flex justify-content-between flex-column sm:flex-row">
                                    <router-link to="/costumers/create">
                                        <Button label="Adicionar Cliente" class="mr-2 mb-2"><i class="pi pi-plus"></i></Button>
                                    </router-link>
                                    <IconField>
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="searchCostumerQuery" placeholder="Pesquisa" />
                                    </IconField>
                                </div>
                            </template>
                            <template #empty>Nenhuma registro encontrado. </template>
                            <template #loading> Carregando, por favor espere. </template>
                            <Column header="ID" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.id }}
                                </template>
                            </Column>
                            <Column header="Name" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.name }}
                                </template>
                            </Column>
                            <Column header="Telefone" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.mobile }}
                                </template>
                            </Column>
                            <Column header="Email" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.email }}
                                </template>
                            </Column>
                            <Column header="NUIT" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.nuit || '-' }}
                                </template>
                            </Column>
                            <Column header="Data" dataType="date" style="min-width: 10rem">
                                <template #body="{ data }">
                                    {{ moment(data.createdAt).format('DD-MM-YYYY H:mm') }}
                                </template>
                            </Column>
                            <Column header="Ações" style="min-width: 12rem">
                                <template #body="{ data }">
                                    <router-link class="m-3" :to="'/costumers/' + data.id + '/edit'"><i class="pi pi-file-edit"></i></router-link> <router-link class="m-3" :to="'/costumers/' + data.id"><i class="pi pi-eye"></i></router-link>
                                    <a class="m-3" href="#" @click.prevent="confirmDeletion(data.id)"><i class="pi pi-trash"></i></a>
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
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
            <Button label="Sim" icon="pi pi-check" @click="deleteData" class="p-button-text" autofocus />
        </template>
    </Dialog>
</template>
