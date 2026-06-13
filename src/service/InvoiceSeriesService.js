import axios from 'axios';
import { baseURL } from './APIConstant';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

class InvoiceSeriesService {
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
            console.error('Invoice Series API Error:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url
            });
        } else {
            console.error('Invoice Series Network Error:', error.message);
        }
    }

    // ============ CRUD OPERATIONS ============

    // 1. Criar Nova Série
    async createSeries(seriesData) {
        this.validateSeriesData(seriesData);
        
        const response = await this.client.post('/invoice-series', {
            name: seriesData.name,
            prefix: seriesData.prefix,
            document_type: seriesData.document_type,
            start_number: parseInt(seriesData.start_number || 1),
            end_number: parseInt(seriesData.end_number || 9999),
            separator: seriesData.separator || '/',
            number_padding: parseInt(seriesData.number_padding || 3),
            is_active: seriesData.is_active !== false,
            status: seriesData.status || 'active',
            description: seriesData.description || '',
            metadata: seriesData.metadata || {}
        });
        
        return response.data;
    }

    // 2. Listar Séries
    async getSeriesList(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.document_type) {
            params.append('document_type', filters.document_type);
        }
        if (filters.status) {
            params.append('status', filters.status);
        }
        if (filters.is_active !== undefined) {
            params.append('is_active', filters.is_active);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.page) {
            params.append('page', filters.page);
        }
        if (filters.limit) {
            params.append('limit', filters.limit);
        }

        const response = await this.client.get(`/invoice-series${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    }

    // 3. Obter Resumo das Séries
    async getSeriesSummary() {
        const response = await this.client.get('/invoice-series/summary');
        return response.data;
    }

    // 4. Obter Série Ativa por Tipo
    async getActiveSeriesByType(documentType) {
        const response = await this.client.get(`/invoice-series/active/${documentType}`);
        return response.data;
    }

    // 5. Gerar Próximo Número
    async generateNumber(documentType) {
        const response = await this.client.post(`/invoice-series/generate-number/${documentType}`);
        return response.data;
    }

    // 6. Criar Séries Padrão
    async createDefaultSeries() {
        const response = await this.client.post('/invoice-series/create-defaults');
        return response.data;
    }

    // 7. Obter Série por ID
    async getSeriesById(id) {
        const response = await this.client.get(`/invoice-series/${id}`);
        return response.data;
    }

    // 8. Atualizar Série
    async updateSeries(id, updateData) {
        const response = await this.client.patch(`/invoice-series/${id}`, updateData);
        return response.data;
    }

    // 9. Alternar Série Ativa
    async toggleActiveSeries(id) {
        const response = await this.client.patch(`/invoice-series/${id}/toggle-active`);
        return response.data;
    }

    // 10. Excluir Série
    async deleteSeries(id) {
        await this.client.delete(`/invoice-series/${id}`);
        return true;
    }

    // ============ VALIDATIONS ============

    validateSeriesData(data) {
        if (!data.name || data.name.trim().length < 2) {
            throw new Error('Nome da série é obrigatório (mínimo 2 caracteres)');
        }

        if (!data.prefix || data.prefix.trim().length < 2) {
            throw new Error('Prefixo é obrigatório (mínimo 2 caracteres)');
        }

        if (!data.document_type) {
            throw new Error('Tipo de documento é obrigatório');
        }

        const validDocumentTypes = ['quotation', 'cash_sale', 'invoice', 'receipt_payment', 'invoice_payment'];
        if (!validDocumentTypes.includes(data.document_type)) {
            throw new Error('Tipo de documento inválido');
        }

        if (data.start_number && (isNaN(data.start_number) || parseInt(data.start_number) < 1)) {
            throw new Error('Número inicial deve ser maior que zero');
        }

        if (data.end_number && (isNaN(data.end_number) || parseInt(data.end_number) < 1)) {
            throw new Error('Número final deve ser maior que zero');
        }

        if (data.start_number && data.end_number && parseInt(data.start_number) >= parseInt(data.end_number)) {
            throw new Error('Número final deve ser maior que o número inicial');
        }

        if (data.number_padding && (isNaN(data.number_padding) || parseInt(data.number_padding) < 1)) {
            throw new Error('Preenchimento de zeros deve ser maior que zero');
        }
    }

    // ============ UTILITY METHODS ============

    getDocumentTypeLabel(type) {
        const labels = {
            quotation: 'Cotação',
            cash_sale: 'Venda a Dinheiro',
            invoice: 'Fatura',
            receipt_payment: 'Pagamento de Recibo',
            invoice_payment: 'Pagamento de Fatura'
        };
        return labels[type] || type;
    }

    getDocumentTypeOptions() {
        return [
            { label: 'Cotação', value: 'quotation' },
            { label: 'Venda a Dinheiro', value: 'cash_sale' },
            { label: 'Fatura', value: 'invoice' },
            { label: 'Pagamento de Recibo', value: 'receipt_payment' },
            { label: 'Pagamento de Fatura', value: 'invoice_payment' }
        ];
    }

    getStatusLabel(status) {
        const labels = {
            active: 'Ativa',
            inactive: 'Inativa'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status) {
        const severities = {
            active: 'success',
            inactive: 'secondary'
        };
        return severities[status] || 'info';
    }

    formatSeriesNumber(prefix, separator, number, padding) {
        const paddedNumber = String(number).padStart(padding || 3, '0');
        return `${prefix}${separator || '/'}${paddedNumber}`;
    }

    formatDate(dateString) {
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

    // ============ DEMO METHODS ============

    generateSamplePrefix(documentType, year = new Date().getFullYear()) {
        const prefixes = {
            quotation: `COT${year}`,
            cash_sale: `VD${year}`,
            invoice: `FAT${year}`,
            receipt_payment: `PAG-REC-${year}`,
            invoice_payment: `PAG-FAT-${year}`
        };
        return prefixes[documentType] || `DOC${year}`;
    }

    generateSampleName(documentType, year = new Date().getFullYear()) {
        const names = {
            quotation: `Cotações ${year}`,
            cash_sale: `Vendas a Dinheiro ${year}`,
            invoice: `Faturas ${year}`,
            receipt_payment: `Pagamentos de Recibo ${year}`,
            invoice_payment: `Pagamentos de Fatura ${year}`
        };
        return names[documentType] || `Documentos ${year}`;
    }
}

export default new InvoiceSeriesService();