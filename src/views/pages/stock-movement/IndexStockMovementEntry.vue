<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

// import { debounce } from 'lodash';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import { baseURL } from '@/service/APIConstant';
import * as yup from 'yup';
import { useForm } from 'vee-validate';

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
const displayCreateStock = ref(false);
const isLoadingButton = ref(false);
const stockcenters = ref([]);
const products = ref([]);

const schema = yup.object({
    stock_center_id: yup.string().required().trim().label('Name'),
    product_id: yup.string().required().trim().label('Description'),
    quantity: yup.number().typeError('A quantidade deve ser um número.').integer('A quantidade deve ser um número inteiro.').min(0, 'A quantidade não pode ser negativa.').required('A quantidade é obrigatória.').label('Quantidade'),

    min_quantity: yup
        .number()
        .typeError('A quantidade mínima deve ser um número.')
        .integer('A quantidade mínima deve ser um número inteiro.')
        .min(0, 'A quantidade mínima não pode ser negativa.')
        .required('A quantidade mínima é obrigatória.')
        .label('Quantidade Mínima'),
    unique_code: yup.string().required().trim().label('Codigo')
});
const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});
const [stock_center_id] = defineField('stock_center_id');
const [product_id] = defineField('product_id');
const [quantity] = defineField('quantity');
const [min_quantity] = defineField('min_quantity');
const [unique_code] = defineField('unique_code');

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

const closeCreateStock = () => {
    displayCreateStock.value = false;
};
const confirmCreateStock = () => {
    displayCreateStock.value = true;
};

const closeConfirmation = () => {
    displayConfirmation.value = false;
};
const confirmDeletion = (id) => {
    displayConfirmation.value = true;
    dataIdBeingDeleted.value = id;
};

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/stock-movement?page=${page}&stockMovementTypeId=1`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data.items;
            totalRecords.value = response.data.meta.totalItems;
            rowsPerPage.value = response.data.meta.itemsPerPage;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error.message}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};

const getDataProducts = async (page = 1) => {
    axios
        .get(`${baseURL}/products?page=${page}&limit=100`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            products.value = response.data.items;
            // totalRecords.value = response.data.meta.totalItems;
            // rowsPerPage.value = response.data.meta.itemsPerPage;
            // isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error.message}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};

const getDataStockCenters = async (page = 1) => {
    axios
        .get(`${baseURL}/stockcenters?page=${page}&limit=100`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            stockcenters.value = response.data.items;
            // totalRecords.value = response.data.meta.totalItems;
            // rowsPerPage.value = response.data.meta.itemsPerPage;
            // isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error.message}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};

const onSubmit = handleSubmit(async (values) => {
    // if (image.value != null) {
    //     values.image = image.value;
    // }
    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/stockcenterproducts`, values)
        .then(async (response) => {
            // if (image.value != null) {
            //     const formData = new FormData();
            //     formData.append('file', image.value);

            //     await axios.post(`${baseURL}/products/${response.data.id}/upload-image`, formData, {
            //         headers: {
            //             'Content-Type': 'multipart/form-data'
            //         }
            //     });
            // }
            getData();
            closeCreateStock();
            resetForm();
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Producto criado com sucesso', life: 3000 });
        })
        .catch((error) => {
            isLoadingButton.value = false;
            toast.add({ severity: 'error', summary: `Erro`, detail: `${error.response.data.message}`, life: 3000 });
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        })
        .finally(() => {
            isLoadingButton.value = false;
        });
});

const deleteData = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/stock-movement/${dataIdBeingDeleted.value}`)
        .then(() => {
            retriviedData.value = retriviedData.value.filter((data) => data.id !== dataIdBeingDeleted.value);
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
    getDataStockCenters();
    getDataProducts();
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
                <h5>Entrada de Stock</h5>
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
                            <a href="#" @click.prevent="confirmCreateStock()">
                                <Button label="Voltar" class="mr-2 mb-2"><i class="pi pi-plus"></i></Button>
                            </a>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="searchQuery" placeholder="Pesquisa" />
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
                            {{ data.product.name }}
                        </template>
                    </Column>
                    <Column header="Código" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.unique_code }}
                        </template>
                    </Column>
                    <Column header="Quantidade" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.quantity }}
                        </template>
                    </Column>
                    <Column header="Movimento" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.stock_movement_type.name }}
                        </template>
                    </Column>
                    <Column header="Centro de Stock" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.stock_center.name }}
                        </template>
                    </Column>
                    <!-- <Column header="Centro de Stock" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.stock_center.name }}
                        </template>
                    </Column> -->
                    <Column header="Data" dataType="date" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ moment(data.createdAt).format('DD-MM-YYYY H:mm') }}
                        </template>
                    </Column>
                    <Column header="Ações" style="min-width: 12rem">
                        <template #body="{ data }">
                            <!-- <router-link class="m-3" :to="'/stock-movement/' + data.id + '/edit'"><i class="pi pi-file-edit"></i></router-link>  -->
                            <router-link class="m-3" :to="'/stock-movement/' + data.id"><i class="pi pi-eye"></i></router-link>
                            <!-- <a class="m-3" href="#" @click.prevent="confirmDeletion(data.id)"><i class="pi pi-trash"></i></a> -->
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
            <Button label="Sim" icon="pi pi-check" @click="deleteData" class="p-button-text" autofocus />
        </template>
    </Dialog>

    <Dialog header="Entrada de Stock" v-model:visible="displayCreateStock" :style="{ width: '640px' }" :modal="true">
        <form @submit.prevent="onSubmit">
            <div class="card p-fluid">
                <div class="field">
                    <label for="name1">Centro de Stock</label>
                    <!-- <Dropdown id="state" v-model="dropdownItem" :options="dropdownItems" optionLabel="name" placeholder="Select One"></Dropdown> -->
                    <Dropdown v-model="stock_center_id" :options="stockcenters" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.stock_center_id }"></Dropdown>
                    <small id="stock_center_id-help" class="p-error">{{ errors.stock_center_id }}</small>
                </div>
                <div class="field">
                    <label for="name1">Produto</label>
                    <Dropdown v-model="product_id" :options="products" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.product_id }"></Dropdown>
                    <small id="product_id-help" class="p-error">{{ errors.product_id }}</small>
                </div>
                <div class="field">
                    <label for="quantity">Quantidade</label>
                    <InputNumber v-model="quantity" id="quantity" placeholder="Quantidade" :class="{ 'p-invalid': errors.quantity }" type="number" />
                    <small id="quantity-help" class="p-error">{{ errors.quantity }}</small>
                </div>
                <div class="field">
                    <label for="min_quantity">Stock Mínimo</label>
                    <InputNumber v-model="min_quantity" id="min_quantity" placeholder="Stock minimo" :class="{ 'p-invalid': errors.min_quantity }" type="number" />
                    <small id="min_quantity-help" class="p-error">{{ errors.min_quantity }}</small>
                </div>
                <div class="field">
                    <label for="unique_code">Código Unico</label>
                    <InputText v-model="unique_code" id="unique_code" placeholder="Código Unico" :class="{ 'p-invalid': errors.unique_code }" type="text" />
                    <small id="unique_code-help" class="p-error">{{ errors.unique_code }}</small>
                </div>
                <Button type="submit" label="Submeter" class="mr-2 mb-2 w-auto" :disabled="isLoadingButton"></Button>
                <ProgressSpinner style="width: 35px; height: 35px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
            </div>
        </form>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeCreateStock" class="p-button-text" />
        </template>
    </Dialog>
</template>
