<script setup>
import PenaltyTicketSaleService from '@/service/PenaltyTicketSaleService';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);
const saleData = ref(null);

const saleId = computed(() => parseInt(route.params.id));

const getData = async () => {
    loading.value = true;
    try {
        const response = await PenaltyTicketSaleService.getPenaltyTicketSaleById(saleId.value);
        saleData.value = response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao carregar venda de multa', 
            life: 3000 
        });
        router.push('/transport/penalty-ticket-sales');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.back();
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="grid" v-if="loading">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>
    
    <div class="grid" v-else-if="saleData">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes da Venda de Multa</h5>
                    <div class="flex gap-2">
                        <Button label="Voltar" @click="goBack" severity="secondary">
                            <i class="pi pi-arrow-left"></i>
                        </Button>
                    </div>
                </div>

                <div class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações Básicas</h6>
                            
                            <div class="field mb-3">
                                <label class="font-medium text-900">ID da Venda:</label>
                                <div class="mt-1">{{ saleData.id }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Sessão:</label>
                                <div class="mt-1">
                                    <Tag :value="`Sessão #${saleData.session_id}`" severity="info" />
                                </div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Operador:</label>
                                <div class="mt-1 font-medium">{{ saleData.operator?.name || '-' }}</div>
                                <div class="text-sm text-600">{{ saleData.operator?.email || '' }}</div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Data de Venda:</label>
                                <div class="mt-1">{{ moment(saleData.sold_at).format('DD/MM/YYYY HH:mm:ss') }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações Financeiras -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações Financeiras</h6>
                            
                            <div class="field mb-3">
                                <label class="font-medium text-900">Preço da Multa:</label>
                                <div class="mt-1 text-orange-600 font-semibold">
                                    {{ Number(saleData.penalty_price_at_sale).toFixed(2) }} MT
                                </div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Quantidade:</label>
                                <div class="mt-1">
                                    <Tag :value="saleData.quantity" severity="warning" />
                                </div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Total:</label>
                                <div class="mt-1 text-orange-700 font-bold text-2xl">
                                    {{ Number(saleData.total).toFixed(2) }} MT
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações de Rota e Bilhete -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Rota e Bilhete</h6>
                            
                            <div class="field mb-3" v-if="saleData.route">
                                <label class="font-medium text-900">Rota:</label>
                                <div class="mt-1 font-medium">{{ saleData.route.name }}</div>
                                <div class="text-sm text-600">{{ saleData.route.origin }} → {{ saleData.route.destination }}</div>
                            </div>

                            <div class="field mb-3" v-if="saleData.routeTicket">
                                <label class="font-medium text-900">Tipo de Bilhete:</label>
                                <div class="mt-1">
                                    <div class="font-medium">{{ saleData.routeTicket.ticketType?.name || '-' }}</div>
                                    <div class="text-sm text-600">Código: {{ saleData.routeTicket.ticketType?.code || '-' }}</div>
                                </div>
                            </div>

                            <div class="field mb-0" v-if="saleData.routeTicket">
                                <label class="font-medium text-900">Preços do Bilhete:</label>
                                <div class="mt-1">
                                    <div class="text-sm">Preço Normal: {{ Number(saleData.routeTicket.price).toFixed(2) }} MT</div>
                                    <div class="text-sm text-orange-600">Preço Multa: {{ Number(saleData.routeTicket.penalty_price).toFixed(2) }} MT</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações Adicionais -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações Adicionais</h6>
                            
                            <div class="field mb-3" v-if="saleData.driver">
                                <label class="font-medium text-900">Motorista:</label>
                                <div class="mt-1">
                                    <div class="font-medium">{{ saleData.driver.name }}</div>
                                    <div class="text-sm text-600" v-if="saleData.driver.mobile">
                                        <i class="pi pi-phone mr-1"></i>{{ saleData.driver.mobile }}
                                    </div>
                                </div>
                            </div>

                            <div class="field mb-3" v-if="saleData.customer_number">
                                <label class="font-medium text-900">Número do Cliente:</label>
                                <div class="mt-1">
                                    <Tag :value="saleData.customer_number" severity="secondary" />
                                </div>
                            </div>

                            <div class="field mb-3" v-if="saleData.ticketSale">
                                <label class="font-medium text-900">Venda Original:</label>
                                <div class="mt-1">
                                    <router-link :to="'/transport/ticket-sales/' + saleData.ticketSale.id">
                                        <Tag :value="`Venda #${saleData.ticketSale.id}`" severity="info" class="cursor-pointer" />
                                    </router-link>
                                    <div class="text-sm text-600 mt-1">
                                        {{ moment(saleData.ticketSale.sold_at).format('DD/MM/YYYY HH:mm') }}
                                    </div>
                                </div>
                            </div>

                            <div class="field mb-0" v-if="saleData.notes">
                                <label class="font-medium text-900">Observações:</label>
                                <div class="mt-1">{{ saleData.notes }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações de Auditoria -->
                    <div class="col-12">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações de Auditoria</h6>
                            
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field mb-3">
                                        <label class="font-medium text-900">Criado por:</label>
                                        <div class="mt-1">{{ saleData.createdBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Data de Criação:</label>
                                        <div class="mt-1">{{ moment(saleData.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Última Atualização:</label>
                                        <div class="mt-1">{{ moment(saleData.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
