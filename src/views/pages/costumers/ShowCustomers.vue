<script setup>
import CustomerService from '@/service/CustomerService';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const route = useRoute();
const toast = useToast();
const loading = ref(false);
const customer = ref({});

// Funcionalidade de impressão
const showCardDialog = ref(false);
const savedCustomer = ref({});

const getId = async () => {
    loading.value = true;
    try {
        const response = await CustomerService.getCustomerById(route.params.id);
        customer.value = response;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar cliente', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const printCard = () => {
    savedCustomer.value = customer.value;
    showCardDialog.value = true;
};

const printCustomerCard = () => {
    const printContents = document.getElementById('customer-card-content').innerHTML;
    const printWindow = window.open('', '', 'height=400,width=600');

    printWindow.document.write(`
        <html>
        <head>
            <title>Cartão de Cliente - ${savedCustomer.value.name}</title>
            <style>
                @page {
                    size: 85.60mm 53.98mm;
                    margin: 2mm;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    width: 85.60mm;
                    height: 53.98mm;
                    overflow: hidden;
                }
                
                .card {
                    width: 100%;
                    height: 100%;
                    padding: 8px;
                    box-sizing: border-box;
                    position: relative;
                    border-radius: 8px;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 6px;
                    border-bottom: 1px solid rgba(255,255,255,0.3);
                    padding-bottom: 4px;
                }
                
                .company-name {
                    font-size: 14px;
                    font-weight: bold;
                    margin: 0;
                }
                
                .card-title {
                    font-size: 8px;
                    margin: 2px 0 0 0;
                    opacity: 0.9;
                }
                
                .content {
                    display: flex;
                    gap: 8px;
                    height: calc(100% - 40px);
                }
                
                .left-section {
                    flex: 1;
                }
                
                .right-section {
                    width: 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    padding: 4px;
                }
                
                .customer-info {
                    margin-bottom: 3px;
                }
                
                .customer-name {
                    font-size: 12px;
                    font-weight: bold;
                    margin: 0 0 2px 0;
                }
                
                .customer-number {
                    font-size: 10px;
                    opacity: 0.9;
                    margin: 0 0 4px 0;
                }
                
                .customer-details {
                    font-size: 8px;
                    line-height: 1.2;
                    opacity: 0.8;
                }
                
                .customer-details div {
                    margin: 1px 0;
                }
                
                .ticket-type {
                    text-align: center;
                }
                
                .ticket-badge {
                    background: rgba(255,255,255,0.2);
                    padding: 4px 6px;
                    border-radius: 12px;
                    font-size: 8px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    border: 1px solid rgba(255,255,255,0.3);
                }
                
                .qr-placeholder {
                    width: 35px;
                    height: 35px;
                    background: white;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                    font-size: 6px;
                    text-align: center;
                }
                
                .footer {
                    position: absolute;
                    bottom: 2px;
                    left: 8px;
                    right: 8px;
                    text-align: center;
                    font-size: 6px;
                    opacity: 0.7;
                    border-top: 1px solid rgba(255,255,255,0.2);
                    padding-top: 2px;
                }
                
                @media print {
                    body { margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
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
                    <h5 class="m-0">Detalhes do Cliente</h5>
                    <div class="flex gap-2">
                        <Button icon="pi pi-print" label="Imprimir Cartão" @click="printCard" class="p-button-success" v-if="!loading" />
                        <router-link :to="'/costumers/' + route.params.id + '/edit'">
                            <Button icon="pi pi-pencil" label="Editar" class="p-button-outlined" />
                        </router-link>
                        <router-link to="/costumers">
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
                            <h6 class="text-primary mb-3">Informações Pessoais</h6>
                            
                            <div class="field">
                                <label class="font-medium">Número do Cliente:</label>
                                <p class="mt-1 font-bold text-primary">{{ customer.customer_number }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Nome Completo:</label>
                                <p class="mt-1">{{ customer.name }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Email:</label>
                                <p class="mt-1">{{ customer.email }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Celular:</label>
                                <p class="mt-1">{{ customer.mobile }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">NUIT:</label>
                                <p class="mt-1">{{ customer.nuit }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Informações do Bilhete -->
                    <div class="col-12 md:col-6">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações do Bilhete</h6>
                            
                            <div class="field" v-if="customer.ticketType">
                                <label class="font-medium">Tipo de Bilhete:</label>
                                <div class="mt-1">
                                    <Tag :value="customer.ticketType.code" severity="info" class="mr-2" />
                                    <span class="font-medium">{{ customer.ticketType.name }}</span>
                                </div>
                                <p class="mt-1 text-600" v-if="customer.ticketType.description">
                                    {{ customer.ticketType.description }}
                                </p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Status do Tipo:</label>
                                <div class="mt-1">
                                    <Tag v-if="customer.ticketType" :value="customer.ticketType.is_active ? 'Ativo' : 'Inativo'" :severity="customer.ticketType.is_active ? 'success' : 'danger'" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Auditoria -->
                    <div class="col-12">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações de Auditoria</h6>
                            
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium">Registrado em:</label>
                                        <p class="mt-1">{{ moment(customer.createdAt).format('DD/MM/YYYY HH:mm') }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium">Última atualização:</label>
                                        <p class="mt-1">{{ moment(customer.updatedAt).format('DD/MM/YYYY HH:mm') }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium">ID:</label>
                                        <p class="mt-1">#{{ customer.id }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Impressão do Cartão -->
    <Dialog v-model:visible="showCardDialog" header="Visualizar Cartão do Cliente" :modal="true" :style="{ width: '500px' }">
        <div id="customer-card-content" class="card">
            <div class="header">
                <h1 class="company-name">TMB TRANSPORTE</h1>
                <p class="card-title">CARTÃO DE IDENTIFICAÇÃO</p>
            </div>
            
            <div class="content">
                <div class="left-section">
                    <div class="customer-info">
                        <h2 class="customer-name">{{ savedCustomer.name }}</h2>
                        <p class="customer-number">Nº {{ savedCustomer.customer_number }}</p>
                        
                        <div class="customer-details">
                            <div><strong>Email:</strong> {{ savedCustomer.email }}</div>
                            <div><strong>Celular:</strong> {{ savedCustomer.mobile }}</div>
                            <div v-if="savedCustomer.nuit"><strong>NUIT:</strong> {{ savedCustomer.nuit }}</div>
                            <div><strong>Desde:</strong> {{ moment(savedCustomer.createdAt).format('MM/YYYY') }}</div>
                        </div>
                    </div>
                </div>
                
                <div class="right-section">
                    <div class="ticket-type">
                        <div class="ticket-badge" v-if="savedCustomer.ticketType">
                            {{ savedCustomer.ticketType.code }}
                        </div>
                        <div class="qr-placeholder">QR CODE</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">Válido para identificação no transporte público • ID: {{ savedCustomer.id }}</div>
        </div>
        
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="showCardDialog = false" class="p-button-text" />
            <Button label="Imprimir" icon="pi pi-print" @click="printCustomerCard" class="p-button-success" />
        </template>
    </Dialog>
</template>
