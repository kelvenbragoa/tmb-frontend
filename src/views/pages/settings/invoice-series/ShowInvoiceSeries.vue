<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

// Services
import InvoiceSeriesService from '@/service/InvoiceSeriesService';
import InvoiceSeriesDemoService from '@/service/InvoiceSeriesDemoService';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// State
const isLoadingDiv = ref(true);
const seriesData = ref(null);
const seriesId = ref(route.params.id);

// Statistics
const statistics = ref({
    nextNumber: '',
    remainingNumbers: 0,
    usagePercentage: 0
});

// Load Series Data
const loadSeriesData = async () => {
    try {
        isLoadingDiv.value = true;
        
        // Usar service demo como fallback
        let series;
        try {
            series = await InvoiceSeriesService.getSeriesById(seriesId.value);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            series = await InvoiceSeriesDemoService.getSeriesById(seriesId.value);
        }

        seriesData.value = series;
        calculateStatistics();

    } catch (error) {
        console.error('Erro ao carregar série:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar dados da série',
            life: 3000
        });
        
        // Redirecionar para listagem em caso de erro
        router.push('/settings/invoice-series');
    } finally {
        isLoadingDiv.value = false;
    }
};

const calculateStatistics = () => {
    if (!seriesData.value) return;

    const series = seriesData.value;
    
    // Próximo número
    statistics.value.nextNumber = formatNextNumber(series);
    
    // Números restantes
    statistics.value.remainingNumbers = series.end_number - series.current_number;
    
    // Percentual de uso
    const totalNumbers = series.end_number - series.start_number + 1;
    const usedNumbers = series.current_number - series.start_number + 1;
    statistics.value.usagePercentage = Math.round((usedNumbers / totalNumbers) * 100);
};

const formatNextNumber = (series) => {
    const paddedNumber = String(series.current_number).padStart(series.number_padding || 3, '0');
    return `${series.prefix}${series.separator || '/'}${paddedNumber}`;
};

const getDocumentTypeLabel = (type) => {
    const labels = {
        quotation: 'Cotação',
        cash_sale: 'Venda a Dinheiro',
        invoice: 'Fatura',
        receipt_payment: 'Pagamento de Recibo',
        invoice_payment: 'Pagamento de Fatura'
    };
    return labels[type] || type;
};

const getDocumentTypeSeverity = (type) => {
    const severities = {
        quotation: 'info',
        cash_sale: 'success',
        invoice: 'primary',
        receipt_payment: 'warning',
        invoice_payment: 'secondary'
    };
    return severities[type] || 'info';
};

const getStatusSeverity = (status) => {
    return status === 'active' ? 'success' : 'secondary';
};

const getActiveBadgeSeverity = (isActive) => {
    return isActive ? 'success' : 'danger';
};

const getUsageProgressSeverity = (percentage) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'info';
};

const toggleActiveSeries = async () => {
    try {
        let updatedSeries;
        try {
            updatedSeries = await InvoiceSeriesService.toggleActiveSeries(seriesId.value);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            updatedSeries = await InvoiceSeriesDemoService.toggleActiveSeries(seriesId.value);
        }

        seriesData.value = updatedSeries;

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Série ${updatedSeries.is_active ? 'ativada' : 'desativada'} com sucesso`,
            life: 3000
        });

    } catch (error) {
        console.error('Erro ao alternar série:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao alternar status da série',
            life: 3000
        });
    }
};

const generateNextNumber = async () => {
    try {
        let result;
        try {
            result = await InvoiceSeriesService.generateNumber(seriesData.value.document_type);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            result = await InvoiceSeriesDemoService.generateNumber(seriesData.value.document_type);
        }

        toast.add({
            severity: 'success',
            summary: 'Número Gerado',
            detail: `Próximo número: ${result.next_number}`,
            life: 5000
        });

        // Recarregar dados da série
        await loadSeriesData();

    } catch (error) {
        console.error('Erro ao gerar número:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao gerar próximo número',
            life: 3000
        });
    }
};

const goBack = () => {
    router.push('/settings/invoice-series');
};

const goToEdit = () => {
    router.push(`/settings/invoice-series/${seriesId.value}/edit`);
};

onMounted(() => {
    loadSeriesData();
});
</script>

<template>
    <!-- Loading State -->
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner 
                style="width: 50px; height: 50px" 
                strokeWidth="8" 
                fill="var(--surface-ground)" 
                animationDuration=".5s" 
                aria-label="Carregando série"
            />
        </div>
    </div>

    <!-- Series Details -->
    <div class="grid" v-else-if="seriesData">
        <!-- Header -->
        <div class="col-12">
            <div class="card mb-4">
                <div class="flex justify-content-between align-items-start">
                    <div>
                        <h4 class="text-900 font-medium mb-2">{{ seriesData.name }}</h4>
                        <p class="text-600 m-0" v-if="seriesData.description">{{ seriesData.description }}</p>
                        <div class="flex align-items-center gap-3 mt-3">
                            <Tag 
                                :value="getDocumentTypeLabel(seriesData.document_type)" 
                                :severity="getDocumentTypeSeverity(seriesData.document_type)"
                                class="font-semibold"
                            />
                            <Tag 
                                :value="seriesData.status === 'active' ? 'Ativa' : 'Inativa'" 
                                :severity="getStatusSeverity(seriesData.status)"
                                class="font-semibold"
                            />
                            <Tag 
                                :value="seriesData.is_active ? 'Série Principal' : 'Série Secundária'" 
                                :severity="getActiveBadgeSeverity(seriesData.is_active)"
                                class="font-semibold"
                            />
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <Button 
                            label="Voltar" 
                            icon="pi pi-arrow-left" 
                            class="p-button-outlined"
                            @click="goBack"
                            size="small"
                        />
                        <Button 
                            label="Editar" 
                            icon="pi pi-pencil" 
                            class="p-button-outlined"
                            severity="warning"
                            @click="goToEdit"
                            size="small"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="col-12">
            <div class="grid">
                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Próximo Número</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.nextNumber }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-hashtag text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <Button 
                            label="Gerar Próximo" 
                            icon="pi pi-plus" 
                            size="small"
                            class="w-full"
                            @click="generateNextNumber"
                            :disabled="!seriesData.is_active"
                        />
                    </div>
                </div>

                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Número Atual</span>
                                <div class="text-900 font-medium text-xl">{{ seriesData.current_number }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-check-circle text-green-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Números Restantes</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.remainingNumbers.toLocaleString() }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-clock text-orange-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Uso da Série</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.usagePercentage }}%</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-chart-pie text-purple-500 text-xl"></i>
                            </div>
                        </div>
                        <ProgressBar 
                            :value="statistics.usagePercentage" 
                            :severity="getUsageProgressSeverity(statistics.usagePercentage)"
                            :showValue="false"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Configuration Details -->
        <div class="col-12 lg:col-8">
            <div class="card">
                <h6 class="text-primary mb-4">Configurações da Série</h6>
                
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Nome da Série</label>
                            <p class="text-900 font-medium">{{ seriesData.name }}</p>
                        </div>
                    </div>

                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Tipo de Documento</label>
                            <Tag 
                                :value="getDocumentTypeLabel(seriesData.document_type)" 
                                :severity="getDocumentTypeSeverity(seriesData.document_type)"
                                class="font-semibold"
                            />
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Prefixo</label>
                            <Tag :value="seriesData.prefix" severity="info" class="font-semibold" />
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Separador</label>
                            <p class="text-900 font-medium">{{ seriesData.separator || '/' }}</p>
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Preenchimento</label>
                            <p class="text-900 font-medium">{{ seriesData.number_padding || 3 }} dígitos</p>
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Número Inicial</label>
                            <p class="text-900 font-medium">{{ seriesData.start_number }}</p>
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Número Final</label>
                            <p class="text-900 font-medium">{{ seriesData.end_number }}</p>
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Número Atual</label>
                            <p class="text-900 font-medium">{{ seriesData.current_number }}</p>
                        </div>
                    </div>

                    <div class="col-12" v-if="seriesData.description">
                        <div class="mb-4">
                            <label class="block text-600 font-medium mb-2">Descrição</label>
                            <p class="text-900">{{ seriesData.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions Panel -->
        <div class="col-12 lg:col-4">
            <div class="card">
                <h6 class="text-primary mb-4">Ações Disponíveis</h6>
                
                <div class="flex flex-column gap-3">
                    <Button 
                        :label="seriesData.is_active ? 'Desativar Série' : 'Ativar Série'"
                        :icon="seriesData.is_active ? 'pi pi-times' : 'pi pi-check'"
                        :severity="seriesData.is_active ? 'danger' : 'success'"
                        class="w-full"
                        @click="toggleActiveSeries"
                    />

                    <Button 
                        label="Gerar Próximo Número" 
                        icon="pi pi-plus"
                        class="w-full"
                        @click="generateNextNumber"
                        :disabled="!seriesData.is_active"
                    />

                    <Button 
                        label="Editar Série" 
                        icon="pi pi-pencil"
                        severity="warning"
                        class="w-full p-button-outlined"
                        @click="goToEdit"
                    />

                    <Button 
                        label="Voltar à Listagem" 
                        icon="pi pi-arrow-left"
                        class="w-full p-button-outlined"
                        @click="goBack"
                    />
                </div>

                <!-- Metadata -->
                <Divider />
                
                <h6 class="text-600 mb-3">Informações do Sistema</h6>
                
                <div class="flex flex-column gap-2">
                    <div class="flex justify-content-between">
                        <span class="text-600">Criado em:</span>
                        <span class="font-medium">{{ moment(seriesData.created_at).format('DD/MM/YYYY HH:mm') }}</span>
                    </div>
                    
                    <div class="flex justify-content-between">
                        <span class="text-600">Atualizado em:</span>
                        <span class="font-medium">{{ moment(seriesData.updated_at).format('DD/MM/YYYY HH:mm') }}</span>
                    </div>
                    
                    <div class="flex justify-content-between">
                        <span class="text-600">ID da Série:</span>
                        <span class="font-medium">#{{ seriesData.id }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    border-radius: 10px;
}
</style>