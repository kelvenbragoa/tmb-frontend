<script setup>
import SessionService from '@/service/SessionService';
import RouteService from '@/service/RouteService';
import VehicleService from '@/service/VehicleService';
import UserService from '@/service/UserService';
import ShiftService from '@/service/ShiftService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);
const isEdit = ref(false);

const session = ref({
    route_id: '',
    vehicle_id: '',
    user_id: '',
    shift_id: '',
    departure_time: '',
    arrival_time: '',
    status: 'scheduled',
    scheduled_date: new Date(),
    actual_departure_time: null,
    actual_arrival_time: null,
    notes: ''
});

const routes = ref([]);
const vehicles = ref([]);
const users = ref([]);
const shifts = ref([]);

const statusOptions = [
    { label: 'Agendada', value: 'scheduled' },
    { label: 'Em Progresso', value: 'in_progress' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' }
];

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

const getVehicles = async () => {
    try {
        const response = await VehicleService.getAllVehicles({ limit: 1000 });
        vehicles.value = response.items.map((vehicle) => ({
            label: `${vehicle.name} - ${vehicle.plate} (${vehicle.capacity} lugares)`,
            value: vehicle.id
        }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar veículos', life: 3000 });
    }
};

const getUsers = async () => {
    try {
        const response = await UserService.getAllUsers({ limit: 1000 });
        users.value = response.items
            .filter((user) => ['cobrador', 'supervisor'].includes(user.role))
            .map((user) => ({
                label: `${user.name} - ${user.username} (${user.role})`, 
                value: user.id
            }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários', life: 3000 });
    }
};

const getShifts = async () => {
    try {
        const response = await ShiftService.getAllShifts({ limit: 1000 });
        shifts.value = response.items
            .filter((shift) => shift.is_active)
            .map((shift) => ({
                label: `${shift.name} (${shift.start_time} - ${shift.end_time})`,
                value: shift.id
            }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar turnos', life: 3000 });
    }
};

const getSessionById = async () => {
    if (route.params.id) {
        isEdit.value = true;
        loading.value = true;
        try {
            const response = await SessionService.getSessionById(route.params.id);
            session.value = {
                ...response,
                departure_time: response.departure_time ? new Date(response.departure_time) : '',
                arrival_time: response.arrival_time ? new Date(response.arrival_time) : '',
                scheduled_date: response.scheduled_date ? new Date(response.scheduled_date) : '',
                actual_departure_time: response.actual_departure_time ? new Date(response.actual_departure_time) : null,
                actual_arrival_time: response.actual_arrival_time ? new Date(response.actual_arrival_time) : null
            };
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar sessão', life: 3000 });
        } finally {
            loading.value = false;
        }
    }
};

const save = async () => {
    if (!session.value.user_id || !session.value.shift_id) {
        toast.add({ 
            severity: 'warn', 
            summary: 'Atenção', 
            detail: 'Por favor, preencha todos os campos obrigatórios', 
            life: 3000 
        });
        return;
    }
    loading.value = true;
    try {
        const sessionData = {
            ...session.value,
            departure_time: session.value.departure_time ? new Date(session.value.departure_time).toISOString() : null,
            arrival_time: session.value.arrival_time ? new Date(session.value.arrival_time).toISOString() : null,
            scheduled_date: session.value.scheduled_date ? new Date(session.value.scheduled_date).toISOString().split('T')[0] : null,
            actual_departure_time: session.value.actual_departure_time ? new Date(session.value.actual_departure_time).toISOString() : null,
            actual_arrival_time: session.value.actual_arrival_time ? new Date(session.value.actual_arrival_time).toISOString() : null
        };

        if (isEdit.value) {
            await SessionService.updateSession(route.params.id, sessionData);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Sessão atualizada com sucesso', life: 3000 });
        } else {
            await SessionService.createSession(sessionData);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Sessão criada com sucesso', life: 3000 });
        }
        router.push('/transport/sessions');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: `Erro ao salvar sessão: ${error.response?.data?.message || error.message}`, life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getRoutes();
    getVehicles();
    getUsers();
    getShifts();
    getSessionById();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">{{ isEdit ? 'Editar Sessão' : 'Nova Sessão' }}</h5>
                    <router-link to="/transport/sessions">
                        <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-text" />
                    </router-link>
                </div>

                <div v-if="loading && isEdit" class="flex justify-content-center">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <form @submit.prevent="save" v-else>
                    <div class="grid">
                        <!-- Informações Básicas -->
                        <div class="col-12">
                            <div class="card">
                                <h6 class="text-primary mb-3">Informações Básicas</h6>
                                
                                <div class="grid">
                                    <!-- <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="route_id" class="font-medium">Rota *</label>
                                            <Dropdown id="route_id" v-model="session.route_id" :options="routes" optionLabel="label" optionValue="value" placeholder="Selecione uma rota" class="w-full" required />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="vehicle_id" class="font-medium">Veículo *</label>
                                            <Dropdown id="vehicle_id" v-model="session.vehicle_id" :options="vehicles" optionLabel="label" optionValue="value" placeholder="Selecione um veículo" class="w-full" required />
                                        </div>
                                    </div> -->

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="user_id" class="font-medium">Operador *</label>
                                            <Dropdown id="user_id" v-model="session.user_id" :options="users" optionLabel="label" optionValue="value" placeholder="Selecione um operador" class="w-full" required />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="shift_id" class="font-medium">Turno *</label>
                                            <Dropdown id="shift_id" v-model="session.shift_id" :options="shifts" optionLabel="label" optionValue="value" placeholder="Selecione um turno" class="w-full" required />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-4">
                                        <div class="field">
                                            <label for="scheduled_date" class="font-medium">Data*</label>
                                            <Calendar id="scheduled_date" v-model="session.scheduled_date" readonly placeholder="Selecione a data" class="w-full" dateFormat="dd/mm/yy" required />
                                        </div>
                                    </div>

                                    <!-- <div class="col-12 md:col-4">
                                        <div class="field">
                                            <label for="status" class="font-medium">Status</label>
                                            <Dropdown id="status" v-model="session.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Selecione o status" class="w-full" />
                                        </div>
                                    </div> -->
                                </div>
                            </div>
                        </div>

                        

                        <!-- Horários Reais (apenas se editando) -->
                        <div class="col-12" v-if="isEdit">
                            <div class="card">
                                <h6 class="text-primary mb-3">Horários Reais</h6>
                                
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="actual_departure_time" class="font-medium">Partida Real</label>
                                            <Calendar id="actual_departure_time" v-model="session.actual_departure_time" placeholder="Selecione o horário real" class="w-full" showTime hourFormat="24" dateFormat="dd/mm/yy" />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="actual_arrival_time" class="font-medium">Chegada Real</label>
                                            <Calendar id="actual_arrival_time" v-model="session.actual_arrival_time" placeholder="Selecione o horário real" class="w-full" showTime hourFormat="24" dateFormat="dd/mm/yy" />
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
                                    <label for="notes" class="font-medium">Notas</label>
                                    <Textarea id="notes" v-model="session.notes" placeholder="Observações sobre a sessão" class="w-full" rows="4" />
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
