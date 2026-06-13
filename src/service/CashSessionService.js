import { baseURL } from './APIConstant';
import axios from 'axios';

class CashSessionService {
    // Configurar headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    }

    // 1. Abrir Sessão de Caixa
    async openSession(sessionData) {
        try {
            const response = await axios.post(`${baseURL}/cash-sessions/open`, sessionData, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 2. Fechar Sessão de Caixa
    async closeSession(sessionId, closingData) {
        try {
            const response = await axios.patch(`${baseURL}/cash-sessions/${sessionId}/close`, closingData, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 3. Listar Sessões de Caixa
    async getSessions(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.pointOfSaleId) params.append('point_of_sale_id', filters.pointOfSaleId);
            if (filters.userId) params.append('user_id', filters.userId);
            
            const response = await axios.get(`${baseURL}/cash-sessions?${params}`, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 4. Buscar Sessão Ativa
    async getActiveSession() {
        try {
            const response = await axios.get(`${baseURL}/cash-sessions/active`, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 5. Buscar Sessão Específica
    async getSession(sessionId) {
        try {
            const response = await axios.get(`${baseURL}/cash-sessions/${sessionId}`, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 6. Listar Movimentos de uma Sessão
    async getSessionMovements(sessionId, filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.type) params.append('type', filters.type);
            if (filters.category) params.append('category', filters.category);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            
            const response = await axios.get(`${baseURL}/cash-sessions/${sessionId}/movements?${params}`, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 7. Criar Movimento Manual
    async createMovement(sessionId, movementData) {
        try {
            const response = await axios.post(`${baseURL}/cash-sessions/${sessionId}/movements`, movementData, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 8. Gerar Relatório de Caixa
    async getSessionReport(sessionId) {
        try {
            const response = await axios.get(`${baseURL}/cash-sessions/${sessionId}/report`, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 9. Dashboard de Caixa
    async getDashboardSummary(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.period) params.append('period', filters.period);
            if (filters.pointOfSaleId) params.append('point_of_sale_id', filters.pointOfSaleId);
            
            const response = await axios.get(`${baseURL}/cash-sessions/dashboard/summary?${params}`, { 
                headers: this.getAuthHeaders() 
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Utilitários de Validação
    validateSessionData(sessionData) {
        const errors = [];
        
        if (!sessionData.opening_balance && sessionData.opening_balance !== 0) {
            errors.push('Saldo inicial é obrigatório');
        }
        
        if (sessionData.opening_balance < 0) {
            errors.push('Saldo inicial não pode ser negativo');
        }
        
        if (!sessionData.point_of_sale_id) {
            errors.push('Ponto de venda é obrigatório');
        }
        
        return errors;
    }

    validateClosingData(closingData) {
        const errors = [];
        
        if (!closingData.closing_balance && closingData.closing_balance !== 0) {
            errors.push('Saldo final é obrigatório');
        }
        
        if (closingData.closing_balance < 0) {
            errors.push('Saldo final não pode ser negativo');
        }
        
        return errors;
    }

    validateMovementData(movementData) {
        const errors = [];
        
        if (!movementData.type) {
            errors.push('Tipo de movimento é obrigatório');
        }
        
        if (!['entry', 'exit'].includes(movementData.type)) {
            errors.push('Tipo deve ser "entry" ou "exit"');
        }
        
        if (!movementData.category) {
            errors.push('Categoria é obrigatória');
        }
        
        if (!movementData.amount && movementData.amount !== 0) {
            errors.push('Valor é obrigatório');
        }
        
        if (movementData.amount <= 0) {
            errors.push('Valor deve ser maior que zero');
        }
        
        if (!movementData.description?.trim()) {
            errors.push('Descrição é obrigatória');
        }
        
        return errors;
    }

    // Formatação e Utilitários
    formatCurrency(amount) {
        if (amount == null) return 'MT 0,00';
        
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatSessionNumber(sessionNumber) {
        return sessionNumber || 'N/A';
    }

    formatDateTime(dateTime) {
        if (!dateTime) return 'N/A';
        
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(dateTime));
    }

    getStatusLabel(status) {
        const statusMap = {
            open: 'Aberto',
            closed: 'Fechado'
        };
        return statusMap[status] || status;
    }

    getStatusSeverity(status) {
        const severityMap = {
            open: 'success',
            closed: 'info'
        };
        return severityMap[status] || 'warning';
    }

    getTypeLabel(type) {
        const typeMap = {
            entry: 'Entrada',
            exit: 'Saída',
            opening: 'Abertura',
            closing: 'Fechamento'
        };
        return typeMap[type] || type;
    }

    getCategoryLabel(category) {
        const categoryMap = {
            sale: 'Venda',
            payment_received: 'Pagamento Recebido',
            payment_made: 'Pagamento Efetuado',
            cash_withdrawal: 'Sangria',
            cash_deposit: 'Suprimento',
            opening_balance: 'Saldo Inicial',
            closing_balance: 'Saldo Final',
            adjustment: 'Ajuste',
            other: 'Outros'
        };
        return categoryMap[category] || category;
    }

    getCategoryIcon(category) {
        const iconMap = {
            sale: 'pi-shopping-cart',
            payment_received: 'pi-arrow-down',
            payment_made: 'pi-arrow-up',
            cash_withdrawal: 'pi-minus-circle',
            cash_deposit: 'pi-plus-circle',
            opening_balance: 'pi-play',
            closing_balance: 'pi-stop',
            adjustment: 'pi-cog',
            other: 'pi-ellipsis-h'
        };
        return iconMap[category] || 'pi-info-circle';
    }

    calculateDifference(expected, actual) {
        if (expected == null || actual == null) return 0;
        return actual - expected;
    }

    getEntryCategories() {
        return [
            { value: 'sale', label: 'Venda' },
            { value: 'payment_received', label: 'Pagamento Recebido' },
            { value: 'cash_deposit', label: 'Suprimento de Caixa' },
            { value: 'adjustment', label: 'Ajuste Positivo' },
            { value: 'other', label: 'Outros' }
        ];
    }

    getExitCategories() {
        return [
            { value: 'payment_made', label: 'Pagamento Efetuado' },
            { value: 'cash_withdrawal', label: 'Sangria de Caixa' },
            { value: 'adjustment', label: 'Ajuste Negativo' },
            { value: 'other', label: 'Outros (ex: troco)' }
        ];
    }

    // Tratamento de erros
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    if (Array.isArray(data.message)) {
                        throw new Error(data.message.join(', '));
                    }
                    throw new Error(data.message || 'Dados inválidos fornecidos');
                case 401:
                    throw new Error('Token de autenticação inválido ou expirado');
                case 403:
                    throw new Error('Você não tem permissão para executar esta operação');
                case 404:
                    throw new Error('Recurso não encontrado');
                case 409:
                    throw new Error(data.message || 'Conflito: operação não permitida no estado atual');
                case 500:
                    throw new Error('Erro interno do servidor');
                default:
                    throw new Error(data.message || 'Erro desconhecido');
            }
        } else if (error.request) {
            throw new Error('Erro de conexão com o servidor');
        } else {
            throw new Error(error.message || 'Erro desconhecido');
        }
    }
}

export default new CashSessionService();