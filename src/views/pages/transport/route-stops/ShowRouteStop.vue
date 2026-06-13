<script setup>
import RouteStopService from '@/service/RouteStopService';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);
const stopData = ref(null);
const displayConfirmation = ref(false);
const loadingButtonDelete = ref(false);

const stopId = computed(() => parseInt(route.params.id));

const getData = async () => {
    loading.value = true;
    try {
        const response = await RouteStopService.getRouteStopById(stopId.value);
        stopData.value = response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao carregar paragem', 
            life: 3000 
        });
        router.push('/transport/route-stops');
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
        await RouteStopService.deleteRouteStop(stopId.value);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Paragem excluída com sucesso', 
            life: 3000 
        });
        router.push('/transport/route-stops');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao excluir paragem', 
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
    
    <div class="grid" v-else-if="stopData">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes da Paragem</h5>
                    <div class="flex gap-2">
                        <Button label="Voltar" @click="goBack" severity="secondary">
                            <i class="pi pi-arrow-left"></i>
                        </Button>
                        <router-link :to="'/transport/route-stops/' + stopId + '/edit'">
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
                                <div class="mt-1">{{ stopData.id }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Nome:</label>
                                <div class="mt-1 font-medium">{{ stopData.name }}</div>
                            </div>

                            <!-- <div class="field mb-3">
                                <label class="font-medium text-900">Ordem:</label>
                                <div class="mt-1">
                                    <Tag :value="stopData.order" severity="info" />
                                </div>
                            </div> -->

                            <div class="field mb-3">
                                <label class="font-medium text-900">Status:</label>
                                <div class="mt-1">
                                    <Tag :value="stopData.is_active ? 'Ativa' : 'Inativa'" :severity="stopData.is_active ? 'success' : 'danger'" />
                                </div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Descrição:</label>
                                <div class="mt-1">{{ stopData.description || 'Sem descrição' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações da Rota -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Rota Associada</h6>
                            
                            <div v-if="stopData.route">
                                <div class="field mb-3">
                                    <label class="font-medium text-900">Nome da Rota:</label>
                                    <div class="mt-1 font-medium">{{ stopData.route.name }}</div>
                                </div>

                                <div class="field mb-3">
                                    <label class="font-medium text-900">Origem:</label>
                                    <div class="mt-1">{{ stopData.route.origin }}</div>
                                </div>

                                <div class="field mb-3">
                                    <label class="font-medium text-900">Destino:</label>
                                    <div class="mt-1">{{ stopData.route.destination }}</div>
                                </div>

                                <div class="field mb-0">
                                    <router-link :to="'/transport/routes/' + stopData.route.id">
                                        <Button label="Ver Rota Completa" icon="pi pi-external-link" class="p-button-sm" />
                                    </router-link>
                                </div>
                            </div>
                            <div v-else class="text-600">
                                Nenhuma rota associada
                            </div>
                        </div>
                    </div>

                    <!-- Informações de Auditoria -->
                    <div class="col-12">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações de Auditoria</h6>
                            
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field mb-3">
                                        <label class="font-medium text-900">Criado por:</label>
                                        <div class="mt-1">{{ stopData.createdBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Data de Criação:</label>
                                        <div class="mt-1">{{ moment(stopData.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <div class="field mb-3">
                                        <label class="font-medium text-900">Atualizado por:</label>
                                        <div class="mt-1">{{ stopData.updatedBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Data de Atualização:</label>
                                        <div class="mt-1">{{ moment(stopData.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
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
            <span>Tem certeza que deseja excluir esta paragem?</span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Excluir" icon="pi pi-check" @click="deleteData" class="p-button-text" :loading="loadingButtonDelete" autofocus />
        </template>
    </Dialog>
</template>