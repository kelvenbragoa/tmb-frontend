class TreasuryDemoService {
    constructor() {
        this.isDemo = true;
        this.delayMs = 500; // Simula delay da API
        
        // Dados demo das contas de tesouraria
        this.accounts = [
            {
                id: 1,
                name: 'Caixa Principal',
                account_type: 'cash',
                account_number: null,
                bank_name: null,
                bank_code: null,
                agency: null,
                current_balance: 150000.75,
                is_active: true,
                description: 'Caixa principal da empresa',
                currency_id: 1,
                metadata: {},
                created_at: '2024-01-15T08:00:00Z',
                updated_at: '2024-01-23T14:30:00Z'
            },
            {
                id: 2,
                name: 'Banco BAI - Conta Corrente',
                account_type: 'bank',
                account_number: '12345678901',
                bank_name: 'Banco BAI',
                bank_code: '005',
                agency: '1234',
                current_balance: 2450000,
                is_active: true,
                description: 'Conta corrente principal do BAI',
                currency_id: 1,
                metadata: { swift_code: 'BAIIAO22' },
                created_at: '2023-12-01T10:15:00Z',
                updated_at: '2024-01-23T16:45:00Z'
            },
            {
                id: 3,
                name: 'Carteira Multicaixa',
                account_type: 'digital_wallet',
                account_number: '927123456',
                bank_name: null,
                bank_code: null,
                agency: null,
                current_balance: 89500.25,
                is_active: true,
                description: 'Carteira digital Multicaixa Express',
                currency_id: 1,
                metadata: { wallet_type: 'multicaixa' },
                created_at: '2024-01-10T11:20:00Z',
                updated_at: '2024-01-23T12:10:00Z'
            },
            {
                id: 4,
                name: 'Investimentos BPC',
                account_type: 'investment',
                account_number: 'INV789456123',
                bank_name: 'Banco BPC',
                bank_code: '007',
                agency: '0001',
                current_balance: 500000,
                is_active: true,
                description: 'Conta de investimentos no BPC',
                currency_id: 1,
                metadata: { investment_type: 'fixed_deposit' },
                created_at: '2023-11-15T09:30:00Z',
                updated_at: '2024-01-20T15:20:00Z'
            },
            {
                id: 5,
                name: 'Caixa Auxiliar',
                account_type: 'cash',
                account_number: null,
                bank_name: null,
                bank_code: null,
                agency: null,
                current_balance: 25000,
                is_active: false,
                description: 'Caixa auxiliar (inativo)',
                currency_id: 1,
                metadata: {},
                created_at: '2023-10-01T14:00:00Z',
                updated_at: '2024-01-15T10:00:00Z'
            }
        ];

        // Dados demo dos depósitos
        this.deposits = [
            {
                id: 1,
                amount: 50000,
                description: 'Recebimento de cliente - Fatura #1001',
                treasury_account_id: 2,
                reference_number: 'DEP-2024-001',
                status: 'confirmed',
                transaction_date: '2024-01-23',
                source: 'Cliente ABC Lda',
                notes: 'Pagamento via transferência bancária',
                metadata: { invoice_id: 1001 },
                created_at: '2024-01-23T14:30:00Z',
                updated_at: '2024-01-23T14:30:00Z'
            },
            {
                id: 2,
                amount: 25000,
                description: 'Depósito de vendas do dia',
                treasury_account_id: 1,
                reference_number: 'DEP-2024-002',
                status: 'confirmed',
                transaction_date: '2024-01-23',
                source: 'Vendas balcão',
                notes: 'Dinheiro em espécie',
                metadata: {},
                created_at: '2024-01-23T18:00:00Z',
                updated_at: '2024-01-23T18:00:00Z'
            },
            {
                id: 3,
                amount: 75000,
                description: 'Transferência de investimentos',
                treasury_account_id: 4,
                reference_number: 'DEP-2024-003',
                status: 'pending',
                transaction_date: '2024-01-24',
                source: 'Resgate de aplicação',
                notes: 'Aguardando processamento bancário',
                metadata: { investment_id: 'INV-789' },
                created_at: '2024-01-24T09:15:00Z',
                updated_at: '2024-01-24T09:15:00Z'
            },
            {
                id: 4,
                amount: 15500.5,
                description: 'Pagamento via Multicaixa',
                treasury_account_id: 3,
                reference_number: 'DEP-2024-004',
                status: 'confirmed',
                transaction_date: '2024-01-22',
                source: 'Cliente XYZ',
                notes: 'Pagamento digital',
                metadata: { transaction_id: 'MCX-789456' },
                created_at: '2024-01-22T16:45:00Z',
                updated_at: '2024-01-22T16:45:00Z'
            }
        ];

        // Dados demo dos saques
        this.withdrawals = [
            {
                id: 1,
                amount: 20000,
                description: 'Pagamento a fornecedor - ABC Suprimentos',
                treasury_account_id: 2,
                reference_number: 'SAQ-2024-001',
                status: 'confirmed',
                transaction_date: '2024-01-23',
                destination: 'ABC Suprimentos Lda',
                withdrawal_method: 'transferencia',
                notes: 'Pagamento de fatura #5678',
                metadata: { supplier_invoice: 5678 },
                created_at: '2024-01-23T10:30:00Z',
                updated_at: '2024-01-23T10:30:00Z'
            },
            {
                id: 2,
                amount: 5000,
                description: 'Despesas operacionais',
                treasury_account_id: 1,
                reference_number: 'SAQ-2024-002',
                status: 'confirmed',
                transaction_date: '2024-01-23',
                destination: 'Caixa operacional',
                withdrawal_method: 'dinheiro',
                notes: 'Combustível e manutenção',
                metadata: {},
                created_at: '2024-01-23T15:20:00Z',
                updated_at: '2024-01-23T15:20:00Z'
            },
            {
                id: 3,
                amount: 30000,
                description: 'Pagamento de salários',
                treasury_account_id: 2,
                reference_number: 'SAQ-2024-003',
                status: 'pending',
                transaction_date: '2024-01-24',
                destination: 'Folha de pagamento',
                withdrawal_method: 'transferencia',
                notes: 'Salários de Janeiro/2024',
                metadata: { payroll_period: '2024-01' },
                created_at: '2024-01-24T08:45:00Z',
                updated_at: '2024-01-24T08:45:00Z'
            }
        ];

        this.nextAccountId = 6;
        this.nextDepositId = 5;
        this.nextWithdrawalId = 4;
    }

    // Simula delay da API
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms || this.delayMs));
    }

    // ============ TREASURY ACCOUNTS ============

    async createAccount(accountData) {
        await this.delay();
        
        const newAccount = {
            id: this.nextAccountId++,
            ...accountData,
            current_balance: parseFloat(accountData.current_balance || 0),
            is_active: accountData.is_active !== false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        this.accounts.push(newAccount);
        
        return {
            success: true,
            data: newAccount,
            message: 'Conta de tesouraria criada com sucesso'
        };
    }

    async getAccounts(filters = {}) {
        await this.delay();
        
        let filteredAccounts = [...this.accounts];
        
        if (filters.is_active !== undefined) {
            filteredAccounts = filteredAccounts.filter((acc) => acc.is_active === filters.is_active);
        }
        
        return {
            success: true,
            data: filteredAccounts,
            meta: {
                total: filteredAccounts.length,
                total_balance: filteredAccounts.reduce((sum, acc) => sum + acc.current_balance, 0)
            }
        };
    }

    async getActiveAccounts() {
        await this.delay();
        
        const activeAccounts = this.accounts
            .filter((acc) => acc.is_active)
            .map((acc) => ({
                id: acc.id,
                name: acc.name,
                account_type: acc.account_type,
                current_balance: acc.current_balance
            }));
        
        return {
            success: true,
            data: activeAccounts
        };
    }

    async getAccountsSummary() {
        await this.delay();
        
        const activeAccounts = this.accounts.filter((acc) => acc.is_active);
        const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.current_balance, 0);
        
        const accountsByType = activeAccounts.reduce((acc, account) => {
            acc[account.account_type] = (acc[account.account_type] || 0) + account.current_balance;
            return acc;
        }, {});
        
        return {
            success: true,
            data: {
                total_accounts: activeAccounts.length,
                total_balance: totalBalance,
                accounts_by_type: accountsByType,
                largest_balance: Math.max(...activeAccounts.map((acc) => acc.current_balance)),
                average_balance: totalBalance / activeAccounts.length
            }
        };
    }

    async getAccount(id) {
        await this.delay();
        
        const account = this.accounts.find((acc) => acc.id === parseInt(id));
        if (!account) {
            throw new Error('Conta não encontrada');
        }
        
        return {
            success: true,
            data: account
        };
    }

    async getAccountBalance(id) {
        await this.delay();
        
        const account = this.accounts.find((acc) => acc.id === parseInt(id));
        if (!account) {
            throw new Error('Conta não encontrada');
        }
        
        return {
            success: true,
            data: {
                account_id: account.id,
                current_balance: account.current_balance,
                last_updated: account.updated_at
            }
        };
    }

    async updateAccount(id, updateData) {
        await this.delay();
        
        const accountIndex = this.accounts.findIndex((acc) => acc.id === parseInt(id));
        if (accountIndex === -1) {
            throw new Error('Conta não encontrada');
        }
        
        this.accounts[accountIndex] = {
            ...this.accounts[accountIndex],
            ...updateData,
            updated_at: new Date().toISOString()
        };
        
        return {
            success: true,
            data: this.accounts[accountIndex],
            message: 'Conta atualizada com sucesso'
        };
    }

    async deleteAccount(id) {
        await this.delay();
        
        const accountIndex = this.accounts.findIndex((acc) => acc.id === parseInt(id));
        if (accountIndex === -1) {
            throw new Error('Conta não encontrada');
        }
        
        this.accounts.splice(accountIndex, 1);
        
        return {
            success: true,
            message: 'Conta deletada com sucesso'
        };
    }

    // ============ DEPOSITS ============

    async createDeposit(depositData) {
        await this.delay();
        
        const newDeposit = {
            id: this.nextDepositId++,
            ...depositData,
            amount: parseFloat(depositData.amount),
            transaction_date: depositData.transaction_date || new Date().toISOString().split('T')[0],
            status: depositData.status || 'confirmed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Atualizar saldo da conta se confirmado
        if (newDeposit.status === 'confirmed') {
            const accountIndex = this.accounts.findIndex((acc) => acc.id === newDeposit.treasury_account_id);
            if (accountIndex !== -1) {
                this.accounts[accountIndex].current_balance += newDeposit.amount;
                this.accounts[accountIndex].updated_at = new Date().toISOString();
            }
        }
        
        this.deposits.push(newDeposit);
        
        return {
            success: true,
            data: newDeposit,
            message: 'Depósito registrado com sucesso'
        };
    }

    async getDeposits(filters = {}) {
        await this.delay();
        
        let filteredDeposits = [...this.deposits];
        
        if (filters.treasury_account_id) {
            filteredDeposits = filteredDeposits.filter((dep) => 
                dep.treasury_account_id === parseInt(filters.treasury_account_id)
            );
        }
        
        if (filters.status) {
            filteredDeposits = filteredDeposits.filter((dep) => dep.status === filters.status);
        }
        
        if (filters.date_from) {
            filteredDeposits = filteredDeposits.filter((dep) => 
                dep.transaction_date >= filters.date_from
            );
        }
        
        if (filters.date_to) {
            filteredDeposits = filteredDeposits.filter((dep) => 
                dep.transaction_date <= filters.date_to
            );
        }
        
        return {
            success: true,
            data: filteredDeposits,
            meta: {
                total: filteredDeposits.length,
                total_amount: filteredDeposits.reduce((sum, dep) => sum + dep.amount, 0)
            }
        };
    }

    async getDepositsSummary(filters = {}) {
        await this.delay();
        
        let deposits = [...this.deposits];
        
        if (filters.date_from) {
            deposits = deposits.filter((dep) => dep.transaction_date >= filters.date_from);
        }
        
        if (filters.date_to) {
            deposits = deposits.filter((dep) => dep.transaction_date <= filters.date_to);
        }
        
        const totalAmount = deposits.reduce((sum, dep) => sum + dep.amount, 0);
        const confirmedDeposits = deposits.filter((dep) => dep.status === 'confirmed');
        const pendingDeposits = deposits.filter((dep) => dep.status === 'pending');
        
        return {
            success: true,
            data: {
                total_deposits: deposits.length,
                total_amount: totalAmount,
                confirmed_amount: confirmedDeposits.reduce((sum, dep) => sum + dep.amount, 0),
                pending_amount: pendingDeposits.reduce((sum, dep) => sum + dep.amount, 0),
                average_deposit: deposits.length > 0 ? totalAmount / deposits.length : 0
            }
        };
    }

    async getDeposit(id) {
        await this.delay();
        
        const deposit = this.deposits.find((dep) => dep.id === parseInt(id));
        if (!deposit) {
            throw new Error('Depósito não encontrado');
        }
        
        return {
            success: true,
            data: deposit
        };
    }

    async updateDeposit(id, updateData) {
        await this.delay();
        
        const depositIndex = this.deposits.findIndex((dep) => dep.id === parseInt(id));
        if (depositIndex === -1) {
            throw new Error('Depósito não encontrado');
        }
        
        this.deposits[depositIndex] = {
            ...this.deposits[depositIndex],
            ...updateData,
            updated_at: new Date().toISOString()
        };
        
        return {
            success: true,
            data: this.deposits[depositIndex],
            message: 'Depósito atualizado com sucesso'
        };
    }

    async confirmDeposit(id) {
        await this.delay();
        
        const depositIndex = this.deposits.findIndex((dep) => dep.id === parseInt(id));
        if (depositIndex === -1) {
            throw new Error('Depósito não encontrado');
        }
        
        const deposit = this.deposits[depositIndex];
        
        // Atualizar status e saldo da conta
        deposit.status = 'confirmed';
        deposit.updated_at = new Date().toISOString();
        
        const accountIndex = this.accounts.findIndex((acc) => acc.id === deposit.treasury_account_id);
        if (accountIndex !== -1) {
            this.accounts[accountIndex].current_balance += deposit.amount;
            this.accounts[accountIndex].updated_at = new Date().toISOString();
        }
        
        return {
            success: true,
            data: deposit,
            message: 'Depósito confirmado com sucesso'
        };
    }

    async cancelDeposit(id) {
        await this.delay();
        
        const depositIndex = this.deposits.findIndex((dep) => dep.id === parseInt(id));
        if (depositIndex === -1) {
            throw new Error('Depósito não encontrado');
        }
        
        this.deposits[depositIndex].status = 'cancelled';
        this.deposits[depositIndex].updated_at = new Date().toISOString();
        
        return {
            success: true,
            data: this.deposits[depositIndex],
            message: 'Depósito cancelado com sucesso'
        };
    }

    async deleteDeposit(id) {
        await this.delay();
        
        const depositIndex = this.deposits.findIndex((dep) => dep.id === parseInt(id));
        if (depositIndex === -1) {
            throw new Error('Depósito não encontrado');
        }
        
        this.deposits.splice(depositIndex, 1);
        
        return {
            success: true,
            message: 'Depósito deletado com sucesso'
        };
    }

    // ============ WITHDRAWALS ============

    async createWithdrawal(withdrawalData) {
        await this.delay();
        
        const newWithdrawal = {
            id: this.nextWithdrawalId++,
            ...withdrawalData,
            amount: parseFloat(withdrawalData.amount),
            transaction_date: withdrawalData.transaction_date || new Date().toISOString().split('T')[0],
            status: withdrawalData.status || 'confirmed',
            withdrawal_method: withdrawalData.withdrawal_method || 'transferencia',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Atualizar saldo da conta se confirmado
        if (newWithdrawal.status === 'confirmed') {
            const accountIndex = this.accounts.findIndex((acc) => acc.id === newWithdrawal.treasury_account_id);
            if (accountIndex !== -1) {
                this.accounts[accountIndex].current_balance -= newWithdrawal.amount;
                this.accounts[accountIndex].updated_at = new Date().toISOString();
            }
        }
        
        this.withdrawals.push(newWithdrawal);
        
        return {
            success: true,
            data: newWithdrawal,
            message: 'Saque registrado com sucesso'
        };
    }

    async getWithdrawals(filters = {}) {
        await this.delay();
        
        let filteredWithdrawals = [...this.withdrawals];
        
        if (filters.treasury_account_id) {
            filteredWithdrawals = filteredWithdrawals.filter((wit) => 
                wit.treasury_account_id === parseInt(filters.treasury_account_id)
            );
        }
        
        if (filters.status) {
            filteredWithdrawals = filteredWithdrawals.filter((wit) => wit.status === filters.status);
        }
        
        if (filters.date_from) {
            filteredWithdrawals = filteredWithdrawals.filter((wit) => 
                wit.transaction_date >= filters.date_from
            );
        }
        
        if (filters.date_to) {
            filteredWithdrawals = filteredWithdrawals.filter((wit) => 
                wit.transaction_date <= filters.date_to
            );
        }
        
        return {
            success: true,
            data: filteredWithdrawals,
            meta: {
                total: filteredWithdrawals.length,
                total_amount: filteredWithdrawals.reduce((sum, wit) => sum + wit.amount, 0)
            }
        };
    }

    async getWithdrawal(id) {
        await this.delay();
        
        const withdrawal = this.withdrawals.find((wit) => wit.id === parseInt(id));
        if (!withdrawal) {
            throw new Error('Saque não encontrado');
        }
        
        return {
            success: true,
            data: withdrawal
        };
    }

    async updateWithdrawal(id, updateData) {
        await this.delay();
        
        const withdrawalIndex = this.withdrawals.findIndex((wit) => wit.id === parseInt(id));
        if (withdrawalIndex === -1) {
            throw new Error('Saque não encontrado');
        }
        
        this.withdrawals[withdrawalIndex] = {
            ...this.withdrawals[withdrawalIndex],
            ...updateData,
            updated_at: new Date().toISOString()
        };
        
        return {
            success: true,
            data: this.withdrawals[withdrawalIndex],
            message: 'Saque atualizado com sucesso'
        };
    }

    async deleteWithdrawal(id) {
        await this.delay();
        
        const withdrawalIndex = this.withdrawals.findIndex((wit) => wit.id === parseInt(id));
        if (withdrawalIndex === -1) {
            throw new Error('Saque não encontrado');
        }
        
        this.withdrawals.splice(withdrawalIndex, 1);
        
        return {
            success: true,
            message: 'Saque deletado com sucesso'
        };
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

export default new TreasuryDemoService();