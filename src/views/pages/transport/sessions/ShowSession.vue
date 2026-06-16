<script setup>
import SessionService from '@/service/SessionService';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import PrintDeliveryGuide from './PrintDeliveryGuide.vue';
import PrintDebitNote from './PrintDebitNote.vue';

const route = useRoute();
const toast = useToast();
const loading = ref(false);
const session = ref({});
const printComponentRef = ref(null);
const printDebitNoteRef = ref(null);

const getId = async () => {
    loading.value = true;
    try {
        const response = await SessionService.getSessionById(route.params.id);
        session.value = response;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar sessão', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'open':
            return 'success';
        case 'closed':
            return 'secondary';
        case 'scheduled':
            return 'info';
        case 'in_progress':
            return 'warning';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'open':
            return 'Aberta';
        case 'closed':
            return 'Fechada';
        case 'scheduled':
            return 'Agendada';
        case 'in_progress':
            return 'Em Progresso';
        case 'completed':
            return 'Completada';
        case 'cancelled':
            return 'Cancelada';
        default:
            return status;
    }
};

const getTypeLabel = (type) => {
    return type === 'regular' ? 'Regular' : 'Multa';
};

const getTypeSeverity = (type) => {
    return type === 'regular' ? 'success' : 'warning';
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value || 0);
};

const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY HH:mm:ss') : '-';
};

const formatTime = (time) => {
    return time ? moment(time, 'HH:mm:ss').format('HH:mm:ss') : '-';
};

const printDeliveryGuide = () => {
    if (printComponentRef.value) {
        printComponentRef.value.print();
    }
};

const printDebitNote = () => {
    if (printDebitNoteRef.value) {
        printDebitNoteRef.value.print();
    }
};

onMounted(() => getId());
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes da Sessão #{{ session.id }}</h5>
                    <div class="flex gap-2">
                        <Button icon="pi pi-print" label="Imprimir Guia de Entrega" @click="printDeliveryGuide" class="p-button-outlined p-button-info" />
                        <Button icon="pi pi-print" label="Imprimir Nota de Débito" @click="printDebitNote" class="p-button-outlined p-button-warning" />
                        <router-link to="/transport/sessions">
                            <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-text" />
                        </router-link>
                    </div>
                </div>

                <div v-if="loading" class="flex justify-content-center">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <div v-else>
                    <!-- Indicadores Principais -->
                    <div class="grid mb-4">
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-blue-50 border-1 border-blue-200">
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <span class="block text-600 font-medium mb-2">Total Geral</span>
                                        <div class="text-900 font-bold text-2xl">{{ formatCurrency(session.total_amount) }}</div>
                                        <small class="text-500">{{ session.total_tickets_sold || 0 }} bilhetes</small>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 3rem; height: 3rem">
                                        <i class="pi pi-money-bill text-blue-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-green-50 border-1 border-green-200">
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <span class="block text-600 font-medium mb-2">Vendas Regulares</span>
                                        <div class="text-900 font-bold text-2xl">{{ formatCurrency(session.total_sales) }}</div>
                                        <small class="text-500">{{ session.indicators?.total_regular_tickets || 0 }} bilhetes</small>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 3rem; height: 3rem">
                                        <i class="pi pi-check-circle text-green-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-orange-50 border-1 border-orange-200">
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <span class="block text-600 font-medium mb-2">Vendas Multas</span>
                                        <div class="text-900 font-bold text-2xl">{{ formatCurrency(session.total_penalty_sales) }}</div>
                                        <small class="text-500">{{ session.indicators?.total_penalty_tickets || 0 }} bilhetes</small>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 3rem; height: 3rem">
                                        <i class="pi pi-exclamation-triangle text-orange-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-purple-50 border-1 border-purple-200">
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <span class="block text-600 font-medium mb-2">Valor Entregue</span>
                                        <div class="text-900 font-bold text-2xl">{{ formatCurrency(session.actual_amount_delivered) }}</div>
                                        <small class="text-500">Preço médio: {{ formatCurrency(session.indicators?.average_ticket_price) }}</small>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 3rem; height: 3rem">
                                        <i class="pi pi-wallet text-purple-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid">
                        <!-- Informações Básicas -->
                        <div class="col-12 md:col-6 lg:col-4">
                            <div class="card h-full">
                                <h6 class="text-primary mb-3">Informações Básicas</h6>
                                
                                <div class="field mb-3">
                                    <label class="font-medium text-600">Status:</label>
                                    <div class="mt-1">
                                        <Tag :value="getStatusLabel(session.status)" :severity="getStatusSeverity(session.status)" />
                                    </div>
                                </div>

                                <div class="field mb-3">
                                    <label class="font-medium text-600">Operador:</label>
                                    <p class="mt-1 mb-0 text-900">{{ session.operator?.name }}</p>
                                    <small class="text-500">{{ session.operator?.email }}</small>
                                </div>

                                <div class="field mb-0">
                                    <label class="font-medium text-600">Turno:</label>
                                    <p class="mt-1 mb-0 text-900">{{ session.shift?.name }}</p>
                                    <small class="text-500">{{ formatTime(session.shift?.start_time) }} - {{ formatTime(session.shift?.end_time) }}</small>
                                </div>
                            </div>
                        </div>

                        <!-- Horários -->
                        <div class="col-12 md:col-6 lg:col-4">
                            <div class="card h-full">
                                <h6 class="text-primary mb-3">Horários</h6>
                                
                                <div class="field mb-3">
                                    <label class="font-medium text-600">Abertura:</label>
                                    <p class="mt-1 mb-0 text-900">{{ formatDate(session.opened_at) }}</p>
                                </div>

                                <div class="field mb-3">
                                    <label class="font-medium text-600">Fechamento:</label>
                                    <p class="mt-1 mb-0 text-900">{{ formatDate(session.closed_at) }}</p>
                                    <small class="text-500" v-if="session.closedBy">Por: {{ session.closedBy.name }}</small>
                                </div>

                                <div class="field mb-0" v-if="session.opened_at && session.closed_at">
                                    <label class="font-medium text-600">Duração:</label>
                                    <p class="mt-1 mb-0 text-900">
                                        {{ moment(session.closed_at).diff(moment(session.opened_at), 'hours') }}h 
                                        {{ moment(session.closed_at).diff(moment(session.opened_at), 'minutes') % 60 }}min
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Indicadores Detalhados -->
                        <div class="col-12 lg:col-4">
                            <div class="card h-full">
                                <h6 class="text-primary mb-3">Análise de Vendas</h6>
                                
                                <div class="field mb-3">
                                    <label class="font-medium text-600">Bilhetes Regulares:</label>
                                    <p class="mt-1 mb-0 text-900">{{ session.indicators?.total_regular_tickets || 0 }} ({{ formatCurrency(session.indicators?.total_regular_sales) }})</p>
                                </div>

                                <div class="field mb-0">
                                    <label class="font-medium text-600">Bilhetes de Multa:</label>
                                    <p class="mt-1 mb-0 text-900">{{ session.indicators?.total_penalty_tickets || 0 }} ({{ formatCurrency(session.indicators?.total_penalty_sales) }})</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Vendas por Tipo de Bilhete -->
                    <div class="col-12" v-if="session.salesByTicketType && session.salesByTicketType.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Vendas por Tipo de Bilhete</h6>
                            
                            <DataTable :value="session.salesByTicketType" showGridlines responsiveLayout="scroll">
                                <Column field="ticket_type_name" header="Tipo de Bilhete"></Column>
                                <Column field="quantity" header="Quantidade">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.quantity }}</span>
                                    </template>
                                </Column>
                                <Column field="total_amount" header="Total">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.total_amount) }}
                                    </template>
                                </Column>
                                <Column field="percentage" header="Percentagem">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ Number(data.percentage).toFixed(2) }}%</span>
                                            <ProgressBar :value="data.percentage" :showValue="false" style="height: 8px; width: 100px" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Vendas por TARIFA -->
                    <div class="col-12" v-if="session.salesByRouteTicket && session.salesByRouteTicket.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Vendas por Tarifa</h6>
                            
                            <DataTable :value="session.salesByRouteTicket" showGridlines responsiveLayout="scroll">
                                <Column field="ticket_type_name" header="Tarifa"></Column>
                                <Column field="price" header="Valor">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.price) }}
                                    </template>
                                </Column>
                                <Column field="total_tickets" header="Quantidade">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.total_tickets }}</span>
                                    </template>
                                </Column>
                                <Column field="total_amount" header="Total">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.total_amount) }}
                                    </template>
                                </Column>
                                <Column field="percentage" header="Percentagem">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ Number(data.percentage).toFixed(2) }}%</span>
                                            <ProgressBar :value="data.percentage" :showValue="false" style="height: 8px; width: 100px" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Vendas por Rota -->
                    <div class="col-12" v-if="session.salesByRoute && session.salesByRoute.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Vendas por Rota</h6>
                            
                            <DataTable :value="session.salesByRoute" showGridlines responsiveLayout="scroll">
                                <Column field="route_name" header="Rota">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.route_name }}</span>
                                    </template>
                                </Column>
                                <Column header="Bilhetes Regulares">
                                    <template #body="{ data }">
                                        <Tag :value="data.regular_tickets" severity="success" />
                                    </template>
                                </Column>
                                <Column header="Bilhetes de Multa">
                                    <template #body="{ data }">
                                        <Tag :value="data.penalty_tickets" severity="warning" />
                                    </template>
                                </Column>
                                <Column field="total_tickets" header="Total de Bilhetes">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.total_tickets }}</span>
                                    </template>
                                </Column>
                                <Column field="total_amount" header="Valor Total">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.total_amount) }}
                                    </template>
                                </Column>
                                <Column field="percentage" header="%">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ Number(data.percentage).toFixed(2) }}%</span>
                                            <ProgressBar :value="data.percentage" :showValue="false" style="height: 8px; width: 80px" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Vendas por Veículo -->
                    <div class="col-12" v-if="session.salesByVehicle && session.salesByVehicle.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Vendas por Veículo</h6>
                            
                            <DataTable :value="session.salesByVehicle" showGridlines responsiveLayout="scroll">
                                <Column field="vehicle_name" header="Veículo">
                                    <template #body="{ data }">
                                        <div>
                                            <div class="font-bold">{{ data.vehicle_name }}</div>
                                            <small class="text-600">{{ data.vehicle_plate }}</small>
                                        </div>
                                    </template>
                                </Column>
                                <Column header="Bilhetes Regulares">
                                    <template #body="{ data }">
                                        <Tag :value="data.regular_tickets" severity="success" />
                                    </template>
                                </Column>
                                <Column header="Bilhetes de Multa">
                                    <template #body="{ data }">
                                        <Tag :value="data.penalty_tickets" severity="warning" />
                                    </template>
                                </Column>
                                <Column field="total_tickets" header="Total de Bilhetes">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.total_tickets }}</span>
                                    </template>
                                </Column>
                                <Column field="total_amount" header="Valor Total">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.total_amount) }}
                                    </template>
                                </Column>
                                <Column field="percentage" header="%">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ Number(data.percentage).toFixed(2) }}%</span>
                                            <ProgressBar :value="data.percentage" :showValue="false" style="height: 8px; width: 80px" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Vendas por Hora -->
                    <div class="col-12" v-if="session.salesByHour && session.salesByHour.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Vendas por Hora</h6>
                            
                            <DataTable :value="session.salesByHour" showGridlines responsiveLayout="scroll">
                                <Column field="hour" header="Hora">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ String(data.hour).padStart(2, '0') }}:00</span>
                                    </template>
                                </Column>
                                <Column header="Bilhetes Regulares">
                                    <template #body="{ data }">
                                        <Tag :value="data.regular_tickets" severity="success" />
                                    </template>
                                </Column>
                                <Column header="Bilhetes de Multa">
                                    <template #body="{ data }">
                                        <Tag :value="data.penalty_tickets" severity="warning" />
                                    </template>
                                </Column>
                                <Column field="total_tickets" header="Total de Bilhetes">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.total_tickets }}</span>
                                    </template>
                                </Column>
                                <Column field="total_amount" header="Valor Total">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.total_amount) }}
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Vendas Recentes -->
                    <div class="col-12" v-if="session.recentSales && session.recentSales.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Vendas Recentes</h6>
                            
                            <DataTable :value="session.recentSales" showGridlines responsiveLayout="scroll" :paginator="true" :rows="10">
                                <Column field="id" header="ID">
                                    <template #body="{ data }">
                                        #{{ data.id }}
                                    </template>
                                </Column>
                                <Column field="reference" header="Referencia"></Column>
                                <Column field="type" header="Tipo">
                                    <template #body="{ data }">
                                        <Tag :value="getTypeLabel(data.type)" :severity="getTypeSeverity(data.type)" />
                                    </template>
                                </Column>
                                <Column field="route_name" header="Rota"></Column>
                                <!-- <Column header="Paragens">
                                    <template #body="{ data }">
                                        <p class=""><strong>Origem:</strong> {{ data.originRouteStop?.name }}</p>
                                        <p class=""><strong>Destino:</strong> {{ data.destinationRouteStop?.name }}</p>
                                    </template>
                                </Column> -->
                                <Column field="ticket_type_name" header="Tipo de Bilhete"></Column>
                                <Column field="quantity" header="Qtd.">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.quantity }}</span>
                                    </template>
                                </Column>
                                <Column field="price" header="Preço">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.price) }}
                                    </template>
                                </Column>
                                <Column field="total" header="Total">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ formatCurrency(data.total) }}</span>
                                    </template>
                                </Column>
                                <Column field="vehicle_plate" header="Veículo"></Column>
                                <Column field="driver_name" header="Motorista">
                                    <template #body="{ data }">
                                        {{ data.driver_name || '-' }}
                                    </template>
                                </Column>
                                <Column field="sold_at" header="Data/Hora">
                                    <template #body="{ data }">
                                        {{ formatDate(data.ticket_sold_at) }}
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Vendas Recentes -->
                    <div class="col-12" v-if="session.recentLogs && session.recentLogs.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Bilhetes Reimpressos</h6>
                            
                            <DataTable :value="session.recentLogs" showGridlines responsiveLayout="scroll" :paginator="true" :rows="10">
                                <Column field="id" header="ID">
                                    <template #body="{ data }">
                                        #{{ data.id }}
                                    </template>
                                </Column>
                               <Column field="reference" header="Referencia"></Column>
                                <Column field="route_name" header="Rota"></Column>
                                <Column field="ticket_type_name" header="Tipo de Bilhete"></Column>
                                <Column field="quantity" header="Qtd.">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ data.quantity }}</span>
                                    </template>
                                </Column>
                                <Column field="price" header="Preço">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.price) }}
                                    </template>
                                </Column>
                                <Column field="total" header="Total">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ formatCurrency(data.total) }}</span>
                                    </template>
                                </Column>
                                <Column field="vehicle_plate" header="Veículo"></Column>
                                <Column field="driver_name" header="Motorista">
                                    <template #body="{ data }">
                                        {{ data.driver_name || '-' }}
                                    </template>
                                </Column>
                                <Column field="sold_at" header="Data/Hora">
                                    <template #body="{ data }">
                                        {{ formatDate(data.ticket_sold_at) }}
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Observações -->
                    <div class="col-12" v-if="session.notes">
                        <div class="card">
                            <h6 class="text-primary mb-3">Observações</h6>
                            <p class="line-height-3 m-0">{{ session.notes }}</p>
                        </div>
                    </div>

                    <!-- Auditoria -->
                    <div class="col-12">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações de Auditoria</h6>
                            
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="field mb-0">
                                        <label class="font-medium text-600">Criado por:</label>
                                        <p class="mt-1 mb-0 text-900">{{ session.createdBy?.name }}</p>
                                        <small class="text-500">{{ formatDate(session.createdAt) }}</small>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field mb-0">
                                        <label class="font-medium text-600">Atualizado por:</label>
                                        <p class="mt-1 mb-0 text-900">{{ session.updatedBy?.name }}</p>
                                        <small class="text-500">{{ formatDate(session.updatedAt) }}</small>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4" v-if="session.closedBy">
                                    <div class="field mb-0">
                                        <label class="font-medium text-600">Fechado por:</label>
                                        <p class="mt-1 mb-0 text-900">{{ session.closedBy?.name }}</p>
                                        <small class="text-500">{{ formatDate(session.closed_at) }}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Componente de Impressão da Guia de Entrega -->
    <PrintDeliveryGuide ref="printComponentRef" :session="session" />
    
    <!-- Componente de Impressão da Nota de Débito -->
    <PrintDebitNote ref="printDebitNoteRef" :session="session" />
</template>
