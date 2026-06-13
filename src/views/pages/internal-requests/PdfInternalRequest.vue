<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InternalRequestService from '@/service/InternalRequestService';
import { getFormattedOrganizationInfo } from '@/utils/organizationUtils';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// Estado do componente
const request = ref(null);
const isLoading = ref(true);
const isGeneratingPdf = ref(false);
const pdfUrl = ref(null);
const pdfApiAvailable = ref(true);

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
    return InternalRequestService.getStatusLabel(status);
};

const getPriorityLabel = (priority) => {
    return InternalRequestService.getPriorityLabel(priority);
};

// Métodos
const loadRequest = async () => {
    try {
        isLoading.value = true;
        const response = await InternalRequestService.getInternalRequest(route.params.id);
        request.value = response;
    } catch (error) {
        console.error('Erro ao carregar requisição:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar requisição',
            life: 3000
        });
        router.push('/internal-requests');
    } finally {
        isLoading.value = false;
    }
};

const generatePdf = async () => {
    try {
        isGeneratingPdf.value = true;
        const pdfBlob = await InternalRequestService.generatePdf(request.value.id);
        
        // Criar URL do blob para visualização
        const url = window.URL.createObjectURL(pdfBlob);
        pdfUrl.value = url;
        pdfApiAvailable.value = true;
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'PDF gerado com sucesso',
            life: 3000
        });
    } catch (error) {
        console.error('API de PDF não disponível:', error.message);
        pdfApiAvailable.value = false;
        toast.add({
            severity: 'info',
            summary: 'Visualização HTML',
            detail: 'PDF será exibido em formato HTML para impressão.',
            life: 4000
        });
    } finally {
        isGeneratingPdf.value = false;
    }
};

const downloadPdf = async () => {
    if (!pdfApiAvailable.value) {
        // Usar impressão como alternativa quando PDF não disponível
        window.print();
        toast.add({
            severity: 'info',
            summary: 'Impressão',
            detail: 'Use Ctrl+P ou Cmd+P para salvar como PDF',
            life: 4000
        });
        return;
    }
    
    try {
        const pdfBlob = await InternalRequestService.generatePdf(request.value.id);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Requisicao-Interna-${request.value.request_number}.pdf`;
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
        pdfApiAvailable.value = false;
        // Fallback para impressão
        window.print();
        toast.add({
            severity: 'info',
            summary: 'Impressão',
            detail: 'PDF não disponível. Use Ctrl+P para salvar como PDF',
            life: 4000
        });
    }
};

const printPdf = async () => {
    try {
        // Capturar elemento do documento
        const documentElement = document.querySelector('#request-document');
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
                    <title>Requisição Interna - ${request.value?.request_number || ''}</title>
                    ${allStyles}
                    <style>
                        body { 
                            margin: 0; 
                            padding: 0.8cm; 
                            font-family: Arial, sans-serif;
                            background: white;
                            color: #333;
                        }
                        .request-document {
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
    router.push(`/internal-requests/${route.params.id}`);
};

onMounted(async () => {
    await loadRequest();
    // Verificar se API de PDF está disponível silenciosamente
    if (request.value) {
        try {
            await InternalRequestService.generatePdf(request.value.id);
            pdfApiAvailable.value = true;
        } catch (error) {
            pdfApiAvailable.value = false;
        }
    }
});
</script>

<template>
    <div class="pdf-viewer">
        <!-- Loading State -->
        <div v-if="isLoading" class="card">
            <div class="text-center p-6">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="mt-3">Carregando requisição...</p>
            </div>
        </div>

        <!-- PDF Controls -->
        <div v-else class="no-print mb-3">
            <div class="flex justify-content-between align-items-center p-3 bg-white border-round shadow-1">
                <div class="flex align-items-center gap-2">
                    <Button icon="pi pi-arrow-left" class="p-button-text" @click="goBack" v-tooltip="'Voltar'" />
                    <h5 class="m-0">PDF - Requisição {{ request?.request_number }}</h5>
                </div>

                <div class="flex gap-2">
                    <Button v-if="pdfApiAvailable" label="Gerar PDF" icon="pi pi-refresh" class="p-button-outlined" :loading="isGeneratingPdf" @click="generatePdf" />
                    <Button
                        :label="pdfApiAvailable ? 'Baixar PDF' : 'Salvar como PDF'"
                        :icon="pdfApiAvailable ? 'pi pi-download' : 'pi pi-print'"
                        class="p-button-outlined"
                        @click="downloadPdf"
                        :title="pdfApiAvailable ? 'Baixar arquivo PDF' : 'Usar impressão do navegador para salvar como PDF'"
                    />
                    <Button label="Imprimir" icon="pi pi-print" @click="printPdf" />
                </div>
            </div>
        </div>

        <!-- Info message when PDF API is not available -->
        <!-- <div v-if="!pdfApiAvailable && request" class="no-print mb-3">
            <Message severity="info" :closable="false">
                <div class="flex align-items-center">
                    <i class="pi pi-info-circle mr-2"></i>
                    <span>Visualização HTML ativa. Use "Imprimir" ou "Salvar como PDF" para gerar o documento.</span>
                </div>
            </Message>
        </div> -->

        <!-- PDF Viewer or HTML Preview -->
        <div v-if="request" class="pdf-content">
            <!-- PDF Embedded Viewer -->
            <div v-if="pdfUrl" class="pdf-embed no-print">
                <iframe :src="pdfUrl" width="100%" height="800px" style="border: none; border-radius: 6px"></iframe>
            </div>

            <!-- HTML Preview (fallback) -->
            <div v-else class="pdf-preview">
                <div id="request-document" class="request-document">
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
                        <div class="request-info">
                            <h2>REQUISIÇÃO INTERNA</h2>
                            <p><strong>Número:</strong> {{ request.request_number }}</p>
                            <p><strong>Data Requisição:</strong> {{ formatDate(request.request_date) }}</p>
                            <p v-if="request.required_date"><strong>Data Necessária:</strong> {{ formatDate(request.required_date) }}</p>
                            <p><strong>Status:</strong> {{ getStatusLabel(request.status) }}</p>
                            <p><strong>Prioridade:</strong> {{ getPriorityLabel(request.priority) }}</p>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <!-- Request Information -->
                    <div class="section">
                        <h3>INFORMAÇÕES DA REQUISIÇÃO</h3>
                        <div class="request-details">
                            <p><strong>Título:</strong> {{ request.title }}</p>
                            <p v-if="request.requestedByUser"><strong>Solicitante:</strong> {{ request.requestedByUser.name }}</p>
                            <p v-if="request.description"><strong>Descrição:</strong> {{ request.description }}</p>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="section">
                        <h3>ITENS DA REQUISIÇÃO</h3>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Descrição</th>
                                    <th>Qtd</th>
                                    <th>Preço Unit.</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in request.items" :key="index">
                                    <td>{{ index + 1 }}</td>
                                    <td>
                                        <div class="item-description">
                                            <strong>{{ item.description }}</strong>
                                        </div>
                                    </td>
                                    <td class="text-center">{{ item.quantity }}</td>
                                    <td class="text-right">{{ formatCurrency(item.unit_price) }}</td>
                                    <td class="text-right font-bold">{{ formatCurrency(item.total) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Totals -->
                    <div class="section">
                        <div class="totals-section">
                            <table class="totals-table">
                                <tbody>
                                    <tr class="total-row">
                                        <td><strong>TOTAL GERAL:</strong></td>
                                        <td class="text-right">
                                            <strong>{{ formatCurrency(request.total) }}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Approval Information -->
                    <div v-if="request.status !== 'pending'" class="section">
                        <h3>INFORMAÇÕES DE APROVAÇÃO</h3>
                        <div class="approval-info">
                            <div class="approval-row">
                                <span><strong>Status:</strong></span>
                                <span class="approval-value">{{ getStatusLabel(request.status) }}</span>
                            </div>
                            <div v-if="request.approved_date" class="approval-row">
                                <span><strong>Data de Aprovação:</strong></span>
                                <span>{{ formatDate(request.approved_date) }}</span>
                            </div>
                            <div v-if="request.rejected_date" class="approval-row">
                                <span><strong>Data de Rejeição:</strong></span>
                                <span>{{ formatDate(request.rejected_date) }}</span>
                            </div>
                            <div v-if="request.rejection_reason" class="approval-row">
                                <span><strong>Motivo da Rejeição:</strong></span>
                                <span class="rejection-reason">{{ request.rejection_reason }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div v-if="request.notes" class="section">
                        <h3>OBSERVAÇÕES</h3>
                        <p class="notes">{{ request.notes }}</p>
                    </div>

                    <!-- Footer -->
                    <div class="document-footer">
                        <div class="footer-line"></div>
                        <p class="footer-text">
                            Requisição gerada automaticamente pelo sistema {{ organizationInfo.title }} em {{ formatDate(new Date()) }}
                            <span v-if="!pdfApiAvailable" class="html-mode-indicator"> • Modo HTML</span>
                        </p>
                        <p class="footer-validity" v-if="request.required_date && request.status === 'pending'">
                            <strong>Esta requisição é necessária até {{ formatDate(request.required_date) }}</strong>
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.request-document {
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

.request-info {
    text-align: right;
}

.request-info h2 {
    color: #0a2750;
    font-size: 1.5rem;
    margin: 0 0 0.8rem 0;
    font-weight: bold;
}

.request-info p {
    margin: 0.25rem 0;
}

.divider {
    height: 2px;
    background: #0a2750;
    margin: 1.5rem 0;
}

.section {
    margin-bottom: 1.5rem;
}

.section h3 {
    color: #0a2750;
    font-size: 1.2rem;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
}

.request-details p {
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

.item-description {
    font-weight: 500;
}

.totals-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.5rem;
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

.approval-info {
    background: #f0f9ff;
    padding: 1rem;
    border-left: 4px solid #0a2750;
    border-radius: 4px;
}

.approval-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0;
}

.approval-value {
    font-weight: bold;
    color: #0a2750;
}

.rejection-reason {
    color: #dc2626;
    font-style: italic;
    max-width: 60%;
    text-align: right;
}

.notes {
    background: #f8f9fa;
    padding: 1rem;
    border-left: 4px solid #0a2750;
    margin: 1rem 0;
}

.document-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
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

.html-mode-indicator {
    color: #0a2750;
    font-weight: 500;
    font-size: 0.85em;
}

/* Print styles - aplicados quando documento é impresso na janela principal */
@media print {
    .no-print {
        display: none !important;
    }
    
    .pdf-viewer {
        background: white;
    }
    
    .request-document {
        box-shadow: none;
        border-radius: 0;
        margin: 0;
        padding: 0;
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
    
    .request-info {
        text-align: left;
    }
    
    .request-document {
        padding: 1rem;
    }
    
    .company-info h1 {
        font-size: 2rem;
    }
    
    .request-info h2 {
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
