<script setup>
import SessionService from '@/service/SessionService';
import UserService from '@/service/UserService';
import { usePermissions } from '@/composables/usePermissions';
import { ref, onMounted, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import PrintGuiaReceita from './PrintGuiaReceita.vue'; 


const toast = useToast();
const { user, isAdmin } = usePermissions();

const loading = ref(false);
const loadingUsers = ref(false);
const report = ref(null);
const users = ref([]);
const selectedDate = ref(new Date());
const selectedOperatorId = ref(null);
const filtersReady = ref(false);
const printGuiaReceitaRef = ref(null);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(Number(value) || 0);
};

const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
};

const formatTime = (time) => {
    return time ? moment(time, 'HH:mm:ss').format('HH:mm') : '-';
};

const formatReportDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
};

const selectedOperatorName = computed(() => {
    if (!selectedOperatorId.value) return '-';
    const found = users.value.find((u) => u.id === selectedOperatorId.value);
    return found?.name || user.value?.name || '-';
});

const totalTicketsSold = computed(() => {
    if (!report.value?.sessions?.length) return 0;
    return report.value.sessions.reduce((sum, s) => sum + (Number(s.total_tickets_sold) || 0), 0);
});

const getStatusSeverity = (status) => {
    switch (status) {
        case 'open':
            return 'success';
        case 'closed':
            return 'secondary';
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
        default:
            return status;
    }
};

const loadUsers = async () => {
    if (!isAdmin.value) return;
    loadingUsers.value = true;
    try {
        const response = await UserService.getAllUsers({ page: 1, limit: 1000 });
        users.value = response.items || response;
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar utilizadores', life: 3000 });
    } finally {
        loadingUsers.value = false;
    }
};

const loadReport = async () => {
    if (!selectedOperatorId.value || !selectedDate.value) return;

    loading.value = true;
    try {
        report.value = await SessionService.getSessionReport({
            date: formatReportDate(selectedDate.value),
            operatorId: selectedOperatorId.value
        });
    } catch (error) {
        report.value = null;
        const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao carregar relatório';
        toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
    } finally {
        loading.value = false;
    }
};

const initFilters = () => {
    selectedOperatorId.value = user.value?.id ?? null;
    selectedDate.value = new Date();
};

onMounted(async () => {
    initFilters();
    await loadUsers();
    await loadReport();
    filtersReady.value = true;
});

watch([selectedDate, selectedOperatorId], () => {
    if (!filtersReady.value) return;
    loadReport();
});

const printGuiaReceita = () => {
    if (printGuiaReceitaRef.value) {
        printGuiaReceitaRef.value.print();
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                    <h5 class="m-0">Guia de Receita</h5>
                    <div class="flex gap-2 flex-wrap">
                        <Button
                            v-if="report"
                            icon="pi pi-print"
                            label="Imprimir Guia de Receita"
                            @click="printGuiaReceita"
                            class="p-button-outlined p-button-info"
                        />
                        <router-link to="/transport/sessions">
                            <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-text" />
                        </router-link>
                    </div>
                </div>

                <div class="grid mb-4">
                    <div class="col-12 md:col-6 lg:col-4">
                        <label class="block text-600 font-medium mb-2">Data</label>
                        <Calendar
                            v-model="selectedDate"
                            dateFormat="dd/mm/yy"
                            class="w-full"
                            showIcon
                            showButtonBar
                            :maxDate="new Date()"
                        />
                    </div>
                    <div class="col-12 md:col-6 lg:col-4">
                        <label class="block text-600 font-medium mb-2">Operador</label>
                        <Dropdown
                            v-if="isAdmin"
                            v-model="selectedOperatorId"
                            :options="users"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecionar operador"
                            class="w-full"
                            filter
                            :loading="loadingUsers"
                        />
                        <InputText
                            v-else
                            :modelValue="selectedOperatorName"
                            class="w-full"
                            disabled
                        />
                    </div>
                </div>

                <div v-if="loading" class="flex justify-content-center py-6">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <template v-else-if="report">
                    <div class="grid mb-4">
                        <div class="col-12 md:col-4">
                            <div class="card bg-blue-50 border-1 border-blue-200 mb-0">
                                <span class="block text-600 font-medium mb-2">Total do Dia</span>
                                <div class="text-900 font-bold text-2xl">{{ formatCurrency(report.totalAmount) }}</div>
                            </div>
                        </div>
                        <div class="col-12 md:col-4">
                            <div class="card bg-green-50 border-1 border-green-200 mb-0">
                                <span class="block text-600 font-medium mb-2">Sessões</span>
                                <div class="text-900 font-bold text-2xl">{{ report.sessions?.length || 0 }}</div>
                            </div>
                        </div>
                        <div class="col-12 md:col-4">
                            <div class="card bg-purple-50 border-1 border-purple-200 mb-0">
                                <span class="block text-600 font-medium mb-2">Bilhetes Vendidos</span>
                                <div class="text-900 font-bold text-2xl">{{ totalTicketsSold }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="card mb-4" v-if="report.sessions?.length">
                        <h6 class="text-primary mb-3">Sessões</h6>
                        <DataTable :value="report.sessions" showGridlines responsiveLayout="scroll">
                            <Column header="Nº">
                                <template #body="{ data }">#{{ data.id }}</template>
                            </Column>
                            <Column header="Turno">
                                <template #body="{ data }">
                                    <div class="font-medium">{{ data.shift?.name }}</div>
                                    <small class="text-500">{{ formatTime(data.shift?.start_time) }} - {{ formatTime(data.shift?.end_time) }}</small>
                                </template>
                            </Column>
                            <Column header="Status">
                                <template #body="{ data }">
                                    <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                                </template>
                            </Column>
                            <Column header="Abertura">
                                <template #body="{ data }">{{ formatDate(data.opened_at) }}</template>
                            </Column>
                            <Column header="Fechamento">
                                <template #body="{ data }">{{ formatDate(data.closed_at) }}</template>
                            </Column>
                            <Column header="Bilhetes">
                                <template #body="{ data }">
                                    <span class="font-bold">{{ data.total_tickets_sold }}</span>
                                </template>
                            </Column>
                            <Column header="Vendas">
                                <template #body="{ data }">{{ formatCurrency(data.total_sales) }}</template>
                            </Column>
                            <Column header="Multas">
                                <template #body="{ data }">{{ formatCurrency(data.total_penalty_sales) }}</template>
                            </Column>
                            <Column header="Total">
                                <template #body="{ data }">
                                    <span class="font-bold">{{ formatCurrency(data.total_amount) }}</span>
                                </template>
                            </Column>
                            <Column header="Entregue">
                                <template #body="{ data }">{{ formatCurrency(data.actual_amount_delivered) }}</template>
                            </Column>
                        </DataTable>
                    </div>

                    <div class="card mb-4" v-if="report.totalAmountByShift?.length">
                        <h6 class="text-primary mb-3">Total por Turno</h6>
                        <DataTable :value="report.totalAmountByShift" showGridlines responsiveLayout="scroll">
                            <Column field="shift_name" header="Turno" />
                            <Column field="totalAmount" header="Total">
                                <template #body="{ data }">
                                    <span class="font-bold">{{ formatCurrency(data.totalAmount) }}</span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div class="card mb-4" v-if="report.salesByTicketType?.length">
                        <h6 class="text-primary mb-3">Vendas por Tipo de Bilhete</h6>
                        <DataTable :value="report.salesByTicketType" showGridlines responsiveLayout="scroll">
                            <Column field="ticket_type_name" header="Tipo de Bilhete" />
                            <Column field="quantity" header="Quantidade">
                                <template #body="{ data }">
                                    <span class="font-bold">{{ data.quantity }}</span>
                                </template>
                            </Column>
                            <Column field="total_amount" header="Total">
                                <template #body="{ data }">
                                    <span class="font-bold">{{ formatCurrency(data.total_amount) }}</span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div class="card" v-if="report.totalAmountByShiftAndRoute?.length">
                        <h6 class="text-primary mb-3">Total por Turno e Rota</h6>
                        <div v-for="shiftGroup in report.totalAmountByShiftAndRoute" :key="shiftGroup.shift_id" class="mb-4">
                            <h6 class="text-700 mb-2">{{ shiftGroup.shift_name }}</h6>
                            <DataTable :value="shiftGroup.routes" showGridlines responsiveLayout="scroll">
                                <Column field="route_name" header="Rota" />
                                <Column field="total_amount" header="Total">
                                    <template #body="{ data }">
                                        <span class="font-bold">{{ formatCurrency(data.total_amount) }}</span>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <div v-if="!report.sessions?.length && !report.totalAmount" class="text-center text-500 py-6">
                        Nenhum dado encontrado para a data e operador selecionados.
                    </div>
                </template>

                <div v-else-if="!loading && !report" class="text-center text-500 py-6">
                    Não foi possível carregar o relatório.
                </div>
            </div>
        </div>
    </div>

    <PrintGuiaReceita
        v-if="report"
        ref="printGuiaReceitaRef"
        :report="report"
        :operator-name="selectedOperatorName"
        :operator-id="selectedOperatorId"
        :report-date="selectedDate"
    />
</template>
