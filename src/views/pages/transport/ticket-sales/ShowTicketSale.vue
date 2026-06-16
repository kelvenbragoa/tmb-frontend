<script setup>
import TicketSaleService from '@/service/TicketSaleService';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const route = useRoute();
const toast = useToast();
const loading = ref(false);
const ticketSale = ref({});

// Funcionalidade de impressão
const showReceiptDialog = ref(false);
const savedSale = ref({});

const getId = async () => {
    loading.value = true;
    try {
        const response = await TicketSaleService.getTicketSaleById(route.params.id);
        ticketSale.value = response;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar venda', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const printTicket = () => {
    savedSale.value = ticketSale.value;
    showReceiptDialog.value = true;
};

const printReceipt = () => {
    const printContents = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=400');

    printWindow.document.write(`
        <html>
        <head>
            <title>Recibo - Bilhete de Transporte</title>
            <style>
            @page {
                    size: 400px 600px;
                    margin: 10px;
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    margin: 0;
                    padding: 0;
                    width: 380px;
                    line-height: 1.2;
                }
              
                .receipt {
                    max-width: 400px;
                    margin: 0 auto;
                }
                .center {
                    text-align: center;
                }
                .brand {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .muted {
                    font-size: 10px;
                    color: #666;
                }
                .divider {
                    border: none;
                    border-top: 1px dashed #000;
                    margin: 5px 0;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 14px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 5px 0;
                }
                th, td {
                    text-align: left;
                    padding: 2px;
                    font-size: 11px;
                }
                .qty, .price, .total {
                    text-align: right;
                }
                .totals .row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                }
                .footer {
                    text-align: center;
                    margin: 10px 0;
                }
                small {
                    font-size: 8px;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${printContents}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
};

onMounted(() => getId());
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes da Venda de Bilhete</h5>
                    <div class="flex gap-2">
                        <Button icon="pi pi-print" label="Imprimir Ticket" @click="printTicket" class="p-button-success" v-if="!loading" />
                        <router-link to="/transport/ticket-sales">
                            <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-text" />
                        </router-link>
                    </div>
                </div>

                <div v-if="loading" class="flex justify-content-center">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <div v-else class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12 md:col-6">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações da Venda</h6>
                            
                            <div class="field">
                                <label class="font-medium">Operador:</label>
                                <p class="mt-1">{{ ticketSale.operator?.name }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Data/Hora da Venda:</label>
                                <p class="mt-1">{{ moment(ticketSale.sold_at).format('DD/MM/YYYY HH:mm:ss') }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Quantidade:</label>
                                <p class="mt-1">{{ ticketSale.quantity }} bilhetes</p>
                            </div>
                            <div class="field">
                                <label class="font-medium">Referência:</label>
                                <p class="mt-1">{{ ticketSale.reference }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Preço na Venda:</label>
                                <p class="mt-1 text-primary font-medium">{{ formatCurrency(ticketSale.price_at_sale) }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Total:</label>
                                <p class="mt-1 text-green-500 font-bold text-xl">{{ formatCurrency(ticketSale.total) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Informações do Cliente -->
                    <div class="col-12 md:col-6" v-if="ticketSale.customer">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações do Cliente</h6>
                            
                            <div class="field">
                                <label class="font-medium">Número do Cliente:</label>
                                <p class="mt-1 font-bold text-primary">{{ ticketSale.customer.customer_number }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Nome:</label>
                                <p class="mt-1">{{ ticketSale.customer.name }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Email:</label>
                                <p class="mt-1">{{ ticketSale.customer.email }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Celular:</label>
                                <p class="mt-1">{{ ticketSale.customer.mobile }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Tipo de Cliente:</label>
                                <div class="mt-1">
                                    <Tag :value="ticketSale.customer.ticketType?.code" severity="success" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações da Rota e Bilhete -->
                    <div class="col-12 md:col-6">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações do Bilhete</h6>
                            
                            <div class="field">
                                <label class="font-medium">Rota:</label>
                                <p class="mt-1">{{ ticketSale.route?.name }}</p>
                                <small class="text-600">{{ ticketSale.route?.origin }} → {{ ticketSale.route?.destination }}</small>
                            </div>

                            <div class="field">
                                <label class="font-medium">Tipo de Bilhete:</label>
                                <div class="mt-1">
                                    <Tag :value="ticketSale.routeTicket?.ticketType?.code" severity="info" class="mr-2" />
                                    <span>{{ ticketSale.routeTicket?.ticketType?.name }}</span>
                                </div>
                            </div>

                            <div class="field">
                                <label class="font-medium">Paragens:</label>
                                <p class="mt-1"><strong>Origem:</strong> {{ ticketSale.originRouteStop?.name }}</p>
                                <p class="mt-1"><strong>Destino:</strong> {{ ticketSale.destinationRouteStop?.name }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Preço Original:</label>
                                <p class="mt-1">{{ formatCurrency(ticketSale.routeTicket?.price) }}</p>
                            </div>

                            <div class="field" v-if="ticketSale.routeTicket?.ticketType?.description">
                                <label class="font-medium">Descrição do Tipo:</label>
                                <p class="mt-1 text-600">{{ ticketSale.routeTicket.ticketType.description }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Auditoria -->
                    <div class="col-12">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações de Auditoria</h6>
                            
                            <div class="grid">
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium">Criado em:</label>
                                        <p class="mt-1">{{ moment(ticketSale.created_at).format('DD/MM/YYYY HH:mm') }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium">Atualizado em:</label>
                                        <p class="mt-1">{{ moment(ticketSale.updated_at).format('DD/MM/YYYY HH:mm') }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium">ID:</label>
                                        <p class="mt-1">#{{ ticketSale.id }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Impressão -->
    <Dialog v-model:visible="showReceiptDialog" header="Visualizar Recibo" :modal="true" :style="{ width: '500px' }">
        <div id="receipt-content" class="receipt">
            <div class="center">
                <div class="brand">TMB - TRANSPORTE</div>
                <div class="muted">Sistema de Bilhetes de Transporte</div>
            </div>
            
            <hr class="divider">
            
            <div class="section-title center">BILHETE DE TRANSPORTE</div>
            
            <hr class="divider">
            
            <table>
                <tbody>
                    <tr>
                        <td><strong>Ticket ID:</strong></td>
                        <td class="total">#{{ savedSale.id }}</td>
                    </tr>
                    <tr>
                        <td><strong>Data/Hora:</strong></td>
                        <td class="total">{{ moment(savedSale.sold_at).format('DD/MM/YYYY HH:mm') }}</td>
                    </tr>
                    <tr>
                        <td><strong>Operador:</strong></td>
                        <td class="total">{{ savedSale.operator?.name }}</td>
                    </tr>
                </tbody>
            </table>
            
            <hr class="divider" />
            
            <div class="section-title">DETALHES DA VIAGEM</div>
            
            <table>
                <tbody>
                    <tr>
                        <td><strong>Rota:</strong></td>
                        <td class="total">{{ savedSale.route?.name }}</td>
                    </tr>
                    <tr>
                        <td><strong>Origem:</strong></td>
                        <td class="total">{{ savedSale.route?.origin }}</td>
                    </tr>
                    <tr>
                        <td><strong>Destino:</strong></td>
                        <td class="total">{{ savedSale.route?.destination }}</td>
                    </tr>
                    <tr>
                        <td><strong>Tipo de Bilhete:</strong></td>
                        <td class="total">{{ savedSale.routeTicket?.ticketType?.name }}</td>
                    </tr>
                </tbody>
            </table>
            
            <hr class="divider" />
            
            <div class="section-title">CLIENTE</div>
            
            <table v-if="savedSale.customer">
                <tbody>
                    <tr>
                        <td><strong>Nº Cliente:</strong></td>
                        <td class="total">{{ savedSale.customer.customer_number }}</td>
                    </tr>
                    <tr>
                        <td><strong>Nome:</strong></td>
                        <td class="total">{{ savedSale.customer.name }}</td>
                    </tr>
                    <tr>
                        <td><strong>Tipo:</strong></td>
                        <td class="total">{{ savedSale.customer.ticketType?.name }}</td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="center muted">Cliente não identificado</div>
            
            <hr class="divider" />
            
            <div class="section-title">VALORES</div>
            
            <table>
                <tbody>
                    <tr>
                        <td><strong>Quantidade:</strong></td>
                        <td class="total">{{ savedSale.quantity }} bilhetes</td>
                    </tr>
                    <tr>
                        <td><strong>Preço Unitário:</strong></td>
                        <td class="total">{{ formatCurrency(savedSale.price_at_sale) }}</td>
                    </tr>
                    <tr style="border-top: 1px solid #000">
                        <td><strong>TOTAL:</strong></td>
                        <td class="total">
                            <strong>{{ formatCurrency(savedSale.total) }}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <hr class="divider" />
            
            <div class="footer">
                <div class="muted">Obrigado por utilizar nossos serviços!</div>
                <div class="muted">Guarde este bilhete durante toda a viagem</div>
                <small>{{ moment().format('DD/MM/YYYY HH:mm:ss') }} - Sistema TMB</small>
            </div>
        </div>
        
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="showReceiptDialog = false" class="p-button-text" />
            <Button label="Imprimir" icon="pi pi-print" @click="printReceipt" class="p-button-success" />
        </template>
    </Dialog>
</template>