<template>
    <div class="treasury-dashboard">
        <!-- Header do Dashboard -->
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 class="text-2xl font-semibold text-900 m-0">Gestão de Tesouraria</h2>
                            <p class="text-600 mt-1 mb-0">Controle financeiro completo da sua empresa</p>
                        </div>
                        <div class="flex gap-2">
                            <Button 
                                icon="pi pi-refresh" 
                                label="Atualizar" 
                                outlined 
                                @click="refreshDashboard" 
                                :loading="loading"
                            />
                            <Button 
                                icon="pi pi-plus" 
                                label="Nova Conta" 
                                @click="showNewAccountDialog"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cards de Resumo -->
        <div class="grid">
            <div class="col-12 lg:col-3 md:col-6">
                <div class="card text-center">
                    <div class="text-900 font-medium mb-2">Total em Contas</div>
                    <div class="text-3xl text-900 font-semibold">{{ formatCurrency(summary.total_balance) }}</div>
                    <div class="text-green-500 font-medium">
                        <i class="pi pi-arrow-up mr-1"></i>
                        {{ summary.total_accounts }} contas ativas
                    </div>
                </div>
            </div>
            <div class="col-12 lg:col-3 md:col-6">
                <div class="card text-center">
                    <div class="text-900 font-medium mb-2">Depósitos Hoje</div>
                    <div class="text-3xl text-900 font-semibold">{{ formatCurrency(todayStats.deposits) }}</div>
                    <div class="text-blue-500 font-medium">
                        <i class="pi pi-plus-circle mr-1"></i>
                        {{ todayStats.deposits_count }} transações
                    </div>
                </div>
            </div>
            <div class="col-12 lg:col-3 md:col-6">
                <div class="card text-center">
                    <div class="text-900 font-medium mb-2">Saques Hoje</div>
                    <div class="text-3xl text-900 font-semibold">{{ formatCurrency(todayStats.withdrawals) }}</div>
                    <div class="text-red-500 font-medium">
                        <i class="pi pi-minus-circle mr-1"></i>
                        {{ todayStats.withdrawals_count }} transações
                    </div>
                </div>
            </div>
            <div class="col-12 lg:col-3 md:col-6">
                <div class="card text-center">
                    <div class="text-900 font-medium mb-2">Saldo Líquido</div>
                    <div class="text-3xl text-900 font-semibold" :class="netBalanceClass">
                        {{ formatCurrency(todayStats.net_balance) }}
                    </div>
                    <div class="text-600 font-medium">
                        <i :class="netBalanceIcon"></i>
                        Variação do dia
                    </div>
                </div>
            </div>
        </div>

        <!-- Gráfico de Saldos por Tipo de Conta -->
        <div class="grid">
            <div class="col-12 lg:col-8">
                <div class="card">
                    <h5>Distribuição de Saldos por Tipo de Conta</h5>
                    <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full md:w-30rem" />
                </div>
            </div>
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h5>Ações Rápidas</h5>
                    <div class="flex flex-column gap-3">
                        <Button 
                            icon="pi pi-plus" 
                            label="Novo Depósito" 
                            class="p-button-success w-full"
                            @click="$router.push('/treasury/deposits/new')"
                        />
                        <Button 
                            icon="pi pi-minus" 
                            label="Novo Saque" 
                            class="p-button-danger w-full"
                            @click="$router.push('/treasury/withdrawals/new')"
                        />
                        <Button 
                            icon="pi pi-credit-card" 
                            label="Gerenciar Contas" 
                            class="p-button-info w-full"
                            @click="$router.push('/treasury/accounts')"
                        />
                        <Button 
                            icon="pi pi-chart-line" 
                            label="Relatórios" 
                            outlined 
                            class="w-full"
                            @click="$router.push('/treasury/reports')"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Lista de Contas -->
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5 class="m-0">Contas de Tesouraria</h5>
                        <div class="flex gap-2">
                            <Dropdown 
                                v-model="accountFilter" 
                                :options="accountFilterOptions" 
                                optionLabel="label" 
                                optionValue="value"
                                placeholder="Filtrar por status"
                                class="w-10rem"
                                @change="loadAccounts"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        :value="accounts" 
                        :loading="loading"
                        responsiveLayout="scroll"
                        :paginator="true"
                        :rows="10"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} contas"
                        class="p-datatable-sm"
                    >
                        <Column field="name" header="Nome da Conta" :sortable="true">
                            <template #body="slotProps">
                                <div class="flex align-items-center">
                                    <i :class="getAccountTypeIcon(slotProps.data.account_type)" class="mr-2"></i>
                                    <div>
                                        <div class="font-medium">{{ slotProps.data.name }}</div>
                                        <div class="text-sm text-600" v-if="slotProps.data.account_number">
                                            {{ slotProps.data.account_number }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Column>
                        
                        <Column field="account_type" header="Tipo" :sortable="true">
                            <template #body="slotProps">
                                <Tag 
                                    :value="getAccountTypeLabel(slotProps.data.account_type)"
                                    :severity="getAccountTypeSeverity(slotProps.data.account_type)"
                                />
                            </template>
                        </Column>
                        
                        <Column field="current_balance" header="Saldo Atual" :sortable="true">
                            <template #body="slotProps">
                                <span class="font-semibold" :class="getBalanceClass(slotProps.data.current_balance)">
                                    {{ formatCurrency(slotProps.data.current_balance) }}
                                </span>
                            </template>
                        </Column>
                        
                        <Column field="is_active" header="Status" :sortable="true">
                            <template #body="slotProps">
                                <Tag 
                                    :value="slotProps.data.is_active ? 'Ativo' : 'Inativo'"
                                    :severity="slotProps.data.is_active ? 'success' : 'secondary'"
                                />
                            </template>
                        </Column>
                        
                        <Column field="updated_at" header="Última Atualização" :sortable="true">
                            <template #body="slotProps">
                                <span class="text-600">{{ formatDateTime(slotProps.data.updated_at) }}</span>
                            </template>
                        </Column>
                        
                        <Column header="Ações">
                            <template #body="slotProps">
                                <div class="flex gap-2">
                                    <Button 
                                        icon="pi pi-eye" 
                                        class="p-button-text p-button-sm"
                                        @click="viewAccount(slotProps.data)"
                                        v-tooltip.top="'Visualizar'"
                                    />
                                    <Button 
                                        icon="pi pi-pencil" 
                                        class="p-button-text p-button-sm p-button-info"
                                        @click="editAccount(slotProps.data)"
                                        v-tooltip.top="'Editar'"
                                    />
                                    <Button 
                                        icon="pi pi-plus" 
                                        class="p-button-text p-button-sm p-button-success"
                                        @click="quickDeposit(slotProps.data)"
                                        v-tooltip.top="'Depósito'"
                                    />
                                    <Button 
                                        icon="pi pi-minus" 
                                        class="p-button-text p-button-sm p-button-danger"
                                        @click="quickWithdrawal(slotProps.data)"
                                        v-tooltip.top="'Saque'"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Transações Recentes -->
        <div class="grid">
            <div class="col-12 lg:col-6">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5 class="m-0">Depósitos Recentes</h5>
                        <Button 
                            label="Ver Todos" 
                            class="p-button-text p-button-sm"
                            @click="$router.push('/treasury/deposits')"
                        />
                    </div>
                    
                    <div class="flex flex-column gap-3">
                        <div 
                            v-for="deposit in recentDeposits" 
                            :key="deposit.id"
                            class="flex justify-content-between align-items-center p-3 border-1 border-200 border-round"
                        >
                            <div class="flex align-items-center">
                                <i class="pi pi-plus-circle text-green-500 mr-3 text-xl"></i>
                                <div>
                                    <div class="font-medium">{{ deposit.description }}</div>
                                    <div class="text-sm text-600">{{ formatDate(deposit.transaction_date) }}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold text-green-600">
                                    {{ formatCurrency(deposit.amount) }}
                                </div>
                                <Tag 
                                    :value="getStatusLabel(deposit.status)"
                                    :severity="getStatusSeverity(deposit.status)"
                                    class="text-xs"
                                />
                            </div>
                        </div>
                        
                        <div v-if="!recentDeposits.length" class="text-center text-600 py-4">
                            <i class="pi pi-info-circle mr-2"></i>
                            Nenhum depósito recente
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-12 lg:col-6">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5 class="m-0">Saques Recentes</h5>
                        <Button 
                            label="Ver Todos" 
                            class="p-button-text p-button-sm"
                            @click="$router.push('/treasury/withdrawals')"
                        />
                    </div>
                    
                    <div class="flex flex-column gap-3">
                        <div 
                            v-for="withdrawal in recentWithdrawals" 
                            :key="withdrawal.id"
                            class="flex justify-content-between align-items-center p-3 border-1 border-200 border-round"
                        >
                            <div class="flex align-items-center">
                                <i class="pi pi-minus-circle text-red-500 mr-3 text-xl"></i>
                                <div>
                                    <div class="font-medium">{{ withdrawal.description }}</div>
                                    <div class="text-sm text-600">{{ formatDate(withdrawal.transaction_date) }}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold text-red-600">
                                    {{ formatCurrency(withdrawal.amount) }}
                                </div>
                                <Tag 
                                    :value="getStatusLabel(withdrawal.status)"
                                    :severity="getStatusSeverity(withdrawal.status)"
                                    class="text-xs"
                                />
                            </div>
                        </div>
                        
                        <div v-if="!recentWithdrawals.length" class="text-center text-600 py-4">
                            <i class="pi pi-info-circle mr-2"></i>
                            Nenhum saque recente
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog Nova Conta -->
        <Dialog v-model:visible="showAccountDialog" header="Nova Conta de Tesouraria" modal :style="{ width: '50rem' }">
            <form @submit.prevent="createAccount">
                <div class="grid formgrid">
                    <div class="field col-12 md:col-6">
                        <label for="account_name">Nome da Conta *</label>
                        <InputText 
                            id="account_name" 
                            v-model="newAccount.name" 
                            required 
                            class="w-full"
                            placeholder="Ex: Caixa Principal"
                        />
                    </div>
                    
                    <div class="field col-12 md:col-6">
                        <label for="account_type">Tipo de Conta *</label>
                        <Dropdown 
                            id="account_type"
                            v-model="newAccount.account_type" 
                            :options="accountTypes" 
                            optionLabel="label" 
                            optionValue="value"
                            required 
                            class="w-full"
                            placeholder="Selecione o tipo"
                        />
                    </div>
                    
                    <div class="field col-12 md:col-6">
                        <label for="account_number">Número da Conta</label>
                        <InputText 
                            id="account_number" 
                            v-model="newAccount.account_number" 
                            class="w-full"
                            placeholder="Ex: 12345678901"
                        />
                    </div>
                    
                    <div class="field col-12 md:col-6">
                        <label for="bank_name">Nome do Banco</label>
                        <InputText 
                            id="bank_name" 
                            v-model="newAccount.bank_name" 
                            class="w-full"
                            placeholder="Ex: Banco BAI"
                        />
                    </div>
                    
                    <div class="field col-12 md:col-6">
                        <label for="current_balance">Saldo Inicial</label>
                        <InputNumber 
                            id="current_balance" 
                            v-model="newAccount.current_balance" 
                            mode="currency" 
                            currency="AOA" 
                            locale="pt-AO"
                            class="w-full"
                            :min="0"
                            :minFractionDigits="2"
                            :maxFractionDigits="2"
                        />
                    </div>
                    
                    <div class="field col-12 md:col-6">
                        <label for="is_active">Status</label>
                        <div class="flex align-items-center mt-2">
                            <Checkbox 
                                id="is_active" 
                                v-model="newAccount.is_active" 
                                :binary="true"
                            />
                            <label for="is_active" class="ml-2">Conta ativa</label>
                        </div>
                    </div>
                    
                    <div class="field col-12">
                        <label for="description">Descrição</label>
                        <Textarea 
                            id="description" 
                            v-model="newAccount.description" 
                            rows="3" 
                            class="w-full"
                            placeholder="Descrição opcional da conta"
                        />
                    </div>
                </div>
                
                <div class="flex justify-content-end gap-2 mt-4">
                    <Button 
                        type="button" 
                        label="Cancelar" 
                        class="p-button-text" 
                        @click="showAccountDialog = false"
                    />
                    <Button 
                        type="submit" 
                        label="Criar Conta" 
                        :loading="savingAccount"
                    />
                </div>
            </form>
        </Dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import TreasuryService from '@/service/TreasuryService';
import TreasuryDemoService from '@/service/TreasuryDemoService';

export default {
    name: 'TreasuryDashboard',
    setup() {
        const router = useRouter();
        const toast = useToast();
        
        // Estado reativo
        const loading = ref(false);
        const savingAccount = ref(false);
        const showAccountDialog = ref(false);
        
        // Dados
        const accounts = ref([]);
        const recentDeposits = ref([]);
        const recentWithdrawals = ref([]);
        const summary = ref({
            total_accounts: 0,
            total_balance: 0,
            accounts_by_type: {}
        });
        
        // Filtros
        const accountFilter = ref(null);
        const accountFilterOptions = ref([
            { label: 'Todas as Contas', value: null },
            { label: 'Apenas Ativas', value: true },
            { label: 'Apenas Inativas', value: false }
        ]);
        
        // Nova conta
        const newAccount = reactive({
            name: '',
            account_type: '',
            account_number: '',
            bank_name: '',
            current_balance: 0,
            is_active: true,
            description: ''
        });
        
        // Opções de tipos de conta
        const accountTypes = ref([
            { label: 'Dinheiro', value: 'cash' },
            { label: 'Conta Bancária', value: 'bank' },
            { label: 'Carteira Digital', value: 'digital_wallet' },
            { label: 'Investimentos', value: 'investment' },
            { label: 'Outros', value: 'other' }
        ]);
        
        // Serviço (usar demo se API não estiver disponível)
        const service = TreasuryDemoService; // ou TreasuryService quando API estiver pronta
        
        // Computed para estatísticas do dia
        const todayStats = computed(() => {
            const today = new Date().toISOString().split('T')[0];
            
            const todayDeposits = recentDeposits.value.filter(d => 
                d.transaction_date === today && d.status === 'confirmed'
            );
            const todayWithdrawals = recentWithdrawals.value.filter(w => 
                w.transaction_date === today && w.status === 'confirmed'
            );
            
            const depositsTotal = todayDeposits.reduce((sum, d) => sum + d.amount, 0);
            const withdrawalsTotal = todayWithdrawals.reduce((sum, w) => sum + w.amount, 0);
            
            return {
                deposits: depositsTotal,
                deposits_count: todayDeposits.length,
                withdrawals: withdrawalsTotal,
                withdrawals_count: todayWithdrawals.length,
                net_balance: depositsTotal - withdrawalsTotal
            };
        });
        
        const netBalanceClass = computed(() => ({
            'text-green-600': todayStats.value.net_balance > 0,
            'text-red-600': todayStats.value.net_balance < 0,
            'text-600': todayStats.value.net_balance === 0
        }));
        
        const netBalanceIcon = computed(() => {
            if (todayStats.value.net_balance > 0) return 'pi pi-arrow-up mr-1 text-green-500';
            if (todayStats.value.net_balance < 0) return 'pi pi-arrow-down mr-1 text-red-500';
            return 'pi pi-minus mr-1 text-600';
        });
        
        // Chart data
        const chartData = computed(() => {
            const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
            const labels = [];
            const data = [];
            const backgroundColor = [];
            
            let colorIndex = 0;
            for (const [type, amount] of Object.entries(summary.value.accounts_by_type || {})) {
                labels.push(service.getAccountTypeLabel(type));
                data.push(amount);
                backgroundColor.push(colors[colorIndex % colors.length]);
                colorIndex++;
            }
            
            return {
                labels,
                datasets: [{
                    data,
                    backgroundColor
                }]
            };
        });
        
        const chartOptions = ref({
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        });
        
        // Métodos
        const loadAccounts = async () => {
            try {
                loading.value = true;
                const response = await service.getAccounts({ is_active: accountFilter.value });
                accounts.value = response.data;
            } catch (error) {
                console.error('Erro ao carregar contas:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar contas de tesouraria',
                    life: 3000
                });
            } finally {
                loading.value = false;
            }
        };
        
        const loadSummary = async () => {
            try {
                const response = await service.getAccountsSummary();
                summary.value = response.data;
            } catch (error) {
                console.error('Erro ao carregar resumo:', error);
            }
        };
        
        const loadRecentTransactions = async () => {
            try {
                const depositsResponse = await service.getDeposits();
                const withdrawalsResponse = await service.getWithdrawals();
                
                recentDeposits.value = depositsResponse.data
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5);
                    
                recentWithdrawals.value = withdrawalsResponse.data
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5);
            } catch (error) {
                console.error('Erro ao carregar transações recentes:', error);
            }
        };
        
        const refreshDashboard = async () => {
            await Promise.all([
                loadAccounts(),
                loadSummary(),
                loadRecentTransactions()
            ]);
        };
        
        const showNewAccountDialog = () => {
            Object.assign(newAccount, {
                name: '',
                account_type: '',
                account_number: '',
                bank_name: '',
                current_balance: 0,
                is_active: true,
                description: ''
            });
            showAccountDialog.value = true;
        };
        
        const createAccount = async () => {
            try {
                savingAccount.value = true;
                const response = await service.createAccount(newAccount);
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: response.message || 'Conta criada com sucesso',
                    life: 3000
                });
                
                showAccountDialog.value = false;
                await refreshDashboard();
            } catch (error) {
                console.error('Erro ao criar conta:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao criar conta',
                    life: 3000
                });
            } finally {
                savingAccount.value = false;
            }
        };
        
        const viewAccount = (account) => {
            router.push(`/treasury/accounts/${account.id}`);
        };
        
        const editAccount = (account) => {
            router.push(`/treasury/accounts/${account.id}/edit`);
        };
        
        const quickDeposit = (account) => {
            router.push({
                path: '/treasury/deposits/new',
                query: { account_id: account.id }
            });
        };
        
        const quickWithdrawal = (account) => {
            router.push({
                path: '/treasury/withdrawals/new',
                query: { account_id: account.id }
            });
        };
        
        // Utility methods
        const formatCurrency = service.formatCurrency.bind(service);
        const formatDate = service.formatDate.bind(service);
        const formatDateTime = service.formatDateTime.bind(service);
        const getAccountTypeLabel = service.getAccountTypeLabel.bind(service);
        const getStatusLabel = service.getStatusLabel.bind(service);
        const getStatusSeverity = service.getStatusSeverity.bind(service);
        
        const getAccountTypeIcon = (type) => {
            const icons = {
                cash: 'pi pi-money-bill text-green-500',
                bank: 'pi pi-building text-blue-500',
                digital_wallet: 'pi pi-mobile text-purple-500',
                investment: 'pi pi-chart-line text-orange-500',
                other: 'pi pi-folder text-600'
            };
            return icons[type] || 'pi pi-folder';
        };
        
        const getAccountTypeSeverity = (type) => {
            const severities = {
                cash: 'success',
                bank: 'info',
                digital_wallet: 'warning',
                investment: 'secondary',
                other: null
            };
            return severities[type] || null;
        };
        
        const getBalanceClass = (balance) => ({
            'text-green-600': balance > 0,
            'text-red-600': balance < 0,
            'text-600': balance === 0
        });
        
        // Lifecycle
        onMounted(() => {
            refreshDashboard();
        });
        
        return {
            loading,
            savingAccount,
            showAccountDialog,
            accounts,
            recentDeposits,
            recentWithdrawals,
            summary,
            todayStats,
            accountFilter,
            accountFilterOptions,
            newAccount,
            accountTypes,
            netBalanceClass,
            netBalanceIcon,
            chartData,
            chartOptions,
            loadAccounts,
            refreshDashboard,
            showNewAccountDialog,
            createAccount,
            viewAccount,
            editAccount,
            quickDeposit,
            quickWithdrawal,
            formatCurrency,
            formatDate,
            formatDateTime,
            getAccountTypeLabel,
            getStatusLabel,
            getStatusSeverity,
            getAccountTypeIcon,
            getAccountTypeSeverity,
            getBalanceClass
        };
    }
};
</script>

<style scoped>
.treasury-dashboard .card {
    background: var(--surface-card);
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}

.treasury-dashboard .p-datatable {
    border-radius: 10px;
}

.treasury-dashboard .p-chart {
    position: relative;
}
</style>