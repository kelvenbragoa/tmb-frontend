import axios from 'axios';
import { baseURL } from './APIConstant';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

class InternalRequestService {
    constructor() {
        this.baseURL = baseURL;
        
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
            const authHeaders = getAuthHeaders();
            config.headers = { ...config.headers, ...authHeaders };
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
            console.error('Internal Request API Error:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url
            });
        } else {
            console.error('Internal Request Network Error:', error.message);
        }
    }

    // ============ CRUD OPERATIONS ============

    // 1. Criar Nova Requisição Interna
    async createInternalRequest(requestData) {
        this.validateRequestData(requestData);
        
        const payload = {
            title: requestData.title,
            description: requestData.description || '',
            priority: requestData.priority || 'normal',
            request_date: requestData.request_date,
            required_date: requestData.required_date,
            tax_rate: parseFloat(requestData.tax_rate || 0),
            discount_rate: parseFloat(requestData.discount_rate || 0),
            notes: requestData.notes || '',
            items: requestData.items?.map(item => ({
                product_id: item.product_id || null,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                discount_rate: parseFloat(item.discount_rate || 0),
                justification: item.justification || ''
            })) || []
        };

        const response = await this.client.post('/internal-requests', payload);
        return response.data;
    }

    // 2. Listar Requisições Internas
    async getInternalRequests(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.search) params.append('search', filters.search);
        if (filters.requested_by) params.append('requested_by', filters.requested_by);

        const response = await this.client.get(`/internal-requests${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    }

    // 3. Buscar Requisição por ID
    async getInternalRequest(id) {
        const response = await this.client.get(`/internal-requests/${id}`);
        return response.data;
    }

    // 4. Atualizar Requisição
    async updateInternalRequest(id, updateData) {
        const payload = {
            ...updateData,
            items: updateData.items?.map(item => ({
                product_id: item.product_id || null,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                discount_rate: parseFloat(item.discount_rate || 0),
                justification: item.justification || ''
            }))
        };

        const response = await this.client.patch(`/internal-requests/${id}`, payload);
        return response.data;
    }

    // 5. Aprovar Requisição
    async approveInternalRequest(id, notes = '') {
        const response = await this.client.patch(`/internal-requests/${id}/approve`, { notes });
        return response.data;
    }

    // 6. Rejeitar Requisição
    async rejectInternalRequest(id, rejectionReason, notes = '') {
        const response = await this.client.patch(`/internal-requests/${id}/reject`, {
            rejection_reason: rejectionReason,
            notes
        });
        return response.data;
    }

    // 7. Atualizar Status da Requisição
    async updateStatus(id, status, notes = '') {
        const response = await this.client.patch(`/internal-requests/${id}/status`, {
            status,
            notes
        });
        return response.data;
    }

    // 8. Duplicar Requisição
    async duplicateInternalRequest(id) {
        const response = await this.client.post(`/internal-requests/${id}/duplicate`);
        return response.data;
    }

    // 9. Excluir Requisição
    async deleteInternalRequest(id) {
        await this.client.delete(`/internal-requests/${id}`);
        return true;
    }

    // 10. Resumo de Requisições
    async getInternalRequestsSummary() {
        const response = await this.client.get('/internal-requests/summary');
        return response.data;
    }

    // 11. Gerar PDF
    async generatePdf(id) {
        try {
            const response = await this.client.get(`/internal-requests/${id}/pdf`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.warn('PDF não disponível via API, usando fallback HTML');
            throw new Error('PDF generation not available');
        }
    }

    // ============ VALIDATIONS ============

    validateRequestData(data) {
        if (!data.title || data.title.trim().length < 2) {
            throw new Error('Título é obrigatório (mínimo 2 caracteres)');
        }

        if (!data.request_date) {
            throw new Error('Data da requisição é obrigatória');
        }

        if (!data.items || data.items.length === 0) {
            throw new Error('Pelo menos um item é obrigatório');
        }

        data.items.forEach((item, index) => {
            if (!item.description || item.description.trim().length < 2) {
                throw new Error(`Descrição do item ${index + 1} é obrigatória`);
            }

            if (!item.quantity || parseFloat(item.quantity) <= 0) {
                throw new Error(`Quantidade do item ${index + 1} deve ser maior que zero`);
            }

            if (!item.unit_price || parseFloat(item.unit_price) < 0) {
                throw new Error(`Preço unitário do item ${index + 1} deve ser maior ou igual a zero`);
            }
        });
    }

    // ============ UTILITY METHODS ============

    getStatusLabel(status) {
        const labels = {
            pending: 'Pendente',
            approved: 'Aprovado',
            rejected: 'Rejeitado',
            completed: 'Concluído',
            cancelled: 'Cancelado'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status) {
        const severities = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            completed: 'info',
            cancelled: 'secondary'
        };
        return severities[status] || 'info';
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Baixa',
            normal: 'Normal',
            high: 'Alta',
            urgent: 'Urgente'
        };
        return labels[priority] || priority;
    }

    getPrioritySeverity(priority) {
        const severities = {
            low: 'success',
            normal: 'info',
            high: 'warning',
            urgent: 'danger'
        };
        return severities[priority] || 'info';
    }

    getStatusOptions() {
        return [
            { label: 'Pendente', value: 'pending' },
            { label: 'Aprovado', value: 'approved' },
            { label: 'Rejeitado', value: 'rejected' },
            { label: 'Concluído', value: 'completed' },
            { label: 'Cancelado', value: 'cancelled' }
        ];
    }

    getPriorityOptions() {
        return [
            { label: 'Baixa', value: 'low' },
            { label: 'Normal', value: 'normal' },
            { label: 'Alta', value: 'high' },
            { label: 'Urgente', value: 'urgent' }
        ];
    }

    calculateLineTotal(quantity, unitPrice, discountRate = 0) {
        const subtotal = quantity * unitPrice;
        const discountAmount = subtotal * (discountRate / 100);
        return subtotal - discountAmount;
    }

    calculateTotals(items, taxRate = 0, discountRate = 0) {
        const subtotal = items.reduce((sum, item) => {
            return sum + this.calculateLineTotal(item.quantity, item.unit_price, item.discount_rate);
        }, 0);

        const discountAmount = subtotal * (discountRate / 100);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (taxRate / 100);
        const total = taxableAmount + taxAmount;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 2
        }).format(value);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    canEdit(request, currentUser) {
        return request.status === 'pending' && 
               (request.created_by === currentUser.id || currentUser.role === 'admin');
    }

    canApprove(request, currentUser) {
        return request.status === 'pending' && 
               currentUser.permissions?.includes('approve_requests');
    }

    canDelete(request, currentUser) {
        return ['pending', 'rejected', 'cancelled'].includes(request.status) &&
               (request.created_by === currentUser.id || currentUser.role === 'admin');
    }
}

export default new InternalRequestService();