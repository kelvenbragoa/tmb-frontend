<script setup>
import TicketSaleService from '@/service/TicketSaleService';
import UserService from '@/service/UserService';
import RouteService from '@/service/RouteService';
import VehicleService from '@/service/VehicleService';
import DriverService from '@/service/DriverService';
import { ref, onMounted, watch } from 'vue';

import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';


const toast = useToast();
const loading = ref(false);
const isLoadingDiv = ref(true);
const searchQuery = ref('');
const retrievedData = ref([]);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalRecords = ref(0);
const selectedOperator = ref(null);
const selectedRoute = ref(null);
const selectedVehicle = ref(null);
const selectedDriver = ref(null);
const operators = ref([]);
const routes = ref([]);
const vehicles = ref([]);
const drivers = ref([]);
const loadingOperators = ref(false);
const loadingRoutes = ref(false);
const loadingVehicles = ref(false);
const loadingDrivers = ref(false);

const loadOperators = async () => {
    loadingOperators.value = true;
    try {
        const response = await UserService.getAllUsers({ page: 1, limit: 1000 });
        operators.value = response.items;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar operadores', 
            life: 3000 
        });
    } finally {
        loadingOperators.value = false;
    }
};

const loadRoutes = async () => {
    loadingRoutes.value = true;
    try {
        const response = await RouteService.getAllRoutes({ page: 1, limit: 1000 });
        routes.value = response.items || response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar rotas', 
            life: 3000 
        });
    } finally {
        loadingRoutes.value = false;
    }
};

const loadVehicles = async () => {
    loadingVehicles.value = true;
    try {
        const response = await VehicleService.getAllVehicles({ page: 1, limit: 1000 });
        vehicles.value = response.items || response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar veículos', 
            life: 3000 
        });
    } finally {
        loadingVehicles.value = false;
    }
};

const loadDrivers = async () => {
    loadingDrivers.value = true;
    try {
        const response = await DriverService.getAllDrivers({ page: 1, limit: 1000 });
        drivers.value = response.items || response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar motoristas', 
            life: 3000 
        });
    } finally {
        loadingDrivers.value = false;
    }
};

const getData = async (page = 1) => {
    loading.value = true;
    try {
        const params = {
            page,
            limit: rowsPerPage.value
        };
        
        if (selectedOperator.value) {
            params.operatorId = selectedOperator.value;
        }
        
        if (selectedRoute.value) {
            params.route_id = selectedRoute.value;
        }
        
        if (selectedVehicle.value) {
            params.vehicle_id = selectedVehicle.value;
        }
        
        if (selectedDriver.value) {
            params.driver_id = selectedDriver.value;
        }
        
        const response = await TicketSaleService.getAllTicketSales(params);
           
        retrievedData.value = response.items;
        totalRecords.value = response.meta.totalItems;
        isLoadingDiv.value = false;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar vendas', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const onPageChange = (event) => {
    currentPage.value = event.page + 1;
    getData(currentPage.value);
};

const debouncedSearch = debounce(() => {
    currentPage.value = 1;
    getData();
}, 300);

watch(selectedOperator, debouncedSearch);
watch(selectedRoute, debouncedSearch);
watch(selectedVehicle, debouncedSearch);
watch(selectedDriver, debouncedSearch);

onMounted(async () => {
    await Promise.all([
        loadOperators(),
        loadRoutes(),
        loadVehicles(),
        loadDrivers()
    ]);
    getData();
});
</script>

<template>
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>
    </div>
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Vendas de Bilhetes</h5>
                </div>

                <DataTable :value="retrievedData" :paginator="true" :rows="rowsPerPage" :totalRecords="totalRecords" :lazy="true" :loading="loading" @page="onPageChange" showGridlines>
                    <template #header>
                        <div class="grid">
                            <div class="col-12 md:col-6 lg:col-3">
                                <label for="operatorFilter" class="font-medium block mb-2">Operador:</label>
                                <Dropdown 
                                    id="operatorFilter"
                                    v-model="selectedOperator"
                                    :options="operators"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Todos os operadores"
                                    :loading="loadingOperators"
                                    :showClear="true"
                                    filter
                                    class="w-full"
                                />
                            </div>
                            <div class="col-12 md:col-6 lg:col-3">
                                <label for="routeFilter" class="font-medium block mb-2">Rota:</label>
                                <Dropdown 
                                    id="routeFilter"
                                    v-model="selectedRoute"
                                    :options="routes"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Todas as rotas"
                                    :loading="loadingRoutes"
                                    :showClear="true"
                                    filter
                                    class="w-full"
                                />
                            </div>
                            <div class="col-12 md:col-6 lg:col-3">
                                <label for="vehicleFilter" class="font-medium block mb-2">Veículo:</label>
                                <Dropdown 
                                    id="vehicleFilter"
                                    v-model="selectedVehicle"
                                    :options="vehicles"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Todos os veículos"
                                    :loading="loadingVehicles"
                                    :showClear="true"
                                    filter
                                    class="w-full"
                                />
                            </div>
                            <div class="col-12 md:col-6 lg:col-3">
                                <label for="driverFilter" class="font-medium block mb-2">Motorista:</label>
                                <Dropdown 
                                    id="driverFilter"
                                    v-model="selectedDriver"
                                    :options="drivers"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Todos os motoristas"
                                    :loading="loadingDrivers"
                                    :showClear="true"
                                    filter
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </template>
                    <template #empty>Nenhuma venda encontrada.</template>

                    <!-- <Column header="Cliente">
                        <template #body="{ data }">
                            <div v-if="data.customer">
                                <div class="font-medium">{{ data.customer.name }}</div>
                                <small class="text-600">{{ data.customer.customer_number }}</small>
                            </div>
                            <span v-else class="text-400">N/A</span>
                        </template>
                    </Column> -->
                    <Column header="Nº Sessão" style="min-width: 8rem">
                        <template #body="{ data }">
                            <Tag :value="`#${data.session_id}`" severity="info" />
                        </template>
                    </Column>
                    <Column header="Operador">
                        <template #body="{ data }">
                            {{ data.operator?.name }}
                        </template>
                    </Column>

                    <Column header="Rota">
                        <template #body="{ data }">
                            {{ data.route?.name }}
                        </template>
                    </Column>

                    <Column header="Paragens">
                        <template #body="{ data }">
                            <p class=""><strong>Origem:</strong> {{ data.originRouteStop?.name }}</p>
                            <p class=""><strong>Destino:</strong> {{ data.destinationRouteStop?.name }}</p>
                        </template>
                    </Column>

                    <Column header="Tipo de Bilhete">
                        <template #body="{ data }">
                            <Tag :value="data.routeTicket?.ticketType?.code + ' - ' + data.routeTicket?.ticketType?.name" severity="info" />
                        </template>
                    </Column>

                    <Column header="Quantidade">
                        <template #body="{ data }">
                            {{ data.quantity }}
                        </template>
                    </Column>

                    <Column header="Referência">
                        <template #body="{ data }">
                            {{ data.reference }}
                        </template>
                    </Column>

                    <Column header="Preço Unitário">
                        <template #body="{ data }">
                            {{ formatCurrency(data.price_at_sale) }}
                        </template>
                    </Column>

                    <Column header="Total">
                        <template #body="{ data }">
                            <span class="font-medium">{{ formatCurrency(data.total) }}</span>
                        </template>
                    </Column>

                    <Column header="Data/Hora">
                        <template #body="{ data }">
                            {{ moment(data.ticket_sold_at).format('DD/MM/YYYY HH:mm:ss') }}
                        </template>
                    </Column>

                    <Column header="Ações">
                        <template #body="{ data }">
                            <router-link :to="'/transport/ticket-sales/' + data.id">
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" v-tooltip.top="'Visualizar'" />
                            </router-link>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>