<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const isLoading = ref(true);
const exchangeRate = ref(null);
const conversionAmount = ref(null);

const goBack = () => {
    router.push('/settings/exchange-rates');
};

const editExchangeRate = () => {
    router.push(`/settings/exchange-rates/${route.params.id}/edit`);
};

const getExchangeRate = async () => {
    try {
        isLoading.value = true;
        
        // Mock data baseado no ID
        const mockData = {
            1: { id: 1, fromCurrency: 'USD', toCurrency: 'MZN', rate: 63.75, effectiveDate: new Date('2024-09-01'), status: true, createdBy: 'Admin', notes: 'Taxa oficial do Banco de Moçambique', createdAt: new Date('2024-09-01') },
            2: { id: 2, fromCurrency: 'EUR', toCurrency: 'MZN', rate: 70.25, effectiveDate: new Date('2024-09-01'), status: true, createdBy: 'Sistema', notes: 'Taxa automática baseada no BCE', createdAt: new Date('2024-09-01') },
            3: { id: 3, fromCurrency: 'ZAR', toCurrency: 'MZN', rate: 3.55, effectiveDate: new Date('2024-09-01'), status: true, createdBy: 'Admin', notes: 'Taxa regional SADC', createdAt: new Date('2024-09-01') },
            4: { id: 4, fromCurrency: 'GBP', toCurrency: 'MZN', rate: 82.15, effectiveDate: new Date('2024-08-25'), status: false, createdBy: 'Admin', notes: 'Taxa desatualizada', createdAt: new Date('2024-08-25') },
            5: { id: 5, fromCurrency: 'BWP', toCurrency: 'MZN', rate: 4.75, effectiveDate: new Date('2024-09-02'), status: true, createdBy: 'Sistema', notes: 'Taxa automática Pula/Metical', createdAt: new Date('2024-09-02') }
        };

        exchangeRate.value = mockData[route.params.id] || null;
        
        if (!exchangeRate.value) {
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

const getStatusSeverity = (status) => {
    return status ? 'success' : 'danger';
};

const getStatusLabel = (status) => {
    return status ? 'Ativa' : 'Inativa';
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
                        <h4 class="mb-0">Detalhes da Taxa de Câmbio</h4>
                        <p class="text-500 mb-0">Visualizar informações da taxa de câmbio</p>
                    </div>
                    <div class="flex gap-2">
                        <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
                        <Button label="Editar" icon="pi pi-pencil" @click="editExchangeRate" v-if="exchangeRate" />
                    </div>
                </div>

                <div v-if="isLoading" class="text-center py-4">
                    <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                    <p class="mt-3">Carregando dados...</p>
                </div>

                <div v-else-if="exchangeRate" class="grid">
                    <!-- Informações Gerais -->
                    <div class="col-12 lg:col-6">
                        <div class="card h-full">
                            <h5>Informações Gerais</h5>
                            
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Moeda de Origem</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ exchangeRate.fromCurrency }}</span>
                                    </div>
                                </div>
                                
                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Moeda de Destino</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ exchangeRate.toCurrency }}</span>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Taxa de Câmbio</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ exchangeRate.rate.toFixed(4) }}</span>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Data Efetiva</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ moment(exchangeRate.effectiveDate).format('DD/MM/YYYY') }}</span>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <label class="block text-900 font-medium mb-2">Status</label>
                                    <div class="p-3 surface-100 border-round">
                                        <Tag :value="getStatusLabel(exchangeRate.status)" :severity="getStatusSeverity(exchangeRate.status)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações Adicionais -->
                    <div class="col-12 lg:col-6">
                        <div class="card h-full">
                            <h5>Informações Adicionais</h5>
                            
                            <div class="grid">
                                <div class="col-12">
                                    <label class="block text-900 font-medium mb-2">Criado Por</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ exchangeRate.createdBy || '-' }}</span>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <label class="block text-900 font-medium mb-2">Data de Criação</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ moment(exchangeRate.createdAt).format('DD/MM/YYYY HH:mm') }}</span>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <label class="block text-900 font-medium mb-2">Observações</label>
                                    <div class="p-3 surface-100 border-round min-h-6rem">
                                        <span class="text-900">{{ exchangeRate.notes || 'Nenhuma observação registrada' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cálculo de Conversão -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Calculadora de Conversão</h5>
                            <p class="text-500">Use esta calculadora para converter valores usando esta taxa de câmbio</p>
                            
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <label class="block text-900 font-medium mb-2">Valor em {{ exchangeRate.fromCurrency }}</label>
                                    <InputNumber v-model="conversionAmount" :minFractionDigits="2" :maxFractionDigits="4" placeholder="0.00" class="w-full" />
                                </div>
                                
                                <div class="col-12 md:col-1 flex align-items-end justify-content-center">
                                    <i class="pi pi-arrow-right text-3xl text-500 mb-3"></i>
                                </div>
                                
                                <div class="col-12 md:col-4">
                                    <label class="block text-900 font-medium mb-2">Valor em {{ exchangeRate.toCurrency }}</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium text-lg">
                                            {{ ((conversionAmount || 0) * exchangeRate.rate).toFixed(2) }}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="col-12 md:col-3 flex align-items-end">
                                    <small class="text-500"> Taxa: 1 {{ exchangeRate.fromCurrency }} = {{ exchangeRate.rate.toFixed(4) }} {{ exchangeRate.toCurrency }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-8">
                    <i class="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
                    <h3>Taxa de câmbio não encontrada</h3>
                    <p class="text-500">A taxa de câmbio solicitada não existe ou foi removida.</p>
                    <Button label="Voltar à Lista" icon="pi pi-arrow-left" @click="goBack" />
                </div>
            </div>
        </div>
    </div>
</template>
