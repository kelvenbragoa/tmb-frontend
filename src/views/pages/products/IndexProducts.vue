<script setup>
import ProductService from '@/service/ProductService';
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
        .get(`${baseURL}/products?page=${page}`, {
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
        .get(`${baseURL}/categories?page=${page}`, {
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
        .delete(`${baseURL}/products/${dataIdBeingDeleted.value}`)
        .then(() => {
            retriviedCostumerData.value = retriviedCostumerData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmation();
            toast.add({ severity: 'success', summary: `Sucesso`, detail: 'Produto apagado com sucesso', life: 3000 });
        })
        .catch((error) => {
            toast.add({ severity: 'error', summary: `Erro`, detail: `Erro ao apagar produto: ${error.message}`, life: 3000 });
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

const debouncedCostumerSearch = debounce(() => {
    getCostumerData(currentCostumerPage.value);
}, 300);

const debouncedCostumerCategorySearch = debounce(() => {
    getCostumerData(currentCostumerPage.value);
}, 300);

watch(searchCostumerQuery, debouncedCostumerSearch);

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
                    <TabPanel header="Artigos e Serviços">
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
                                    <router-link to="/products/create">
                                        <Button label="Novo Produto" class="mr-2 mb-2"><i class="pi pi-plus"></i></Button>
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
                            <Column header="Categoria" style="min-width: 12rem">
                                <template #body="{ data }">
                                    <!-- {{ data.category_id ? data.category.name : data.category_name }} -->
                                     {{ data.category_id ? data.category.name : data.category_name }}

                                </template>
                            </Column>
                            <Column header="Código Único" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.unique_code || data.sku || data.code || 'N/A' }}
                                </template>
                            </Column>
                            <Column header="Preço" style="min-width: 10rem">
                                <template #body="{ data }">
                                    <span class="font-semibold">
                                        {{ new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data.price || data.unit_price || 0) }}
                                    </span>
                                </template>
                            </Column>
                            <Column header="Descrição" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.description || 'Sem descrição' }}
                                </template>
                            </Column>
                            <Column header="Image" style="min-width: 12rem">
                                <template #body="{ data }">
                                    <div v-if="data.image_url">
                                        <img :src="storageURL + data.image_url" alt="Product Image" class="w-3 h-3 object-cover border border-gray-300 rounded-md" />
                                    </div>
                                    <div v-else class="w-3 h-3 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-gray-500 text-sm">Sem imagem</div>
                                </template>
                            </Column>
                            <Column header="Data" dataType="date" style="min-width: 10rem">
                                <template #body="{ data }">
                                    {{ moment(data.createdAt).format('DD-MM-YYYY H:mm') }}
                                </template>
                            </Column>
                            <Column header="Ações" style="min-width: 12rem">
                                <template #body="{ data }">
                                    <router-link class="m-3" :to="'/products/' + data.id + '/edit'"><i class="pi pi-file-edit"></i></router-link> <router-link class="m-3" :to="'/products/' + data.id"><i class="pi pi-eye"></i></router-link>
                                    <a class="m-3" href="#" @click.prevent="confirmDeletion(data.id)"><i class="pi pi-trash"></i></a>
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Categorias">
                        <DataTable
                            :value="retriviedCostumerCategoryData"
                            :paginator="true"
                            :rows="rowsPerPage"
                            :totalRecords="totalCostumerCategoryRecords"
                            dataKey="id"
                            :lazy="true"
                            :rowHover="true"
                            :loading="isLoadingDiv"
                            :first="(currentCostumerCategoryPage - 1) * rowsPerPage"
                            :onPage="onPageChangeCostumerCategory"
                            showGridlines
                        >
                            <template #header>
                                <div class="flex justify-content-between flex-column sm:flex-row">
                                    <router-link to="/categories/create">
                                        <Button label="Nova Categoria" class="mr-2 mb-2"><i class="pi pi-plus"></i></Button>
                                    </router-link>
                                    <IconField>
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="searchCostumerCategoryQuery" placeholder="Pesquisa" />
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
                            <Column header="Data" dataType="date" style="min-width: 10rem">
                                <template #body="{ data }">
                                    {{ moment(data.createdAt).format('DD-MM-YYYY H:mm') }}
                                </template>
                            </Column>
                            <Column header="Ações" style="min-width: 12rem">
                                <template #body="{ data }">
                                    <router-link class="m-3" :to="'/categories/' + data.id + '/edit'"><i class="pi pi-file-edit"></i></router-link> <router-link class="m-3" :to="'/categories/' + data.id"><i class="pi pi-eye"></i></router-link>
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
