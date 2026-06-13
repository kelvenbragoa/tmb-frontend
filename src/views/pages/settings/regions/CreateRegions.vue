<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';

const router = useRouter();
const toast = useToast();
const loading = ref(false);

const data = reactive({
    name: '',
    code: '',
    country: '',
    description: '',
    status: true
});

const errors = ref({});

const validationRules = {
    name: { required: true, message: 'Nome é obrigatório' },
    code: { required: true, message: 'Código é obrigatório' },
    country: { required: true, message: 'País é obrigatório' }
};

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
    Object.keys(validationRules).forEach(field => {
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
        .post(`${baseURL}/settings/regions`, data)
        .then(() => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Região criada com sucesso', life: 3000 });
            router.push('/settings/regions');
        })
        .catch((error) => {
            console.error('Erro ao criar região:', error);
            const errorMessage = error.response?.data?.message || 'Erro ao criar região';
            toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
};

const goBack = () => {
    router.push('/settings/regions');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Criar Nova Região</h5>
                
                <form @submit.prevent="submitData">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="name">Nome *</label>
                            <InputText 
                                id="name" 
                                v-model="data.name" 
                                :class="{ 'p-invalid': errors.name }" 
                                @blur="validateField('name')"
                                placeholder="Digite o nome da região"
                            />
                            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="code">Código *</label>
                            <InputText 
                                id="code" 
                                v-model="data.code" 
                                :class="{ 'p-invalid': errors.code }" 
                                @blur="validateField('code')"
                                placeholder="Digite o código da região"
                            />
                            <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="country">País *</label>
                            <InputText 
                                id="country" 
                                v-model="data.country" 
                                :class="{ 'p-invalid': errors.country }" 
                                @blur="validateField('country')"
                                placeholder="Digite o país"
                            />
                            <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="status">Status</label>
                            <div class="flex align-items-center">
                                <ToggleButton 
                                    v-model="data.status" 
                                    onLabel="Ativo" 
                                    offLabel="Inativo" 
                                    onIcon="pi pi-check" 
                                    offIcon="pi pi-times" 
                                />
                            </div>
                        </div>
                        
                        <div class="field col-12">
                            <label for="description">Descrição</label>
                            <Textarea 
                                id="description" 
                                v-model="data.description" 
                                rows="3" 
                                placeholder="Digite uma descrição (opcional)"
                            />
                        </div>
                    </div>
                    
                    <div class="flex justify-content-end gap-2">
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            class="p-button-text" 
                            @click="goBack"
                        />
                        <Button 
                            label="Salvar" 
                            icon="pi pi-check" 
                            type="submit"
                            :loading="loading"
                        />
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
