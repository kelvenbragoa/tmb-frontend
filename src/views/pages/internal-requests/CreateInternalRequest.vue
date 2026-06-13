<script setup>
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Divider from 'primevue/divider';

// Services
import InternalRequestService from '@/service/InternalRequestService';

const router = useRouter();
const toast = useToast();

// State
const saving = ref(false);
const errors = ref({});

// Form data - Obter usuário logado do localStorage
const getCurrentUser = () => {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.name || 'Usuário não identificado';
        }
        return 'Usuário não identificado';
    } catch (error) {
        console.warn('Erro ao obter usuário do localStorage:', error);
        return 'Usuário não identificado';
    }
};

const formData = ref({
    title: '',
    description: '',
    priority: 'medium',
    requested_by: getCurrentUser(), // Preenchido automaticamente
    request_date: new Date(),
    required_date: null,
    notes: '',
    items: [
        {
            description: '',
            quantity: 1,
            unit: 'un',
            unit_price: 0,
            total: 0
        }
    ]
});

// Options
const priorityOptions = computed(() => InternalRequestService.getPriorityOptions());

// Reactive total calculation
const totalCalculado = ref(0);

const recalcularTotais = () => {
    let subtotal = 0;
    formData.value.items.forEach((item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const itemTotal = quantity * unitPrice;
        item.total = itemTotal; // Atualiza o total do item
        subtotal += itemTotal;
    });
    totalCalculado.value = subtotal;
};

// Computed totals
const totals = computed(() => {
    return {
        subtotal: totalCalculado.value,
        total: totalCalculado.value
    };
});

// Utility functions
const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'MT 0,00';
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
        .format(value)
        .replace('MZN', 'MT');
};
const formatDateForAPI = (date) => {
    if (!date) return null;
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return date;
};

// Item management
const addItem = () => {
    formData.value.items.push({
        description: '',
        quantity: 1,
        unit: 'un',
        unit_price: 0,
        total: 0
    });
};

const removeItem = (index) => {
    if (formData.value.items.length > 1) {
        formData.value.items.splice(index, 1);
        // Recalculate totals after removing item
        calculateAllTotals();
    }
};

const calculateItemTotal = async (index) => {
    const item = formData.value.items[index];
    if (item) {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        item.total = quantity * unitPrice;
        
        // Recalcular totais gerais
        recalcularTotais();
        
        // Forçar reatividade
        await nextTick();
        formData.value.items = [...formData.value.items];
    }
};

const calculateAllTotals = async () => {
    for (let i = 0; i < formData.value.items.length; i++) {
        await calculateItemTotal(i);
    }
    recalcularTotais();
};

// Validation methods
const validateForm = () => {
    const newErrors = {};

    if (!formData.value.title) {
        newErrors.title = 'Título é obrigatório';
    }

    if (!formData.value.description) {
        newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.value.request_date) {
        newErrors.request_date = 'Data da requisição é obrigatória';
    }

    // Validar itens
    const hasValidItems = formData.value.items.some((item) => item.description && item.quantity > 0);

    if (!hasValidItems) {
        newErrors.items = 'Adicione pelo menos um item válido';
    }

    formData.value.items.forEach((item, index) => {
        if (item.description && (!item.quantity || item.quantity <= 0)) {
            newErrors[`items.${index}.quantity`] = 'Quantidade deve ser maior que 0';
        }
        if (item.description && !item.unit) {
            newErrors[`items.${index}.unit`] = 'Unidade é obrigatória';
        }
    });

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

// Form submission
const saveRequest = async () => {
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
        saving.value = true;

        // Criar dados para envio sem o requested_by (não é enviado para o backend)
        const requestData = {
            title: formData.value.title,
            description: formData.value.description,
            priority: formData.value.priority,
            request_date: formatDateForAPI(formData.value.request_date),
            required_date: formatDateForAPI(formData.value.required_date),
            notes: formData.value.notes,
            items: formData.value.items,
            ...totals.value
        };

        const response = await InternalRequestService.createInternalRequest(requestData);

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Requisição criada: ${response.request_number}`,
            life: 3000
        });

        router.push('/internal-requests');
    } catch (error) {
        console.error('Erro ao criar requisição:', error);
        
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao criar requisição',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

const cancel = () => {
    router.push('/internal-requests');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5 class="m-0">Nova Requisição Interna</h5>
                    <div class="flex gap-2">
                        <Button label="Cancelar" icon="pi pi-times" outlined @click="cancel" />
                        <Button label="Salvar" icon="pi pi-check" @click="saveRequest" :loading="saving" />
                    </div>
                </div>

                <form @submit.prevent="saveRequest" data-vue-form="internal-request" autocomplete="off">
                    <!-- Basic Information -->
                    <div class="card mb-4">
                        <h6>Informações Básicas</h6>
                        <div class="grid">
                            <div class="col-12 md:col-8">
                                <div class="field">
                                    <label for="title" class="block font-medium mb-2">Título *</label>
                                    <InputText id="title" v-model="formData.title" placeholder="Digite o título da requisição" class="w-full" :class="{ 'p-invalid': errors.title }" autocomplete="off" />
                                    <small class="p-error" v-if="errors.title">{{ errors.title }}</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-4">
                                <div class="field">
                                    <label for="priority" class="block font-medium mb-2">Prioridade</label>
                                    <Dropdown id="priority" v-model="formData.priority" :options="priorityOptions" optionLabel="label" optionValue="value" placeholder="Selecione a prioridade" class="w-full" />
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="field">
                                    <label for="description" class="block font-medium mb-2">Descrição *</label>
                                    <Textarea id="description" v-model="formData.description" placeholder="Descreva os detalhes da requisição" rows="4" class="w-full" :class="{ 'p-invalid': errors.description }" />
                                    <small class="p-error" v-if="errors.description">{{ errors.description }}</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="requestedBy" class="block font-medium mb-2">Solicitante</label>
                                    <InputText id="requestedBy" v-model="formData.requested_by" readonly class="w-full" style="background-color: #f8f9fa; cursor: not-allowed" />
                                    <small class="text-500">Preenchido automaticamente com o usuário logado</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="requestDate" class="block font-medium mb-2">Data da Requisição *</label>
                                    <Calendar id="requestDate" v-model="formData.request_date" placeholder="Selecione a data da requisição" class="w-full" :class="{ 'p-invalid': errors.request_date }" dateFormat="dd/mm/yy" :showIcon="true" />
                                    <small class="p-error" v-if="errors.request_date">{{ errors.request_date }}</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="requiredDate" class="block font-medium mb-2">Data Necessária</label>
                                    <Calendar id="requiredDate" v-model="formData.required_date" placeholder="Selecione a data necessária" class="w-full" dateFormat="dd/mm/yy" :showIcon="true" />
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="field">
                                    <label for="notes" class="block font-medium mb-2">Observações</label>
                                    <Textarea id="notes" v-model="formData.notes" placeholder="Observações adicionais" rows="3" class="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Items Section -->
                    <div class="card">
                        <div class="flex justify-content-between align-items-center mb-4">
                            <h6 class="m-0">Items da Requisição</h6>
                            <Button label="Adicionar Item" icon="pi pi-plus" class="p-button-sm" @click="addItem" />
                        </div>

                        <DataTable :value="formData.items" responsiveLayout="scroll" class="p-datatable-sm">
                            <template #empty>
                                <div class="text-center p-4">
                                    <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                                    <p class="text-600 font-medium">Nenhum item adicionado</p>
                                    <Button label="Adicionar primeiro item" icon="pi pi-plus" class="p-button-sm" @click="addItem" />
                                </div>
                            </template>

                            <Column field="description" header="Descrição" style="min-width: 200px">
                                <template #body="{ data, index }">
                                    <InputText v-model="data.description" placeholder="Descrição do item" :class="{ 'p-invalid': errors[`items.${index}.description`] }" @input="calculateItemTotal(index)" autocomplete="off" />
                                </template>
                            </Column>

                            <Column field="quantity" header="Qtd" style="width: 120px">
                                <template #body="{ data, index }">
                                    <InputNumber
                                        v-model="data.quantity"
                                        :min="0"
                                        :maxFractionDigits="2"
                                        :class="{ 'p-invalid': errors[`items.${index}.quantity`] }"
                                        @update:modelValue="() => calculateItemTotal(index)"
                                        @blur="() => calculateItemTotal(index)"
                                    />
                                </template>
                            </Column>

                            <Column field="unit" header="Unidade" style="width: 100px">
                                <template #body="{ data, index }">
                                    <InputText v-model="data.unit" placeholder="un, kg, m" :class="{ 'p-invalid': errors[`items.${index}.unit`] }" autocomplete="off" />
                                </template>
                            </Column>

                            <Column field="unit_price" header="Preço Unit." style="width: 140px">
                                <template #body="{ data, index }">
                                    <InputNumber v-model="data.unit_price" mode="currency" currency="MZN" locale="pt-PT" :min="0" :maxFractionDigits="2" @update:modelValue="() => calculateItemTotal(index)" @blur="() => calculateItemTotal(index)" />
                                </template>
                            </Column>

                            <Column field="total" header="Total" style="width: 140px">
                                <template #body="{ data }">
                                    <span class="font-bold">{{ formatCurrency(data.total || 0) }}</span>
                                </template>
                            </Column>

                            <Column header="Ações" style="width: 80px">
                                <template #body="{ index }">
                                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" @click="removeItem(index)" :disabled="formData.items.length === 1" />
                                </template>
                            </Column>
                        </DataTable>

                        <div v-if="errors.items" class="p-error mt-2">
                            {{ errors.items }}
                        </div>
                    </div>

                    <!-- Resumo Financeiro -->
                    <div class="mt-4">
                        <div class="grid">
                            <div class="col-12 md:col-8"></div>
                            <div class="col-12 md:col-4">
                                <div class="surface-100 p-3 border-round">
                                    <h5 class="mt-0 mb-3">Resumo Financeiro</h5>
                                    
                                    <div class="flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>{{ formatCurrency(totals.subtotal) }}</span>
                                    </div>
                                    
                                    <Divider />
                                    
                                    <div class="flex justify-content-between">
                                        <span class="font-bold text-lg">Total:</span>
                                        <span class="font-bold text-lg text-primary">{{ formatCurrency(totals.total) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="flex justify-content-end gap-3 mt-4">
                        <Button label="Cancelar" icon="pi pi-times" outlined @click="cancel" />
                        <Button label="Salvar" icon="pi pi-check" @click="saveRequest" :loading="saving" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-error {
    color: #ef4444;
    font-size: 0.875rem;
}

.p-invalid {
    border-color: #ef4444;
}

/* Prevent browser extension interference */
.p-inputtext,
.p-dropdown,
.p-calendar input,
.p-inputnumber input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

/* Disable browser autocomplete styling */
.p-inputtext:-webkit-autofill,
.p-inputtext:-webkit-autofill:hover,
.p-inputtext:-webkit-autofill:focus,
.p-inputnumber input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px white inset !important;
    -webkit-text-fill-color: #495057 !important;
}

/* Ensure proper z-index for PrimeVue components */
.p-datatable {
    position: relative;
    z-index: 1;
}

.p-dropdown-panel,
.p-calendar-panel {
    z-index: 9999 !important;
}
</style>
