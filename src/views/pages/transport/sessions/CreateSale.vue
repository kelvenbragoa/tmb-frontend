<script setup>
import TicketSaleService from '@/service/TicketSaleService';
import CustomerService from '@/service/CustomerService';
import RouteService from '@/service/RouteService';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const sessionId = route.params.sessionId;

const saleForm = ref({
    route_ticket_id: '',
    quantity: 1,
    notes: '',
    customer_id: null,
    customer_number: ''
});

const routeTickets = ref([]);
const searchingCustomer = ref(false);
const customerFound = ref(null);
const customerSearchTimeout = ref(null);

const getRouteTickets = async () => {
    try {
        // Assumindo que temos a rota da sessão
        const response = await RouteService.getRouteTickets(route.params.routeId);
        routeTickets.value = response.map((ticket) => ({
            label: `${ticket.ticketType.name} (${ticket.ticketType.code}) - ${formatCurrency(ticket.price)}`,
            value: ticket.id,
            price: ticket.price
        }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar bilhetes', life: 3000 });
    }
};

const searchCustomer = async () => {
    if (!saleForm.value.customer_number || saleForm.value.customer_number.length < 3) {
        customerFound.value = null;
        saleForm.value.customer_id = null;
        return;
    }

    searchingCustomer.value = true;
    try {
        const response = await CustomerService.getCustomerByNumber(saleForm.value.customer_number);
        customerFound.value = response;
        saleForm.value.customer_id = response.id;
    } catch (error) {
        customerFound.value = null;
        saleForm.value.customer_id = null;
        if (error.response?.status !== 404) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar cliente', life: 3000 });
        }
    } finally {
        searchingCustomer.value = false;
    }
};

const debouncedCustomerSearch = () => {
    if (customerSearchTimeout.value) {
        clearTimeout(customerSearchTimeout.value);
    }
    customerSearchTimeout.value = setTimeout(searchCustomer, 500);
};

const calculateTotal = () => {
    const selectedTicket = routeTickets.value.find((t) => t.value === saleForm.value.route_ticket_id);
    return selectedTicket ? selectedTicket.price * saleForm.value.quantity : 0;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const save = async () => {
    loading.value = true;
    try {
        const saleData = { ...saleForm.value };
        // Remove customer_id se estiver null
        if (!saleData.customer_id) {
            delete saleData.customer_id;
        }
        // Remove customer_number se estiver vazio
        if (!saleData.customer_number) {
            delete saleData.customer_number;
        }

        await TicketSaleService.createSessionSale(sessionId, saleData);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Venda registrada com sucesso', life: 3000 });
        
        // Reset form
        saleForm.value = {
            route_ticket_id: '',
            quantity: 1,
            notes: '',
            customer_id: null,
            customer_number: ''
        };
        customerFound.value = null;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao registrar venda', life: 3000 });
    } finally {
        loading.value = false;
    }
};

watch(() => saleForm.value.customer_number, debouncedCustomerSearch);

onMounted(() => {
    getRouteTickets();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Registrar Venda de Bilhete</h5>
                    <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-text" @click="router.back()" />
                </div>

                <form @submit.prevent="save">
                    <div class="grid">
                        <!-- Informações do Bilhete -->
                        <div class="col-12">
                            <div class="card">
                                <h6 class="text-primary mb-3">Informações do Bilhete</h6>
                                
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="route_ticket_id" class="font-medium">Tipo de Bilhete *</label>
                                            <Dropdown id="route_ticket_id" v-model="saleForm.route_ticket_id" :options="routeTickets" optionLabel="label" optionValue="value" placeholder="Selecione o tipo de bilhete" class="w-full" required />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-3">
                                        <div class="field">
                                            <label for="quantity" class="font-medium">Quantidade *</label>
                                            <InputNumber id="quantity" v-model="saleForm.quantity" :min="1" :max="50" placeholder="Quantidade" class="w-full" required />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-3">
                                        <div class="field">
                                            <label class="font-medium">Total</label>
                                            <div class="p-inputtext w-full bg-gray-50 text-right font-bold text-primary">
                                                {{ formatCurrency(calculateTotal()) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Informações do Cliente (Opcional) -->
                        <div class="col-12">
                            <div class="card">
                                <h6 class="text-primary mb-3">Cliente (Opcional)</h6>
                                
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="customer_number" class="font-medium">Número do Cliente</label>
                                            <div class="p-inputgroup">
                                                <InputText id="customer_number" v-model="saleForm.customer_number" placeholder="CUST000001" class="w-full" />
                                                <Button icon="pi pi-search" class="p-button-outlined" :loading="searchingCustomer" @click="searchCustomer" />
                                            </div>
                                            <small class="text-600">Digite o número do cliente para associá-lo à venda</small>
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6" v-if="customerFound">
                                        <div class="field">
                                            <label class="font-medium">Cliente Encontrado</label>
                                            <div class="p-3 border-1 border-200 border-round bg-green-50">
                                                <div class="font-medium text-green-700">{{ customerFound.name }}</div>
                                                <div class="text-sm text-600">{{ customerFound.email }}</div>
                                                <div class="text-sm text-600">{{ customerFound.mobile }}</div>
                                                <Tag :value="customerFound.ticketType?.code" severity="info" class="mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Observações -->
                        <div class="col-12">
                            <div class="card">
                                <h6 class="text-primary mb-3">Observações</h6>
                                
                                <div class="field">
                                    <label for="notes" class="font-medium">Notas da Venda</label>
                                    <Textarea id="notes" v-model="saleForm.notes" placeholder="Observações sobre a venda (opcional)" class="w-full" rows="3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-content-end mt-4">
                        <Button type="submit" label="Registrar Venda" :loading="loading" icon="pi pi-check" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>