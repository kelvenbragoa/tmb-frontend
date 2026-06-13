<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const isLoading = ref(true);

const data = reactive({
    id: null,
    fromCurrency: '',
    toCurrency: '',
    rate: 0,
    effectiveDate: null,
    notes: '',
    status: true
});

const errors = ref({});

const validationRules = {
    fromCurrency: { required: true, message: 'Moeda origem é obrigatória' },
    toCurrency: { required: true, message: 'Moeda destino é obrigatória' },
    rate: { required: true, message: 'Taxa é obrigatória' },
    effectiveDate: { required: true, message: 'Data efetiva é obrigatória' }
};

const currencies = [
    { label: 'Metical (MZN)', value: 'MZN' },
    { label: 'Dólar Americano (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'Rand Sul-Africano (ZAR)', value: 'ZAR' },
    { label: 'Libra Esterlina (GBP)', value: 'GBP' },
    { label: 'Pula (BWP)', value: 'BWP' }
];

const goBack = () => {
    router.push('/settings/exchange-rates');
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

const getExchangeRate = async () => {
    try {
        isLoading.value = true;
        
        // Mock data baseado no ID
        const mockData = {
            1: { id: 1, fromCurrency: 'USD', toCurrency: 'MZN', rate: 63.75, effectiveDate: new Date('2024-09-01'), status: true, notes: 'Taxa oficial do Banco de Moçambique', createdAt: new Date('2024-09-01') },
            2: { id: 2, fromCurrency: 'EUR', toCurrency: 'MZN', rate: 70.25, effectiveDate: new Date('2024-09-01'), status: true, notes: 'Taxa automática baseada no BCE', createdAt: new Date('2024-09-01') },
            3: { id: 3, fromCurrency: 'ZAR', toCurrency: 'MZN', rate: 3.55, effectiveDate: new Date('2024-09-01'), status: true, notes: 'Taxa regional SADC', createdAt: new Date('2024-09-01') },
            4: { id: 4, fromCurrency: 'GBP', toCurrency: 'MZN', rate: 82.15, effectiveDate: new Date('2024-08-25'), status: false, notes: 'Taxa desatualizada', createdAt: new Date('2024-08-25') },
            5: { id: 5, fromCurrency: 'BWP', toCurrency: 'MZN', rate: 4.75, effectiveDate: new Date('2024-09-02'), status: true, notes: 'Taxa automática Pula/Metical', createdAt: new Date('2024-09-02') }
        };

        const exchangeRate = mockData[route.params.id];
        
        if (exchangeRate) {
            Object.assign(data, exchangeRate);
        } else {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Taxa de câmbio não encontrada', life: 3000 });
            router.push('/settings/exchange-rates');
        }
    } catch (error) {
        console.error('Erro ao carregar taxa de câmbio:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar taxa de câmbio', life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

const updateExchangeRate = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Por favor, corrija os erros no formulário', life: 3000 });
        return;
    }

    try {
        loading.value = true;
        
        // Simulação da atualização
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Taxa de câmbio atualizada com sucesso!', life: 3000 });
        router.push('/settings/exchange-rates');
    } catch (error) {
        console.error('Erro ao atualizar taxa de câmbio:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar taxa de câmbio', life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getExchangeRate();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 class="mb-0">Editar Taxa de Câmbio</h4>
                        <p class="text-500 mb-0">Atualizar informações da taxa de câmbio</p>
                    </div>
                    <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
                </div>

                <div v-if="isLoading" class="text-center py-4">
                    <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                    <p class="mt-3">Carregando dados...</p>
                </div>

                <form v-else @submit.prevent="updateExchangeRate" class="grid">
                    <!-- Informações da Taxa -->
                    <div class="col-12 lg:col-6">
                        <div class="card">
                            <h5>Informações da Taxa</h5>
                            
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <label for="fromCurrency" class="block text-900 font-medium mb-2">Moeda de Origem *</label>
                                    <Dropdown
                                        id="fromCurrency"
                                        v-model="data.fromCurrency"
                                        :options="currencies"
                                        optionLabel="label"
                                        optionValue="value"
                                        :class="{ 'p-invalid': errors.fromCurrency }"
                                        class="w-full"
                                        placeholder="Selecione a moeda"
                                        @change="validateField('fromCurrency')"
                                    />
                                    <small v-if="errors.fromCurrency" class="p-error">{{ errors.fromCurrency }}</small>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label for="toCurrency" class="block text-900 font-medium mb-2">Moeda de Destino *</label>
                                    <Dropdown
                                        id="toCurrency"
                                        v-model="data.toCurrency"
                                        :options="currencies"
                                        optionLabel="label"
                                        optionValue="value"
                                        :class="{ 'p-invalid': errors.toCurrency }"
                                        class="w-full"
                                        placeholder="Selecione a moeda"
                                        @change="validateField('toCurrency')"
                                    />
                                    <small v-if="errors.toCurrency" class="p-error">{{ errors.toCurrency }}</small>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label for="rate" class="block text-900 font-medium mb-2">Taxa de Câmbio *</label>
                                    <InputNumber id="rate" v-model="data.rate" :class="{ 'p-invalid': errors.rate }" class="w-full" :min="0" :minFractionDigits="4" :maxFractionDigits="6" placeholder="0.0000" @blur="validateField('rate')" />
                                    <small v-if="errors.rate" class="p-error">{{ errors.rate }}</small>
                                    <small class="text-500">Taxa de conversão de {{ data.fromCurrency || 'origem' }} para {{ data.toCurrency || 'destino' }}</small>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label for="effectiveDate" class="block text-900 font-medium mb-2">Data Efetiva *</label>
                                    <Calendar
                                        id="effectiveDate"
                                        v-model="data.effectiveDate"
                                        :class="{ 'p-invalid': errors.effectiveDate }"
                                        class="w-full"
                                        dateFormat="dd/mm/yy"
                                        placeholder="Selecione a data"
                                        @date-select="validateField('effectiveDate')"
                                    />
                                    <small v-if="errors.effectiveDate" class="p-error">{{ errors.effectiveDate }}</small>
                                </div>

                                <div class="col-12">
                                    <label for="status" class="block text-900 font-medium mb-2">Status</label>
                                    <div class="flex align-items-center">
                                        <InputSwitch id="status" v-model="data.status" />
                                        <label for="status" class="ml-2">{{ data.status ? 'Ativa' : 'Inativa' }}</label>
                                    </div>
                                    <small class="text-500">Uma taxa inativa não será usada nos cálculos de conversão</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Observações e Simulação -->
                    <div class="col-12 lg:col-6">
                        <div class="card h-full">
                            <h5>Observações</h5>
                            
                            <div class="grid">
                                <div class="col-12">
                                    <label for="notes" class="block text-900 font-medium mb-2">Observações</label>
                                    <Textarea id="notes" v-model="data.notes" class="w-full" rows="5" placeholder="Observações sobre esta taxa de câmbio, fonte, razão da atualização, etc." />
                                    <small class="text-500">Adicione informações relevantes sobre esta taxa</small>
                                </div>
                            </div>

                            <!-- Simulação de Conversão -->
                            <div class="mt-4" v-if="data.rate > 0">
                                <h6>Simulação de Conversão</h6>
                                <div class="surface-100 p-3 border-round">
                                    <div class="grid">
                                        <div class="col-12 md:col-6">
                                            <p class="mb-1 text-sm">1 {{ data.fromCurrency }} =</p>
                                            <p class="mb-0 font-bold">{{ data.rate.toFixed(4) }} {{ data.toCurrency }}</p>
                                        </div>
                                        <div class="col-12 md:col-6">
                                            <p class="mb-1 text-sm">100 {{ data.fromCurrency }} =</p>
                                            <p class="mb-0 font-bold">{{ (data.rate * 100).toFixed(2) }} {{ data.toCurrency }}</p>
                                        </div>
                                        <div class="col-12 md:col-6">
                                            <p class="mb-1 text-sm">1.000 {{ data.fromCurrency }} =</p>
                                            <p class="mb-0 font-bold">{{ (data.rate * 1000).toFixed(2) }} {{ data.toCurrency }}</p>
                                        </div>
                                        <div class="col-12 md:col-6">
                                            <p class="mb-1 text-sm">10.000 {{ data.fromCurrency }} =</p>
                                            <p class="mb-0 font-bold">{{ (data.rate * 10000).toFixed(2) }} {{ data.toCurrency }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="col-12">
                        <div class="flex justify-content-end gap-2">
                            <Button label="Cancelar" icon="pi pi-times" severity="secondary" @click="goBack" :disabled="loading" />
                            <Button label="Atualizar Taxa" icon="pi pi-check" type="submit" :loading="loading" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
