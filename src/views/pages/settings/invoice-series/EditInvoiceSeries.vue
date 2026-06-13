<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Services
import InvoiceSeriesService from '@/service/InvoiceSeriesService';
import InvoiceSeriesDemoService from '@/service/InvoiceSeriesDemoService';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// Form State
const isLoadingDiv = ref(true);
const loadingButton = ref(false);
const seriesId = ref(route.params.id);

// Form Data
const formData = ref({
    name: '',
    prefix: '',
    document_type: '',
    start_number: 1,
    end_number: 9999,
    separator: '/',
    number_padding: 3,
    is_active: true,
    status: 'active',
    description: '',
    current_number: 1,
    metadata: {}
});

// Original data for comparison
const originalData = ref({});

// Validations
const formErrors = ref({
    name: '',
    prefix: '',
    document_type: '',
    start_number: '',
    end_number: '',
    number_padding: '',
    current_number: ''
});

// Options
const documentTypeOptions = [
    { label: 'Cotação', value: 'quotation' },
    { label: 'Venda a Dinheiro', value: 'cash_sale' },
    { label: 'Fatura', value: 'invoice' },
    { label: 'Pagamento de Recibo', value: 'receipt_payment' },
    { label: 'Pagamento de Fatura', value: 'invoice_payment' }
];

const statusOptions = [
    { label: 'Ativa', value: 'active' },
    { label: 'Inativa', value: 'inactive' }
];

const separatorOptions = [
    { label: '/ (Barra)', value: '/' },
    { label: '- (Hífen)', value: '-' },
    { label: '. (Ponto)', value: '.' },
    { label: '_ (Sublinhado)', value: '_' }
];

// Computed Properties
const previewNumber = ref('');
const hasChanges = ref(false);

const updatePreview = () => {
    if (formData.value.prefix && formData.value.current_number) {
        const paddedNumber = String(formData.value.current_number).padStart(formData.value.number_padding || 3, '0');
        previewNumber.value = `${formData.value.prefix}${formData.value.separator || '/'}${paddedNumber}`;
    } else {
        previewNumber.value = '';
    }
    
    // Check if form has changes
    checkForChanges();
};

const checkForChanges = () => {
    hasChanges.value = JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
};

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

        // Populate form with series data
        formData.value = { ...series };
        originalData.value = { ...series };
        
        updatePreview();

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

// Form Methods
const validateForm = () => {
    formErrors.value = {
        name: '',
        prefix: '',
        document_type: '',
        start_number: '',
        end_number: '',
        number_padding: '',
        current_number: ''
    };

    let isValid = true;

    // Nome obrigatório
    if (!formData.value.name || formData.value.name.trim().length < 2) {
        formErrors.value.name = 'Nome é obrigatório (mínimo 2 caracteres)';
        isValid = false;
    }

    // Prefixo obrigatório
    if (!formData.value.prefix || formData.value.prefix.trim().length < 2) {
        formErrors.value.prefix = 'Prefixo é obrigatório (mínimo 2 caracteres)';
        isValid = false;
    }

    // Tipo de documento obrigatório
    if (!formData.value.document_type) {
        formErrors.value.document_type = 'Tipo de documento é obrigatório';
        isValid = false;
    }

    // Número inicial deve ser positivo
    if (!formData.value.start_number || formData.value.start_number < 1) {
        formErrors.value.start_number = 'Número inicial deve ser maior que zero';
        isValid = false;
    }

    // Número atual deve ser maior ou igual ao inicial
    if (!formData.value.current_number || formData.value.current_number < formData.value.start_number) {
        formErrors.value.current_number = 'Número atual deve ser maior ou igual ao inicial';
        isValid = false;
    }

    // Número final deve ser maior que atual
    if (!formData.value.end_number || formData.value.end_number < formData.value.current_number) {
        formErrors.value.end_number = 'Número final deve ser maior que o atual';
        isValid = false;
    }

    // Preenchimento deve ser positivo
    if (!formData.value.number_padding || formData.value.number_padding < 1) {
        formErrors.value.number_padding = 'Preenchimento deve ser maior que zero';
        isValid = false;
    }

    return isValid;
};

const submitForm = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Por favor, corrija os erros no formulário',
            life: 3000
        });
        return;
    }

    if (!hasChanges.value) {
        toast.add({
            severity: 'info',
            summary: 'Informação',
            detail: 'Nenhuma alteração foi feita',
            life: 3000
        });
        return;
    }

    try {
        loadingButton.value = true;

        // Preparar dados para atualização (apenas campos alterados)
        const updateData = {};
        Object.keys(formData.value).forEach((key) => {
            if (formData.value[key] !== originalData.value[key]) {
                updateData[key] = formData.value[key];
            }
        });

        // Usar service demo como fallback
        let updatedSeries;
        try {
            updatedSeries = await InvoiceSeriesService.updateSeries(seriesId.value, updateData);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            updatedSeries = await InvoiceSeriesDemoService.updateSeries(seriesId.value, updateData);
        }

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Série de faturação atualizada com sucesso',
            life: 3000
        });

        // Redirecionar para visualização da série
        router.push(`/settings/invoice-series/${updatedSeries.id}`);

    } catch (error) {
        console.error('Erro ao atualizar série:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao atualizar série de faturação',
            life: 3000
        });
    } finally {
        loadingButton.value = false;
    }
};

const resetForm = () => {
    formData.value = { ...originalData.value };
    formErrors.value = {
        name: '',
        prefix: '',
        document_type: '',
        start_number: '',
        end_number: '',
        number_padding: '',
        current_number: ''
    };
    updatePreview();
};

const goBack = () => {
    if (hasChanges.value) {
        if (confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
            router.push(`/settings/invoice-series/${seriesId.value}`);
        }
    } else {
        router.push(`/settings/invoice-series/${seriesId.value}`);
    }
};

const goToList = () => {
    router.push('/settings/invoice-series');
};

// Watchers
const watchFormChanges = () => {
    updatePreview();
};

onMounted(() => {
    loadSeriesData();
});
</script>

<template>
    <!-- Loading State -->
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Carregando formulário" />
        </div>
    </div>

    <!-- Form Content -->
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 class="m-0">Editar Série de Faturação</h5>
                        <p class="text-600 mt-1 mb-0">ID da Série: #{{ seriesId }}</p>
                    </div>
                    <div class="flex gap-2">
                        <Button label="Voltar" icon="pi pi-arrow-left" class="p-button-outlined" @click="goBack" size="small" />
                        <Button label="Ver Série" icon="pi pi-eye" class="p-button-outlined" severity="info" @click="goToList" size="small" />
                    </div>
                </div>

                <form @submit.prevent="submitForm" class="p-fluid">
                    <div class="grid">
                        <!-- Informações Básicas -->
                        <div class="col-12">
                            <h6 class="text-primary mb-3">Informações Básicas</h6>
                        </div>

                        <!-- Nome da Série -->
                        <div class="col-12 md:col-6">
                            <label for="name" class="block text-900 font-medium mb-2">Nome da Série *</label>
                            <InputText id="name" v-model="formData.name" placeholder="Ex: Faturas 2025" :class="{ 'p-invalid': formErrors.name }" @input="watchFormChanges" />
                            <small v-if="formErrors.name" class="p-error">{{ formErrors.name }}</small>
                        </div>

                        <!-- Tipo de Documento (Read-only) -->
                        <div class="col-12 md:col-6">
                            <label for="document_type" class="block text-900 font-medium mb-2">Tipo de Documento</label>
                            <Dropdown id="document_type" v-model="formData.document_type" :options="documentTypeOptions" optionLabel="label" optionValue="value" placeholder="Tipo não pode ser alterado" disabled />
                            <small class="text-600">O tipo de documento não pode ser alterado após a criação</small>
                        </div>

                        <!-- Prefixo (Read-only) -->
                        <div class="col-12 md:col-4">
                            <label for="prefix" class="block text-900 font-medium mb-2">Prefixo</label>
                            <InputText id="prefix" v-model="formData.prefix" placeholder="Ex: FAT2025" disabled />
                            <small class="text-600">O prefixo não pode ser alterado</small>
                        </div>

                        <!-- Separador -->
                        <div class="col-12 md:col-4">
                            <label for="separator" class="block text-900 font-medium mb-2">Separador</label>
                            <Dropdown id="separator" v-model="formData.separator" :options="separatorOptions" optionLabel="label" optionValue="value" placeholder="Selecione o separador" @change="watchFormChanges" />
                        </div>

                        <!-- Preenchimento -->
                        <div class="col-12 md:col-4">
                            <label for="number_padding" class="block text-900 font-medium mb-2">Preenchimento *</label>
                            <InputNumber id="number_padding" v-model="formData.number_padding" :min="1" :max="10" placeholder="3" :class="{ 'p-invalid': formErrors.number_padding }" @input="watchFormChanges" />
                            <small v-if="formErrors.number_padding" class="p-error">{{ formErrors.number_padding }}</small>
                            <small class="text-600" v-else>Número de dígitos (ex: 3 = 001, 002)</small>
                        </div>

                        <!-- Numeração -->
                        <div class="col-12">
                            <h6 class="text-primary mb-3 mt-4">Configuração de Numeração</h6>
                        </div>

                        <!-- Número Inicial (Read-only) -->
                        <div class="col-12 md:col-4">
                            <label for="start_number" class="block text-900 font-medium mb-2">Número Inicial</label>
                            <InputNumber id="start_number" v-model="formData.start_number" :min="1" placeholder="1" disabled />
                            <small class="text-600">O número inicial não pode ser alterado</small>
                        </div>

                        <!-- Número Atual -->
                        <div class="col-12 md:col-4">
                            <label for="current_number" class="block text-900 font-medium mb-2">Número Atual *</label>
                            <InputNumber id="current_number" v-model="formData.current_number" :min="formData.start_number" placeholder="1" :class="{ 'p-invalid': formErrors.current_number }" @input="watchFormChanges" />
                            <small v-if="formErrors.current_number" class="p-error">{{ formErrors.current_number }}</small>
                            <small class="text-600" v-else>Próximo número a ser gerado</small>
                        </div>

                        <!-- Número Final -->
                        <div class="col-12 md:col-4">
                            <label for="end_number" class="block text-900 font-medium mb-2">Número Final *</label>
                            <InputNumber id="end_number" v-model="formData.end_number" :min="formData.current_number" placeholder="9999" :class="{ 'p-invalid': formErrors.end_number }" @input="watchFormChanges" />
                            <small v-if="formErrors.end_number" class="p-error">{{ formErrors.end_number }}</small>
                        </div>

                        <!-- Preview do Número -->
                        <div class="col-12" v-if="previewNumber">
                            <div class="border-1 border-300 border-round p-3 bg-gray-50">
                                <h6 class="text-900 mb-2">Pré-visualização do Próximo Número:</h6>
                                <Tag :value="previewNumber" severity="info" class="text-lg font-bold" />
                            </div>
                        </div>

                        <!-- Status -->
                        <div class="col-12">
                            <h6 class="text-primary mb-3 mt-4">Status e Configurações</h6>
                        </div>

                        <!-- Status da Série -->
                        <div class="col-12 md:col-6">
                            <label for="status" class="block text-900 font-medium mb-2">Status</label>
                            <Dropdown id="status" v-model="formData.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Selecione o status" @change="watchFormChanges" />
                        </div>

                        <!-- Série Ativa -->
                        <div class="col-12 md:col-6 flex align-items-center">
                            <div class="field-checkbox">
                                <Checkbox id="is_active" v-model="formData.is_active" :binary="true" @change="watchFormChanges" />
                                <label for="is_active" class="ml-2">Definir como série ativa</label>
                            </div>
                            <small class="text-600 mt-2 block w-full"> Apenas uma série pode estar ativa por tipo de documento</small>
                        </div>

                        <!-- Descrição -->
                        <div class="col-12">
                            <label for="description" class="block text-900 font-medium mb-2">Descrição</label>
                            <Textarea id="description" v-model="formData.description" rows="3" placeholder="Descrição opcional da série..." @input="watchFormChanges" />
                        </div>

                        <!-- Warning about changes -->
                        <div class="col-12" v-if="hasChanges">
                            <Message severity="warn" :closable="false">
                                <template #icon>
                                    <i class="pi pi-exclamation-triangle"></i>
                                </template>
                                Você tem alterações não salvas neste formulário.
                            </Message>
                        </div>

                        <!-- Buttons -->
                        <div class="col-12">
                            <div class="flex justify-content-end gap-3 mt-4">
                                <Button label="Resetar" icon="pi pi-refresh" class="p-button-outlined" @click="resetForm" type="button" :disabled="!hasChanges" />
                                <Button label="Cancelar" icon="pi pi-times" class="p-button-outlined" @click="goBack" type="button" />
                                <Button label="Salvar Alterações" icon="pi pi-check" class="p-button-primary" type="submit" :loading="loadingButton" :disabled="!hasChanges" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.field-checkbox {
    display: flex;
    align-items: center;
}

.field-checkbox label {
    margin-left: 0.5rem;
}

.p-tag.text-lg {
    font-size: 1.2rem;
    padding: 0.75rem 1rem;
}
</style>