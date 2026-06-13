<script setup>
import RouteService from '@/service/RouteService';
import RouteCategoryService from '@/service/RouteCategoryService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const isEditing = ref(false);
const routeId = ref(null);
const categories = ref([]);
const loadingCategories = ref(false);

const formData = ref({
    name: '',
    origin: '',
    destination: '',
    description: '',
    categoryId: null,
    metadata: {
        distance: '',
        duration: ''
    },
    is_active: true
});

const errors = ref({});

const loadCategories = async () => {
    loadingCategories.value = true;
    try {
        const response = await RouteCategoryService.getAllRouteCategories({ page: 1, limit: 1000 });
        categories.value = response.items;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar categorias',
            life: 3000
        });
    } finally {
        loadingCategories.value = false;
    }
};

const isEditMode = () => {
    return route.params.id !== undefined;
};

const loadRoute = async () => {
    if (!isEditMode()) return;
    
    loading.value = true;
    try {
        const response = await RouteService.getRouteById(route.params.id);
        formData.value = {
            name: response.name,
            origin: response.origin,
            destination: response.destination,
            description: response.description || '',
            categoryId: response.categoryId || null,
            metadata: {
                distance: response.metadata?.distance || '',
                duration: response.metadata?.duration || ''
            },
            is_active: response.is_active
        };
        routeId.value = response.id;
        isEditing.value = true;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.response?.data?.message || 'Erro ao carregar rota',
            life: 5000
        });
        router.push('/transport/routes');
    } finally {
        loading.value = false;
    }
};

const validateForm = () => {
    errors.value = {};
    
    if (!formData.value.name.trim()) {
        errors.value.name = 'Nome da rota é obrigatório';
    }
    
    if (!formData.value.origin.trim()) {
        errors.value.origin = 'Origem é obrigatória';
    }
    
    if (!formData.value.destination.trim()) {
        errors.value.destination = 'Destino é obrigatório';
    }
    
    if (formData.value.origin.trim() === formData.value.destination.trim()) {
        errors.value.destination = 'Destino deve ser diferente da origem';
    }
    
    return Object.keys(errors.value).length === 0;
};

const saveRoute = async () => {
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
            origin: formData.value.origin.trim(),
            destination: formData.value.destination.trim(),
            description: formData.value.description.trim(),
            categoryId: formData.value.categoryId,
            is_active: formData.value.is_active
        };

        // Adicionar metadata apenas se houver dados
        if (formData.value.metadata.distance || formData.value.metadata.duration) {
            dataToSend.metadata = {};
            if (formData.value.metadata.distance) {
                dataToSend.metadata.distance = formData.value.metadata.distance.trim();
            }
            if (formData.value.metadata.duration) {
                dataToSend.metadata.duration = formData.value.metadata.duration.trim();
            }
        }

        if (isEditing.value) {
            await RouteService.updateRoute(routeId.value, dataToSend);
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Rota atualizada com sucesso',
                life: 3000
            });
        } else {
            await RouteService.createRoute(dataToSend);
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Rota criada com sucesso',
                life: 3000
            });
        }
        
        router.push('/transport/routes');
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar rota';
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
    router.push('/transport/routes');
};

onMounted(async () => {
    await loadCategories();
    await loadRoute();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">{{ isEditing ? 'Editar Rota' : 'Nova Rota' }}</h5>
                </div>

                <form @submit.prevent="saveRoute" v-if="!loading || isEditing">
                    <div class="grid">
                        <!-- Nome da Rota -->
                        <div class="col-12">
                            <div class="field">
                                <label for="name" class="font-medium">Nome da Rota *</label>
                                <InputText 
                                    id="name"
                                    v-model="formData.name"
                                    :class="{ 'p-invalid': errors.name }"
                                    placeholder="Ex: Maputo - Matola"
                                    class="w-full"
                                />
                                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                            </div>
                        </div>

                        <!-- Origem e Destino -->
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="origin" class="font-medium">Origem *</label>
                                <InputText 
                                    id="origin"
                                    v-model="formData.origin"
                                    :class="{ 'p-invalid': errors.origin }"
                                    placeholder="Ex: Maputo"
                                    class="w-full"
                                />
                                <small v-if="errors.origin" class="p-error">{{ errors.origin }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="destination" class="font-medium">Destino *</label>
                                <InputText 
                                    id="destination"
                                    v-model="formData.destination"
                                    :class="{ 'p-invalid': errors.destination }"
                                    placeholder="Ex: Matola"
                                    class="w-full"
                                />
                                <small v-if="errors.destination" class="p-error">{{ errors.destination }}</small>
                            </div>
                        </div>

                        <!-- Categoria -->
                        <div class="col-12">
                            <div class="field">
                                <label for="categoryId" class="font-medium">Categoria</label>
                                <Dropdown 
                                    id="categoryId"
                                    v-model="formData.categoryId"
                                    :options="categories"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Selecione uma categoria (opcional)"
                                    :loading="loadingCategories"
                                    class="w-full"
                                    showClear
                                    filter
                                >
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value">
                                            {{ categories.find(c => c.id === slotProps.value)?.name }}
                                        </div>
                                        <span v-else>{{ slotProps.placeholder }}</span>
                                    </template>
                                    <template #option="slotProps">
                                        <div>
                                            <div class="font-medium">{{ slotProps.option.name }}</div>
                                            <div class="text-sm text-600">{{ slotProps.option.description || 'Sem descrição' }}</div>
                                        </div>
                                    </template>
                                </Dropdown>
                                <small class="text-600">Opcional: categorize a rota para facilitar a organização</small>
                            </div>
                        </div>

                        <!-- Informações Extras -->
                        <!-- <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="distance" class="font-medium">Distância</label>
                                <InputText 
                                    id="distance"
                                    v-model="formData.metadata.distance"
                                    placeholder="Ex: 25km"
                                    class="w-full"
                                />
                                <small class="text-600">Opcional: distância entre origem e destino</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="duration" class="font-medium">Duração</label>
                                <InputText 
                                    id="duration"
                                    v-model="formData.metadata.duration"
                                    placeholder="Ex: 45min"
                                    class="w-full"
                                />
                                <small class="text-600">Opcional: tempo estimado de viagem</small>
                            </div>
                        </div> -->

                        <!-- Descrição -->
                        <div class="col-12">
                            <div class="field">
                                <label for="description" class="font-medium">Descrição</label>
                                <Textarea 
                                    id="description"
                                    v-model="formData.description"
                                    placeholder="Descreva a rota (pontos de interesse, observações, etc.)"
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
                                    <label for="is_active" class="ml-2 font-medium">Ativa</label>
                                </div>
                                <small class="text-600">Rotas inativas não aparecerão nas opções de viagem</small>
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
                    <p class="mt-3">Carregando dados da rota...</p>
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