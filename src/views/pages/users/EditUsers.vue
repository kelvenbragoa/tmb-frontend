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
import { baseURL, storageURL } from '@/service/APIConstant';
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

const schema = yup.object({
    name: yup.string().required().trim().label('Name'),
    username: yup.string().required().trim().label('Username'),
    password: yup.string().required().trim().label('Password'),
    confirmPassword: yup
        .string()
        .required()
        .trim()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .label('Confirm Password')
});
const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});
const [password] = defineField('password');
const [confirmPassword] = defineField('confirmPassword');
const [name] = defineField('name');
const [username] = defineField('username');
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
    if (image.value != null) {
        values.image = image.value;
    }
    isLoadingButton.value = true;
    axios
        .patch(`${baseURL}/users/${router.currentRoute.value.params.id}`, values)
        .then((response) => {
            // resetForm();
            router.back();
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Usuario criado com sucesso', life: 3000 });
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
        .get(`${baseURL}/users/${router.currentRoute.value.params.id}`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data;
            name.value = retriviedData.value.name;
            username.value = retriviedData.value.username;
            // passowr.value = retriviedData.value.passowr;
            _method.value = 'put';
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
        .delete(`/api/users/${dataIdBeingDeleted.value}`)
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
                <h5>Usuario</h5>
                <small class="p-error">Os campos marcados * são considerados campos obrigatórios.</small>
                <form @submit.prevent="onSubmit">
                    <div class="field">
                        <label for="name">Nome</label>
                        <InputText v-model="name" id="name" readonly placeholder="Nome do Usuário" :class="{ 'p-invalid': errors.name }" type="text" />
                        <small id="name-help" class="p-error">{{ errors.name }}</small>
                    </div>
                    <div class="field">
                        <label for="username">Usuario</label>
                        <InputText v-model="username" id="username" readonly placeholder="username" :class="{ 'p-invalid': errors.username }" type="username" />
                        <small id="username-help" class="p-error">{{ errors.username }}</small>
                    </div>
                    <div class="field">
                        <label for="password">Password</label>
                        <InputText v-model="password" id="password" placeholder="Password" :class="{ 'p-invalid': errors.password }" type="password" />
                        <small id="password-help" class="p-error">{{ errors.password }}</small>
                    </div>
                    <div class="field">
                        <label for="confirm-password">Confirmar palavra passe</label>
                        <InputText v-model="confirmPassword" id="confirm-password" placeholder="Confirmar palavra passe" :class="{ 'p-invalid': errors.confirmPassword }" type="password" />
                        <small id="confirm-password-help" class="p-error">{{ errors.confirmPassword }}</small>
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
