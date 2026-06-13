import axios from 'axios';

class TreasuryService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });

        // Interceptor para adicionar token de autenticação
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Interceptor para tratamento de erros
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    handleError(error) {
        if (error.response) {
            console.error('Treasury API Error:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url
            });
        } else {
            console.error('Treasury Network Error:', error.message);
        }
    }

    // ============ TREASURY ACCOUNTS ============

    // 1. Criar Conta de Tesouraria
    async createAccount(accountData) {
        this.validateAccountData(accountData);
        
        const response = await this.client.post('/treasury/accounts', {
            name: accountData.name,
            account_type: accountData.account_type,
            account_number: accountData.account_number || null,
            bank_name: accountData.bank_name || null,
            bank_code: accountData.bank_code || null,
            agency: accountData.agency || null,
            current_balance: parseFloat(accountData.current_balance || 0),
            is_active: accountData.is_active !== false,
            description: accountData.description || '',
            currency_id: accountData.currency_id || 1,
            metadata: accountData.metadata || {}
        });
        
        return response.data;
    }

    // 2. Listar Contas
    async getAccounts(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.is_active !== undefined) {
            params.append('is_active', filters.is_active);
        }

        const response = await this.client.get(`/treasury/accounts${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    }

    // 3. Contas Ativas (Dropdown)
    async getActiveAccounts() {
        const response = await this.client.get('/treasury/accounts/active');
        return response.data;
    }

    // 4. Resumo Financeiro
    async getAccountsSummary() {
        const response = await this.client.get('/treasury/accounts/summary');
        return response.data;
    }

    // 5. Obter Conta por ID
    async getAccount(id) {
        const response = await this.client.get(`/treasury/accounts/${id}`);
        return response.data;
    }

    // 6. Obter Saldo da Conta
    async getAccountBalance(id) {
        const response = await this.client.get(`/treasury/accounts/${id}/balance`);
        return response.data;
    }

    // 7. Atualizar Conta
    async updateAccount(id, updateData) {
        const response = await this.client.patch(`/treasury/accounts/${id}`, updateData);
        return response.data;
    }

    // 8. Deletar Conta
    async deleteAccount(id) {
        await this.client.delete(`/treasury/accounts/${id}`);
        return true;
    }

    // ============ DEPOSITS ============

    // 1. Registrar Depósito
    async createDeposit(depositData) {
        this.validateDepositData(depositData);
        
        const response = await this.client.post('/treasury/deposits', {
            amount: parseFloat(depositData.amount),
            description: depositData.description,
            treasury_account_id: parseInt(depositData.treasury_account_id),
            reference_number: depositData.reference_number || null,
            status: depositData.status || 'confirmed',
            transaction_date: depositData.transaction_date || new Date().toISOString().split('T')[0],
            source: depositData.source || '',
            notes: depositData.notes || '',
            metadata: depositData.metadata || {}
        });
        
        return response.data;
    }

    // 2. Listar Depósitos
    async getDeposits(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.treasury_account_id) {
            params.append('treasury_account_id', filters.treasury_account_id);
        }
        if (filters.status) {
            params.append('status', filters.status);
        }
        if (filters.date_from) {
            params.append('date_from', filters.date_from);
        }
        if (filters.date_to) {
            params.append('date_to', filters.date_to);
        }

        const response = await this.client.get(`/treasury/deposits${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    }

    // 3. Resumo de Depósitos
    async getDepositsSummary(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.date_from) {
            params.append('date_from', filters.date_from);
        }
        if (filters.date_to) {
            params.append('date_to', filters.date_to);
        }

        const response = await this.client.get(`/treasury/deposits/summary${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    }

    // 4. Obter Depósito por ID
    async getDeposit(id) {
        const response = await this.client.get(`/treasury/deposits/${id}`);
        return response.data;
    }

    // 5. Atualizar Depósito
    async updateDeposit(id, updateData) {
        const response = await this.client.patch(`/treasury/deposits/${id}`, updateData);
        return response.data;
    }

    // 6. Confirmar Depósito Pendente
    async confirmDeposit(id) {
        const response = await this.client.patch(`/treasury/deposits/${id}/confirm`);
        return response.data;
    }

    // 7. Cancelar Depósito
    async cancelDeposit(id) {
        const response = await this.client.patch(`/treasury/deposits/${id}/cancel`);
        return response.data;
    }

    // 8. Deletar Depósito
    async deleteDeposit(id) {
        await this.client.delete(`/treasury/deposits/${id}`);
        return true;
    }

    // ============ WITHDRAWALS ============

    // 1. Registrar Saque
    async createWithdrawal(withdrawalData) {
        this.validateWithdrawalData(withdrawalData);
        
        const response = await this.client.post('/treasury/withdrawals', {
            amount: parseFloat(withdrawalData.amount),
            description: withdrawalData.description,
            treasury_account_id: parseInt(withdrawalData.treasury_account_id),
            reference_number: withdrawalData.reference_number || null,
            status: withdrawalData.status || 'confirmed',
            transaction_date: withdrawalData.transaction_date || new Date().toISOString().split('T')[0],
            destination: withdrawalData.destination || '',
            withdrawal_method: withdrawalData.withdrawal_method || 'transferencia',
            notes: withdrawalData.notes || '',
            metadata: withdrawalData.metadata || {}
        });
        
        return response.data;
    }

    // 2. Listar Saques
    async getWithdrawals(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.treasury_account_id) {
            params.append('treasury_account_id', filters.treasury_account_id);
        }
        if (filters.status) {
            params.append('status', filters.status);
        }
        if (filters.date_from) {
            params.append('date_from', filters.date_from);
        }
        if (filters.date_to) {
            params.append('date_to', filters.date_to);
        }

        const response = await this.client.get(`/treasury/withdrawals${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    }

    // 3. Obter Saque por ID
    async getWithdrawal(id) {
        const response = await this.client.get(`/treasury/withdrawals/${id}`);
        return response.data;
    }

    // 4. Atualizar Saque
    async updateWithdrawal(id, updateData) {
        const response = await this.client.patch(`/treasury/withdrawals/${id}`, updateData);
        return response.data;
    }

    // 5. Deletar Saque
    async deleteWithdrawal(id) {
        await this.client.delete(`/treasury/withdrawals/${id}`);
        return true;
    }

    // ============ VALIDATIONS ============

    validateAccountData(data) {
        if (!data.name || data.name.trim().length < 2) {
            throw new Error('Nome da conta é obrigatório (mínimo 2 caracteres)');
        }

        if (!data.account_type) {
            throw new Error('Tipo de conta é obrigatório');
        }

        const validTypes = ['cash', 'bank', 'digital_wallet', 'investment', 'other'];
        if (!validTypes.includes(data.account_type)) {
            throw new Error('Tipo de conta inválido');
        }

        if (data.current_balance && (isNaN(data.current_balance) || parseFloat(data.current_balance) < 0)) {
            throw new Error('Saldo inicial deve ser um número positivo');
        }
    }

    validateDepositData(data) {
        if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
            throw new Error('Valor do depósito deve ser maior que zero');
        }

        if (!data.description || data.description.trim().length < 3) {
            throw new Error('Descrição é obrigatória (mínimo 3 caracteres)');
        }

        if (!data.treasury_account_id) {
            throw new Error('Conta de tesouraria é obrigatória');
        }

        if (data.status) {
            const validStatuses = ['pending', 'confirmed', 'cancelled', 'rejected'];
            if (!validStatuses.includes(data.status)) {
                throw new Error('Status inválido');
            }
        }
    }

    validateWithdrawalData(data) {
        if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
            throw new Error('Valor do saque deve ser maior que zero');
        }

        if (!data.description || data.description.trim().length < 3) {
            throw new Error('Descrição é obrigatória (mínimo 3 caracteres)');
        }

        if (!data.treasury_account_id) {
            throw new Error('Conta de tesouraria é obrigatória');
        }

        if (data.withdrawal_method) {
            const validMethods = ['transferencia', 'dinheiro', 'cheque'];
            if (!validMethods.includes(data.withdrawal_method)) {
                throw new Error('Método de saque inválido');
            }
        }

        if (data.status) {
            const validStatuses = ['pending', 'confirmed', 'cancelled', 'rejected'];
            if (!validStatuses.includes(data.status)) {
                throw new Error('Status inválido');
            }
        }
    }

    // ============ UTILITY METHODS ============

    formatCurrency(value) {
        if (!value && value !== 0) return 'AOA 0,00';
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA',
            minimumFractionDigits: 2
        }).format(value);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getAccountTypeLabel(type) {
        const labels = {
            cash: 'Dinheiro',
            bank: 'Conta Bancária',
            digital_wallet: 'Carteira Digital',
            investment: 'Investimentos',
            other: 'Outros'
        };
        return labels[type] || type;
    }

    getStatusLabel(status) {
        const labels = {
            pending: 'Pendente',
            confirmed: 'Confirmado',
            cancelled: 'Cancelado',
            rejected: 'Rejeitado'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status) {
        const severities = {
            pending: 'warning',
            confirmed: 'success',
            cancelled: 'secondary',
            rejected: 'danger'
        };
        return severities[status] || 'info';
    }

    getWithdrawalMethodLabel(method) {
        const labels = {
            transferencia: 'Transferência',
            dinheiro: 'Dinheiro',
            cheque: 'Cheque'
        };
        return labels[method] || method;
    }
}

export default new TreasuryService();