<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InvoiceService from '@/service/InvoiceService';
import { getFormattedOrganizationInfo } from '@/utils/organizationUtils';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// Estado do componente
const invoice = ref(null);
const isLoading = ref(true);
const isGeneratingPdf = ref(false);
const pdfUrl = ref(null);

// Organization data
const organizationInfo = computed(() => getFormattedOrganizationInfo());

// Computed properties
const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
};

const formatCurrency = (value) => {
    if (!value) return 'MZN 0,00';
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2
    }).format(value);
};

const getStatusLabel = (status) => {
    const statusMap = {
        'DRAFT': 'Rascunho',
        'SENT': 'Enviado', 
        'PARTIALLY_PAID': 'Parcialmente Pago',
        'PAID': 'Pago',
        'OVERDUE': 'Vencido',
        'CANCELLED': 'Cancelado'
    };
    return statusMap[status?.toUpperCase()] || status;
};

// Métodos
const loadInvoice = async () => {
    try {
        isLoading.value = true;
        const response = await InvoiceService.getInvoiceById(route.params.id);
        invoice.value = response;
    } catch (error) {
        console.error('Erro ao carregar fatura:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar fatura',
            life: 3000
        });
        router.push('/sales/invoices');
    } finally {
        isLoading.value = false;
    }
};

const generatePdf = async () => {
    try {
        isGeneratingPdf.value = true;
        const pdfBlob = await InvoiceService.generatePdf(invoice.value.id);
        
        // Criar URL do blob para visualização
        const url = window.URL.createObjectURL(pdfBlob);
        pdfUrl.value = url;
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'PDF gerado com sucesso',
            life: 3000
        });
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao gerar PDF. Usando visualização HTML.',
            life: 3000
        });
    } finally {
        isGeneratingPdf.value = false;
    }
};

const downloadPdf = async () => {
    try {
        const pdfBlob = await InvoiceService.generatePdf(invoice.value.id);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Fatura-${invoice.value.invoice_number}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'PDF baixado com sucesso',
            life: 3000
        });
    } catch (error) {
        console.error('Erro ao baixar PDF:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao baixar PDF',
            life: 3000
        });
    }
};

const printPdf = async () => {
    try {
        // Capturar elemento do documento
        const documentElement = document.querySelector('#invoice-document');
        if (!documentElement) {
            console.error('Documento não encontrado');
            return;
        }

        // Criar janela de impressão customizada
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        if (printWindow) {
            // Capturar todos os estilos da página atual
            const allStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
                .map((el) => {
                    if (el.tagName === 'LINK') {
                        return `<link rel="stylesheet" href="${el.href}">`;
                    }
                    return el.outerHTML;
                })
                .join('\n');

            // Criar HTML completo com todos os estilos
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Fatura - ${invoice.value?.invoice_number || ''}</title>
                    ${allStyles}
                    <style>
                        body { 
                            margin: 0; 
                            padding: 0.8cm; 
                            font-family: Arial, sans-serif;
                            background: white;
                            color: #333;
                        }
                        .invoice-document {
                            max-width: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border-radius: 0 !important;
                            background: white !important;
                        }
                        @media print {
                            body { margin: 0; padding: 12mm; }
                            * { -webkit-print-color-adjust: exact !important; }
                        }
                    </style>
                </head>
                <body>
                    ${documentElement.outerHTML}
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Aguardar carregamento dos estilos e imprimir
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 1000);
            };
        }
    } catch (error) {
        console.error('Erro ao imprimir:', error);
        // Fallback para impressão tradicional
        window.print();
    }
};

const goBack = () => {
    router.push(`/sales/invoices/${route.params.id}`);
};

onMounted(() => {
    loadInvoice();
});
</script>

<template>
    <div class="pdf-viewer">
        <!-- Loading State -->
        <div v-if="isLoading" class="card">
            <div class="text-center p-6">
                <ProgressSpinner style="width: 50px; height: 50px" />
                                    <p class="mt-3">Carregando fatura...</p>
            </div>
        </div>

        <!-- PDF Controls -->
        <div v-else class="no-print mb-3">
            <div class="flex justify-content-between align-items-center p-3 bg-white border-round shadow-1">
                <div class="flex align-items-center gap-2">
                    <Button 
                        icon="pi pi-arrow-left" 
                        class="p-button-text"
                        @click="goBack"
                        v-tooltip="'Voltar'"
                    />
                    <h5 class="m-0">PDF - Fatura {{ invoice?.invoice_number }}</h5>
                </div>

                <div class="flex gap-2">
                    <Button 
                        label="Gerar PDF"
                        icon="pi pi-refresh"
                        class="p-button-outlined"
                        :loading="isGeneratingPdf"
                        @click="generatePdf"
                    />
                    <Button 
                        label="Baixar PDF"
                        icon="pi pi-download"
                        class="p-button-outlined"
                        @click="downloadPdf"
                    />
                    <Button 
                        label="Imprimir"
                        icon="pi pi-print"
                        @click="printPdf"
                    />
                </div>
            </div>
        </div>

        <!-- PDF Viewer or HTML Preview -->
        <div v-if="invoice" class="pdf-content">
            <!-- PDF Embedded Viewer -->
            <div v-if="pdfUrl" class="pdf-embed no-print">
                <iframe 
                    :src="pdfUrl" 
                    width="100%" 
                    height="800px"
                    style="border: none; border-radius: 6px;"
                ></iframe>
            </div>

            <!-- HTML Preview (fallback) -->
            <div v-else class="pdf-preview">
                <div id="invoice-document" class="invoice-document">
                    <!-- Document Header -->
                    <div class="document-header">
                        <div class="company-info">
                            <h1>{{ organizationInfo.title }}</h1>
                            <p>{{ organizationInfo.subtitle }}</p>
                            <p>{{ organizationInfo.location }}</p>
                            <div v-if="organizationInfo.contact.length > 0" class="company-contact">
                                <p v-for="contact in organizationInfo.contact" :key="contact" class="contact-info">{{ contact }}</p>
                            </div>
                        </div>
                        <div class="invoice-info">
                            <h2>FATURA</h2>
                            <p><strong>Número:</strong> {{ invoice.invoice_number }}</p>
                            <p><strong>Data:</strong> {{ formatDate(invoice.invoice_date) }}</p>
                            <p><strong>Vencimento:</strong> {{ formatDate(invoice.due_date) }}</p>
                            <p><strong>Status:</strong> {{ getStatusLabel(invoice.status) }}</p>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <!-- Customer Information -->
                    <div class="section">
                        <h3>INFORMAÇÕES DO CLIENTE</h3>
                        <div class="customer-details">
                            <p><strong>Nome:</strong> {{ invoice.costumer.name }}</p>
                            <p v-if="invoice.costumer.email"><strong>Email:</strong> {{ invoice.costumer.email }}</p>
                            <p v-if="invoice.costumer.phone"><strong>Telefone:</strong> {{ invoice.costumer.phone }}</p>
                            <p v-if="invoice.costumer.address"><strong>Endereço:</strong> {{ invoice.costumer.address }}</p>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="section">
                        <h3>ITEMS DA FATURA</h3>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Descrição</th>
                                    <th>Qtd</th>
                                    <th>Preço Unit.</th>
                                    <th>Desconto</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in invoice.items" :key="index">
                                    <td>{{ index + 1 }}</td>
                                    <td>
                                        <div class="item-description">
                                            <strong>{{ item.description }}</strong>
                                            <div v-if="item.product" class="item-product">
                                                Produto: {{ item.product.name }}
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-center">{{ item.quantity }}</td>
                                    <td class="text-right">{{ formatCurrency(item.unit_price) }}</td>
                                    <td class="text-right">
                                        <span v-if="item.discount_amount > 0">
                                            {{ formatCurrency(item.discount_amount) }}
                                        </span>
                                        <span v-else>-</span>
                                    </td>
                                    <td class="text-right font-bold">{{ formatCurrency(item.line_total) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Totals -->
                    <div class="section">
                        <div class="totals-section">
                            <table class="totals-table">
                                <tr>
                                    <td><strong>Subtotal:</strong></td>
                                    <td class="text-right">{{ formatCurrency(invoice.subtotal) }}</td>
                                </tr>
                                <tr v-if="invoice.discount_amount > 0">
                                    <td><strong>Desconto ({{ invoice.discount_rate }}%):</strong></td>
                                    <td class="text-right text-orange">-{{ formatCurrency(invoice.discount_amount) }}</td>
                                </tr>
                                <tr>
                                    <td><strong>IVA ({{ invoice.tax_rate }}%):</strong></td>
                                    <td class="text-right">{{ formatCurrency(invoice.tax_amount) }}</td>
                                </tr>
                                <tr class="total-row">
                                    <td><strong>TOTAL:</strong></td>
                                    <td class="text-right"><strong>{{ formatCurrency(invoice.total) }}</strong></td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Payment Information -->
                    <div v-if="invoice.paid_amount > 0 || invoice.status === 'PAID' || invoice.status === 'PARTIALLY_PAID'" class="section">
                        <h3>INFORMAÇÕES DE PAGAMENTO</h3>
                        <div class="payment-info">
                            <div class="payment-row">
                                <span><strong>Valor Pago:</strong></span>
                                <span class="payment-value">{{ formatCurrency(invoice.paid_amount || 0) }}</span>
                            </div>
                            <div class="payment-row">
                                <span><strong>Valor Restante:</strong></span>
                                <span class="payment-value">{{ formatCurrency((invoice.total || 0) - (invoice.paid_amount || 0)) }}</span>
                            </div>
                            <div v-if="invoice.payment_date" class="payment-row">
                                <span><strong>Data do Pagamento:</strong></span>
                                <span>{{ formatDate(invoice.payment_date) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div v-if="invoice.notes" class="section">
                        <h3>OBSERVAÇÕES</h3>
                        <p class="notes">{{ invoice.notes }}</p>
                    </div>

                    <!-- Footer -->
                    <div class="document-footer">
                        <div class="footer-line"></div>
                        <p class="footer-text">
                            Fatura gerada automaticamente pelo sistema {{ organizationInfo.title }} em {{ formatDate(new Date()) }}
                        </p>
                        <p class="footer-validity" v-if="invoice.status?.toUpperCase() === 'SENT' || invoice.status?.toUpperCase() === 'DRAFT'">
                            <strong>Esta fatura vence em {{ formatDate(invoice.due_date) }}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pdf-viewer {
    min-height: 100vh;
    background: #f5f5f5;
}

.pdf-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.pdf-embed {
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.invoice-document {
    background: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-family: 'Arial', sans-serif;
    line-height: 1.4;
    color: #333;
}

.document-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.company-info h1 {
    color: #0a2750;
    font-size: 1.8rem;
    margin: 0 0 0.3rem 0;
    font-weight: bold;
}

.company-info p {
    margin: 0.25rem 0;
    color: #666;
}

.company-contact {
    margin-top: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e0e0e0;
}

.contact-info {
    font-size: 0.9rem;
    margin: 0.1rem 0;
    color: #555;
}

.quotation-info {
    text-align: right;
}

.quotation-info h2 {
    color: #0a2750;
    font-size: 2rem;
    margin: 0 0 1rem 0;
    font-weight: bold;
}

.invoice-info p {
    margin: 0.25rem 0;
}

.divider {
    height: 2px;
    background: #0a2750;
    margin: 2rem 0;
}

.section {
    margin-bottom: 2rem;
}

.section h3 {
    color: #0a2750;
    font-size: 1.2rem;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
}

.customer-details p {
    margin: 0.5rem 0;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

.items-table th,
.items-table td {
    padding: 0.75rem;
    border: 1px solid #ddd;
    text-align: left;
}

.items-table th {
    background: #f8f9fa;
    font-weight: bold;
    color: #0a2750;
}

.items-table .text-center {
    text-align: center;
}

.items-table .text-right {
    text-align: right;
}

.items-table .font-bold {
    font-weight: bold;
}

.item-description .item-product {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
}

.totals-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
}

.totals-table {
    width: 300px;
    border-collapse: collapse;
}

.totals-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
}

.totals-table .total-row {
    border-top: 2px solid #0a2750;
}

.totals-table .total-row td {
    padding: 1rem 0.5rem;
    font-size: 1.2rem;
    color: #0a2750;
}

.text-orange {
    color: #f59e0b;
}

.payment-info {
    background: #f0f9ff;
    padding: 1rem;
    border-left: 4px solid #0a2750;
    border-radius: 4px;
}

.payment-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0;
}

.payment-value {
    font-weight: bold;
    color: #0a2750;
}

.notes {
    background: #f8f9fa;
    padding: 1rem;
    border-left: 4px solid #0a2750;
    margin: 1rem 0;
}

.document-footer {
    margin-top: 3rem;
    padding-top: 2rem;
}

.footer-line {
    height: 1px;
    background: #0a2750;
    margin-bottom: 1rem;
}

.footer-text {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0;
}

.footer-validity {
    text-align: center;
    color: #0a2750;
    font-size: 1rem;
    margin: 1rem 0 0 0;
}

/* Print styles */
@media print {
    .no-print {
        display: none !important;
    }
    
    .pdf-viewer {
        background: white;
    }
    
    .invoice-document {
        box-shadow: none;
        border-radius: 0;
    }
    
    .items-table {
        page-break-inside: avoid;
    }
    
    .section {
        page-break-inside: avoid;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .document-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .invoice-info {
        text-align: left;
    }
    
    .invoice-document {
        padding: 1rem;
    }
    
    .company-info h1 {
        font-size: 2rem;
    }
    
    .invoice-info h2 {
        font-size: 1.5rem;
    }
    
    .items-table {
        font-size: 0.9rem;
    }
    
    .items-table th,
    .items-table td {
        padding: 0.5rem;
    }
}
</style>