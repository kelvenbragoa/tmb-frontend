<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const loading = ref(false);

const data = reactive({
    name: '',
    code: '',
    type: '',
    format: '',
    template: '',
    description: '',
    status: true
});

const errors = ref({});

const validationRules = {
    name: { required: true, message: 'Nome é obrigatório' },
    code: { required: true, message: 'Código é obrigatório' },
    type: { required: true, message: 'Tipo é obrigatório' },
    format: { required: true, message: 'Formato é obrigatório' }
};

const templateTypes = [
    { label: 'Fatura', value: 'FATURA' },
    { label: 'Recibo', value: 'RECIBO' },
    { label: 'Nota de Crédito', value: 'NOTA_CREDITO' },
    { label: 'Nota de Débito', value: 'NOTA_DEBITO' },
    { label: 'Guia de Remessa', value: 'GUIA_REMESSA' },
    { label: 'Outros', value: 'OUTROS' }
];

const formatTypes = [
    { label: 'A4', value: 'A4' },
    { label: 'A5', value: 'A5' },
    { label: '80mm', value: '80mm' },
    { label: '58mm', value: '58mm' },
    { label: 'Personalizado', value: 'CUSTOM' }
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

    // Mock API call
    setTimeout(() => {
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Modelo de impressão criado com sucesso', life: 3000 });
        router.push('/settings/print-templates');
        loading.value = false;
    }, 1000);
};

const goBack = () => {
    router.push('/settings/print-templates');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Criar Novo Modelo de Impressão</h5>
                
                <form @submit.prevent="submitData">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="name">Nome *</label>
                            <InputText id="name" v-model="data.name" :class="{ 'p-invalid': errors.name }" @blur="validateField('name')" placeholder="Digite o nome do modelo" />
                            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="code">Código *</label>
                            <InputText id="code" v-model="data.code" :class="{ 'p-invalid': errors.code }" @blur="validateField('code')" placeholder="Ex: FT_A4, RC_80MM" />
                            <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="type">Tipo de Documento *</label>
                            <Dropdown id="type" v-model="data.type" :options="templateTypes" optionLabel="label" optionValue="value" :class="{ 'p-invalid': errors.type }" @blur="validateField('type')" placeholder="Selecione o tipo" />
                            <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="format">Formato *</label>
                            <Dropdown id="format" v-model="data.format" :options="formatTypes" optionLabel="label" optionValue="value" :class="{ 'p-invalid': errors.format }" @blur="validateField('format')" placeholder="Selecione o formato" />
                            <small v-if="errors.format" class="p-error">{{ errors.format }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="status">Status</label>
                            <div class="flex align-items-center">
                                <ToggleButton v-model="data.status" onLabel="Ativo" offLabel="Inativo" onIcon="pi pi-check" offIcon="pi pi-times" />
                            </div>
                        </div>
                        
                        <div class="field col-12">
                            <label for="template">Conteúdo do Template</label>
                            <Textarea id="template" v-model="data.template" rows="8" placeholder="Digite o HTML/CSS do template (opcional)" />
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
