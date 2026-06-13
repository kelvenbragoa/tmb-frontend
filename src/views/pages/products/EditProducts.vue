<script setup>
import  CustomerService  from '@/service/CustomerService';
import ProductService  from '@/service/ProductService';
// import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { onBeforeMount, reactive, ref, onMounted, watch } from 'vue';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { useForm } from 'vee-validate';
// import { debounce } from 'lodash';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';
// import { object, string, number, date } from 'yup';
import * as yup from 'yup';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';

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
const departments = ref(null);
const isLoadingButton = ref(false);
const categories = ref(null);
const image_url = ref(null);

const schema = yup.object({
    name: yup.string().required().trim().label('Name'),
    price: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : Number(originalValue)))
        .typeError('Preço deve ser um número')
        .required('O preço é obrigatório')
        .positive('Preço deve ser maior que zero')
        .label('Preço'),
    description: yup.string().required().trim().label('description'),
    unique_code: yup.string().required().trim().label('unique_code'),
    category_id: yup.string().required().trim().label('category_id')
});
const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [description] = defineField('description');
const [name] = defineField('name');
const [price] = defineField('price');
const [unique_code] = defineField('unique_code');
const [category_id] = defineField('category_id');

const [_method] = defineField('_method');
const image = ref();

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

const onSubmit = handleSubmit((values) => {
    // if (image.value != null) {
    //     values.image = image.value;
    // }
    isLoadingButton.value = true;
    axios
        .patch(`${baseURL}/products/${router.currentRoute.value.params.id}`, values)
        .then(async (response) => {
            // resetForm();
            if (image.value != null) {
                const formData = new FormData();
                formData.append('file', image.value);

                await axios.post(`${baseURL}/products/${router.currentRoute.value.params.id}/upload-image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            router.back();
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Categoria criado com sucesso', life: 3000 });
        })
        .catch((error) => {
            isLoadingButton.value = false;
            toast.add({ severity: 'error', summary: `Erro}`, detail: `${error.response.data.message}`, life: 3000 });
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        })
        .finally(() => {
            isLoadingButton.value = false;
        });
});

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/products/${router.currentRoute.value.params.id}`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data;
            name.value = retriviedData.value.name;
            description.value = retriviedData.value.description;
            price.value = retriviedData.value.price;
            unique_code.value = retriviedData.value.unique_code;
            category_id.value = retriviedData.value.category_id;
            // image_url.value = retriviedData.value.image_url;
            _method.value = 'put';
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });

    axios
        .get(`${baseURL}/categories`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            categories.value = response.data.items;

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

const onFileUpload = (event) => {
    image.value = event.files[0];
    console.log(image.value);
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
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-12" v-else>
        <div class="w-full">
            <div class="card p-fluid">
                <div class="flex justify-content-left flex-column sm:flex-row">
                    <Button label="Voltar" class="mr-2 mb-2 w-auto" @click="goBackUsingBack"> <i class="pi pi-angle-left"></i> Voltar </Button>
                </div>
                <h5>Producto</h5>
                <small class="p-error">Os campos marcados * são considerados campos obrigatórios.</small>
                <form @submit.prevent="onSubmit">
                    <div class="field">
                        <label for="name">Nome</label>
                        <InputText v-model="name" id="name" placeholder="Nome do produto" :class="{ 'p-invalid': errors.name }" type="text" />
                        <small id="name-help" class="p-error">{{ errors.name }}</small>
                    </div>
                    <div class="field">
                        <label for="description">Descrição</label>
                        <InputText v-model="description" id="description" placeholder="Descrição" :class="{ 'p-invalid': errors.description }" type="description" />
                        <small id="description-help" class="p-error">{{ errors.description }}</small>
                    </div>
                    <div class="field">
                        <label for="price">Preço</label>
                        <InputNumber v-model="price" id="price" placeholder="Preço" :class="{ 'p-invalid': errors.price }" type="text" />
                        <small id="price-help" class="p-error">{{ errors.price }}</small>
                    </div>
                    <div class="field">
                        <label for="unique_code">Código Unico</label>
                        <InputText v-model="unique_code" id="unique_code" placeholder="Código Unico" :class="{ 'p-invalid': errors.unique_code }" type="text" />
                        <small id="unique_code-help" class="p-error">{{ errors.unique_code }}</small>
                    </div>

                    <div class="field">
                        <label for="name1">Categoria</label>
                        <!-- <Dropdown id="state" v-model="dropdownItem" :options="dropdownItems" optionLabel="name" placeholder="Select One"></Dropdown> -->
                        <Dropdown v-model="category_id" :options="categories" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.category_id }"></Dropdown>
                        <small id="category_id-help" class="p-error">{{ errors.category_id }}</small>
                    </div>
                    <div class="field">
                        <div class="mt-2">
                            <div v-if="retriviedData.image_url">
                                <img :src="storageURL + retriviedData.image_url" alt="Imagem do Produto" class="w-4 h-4 border border-gray-300 rounded-md shadow" />
                            </div>
                            <div v-else class="w-4 h-4 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-gray-500 text-sm">Sem imagem</div>
                        </div>
                        <label for="name1">Imagem</label>
                        <FileUpload mode="basic" name="image[]" accept="image/*" auto :maxFileSize="1000000" customUpload @uploader="onFileUpload" />
                    </div>

                    <Button type="submit" label="Submeter" class="mr-2 mb-2 w-auto" :disabled="isLoadingButton"></Button>
                    <ProgressSpinner style="width: 35px; height: 35px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
                </form>
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
