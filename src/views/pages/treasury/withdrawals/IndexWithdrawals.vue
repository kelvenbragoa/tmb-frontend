<template>
    <div class="accounts-page">
        <!-- Header -->
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 class="text-2xl font-semibold text-900 m-0">Contas de Tesouraria</h2>
                            <p class="text-600 mt-1 mb-0">Gerencie todas as contas financeiras da empresa</p>
                        </div>
                        <div class="flex gap-2">
                            <Button 
                                icon="pi pi-refresh" 
                                label="Atualizar" 
                                outlined 
                                @click="loadAccounts" 
                                :loading="loading"
                            />
                            <Button 
                                icon="pi pi-plus" 
                                label="Nova Conta" 
                                @click="$router.push('/treasury/accounts/new')"
                            />
                        </div>
                    </div>
                    
                    <!-- Filtros -->
                    <div class="flex flex-column md:flex-row gap-3 mb-4">
                        <div class="flex-1">
                            <IconField iconPosition="left">
                                <InputIcon class="pi pi-search" />
                                <InputText 
                                    v-model="searchTerm" 
                                    placeholder="Buscar contas..." 
                                    class="w-full"
                                />
                            </IconField>
                        </div>
                        <Dropdown 
                            v-model="typeFilter" 
                            :options="accountTypeOptions" 
                            optionLabel="label" 
                            optionValue="value"
                            placeholder="Todos os tipos"
                            class="w-full md:w-15rem"
                        />
                        <Dropdown 
                            v-model="statusFilter" 
                            :options="statusOptions" 
                            optionLabel="label" 
                            optionValue="value"
                            placeholder="Todos os status"
                            class="w-full md:w-12rem"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Resumo Financeiro -->
        <div class="grid mb-4">
            <div class="col-12 md:col-3">
                <div class="card text-center p-4">
                    <div class="text-600 font-medium mb-2">Total de Contas</div>
                    <div class="text-2xl font-bold text-900">{{ filteredAccounts.length }}</div>
                </div>
            </div>
            <div class="col-12 md:col-3">
                <div class="card text-center p-4">
                    <div class="text-600 font-medium mb-2">Saldo Total</div>
                    <div class="text-2xl font-bold text-green-600">
                        {{ formatCurrency(totalBalance) }}
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-3">
                <div class="card text-center p-4">
                    <div class="text-600 font-medium mb-2">Contas Ativas</div>
                    <div class="text-2xl font-bold text-blue-600">
                        {{ activeAccountsCount }}
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-3">
                <div class="card text-center p-4">
                    <div class="text-600 font-medium mb-2">Maior Saldo</div>
                    <div class="text-2xl font-bold text-orange-600">
                        {{ formatCurrency(highestBalance) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabela de Contas -->
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <DataTable 
                        :value="filteredAccounts" 
                        :loading="loading"
                        responsiveLayout="scroll"
                        :paginator="true"
                        :rows="20"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[10, 20, 50]"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} contas"
                        class="p-datatable-sm"
                        :globalFilterFields="['name', 'account_number', 'bank_name', 'description']"
                        v-model:filters="filters"
                    >
                        <Column field="name" header="Nome da Conta" :sortable="true" class="min-w-12rem">
                            <template #body="slotProps">
                                <div class="flex align-items-center">
                                    <div class="account-type-badge mr-3">
                                        <i :class="getAccountTypeIcon(slotProps.data.account_type)"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-900">{{ slotProps.data.name }}</div>
                                        <div class="text-sm text-600" v-if="slotProps.data.account_number">
                                            {{ slotProps.data.account_number }}
                                        </div>
                                        <div class="text-sm text-600" v-if="slotProps.data.bank_name">
                                            {{ slotProps.data.bank_name }}
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
                                    class="font-semibold"
                                />
                            </template>
                        </Column>
                        
                        <Column field="current_balance" header="Saldo Atual" :sortable="true" class="text-right">
                            <template #body="slotProps">
                                <div class="font-bold" :class="getBalanceClass(slotProps.data.current_balance)">
                                    {{ formatCurrency(slotProps.data.current_balance) }}
                                </div>
                            </template>
                        </Column>
                        
                        <Column field="is_active" header="Status" :sortable="true">
                            <template #body="slotProps">
                                <Tag 
                                    :value="slotProps.data.is_active ? 'Ativa' : 'Inativa'"
                                    :severity="slotProps.data.is_active ? 'success' : 'secondary'"
                                />
                            </template>
                        </Column>
                        
                        <Column field="updated_at" header="Última Atualização" :sortable="true">
                            <template #body="slotProps">
                                <div class="text-sm text-600">
                                    {{ formatDateTime(slotProps.data.updated_at) }}
                                </div>
                            </template>
                        </Column>
                        
                        <Column header="Ações" class="text-center" style="min-width: 12rem">
                            <template #body="slotProps">
                                <div class="flex justify-content-center gap-2">
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
                                        v-tooltip.top="'Novo Depósito'"
                                    />
                                    <Button 
                                        icon="pi pi-minus" 
                                        class="p-button-text p-button-sm p-button-danger"
                                        @click="quickWithdrawal(slotProps.data)"
                                        v-tooltip.top="'Novo Saque'"
                                    />
                                    <Button 
                                        icon="pi pi-trash" 
                                        class="p-button-text p-button-sm p-button-danger"
                                        @click="confirmDelete(slotProps.data)"
                                        v-tooltip.top="'Excluir'"
                                        :disabled="!canDelete(slotProps.data)"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Dialog de Confirmação de Exclusão -->
        <ConfirmDialog />
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';
import TreasuryService from '@/service/TreasuryService';
import TreasuryDemoService from '@/service/TreasuryDemoService';

export default {
    name: 'IndexAccounts',
    setup() {
        const router = useRouter();
        const toast = useToast();
        const confirm = useConfirm();
        
        // Estado reativo
        const loading = ref(false);
        const accounts = ref([]);
        
        // Filtros
        const searchTerm = ref('');
        const typeFilter = ref(null);
        const statusFilter = ref(null);
        
        const filters = ref({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        });
        
        // Opções de filtro
        const accountTypeOptions = ref([
            { label: 'Todos os Tipos', value: null },
            { label: 'Dinheiro', value: 'cash' },
            { label: 'Conta Bancária', value: 'bank' },
            { label: 'Carteira Digital', value: 'digital_wallet' },
            { label: 'Investimentos', value: 'investment' },
            { label: 'Outros', value: 'other' }
        ]);
        
        const statusOptions = ref([
            { label: 'Todos os Status', value: null },
            { label: 'Ativas', value: true },
            { label: 'Inativas', value: false }
        ]);
        
        // Serviço (usar demo se API não disponível)
        const service = TreasuryDemoService; // ou TreasuryService quando API estiver pronta
        
        // Computed para contas filtradas
        const filteredAccounts = computed(() => {
            let filtered = [...accounts.value];
            
            // Filtro por busca
            if (searchTerm.value) {
                const search = searchTerm.value.toLowerCase();
                filtered = filtered.filter(account => 
                    account.name.toLowerCase().includes(search) ||
                    (account.account_number && account.account_number.toLowerCase().includes(search)) ||
                    (account.bank_name && account.bank_name.toLowerCase().includes(search)) ||
                    (account.description && account.description.toLowerCase().includes(search))
                );
            }
            
            // Filtro por tipo
            if (typeFilter.value) {
                filtered = filtered.filter(account => account.account_type === typeFilter.value);
            }
            
            // Filtro por status
            if (statusFilter.value !== null) {
                filtered = filtered.filter(account => account.is_active === statusFilter.value);
            }
            
            return filtered;
        });
        
        // Computed para estatísticas
        const totalBalance = computed(() => {
            return filteredAccounts.value.reduce((sum, account) => sum + account.current_balance, 0);
        });
        
        const activeAccountsCount = computed(() => {
            return filteredAccounts.value.filter(account => account.is_active).length;
        });
        
        const highestBalance = computed(() => {
            const balances = filteredAccounts.value.map(account => account.current_balance);
            return balances.length > 0 ? Math.max(...balances) : 0;
        });
        
        // Watch para atualizar filtro global
        watch(searchTerm, (newVal) => {
            filters.value.global.value = newVal;
        });
        
        // Métodos
        const loadAccounts = async () => {
            try {
                loading.value = true;
                const response = await service.getAccounts();
                accounts.value = response.data || [];
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
        
        const canDelete = (account) => {
            // Não permitir excluir contas com saldo ou contas principais
            return account.current_balance === 0 && account.account_type !== 'main';
        };
        
        const confirmDelete = (account) => {
            confirm.require({
                message: `Tem certeza que deseja excluir a conta "${account.name}"?`,
                header: 'Confirmar Exclusão',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                acceptLabel: 'Sim, Excluir',
                rejectLabel: 'Cancelar',
                accept: () => deleteAccount(account)
            });
        };
        
        const deleteAccount = async (account) => {
            try {
                await service.deleteAccount(account.id);
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Conta excluída com sucesso',
                    life: 3000
                });
                
                await loadAccounts();
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao excluir conta',
                    life: 3000
                });
            }
        };
        
        // Utility methods
        const formatCurrency = service.formatCurrency.bind(service);
        const formatDateTime = service.formatDateTime.bind(service);
        const getAccountTypeLabel = service.getAccountTypeLabel.bind(service);
        
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
            return severities[type];
        };
        
        const getBalanceClass = (balance) => ({
            'text-green-600': balance > 0,
            'text-red-600': balance < 0,
            'text-600': balance === 0
        });
        
        // Lifecycle
        onMounted(() => {
            loadAccounts();
        });
        
        return {
            loading,
            accounts,
            searchTerm,
            typeFilter,
            statusFilter,
            filters,
            accountTypeOptions,
            statusOptions,
            filteredAccounts,
            totalBalance,
            activeAccountsCount,
            highestBalance,
            loadAccounts,
            viewAccount,
            editAccount,
            quickDeposit,
            quickWithdrawal,
            canDelete,
            confirmDelete,
            formatCurrency,
            formatDateTime,
            getAccountTypeLabel,
            getAccountTypeIcon,
            getAccountTypeSeverity,
            getBalanceClass
        };
    }
};
</script>

<style scoped>
.accounts-page .card {
    background: var(--surface-card);
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}

.account-type-badge {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--surface-100);
    border: 2px solid var(--surface-200);
}

.account-type-badge i {
    font-size: 1.1rem;
}

.p-datatable {
    border-radius: 10px;
}

.min-w-12rem {
    min-width: 12rem;
}
</style>