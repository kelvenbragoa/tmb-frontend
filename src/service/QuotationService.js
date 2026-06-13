import { baseURL } from './APIConstant';
import axios from 'axios';

export class QuotationService {
    // Listar cotações com paginação e filtros
    async getQuotations(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Parâmetros de paginação
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        // Filtros
        if (params.status) queryParams.append('status', params.status);
        if (params.costumer_id) queryParams.append('costumer_id', params.costumer_id);
        if (params.search) queryParams.append('search', params.search);
        
        const url = `${baseURL}/quotations?${queryParams.toString()}`;
        const response = await axios.get(url);
        return response.data;
    }

    // Buscar cotação por ID
    async getQuotationById(id) {
        const response = await axios.get(`${baseURL}/quotations/${id}`);
        return response.data;
    }

    // Criar nova cotação
    async createQuotation(quotationData) {
        const response = await axios.post(`${baseURL}/quotations`, quotationData);
        return response.data;
    }

    // Atualizar cotação
    async updateQuotation(id, quotationData) {
        const response = await axios.patch(`${baseURL}/quotations/${id}`, quotationData);
        return response.data;
    }

    // Atualizar status da cotação
    async updateQuotationStatus(id, status) {
        const response = await axios.patch(`${baseURL}/quotations/${id}/status`, { status });
        return response.data;
    }

    // Duplicar cotação
    async duplicateQuotation(id) {
        const response = await axios.post(`${baseURL}/quotations/${id}/duplicate`);
        return response.data;
    }

    // Excluir cotação
    async deleteQuotation(id) {
        const response = await axios.delete(`${baseURL}/quotations/${id}`);
        return response.data;
    }

    // Gerar PDF da cotação
    async generatePdf(id) {
        const response = await axios.get(`${baseURL}/quotations/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }

    // Converter cotação em fatura
    async convertToInvoice(id, invoiceData = {}) {
        const response = await axios.post(`${baseURL}/quotations/${id}/convert-to-invoice`, invoiceData);
        return response.data;
    }

    // Mock data para desenvolvimento (remover em produção)
    getMockQuotations() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    items: [
                        {
                            id: 1,
                            quotation_number: 'COT-202409-0001',
                            status: 'sent',
                            quotation_date: '2024-09-01T00:00:00.000Z',
                            expiry_date: '2024-09-15T00:00:00.000Z',
                            subtotal: 4755.0,
                            tax_rate: 17.0,
                            tax_amount: 808.35,
                            discount_rate: 5.0,
                            discount_amount: 237.75,
                            total: 5325.6,
                            notes: 'Cotação para equipamentos informáticos',
                            costumer: {
                                id: 1,
                                name: 'João Silva Lda',
                                email: 'joao@silva.mz'
                            },
                            items: [
                                {
                                    id: 1,
                                    description: 'Notebook Dell Inspiron',
                                    quantity: 2,
                                    unit_price: 2500.0,
                                    discount_rate: 5.0,
                                    discount_amount: 250.0,
                                    line_total: 4750.0,
                                    product: {
                                        id: 1,
                                        name: 'Notebook Dell Inspiron 15'
                                    }
                                }
                            ],
                            createdByUser: {
                                id: 1,
                                name: 'Admin User'
                            },
                            created_at: '2024-09-01T10:00:00.000Z',
                            updated_at: '2024-09-01T10:00:00.000Z'
                        },
                        {
                            id: 2,
                            quotation_number: 'COT-202409-0002',
                            status: 'accepted',
                            quotation_date: '2024-09-02T00:00:00.000Z',
                            expiry_date: '2024-09-16T00:00:00.000Z',
                            subtotal: 3000.0,
                            tax_rate: 17.0,
                            tax_amount: 510.0,
                            discount_rate: 0.0,
                            discount_amount: 0.0,
                            total: 3510.0,
                            notes: 'Cotação para móveis de escritório',
                            costumer: {
                                id: 2,
                                name: 'Maria Santos SA',
                                email: 'maria@santos.mz'
                            },
                            items: [
                                {
                                    id: 2,
                                    description: 'Mesa de Escritório',
                                    quantity: 1,
                                    unit_price: 1500.0,
                                    discount_rate: 0.0,
                                    discount_amount: 0.0,
                                    line_total: 1500.0,
                                    product: null
                                },
                                {
                                    id: 3,
                                    description: 'Cadeira Executiva',
                                    quantity: 1,
                                    unit_price: 1500.0,
                                    discount_rate: 0.0,
                                    discount_amount: 0.0,
                                    line_total: 1500.0,
                                    product: null
                                }
                            ],
                            createdByUser: {
                                id: 1,
                                name: 'Admin User'
                            },
                            created_at: '2024-09-02T09:30:00.000Z',
                            updated_at: '2024-09-02T14:15:00.000Z'
                        },
                        {
                            id: 3,
                            quotation_number: 'COT-202409-0003',
                            status: 'draft',
                            quotation_date: '2024-09-03T00:00:00.000Z',
                            expiry_date: '2024-09-17T00:00:00.000Z',
                            subtotal: 8500.0,
                            tax_rate: 17.0,
                            tax_amount: 1445.0,
                            discount_rate: 10.0,
                            discount_amount: 850.0,
                            total: 9095.0,
                            notes: 'Cotação em desenvolvimento',
                            costumer: {
                                id: 3,
                                name: 'Pedro Mozambique Lda',
                                email: 'pedro@mozambique.mz'
                            },
                            items: [
                                {
                                    id: 4,
                                    description: 'Servidor Dell PowerEdge',
                                    quantity: 1,
                                    unit_price: 8500.0,
                                    discount_rate: 10.0,
                                    discount_amount: 850.0,
                                    line_total: 7650.0,
                                    product: {
                                        id: 2,
                                        name: 'Servidor Dell PowerEdge T340'
                                    }
                                }
                            ],
                            createdByUser: {
                                id: 1,
                                name: 'Admin User'
                            },
                            created_at: '2024-09-03T11:45:00.000Z',
                            updated_at: '2024-09-03T11:45:00.000Z'
                        },
                        {
                            id: 4,
                            quotation_number: 'COT-202408-0015',
                            status: 'expired',
                            quotation_date: '2024-08-25T00:00:00.000Z',
                            expiry_date: '2024-09-08T00:00:00.000Z',
                            subtotal: 2800.0,
                            tax_rate: 17.0,
                            tax_amount: 476.0,
                            discount_rate: 0.0,
                            discount_amount: 0.0,
                            total: 3276.0,
                            notes: 'Cotação expirada - não respondida pelo cliente',
                            costumer: {
                                id: 4,
                                name: 'Ana Costa Comercial',
                                email: 'ana@costa.mz'
                            },
                            items: [
                                {
                                    id: 5,
                                    description: 'Impressora Multifuncional',
                                    quantity: 1,
                                    unit_price: 2800.0,
                                    discount_rate: 0.0,
                                    discount_amount: 0.0,
                                    line_total: 2800.0,
                                    product: {
                                        id: 3,
                                        name: 'HP LaserJet Pro MFP M428fdw'
                                    }
                                }
                            ],
                            createdByUser: {
                                id: 1,
                                name: 'Admin User'
                            },
                            created_at: '2024-08-25T08:20:00.000Z',
                            updated_at: '2024-08-25T08:20:00.000Z'
                        },
                        {
                            id: 5,
                            quotation_number: 'COT-202409-0004',
                            status: 'rejected',
                            quotation_date: '2024-09-04T00:00:00.000Z',
                            expiry_date: '2024-09-18T00:00:00.000Z',
                            subtotal: 5200.0,
                            tax_rate: 17.0,
                            tax_amount: 884.0,
                            discount_rate: 8.0,
                            discount_amount: 416.0,
                            total: 5668.0,
                            notes: 'Cliente rejeitou - preço acima do orçamento',
                            costumer: {
                                id: 5,
                                name: 'Carlos Distribuição',
                                email: 'carlos@distribuicao.mz'
                            },
                            items: [
                                {
                                    id: 6,
                                    description: 'Switch 24 Portas',
                                    quantity: 2,
                                    unit_price: 2600.0,
                                    discount_rate: 8.0,
                                    discount_amount: 416.0,
                                    line_total: 4784.0,
                                    product: {
                                        id: 4,
                                        name: 'Cisco Catalyst 2960'
                                    }
                                }
                            ],
                            createdByUser: {
                                id: 1,
                                name: 'Admin User'
                            },
                            created_at: '2024-09-04T16:10:00.000Z',
                            updated_at: '2024-09-05T09:30:00.000Z'
                        }
                    ],
                    meta: {
                        itemCount: 5,
                        totalItems: 5,
                        itemsPerPage: 10,
                        totalPages: 1,
                        currentPage: 1
                    },
                    links: {
                        first: '/v1/quotations?page=1&limit=10',
                        previous: null,
                        next: null,
                        last: '/v1/quotations?page=1&limit=10'
                    }
                });
            }, 1000);
        });
    }
}

export default new QuotationService();