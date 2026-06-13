<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Services  
import InternalRequestService from '@/service/InternalRequestService';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const loading = ref(false);
const saving = ref(false);
const originalRequest = ref(null);

// Obter usuário logado do localStorage
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

// Form data
const form = reactive({
    title: '',
    description: '',
    priority: 'medium',
    requestedBy: getCurrentUser(), // Preenchido automaticamente
    requestDate: null,
    requiredDate: null,
    items: [],
    notes: ''
});

// Form validation
const errors = ref({});

// Get request ID from route
const requestId = computed(() => route.params.id);

// Options
const priorityOptions = computed(() => InternalRequestService.getPriorityOptions());

// Item management
const itemDialog = ref(false);
const editingItemIndex = ref(-1);
const currentItem = ref({
    description: '',
    quantity: 1,
    unit: '',
    unit_price: 0,
    total: 0
});

// Load request data
const loadRequest = async () => {
    try {
        loading.value = true;
        originalRequest.value = await InternalRequestService.getInternalRequest(requestId.value);
        
        // Populate form
        Object.assign(form, {
            title: originalRequest.value.title,
            description: originalRequest.value.description,
            priority: originalRequest.value.priority,
            requestedBy: getCurrentUser(), // Mantém o usuário logado
            requestDate: new Date(originalRequest.value.request_date),
            requiredDate: originalRequest.value.required_date ? new Date(originalRequest.value.required_date) : null,
            items: [...(originalRequest.value.items || [])],
            notes: originalRequest.value.notes || ''
        });
        
    } catch (error) {
        console.error('Erro ao carregar requisição:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar requisição interna',
            life: 3000
        });
        router.push('/internal-requests');
    } finally {
        loading.value = false;
    }
};

// Validation methods
const validateForm = () => {
    errors.value = {};

    if (!form.title) {
        errors.value.title = 'Título é obrigatório';
    }

    if (!form.description) {
        errors.value.description = 'Descrição é obrigatória';
    }

    if (!form.requestDate) {
        errors.value.requestDate = 'Data da requisição é obrigatória';
    }

    if (form.items.length === 0) {
        errors.value.items = 'Pelo menos um item é obrigatório';
    }

    return Object.keys(errors.value).length === 0;
};

const validateItem = () => {
    const itemErrors = {};

    if (!currentItem.value.description) {
        itemErrors.description = 'Descrição é obrigatória';
    }

    if (!currentItem.value.quantity || currentItem.value.quantity <= 0) {
        itemErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    if (!currentItem.value.unit) {
        itemErrors.unit = 'Unidade é obrigatória';
    }

    if (currentItem.value.unit_price < 0) {
        itemErrors.unit_price = 'Preço unitário não pode ser negativo';
    }

    return Object.keys(itemErrors).length === 0;
};

// Item methods
const addItem = () => {
    currentItem.value = {
        description: '',
        quantity: 1,
        unit: '',
        unit_price: 0,
        total: 0
    };
    editingItemIndex.value = -1;
    itemDialog.value = true;
};

const editItem = (index) => {
    currentItem.value = { ...form.items[index] };
    editingItemIndex.value = index;
    itemDialog.value = true;
};

const saveItem = () => {
    if (!validateItem()) {
        return;
    }

    // Calculate total
    currentItem.value.total = currentItem.value.quantity * currentItem.value.unit_price;

    if (editingItemIndex.value >= 0) {
        form.items[editingItemIndex.value] = { ...currentItem.value };
    } else {
        form.items.push({ ...currentItem.value });
    }

    itemDialog.value = false;
};

const removeItem = (index) => {
    form.items.splice(index, 1);
};

const cancelItemDialog = () => {
    itemDialog.value = false;
};

// Computed totals
const subtotal = computed(() => {
    return form.items.reduce((sum, item) => {
        return sum + calculateItemTotal(item);
    }, 0);
});

const total = computed(() => {
    return subtotal.value;
});

// Form submission
const save = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Por favor, corrija os erros no formulário',
            life: 3000
        });
        return;
    }

    try {
        saving.value = true;

        // Criar dados para envio sem o requestedBy (não é enviado para o backend)
        const requestData = {
            title: form.title,
            description: form.description,
            priority: form.priority,
            request_date: formatDateForAPI(form.requestDate),
            required_date: formatDateForAPI(form.requiredDate),
            items: form.items,
            notes: form.notes,
            total: total.value,
            subtotal: subtotal.value
        };

        const response = await InternalRequestService.updateInternalRequest(requestId.value, requestData);

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Requisição atualizada com sucesso',
            life: 3000
        });

        router.push(`/internal-requests/${response.id}`);
    } catch (error) {
        console.error('Erro ao atualizar requisição:', error);
        
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        }
        
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.response?.data?.message || 'Erro ao atualizar requisição',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

const cancel = () => {
    router.push(`/internal-requests/${requestId.value}`);
};

// Permissions
const canEdit = computed(() => {
    if (!originalRequest.value) return false;
    // Mock current user - em produção deve vir do auth store
    const mockCurrentUser = { id: 1, role: 'admin', permissions: ['approve_requests'] };
    return InternalRequestService.canEdit(originalRequest.value, mockCurrentUser);
});

// Utility methods
const formatCurrency = (value) => InternalRequestService.formatCurrency(value);
const getStatusLabel = (status) => InternalRequestService.getStatusLabel(status);
const getStatusSeverity = (status) => InternalRequestService.getStatusSeverity(status);

const formatDateForAPI = (date) => {
    if (!date) return null;
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return date;
};

// Calculate item total
const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
};

// Update item total when quantity or unit price changes
const updateItemTotal = () => {
    currentItem.value.total = currentItem.value.quantity * currentItem.value.unit_price;
};

onMounted(() => {
    loadRequest();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!-- Header -->
                <div class="flex justify-content-between align-items-center mb-4">
                    <div class="flex align-items-center gap-3">
                        <Button icon="pi pi-arrow-left" class="p-button-text p-button-rounded" v-tooltip.right="'Voltar'" @click="cancel" />
                        <div v-if="originalRequest">
                            <h5 class="m-0">Editar {{ originalRequest.request_number }}</h5>
                            <div class="flex align-items-center gap-2 mt-1">
                                <Tag :value="getStatusLabel(originalRequest.status)" :severity="getStatusSeverity(originalRequest.status)" class="font-semibold" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <Button label="Cancelar" icon="pi pi-times" class="p-button-outlined" @click="cancel" />
                        <Button label="Salvar" icon="pi pi-check" class="p-button-primary" @click="save" :loading="saving" :disabled="!canEdit" />
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-content-center align-items-center" style="min-height: 200px">
                    <ProgressSpinner />
                </div>

                <!-- Form -->
                <form v-else-if="originalRequest" @submit.prevent="save">
                    <!-- Permission Check -->
                    <Message v-if="!canEdit" severity="warn" class="mb-4">Esta requisição não pode ser editada no status atual.</Message>

                    <!-- Basic Information -->
                    <div class="card mb-4">
                        <h6>Informações Básicas</h6>
                        <div class="grid">
                            <div class="col-12 md:col-8">
                                <div class="field">
                                    <label for="title" class="block font-medium mb-2">Título *</label>
                                    <InputText id="title" v-model="form.title" placeholder="Digite o título da requisição" class="w-full" :class="{ 'p-invalid': errors.title }" :disabled="!canEdit" />
                                    <small class="p-error" v-if="errors.title">{{ errors.title }}</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-4">
                                <div class="field">
                                    <label for="priority" class="block font-medium mb-2">Prioridade</label>
                                    <Dropdown id="priority" v-model="form.priority" :options="priorityOptions" optionLabel="label" optionValue="value" placeholder="Selecione a prioridade" class="w-full" :disabled="!canEdit" />
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="field">
                                    <label for="description" class="block font-medium mb-2">Descrição *</label>
                                    <Textarea id="description" v-model="form.description" placeholder="Descreva os detalhes da requisição" rows="4" class="w-full" :class="{ 'p-invalid': errors.description }" :disabled="!canEdit" />
                                    <small class="p-error" v-if="errors.description">{{ errors.description }}</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="requestedBy" class="block font-medium mb-2">Solicitante</label>
                                    <InputText id="requestedBy" v-model="form.requestedBy" readonly class="w-full" style="background-color: #f8f9fa; cursor: not-allowed" />
                                    <small class="text-500">Preenchido automaticamente com o usuário logado</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="requestDate" class="block font-medium mb-2">Data da Requisição *</label>
                                    <Calendar id="requestDate" v-model="form.requestDate" placeholder="Selecione a data da requisição" class="w-full" :class="{ 'p-invalid': errors.requestDate }" dateFormat="dd/mm/yy" :showIcon="true" :disabled="!canEdit" />
                                    <small class="p-error" v-if="errors.requestDate">{{ errors.requestDate }}</small>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="requiredDate" class="block font-medium mb-2">Data Necessária</label>
                                    <Calendar id="requiredDate" v-model="form.requiredDate" placeholder="Selecione a data necessária" class="w-full" dateFormat="dd/mm/yy" :showIcon="true" :disabled="!canEdit" />
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="field">
                                    <label for="notes" class="block font-medium mb-2">Observações</label>
                                    <Textarea id="notes" v-model="form.notes" placeholder="Observações adicionais" rows="3" class="w-full" :disabled="!canEdit" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Items -->
                    <div class="card">
                        <div class="flex justify-content-between align-items-center mb-4">
                            <h6 class="m-0">Items da Requisição</h6>
                            <Button label="Adicionar Item" icon="pi pi-plus" class="p-button-primary p-button-sm" @click="addItem" :disabled="!canEdit" />
                        </div>

                        <div v-if="errors.items" class="p-error mb-3">{{ errors.items }}</div>

                        <DataTable :value="form.items" responsiveLayout="scroll" :paginator="false" dataKey="description">
                            <template #empty>
                                <div class="text-center p-4">
                                    <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                                    <p class="text-600 font-medium">Nenhum item adicionado</p>
                                    <Button label="Adicionar primeiro item" icon="pi pi-plus" class="p-button-sm" @click="addItem" :disabled="!canEdit" />
                                </div>
                            </template>

                            <Column field="description" header="Descrição" style="min-width: 15rem">
                                <template #body="{ data }">
                                    <span class="font-medium">{{ data.description }}</span>
                                </template>
                            </Column>

                            <Column field="quantity" header="Quantidade" style="min-width: 8rem">
                                <template #body="{ data }">
                                    {{ data.quantity }}
                                </template>
                            </Column>

                            <Column field="unit" header="Unidade" style="min-width: 8rem">
                                <template #body="{ data }">
                                    {{ data.unit }}
                                </template>
                            </Column>

                            <Column field="unit_price" header="Preço Unit." style="min-width: 10rem">
                                <template #body="{ data }">
                                    {{ formatCurrency(data.unit_price) }}
                                </template>
                            </Column>

                            <Column field="total" header="Total" style="min-width: 10rem">
                                <template #body="{ data }">
                                    <span class="font-semibold">{{ formatCurrency(calculateItemTotal(data)) }}</span>
                                </template>
                            </Column>

                            <Column header="Ações" style="min-width: 8rem" v-if="canEdit">
                                <template #body="{ index }">
                                    <div class="flex gap-2">
                                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" severity="warning" v-tooltip.top="'Editar'" @click="editItem(index)" />
                                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm" severity="danger" v-tooltip.top="'Remover'" @click="removeItem(index)" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>

                        <!-- Totals -->
                        <div class="flex justify-content-end mt-4" v-if="form.items.length > 0">
                            <div class="border-1 border-300 border-round p-3" style="min-width: 300px">
                                <div class="flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
                                </div>
                                <Divider class="my-2" />
                                <div class="flex justify-content-between">
                                    <span class="font-bold">Total:</span>
                                    <span class="font-bold text-xl">{{ formatCurrency(total) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Item Dialog -->
    <Dialog v-model:visible="itemDialog" modal header="Item da Requisição" style="width: 500px" :closable="false">
        <div class="grid">
            <div class="col-12">
                <div class="field">
                    <label for="itemDescription" class="block font-medium mb-2">Descrição *</label>
                    <InputText id="itemDescription" v-model="currentItem.description" placeholder="Digite a descrição do item" class="w-full" />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="itemQuantity" class="block font-medium mb-2">Quantidade *</label>
                    <InputNumber id="itemQuantity" v-model="currentItem.quantity" :min="0" :step="1" class="w-full" @input="updateItemTotal" />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="itemUnit" class="block font-medium mb-2">Unidade *</label>
                    <InputText id="itemUnit" v-model="currentItem.unit" placeholder="Ex: un, kg, m" class="w-full" />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="itemUnitPrice" class="block font-medium mb-2">Preço Unitário</label>
                    <InputNumber id="itemUnitPrice" v-model="currentItem.unit_price" :min="0" :step="0.01" mode="currency" currency="EUR" locale="pt-PT" class="w-full" @input="updateItemTotal" />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label class="block font-medium mb-2">Total</label>
                    <div class="p-3 border-1 border-300 border-round bg-gray-50">
                        <span class="font-semibold">{{ formatCurrency(currentItem.total) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-outlined" @click="cancelItemDialog" />
                <Button label="Salvar" icon="pi pi-check" class="p-button-primary" @click="saveItem" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.p-error {
    color: #ef4444;
    font-size: 0.875rem;
}

.p-invalid {
    border-color: #ef4444;
}

.field label {
    font-weight: 600;
}
</style>