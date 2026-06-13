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
    fromCurrency: '',
    toCurrency: '',
    rate: 0,
    effectiveDate: new Date(),
    description: '',
    status: true
});

const errors = ref({});

const validationRules = {
    fromCurrency: { required: true, message: 'Moeda origem é obrigatória' },
    toCurrency: { required: true, message: 'Moeda destino é obrigatória' },
    rate: { required: true, message: 'Taxa é obrigatória' },
    effectiveDate: { required: true, message: 'Data efetiva é obrigatória' }
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
        .post(`${baseURL}/settings/exchange-rates`, data)
        .then(() => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Taxa de câmbio criada com sucesso', life: 3000 });
            router.push('/settings/exchange-rates');
        })
        .catch((error) => {
            console.error('Erro ao criar taxa de câmbio:', error);
            const errorMessage = error.response?.data?.message || 'Erro ao criar taxa de câmbio';
            toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
};

const goBack = () => {
    router.push('/settings/exchange-rates');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Criar Nova Taxa de Câmbio</h5>
                
                <form @submit.prevent="submitData">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="fromCurrency">Moeda Origem *</label>
                            <InputText id="fromCurrency" v-model="data.fromCurrency" :class="{ 'p-invalid': errors.fromCurrency }" @blur="validateField('fromCurrency')" placeholder="Ex: USD" />
                            <small v-if="errors.fromCurrency" class="p-error">{{ errors.fromCurrency }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="toCurrency">Moeda Destino *</label>
                            <InputText id="toCurrency" v-model="data.toCurrency" :class="{ 'p-invalid': errors.toCurrency }" @blur="validateField('toCurrency')" placeholder="Ex: MZN" />
                            <small v-if="errors.toCurrency" class="p-error">{{ errors.toCurrency }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="rate">Taxa *</label>
                            <InputNumber id="rate" v-model="data.rate" :class="{ 'p-invalid': errors.rate }" @blur="validateField('rate')" mode="decimal" :minFractionDigits="2" :maxFractionDigits="4" placeholder="0.00" />
                            <small v-if="errors.rate" class="p-error">{{ errors.rate }}</small>
                        </div>
                        
                        <div class="field col-12 md:col-6">
                            <label for="effectiveDate">Data Efetiva *</label>
                            <Calendar id="effectiveDate" v-model="data.effectiveDate" :class="{ 'p-invalid': errors.effectiveDate }" @blur="validateField('effectiveDate')" dateFormat="dd/mm/yy" />
                            <small v-if="errors.effectiveDate" class="p-error">{{ errors.effectiveDate }}</small>
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
