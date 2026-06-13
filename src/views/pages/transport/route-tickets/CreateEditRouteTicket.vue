<script setup>
import RouteTicketService from '@/service/RouteTicketService';
import RouteService from '@/service/RouteService';
import TicketTypeService from '@/service/TicketTypeService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);
const isEdit = ref(false);

const routeTicket = ref({
    route_id: '',
    ticket_type_id: '',
    price: 0,
    penalty_price: 0
});

const routes = ref([]);
const ticketTypes = ref([]);

const goBack = () => {
    router.back();
};

const getRoutes = async () => {
    try {
        const response = await RouteService.getAllRoutes({ limit: 1000 });
        routes.value = response.items.map((route) => ({
            label: `${route.name} (${route.origin} → ${route.destination})`,
            value: route.id
        }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar rotas', life: 3000 });
    }
};

const getTicketTypes = async () => {
    try {
        const response = await TicketTypeService.getAllTicketTypes({ limit: 1000 });
        ticketTypes.value = response.items.map((type) => ({
            label: `${type.name} (${type.code})`,
            value: type.id
        }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar tipos de bilhete', life: 3000 });
    }
};

const getRouteTicketById = async () => {
    if (route.params.id) {
        isEdit.value = true;
        loading.value = true;
        try {
            const response = await RouteTicketService.getRouteTicketById(route.params.id);
            routeTicket.value = response;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar bilhete da rota', life: 3000 });
        } finally {
            loading.value = false;
        }
    }
};

const save = async () => {
    loading.value = true;
    try {
        if (isEdit.value) {
            await RouteTicketService.updateRouteTicket(route.params.id, routeTicket.value);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Bilhete da rota atualizado com sucesso', life: 3000 });
        } else {
            await RouteTicketService.createRouteTicket(routeTicket.value);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Bilhete da rota criado com sucesso', life: 3000 });
        }
        router.push('/transport/route-tickets');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar bilhete da rota', life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getRoutes();
    getTicketTypes();
    getRouteTicketById();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">{{ isEdit ? 'Editar Bilhete da Rota' : 'Novo Bilhete da Rota' }}</h5>
                    <router-link to="/transport/route-tickets">
                        <Button icon="pi pi-arrow-left" label="Voltar" @click="goBack" class="p-button-text" />
                    </router-link>
                </div>

                <div v-if="loading && isEdit" class="flex justify-content-center">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <form @submit.prevent="save" v-else>
                    <div class="card">
                        <h6 class="text-primary mb-3">Informações do Bilhete</h6>
                        
                        <div class="grid">
                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="route_id" class="font-medium">Rota *</label>
                                    <Dropdown id="route_id" v-model="routeTicket.route_id" :options="routes" optionLabel="label" optionValue="value" placeholder="Selecione uma rota" class="w-full" required />
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="ticket_type_id" class="font-medium">Tipo de Bilhete *</label>
                                    <Dropdown id="ticket_type_id" v-model="routeTicket.ticket_type_id" :options="ticketTypes" optionLabel="label" optionValue="value" placeholder="Selecione um tipo de bilhete" class="w-full" required />
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="price" class="font-medium">Preço (MZN) *</label>
                                    <InputNumber id="price" v-model="routeTicket.price" mode="currency" currency="MZN" locale="pt-MZ" placeholder="0.00" class="w-full" required :min="0" :maxFractionDigits="2" />
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label for="penalty_price" class="font-medium">Preço da Multa (MZN) *</label>
                                    <InputNumber id="penalty_price" v-model="routeTicket.penalty_price" mode="currency" currency="MZN" locale="pt-MZ" placeholder="0.00" class="w-full" required :min="0" :maxFractionDigits="2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-content-end mt-4">
                        <Button type="submit" :label="isEdit ? 'Atualizar' : 'Criar'" :loading="loading" icon="pi pi-check" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>