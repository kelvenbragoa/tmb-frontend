<script setup>
import RouteCategoryService from '@/service/RouteCategoryService';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);
const categoryData = ref(null);
const displayConfirmation = ref(false);
const loadingButtonDelete = ref(false);

const categoryId = computed(() => parseInt(route.params.id));

const getData = async () => {
    loading.value = true;
    try {
        const response = await RouteCategoryService.getRouteCategoryById(categoryId.value);
        categoryData.value = response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao carregar categoria', 
            life: 3000 
        });
        router.push('/transport/route-categories');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.back();
};

const confirmDeletion = () => {
    displayConfirmation.value = true;
};

const closeConfirmation = () => {
    displayConfirmation.value = false;
};

const deleteData = async () => {
    loadingButtonDelete.value = true;
    try {
        await RouteCategoryService.deleteRouteCategory(categoryId.value);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Categoria excluída com sucesso', 
            life: 3000 
        });
        router.push('/transport/route-categories');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao excluir categoria', 
            life: 3000 
        });
    } finally {
        loadingButtonDelete.value = false;
        closeConfirmation();
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="grid" v-if="loading">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>
    
    <div class="grid" v-else-if="categoryData">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes da Categoria</h5>
                    <div class="flex gap-2">
                        <Button label="Voltar" @click="goBack" severity="secondary">
                            <i class="pi pi-arrow-left"></i>
                        </Button>
                        <router-link :to="'/transport/route-categories/' + categoryId + '/edit'">
                            <Button label="Editar" severity="info">
                                <i class="pi pi-pencil"></i>
                            </Button>
                        </router-link>
                        <Button 
                            label="Excluir" 
                            severity="danger" 
                            @click="confirmDeletion"
                        >
                            <i class="pi pi-trash"></i>
                        </Button>
                    </div>
                </div>

                <div class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações Básicas</h6>
                            
                            <div class="field mb-3">
                                <label class="font-medium text-900">ID:</label>
                                <div class="mt-1">{{ categoryData.id }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Nome:</label>
                                <div class="mt-1 font-medium">{{ categoryData.name }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Status:</label>
                                <div class="mt-1">
                                    <Tag :value="categoryData.is_active ? 'Ativa' : 'Inativa'" :severity="categoryData.is_active ? 'success' : 'danger'" />
                                </div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Descrição:</label>
                                <div class="mt-1">{{ categoryData.description || 'Sem descrição' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações de Auditoria -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações de Auditoria</h6>
                            
                            <div class="field mb-3">
                                <label class="font-medium text-900">Criado por:</label>
                                <div class="mt-1">{{ categoryData.createdBy?.name || '-' }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Data de Criação:</label>
                                <div class="mt-1">{{ moment(categoryData.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Atualizado por:</label>
                                <div class="mt-1">{{ categoryData.updatedBy?.name || '-' }}</div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Data de Atualização:</label>
                                <div class="mt-1">{{ moment(categoryData.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Rotas Associadas -->
                    <div class="col-12" v-if="categoryData.routes && categoryData.routes.length > 0">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Rotas Associadas ({{ categoryData.routes.length }})</h6>
                            
                            <div class="grid">
                                <div 
                                    v-for="route in categoryData.routes" 
                                    :key="route.id" 
                                    class="col-12 md:col-6 lg:col-4"
                                >
                                    <div class="border-1 surface-border border-round p-3">
                                        <div class="flex align-items-center justify-content-between">
                                            <div>
                                                <div class="font-medium">{{ route.name }}</div>
                                                <div class="text-sm text-600 mt-1">
                                                    {{ route.origin }} → {{ route.destination }}
                                                </div>
                                            </div>
                                            <router-link :to="'/transport/routes/' + route.id">
                                                <Button 
                                                    icon="pi pi-external-link" 
                                                    class="p-button-text p-button-sm" 
                                                    v-tooltip.top="'Ver rota'"
                                                />
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sem rotas associadas -->
                    <div class="col-12" v-else>
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Rotas Associadas</h6>
                            <div class="text-center py-4">
                                <i class="pi pi-inbox text-400" style="font-size: 3rem"></i>
                                <div class="text-600 mt-3">Nenhuma rota associada a esta categoria</div>
                                <div class="text-sm text-600 mt-1">
                                    As rotas criadas com esta categoria aparecerão aqui
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Dialog header="Confirmação" v-model:visible="displayConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja excluir esta categoria?</span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Excluir" icon="pi pi-check" @click="deleteData" class="p-button-text" :loading="loadingButtonDelete" autofocus />
        </template>
    </Dialog>
</template>