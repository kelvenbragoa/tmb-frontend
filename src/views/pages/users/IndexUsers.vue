<script setup>
import ProductService  from '@/service/ProductService';
import { onBeforeMount, reactive, ref, onMounted, watch } from 'vue';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';

// import { debounce } from 'lodash';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import { baseURL, storageURL } from '@/service/ApiConstant';

import moment from 'moment';
import axios from 'axios';

const router = useRouter();
const toast = useToast();
const loading1 = ref(null);
const isLoadingDiv = ref(true);
const loadingButtonDelete = ref(false);
let dataIdBeingDeleted = ref(null);
const searchCostumerQuery = ref('');
const searchCostumerCategoryQuery = ref('');
const retriviedCostumerData = ref(null);
const retriviedCostumerCategoryData = ref(null);
const currentCostumerPage = ref(1);
const currentCostumerCategoryPage = ref(1);
const rowsPerPage = ref(0);
const totalCostumerRecords = ref(0);
const totalCostumerCategoryRecords = ref(0);
const displayConfirmation = ref(false);

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

const closeConfirmation = () => {
    displayConfirmation.value = false;
};
const confirmDeletion = (id) => {
    displayConfirmation.value = true;
    dataIdBeingDeleted.value = id;
};

function getSeverity(status) {
    switch (status) {
        case 'unqualified':
            return 'danger';

        case 'qualified':
            return 'success';

        case 'new':
            return 'info';

        case 'negotiation':
            return 'warn';

        case 'renewal':
            return null;
    }
}

const getCostumerData = async (page = 1) => {
    axios
        .get(`${baseURL}/users?page=${page}`, {
            params: {
                query: searchCostumerQuery.value
            }
        })
        .then((response) => {
            retriviedCostumerData.value = response.data.items;
            totalCostumerRecords.value = response.data.meta.totalItems;
            rowsPerPage.value = response.data.meta.itemsPerPage;
            // isLoadingDiv.value = false;
        })
        .catch((error) => {
            // isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error.message}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};

const getCostumerCategoryData = async (page = 1) => {
    axios
        .get(`${baseURL}/costumer-category?page=${page}`, {
            params: {
                query: searchCostumerCategoryQuery.value
            }
        })
        .then((response) => {
            retriviedCostumerCategoryData.value = response.data.items;
            totalCostumerCategoryRecords.value = response.data.meta.totalItems;
            rowsPerPage.value = response.data.meta.itemsPerPage;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error.message}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};

const deleteData = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/users/${dataIdBeingDeleted.value}`)
        .then(() => {
            retriviedCostumerData.value = retriviedCostumerData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmation();
            toast.add({ severity: 'success', summary: `Sucesso`, detail: 'Sucesso ao apagar', life: 3000 });
        })
        .catch((error) => {
            toast.add({ severity: 'error', summary: `Erro`, detail: `${error}`, life: 3000 });
            loadingButtonDelete.value = false;
        })
        .finally(() => {
            loadingButtonDelete.value = false;
        });
};

const onPageChangeCostumer = (event) => {
    currentCostumerPage.value = event.page + 1;
    rowsPerPage.value = event.rows;
    getCostumerData(currentCostumerPage.value);
};

const onPageChangeCostumerCategory = (event) => {
    currentCostumerCategoryPage.value = event.page + 1;
    rowsPerPage.value = event.rows;
    getCostumerCategoryData(currentCostumerCategoryPage.value);
};

const debouncedusersearch = debounce(() => {
    getCostumerData(currentCostumerPage.value);
}, 300);

const debouncedCostumerCategorySearch = debounce(() => {
    getCostumerData(currentCostumerPage.value);
}, 300);

watch(searchCostumerQuery, debouncedusersearch);

watch(searchCostumerCategoryQuery, debouncedCostumerCategorySearch);

onMounted(() => {
    getCostumerData();
    getCostumerCategoryData();
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
                    <TabPanel header="Usuários">
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
                                    <router-link to="/users/create">
                                        <Button label="Voltar" class="mr-2 mb-2"><i class="pi pi-plus"></i></Button>
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
                            <!-- <Column header="ID" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.id }}
                                </template>
                            </Column> -->
                            <Column header="Name" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.name }}
                                </template>
                            </Column>
                            <Column header="Usuario" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.username }}
                                </template>
                            </Column>
                            <Column header="Nível" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.role }}
                                </template>
                            </Column>
                            <Column header="Data" dataType="date" style="min-width: 10rem">
                                <template #body="{ data }">
                                    {{ moment(data.createdAt).format('DD-MM-YYYY H:mm') }}
                                </template>
                            </Column>
                            <Column header="Ações" style="min-width: 12rem">
                                <template #body="{ data }">
                                    <router-link class="m-3" :to="'/users/' + data.id + '/edit'"><i class="pi pi-file-edit"></i></router-link> <router-link class="m-3" :to="'/users/' + data.id"><i class="pi pi-eye"></i></router-link>
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
