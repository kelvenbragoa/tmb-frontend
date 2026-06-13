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

class InvoiceService {
    // Listar todas as faturas com filtros
    async getAllInvoices(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/invoices`, {
                headers: getAuthHeaders(),
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10,
                    status: params.status || '',
                    costumer_id: params.costumer_id || '',
                    search: params.search || '',
                    overdue: params.overdue || false
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar faturas:', error);
            throw error;
        }
    }

    // Buscar fatura por ID
    async getInvoiceById(id) {
        try {
            const response = await axios.get(`${baseURL}/invoices/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar fatura ${id}:`, error);
            throw error;
        }
    }

    // Criar nova fatura
    async createInvoice(invoiceData) {
        try {
            const response = await axios.post(`${baseURL}/invoices`, invoiceData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar fatura:', error);
            throw error;
        }
    }

    // Atualizar fatura
    async updateInvoice(id, invoiceData) {
        try {
            const response = await axios.patch(`${baseURL}/invoices/${id}`, invoiceData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar fatura ${id}:`, error);
            throw error;
        }
    }

    // Atualizar status da fatura
    async updateInvoiceStatus(id, status) {
        try {
            const response = await axios.patch(`${baseURL}/invoices/${id}/status`, {
                status
            }, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar status da fatura ${id}:`, error);
            throw error;
        }
    }

    // Registrar pagamento
    async registerPayment(id, paymentData) {
        try {
            const response = await axios.post(`${baseURL}/invoices/${id}/payment`, paymentData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao registrar pagamento da fatura ${id}:`, error);
            throw error;
        }
    }

    // Marcar faturas vencidas
    async markOverdueInvoices() {
        try {
            const response = await axios.get(`${baseURL}/invoices/overdue/mark`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao marcar faturas vencidas:', error);
            throw error;
        }
    }

    // Gerar PDF da fatura
    async generatePdf(id) {
        try {
            const response = await axios.get(`${baseURL}/invoices/${id}/pdf`, {
                headers: getAuthHeaders(),
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao gerar PDF da fatura ${id}:`, error);
            throw error;
        }
    }

    // Duplicar fatura
    async duplicateInvoice(id) {
        try {
            const response = await axios.post(`${baseURL}/invoices/${id}/duplicate`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao duplicar fatura ${id}:`, error);
            throw error;
        }
    }

    // Excluir fatura
    async deleteInvoice(id) {
        try {
            const response = await axios.delete(`${baseURL}/invoices/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao excluir fatura ${id}:`, error);
            throw error;
        }
    }

    // Gerar dados mock para desenvolvimento/testes
    getMockInvoices() {
        return {
            items: [
                {
                    id: 1,
                    invoice_number: 'INV-202409-0001',
                    status: 'sent',
                    invoice_date: '2025-09-15',
                    due_date: '2025-10-15',
                    subtotal: 1700.0,
                    tax_rate: 17.0,
                    tax_amount: 289.0,
                    discount_rate: 5.0,
                    discount_amount: 85.0,
                    total: 1904.0,
                    paid_amount: 0.0,
                    remaining_amount: 1904.0,
                    payment_method: null,
                    payment_date: null,
                    email: 'joao.silva@email.com',
                    mobile: '+258 84 123 4567',
                    notes: 'Fatura para serviços de consultoria',
                    payment_notes: null,
                    costumer: {
                        id: 1,
                        name: 'João Silva'
                    },
                    items: [
                        {
                            id: 1,
                            description: 'Consultoria em TI',
                            quantity: 10,
                            unit_price: 150.0,
                            discount_rate: 5.0,
                            discount_amount: 75.0,
                            line_total: 1425.0,
                            product: {
                                id: 1,
                                name: 'Hora de Consultoria'
                            }
                        },
                        {
                            id: 2,
                            description: 'Taxa de manutenção',
                            quantity: 1,
                            unit_price: 275.0,
                            discount_rate: 0.0,
                            discount_amount: 0.0,
                            line_total: 275.0,
                            product: null
                        }
                    ],
                    createdByUser: {
                        id: 1,
                        name: 'Administrador'
                    }
                },
                {
                    id: 2,
                    invoice_number: 'INV-202409-0002',
                    status: 'partially_paid',
                    invoice_date: '2025-09-20',
                    due_date: '2025-10-20',
                    subtotal: 3500.0,
                    tax_rate: 17.0,
                    tax_amount: 595.0,
                    discount_rate: 0.0,
                    discount_amount: 0.0,
                    total: 4095.0,
                    paid_amount: 2000.0,
                    remaining_amount: 2095.0,
                    payment_method: 'bank_transfer',
                    payment_date: '2025-09-22',
                    email: 'maria.santos@empresa.co.mz',
                    mobile: '+258 87 765 4321',
                    notes: 'Pagamento parcial recebido',
                    payment_notes: 'Transferência bancária - primeira parcela',
                    costumer: {
                        id: 2,
                        name: 'Maria Santos Lda'
                    },
                    items: [
                        {
                            id: 3,
                            description: 'Desenvolvimento de Sistema',
                            quantity: 1,
                            unit_price: 3500.0,
                            discount_rate: 0.0,
                            discount_amount: 0.0,
                            line_total: 3500.0,
                            product: {
                                id: 2,
                                name: 'Sistema Web Personalizado'
                            }
                        }
                    ],
                    createdByUser: {
                        id: 1,
                        name: 'Administrador'
                    }
                },
                {
                    id: 3,
                    invoice_number: 'INV-202409-0003',
                    status: 'overdue',
                    invoice_date: '2025-08-15',
                    due_date: '2025-09-15',
                    subtotal: 850.0,
                    tax_rate: 17.0,
                    tax_amount: 144.5,
                    discount_rate: 10.0,
                    discount_amount: 85.0,
                    total: 909.5,
                    paid_amount: 0.0,
                    remaining_amount: 909.5,
                    payment_method: null,
                    payment_date: null,
                    email: 'carlos@exemplo.co.mz',
                    mobile: '+258 21 456 789',
                    notes: 'Fatura vencida - entrar em contato',
                    payment_notes: null,
                    costumer: {
                        id: 3,
                        name: 'Carlos Mozambique Lda'
                    },
                    items: [
                        {
                            id: 4,
                            description: 'Manutenção de Equipamentos',
                            quantity: 5,
                            unit_price: 170.0,
                            discount_rate: 10.0,
                            discount_amount: 85.0,
                            line_total: 765.0,
                            product: {
                                id: 3,
                                name: 'Serviço de Manutenção'
                            }
                        }
                    ],
                    createdByUser: {
                        id: 1,
                        name: 'Administrador'
                    }
                }
            ],
            meta: {
                itemCount: 3,
                totalItems: 3,
                itemsPerPage: 10,
                totalPages: 1,
                currentPage: 1
            },
            links: {
                first: '/v1/invoices?page=1&limit=10',
                previous: '',
                next: '',
                last: '/v1/invoices?page=1&limit=10'
            }
        };
    }

    // Obter opções de status
    getStatusOptions() {
        return [
            { label: 'Rascunho', value: 'draft', severity: 'info', icon: 'pi pi-file-edit' },
            { label: 'Enviada', value: 'sent', severity: 'warning', icon: 'pi pi-send' },
            { label: 'Paga', value: 'paid', severity: 'success', icon: 'pi pi-check-circle' },
            { label: 'Parcialmente Paga', value: 'partially_paid', severity: 'info', icon: 'pi pi-clock' },
            { label: 'Vencida', value: 'overdue', severity: 'danger', icon: 'pi pi-exclamation-triangle' },
            { label: 'Cancelada', value: 'cancelled', severity: 'secondary', icon: 'pi pi-ban' }
        ];
    }

    // Obter métodos de pagamento
    getPaymentMethods() {
        return [
            { label: 'Dinheiro', value: 'cash', icon: 'pi pi-money-bill' },
            { label: 'Cartão de Crédito', value: 'credit_card', icon: 'pi pi-credit-card' },
            { label: 'Cartão de Débito', value: 'debit_card', icon: 'pi pi-credit-card' },
            { label: 'Transferência Bancária', value: 'bank_transfer', icon: 'pi pi-building' },
            { label: 'PIX', value: 'pix', icon: 'pi pi-mobile' },
            { label: 'Cheque', value: 'check', icon: 'pi pi-file' },
            { label: 'Outros', value: 'other', icon: 'pi pi-ellipsis-h' }
        ];
    }

    // Calcular totais da fatura
    calculateInvoiceTotals(items, discountRate = 0, taxRate = 17) {
        const subtotal = items.reduce((sum, item) => {
            const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
            const itemDiscount = itemSubtotal * ((item.discount_rate || 0) / 100);
            return sum + (itemSubtotal - itemDiscount);
        }, 0);

        const discountAmount = subtotal * (discountRate / 100);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (taxRate / 100);
        const total = subtotal - discountAmount + taxAmount;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount_amount: parseFloat(discountAmount.toFixed(2)),
            tax_amount: parseFloat(taxAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    }
}

export default new InvoiceService();