<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import { baseURL } from '@/service/ApiConstant';
import moment from 'moment';
import axios from 'axios';

const router = useRouter();
const toast = useToast();
const isLoadingDiv = ref(true);
const loadingButtonDelete = ref(false);
let dataIdBeingDeleted = ref(null);
const searchQuery = ref('');
const retriviedData = ref(null);
const currentPage = ref(1);
const rowsPerPage = ref(0);
const totalRecords = ref(0);
const displayConfirmation = ref(false);

const getData = async (page = 1) => {
    // Mock data para impostos
    setTimeout(() => {
        const mockData = [
            { id: 1, name: 'IVA Padrão', rate: 17.0, type: 'IVA', status: true, createdAt: new Date('2024-01-10') },
            { id: 2, name: 'IVA Isento', rate: 0.0, type: 'IVA', status: true, createdAt: new Date('2024-01-10') },
            { id: 3, name: 'IRPS Categoria A', rate: 10.0, type: 'IRPS', status: true, createdAt: new Date('2024-01-11') },
            { id: 4, name: 'IRPS Categoria B', rate: 15.0, type: 'IRPS', status: true, createdAt: new Date('2024-01-11') },
            { id: 5, name: 'Selo do Estado', rate: 0.5, type: 'SELO', status: false, createdAt: new Date('2024-01-12') }
        ];

        const filteredData = searchQuery.value 
            ? mockData.filter((item) => 
                item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                item.type.toLowerCase().includes(searchQuery.value.toLowerCase())
              )
            : mockData;

        retriviedData.value = filteredData;
        totalRecords.value = filteredData.length;
        rowsPerPage.value = 10;
        isLoadingDiv.value = false;
    }, 500);
};

const deleteData = () => {
    loadingButtonDelete.value = true;
    axios
        .delete(`${baseURL}/settings/taxes/${dataIdBeingDeleted.value}`)
        .then(() => {
            retriviedData.value = retriviedData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            displayConfirmation.value = false;
            toast.add({ severity: 'success', summary: `Sucesso`, detail: 'Imposto apagado com sucesso', life: 3000 });
        })
        .catch((error) => {
            toast.add({ severity: 'error', summary: `Erro`, detail: `${error}`, life: 3000 });
        })
        .finally(() => {
            loadingButtonDelete.value = false;
        });
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
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Carregando" />
        </div>
    </div>
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <h5>Gestão de Impostos</h5>
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
                    :onPage="onPageChange"
                    showGridlines
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <router-link to="/settings/taxes/create">
                                <Button label="Novo Imposto" class="mr-2 mb-2"><i class="pi pi-plus"></i></Button>
                            </router-link>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="searchQuery" placeholder="Pesquisar impostos" />
                            </IconField>
                        </div>
                    </template>
                    <template #empty>Nenhum imposto encontrado.</template>
                    <template #loading>Carregando, por favor espere.</template>
                    
                    <Column field="id" header="ID" style="min-width: 8rem" />
                    <Column field="name" header="Nome" style="min-width: 12rem" />
                    <Column field="rate" header="Taxa (%)" style="min-width: 8rem">
                        <template #body="{ data }">
                            <span class="font-semibold">{{ data.rate }}%</span>
                        </template>
                    </Column>
                    <Column field="type" header="Tipo" style="min-width: 10rem">
                        <template #body="{ data }">
                            <Tag :value="data.type" severity="info"></Tag>
                        </template>
                    </Column>
                    <Column field="status" header="Status" style="min-width: 8rem">
                        <template #body="{ data }">
                            <Tag :value="data.status ? 'Ativo' : 'Inativo'" :severity="data.status ? 'success' : 'danger'"></Tag>
                        </template>
                    </Column>
                    <Column field="createdAt" header="Data Criação" dataType="date" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ moment(data.createdAt).format('DD/MM/YYYY HH:mm') }}
                        </template>
                    </Column>
                    <Column header="Ações" style="min-width: 12rem">
                        <template #body="{ data }">
                            <router-link class="m-3" :to="'/settings/taxes/' + data.id + '/edit'">
                                <i class="pi pi-file-edit text-primary"></i>
                            </router-link>
                            <router-link class="m-3" :to="'/settings/taxes/' + data.id">
                                <i class="pi pi-eye text-info"></i>
                            </router-link>
                            <a class="m-3" href="#" @click.prevent="displayConfirmation = true; dataIdBeingDeleted = data.id">
                                <i class="pi pi-trash text-danger"></i>
                            </a>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
    
    <Dialog header="Confirmação" v-model:visible="displayConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja apagar este imposto?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="displayConfirmation = false" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteData" class="p-button-text" autofocus :loading="loadingButtonDelete" />
        </template>
    </Dialog>
</template>
