<script setup>
import SessionService from '@/service/SessionService';
import UserService from '@/service/UserService';
import { ref, onMounted, watch, onBeforeUnmount} from 'vue';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';
import { useRouter } from 'vue-router';


const toast = useToast();
const loading = ref(false);
const isLoadingDiv = ref(true);
const searchQuery = ref('');
const retrievedData = ref([]);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalRecords = ref(0);
const statusFilter = ref('');
const operatorFilter = ref(null);
const startDateFilter = ref(null);
const endDateFilter = ref(null);
const operators = ref([]);
const refreshInterval = ref(null);

// Modal de fechar sessão
const showCloseModal = ref(false);
const sessionToClose = ref(null);
const closeNotes = ref('');
const actualAmountDelivered = ref(null);
const closingSession = ref(false);

const router = useRouter();

const statusOptions = ref([{ label: 'Todas', value: '' }, ...SessionService.getSessionStatuses()]);

const items = ref([
    {
        label: 'Guia de Receita',
        icon: 'pi pi-list',
        command: () => {
            router.push('/transport/sessions/reports/guia-receita');
        },
    },
    {
        label: 'Relatório Diário do Caixa',
        icon: 'pi pi-list'
    },
    // {
    //     separator: true
    // },
    {
        label: 'Informação Diário de Receita',
        icon: 'pi pi-list'
    },
    {
        label: 'Informação dos Conferentes',
        icon: 'pi pi-list'
    }
]);

const loadOperators = async () => {
    try {
        const response = await UserService.getAllUsers({ page: 1, limit: 1000 });
        operators.value = response.items || response;
    } catch (error) {
        console.error('Erro ao carregar operadores:', error);
    }
};

const getData = async (page = 1) => {
    loading.value = true;
    try {
        const params = {
            page,
            limit: rowsPerPage.value
        };
        
        if (searchQuery.value) {
            params.search = searchQuery.value;
        }
        
        if (statusFilter.value) {
            params.status = statusFilter.value;
        }
        
        if (operatorFilter.value) {
            params.operator_id = operatorFilter.value;
        }
        
        if (startDateFilter.value) {
            params.startDate = moment(startDateFilter.value).format('YYYY-MM-DD');
        }
        
        if (endDateFilter.value) {
            params.endDate = moment(endDateFilter.value).format('YYYY-MM-DD');
        }
        
        console.log('Parâmetros enviados:', params);
        
        const response = await SessionService.getAllSessions(params);
        retrievedData.value = response.items;
        totalRecords.value = response.meta.totalItems;
        isLoadingDiv.value = false;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar sessões', life: 3000 });
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

const onFilter = () => {
    currentPage.value = 1;
    getData();
};

const openCloseModal = (session) => {
    sessionToClose.value = session;
    closeNotes.value = '';
    actualAmountDelivered.value = session.total_sales || null;
    showCloseModal.value = true;
};

const closeModal = () => {
    showCloseModal.value = false;
    sessionToClose.value = null;
    closeNotes.value = '';
    actualAmountDelivered.value = null;
};

const confirmCloseSession = async () => {
    if (!sessionToClose.value) return;
    
    closingSession.value = true;
    try {
        await SessionService.closeSession(sessionToClose.value.id, {
            notes: closeNotes.value || 'Sessão encerrada',
            actual_amount_delivered: actualAmountDelivered.value ? Number(actualAmountDelivered.value) : 0
        });
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Sessão fechada com sucesso',
            life: 3000
        });
        
        closeModal();
        getData(currentPage.value); // Recarregar dados
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao fechar sessão',
            life: 3000
        });
    } finally {
        closingSession.value = false;
    }
};

const debouncedSearch = debounce(onFilter, 300);
watch(searchQuery, debouncedSearch);
watch(statusFilter, onFilter);
watch(operatorFilter, onFilter);
watch(startDateFilter, onFilter);
watch(endDateFilter, onFilter);

onMounted(() => {
    loadOperators();
    getData();

    refreshInterval.value = setInterval(() => {
        getData(currentPage.value);
    }, 60000);
});

onBeforeUnmount(() => {
    if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
    }
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
                    <h5 class="m-0">Sessões de Operação</h5>
                    <div>
                        <!-- <SplitButton label="Relatório" :model="items" class="mr-2"></SplitButton> -->
                        <router-link to="/transport/sessions/reports/guia-receita" >
                            <Button label="Relatorio" icon="pi pi-book" class="mr-2"/>
                        </router-link>
                        <router-link to="/transport/sessions/create">
                            <Button label="Nova Sessão" icon="pi pi-plus" />
                        </router-link>
                    </div>
                    
                </div>

                <div class="grid mb-4">
                    <!-- <div class="col-12 md:col-6 lg:col-3">
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText v-model="searchQuery" placeholder="Pesquisar sessões..." class="w-full" />
                        </IconField>
                    </div> -->
                    <div class="col-12 md:col-6 lg:col-3">
                        <Dropdown v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Filtrar por status" class="w-full" showClear />
                    </div>
                    <div class="col-12 md:col-6 lg:col-3">
                        <Dropdown v-model="operatorFilter" :options="operators" optionLabel="name" optionValue="id" placeholder="Filtrar por operador" class="w-full" showClear filter />
                    </div>
                    <div class="col-12 md:col-6 lg:col-3">
                        <Calendar v-model="startDateFilter" placeholder="Data inicial" dateFormat="dd/mm/yy" class="w-full" showIcon showButtonBar />
                    </div>
                    <div class="col-12 md:col-6 lg:col-3">
                        <Calendar v-model="endDateFilter" placeholder="Data final" dateFormat="dd/mm/yy" class="w-full" showIcon showButtonBar />
                    </div>
                </div>

                <DataTable :value="retrievedData" :paginator="true" :rows="rowsPerPage" :totalRecords="totalRecords" :lazy="true" :loading="loading" @page="onPageChange" showGridlines>
                    <template #empty>Nenhuma sessão encontrada.</template>

                    <Column header="Nº da Sessão">
                        <template #body="{ data }">
                            #{{ data.id }}
                        </template>
                    </Column>

                    <Column header="Operador">
                        <template #body="{ data }">
                            {{ data.operator?.name }}
                        </template>
                    </Column>

                    <Column header="Turno">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.shift?.name }}</div>
                            <div class="text-sm text-600">{{ data.shift?.start_time }} → {{ data.shift?.end_time }}</div>
                        </template>
                    </Column>
                    <!-- <Column header="Rota">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.route?.name }}</div>
                            <div class="text-sm text-600">{{ data.route?.origin }} → {{ data.route?.destination }}</div>
                        </template>
                    </Column>

                    <Column header="Veículo">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.vehicle?.name }}</div>
                            <div class="text-sm text-600">{{ data.vehicle?.plate }}</div>
                        </template>
                    </Column> -->

                    <Column header="Status">
                        <template #body="{ data }">
                            <Tag :value="SessionService.getStatusLabel(data.status)" :severity="SessionService.getStatusSeverity(data.status)" />
                        </template>
                    </Column>

                    <Column header="Início">
                        <template #body="{ data }">
                            {{ moment(data.opened_at).format('DD/MM/YYYY HH:mm') }}
                        </template>
                    </Column>

                    <Column header="Total Vendas">
                        <template #body="{ data }">
                            <div class="font-medium">
                                {{ data.status === 'closed' 
                                    ? formatCurrency(data.total_amount || 0) 
                                    : formatCurrency((Number(data.total_sales) || 0) + (Number(data.total_penalty_sales) || 0)) 
                                }}
                            </div>
                            <div class="text-sm text-600">
                                <span class="text-green-700">Regular: {{ formatCurrency(data.total_sales || 0) }}</span>
                                <span v-if="data.total_penalty_sales" class="ml-2 text-orange-700">Multas: {{ formatCurrency(data.total_penalty_sales) }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column header="Bilhetes">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.total_tickets_sold }} total</div>
                            <div class="text-sm text-600">
                                <span v-if="data.indicators">
                                    <i class="pi pi-check-circle text-green-600"></i> {{ data.indicators.total_regular_tickets || 0 }}
                                    <i class="pi pi-exclamation-triangle text-orange-600 ml-2"></i> {{ data.indicators.total_penalty_tickets || 0 }}
                                </span>
                            </div>
                        </template>
                    </Column>

                    <Column header="Ações">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <router-link :to="'/transport/sessions/' + data.id">
                                    <Button icon="pi pi-eye" class="p-button-text p-button-sm" v-tooltip.top="'Visualizar'" />
                                </router-link>
                                <Button v-if="data.status === 'open'" icon="pi pi-stop-circle" class="p-button-text p-button-sm text-orange-600" v-tooltip.top="'Fechar Sessão'" @click="openCloseModal(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- Modal de Fechar Sessão -->
    <Dialog v-model:visible="showCloseModal" header="Fechar Sessão" :modal="true" :style="{ width: '500px' }" :closable="!closingSession">
        <div class="mb-4">
            <div class="mb-2"><strong>Operador:</strong> {{ sessionToClose?.operator?.name }}</div>
            <div class="mb-2"><strong>Turno:</strong> {{ sessionToClose?.shift?.name }}</div>
            <div class="mb-3">
                <strong>Total Vendas:</strong> 
                <span class="text-green-600 font-bold">{{ formatCurrency(sessionToClose?.total_sales || 0) }}</span>
            </div>

            <div class="mb-3">
                <strong>Diferença:</strong> 
                <span :class="(sessionToClose?.total_sales || 0) - (actualAmountDelivered || 0) > 0 ? 'text-red-600' : (sessionToClose?.total_sales || 0) - (actualAmountDelivered || 0) < 0 ? 'text-orange-600' : 'text-green-600'" class="font-bold">
                    {{ formatCurrency((sessionToClose?.total_sales || 0) - (actualAmountDelivered || 0)) }}
                </span>
                <small class="block text-600 mt-1">
                    {{ (sessionToClose?.total_sales || 0) - (actualAmountDelivered || 0) > 0 ? 'Falta dinheiro' : (sessionToClose?.total_sales || 0) - (actualAmountDelivered || 0) < 0 ? 'Sobrou dinheiro' : 'Valor correto' }}
                </small>
            </div>
        </div>
        
        <div class="field mb-3">
            <label for="actualAmount" class="font-medium">Valor Real Entregue <span class="text-red-500">*</span></label>
            <InputNumber 
                id="actualAmount" 
                v-model="actualAmountDelivered" 
                mode="currency" 
                currency="MZN" 
                locale="pt-MZ"
                placeholder="Digite o valor real entregue" 
                class="w-full" 
                :disabled="closingSession"
                :min="0"
            />
            <small class="text-600">Valor efetivamente entregue ao final da sessão pelo cobrador ao caixa</small>
        </div>
        
        <div class="field">
            <label for="closeNotes" class="font-medium">Observações (opcional)</label>
            <Textarea id="closeNotes" v-model="closeNotes" placeholder="Digite observações sobre o fechamento da sessão..." class="w-full" rows="3" :disabled="closingSession" />
        </div>
        
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeModal" class="p-button-text" :disabled="closingSession" />
            <Button label="Fechar Sessão" icon="pi pi-check" @click="confirmCloseSession" class="p-button-danger" :loading="closingSession" />
        </template>
    </Dialog>
</template>
