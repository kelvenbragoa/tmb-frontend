<script setup>
import RouteService from '@/service/RouteService';
import RouteStopService from '@/service/RouteStopService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const routeData = ref(null);
const routeTickets = ref([]);
const routeVehicles = ref([]);
const routeStops = ref([]);
const loadingTickets = ref(false);
const loadingVehicles = ref(false);
const loadingStops = ref(false);

const activeTab = ref(0);

const loadRoute = async () => {
    try {
        const response = await RouteService.getRouteById(route.params.id);
        routeData.value = response;
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

const loadRouteTickets = async () => {
    loadingTickets.value = true;
    try {
        const response = await RouteService.getRouteTickets(route.params.id);
        routeTickets.value = response;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar bilhetes da rota',
            life: 3000
        });
    } finally {
        loadingTickets.value = false;
    }
};

const loadRouteVehicles = async () => {
    loadingVehicles.value = true;
    try {
        const response = await RouteService.getRouteVehicles(route.params.id);
        routeVehicles.value = response.items || [];
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar veículos da rota',
            life: 3000
        });
    } finally {
        loadingVehicles.value = false;
    }
};

const loadRouteStops = async () => {
    loadingStops.value = true;
    try {
        const response = await RouteStopService.getRouteStopsByRoute(route.params.id);
        routeStops.value = response.items || [];
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar paragens da rota',
            life: 3000
        });
    } finally {
        loadingStops.value = false;
    }
};

const goBack = () => {
    router.push('/transport/routes');
};

const goToEdit = () => {
    router.push(`/transport/routes/${route.params.id}/edit`);
};

const formatCurrency = (value) => {
    if (!value) return 'MZN 0,00';
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN'
    }).format(value);
};

const onTabChange = (event) => {
    activeTab.value = event.index;
    if (event.index === 1 && routeStops.value.length === 0) {
        loadRouteStops();
    } else if (event.index === 2 && routeTickets.value.length === 0) {
        loadRouteTickets();
    } else if (event.index === 3 && routeVehicles.value.length === 0) {
        loadRouteVehicles();
    }
};

onMounted(() => {
    loadRoute();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <div>
                        <h5 class="m-0">Detalhes da Rota</h5>
                        <p class="text-600 mt-1 mb-0">Informações detalhadas da rota de transporte</p>
                    </div>
                    <div class="flex gap-2">
                        <Button 
                            label="Voltar" 
                            @click="goBack" 
                            class="p-button-outlined"
                            icon="pi pi-arrow-left"
                        />
                        <Button 
                            label="Editar" 
                            @click="goToEdit" 
                            icon="pi pi-pencil"
                            v-if="routeData"
                        />
                    </div>
                </div>

                <!-- Loading state -->
                <div v-if="loading" class="text-center py-8">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                    <p class="mt-3">Carregando dados da rota...</p>
                </div>

                <!-- Content -->
                <div v-else-if="routeData">
                    <TabView @tab-change="onTabChange">
                        <!-- Aba Principal - Informações da Rota -->
                        <TabPanel header="Informações Gerais">
                            <div class="grid">
                                <!-- Informações Básicas -->
                                <div class="col-12">
                                    <div class="card">
                                        <h6 class="mb-3">Informações Básicas</h6>
                                        <div class="grid">
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-medium text-900">ID</label>
                                                    <p class="mt-2 mb-0">{{ routeData.id }}</p>
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-medium text-900">Status</label>
                                                    <p class="mt-2 mb-0">
                                                        <Tag 
                                                            :value="routeData.is_active ? 'Ativa' : 'Inativa'" 
                                                            :severity="routeData.is_active ? 'success' : 'danger'" 
                                                        />
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="field">
                                                    <label class="font-medium text-900">Nome da Rota</label>
                                                    <p class="mt-2 mb-0 font-medium text-lg">{{ routeData.name }}</p>
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-medium text-900">Origem</label>
                                                    <p class="mt-2 mb-0 font-medium">{{ routeData.origin }}</p>
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-medium text-900">Destino</label>
                                                    <p class="mt-2 mb-0 font-medium">{{ routeData.destination }}</p>
                                                </div>
                                            </div>
                                            <div class="col-12" v-if="routeData.category">
                                                <div class="field">
                                                    <label class="font-medium text-900">Categoria</label>
                                                    <p class="mt-2 mb-0">
                                                        <router-link :to="`/transport/route-categories/${routeData.category.id}`">
                                                            <Tag :value="routeData.category.name" severity="info" class="cursor-pointer" />
                                                        </router-link>
                                                        <span class="ml-2 text-600">{{ routeData.category.description }}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="col-12" v-if="routeData.description">
                                                <div class="field">
                                                    <label class="font-medium text-900">Descrição</label>
                                                    <p class="mt-2 mb-0">{{ routeData.description }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Informações Extras -->
                                <div class="col-12" v-if="routeData.metadata">
                                    <div class="card">
                                        <h6 class="mb-3">Informações Extras</h6>
                                        <div class="grid">
                                            <div class="col-12 md:col-6" v-if="routeData.metadata.distance">
                                                <div class="field">
                                                    <label class="font-medium text-900">Distância</label>
                                                    <p class="mt-2 mb-0">
                                                        <i class="pi pi-map-marker mr-2"></i>
                                                        {{ routeData.metadata.distance }}
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6" v-if="routeData.metadata.duration">
                                                <div class="field">
                                                    <label class="font-medium text-900">Duração Estimada</label>
                                                    <p class="mt-2 mb-0">
                                                        <i class="pi pi-clock mr-2"></i>
                                                        {{ routeData.metadata.duration }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Informações de Auditoria -->
                                <div class="col-12">
                                    <div class="card">
                                        <h6 class="mb-3">Informações de Auditoria</h6>
                                        <div class="grid">
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-medium text-900">Data de Criação</label>
                                                    <p class="mt-2 mb-0">{{ moment(routeData.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</p>
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6" v-if="routeData.updatedAt && routeData.updatedAt !== routeData.createdAt">
                                                <div class="field">
                                                    <label class="font-medium text-900">Última Atualização</label>
                                                    <p class="mt-2 mb-0">{{ moment(routeData.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Aba de Paragens -->
                        <TabPanel header="Paragens">
                            <div class="card">
                                <div class="flex align-items-center justify-content-between mb-4">
                                    <h6 class="m-0">Paragens da Rota</h6>
                                    <router-link to="/transport/route-stops/create">
                                        <Button label="Adicionar Paragem" icon="pi pi-plus" size="small" />
                                    </router-link>
                                </div>

                                <div v-if="loadingStops" class="text-center py-4">
                                    <ProgressSpinner style="width: 30px; height: 30px"  />
                                    <p class="mt-2">Carregando paragens...</p>
                                </div>

                                <DataTable v-else :value="routeStops" responsiveLayout="scroll">
                                    <template #empty>
                                        <div class="text-center py-4">
                                            <i class="pi pi-map-marker" style="font-size: 2rem; color: var(--text-color-secondary)"></i>
                                            <p class="mt-2">Nenhuma paragem configurada para esta rota</p>
                                        </div>
                                    </template>

                                    <Column field="order" header="Ordem" style="width: 80px">
                                        <template #body="{ data }">
                                            <Tag :value="data.order" severity="info" />
                                        </template>
                                    </Column>

                                    <Column field="name" header="Nome da Paragem">
                                        <template #body="{ data }">
                                            <div class="font-medium">{{ data.name }}</div>
                                            <div class="text-sm text-600">{{ data.description || '-' }}</div>
                                        </template>
                                    </Column>

                                    <Column field="is_active" header="Status">
                                        <template #body="{ data }">
                                            <Tag :value="data.is_active ? 'Ativa' : 'Inativa'" :severity="data.is_active ? 'success' : 'danger'" />
                                        </template>
                                    </Column>

                                    <Column header="Ações" style="width: 100px">
                                        <template #body="{ data }">
                                            <div class="flex gap-2">
                                                <router-link :to="`/transport/route-stops/${data.id}`">
                                                    <Button icon="pi pi-eye" class="p-button-text p-button-sm" v-tooltip.top="'Ver Detalhes'" />
                                                </router-link>
                                                <router-link :to="`/transport/route-stops/${data.id}/edit`">
                                                    <Button icon="pi pi-pencil" class="p-button-text p-button-sm" v-tooltip.top="'Editar'" />
                                                </router-link>
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </TabPanel>

                        <!-- Aba de Bilhetes -->
                        <TabPanel header="Bilhetes Disponíveis">
                            <div class="card">
                                <div class="flex align-items-center justify-content-between mb-4">
                                    <h6 class="m-0">Bilhetes e Preços</h6>
                                    <router-link to="/transport/route-tickets/create">
                                        <Button label="Adicionar Bilhete" icon="pi pi-plus" size="small" />
                                    </router-link>
                                </div>
                                
                                <div v-if="loadingTickets" class="text-center py-4">
                                    <ProgressSpinner style="width: 30px; height: 30px"  />
                                    <p class="mt-2">Carregando bilhetes...</p>
                                </div>

                                <DataTable v-else :value="routeTickets" responsiveLayout="scroll">
                                    <template #empty>
                                        <div class="text-center py-4">
                                            <i class="pi pi-ticket" style="font-size: 2rem; color: var(--text-color-secondary)"></i>
                                            <p class="mt-2">Nenhum bilhete configurado para esta rota</p>
                                        </div>
                                    </template>

                                    <Column field="ticketType.name" header="Tipo de Bilhete">
                                        <template #body="{ data }">
                                            <div class="flex align-items-center gap-2">
                                                <Tag :value="data.ticketType.code" severity="info" />
                                                <span class="font-medium">{{ data.ticketType.name }}</span>
                                            </div>
                                        </template>
                                    </Column>

                                    <Column field="price" header="Preço">
                                        <template #body="{ data }">
                                            <span class="font-medium">{{ formatCurrency(data.price) }}</span>
                                        </template>
                                    </Column>

                                    <Column field="is_active" header="Status">
                                        <template #body="{ data }">
                                            <Tag :value="data.is_active ? 'Ativo' : 'Inativo'" :severity="data.is_active ? 'success' : 'danger'" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </TabPanel>

                        <!-- Aba de Veículos -->
                        <TabPanel header="Veículos Disponíveis">
                            <div class="card">
                                <div class="flex align-items-center justify-content-between mb-4">
                                    <h6 class="m-0">Veículos Operando nesta Rota</h6>
                                    <router-link to="/transport/vehicles/create">
                                        <Button label="Adicionar Veículo" icon="pi pi-plus" size="small" />
                                    </router-link>
                                </div>

                                <div v-if="loadingVehicles" class="text-center py-4">
                                    <ProgressSpinner style="width: 30px; height: 30px"  />
                                    <p class="mt-2">Carregando veículos...</p>
                                </div>

                                <DataTable v-else :value="routeVehicles" responsiveLayout="scroll">
                                    <template #empty>
                                        <div class="text-center py-4">
                                            <i class="pi pi-car" style="font-size: 2rem; color: var(--text-color-secondary)"></i>
                                            <p class="mt-2">Nenhum veículo associado a esta rota</p>
                                        </div>
                                    </template>

                                    <Column field="name" header="Nome do Veículo">
                                        <template #body="{ data }">
                                            <div class="font-medium">{{ data.name }}</div>
                                            <div class="text-sm text-600">{{ data.plate }}</div>
                                        </template>
                                    </Column>

                                    <Column field="model" header="Modelo">
                                        <template #body="{ data }">
                                            <div>{{ data.brand }} {{ data.model }}</div>
                                        </template>
                                    </Column>

                                    <Column field="capacity" header="Capacidade">
                                        <template #body="{ data }">
                                            <Tag :value="`${data.capacity} lugares`" severity="info" />
                                        </template>
                                    </Column>

                                    <Column field="is_active" header="Status">
                                        <template #body="{ data }">
                                            <Tag :value="data.is_active ? 'Ativo' : 'Inativo'" :severity="data.is_active ? 'success' : 'danger'" />
                                        </template>
                                    </Column>

                                    <Column header="Ações">
                                        <template #body="{ data }">
                                            <router-link :to="`/transport/vehicles/${data.id}`">
                                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" v-tooltip.top="'Ver Detalhes'" />
                                            </router-link>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>