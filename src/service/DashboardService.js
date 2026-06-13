import { baseURL } from './APIConstant';
import axios from 'axios';

class DashboardService {
    // Configurar headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    }

    // Dashboard completo
    async getDashboard(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard`, {
                headers: this.getAuthHeaders(),
                params: {
                    period: params.period || 'last_30_days',
                    start_date: params.start_date,
                    end_date: params.end_date,
                    route_ids: params.route_ids?.join(','),
                    vehicle_ids: params.vehicle_ids?.join(','),
                    operator_ids: params.operator_ids?.join(','),
                    ticket_type_ids: params.ticket_type_ids?.join(',')
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Visão geral (Overview)
    async getOverview(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/overview`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Gráfico de vendas
    async getSalesChart(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/sales-chart`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Performance das rotas
    async getRoutePerformance(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/route-performance`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Performance dos operadores
    async getOperatorPerformance(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/operator-performance`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Performance dos veículos
    async getVehiclePerformance(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/vehicle-performance`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Análise de tipos de ticket
    async getTicketAnalysis(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/ticket-analysis`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Análise de sessões
    async getSessionAnalysis(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/session-analysis`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Análise de receita (apenas admin)
    async getRevenueAnalysis(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/dashboard/revenue-analysis`, {
                headers: this.getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Opções de período predefinido
    getPeriodOptions() {
        return [
            { label: 'Hoje', value: 'today' },
            { label: 'Ontem', value: 'yesterday' },
            { label: 'Últimos 7 dias', value: 'last_7_days' },
            { label: 'Últimos 30 dias', value: 'last_30_days' },
            { label: 'Últimos 90 dias', value: 'last_90_days' },
            { label: 'Últimos 180 dias', value: 'last_180_days' },
            { label: 'Este mês', value: 'this_month' },
            { label: 'Mês passado', value: 'last_month' },
            { label: 'Este ano', value: 'this_year' },
            { label: 'Período personalizado', value: 'custom' }
        ];
    }

    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value || 0);
    }

    // Formatar porcentagem
    formatPercentage(value) {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format((value || 0) / 100);
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
                    throw new Error(data.message || 'Parâmetros inválidos');
                case 401:
                    throw new Error('Token de autenticação inválido ou expirado');
                case 403:
                    throw new Error('Você não tem permissão para acessar estes dados');
                case 404:
                    throw new Error('Dados não encontrados');
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

export default new DashboardService();