<script setup>
import VehicleService from '@/service/VehicleService';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { usePermissions } from '@/composables/usePermissions';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { permissions } = usePermissions();
const loading = ref(false);
const vehicleData = ref(null);
const displayConfirmation = ref(false);
const loadingButtonDelete = ref(false);

const vehicleId = computed(() => parseInt(route.params.id));

const getData = async () => {
    loading.value = true;
    try {
        const response = await VehicleService.getVehicleById(vehicleId.value);
        vehicleData.value = response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao carregar veículo', 
            life: 3000 
        });
        router.push('/transport/vehicles');
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
        await VehicleService.deleteVehicle(vehicleId.value);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Veículo excluído com sucesso', 
            life: 3000 
        });
        router.push('/transport/vehicles');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao excluir veículo', 
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
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>
    
    <div class="grid" v-else-if="vehicleData">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes do Veículo</h5>
                    <div class="flex gap-2">
                        <Button label="Voltar" @click="goBack" severity="secondary">
                            <i class="pi pi-arrow-left"></i>
                        </Button>
                        <router-link :to="'/transport/vehicles/' + vehicleId + '/edit'" v-if="permissions.canEdit">
                            <Button label="Editar" severity="info">
                                <i class="pi pi-pencil"></i>
                            </Button>
                        </router-link>
                        <Button 
                            v-if="permissions.canDelete"
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
                                <div class="mt-1">{{ vehicleData.id }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Código:</label>
                                <div class="mt-1 font-medium">{{ vehicleData.name }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Placa:</label>
                                <div class="mt-1">
                                    <Tag :value="vehicleData.plate" severity="info" class="text-uppercase" />
                                </div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Status:</label>
                                <div class="mt-1">
                                    <Tag :value="vehicleData.is_active ? 'Ativo' : 'Inativo'" :severity="vehicleData.is_active ? 'success' : 'danger'" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações Adicionais -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações Adicionais</h6>
                            
                            <div class="field mb-3" v-if="vehicleData.model">
                                <label class="font-medium text-900">Modelo:</label>
                                <div class="mt-1">{{ vehicleData.model }}</div>
                            </div>

                            <div class="field mb-3" v-if="vehicleData.brand">
                                <label class="font-medium text-900">Marca:</label>
                                <div class="mt-1">{{ vehicleData.brand }}</div>
                            </div>

                            <div class="field mb-3" v-if="vehicleData.capacity">
                                <label class="font-medium text-900">Capacidade:</label>
                                <div class="mt-1">
                                    <Tag :value="`${vehicleData.capacity} lugares`" severity="secondary" />
                                </div>
                            </div>

                            <div class="field mb-0" v-if="vehicleData.description">
                                <label class="font-medium text-900">Descrição:</label>
                                <div class="mt-1">{{ vehicleData.description }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Rotas Associadas -->
                    <div class="col-12" v-if="vehicleData.routes && vehicleData.routes.length > 0">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Rotas Associadas</h6>
                            
                            <div class="grid">
                                <div class="col-12 md:col-6 lg:col-4" v-for="route in vehicleData.routes" :key="route.id">
                                    <div class="card border-1 surface-border mb-0">
                                        <div class="flex align-items-center justify-content-between mb-2">
                                            <div class="font-medium">{{ route.name }}</div>
                                            <Tag :value="route.is_active ? 'Ativa' : 'Inativa'" :severity="route.is_active ? 'success' : 'danger'" class="text-xs" />
                                        </div>
                                        <div class="text-sm text-600">
                                            <i class="pi pi-map-marker mr-1"></i>
                                            {{ route.origin }} → {{ route.destination }}
                                        </div>
                                        <div class="mt-2">
                                            <router-link :to="'/transport/routes/' + route.id">
                                                <Button label="Ver Rota" icon="pi pi-external-link" class="p-button-sm p-button-text" />
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12" v-else>
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Rotas Associadas</h6>
                            <div class="text-600 text-center py-4">
                                <i class="pi pi-info-circle mr-2"></i>
                                Nenhuma rota associada a este veículo
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
                                        <div class="mt-1">{{ vehicleData.createdBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Data de Criação:</label>
                                        <div class="mt-1">{{ moment(vehicleData.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <div class="field mb-3">
                                        <label class="font-medium text-900">Atualizado por:</label>
                                        <div class="mt-1">{{ vehicleData.updatedBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Última Atualização:</label>
                                        <div class="mt-1">{{ moment(vehicleData.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
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
            <span>Tem certeza que deseja excluir este veículo?</span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Excluir" icon="pi pi-check" @click="deleteData" class="p-button-text" :loading="loadingButtonDelete" autofocus />
        </template>
    </Dialog>
</template>
