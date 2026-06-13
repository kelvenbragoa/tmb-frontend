import { baseURL } from './APIConstant';

class PaymentService {
    constructor() {
        this.baseURL = baseURL;
        this.endpoints = {
            payments: '/payments'
        };
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    }

    // Criar novo pagamento
    async createPayment(paymentData) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.payments}`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar pagamento');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            throw error;
        }
    }

    // Listar pagamentos com filtros e paginação
    async getPayments(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Parâmetros de paginação
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            // Filtros específicos
            if (params.type) queryParams.append('type', params.type);
            if (params.status) queryParams.append('status', params.status);
            if (params.costumer_id) queryParams.append('costumer_id', params.costumer_id);
            if (params.supplier_id) queryParams.append('supplier_id', params.supplier_id);
            if (params.search) queryParams.append('search', params.search);
            if (params.payment_method) queryParams.append('payment_method', params.payment_method);
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);

            const response = await fetch(`${this.baseURL}${this.endpoints.payments}?${queryParams.toString()}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao buscar pagamentos');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar pagamentos:', error);
            throw error;
        }
    }

    // Buscar pagamento específico
    async getPaymentById(id) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.payments}/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao buscar pagamento');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar pagamento:', error);
            throw error;
        }
    }

    // Atualizar pagamento
    async updatePayment(id, paymentData) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.payments}/${id}`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar pagamento');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar pagamento:', error);
            throw error;
        }
    }

    // Deletar pagamento
    async deletePayment(id) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.payments}/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao deletar pagamento');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao deletar pagamento:', error);
            throw error;
        }
    }

    // Atualizar apenas o status do pagamento
    async updatePaymentStatus(id, status) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.payments}/${id}/status`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar status do pagamento');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar status do pagamento:', error);
            throw error;
        }
    }

    // Métodos auxiliares para dados do sistema

    // Obter tipos de pagamento
    getPaymentTypes() {
        return [
            { label: 'Pagamento Recebido', value: 'received' },
            { label: 'Pagamento Feito', value: 'made' }
        ];
    }

    // Obter status de pagamento
    getPaymentStatuses() {
        return [
            { label: 'Pendente', value: 'pending' },
            { label: 'Concluído', value: 'completed' },
            { label: 'Cancelado', value: 'cancelled' },
            { label: 'Falhado', value: 'failed' }
        ];
    }

    // Obter métodos de pagamento
    getPaymentMethods() {
        return [
            { label: 'Dinheiro', value: 'cash' },
            { label: 'Transferência Bancária', value: 'bank_transfer' },
            { label: 'Cartão de Crédito', value: 'credit_card' },
            { label: 'Cartão de Débito', value: 'debit_card' },
            { label: 'Cheque', value: 'check' },
            { label: 'Carteira Móvel', value: 'mobile_money' },
            { label: 'Outro', value: 'other' }
        ];
    }

    // Formatação e utilitários

    // Formatar número do pagamento para exibição
    formatPaymentNumber(paymentNumber) {
        return paymentNumber || 'N/A';
    }

    // Obter label do tipo de pagamento
    getPaymentTypeLabel(type) {
        const types = this.getPaymentTypes();
        const foundType = types.find((t) => t.value === type);
        return foundType ? foundType.label : type;
    }

    // Obter label do status
    getPaymentStatusLabel(status) {
        const statuses = this.getPaymentStatuses();
        const foundStatus = statuses.find((s) => s.value === status);
        return foundStatus ? foundStatus.label : status;
    }

    // Obter label do método de pagamento
    getPaymentMethodLabel(method) {
        const methods = this.getPaymentMethods();
        const foundMethod = methods.find((m) => m.value === method);
        return foundMethod ? foundMethod.label : method;
    }

    // Obter cor do status para exibição
    getStatusSeverity(status) {
        const severityMap = {
            pending: 'warning',
            completed: 'success',
            cancelled: 'secondary',
            failed: 'danger'
        };
        return severityMap[status] || 'secondary';
    }

    // Verificar se pagamento pode ser editado
    canEdit(payment) {
        return payment.status === 'pending';
    }

    // Verificar se pagamento pode ser cancelado
    canCancel(payment) {
        return payment.status === 'pending' || payment.status === 'completed';
    }

    // Métodos específicos para integração com faturas

    // Buscar pagamentos de uma fatura específica
    async getPaymentsByInvoice(invoiceId) {
        return this.getPayments({
            type: 'received',
            invoice_id: invoiceId
        });
    }

    // Buscar pagamentos de um cliente específico
    async getPaymentsByCustomer(customerId) {
        return this.getPayments({
            type: 'received',
            costumer_id: customerId
        });
    }

    // Buscar pagamentos de um fornecedor específico
    async getPaymentsBySupplier(supplierId) {
        return this.getPayments({
            type: 'made',
            supplier_id: supplierId
        });
    }

    // Criar pagamento para fatura
    async createInvoicePayment(invoiceId, customerId, paymentData) {
        return this.createPayment({
            type: 'received',
            invoice_id: invoiceId,
            costumer_id: customerId,
            ...paymentData
        });
    }

    // Criar pagamento para fornecedor
    async createSupplierPayment(supplierId, paymentData) {
        return this.createPayment({
            type: 'made',
            supplier_id: supplierId,
            ...paymentData
        });
    }
}

export default new PaymentService();