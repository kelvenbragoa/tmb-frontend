import axios from 'axios';
import { baseURL } from './APIConstant';

// Configurar headers padrão para autenticação
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

class PurchaseOrderService {
    // Listar todas as ordens de compra
    async getAllPurchaseOrders(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/purchase-orders`, {
                headers: getAuthHeaders(),
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10,
                    status: params.status || '',
                    supplier_id: params.supplier_id || '',
                    search: params.search || ''
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ordens de compra:', error);
            throw error;
        }
    }

    // Buscar ordem de compra por ID
    async getPurchaseOrderById(id) {
        try {
            const response = await axios.get(`${baseURL}/purchase-orders/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar ordem de compra ${id}:`, error);
            throw error;
        }
    }

    // Criar nova ordem de compra
    async createPurchaseOrder(orderData) {
        try {
            const response = await axios.post(`${baseURL}/purchase-orders`, orderData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar ordem de compra:', error);
            throw error;
        }
    }

    // Atualizar ordem de compra
    async updatePurchaseOrder(id, orderData) {
        try {
            const response = await axios.patch(`${baseURL}/purchase-orders/${id}`, orderData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar ordem de compra ${id}:`, error);
            throw error;
        }
    }

    // Deletar ordem de compra
    async deletePurchaseOrder(id) {
        try {
            const response = await axios.delete(`${baseURL}/purchase-orders/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar ordem de compra ${id}:`, error);
            throw error;
        }
    }

    // Atualizar status da ordem de compra
    async updatePurchaseOrderStatus(id, status) {
        try {
            const response = await axios.patch(`${baseURL}/purchase-orders/${id}/status`, 
                { status }, 
                {
                    headers: getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar status da ordem de compra ${id}:`, error);
            throw error;
        }
    }

    // Duplicar ordem de compra
    async duplicatePurchaseOrder(id) {
        try {
            const response = await axios.post(`${baseURL}/purchase-orders/${id}/duplicate`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao duplicar ordem de compra ${id}:`, error);
            throw error;
        }
    }

    // Gerar PDF da ordem de compra
    async generatePdf(id) {
        try {
            const response = await axios.get(`${baseURL}/purchase-orders/${id}/pdf`, {
                responseType: 'blob',
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao gerar PDF da ordem de compra ${id}:`, error);
            throw error;
        }
    }

    // Status disponíveis
    getPurchaseOrderStatuses() {
        return [
            { value: 'draft', label: 'Rascunho' },
            { value: 'sent', label: 'Enviada' },
            { value: 'confirmed', label: 'Confirmada' },
            { value: 'partially_received', label: 'Parcialmente Recebida' },
            { value: 'received', label: 'Recebida' },
            { value: 'cancelled', label: 'Cancelada' }
        ];
    }

    // Termos de entrega (Incoterms)
    getDeliveryTerms() {
        return [
            { value: 'exw', label: 'Na Origem (EXW)' },
            { value: 'fca', label: 'Transportador Livre (FCA)' },
            { value: 'fas', label: 'Livre ao Lado do Navio (FAS)' },
            { value: 'fob', label: 'Livre a Bordo (FOB)' },
            { value: 'cfr', label: 'Custo e Frete (CFR)' },
            { value: 'cif', label: 'Custo, Seguro e Frete (CIF)' },
            { value: 'cpt', label: 'Transporte Pago Até (CPT)' },
            { value: 'cip', label: 'Transporte e Seguro Pago Até (CIP)' },
            { value: 'dap', label: 'Entregue no Local (DAP)' },
            { value: 'dpu', label: 'Entregue no Local Descarregado (DPU)' },
            { value: 'ddp', label: 'Entregue com Direitos Pagos (DDP)' }
        ];
    }

    // Obter label do status
    getPurchaseOrderStatusLabel(status) {
        const statusObj = this.getPurchaseOrderStatuses().find((s) => s.value === status);
        return statusObj ? statusObj.label : status;
    }

    // Obter label do termo de entrega
    getDeliveryTermLabel(term) {
        const termObj = this.getDeliveryTerms().find((t) => t.value === term);
        return termObj ? termObj.label : term;
    }

    // Calcular totais de um item
    calculateItemTotal(quantity, unitPrice, discountRate = 0, discountAmount = 0) {
        const validQuantity = parseFloat(quantity) || 0;
        const validUnitPrice = parseFloat(unitPrice) || 0;
        const validDiscountRate = parseFloat(discountRate) || 0;
        const validDiscountAmount = parseFloat(discountAmount) || 0;
        
        const lineSubtotal = validQuantity * validUnitPrice;
        const calculatedDiscountAmount = validDiscountAmount > 0 
            ? validDiscountAmount 
            : (lineSubtotal * validDiscountRate) / 100;
        
        return lineSubtotal - calculatedDiscountAmount;
    }

    // Calcular totais da ordem
    calculateOrderTotals(items, taxRate = 0, discountRate = 0, discountAmount = 0, shippingCost = 0) {
        // Garantir que parâmetros sejam números válidos
        const validTaxRate = parseFloat(taxRate) || 0;
        const validDiscountRate = parseFloat(discountRate) || 0;
        const validDiscountAmount = parseFloat(discountAmount) || 0;
        const validShippingCost = parseFloat(shippingCost) || 0;
        
        // Calcular subtotal
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = this.calculateItemTotal(
                parseFloat(item.quantity) || 0,
                parseFloat(item.unit_price) || 0,
                parseFloat(item.discount_rate) || 0,
                parseFloat(item.discount_amount) || 0
            );
            return sum + itemTotal;
        }, 0);

        // Calcular desconto total
        const totalDiscountAmount = validDiscountAmount > 0 
            ? validDiscountAmount 
            : (subtotal * validDiscountRate) / 100;
        
        // Base para cálculo do imposto (subtotal - desconto)
        const taxBase = subtotal - totalDiscountAmount;
        
        // Calcular imposto
        const taxAmount = (taxBase * validTaxRate) / 100;
        
        // Total final
        const total = taxBase + taxAmount + validShippingCost;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
            taxBase: parseFloat(taxBase.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    }

    // Verificar se ordem pode ser editada
    canEditOrder(status) {
        return status !== 'received';
    }

    // Verificar se ordem pode ser excluída
    canDeleteOrder(status) {
        return status === 'draft';
    }

    // Obter severidade do status para exibição
    getStatusSeverity(status) {
        switch (status) {
            case 'draft':
                return 'secondary';
            case 'sent':
                return 'info';
            case 'confirmed':
                return 'success';
            case 'partially_received':
                return 'warn';
            case 'received':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'info';
        }
    }
}

export default new PurchaseOrderService();
