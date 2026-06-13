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
    description: '',
    status: true
});

const errors = ref({});

const validationRules = {
    name: { required: true, message: 'Nome é obrigatório' },
    code: { required: true, message: 'Código é obrigatório' },
    type: { required: true, message: 'Tipo é obrigatório' }
};

const paymentTypes = [
    { label: 'Espécie', value: 'ESPECIE' },
    { label: 'Eletrônico', value: 'ELETRONICO' },
    { label: 'Mobile', value: 'MOBILE' },
    { label: 'Cartão', value: 'CARTAO' },
    { label: 'Cheque', value: 'CHEQUE' },
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

    // Mock API call
    setTimeout(() => {
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Método de pagamento criado com sucesso', life: 3000 });
        router.push('/settings/payment-methods');
        loading.value = false;
    }, 1000);
};

const goBack = () => {
    router.push('/settings/payment-methods');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Criar Novo Método de Pagamento</h5>
                
                <form @submit.prevent="submitData">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="name">Nome *</label>
                            <InputText id="name" v-model="data.name" :class="{ 'p-invalid': errors.name }" @blur="validateField('name')" placeholder="Digite o nome do método" />
                            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="code">Código *</label>
                            <InputText id="code" v-model="data.code" :class="{ 'p-invalid': errors.code }" @blur="validateField('code')" placeholder="Ex: CASH, BANK, MPESA" />
                            <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="type">Tipo *</label>
                            <Dropdown
                                id="type"
                                v-model="data.type"
                                :options="paymentTypes"
                                optionLabel="label"
                                optionValue="value"
                                :class="{ 'p-invalid': errors.type }"
                                @blur="validateField('type')"
                                placeholder="Selecione o tipo"
                            />
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
