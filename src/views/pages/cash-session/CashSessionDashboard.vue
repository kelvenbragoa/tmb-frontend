<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import CashSessionService from '@/service/CashSessionService';
import CashSessionDemoService from '@/service/CashSessionDemoService';

export default {
    name: 'CashSessionDashboard',
    setup() {
        const router = useRouter();
        const toast = useToast();
        
        // Reactive data
        const dashboardData = ref({
            summary: {},
            recent_sessions: [],
            movement_categories: {}
        });
        const activeSession = ref(null);
        const loading = ref(false);
        const saving = ref(false);
        
        // Dialogs
        const showOpenSessionDialog = ref(false);
        const showCloseSessionDialog = ref(false);
        
        // Forms
        const newSession = ref({
            opening_balance: 0,
            opening_notes: '',
            point_of_sale_id: 1
        });
        
        const closeSession = ref({
            closing_balance: 0,
            closing_notes: ''
        });
        
        // Errors
        const errors = ref({});
        
        // Computed
        const hasActiveSession = computed(() => {
            return activeSession.value && activeSession.value.status === 'open';
        });
        
        // Methods
        const loadDashboardData = async () => {
            try {
                loading.value = true;
                
                // Tentar carregar dados reais, fallback para demo
                let service = CashSessionService;
                try {
                    const data = await service.getDashboardSummary();
                    dashboardData.value = data;
                } catch (error) {
                    console.warn('API não disponível, usando dados demo:', error.message);
                    service = CashSessionDemoService;
                    const data = await service.getDashboardSummary();
                    dashboardData.value = data;
                }
                
                // Carregar sessão ativa
                try {
                    activeSession.value = await service.getActiveSession();
                } catch (error) {
                    activeSession.value = null;
                }
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível carregar os dados do dashboard',
                    life: 3000
                });
            } finally {
                loading.value = false;
            }
        };
        
        const openNewSession = () => {
            newSession.value = {
                opening_balance: 0,
                opening_notes: '',
                point_of_sale_id: 1
            };
            errors.value = {};
            showOpenSessionDialog.value = true;
        };
        
        const confirmOpenSession = async () => {
            errors.value = {};
            
            if (!newSession.value.opening_balance) {
                errors.value.opening_balance = 'Saldo inicial é obrigatório e deve ser maior ou igual a zero';
                return;
            }
            
            try {
                saving.value = true;
                
                let service = CashSessionService;
                try {
                    activeSession.value = await service.openSession(newSession.value);
                } catch (error) {
                    console.warn('API não disponível, usando serviço demo:', error.message);
                    service = CashSessionDemoService;
                    activeSession.value = await service.openSession(newSession.value);
                }
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Sessão ${activeSession.value.session_number} aberta com sucesso`,
                    life: 3000
                });
                
                showOpenSessionDialog.value = false;
                await loadDashboardData();
            } catch (error) {
                console.error('Erro ao abrir sessão:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Não foi possível abrir a sessão',
                    life: 5000
                });
            } finally {
                saving.value = false;
            }
        };
        
        const closeActiveSession = () => {
            if (!activeSession.value) return;
            
            closeSession.value = {
                closing_balance: activeSession.value.expected_balance,
                closing_notes: ''
            };
            errors.value = {};
            showCloseSessionDialog.value = true;
        };
        
        const confirmCloseSession = async () => {
            if (!activeSession.value) return;
            
            errors.value = {};
            
            if (!closeSession.value.closing_balance || closeSession.value.closing_balance < 0) {
                errors.value.closing_balance = 'Saldo de fechamento é obrigatório e deve ser maior ou igual a zero';
                return;
            }
            
            try {
                saving.value = true;
                
                let service = CashSessionService;
                try {
                    await service.closeSession(activeSession.value.id, closeSession.value);
                } catch (error) {
                    console.warn('API não disponível, usando serviço demo:', error.message);
                    service = CashSessionDemoService;
                    await service.closeSession(activeSession.value.id, closeSession.value);
                }
                
                const difference = closeSession.value.closing_balance - activeSession.value.expected_balance;
                const differenceText = difference === 0 ? 'sem diferença' : difference > 0 ? `com sobra de ${formatCurrency(difference)}` : `com falta de ${formatCurrency(Math.abs(difference))}`;
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Sessão fechada ${differenceText}`,
                    life: 5000
                });
                
                showCloseSessionDialog.value = false;
                activeSession.value = null;
                await loadDashboardData();
            } catch (error) {
                console.error('Erro ao fechar sessão:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Não foi possível fechar a sessão',
                    life: 5000
                });
            } finally {
                saving.value = false;
            }
        };
        
        // Navigation methods
        const viewSession = (sessionId) => {
            router.push(`/cash-session/session/${sessionId}`);
        };
        
        const viewSessionMovements = (sessionId) => {
            router.push(`/cash-session/movements/${sessionId}`);
        };
        
        const addMovement = () => {
            if (activeSession.value) {
                router.push(`/cash-session/movements/${activeSession.value.id}/add`);
            }
        };
        
        const goToAllSessions = () => {
            router.push('/cash-session/sessions');
        };
        
        const goToReports = () => {
            router.push('/cash-session/reports');
        };
        
        const generateReport = (sessionId) => {
            router.push(`/cash-session/report/${sessionId}`);
        };
        
        // Utility methods
        const formatCurrency = (value) => {
            if (!value && value !== 0) return 'MT 0,00';
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'MZN',
                currencyDisplay: 'code'
            })
                .format(value)
                .replace('MZN', 'MT');
        };
        
        const formatDateTime = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        const getCategoryName = (key) => {
            const names = {
                sale: 'Vendas',
                payment_received: 'Pagamentos Recebidos',
                cash_deposit: 'Suprimentos',
                cash_withdrawal: 'Sangrias',
                other: 'Outros'
            };
            return names[key] || key;
        };
        
        const getCategoryIcon = (key) => {
            const icons = {
                sale: { icon: 'pi pi-shopping-cart', color: 'bg-green-100' },
                payment_received: { icon: 'pi pi-credit-card', color: 'bg-blue-100' },
                cash_deposit: { icon: 'pi pi-plus-circle', color: 'bg-cyan-100' },
                cash_withdrawal: { icon: 'pi pi-minus-circle', color: 'bg-orange-100' },
                other: { icon: 'pi pi-ellipsis-h', color: 'bg-purple-100' }
            };
            return icons[key] || { icon: 'pi pi-circle', color: 'bg-gray-100' };
        };
        
        // Lifecycle
        onMounted(() => {
            loadDashboardData();
            
            // Auto-refresh a cada 30 segundos
            const interval = setInterval(() => {
                loadDashboardData();
            }, 30000);
            
            // Cleanup
            return () => clearInterval(interval);
        });
        
        return {
            // Data
            dashboardData,
            activeSession,
            loading,
            saving,
            
            // Dialogs
            showOpenSessionDialog,
            showCloseSessionDialog,
            
            // Forms
            newSession,
            closeSession,
            errors,
            
            // Computed
            hasActiveSession,
            
            // Methods
            loadDashboardData,
            openNewSession,
            confirmOpenSession,
            closeActiveSession,
            confirmCloseSession,
            viewSession,
            viewSessionMovements,
            addMovement,
            goToAllSessions,
            goToReports,
            generateReport,
            formatCurrency,
            formatDateTime,
            getCategoryName,
            getCategoryIcon
        };
    }
};
</script>

<template>
    <div class="grid">
        <!-- Header com ações rápidas -->
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-900 mb-2">Dashboard Cash Session</h2>
                        <p class="text-600 m-0">Gerencie suas sessões de caixa e monitore movimentos em tempo real</p>
                    </div>
                    <div class="flex gap-2 mt-3 md:mt-0">
                        <Button label="Abrir Sessão" icon="pi pi-plus" @click="openNewSession" :disabled="hasActiveSession" class="p-button-success" />
                        <Button label="Fechar Sessão" icon="pi pi-times" @click="closeActiveSession" :disabled="!hasActiveSession" class="p-button-warning" />
                        <Button label="Relatórios" icon="pi pi-chart-line" @click="goToReports" class="p-button-info" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Cards de estatísticas -->
        <div class="col-12 lg:col-3 md:col-6">
            <div class="card text-center">
                <div class="flex align-items-center justify-content-center mb-3">
                    <div class="border-circle w-3rem h-3rem bg-green-100 flex align-items-center justify-content-center">
                        <i class="pi pi-check-circle text-green-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500 font-medium">Sessões Ativas</span>
                <div class="text-900 font-bold text-xl mt-2">{{ dashboardData.summary?.active_sessions || 0 }}</div>
            </div>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
            <div class="card text-center">
                <div class="flex align-items-center justify-content-center mb-3">
                    <div class="border-circle w-3rem h-3rem bg-blue-100 flex align-items-center justify-content-center">
                        <i class="pi pi-calendar text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500 font-medium">Sessões Hoje</span>
                <div class="text-900 font-bold text-xl mt-2">{{ dashboardData.summary?.total_sessions_today || 0 }}</div>
            </div>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
            <div class="card text-center">
                <div class="flex align-items-center justify-content-center mb-3">
                    <div class="border-circle w-3rem h-3rem bg-orange-100 flex align-items-center justify-content-center">
                        <i class="pi pi-dollar text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500 font-medium">Total em Caixa</span>
                <div class="text-900 font-bold text-xl mt-2">{{ formatCurrency(dashboardData.summary?.total_cash_today || 0) }}</div>
            </div>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
            <div class="card text-center">
                <div class="flex align-items-center justify-content-center mb-3">
                    <div class="border-circle w-3rem h-3rem bg-purple-100 flex align-items-center justify-content-center">
                        <i class="pi pi-list text-purple-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500 font-medium">Movimentos Hoje</span>
                <div class="text-900 font-bold text-xl mt-2">{{ dashboardData.summary?.total_movements_today || 0 }}</div>
            </div>
        </div>

        <!-- Sessão Ativa (se houver) -->
        <div class="col-12" v-if="activeSession">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h3 class="text-xl font-bold text-900 m-0">Sessão Ativa</h3>
                    <Tag :value="activeSession.status" severity="success" />
                </div>
                
                <div class="grid">
                    <div class="col-12 md:col-4">
                        <div class="mb-3">
                            <span class="text-500 font-medium">Número da Sessão</span>
                            <div class="text-900 font-bold">{{ activeSession.session_number }}</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-4">
                        <div class="mb-3">
                            <span class="text-500 font-medium">Saldo Inicial</span>
                            <div class="text-900 font-bold">{{ formatCurrency(activeSession.opening_balance) }}</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-4">
                        <div class="mb-3">
                            <span class="text-500 font-medium">Saldo Atual</span>
                            <div class="text-900 font-bold text-green-600">{{ formatCurrency(activeSession.expected_balance) }}</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-4">
                        <div class="mb-3">
                            <span class="text-500 font-medium">Total Entradas</span>
                            <div class="text-900 font-bold text-green-600">{{ formatCurrency(activeSession.total_entries) }}</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-4">
                        <div class="mb-3">
                            <span class="text-500 font-medium">Total Saídas</span>
                            <div class="text-900 font-bold text-red-600">{{ formatCurrency(activeSession.total_exits) }}</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-4">
                        <div class="mb-3">
                            <span class="text-500 font-medium">Aberta em</span>
                            <div class="text-900 font-bold">{{ formatDateTime(activeSession.opened_at) }}</div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2 mt-4">
                    <Button label="Ver Movimentos" icon="pi pi-list" @click="viewSessionMovements(activeSession.id)" class="p-button-outlined" />
                    <Button label="Adicionar Movimento" icon="pi pi-plus" @click="addMovement" class="p-button-outlined p-button-success" />
                </div>
            </div>
        </div>

        <!-- Sessões Recentes -->
        <div class="col-12 lg:col-8">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h3 class="text-xl font-bold text-900 m-0">Sessões Recentes</h3>
                    <Button label="Ver Todas" icon="pi pi-external-link" @click="goToAllSessions" class="p-button-text" />
                </div>

                <DataTable :value="dashboardData.recent_sessions" :loading="loading" responsiveLayout="scroll" :paginator="false" class="p-datatable-sm">
                    <Column field="session_number" header="Número" sortable></Column>
                    <Column field="status" header="Status">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status === 'open' ? 'Aberta' : 'Fechada'" :severity="slotProps.data.status === 'open' ? 'success' : 'secondary'" />
                        </template>
                    </Column>
                    <Column field="opening_balance" header="Saldo Inicial">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.opening_balance) }}
                        </template>
                    </Column>
                    <Column field="expected_balance" header="Saldo Atual">
                        <template #body="slotProps">
                            <span :class="slotProps.data.status === 'open' ? 'text-green-600' : ''">
                                {{ formatCurrency(slotProps.data.expected_balance) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="opened_at" header="Aberta em">
                        <template #body="slotProps">
                            {{ formatDateTime(slotProps.data.opened_at) }}
                        </template>
                    </Column>
                    <Column header="Ações">
                        <template #body="slotProps">
                            <div class="flex gap-1">
                                <Button icon="pi pi-eye" @click="viewSession(slotProps.data.id)" class="p-button-rounded p-button-text p-button-sm" v-tooltip="'Ver detalhes'" />
                                <Button icon="pi pi-file-pdf" @click="generateReport(slotProps.data.id)" class="p-button-rounded p-button-text p-button-sm p-button-info" v-tooltip="'Relatório'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Categorias de Movimentos -->
        <div class="col-12 lg:col-4">
            <div class="card">
                <h3 class="text-xl font-bold text-900 mb-4">Movimentos por Categoria</h3>
                
                <div class="flex flex-column gap-3">
                    <div v-for="(category, key) in dashboardData.movement_categories" :key="key" class="flex align-items-center justify-content-between p-3 border-1 border-200 border-round">
                        <div class="flex align-items-center gap-3">
                            <div class="border-circle w-2rem h-2rem flex align-items-center justify-content-center" :class="getCategoryIcon(key).color">
                                <i :class="getCategoryIcon(key).icon + ' text-sm'"></i>
                            </div>
                            <div>
                                <div class="font-medium text-900">{{ getCategoryName(key) }}</div>
                                <div class="text-500 text-sm">{{ category.count }} movimentos</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-900">{{ formatCurrency(category.total) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Dialog para abrir nova sessão -->
    <Dialog v-model:visible="showOpenSessionDialog" :style="{ width: '450px' }" header="Abrir Nova Sessão" :modal="true">
        <div class="field">
            <label for="opening_balance" class="block text-900 font-medium mb-2">Saldo Inicial *</label>
            <InputNumber id="opening_balance" v-model="newSession.opening_balance" mode="currency" currency="MZN" locale="pt-BR" :min="0" :class="{ 'p-invalid': errors.opening_balance }" class="w-full" />
            <small class="p-error" v-if="errors.opening_balance">{{ errors.opening_balance }}</small>
        </div>

        <div class="field">
            <label for="opening_notes" class="block text-900 font-medium mb-2">Observações</label>
            <Textarea id="opening_notes" v-model="newSession.opening_notes" rows="3" class="w-full" placeholder="Observações sobre a abertura da sessão..." />
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="showOpenSessionDialog = false" class="p-button-text" />
            <Button label="Abrir Sessão" icon="pi pi-check" @click="confirmOpenSession" :loading="saving" />
        </template>
    </Dialog>

    <!-- Dialog para fechar sessão -->
    <Dialog v-model:visible="showCloseSessionDialog" :style="{ width: '450px' }" header="Fechar Sessão Ativa" :modal="true">
        <div v-if="activeSession" class="mb-4">
            <p class="text-600 mb-3">
                Você está fechando a sessão <strong>{{ activeSession.session_number }}</strong>
            </p>
            
            <div class="grid mb-3">
                <div class="col-6">
                    <span class="text-500">Saldo Esperado:</span>
                    <div class="font-bold text-green-600">{{ formatCurrency(activeSession.expected_balance) }}</div>
                </div>
            </div>
        </div>

        <div class="field">
            <label for="closing_balance" class="block text-900 font-medium mb-2">Saldo Real de Fechamento *</label>
            <InputNumber id="closing_balance" v-model="closeSession.closing_balance" mode="currency" currency="MZN" locale="pt-BR" :min="0" :class="{ 'p-invalid': errors.closing_balance }" class="w-full" />
            <small class="p-error" v-if="errors.closing_balance">{{ errors.closing_balance }}</small>
        </div>

        <div class="field">
            <label for="closing_notes" class="block text-900 font-medium mb-2">Observações de Fechamento</label>
            <Textarea id="closing_notes" v-model="closeSession.closing_notes" rows="3" class="w-full" placeholder="Observações sobre o fechamento..." />
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="showCloseSessionDialog = false" class="p-button-text" />
            <Button label="Fechar Sessão" icon="pi pi-check" @click="confirmCloseSession" :loading="saving" class="p-button-warning" />
        </template>
    </Dialog>
</template>

<style scoped>
.card {
    /* box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12); */
}

.border-circle {
    border-radius: 50%;
}
</style>