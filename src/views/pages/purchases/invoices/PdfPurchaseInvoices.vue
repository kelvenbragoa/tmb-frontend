<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import PurchaseInvoiceService from '@/service/PurchaseInvoiceService';
import { getFormattedOrganizationInfo } from '@/utils/organizationUtils';
import moment from 'moment';

export default {
    name: 'PdfPurchaseInvoices',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const toast = useToast();

        // Estado
        const loading = ref(false);
        const invoice = ref(null);
        const pdfUrl = ref('');
        const showHtmlPreview = ref(false);

        // Métodos
        const loadInvoice = async () => {
            try {
                const response = await PurchaseInvoiceService.getPurchaseInvoiceById(route.params.id);
                invoice.value = response;
            } catch (error) {
                console.error('Erro ao carregar fatura:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar fatura de compra',
                    life: 5000
                });
            }
        };

        const generatePdf = async () => {
            loading.value = true;
            try {
                const pdfBlob = await PurchaseInvoiceService.generatePdf(route.params.id);
                pdfUrl.value = URL.createObjectURL(pdfBlob);
                showHtmlPreview.value = false;
            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                showHtmlPreview.value = true;
                toast.add({
                    severity: 'warn',
                    summary: 'PDF Indisponível',
                    detail: 'Mostrando preview HTML da fatura',
                    life: 3000
                });
            } finally {
                loading.value = false;
            }
        };

        const downloadPdf = async () => {
            if (pdfUrl.value) {
                const link = document.createElement('a');
                link.href = pdfUrl.value;
                link.download = `${invoice.value?.invoice_number || 'fatura-compra'}.pdf`;
                link.click();
            } else {
                await generatePdf();
                if (pdfUrl.value) {
                    downloadPdf();
                }
            }
        };

        const printPdf = async () => {
            if (pdfUrl.value) {
                window.open(pdfUrl.value, '_blank');
                return;
            }
            
            try {
                // Capturar elemento do documento
                const documentElement = document.querySelector('#purchase-invoice-document');
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
                            <title>Fatura de Compra - ${invoice.value?.invoice_number || ''}</title>
                            ${allStyles}
                            <style>
                                body { 
                                    margin: 0; 
                                    padding: 0.8cm; 
                                    font-family: Arial, sans-serif;
                                    background: white;
                                    color: #333;
                                }
                                .html-preview {
                                    max-width: none !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    box-shadow: none !important;
                                    border-radius: 0 !important;
                                    background: white !important;
                                    border: none !important;
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
            router.push({ name: 'purchases.invoices.show', params: { id: route.params.id } });
        };

        const formatDate = (date) => {
            if (!date) return '-';
            return moment(date).format('DD/MM/YYYY');
        };

        const formatCurrency = (value) => {
            if (!value) return 'MZN 0,00';
            return new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN'
            }).format(value);
        };

        const getStatusLabel = (status) => {
            return PurchaseInvoiceService.getPurchaseInvoiceStatusLabel(status);
        };

        const getPaymentTermLabel = (term) => {
            return PurchaseInvoiceService.getPaymentTermLabel(term);
        };

        const calculateLineTotal = (item) => {
            const lineTotal = PurchaseInvoiceService.calculateLineTotal(
                item.quantity,
                item.unit_price,
                item.discount_percentage || 0,
                item.discount_amount || 0
            );
            const taxAmount = PurchaseInvoiceService.calculateLineTax(lineTotal, item.tax_rate || 0);
            return lineTotal + taxAmount;
        };

        // Lifecycle
        onMounted(async () => {
            await loadInvoice();
            await generatePdf();
        });

        return {
            // Estado
            loading,
            invoice,
            pdfUrl,
            showHtmlPreview,
            organizationInfo,

            // Métodos
            generatePdf,
            downloadPdf,
            printPdf,
            goBack,
            formatDate,
            formatCurrency,
            getStatusLabel,
            getPaymentTermLabel,
            calculateLineTotal
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!-- Cabeçalho -->
                <div class="flex align-items-center justify-content-between mb-4">
                    <div class="flex align-items-center gap-3">
                        <Button icon="pi pi-arrow-left" @click="goBack" class="p-button-text" />
                        <div>
                            <h5 class="m-0">{{ invoice?.invoice_number || 'Carregando...' }}</h5>
                            <p class="m-0 text-600">Fatura de Compra - PDF</p>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <Button 
                            label="Gerar PDF" 
                            icon="pi pi-refresh" 
                            @click="generatePdf" 
                            :loading="loading" 
                            class="p-button-outlined" 
                        />
                        <Button 
                            label="Baixar" 
                            icon="pi pi-download" 
                            @click="downloadPdf" 
                            class="p-button-outlined" 
                        />
                        <Button 
                            label="Imprimir" 
                            icon="pi pi-print" 
                            @click="printPdf" 
                        />
                    </div>
                </div>

                <!-- Visualizador PDF -->
                <div v-if="!showHtmlPreview && pdfUrl" class="pdf-container">
                    <iframe 
                        :src="pdfUrl" 
                        width="100%" 
                        height="800px" 
                        frameborder="0"
                        class="border-round"
                    ></iframe>
                </div>

                <!-- Preview HTML (fallback) -->
                <div v-else-if="invoice" id="purchase-invoice-document" class="html-preview border-1 surface-border border-round p-4">
                    <div class="invoice-header text-center mb-4">
                        <h2 class="text-primary mb-2">FATURA DE COMPRA</h2>
                        <h3 class="text-900 mb-0">{{ invoice.invoice_number }}</h3>
                    </div>

                    <!-- Informações da Empresa e Fornecedor -->
                    <div class="grid mb-4">
                        <div class="col-12 md:col-6">
                            <div class="company-info">
                                <h4 class="text-600 mb-2">Para:</h4>
                                <div class="text-900 font-bold">{{ organizationInfo.title }}</div>
                                <div class="text-600">{{ organizationInfo.subtitle }}</div>
                                <div class="text-600">{{ organizationInfo.location }}</div>
                                <div v-if="organizationInfo.contact.length > 0" class="mt-2">
                                    <div v-for="contact in organizationInfo.contact" :key="contact" class="text-600 text-sm">{{ contact }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="supplier-info">
                                <h4 class="text-600 mb-2">De:</h4>
                                <div class="text-900 font-bold">{{ invoice.supplier?.name || '-' }}</div>
                                <div class="text-600">{{ invoice.supplier?.email || '-' }}</div>
                                <div class="text-600">{{ invoice.supplier?.phone || '-' }}</div>
                                <div class="text-600">{{ invoice.supplier?.address || '-' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações da Fatura -->
                    <div class="grid mb-4">
                        <div class="col-12 md:col-6">
                            <table class="w-full">
                                <tr>
                                    <td class="text-600 py-1">Data da Fatura:</td>
                                    <td class="font-medium py-1">{{ formatDate(invoice.invoice_date) }}</td>
                                </tr>
                                <tr>
                                    <td class="text-600 py-1">Data de Vencimento:</td>
                                    <td class="font-medium py-1">{{ formatDate(invoice.due_date) }}</td>
                                </tr>
                                <tr>
                                    <td class="text-600 py-1">Condições de Pagamento:</td>
                                    <td class="font-medium py-1">{{ getPaymentTermLabel(invoice.payment_terms) }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-12 md:col-6">
                            <table class="w-full">
                                <tr>
                                    <td class="text-600 py-1">Status:</td>
                                    <td class="font-medium py-1">{{ getStatusLabel(invoice.status) }}</td>
                                </tr>
                                <tr v-if="invoice.reference_number">
                                    <td class="text-600 py-1">Referência:</td>
                                    <td class="font-medium py-1">{{ invoice.reference_number }}</td>
                                </tr>
                                <tr v-if="invoice.purchase_order">
                                    <td class="text-600 py-1">Purchase Order:</td>
                                    <td class="font-medium py-1">{{ invoice.purchase_order.order_number }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Itens da Fatura -->
                    <div class="mb-4">
                        <h4 class="text-600 mb-3">Itens da Fatura</h4>
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="surface-50">
                                    <th class="text-left p-2 border-1 surface-border">Produto</th>
                                    <th class="text-center p-2 border-1 surface-border">Qtd</th>
                                    <th class="text-center p-2 border-1 surface-border">Unidade</th>
                                    <th class="text-right p-2 border-1 surface-border">Preço Unit.</th>
                                    <th class="text-center p-2 border-1 surface-border">Desc.</th>
                                    <th class="text-center p-2 border-1 surface-border">IVA</th>
                                    <th class="text-right p-2 border-1 surface-border">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in invoice.items" :key="item.id">
                                    <td class="p-2 border-1 surface-border">
                                        <div class="font-medium">{{ item.product?.name || '-' }}</div>
                                        <div v-if="item.description" class="text-sm text-600">{{ item.description }}</div>
                                    </td>
                                    <td class="text-center p-2 border-1 surface-border">{{ item.quantity }}</td>
                                    <td class="text-center p-2 border-1 surface-border">{{ item.unit || 'un' }}</td>
                                    <td class="text-right p-2 border-1 surface-border">{{ formatCurrency(item.unit_price) }}</td>
                                    <td class="text-center p-2 border-1 surface-border">
                                        <span v-if="item.discount_percentage > 0">{{ item.discount_percentage }}%</span>
                                        <span v-else-if="item.discount_amount > 0">{{ formatCurrency(item.discount_amount) }}</span>
                                        <span v-else>-</span>
                                    </td>
                                    <td class="text-center p-2 border-1 surface-border">{{ item.tax_rate || 0 }}%</td>
                                    <td class="text-right p-2 border-1 surface-border font-medium">
                                        {{ formatCurrency(calculateLineTotal(item)) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Totais -->
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div v-if="invoice.notes" class="notes-section">
                                <h4 class="text-600 mb-2">Observações</h4>
                                <div class="p-3 surface-50 border-round">
                                    {{ invoice.notes }}
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="totals-section">
                                <table class="w-full">
                                    <tr>
                                        <td class="text-right py-1">Subtotal:</td>
                                        <td class="text-right font-medium py-1 pl-3">{{ formatCurrency(invoice.subtotal) }}</td>
                                    </tr>
                                    <tr>
                                        <td class="text-right py-1">IVA:</td>
                                        <td class="text-right py-1 pl-3">{{ formatCurrency(invoice.tax_amount) }}</td>
                                    </tr>
                                    <tr v-if="invoice.shipping_cost > 0">
                                        <td class="text-right py-1">Frete:</td>
                                        <td class="text-right py-1 pl-3">{{ formatCurrency(invoice.shipping_cost) }}</td>
                                    </tr>
                                    <tr v-if="invoice.discount_amount > 0">
                                        <td class="text-right py-1">Desconto:</td>
                                        <td class="text-right py-1 pl-3 text-red-500">-{{ formatCurrency(invoice.discount_amount) }}</td>
                                    </tr>
                                    <tr class="border-top-1 surface-border">
                                        <td class="text-right py-2 font-bold text-lg">TOTAL:</td>
                                        <td class="text-right py-2 font-bold text-lg text-primary pl-3">{{ formatCurrency(invoice.total_amount) }}</td>
                                    </tr>
                                </table>

                                <!-- Informações de Pagamento -->
                                <div v-if="invoice.amount_paid > 0" class="mt-3 p-3 surface-100 border-round">
                                    <div class="flex justify-content-between mb-1">
                                        <span class="text-green-600">Valor Pago:</span>
                                        <span class="text-green-600 font-medium">{{ formatCurrency(invoice.amount_paid) }}</span>
                                    </div>
                                    <div v-if="invoice.balance_due > 0" class="flex justify-content-between">
                                        <span class="text-orange-600">Saldo Devedor:</span>
                                        <span class="text-orange-600 font-bold">{{ formatCurrency(invoice.balance_due) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Rodapé -->
                    <div class="text-center mt-6 pt-4 border-top-1 surface-border">
                        <p class="text-600 mb-1">Fatura gerada automaticamente pelo Sistema {{ organizationInfo.title }}</p>
                        <p class="text-600 text-sm">{{ formatDate(new Date()) }}</p>
                    </div>
                </div>

                <!-- Loading -->
                <div v-else class="flex justify-content-center py-8">
                    <ProgressSpinner />
                    <p class="ml-3">Carregando fatura...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pdf-container {
    min-height: 800px;
}

.html-preview {
    background: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.5;
}

.invoice-header {
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 1rem;
}

.company-info,
.supplier-info {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    height: 100%;
}

table {
    border-collapse: collapse;
}

.border-collapse {
    border-collapse: collapse;
}

.totals-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
}

.text-red-500 {
    color: #ef4444;
}

.text-green-600 {
    color: #16a34a;
}

.text-orange-600 {
    color: #ea580c;
}

@media print {
    .card {
        box-shadow: none;
        border: none;
    }
    
    .html-preview {
        margin: 0;
        padding: 0;
    }
}
</style>