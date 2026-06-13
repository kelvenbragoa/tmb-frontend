<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Services
import InvoiceSeriesService from '@/service/InvoiceSeriesService';
import InvoiceSeriesDemoService from '@/service/InvoiceSeriesDemoService';

const router = useRouter();
const toast = useToast();

// Form State
const isLoadingDiv = ref(false);
const loadingButton = ref(false);

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
    metadata: {}
});

// Validations
const formErrors = ref({
    name: '',
    prefix: '',
    document_type: '',
    start_number: '',
    end_number: '',
    number_padding: ''
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

const updatePreview = () => {
    if (formData.value.prefix && formData.value.start_number) {
        const paddedNumber = String(formData.value.start_number).padStart(formData.value.number_padding || 3, '0');
        previewNumber.value = `${formData.value.prefix}${formData.value.separator || '/'}${paddedNumber}`;
    } else {
        previewNumber.value = '';
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
        number_padding: ''
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

    // Número final deve ser maior que inicial
    if (!formData.value.end_number || formData.value.end_number < formData.value.start_number) {
        formErrors.value.end_number = 'Número final deve ser maior que o inicial';
        isValid = false;
    }

    // Preenchimento deve ser positivo
    if (!formData.value.number_padding || formData.value.number_padding < 1) {
        formErrors.value.number_padding = 'Preenchimento deve ser maior que zero';
        isValid = false;
    }

    return isValid;
};

const generateSampleData = () => {
    if (formData.value.document_type) {
        const currentYear = new Date().getFullYear();
        
        // Auto-preencher baseado no tipo
        if (!formData.value.name) {
            formData.value.name = InvoiceSeriesDemoService.generateSampleName(formData.value.document_type, currentYear);
        }
        if (!formData.value.prefix) {
            formData.value.prefix = InvoiceSeriesDemoService.generateSamplePrefix(formData.value.document_type, currentYear);
        }
        
        updatePreview();
    }
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

    try {
        loadingButton.value = true;

        // Usar service demo como fallback
        let createdSeries;
        try {
            createdSeries = await InvoiceSeriesService.createSeries(formData.value);
        } catch (error) {
            console.warn('API não disponível, usando dados demo:', error.message);
            createdSeries = await InvoiceSeriesDemoService.createSeries(formData.value);
        }

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Série de faturação criada com sucesso',
            life: 3000
        });

        // Redirecionar para a listagem
        router.push('/settings/invoice-series');

    } catch (error) {
        console.error('Erro ao criar série:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao criar série de faturação',
            life: 3000
        });
    } finally {
        loadingButton.value = false;
    }
};

const resetForm = () => {
    formData.value = {
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
        metadata: {}
    };
    
    formErrors.value = {
        name: '',
        prefix: '',
        document_type: '',
        start_number: '',
        end_number: '',
        number_padding: ''
    };
    
    previewNumber.value = '';
};

const goBack = () => {
    router.push('/settings/invoice-series');
};

// Watchers
const watchFormChanges = () => {
    updatePreview();
};

onMounted(() => {
    updatePreview();
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
                aria-label="Carregando formulário" 
            />
        </div>
    </div>

    <!-- Form Content -->
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5 class="m-0">Nova Série de Faturação</h5>
                    <Button 
                        label="Voltar" 
                        icon="pi pi-arrow-left" 
                        class="p-button-outlined"
                        @click="goBack"
                        size="small"
                    />
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
                            <InputText
                                id="name"
                                v-model="formData.name"
                                placeholder="Ex: Faturas 2025"
                                :class="{ 'p-invalid': formErrors.name }"
                                @input="watchFormChanges"
                            />
                            <small v-if="formErrors.name" class="p-error">{{ formErrors.name }}</small>
                        </div>

                        <!-- Tipo de Documento -->
                        <div class="col-12 md:col-6">
                            <label for="document_type" class="block text-900 font-medium mb-2">Tipo de Documento *</label>
                            <Dropdown
                                id="document_type"
                                v-model="formData.document_type"
                                :options="documentTypeOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione o tipo"
                                :class="{ 'p-invalid': formErrors.document_type }"
                                @change="generateSampleData"
                            />
                            <small v-if="formErrors.document_type" class="p-error">{{ formErrors.document_type }}</small>
                        </div>

                        <!-- Prefixo -->
                        <div class="col-12 md:col-4">
                            <label for="prefix" class="block text-900 font-medium mb-2">Prefixo *</label>
                            <InputText
                                id="prefix"
                                v-model="formData.prefix"
                                placeholder="Ex: FAT2025"
                                :class="{ 'p-invalid': formErrors.prefix }"
                                @input="watchFormChanges"
                            />
                            <small v-if="formErrors.prefix" class="p-error">{{ formErrors.prefix }}</small>
                        </div>

                        <!-- Separador -->
                        <div class="col-12 md:col-4">
                            <label for="separator" class="block text-900 font-medium mb-2">Separador</label>
                            <Dropdown
                                id="separator"
                                v-model="formData.separator"
                                :options="separatorOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione o separador"
                                @change="watchFormChanges"
                            />
                        </div>

                        <!-- Preenchimento -->
                        <div class="col-12 md:col-4">
                            <label for="number_padding" class="block text-900 font-medium mb-2">Preenchimento *</label>
                            <InputNumber
                                id="number_padding"
                                v-model="formData.number_padding"
                                :min="1"
                                :max="10"
                                placeholder="3"
                                :class="{ 'p-invalid': formErrors.number_padding }"
                                @input="watchFormChanges"
                            />
                            <small v-if="formErrors.number_padding" class="p-error">{{ formErrors.number_padding }}</small>
                            <small class="text-600">Número de dígitos (ex: 3 = 001, 002)</small>
                        </div>

                        <!-- Numeração -->
                        <div class="col-12">
                            <h6 class="text-primary mb-3 mt-4">Configuração de Numeração</h6>
                        </div>

                        <!-- Número Inicial -->
                        <div class="col-12 md:col-6">
                            <label for="start_number" class="block text-900 font-medium mb-2">Número Inicial *</label>
                            <InputNumber
                                id="start_number"
                                v-model="formData.start_number"
                                :min="1"
                                placeholder="1"
                                :class="{ 'p-invalid': formErrors.start_number }"
                                @input="watchFormChanges"
                            />
                            <small v-if="formErrors.start_number" class="p-error">{{ formErrors.start_number }}</small>
                        </div>

                        <!-- Número Final -->
                        <div class="col-12 md:col-6">
                            <label for="end_number" class="block text-900 font-medium mb-2">Número Final *</label>
                            <InputNumber
                                id="end_number"
                                v-model="formData.end_number"
                                :min="1"
                                placeholder="9999"
                                :class="{ 'p-invalid': formErrors.end_number }"
                                @input="watchFormChanges"
                            />
                            <small v-if="formErrors.end_number" class="p-error">{{ formErrors.end_number }}</small>
                        </div>

                        <!-- Preview do Número -->
                        <div class="col-12" v-if="previewNumber">
                            <div class="border-1 border-300 border-round p-3 bg-gray-50">
                                <h6 class="text-900 mb-2">Pré-visualização do Número:</h6>
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
                            <Dropdown
                                id="status"
                                v-model="formData.status"
                                :options="statusOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione o status"
                            />
                        </div>

                        <!-- Série Ativa -->
                        <div class="col-12 md:col-6 flex align-items-center">
                            <div class="field-checkbox">
                                <Checkbox 
                                    id="is_active" 
                                    v-model="formData.is_active" 
                                    :binary="true" 
                                />
                                <label for="is_active" class="ml-2">Definir como série ativa</label>
                            </div>
                            <small class="text-600 mt-2 block w-full">
                                Apenas uma série pode estar ativa por tipo de documento
                            </small>
                        </div>

                        <!-- Descrição -->
                        <div class="col-12">
                            <label for="description" class="block text-900 font-medium mb-2">Descrição</label>
                            <Textarea
                                id="description"
                                v-model="formData.description"
                                rows="3"
                                placeholder="Descrição opcional da série..."
                            />
                        </div>

                        <!-- Buttons -->
                        <div class="col-12">
                            <div class="flex justify-content-end gap-3 mt-4">
                                <Button 
                                    label="Resetar" 
                                    icon="pi pi-refresh" 
                                    class="p-button-outlined"
                                    @click="resetForm"
                                    type="button"
                                />
                                <Button 
                                    label="Cancelar" 
                                    icon="pi pi-times" 
                                    class="p-button-outlined"
                                    @click="goBack"
                                    type="button"
                                />
                                <Button 
                                    label="Salvar Série" 
                                    icon="pi pi-check" 
                                    class="p-button-primary"
                                    type="submit"
                                    :loading="loadingButton"
                                />
                            </div>
                        </div>
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
