import { baseURL } from './APIConstant';
import axios from 'axios';

class PurchaseInvoiceService {
    // Configurar headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    }

    // Criar nova fatura de compra
    async createPurchaseInvoice(invoiceData) {
        try {
            const response = await axios.post(
                `${baseURL}/purchase-invoices`,
                invoiceData,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Listar faturas de compra com filtros e paginação
    async getAllPurchaseInvoices(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await axios.get(
                `${baseURL}/purchase-invoices?${queryParams}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Buscar fatura por ID
    async getPurchaseInvoiceById(id) {
        try {
            const response = await axios.get(
                `${baseURL}/purchase-invoices/${id}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Atualizar fatura
    async updatePurchaseInvoice(id, invoiceData) {
        try {
            const response = await axios.patch(
                `${baseURL}/purchase-invoices/${id}`,
                invoiceData,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Deletar fatura
    async deletePurchaseInvoice(id) {
        try {
            const response = await axios.delete(
                `${baseURL}/purchase-invoices/${id}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Atualizar status da fatura
    async updatePurchaseInvoiceStatus(id, status) {
        try {
            const response = await axios.patch(
                `${baseURL}/purchase-invoices/${id}/status`,
                { status },
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Registrar pagamento
    async recordPayment(id, paymentData) {
        try {
            const response = await axios.post(
                `${baseURL}/purchase-invoices/${id}/payment`,
                paymentData,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Converter Purchase Order em Purchase Invoice
    async convertFromPurchaseOrder(poId, conversionData) {
        try {
            const response = await axios.post(
                `${baseURL}/purchase-invoices/convert-from-po/${poId}`,
                conversionData,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Gerar PDF da fatura
    async generatePdf(id) {
        try {
            const response = await axios.get(
                `${baseURL}/purchase-invoices/${id}/pdf`,
                {
                    headers: this.getAuthHeaders(),
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Utilitários para status
    getPurchaseInvoiceStatuses() {
        return [
            { label: 'Rascunho', value: 'draft' },
            { label: 'Recebida', value: 'received' },
            { label: 'Paga', value: 'paid' },
            { label: 'Parcialmente Paga', value: 'partially_paid' },
            { label: 'Vencida', value: 'overdue' },
            { label: 'Cancelada', value: 'cancelled' }
        ];
    }

    getPurchaseInvoiceStatusLabel(status) {
        const statusMap = {
            'draft': 'Rascunho',
            'received': 'Recebida',
            'paid': 'Paga',
            'partially_paid': 'Parcialmente Paga',
            'overdue': 'Vencida',
            'cancelled': 'Cancelada'
        };
        return statusMap[status] || status;
    }

    getStatusSeverity(status) {
        const severityMap = {
            'draft': 'info',
            'received': 'warning',
            'paid': 'success',
            'partially_paid': 'info',
            'overdue': 'danger',
            'cancelled': 'secondary'
        };
        return severityMap[status] || 'info';
    }

    // Métodos de pagamento
    getPaymentMethods() {
        return [
            { label: 'Dinheiro', value: 'cash' },
            { label: 'Transferência Bancária', value: 'bank_transfer' },
            { label: 'Cheque', value: 'check' },
            { label: 'Cartão de Crédito', value: 'credit_card' },
            { label: 'Cartão de Débito', value: 'debit_card' },
            { label: 'PIX', value: 'pix' },
            { label: 'Outro', value: 'other' }
        ];
    }

    getPaymentMethodLabel(method) {
        const methodMap = {
            'cash': 'Dinheiro',
            'bank_transfer': 'Transferência Bancária',
            'check': 'Cheque',
            'credit_card': 'Cartão de Crédito',
            'debit_card': 'Cartão de Débito',
            'pix': 'PIX',
            'other': 'Outro'
        };
        return methodMap[method] || method;
    }

    // Condições de pagamento
    getPaymentTerms() {
        return [
            { label: 'À Vista', value: 'immediate' },
            { label: '15 dias', value: 'net_15' },
            { label: '30 dias', value: 'net_30' },
            { label: '45 dias', value: 'net_45' },
            { label: '60 dias', value: 'net_60' },
            { label: '90 dias', value: 'net_90' },
            { label: 'Personalizado', value: 'custom' }
        ];
    }

    getPaymentTermLabel(term) {
        const termMap = {
            'immediate': 'À Vista',
            'net_15': '15 dias',
            'net_30': '30 dias',
            'net_45': '45 dias',
            'net_60': '60 dias',
            'net_90': '90 dias',
            'custom': 'Personalizado'
        };
        return termMap[term] || term;
    }

    // Validações de regras de negócio
    canEditInvoice(status) {
        return ['draft', 'received'].includes(status);
    }

    canDeleteInvoice(status) {
        return ['draft'].includes(status);
    }

    canRecordPayment(status) {
        return ['received', 'partially_paid', 'overdue'].includes(status);
    }

    // Cálculos
    calculateLineTotal(quantity, unitPrice, discountPercentage = 0, discountAmount = 0) {
        const lineSubtotal = quantity * unitPrice;
        const discountValue = discountAmount > 0 ? discountAmount : (lineSubtotal * discountPercentage / 100);
        return lineSubtotal - discountValue;
    }

    calculateLineTax(lineTotal, taxRate) {
        return lineTotal * (taxRate / 100);
    }

    calculateInvoiceTotals(items, shippingCost = 0, globalDiscountAmount = 0, globalDiscountPercentage = 0) {
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const lineTotal = this.calculateLineTotal(
                item.quantity,
                item.unit_price,
                item.discount_percentage || 0,
                item.discount_amount || 0
            );
            const lineTax = this.calculateLineTax(lineTotal, item.tax_rate || 0);
            
            subtotal += lineTotal;
            totalTax += lineTax;
        });

        // Aplicar desconto global
        const globalDiscount = globalDiscountAmount > 0 
            ? globalDiscountAmount 
            : (subtotal * globalDiscountPercentage / 100);

        const finalSubtotal = subtotal - globalDiscount;
        const total = finalSubtotal + totalTax + shippingCost;

        return {
            subtotal: finalSubtotal,
            taxAmount: totalTax,
            shippingCost,
            discountAmount: globalDiscount,
            total
        };
    }

    // Tratamento de erros
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    throw new Error(data.message || 'Dados inválidos fornecidos');
                case 401:
                    throw new Error('Token de autenticação inválido ou expirado');
                case 403:
                    throw new Error('Acesso negado para esta operação');
                case 404:
                    throw new Error('Fatura de compra não encontrada');
                case 409:
                    throw new Error(data.message || 'Conflito na operação');
                case 422:
                    throw new Error('Dados de validação falharam');
                case 500:
                    throw new Error('Erro interno do servidor');
                default:
                    throw new Error(data.message || 'Erro inesperado na API');
            }
        } else if (error.request) {
            throw new Error('Não foi possível conectar ao servidor');
        } else {
            throw new Error('Erro na configuração da requisição');
        }
    }
}

export default new PurchaseInvoiceService();