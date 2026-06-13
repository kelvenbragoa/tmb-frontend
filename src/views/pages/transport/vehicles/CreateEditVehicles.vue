<script setup>
import VehicleService from '@/service/VehicleService';
import RouteService from '@/service/RouteService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const isEditing = ref(false);
const vehicleId = ref(null);
const routes = ref([]);

const formData = ref({
    name: '',
    plate: '',
    // model: '',
    // brand: '',
    // capacity: null,
    description: '',
    route_ids: [],
    is_active: true
});

const errors = ref({});

const isEditMode = () => route.params.id !== undefined;

const loadRoutes = async () => {
    try {
        const response = await RouteService.getAllRoutes({ limit: 1000 });
        routes.value = response.items.map(r => ({ label: `${r.name} (${r.origin} → ${r.destination})`, value: r.id }));
    } catch (error) {
        console.error('Erro ao carregar rotas:', error);
    }
};

const loadVehicle = async () => {
    if (!isEditMode()) return;
    
    loading.value = true;
    try {
        const response = await VehicleService.getVehicleById(route.params.id);
        formData.value = {
            name: response.name,
            plate: response.plate,
            model: response.model,
            brand: response.brand,
            capacity: response.capacity,
            description: response.description || '',
            route_ids: response.routes?.map(r => r.id) || [],
            is_active: response.is_active
        };
        vehicleId.value = response.id;
        isEditing.value = true;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar veículo',
            life: 5000
        });
        router.push('/transport/vehicles');
    } finally {
        loading.value = false;
    }
};

const validateForm = () => {
    errors.value = {};
    
    if (!formData.value.name.trim()) errors.value.name = 'Nome é obrigatório';
    if (!formData.value.plate.trim()) errors.value.plate = 'Placa é obrigatória';
    // if (!formData.value.model.trim()) errors.value.model = 'Modelo é obrigatório';
    // if (!formData.value.brand.trim()) errors.value.brand = 'Marca é obrigatória';
    // if (!formData.value.capacity || formData.value.capacity < 1) errors.value.capacity = 'Capacidade deve ser maior que 0';
    
    return Object.keys(errors.value).length === 0;
};

const saveVehicle = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Validação', detail: 'Corrija os erros do formulário', life: 3000 });
        return;
    }
    
    loading.value = true;
    try {
        const dataToSend = { ...formData.value };
        dataToSend.name = dataToSend.name.trim();
        dataToSend.plate = dataToSend.plate.trim().toUpperCase();
        
        if (isEditing.value) {
            await VehicleService.updateVehicle(vehicleId.value, dataToSend);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Veículo atualizado', life: 3000 });
        } else {
            await VehicleService.createVehicle(dataToSend);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Veículo criado', life: 3000 });
        }
        
        router.push('/transport/vehicles');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.message || 'Erro ao salvar', life: 5000 });
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await loadRoutes();
    await loadVehicle();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="mb-4">{{ isEditing ? 'Editar Veículo' : 'Novo Veículo' }}</h5>

                <form @submit.prevent="saveVehicle" v-if="!loading || isEditing">
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="name" class="font-medium">Codigo *</label>
                                <InputText id="name" v-model="formData.name" :class="{ 'p-invalid': errors.name }" class="w-full" />
                                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="plate" class="font-medium">Placa *</label>
                                <InputText id="plate" v-model="formData.plate" :class="{ 'p-invalid': errors.plate }" class="w-full" style="text-transform: uppercase;" />
                                <small v-if="errors.plate" class="p-error">{{ errors.plate }}</small>
                            </div>
                        </div>

                        <!-- <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="brand" class="font-medium">Marca *</label>
                                <InputText id="brand" v-model="formData.brand" :class="{ 'p-invalid': errors.brand }" class="w-full" />
                                <small v-if="errors.brand" class="p-error">{{ errors.brand }}</small>
                            </div>
                        </div> -->

                        

                        <!-- <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="capacity" class="font-medium">Capacidade *</label>
                                <InputNumber id="capacity" v-model="formData.capacity" :class="{ 'p-invalid': errors.capacity }" class="w-full" :min="1" />
                                <small v-if="errors.capacity" class="p-error">{{ errors.capacity }}</small>
                            </div>
                        </div> -->

                        <div class="col-12 md:col-12">
                            <div class="field">
                                <label for="routes" class="font-medium">Rotas</label>
                                <MultiSelect id="routes" v-model="formData.route_ids" :options="routes" optionLabel="label" optionValue="value" placeholder="Selecione as rotas" class="w-full" />
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label for="description" class="font-medium">Descrição</label>
                                <Textarea id="description" v-model="formData.description" class="w-full" rows="3" />
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <Checkbox id="is_active" v-model="formData.is_active" :binary="true" />
                                <label for="is_active" class="ml-2">Ativo</label>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2 pt-4">
                        <Button type="submit" :label="isEditing ? 'Atualizar' : 'Criar'" :loading="loading" icon="pi pi-check" />
                        <Button label="Cancelar" @click="router.push('/transport/vehicles')" class="p-button-outlined" icon="pi pi-times" />
                    </div>
                </form>

                <div v-else class="text-center py-8">
                    <ProgressSpinner />
                    <p class="mt-3">Carregando...</p>
                </div>
            </div>
        </div>
    </div>
</template>