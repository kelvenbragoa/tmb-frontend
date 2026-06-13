class InvoiceSeriesDemoService {
    constructor() {
        this.delayMs = 500; // Delay para simular latência da API
        this.mockData = this.generateMockData();
    }

    // Método para simular delay da API
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms || this.delayMs));
    }

    // Gerar dados mockados
    generateMockData() {
        const currentYear = new Date().getFullYear();
        
        return [
            {
                id: 1,
                name: `Cotações ${currentYear}`,
                prefix: `COT${currentYear}`,
                document_type: 'quotation',
                current_number: 15,
                start_number: 1,
                end_number: 9999,
                separator: '/',
                number_padding: 3,
                is_active: true,
                status: 'active',
                description: `Série padrão para cotações do ano ${currentYear}`,
                metadata: {
                    year: currentYear,
                    department: 'sales'
                },
                organization_id: 1,
                created_at: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                updated_at: new Date(`${currentYear}-01-15T14:30:00.000Z`),
                formattedStatus: 'Ativa',
                formattedDocumentType: 'Cotação',
                nextNumber: `COT${currentYear}/016`,
                seriesInfo: `Cotações ${currentYear} (COT${currentYear}/016)`
            },
            {
                id: 2,
                name: `Faturas ${currentYear}`,
                prefix: `FAT${currentYear}`,
                document_type: 'invoice',
                current_number: 89,
                start_number: 1,
                end_number: 9999,
                separator: '/',
                number_padding: 3,
                is_active: true,
                status: 'active',
                description: `Série principal para faturas do ano ${currentYear}`,
                metadata: {
                    year: currentYear,
                    department: 'sales'
                },
                organization_id: 1,
                created_at: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                updated_at: new Date(`${currentYear}-03-20T16:45:00.000Z`),
                formattedStatus: 'Ativa',
                formattedDocumentType: 'Fatura',
                nextNumber: `FAT${currentYear}/090`,
                seriesInfo: `Faturas ${currentYear} (FAT${currentYear}/090)`
            },
            {
                id: 3,
                name: `Vendas a Dinheiro ${currentYear}`,
                prefix: `VD${currentYear}`,
                document_type: 'cash_sale',
                current_number: 234,
                start_number: 1,
                end_number: 9999,
                separator: '/',
                number_padding: 3,
                is_active: true,
                status: 'active',
                description: `Série para vendas diretas a dinheiro ${currentYear}`,
                metadata: {
                    year: currentYear,
                    department: 'sales'
                },
                organization_id: 1,
                created_at: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                updated_at: new Date(`${currentYear}-05-10T09:15:00.000Z`),
                formattedStatus: 'Ativa',
                formattedDocumentType: 'Venda a Dinheiro',
                nextNumber: `VD${currentYear}/235`,
                seriesInfo: `Vendas a Dinheiro ${currentYear} (VD${currentYear}/235)`
            },
            {
                id: 4,
                name: `Pagamentos de Recibo ${currentYear}`,
                prefix: `PAG-REC-${currentYear}`,
                document_type: 'receipt_payment',
                current_number: 45,
                start_number: 1,
                end_number: 9999,
                separator: '/',
                number_padding: 3,
                is_active: true,
                status: 'active',
                description: `Série para pagamentos de recibos ${currentYear}`,
                metadata: {
                    year: currentYear,
                    department: 'finance'
                },
                organization_id: 1,
                created_at: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                updated_at: new Date(`${currentYear}-02-28T11:20:00.000Z`),
                formattedStatus: 'Ativa',
                formattedDocumentType: 'Pagamento de Recibo',
                nextNumber: `PAG-REC-${currentYear}/046`,
                seriesInfo: `Pagamentos de Recibo ${currentYear} (PAG-REC-${currentYear}/046)`
            },
            {
                id: 5,
                name: `Pagamentos de Fatura ${currentYear}`,
                prefix: `PAG-FAT-${currentYear}`,
                document_type: 'invoice_payment',
                current_number: 67,
                start_number: 1,
                end_number: 9999,
                separator: '/',
                number_padding: 3,
                is_active: true,
                status: 'active',
                description: `Série para pagamentos de faturas ${currentYear}`,
                metadata: {
                    year: currentYear,
                    department: 'finance'
                },
                organization_id: 1,
                created_at: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                updated_at: new Date(`${currentYear}-04-05T13:40:00.000Z`),
                formattedStatus: 'Ativa',
                formattedDocumentType: 'Pagamento de Fatura',
                nextNumber: `PAG-FAT-${currentYear}/068`,
                seriesInfo: `Pagamentos de Fatura ${currentYear} (PAG-FAT-${currentYear}/068)`
            },
            {
                id: 6,
                name: 'Cotações Teste',
                prefix: 'COT-TEST',
                document_type: 'quotation',
                current_number: 5,
                start_number: 1,
                end_number: 100,
                separator: '-',
                number_padding: 2,
                is_active: false,
                status: 'inactive',
                description: 'Série de teste para cotações (inativa)',
                metadata: {
                    year: currentYear,
                    department: 'test',
                    test_series: true
                },
                organization_id: 1,
                created_at: new Date(`${currentYear}-02-01T00:00:00.000Z`),
                updated_at: new Date(`${currentYear}-02-15T10:30:00.000Z`),
                formattedStatus: 'Inativa',
                formattedDocumentType: 'Cotação',
                nextNumber: 'COT-TEST-06',
                seriesInfo: 'Cotações Teste (COT-TEST-06)'
            }
        ];
    }

    // ============ CRUD OPERATIONS ============

    // 1. Criar Nova Série
    async createSeries(seriesData) {
        await this.delay();

        // Validar dados
        this.validateSeriesData(seriesData);

        // Verificar se prefixo já existe
        const existingPrefix = this.mockData.find((series) => 
            series.prefix === seriesData.prefix
        );
        if (existingPrefix) {
            throw new Error(`Prefixo "${seriesData.prefix}" já está em uso`);
        }

        // Criar nova série
        const newId = Math.max(...this.mockData.map((s) => s.id)) + 1;
        const now = new Date();
        
        const newSeries = {
            id: newId,
            name: seriesData.name,
            prefix: seriesData.prefix,
            document_type: seriesData.document_type,
            current_number: parseInt(seriesData.start_number || 1),
            start_number: parseInt(seriesData.start_number || 1),
            end_number: parseInt(seriesData.end_number || 9999),
            separator: seriesData.separator || '/',
            number_padding: parseInt(seriesData.number_padding || 3),
            is_active: seriesData.is_active !== false,
            status: seriesData.status || 'active',
            description: seriesData.description || '',
            metadata: seriesData.metadata || {},
            organization_id: 1,
            created_at: now,
            updated_at: now
        };

        // Adicionar campos calculados
        newSeries.formattedStatus = this.getStatusLabel(newSeries.status);
        newSeries.formattedDocumentType = this.getDocumentTypeLabel(newSeries.document_type);
        newSeries.nextNumber = this.formatSeriesNumber(
            newSeries.prefix,
            newSeries.separator,
            newSeries.current_number,
            newSeries.number_padding
        );
        newSeries.seriesInfo = `${newSeries.name} (${newSeries.nextNumber})`;

        // Se ativada, desativar outras do mesmo tipo
        if (newSeries.is_active) {
            this.mockData.forEach((series) => {
                if (series.document_type === newSeries.document_type && series.id !== newSeries.id) {
                    series.is_active = false;
                }
            });
        }

        this.mockData.push(newSeries);
        return newSeries;
    }

    // 2. Listar Séries
    async getSeriesList(filters = {}) {
        await this.delay();

        let filteredData = [...this.mockData];

        // Aplicar filtros
        if (filters.document_type) {
            filteredData = filteredData.filter((series) => 
                series.document_type === filters.document_type
            );
        }

        if (filters.status) {
            filteredData = filteredData.filter((series) => 
                series.status === filters.status
            );
        }

        if (filters.is_active !== undefined) {
            filteredData = filteredData.filter((series) => 
                series.is_active === filters.is_active
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredData = filteredData.filter((series) =>
                series.name.toLowerCase().includes(searchTerm) ||
                series.prefix.toLowerCase().includes(searchTerm) ||
                (series.description && series.description.toLowerCase().includes(searchTerm))
            );
        }

        // Paginação
        const page = parseInt(filters.page || 1);
        const limit = parseInt(filters.limit || 10);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            total: filteredData.length,
            page,
            limit
        };
    }

    // 3. Obter Resumo das Séries
    async getSeriesSummary() {
        await this.delay();

        const summary = {};
        
        this.mockData.forEach((series) => {
            if (!summary[series.document_type]) {
                summary[series.document_type] = {
                    document_type: series.document_type,
                    document_type_label: this.getDocumentTypeLabel(series.document_type),
                    total_series: 0,
                    active_series: 0,
                    enabled_series: 0
                };
            }

            summary[series.document_type].total_series++;
            
            if (series.status === 'active') {
                summary[series.document_type].active_series++;
            }
            
            if (series.is_active) {
                summary[series.document_type].enabled_series++;
            }
        });

        return Object.values(summary);
    }

    // 4. Obter Série Ativa por Tipo
    async getActiveSeriesByType(documentType) {
        await this.delay();

        const activeSeries = this.mockData.find((series) =>
            series.document_type === documentType && series.is_active
        );

        if (!activeSeries) {
            throw new Error(`Nenhuma série ativa encontrada para o tipo de documento: ${documentType}`);
        }

        return activeSeries;
    }

    // 5. Gerar Próximo Número
    async generateNumber(documentType) {
        await this.delay();

        const activeSeries = this.mockData.find((series) =>
            series.document_type === documentType && series.is_active
        );

        if (!activeSeries) {
            throw new Error(`Nenhuma série ativa encontrada para o tipo de documento: ${documentType}`);
        }

        // Incrementar número atual
        activeSeries.current_number++;
        activeSeries.updated_at = new Date();

        // Gerar número formatado
        const nextNumber = this.formatSeriesNumber(
            activeSeries.prefix,
            activeSeries.separator,
            activeSeries.current_number,
            activeSeries.number_padding
        );

        return {
            document_type: documentType,
            next_number: nextNumber,
            generated_at: new Date()
        };
    }

    // 6. Criar Séries Padrão
    async createDefaultSeries() {
        await this.delay();

        const currentYear = new Date().getFullYear();
        const defaultSeries = [
            {
                name: `Cotações ${currentYear}`,
                prefix: `COT${currentYear}`,
                document_type: 'quotation',
                description: `Série padrão para Cotações ${currentYear}`
            },
            {
                name: `Vendas a Dinheiro ${currentYear}`,
                prefix: `VD${currentYear}`,
                document_type: 'cash_sale',
                description: `Série padrão para Vendas a Dinheiro ${currentYear}`
            },
            {
                name: `Faturas ${currentYear}`,
                prefix: `FAT${currentYear}`,
                document_type: 'invoice',
                description: `Série padrão para Faturas ${currentYear}`
            },
            {
                name: `Pagamentos de Recibo ${currentYear}`,
                prefix: `PAG-REC-${currentYear}`,
                document_type: 'receipt_payment',
                description: `Série padrão para Pagamentos de Recibo ${currentYear}`
            },
            {
                name: `Pagamentos de Fatura ${currentYear}`,
                prefix: `PAG-FAT-${currentYear}`,
                document_type: 'invoice_payment',
                description: `Série padrão para Pagamentos de Fatura ${currentYear}`
            }
        ];

        const createdSeries = [];
        
        for (const seriesData of defaultSeries) {
            // Verificar se já existe
            const existing = this.mockData.find((s) => s.prefix === seriesData.prefix);
            if (!existing) {
                const created = await this.createSeries(seriesData);
                createdSeries.push(created);
            }
        }

        return createdSeries;
    }

    // 7. Obter Série por ID
    async getSeriesById(id) {
        await this.delay();

        const series = this.mockData.find((s) => s.id === parseInt(id));
        if (!series) {
            throw new Error(`Série com ID ${id} não encontrada`);
        }

        return series;
    }

    // 8. Atualizar Série
    async updateSeries(id, updateData) {
        await this.delay();

        const seriesIndex = this.mockData.findIndex((s) => s.id === parseInt(id));
        if (seriesIndex === -1) {
            throw new Error(`Série com ID ${id} não encontrada`);
        }

        const series = this.mockData[seriesIndex];
        
        // Aplicar atualizações
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] !== undefined) {
                series[key] = updateData[key];
            }
        });

        series.updated_at = new Date();

        // Recalcular campos derivados
        if (updateData.status) {
            series.formattedStatus = this.getStatusLabel(series.status);
        }

        if (updateData.prefix || updateData.separator || updateData.current_number || updateData.number_padding) {
            series.nextNumber = this.formatSeriesNumber(
                series.prefix,
                series.separator,
                series.current_number,
                series.number_padding
            );
            series.seriesInfo = `${series.name} (${series.nextNumber})`;
        }

        return series;
    }

    // 9. Alternar Série Ativa
    async toggleActiveSeries(id) {
        await this.delay();

        const series = this.mockData.find((s) => s.id === parseInt(id));
        if (!series) {
            throw new Error(`Série com ID ${id} não encontrada`);
        }

        // Alternar status ativo
        series.is_active = !series.is_active;
        series.updated_at = new Date();

        // Se ativada, desativar outras do mesmo tipo
        if (series.is_active) {
            this.mockData.forEach((s) => {
                if (s.document_type === series.document_type && s.id !== series.id) {
                    s.is_active = false;
                }
            });
        }

        return series;
    }

    // 10. Excluir Série
    async deleteSeries(id) {
        await this.delay();

        const seriesIndex = this.mockData.findIndex((s) => s.id === parseInt(id));
        if (seriesIndex === -1) {
            throw new Error(`Série com ID ${id} não encontrada`);
        }

        const series = this.mockData[seriesIndex];
        
        // Não permitir exclusão de série ativa
        if (series.is_active) {
            throw new Error('Não é possível excluir uma série ativa. Desative-a primeiro.');
        }

        this.mockData.splice(seriesIndex, 1);
        return true;
    }

    // ============ VALIDATIONS & UTILITIES ============

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
    }

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

    getStatusLabel(status) {
        const labels = {
            active: 'Ativa',
            inactive: 'Inativa'
        };
        return labels[status] || status;
    }

    formatSeriesNumber(prefix, separator, number, padding) {
        const paddedNumber = String(number).padStart(padding || 3, '0');
        return `${prefix}${separator || '/'}${paddedNumber}`;
    }
}

export default new InvoiceSeriesDemoService();