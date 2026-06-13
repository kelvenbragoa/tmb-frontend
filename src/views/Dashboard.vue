<script setup>
import DashboardService from '@/service/DashboardService';
import RouteService from '@/service/RouteService';
import VehicleService from '@/service/VehicleService';
import UserService from '@/service/UserService';
import TicketTypeService from '@/service/TicketTypeService';
import { ref, onMounted, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { useRouter } from 'vue-router';
import { baseURL, storageURL } from '@/service/APIConstant';
import axios from 'axios';


const toast = useToast();
const router = useRouter();
const loading = ref(false);
const dashboardData = ref(null);

// Filtros
const selectedPeriod = ref('last_30_days');
const customDateRange = ref([]);
const selectedRoutes = ref([]);
const selectedVehicles = ref([]);
const selectedOperators = ref([]);
const selectedTicketTypes = ref([]);

// Dados dos dropdowns
const routes = ref([]);
const vehicles = ref([]);
const operators = ref([]);
const ticketTypes = ref([]);

// Dados dos gráficos
const salesChartData = ref(null);
const salesChartOptions = ref(null);
const ticketTypesChartData = ref(null);
const ticketTypesChartOptions = ref(null);
const peakHoursChartData = ref(null);
const peakHoursChartOptions = ref(null);

// Opções de período
const periodOptions = ref(DashboardService.getPeriodOptions());

// Computada para verificar se é período personalizado
const isCustomPeriod = computed(() => selectedPeriod.value === 'custom');

const logout = () => {
    axios
        .post(`${baseURL}/auth/logout`)
        .then((response) => {
            localStorage.removeItem('token'); // Remova o token armazenado
            localStorage.removeItem('user'); // Remova as informações do usuário
            router.replace('/'); // Redirecione para a página de login
        })
        .catch((error) => {
            console.error('Erro ao fazer logout:', error); // Lide com erros de logout
            // localStorage.removeItem('token'); // Limpeza mesmo em caso de erro
            // localStorage.removeItem('user');
            // router.replace('/'); // Redirecione para a página de login
        });
};

// Carregar dados do dashboard
const loadDashboard = async () => {
    if (isCustomPeriod.value && (!customDateRange.value || customDateRange.value.length !== 2)) {
        toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Por favor, selecione o período personalizado',
            life: 3000
        });
        return;
    }

    loading.value = true;
    
    try {
        const params = {
            period: selectedPeriod.value,
            route_ids: selectedRoutes.value,
            vehicle_ids: selectedVehicles.value,
            operator_ids: selectedOperators.value,
            ticket_type_ids: selectedTicketTypes.value
        };

        if (isCustomPeriod.value) {
            params.start_date = moment(customDateRange.value[0]).format('YYYY-MM-DD');
            params.end_date = moment(customDateRange.value[1]).format('YYYY-MM-DD');
        }

        dashboardData.value = await DashboardService.getDashboard(params);
        setupCharts();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        // logout();
    } finally {
        loading.value = false;
    }
};

// Carregar dados dos filtros
const loadFiltersData = async () => {
    try {
        const [routesData, vehiclesData, operatorsData, ticketTypesData] = await Promise.all([
            RouteService.getAllRoutes({ limit: 1000 }),
            VehicleService.getAllVehicles({ limit: 1000 }),
            UserService.getAllUsers({ limit: 1000 }),
            TicketTypeService.getAllTicketTypes({ limit: 1000 })
        ]);

        routes.value = routesData.items.map((route) => ({
            label: `${route.name} (${route.origin} → ${route.destination})`,
            value: route.id
        }));

        vehicles.value = vehiclesData.items.map((vehicle) => ({
            label: `${vehicle.name} - ${vehicle.plate}`,
            value: vehicle.id
        }));

        operators.value = operatorsData.items.map((operator) => ({
            label: `${operator.name} - ${operator.username}`,
            value: operator.id
        }));

        ticketTypes.value = ticketTypesData.items.map((type) => ({
            label: type.name,
            value: type.id
        }));
    } catch (error) {
        // logout();
        console.error('Erro ao carregar dados dos filtros:', error);
    }
};

// Configurar gráficos
const setupCharts = () => {
    if (!dashboardData.value) return;

    // Gráfico de vendas ao longo do tempo
    if (dashboardData.value.salesChart) {
        const salesData = dashboardData.value.salesChart;
        salesChartData.value = {
            labels: salesData.map((item) => moment(item.date).format('DD/MM')),
            datasets: [
                {
                    label: 'Vendas',
                    data: salesData.map((item) => item.sales_count),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Receita',
                    data: salesData.map((item) => item.revenue),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        };

        salesChartOptions.value = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true, position: 'left' },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false }
                }
            }
        };
    }

    // Gráfico de tipos de ticket
    if (dashboardData.value.ticketTypeAnalysis) {
        const ticketData = dashboardData.value.ticketTypeAnalysis;
        ticketTypesChartData.value = {
            labels: ticketData.map((item) => item.ticket_type_name),
            datasets: [
                {
                    data: ticketData.map((item) => item.percentage_of_total),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF']
                }
            ]
        };

        ticketTypesChartOptions.value = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        };
    }

    // Gráfico de horários de pico
    if (dashboardData.value.sessionAnalysis?.peak_hours) {
        const peakHours = dashboardData.value.sessionAnalysis.peak_hours;
        peakHoursChartData.value = {
            labels: peakHours.map((item) => `${item.hour}h`),
            datasets: [
                {
                    label: 'Vendas por Hora',
                    data: peakHours.map((item) => item.sales_count),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        };

        peakHoursChartOptions.value = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        };
    }
};

// Funções utilitárias
const formatCurrency = (value) => {
    return DashboardService.formatCurrency(value);
};

const formatPercentage = (value) => {
    return DashboardService.formatPercentage(value);
};

const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-MZ').format(value || 0);
};

// Limpar filtros
const clearFilters = () => {
    selectedRoutes.value = [];
    selectedVehicles.value = [];
    selectedOperators.value = [];
    selectedTicketTypes.value = [];
    selectedPeriod.value = 'last_30_days';
    customDateRange.value = [];
    loadDashboard();
};

// Watchers para recarregar dados quando filtros mudarem
watch(
    [selectedPeriod, selectedRoutes, selectedVehicles, selectedOperators, selectedTicketTypes],
    () => {
        loadDashboard();
    },
    { deep: true }
);

watch(customDateRange, () => {
    if (isCustomPeriod.value && customDateRange.value && customDateRange.value.length === 2) {
        loadDashboard();
    }
});

onMounted(async () => {
    await loadFiltersData();
    await loadDashboard();
});
</script>

<template>
    <!-- Cabeçalho e Filtros -->
    <div class="grid mb-4">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h2 class="m-0">Dashboard de Transporte</h2>
                    <div class="flex gap-2">
                        <Button label="Atualizar" icon="pi pi-refresh" @click="loadDashboard" :loading="loading" />
                        <Button label="Limpar Filtros" icon="pi pi-filter-slash" @click="clearFilters" class="p-button-outlined" />
                    </div>
                </div>

                <!-- Filtros -->
                <div class="grid">
                    <div class="col-12 md:col-3">
                        <label class="block font-medium mb-2">Período</label>
                        <Dropdown v-model="selectedPeriod" :options="periodOptions" optionLabel="label" optionValue="value" placeholder="Selecione o período" class="w-full" />
                    </div>
                    
                    <div class="col-12 md:col-3" v-if="isCustomPeriod">
                        <label class="block font-medium mb-2">Data Personalizada</label>
                        <Calendar v-model="customDateRange" selectionMode="range" dateFormat="dd/mm/yy" placeholder="Selecione o período" class="w-full" />
                    </div>

                    <div class="col-12 md:col-3">
                        <label class="block font-medium mb-2">Rotas</label>
                        <MultiSelect v-model="selectedRoutes" :options="routes" optionLabel="label" optionValue="value" placeholder="Todas as rotas" class="w-full" />
                    </div>

                    <div class="col-12 md:col-3">
                        <label class="block font-medium mb-2">Veículos</label>
                        <MultiSelect v-model="selectedVehicles" :options="vehicles" optionLabel="label" optionValue="value" placeholder="Todos os veículos" class="w-full" />
                    </div>

                    <div class="col-12 md:col-3">
                        <label class="block font-medium mb-2">Operadores</label>
                        <MultiSelect v-model="selectedOperators" :options="operators" optionLabel="label" optionValue="value" placeholder="Todos os operadores" class="w-full" />
                    </div>

                    <div class="col-12 md:col-3">
                        <label class="block font-medium mb-2">Tipos de Bilhete</label>
                        <MultiSelect v-model="selectedTicketTypes" :options="ticketTypes" optionLabel="label" optionValue="value" placeholder="Todos os tipos" class="w-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading -->
    <div class="grid" v-if="loading">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData">
        <!-- Cards de Overview -->
        <div class="grid mb-4">
            <div class="col-12 md:col-3">
                <div class="card text-center">
                    <div class="text-900 font-medium text-xl mb-2">Receita Total</div>
                    <div class="text-cyan-600 font-bold text-2xl">{{ formatCurrency(dashboardData.overview?.totalRevenue) }}</div>
                    <div class="text-sm text-600 mt-1">{{ formatNumber(dashboardData.overview?.totalSales) }} vendas</div>
                </div>
            </div>
            
            <div class="col-12 md:col-3">
                <div class="card text-center">
                    <div class="text-900 font-medium text-xl mb-2">Bilhetes Vendidos</div>
                    <div class="text-blue-600 font-bold text-2xl">{{ formatNumber(dashboardData.overview?.totalTicketsSold) }}</div>
                    <div class="text-sm text-600 mt-1">Preço médio: {{ formatCurrency(dashboardData.overview?.averageTicketPrice) }}</div>
                </div>
            </div>

            <div class="col-12 md:col-3">
                <div class="card text-center">
                    <div class="text-900 font-medium text-xl mb-2">Sessões</div>
                    <div class="text-green-600 font-bold text-2xl">{{ formatNumber(dashboardData.overview?.activeSessions) }}</div>
                    <div class="text-sm text-600 mt-1">{{ formatNumber(dashboardData.overview?.totalSessions) }} total</div>
                </div>
            </div>

            <div class="col-12 md:col-3">
                <div class="card text-center">
                    <div class="text-900 font-medium text-xl mb-2">Usuários Ativos</div>
                    <div class="text-purple-600 font-bold text-2xl">{{ formatNumber(dashboardData.overview?.activeUsers) }}</div>
                    <div class="text-sm text-600 mt-1">{{ formatNumber(dashboardData.overview?.totalOperators) }} operadores</div>
                </div>
            </div>
        </div>

        <!-- Gráficos -->
        <div class="grid mb-4">
            <!-- Gráfico de Vendas -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <h5>Evolução das Vendas</h5>
                    <Chart v-if="salesChartData" type="line" :data="salesChartData" :options="salesChartOptions" style="height: 300px" />
                </div>
            </div>

            <!-- Gráfico de Tipos de Bilhete -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h5>Tipos de Bilhete</h5>
                    <Chart v-if="ticketTypesChartData" type="doughnut" :data="ticketTypesChartData" :options="ticketTypesChartOptions" style="height: 300px" />
                </div>
            </div>
        </div>

        <!-- Horários de Pico -->
        <div class="grid mb-4" v-if="peakHoursChartData">
            <div class="col-12">
                <div class="card">
                    <h5>Horários de Pico</h5>
                    <Chart type="bar" :data="peakHoursChartData" :options="peakHoursChartOptions" style="height: 250px" />
                </div>
            </div>
        </div>

        <!-- Tabelas de Performance -->
        <div class="grid mb-4">
            <!-- Performance das Rotas -->
            <div class="col-12 lg:col-6">
                <div class="card">
                    <h5>Performance das Rotas</h5>
                    <DataTable v-if="dashboardData.routePerformance" :value="dashboardData.routePerformance" responsiveLayout="scroll" :paginator="true" :rows="10">
                        <Column field="route_name" header="Rota" />
                        <Column field="total_revenue" header="Receita">
                            <template #body="{ data }">
                                {{ formatCurrency(data.total_revenue) }}
                            </template>
                        </Column>
                        <Column field="sessions_count" header="Sessões" />
                        <Column field="total_tickets" header="Bilhetes" />
                    </DataTable>
                </div>
            </div>

            <!-- Performance dos Veículos -->
            <div class="col-12 lg:col-6">
                <div class="card">
                    <h5>Performance dos Veículos</h5>
                    <DataTable v-if="dashboardData.vehiclePerformance" :value="dashboardData.vehiclePerformance" responsiveLayout="scroll" :paginator="true" :rows="10">
                        <Column field="vehicle_name" header="Veículo" />
                        <Column field="license_plate" header="Placa" />
                        <Column field="total_revenue" header="Receita">
                            <template #body="{ data }">
                                {{ formatCurrency(data.total_revenue) }}
                            </template>
                        </Column>
                        <Column field="utilization_rate" header="Taxa de Uso">
                            <template #body="{ data }">
                                {{ formatPercentage(data.utilization_rate) }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Performance dos Operadores (apenas admin) -->
        <div class="grid mb-4" v-if="dashboardData.operatorPerformance">
            <div class="col-12">
                <div class="card">
                    <h5>Performance dos Operadores</h5>
                    <DataTable :value="dashboardData.operatorPerformance" responsiveLayout="scroll" :paginator="true" :rows="10">
                        <Column field="operator_name" header="Operador" />
                        <Column field="total_revenue" header="Receita">
                            <template #body="{ data }">
                                {{ formatCurrency(data.total_revenue) }}
                            </template>
                        </Column>
                        <Column field="sessions_count" header="Sessões" />
                        <Column field="total_tickets" header="Bilhetes" />
                        <Column field="hours_worked" header="Horas Trabalhadas" />
                        <Column field="average_revenue_per_session" header="Receita/Sessão">
                            <template #body="{ data }">
                                {{ formatCurrency(data.average_revenue_per_session) }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>

    <!-- Estado vazio -->
    <div class="grid" v-else-if="!loading">
        <div class="col-12">
            <div class="card text-center">
                <div class="flex flex-column align-items-center justify-content-center py-6">
                    <i class="pi pi-chart-bar text-6xl text-400 mb-3"></i>
                    <h3 class="text-600">Nenhum dado encontrado</h3>
                    <p class="text-500">Configure os filtros e atualize para visualizar o dashboard.</p>
                </div>
            </div>
        </div>
    </div>
</template>
