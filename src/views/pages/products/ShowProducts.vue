<script setup>
import  CustomerService  from '@/service/CustomerService';
import ProductService  from '@/service/ProductService';
// import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { onBeforeMount, reactive, ref, onMounted, watch } from 'vue';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import axios from 'axios';

// import { debounce } from 'lodash';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import { baseURL, storageURL } from '@/service/ApiConstant';

import moment from 'moment';

const router = useRouter();
const toast = useToast();
const loading1 = ref(null);
const isLoadingDiv = ref(true);
const loadingButtonDelete = ref(false);
let dataIdBeingDeleted = ref(null);
const searchQuery = ref('');
const retriviedData = ref(null);
const currentPage = ref(1);
const rowsPerPage = ref(15);
const totalRecords = ref(0);
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

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/products/${router.currentRoute.value.params.id}`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};

const deleteData = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`/api/products/${dataIdBeingDeleted.value}`)
        .then(() => {
            retriviedData.value.data = retriviedData.value.data.filter((data) => data.id !== dataIdBeingDeleted.value);
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

const formattedPrice = (data) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(data.price);
  }

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
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-12" v-else>
        <div class="w-full">
            <div class="card">
                <div class="w-full mb-5">
                    <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
                </div>
                <!-- <p><strong>Nome:</strong> {{ retriviedData.name }}</p>
                <p><strong>Preço:</strong> {{ retriviedData.price }}</p>
                <p><strong>Código Unico:</strong> {{ retriviedData.unique_code }}</p>
                <p><strong>Descrição:</strong> {{ retriviedData.description }}</p>
                <p><strong>Data:</strong> {{ moment(retriviedData.createdAt).format('DD-MM-YYYY H:mm') }}</p>
                <div v-if="retriviedData.image_url">
                    <img :src="storageURL + retriviedData.image_url" alt="Product Image" class="w-3 h-3 object-cover border border-gray-300 rounded-md" />
                </div>
                <div v-else class="w-3 h-3 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-gray-500 text-sm">Sem imagem</div> -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-600">Nome</label>
                            <div class="mt-1 text-base text-gray-800 bg-gray-100 rounded-md px-3 py-2">{{ retriviedData.name }}</div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-600">Preço</label>
                            <div class="mt-1 text-base text-gray-800 bg-gray-100 rounded-md px-3 py-2">
                                {{ formattedPrice(retriviedData) }}
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-600">Código Único</label>
                            <div class="mt-1 text-base text-gray-800 bg-gray-100 rounded-md px-3 py-2">
                                {{ retriviedData.unique_code }}
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-600">Data de Criação</label>
                            <div class="mt-1 text-base text-gray-800 bg-gray-100 rounded-md px-3 py-2">
                                {{ moment(retriviedData.createdAt).format('DD-MM-YYYY HH:mm') }}
                            </div>
                        </div>
                    </div>

                    <!-- Imagem e descrição -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-600">Descrição</label>
                            <div class="mt-1 text-base text-gray-800 bg-gray-100 rounded-md px-3 py-2 whitespace-pre-line">
                                {{ retriviedData.description }}
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-600">Imagem</label>
                            <div class="mt-2">
                                <div v-if="retriviedData.image_url">
                                    <img :src="storageURL + retriviedData.image_url" alt="Imagem do Produto" class="w-4 h-4 border border-gray-300 rounded-md shadow" />
                                </div>
                                <div v-else class="w-4 h-4 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-gray-500 text-sm">Sem imagem</div>
                            </div>
                        </div>
                    </div>
                </div>
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
