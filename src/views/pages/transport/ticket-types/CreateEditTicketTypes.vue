<script setup>
import TicketTypeService from '@/service/TicketTypeService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const isEditing = ref(false);
const ticketTypeId = ref(null);

const formData = ref({
    name: '',
    description: '',
    code: '',
    is_active: true
});

const errors = ref({});

const isEditMode = () => {
    return route.params.id !== undefined;
};

const loadTicketType = async () => {
    if (!isEditMode()) return;
    
    loading.value = true;
    try {
        const response = await TicketTypeService.getTicketTypeById(route.params.id);
        formData.value = {
            name: response.name,
            description: response.description || '',
            code: response.code,
            is_active: response.is_active
        };
        ticketTypeId.value = response.id;
        isEditing.value = true;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.response?.data?.message || 'Erro ao carregar tipo de bilhete',
            life: 5000
        });
        router.push('/transport/ticket-types');
    } finally {
        loading.value = false;
    }
};

const validateForm = () => {
    errors.value = {};
    
    if (!formData.value.name.trim()) {
        errors.value.name = 'Nome é obrigatório';
    }
    
    if (!formData.value.code.trim()) {
        errors.value.code = 'Código é obrigatório';
    } else if (formData.value.code.length > 10) {
        errors.value.code = 'Código deve ter no máximo 10 caracteres';
    }
    
    return Object.keys(errors.value).length === 0;
};

const saveTicketType = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Validação',
            detail: 'Por favor, corrija os erros do formulário',
            life: 3000
        });
        return;
    }
    
    loading.value = true;
    try {
        const dataToSend = {
            name: formData.value.name.trim(),
            description: formData.value.description.trim(),
            code: formData.value.code.trim().toUpperCase(),
            is_active: formData.value.is_active
        };

        if (isEditing.value) {
            await TicketTypeService.updateTicketType(ticketTypeId.value, dataToSend);
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Tipo de bilhete atualizado com sucesso',
                life: 3000
            });
        } else {
            await TicketTypeService.createTicketType(dataToSend);
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Tipo de bilhete criado com sucesso',
                life: 3000
            });
        }
        
        router.push('/transport/ticket-types');
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar tipo de bilhete';
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

const cancelForm = () => {
    router.push('/transport/ticket-types');
};

onMounted(() => {
    loadTicketType();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">{{ isEditing ? 'Editar Tipo de Bilhete' : 'Novo Tipo de Bilhete' }}</h5>
                </div>

                <form @submit.prevent="saveTicketType" v-if="!loading || isEditing">
                    <div class="grid">
                        <!-- Nome -->
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="name" class="font-medium">Nome *</label>
                                <InputText 
                                    id="name"
                                    v-model="formData.name"
                                    :class="{ 'p-invalid': errors.name }"
                                    placeholder="Ex: Adulto, Criança, Estudante..."
                                    class="w-full"
                                />
                                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                            </div>
                        </div>

                        <!-- Código -->
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="code" class="font-medium">Código *</label>
                                <InputText 
                                    id="code"
                                    v-model="formData.code"
                                    :class="{ 'p-invalid': errors.code }"
                                    placeholder="Ex: ADL, CRI, EST..."
                                    class="w-full"
                                    maxlength="10"
                                    style="text-transform: uppercase;"
                                />
                                <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
                                <small v-else class="text-600">Máximo 10 caracteres</small>
                            </div>
                        </div>

                        <!-- Descrição -->
                        <div class="col-12">
                            <div class="field">
                                <label for="description" class="font-medium">Descrição</label>
                                <Textarea 
                                    id="description"
                                    v-model="formData.description"
                                    placeholder="Descreva o tipo de bilhete..."
                                    class="w-full"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <!-- Status -->
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <div class="flex align-items-center">
                                    <Checkbox 
                                        id="is_active" 
                                        v-model="formData.is_active" 
                                        :binary="true" 
                                    />
                                    <label for="is_active" class="ml-2 font-medium">Ativo</label>
                                </div>
                                <small class="text-600">Tipos de bilhete inativos não aparecerão nas vendas</small>
                            </div>
                        </div>
                    </div>

                    <!-- Botões -->
                    <div class="flex gap-2 pt-4">
                        <Button 
                            type="submit" 
                            :label="isEditing ? 'Atualizar' : 'Criar'" 
                            :loading="loading"
                            icon="pi pi-check"
                        />
                        <Button 
                            label="Cancelar" 
                            @click="cancelForm"
                            class="p-button-outlined"
                            icon="pi pi-times"
                            :disabled="loading"
                        />
                    </div>
                </form>

                <!-- Loading state -->
                <div v-else class="text-center py-8">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                    <p class="mt-3">Carregando dados do tipo de bilhete...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
}
</style>