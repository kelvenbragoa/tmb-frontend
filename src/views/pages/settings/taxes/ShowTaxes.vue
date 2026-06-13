<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const isLoading = ref(true);
const tax = ref(null);
const calculationAmount = ref(null);

const goBack = () => {
    router.push('/settings/taxes');
};

const editTax = () => {
    router.push(`/settings/taxes/${route.params.id}/edit`);
};

const getTax = async () => {
    try {
        isLoading.value = true;
        
        // Mock data baseado no ID
        const mockData = {
            1: {
                id: 1,
                name: 'IVA Padrão',
                rate: 17.0,
                type: 'IVA',
                status: true,
                description: 'Imposto sobre Valor Acrescentado padrão aplicado na maioria dos produtos e serviços',
                code: 'IVA17',
                createdBy: 'Sistema',
                createdAt: new Date('2024-01-10')
            },
            2: {
                id: 2,
                name: 'IVA Isento',
                rate: 0.0,
                type: 'IVA',
                status: true,
                description: 'Isenção de IVA para produtos e serviços específicos conforme legislação',
                code: 'IVA0',
                createdBy: 'Admin',
                createdAt: new Date('2024-01-10')
            },
            3: {
                id: 3,
                name: 'IRPS Categoria A',
                rate: 10.0,
                type: 'IRPS',
                status: true,
                description: 'Imposto sobre Rendimento de Pessoas Singulares - Categoria A (rendimentos do trabalho)',
                code: 'IRPS10',
                createdBy: 'Sistema',
                createdAt: new Date('2024-01-11')
            },
            4: {
                id: 4,
                name: 'IRPS Categoria B',
                rate: 15.0,
                type: 'IRPS',
                status: true,
                description: 'Imposto sobre Rendimento de Pessoas Singulares - Categoria B (rendimentos empresariais)',
                code: 'IRPS15',
                createdBy: 'Sistema',
                createdAt: new Date('2024-01-11')
            },
            5: {
                id: 5,
                name: 'Selo do Estado',
                rate: 0.5,
                type: 'SELO',
                status: false,
                description: 'Taxa de selo aplicada em documentos e transações específicas',
                code: 'SELO',
                createdBy: 'Admin',
                createdAt: new Date('2024-01-12')
            }
        };

        tax.value = mockData[route.params.id] || null;
        
        if (!tax.value) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Imposto não encontrado', life: 3000 });
            router.push('/settings/taxes');
        }
    } catch (error) {
        console.error('Erro ao carregar imposto:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar imposto', life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

const getStatusSeverity = (status) => {
    return status ? 'success' : 'danger';
};

const getStatusLabel = (status) => {
    return status ? 'Ativo' : 'Inativo';
};

const getTypeSeverity = (type) => {
    switch (type) {
        case 'IVA':
            return 'info';
        case 'IRPS':
            return 'warning';
        case 'SELO':
            return 'secondary';
        default:
            return 'primary';
    }
};

onMounted(() => {
    getTax();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 class="mb-0">Detalhes do Imposto</h4>
                        <p class="text-500 mb-0">Visualizar informações do imposto</p>
                    </div>
                    <div class="flex gap-2">
                        <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
                        <Button label="Editar" icon="pi pi-pencil" @click="editTax" v-if="tax" />
                    </div>
                </div>

                <div v-if="isLoading" class="text-center py-4">
                    <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                    <p class="mt-3">Carregando dados...</p>
                </div>

                <div v-else-if="tax" class="grid">
                    <!-- Informações Gerais -->
                    <div class="col-12 lg:col-6">
                        <div class="card h-full">
                            <h5>Informações Gerais</h5>
                            
                            <div class="grid">
                                <div class="col-12">
                                    <label class="block text-900 font-medium mb-2">Nome do Imposto</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ tax.name }}</span>
                                    </div>
                                </div>
                                
                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Código</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ tax.code }}</span>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Taxa (%)</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ tax.rate.toFixed(2) }}%</span>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Tipo</label>
                                    <div class="p-3 surface-100 border-round">
                                        <Tag :value="tax.type" :severity="getTypeSeverity(tax.type)" />
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Status</label>
                                    <div class="p-3 surface-100 border-round">
                                        <Tag :value="getStatusLabel(tax.status)" :severity="getStatusSeverity(tax.status)" />
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
                                    <label class="block text-900 font-medium mb-2">Descrição</label>
                                    <div class="p-3 surface-100 border-round min-h-6rem">
                                        <span class="text-900">{{ tax.description || 'Nenhuma descrição disponível' }}</span>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Criado Por</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ tax.createdBy || '-' }}</span>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Data de Criação</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium">{{ moment(tax.createdAt).format('DD/MM/YYYY HH:mm') }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Calculadora de Imposto -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Calculadora de Imposto</h5>
                            <p class="text-500">Use esta calculadora para calcular o valor do imposto aplicado</p>
                            
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <label class="block text-900 font-medium mb-2">Valor Base (MZN)</label>
                                    <InputNumber v-model="calculationAmount" :minFractionDigits="2" :maxFractionDigits="2" placeholder="0.00" class="w-full" />
                                </div>
                                
                                <div class="col-12 md:col-1 flex align-items-end justify-content-center">
                                    <i class="pi pi-calculator text-3xl text-500 mb-3"></i>
                                </div>
                                
                                <div class="col-12 md:col-3">
                                    <label class="block text-900 font-medium mb-2">Valor do Imposto</label>
                                    <div class="p-3 surface-100 border-round">
                                        <span class="text-900 font-medium text-lg"> {{ (((calculationAmount || 0) * tax.rate) / 100).toFixed(2) }} MZN</span>
                                    </div>
                                </div>
                                
                                <div class="col-12 md:col-3">
                                    <label class="block text-900 font-medium mb-2">Total com Imposto</label>
                                    <div class="p-3 surface-200 border-round">
                                        <span class="text-900 font-bold text-lg"> {{ ((calculationAmount || 0) + ((calculationAmount || 0) * tax.rate) / 100).toFixed(2) }} MZN</span>
                                    </div>
                                </div>
                                
                                <div class="col-12">
                                    <small class="text-500"> Taxa aplicada: {{ tax.rate.toFixed(2) }}% ({{ tax.name }})</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Exemplos de Aplicação -->
                    <div class="col-12" v-if="tax.type === 'IVA'">
                        <div class="card">
                            <h5>Exemplos de Aplicação</h5>
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="surface-100 p-3 border-round text-center">
                                        <h6 class="mt-0">Produto: 1.000 MZN</h6>
                                        <p class="mb-1">IVA: {{ ((1000 * tax.rate) / 100).toFixed(2) }} MZN</p>
                                        <p class="mb-0 font-bold">Total: {{ (1000 + (1000 * tax.rate) / 100).toFixed(2) }} MZN</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="surface-100 p-3 border-round text-center">
                                        <h6 class="mt-0">Serviço: 5.000 MZN</h6>
                                        <p class="mb-1">IVA: {{ ((5000 * tax.rate) / 100).toFixed(2) }} MZN</p>
                                        <p class="mb-0 font-bold">Total: {{ (5000 + (5000 * tax.rate) / 100).toFixed(2) }} MZN</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="surface-100 p-3 border-round text-center">
                                        <h6 class="mt-0">Consultoria: 10.000 MZN</h6>
                                        <p class="mb-1">IVA: {{ ((10000 * tax.rate) / 100).toFixed(2) }} MZN</p>
                                        <p class="mb-0 font-bold">Total: {{ (10000 + (10000 * tax.rate) / 100).toFixed(2) }} MZN</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-8">
                    <i class="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
                    <h3>Imposto não encontrado</h3>
                    <p class="text-500">O imposto solicitado não existe ou foi removido.</p>
                    <Button label="Voltar à Lista" icon="pi pi-arrow-left" @click="goBack" />
                </div>
            </div>
        </div>
    </div>
</template>
