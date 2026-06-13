<script setup>
import RouteTicketService from '@/service/RouteTicketService';
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => {
    router.back();
};

const route = useRoute();
const toast = useToast();
const loading = ref(false);
const routeTicket = ref({});

const getId = async () => {
    loading.value = true;
    try {
        const response = await RouteTicketService.getRouteTicketById(route.params.id);
        routeTicket.value = response;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar bilhete da rota', life: 3000 });
    } finally {
        loading.value = false;
    }
};



const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

onMounted(() => getId());
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes do Bilhete da Rota</h5>
                    <div class="flex gap-2">
                        <router-link :to="'/transport/route-tickets/' + route.params.id + '/edit'">
                            <Button icon="pi pi-pencil" label="Editar" class="p-button-outlined" />
                        </router-link>
                        <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-text" @click="goBack" />
                    </div>
                </div>

                <div v-if="loading" class="flex justify-content-center">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <div v-else class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12 md:col-6">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações do Bilhete</h6>
                            
                            <div class="field">
                                <label class="font-medium">Preço:</label>
                                <p class="mt-1 text-primary font-bold text-xl">{{ formatCurrency(routeTicket.price) }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Preço de Multa:</label>
                                <p class="mt-1 text-primary font-bold text-xl">{{ formatCurrency(routeTicket.penalty_price) }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Tipo de Bilhete:</label>
                                <div class="mt-1">
                                    <Tag :value="routeTicket.ticketType?.code" severity="info" class="mr-2" />
                                    <span class="font-medium">{{ routeTicket.ticketType?.name }}</span>
                                </div>
                                <p class="mt-1 text-600" v-if="routeTicket.ticketType?.description">
                                    {{ routeTicket.ticketType.description }}
                                </p>
                            </div>

                            <div class="field" v-if="routeTicket.ticketType?.status">
                                <label class="font-medium">Status do Tipo:</label>
                                <div class="mt-1">
                                    <Tag :value="routeTicket.ticketType.status === 'active' ? 'Ativo' : 'Inativo'" :severity="routeTicket.ticketType.status === 'active' ? 'success' : 'danger'" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações da Rota -->
                    <div class="col-12 md:col-6">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações da Rota</h6>
                            
                            <div class="field">
                                <label class="font-medium">Nome da Rota:</label>
                                <p class="mt-1 font-medium">{{ routeTicket.route?.name }}</p>
                            </div>

                            <div class="field">
                                <label class="font-medium">Percurso:</label>
                                <p class="mt-1">
                                    <span class="font-medium">{{ routeTicket.route?.origin }}</span>
                                    <i class="pi pi-arrow-right mx-2 text-600"></i>
                                    <span class="font-medium">{{ routeTicket.route?.destination }}</span>
                                </p>
                            </div>

                            <div class="field" v-if="routeTicket.route?.distance">
                                <label class="font-medium">Distância:</label>
                                <p class="mt-1">{{ routeTicket.route.distance }} km</p>
                            </div>

                            <div class="field" v-if="routeTicket.route?.estimated_duration">
                                <label class="font-medium">Duração Estimada:</label>
                                <p class="mt-1">{{ routeTicket.route.estimated_duration }} minutos</p>
                            </div>

                            <div class="field" v-if="routeTicket.route?.description">
                                <label class="font-medium">Descrição da Rota:</label>
                                <p class="mt-1 text-600">{{ routeTicket.route.description }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Vendas Relacionadas -->
                    <div class="col-12" v-if="routeTicket.ticketSales && routeTicket.ticketSales.length > 0">
                        <div class="card">
                            <h6 class="text-primary mb-3">Vendas Relacionadas</h6>
                            
                            <DataTable :value="routeTicket.ticketSales" showGridlines>
                                <Column header="Operador">
                                    <template #body="{ data }">
                                        {{ data.operator?.name }}
                                    </template>
                                </Column>

                                <Column header="Quantidade">
                                    <template #body="{ data }">
                                        {{ data.quantity }}
                                    </template>
                                </Column>

                                <Column header="Preço na Venda">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.price_at_sale) }}
                                    </template>
                                </Column>

                                <Column header="Total">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.total) }}
                                    </template>
                                </Column>

                                <Column header="Data da Venda">
                                    <template #body="{ data }">
                                        {{ moment(data.sold_at).format('DD/MM/YYYY HH:mm') }}
                                    </template>
                                </Column>

                                <Column header="Ações">
                                    <template #body="{ data }">
                                        <router-link :to="'/transport/ticket-sales/' + data.id">
                                            <Button icon="pi pi-eye" class="p-button-text p-button-sm" v-tooltip.top="'Ver Detalhes'" />
                                        </router-link>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Auditoria -->
                    <div class="col-12">
                        <div class="card">
                            <h6 class="text-primary mb-3">Informações de Auditoria</h6>
                            
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium">Criado em:</label>
                                        <p class="mt-1">{{ moment(routeTicket.created_at).format('DD/MM/YYYY HH:mm') }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium">Atualizado em:</label>
                                        <p class="mt-1">{{ moment(routeTicket.updated_at).format('DD/MM/YYYY HH:mm') }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium">ID:</label>
                                        <p class="mt-1">#{{ routeTicket.id }}</p>
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