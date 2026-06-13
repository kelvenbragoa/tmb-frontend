<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { baseURL } from '@/service/APIConstant';
import axios from 'axios';

const router = useRouter();
const toast = useToast();
const loading = ref(false);

const data = reactive({
    name: '',
    rate: 0,
    type: '',
    description: '',
    status: true
});

const errors = ref({});

const validationRules = {
    name: { required: true, message: 'Nome é obrigatório' },
    rate: { required: true, message: 'Taxa é obrigatória' },
    type: { required: true, message: 'Tipo é obrigatório' }
};

const taxTypes = [
    { label: 'IVA', value: 'IVA' },
    { label: 'IRPS', value: 'IRPS' },
    { label: 'Selo', value: 'SELO' },
    { label: 'Outros', value: 'OUTROS' }
];

const validateField = (field) => {
    if (validationRules[field]?.required && !data[field]) {
        errors.value[field] = validationRules[field].message;
        return false;
    }
    delete errors.value[field];
    return true;
};

const validateForm = () => {
    let isValid = true;
    Object.keys(validationRules).forEach((field) => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    return isValid;
};

const submitData = () => {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios', life: 3000 });
        return;
    }

    loading.value = true;

    axios
        .post(`${baseURL}/settings/taxes`, data)
        .then(() => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Imposto criado com sucesso', life: 3000 });
            router.push('/settings/taxes');
        })
        .catch((error) => {
            console.error('Erro ao criar imposto:', error);
            const errorMessage = error.response?.data?.message || 'Erro ao criar imposto';
            toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
};

const goBack = () => {
    router.push('/settings/taxes');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Criar Novo Imposto</h5>
                
                <form @submit.prevent="submitData">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="name">Nome *</label>
                            <InputText id="name" v-model="data.name" :class="{ 'p-invalid': errors.name }" @blur="validateField('name')" placeholder="Digite o nome do imposto" />
                            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="rate">Taxa (%) *</label>
                            <InputNumber id="rate" v-model="data.rate" :class="{ 'p-invalid': errors.rate }" @blur="validateField('rate')" mode="decimal" :minFractionDigits="2" :maxFractionDigits="2" placeholder="0.00" />
                            <small v-if="errors.rate" class="p-error">{{ errors.rate }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="type">Tipo *</label>
                            <Dropdown id="type" v-model="data.type" :options="taxTypes" optionLabel="label" optionValue="value" :class="{ 'p-invalid': errors.type }" @blur="validateField('type')" placeholder="Selecione o tipo" />
                            <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="status">Status</label>
                            <div class="flex align-items-center">
                                <ToggleButton v-model="data.status" onLabel="Ativo" offLabel="Inativo" onIcon="pi pi-check" offIcon="pi pi-times" />
                            </div>
                        </div>
                        
                        <div class="field col-12">
                            <label for="description">Descrição</label>
                            <Textarea id="description" v-model="data.description" rows="3" placeholder="Digite uma descrição (opcional)" />
                        </div>
                    </div>
                    
                    <div class="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="goBack" />
                        <Button label="Salvar" icon="pi pi-check" type="submit" :loading="loading" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-error {
    color: var(--red-500);
}
</style>
