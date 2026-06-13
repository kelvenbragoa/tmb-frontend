<script setup>
import RouteStopService from '@/service/RouteStopService';
import RouteService from '@/service/RouteService';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const submitted = ref(false);
const loading = ref(false);
const loadingRoutes = ref(false);
const routes = ref([]);

const formData = reactive({
    name: '',
    description: '',
    order: 1,
    routeId: null,
    is_active: true
});

const loadRoutes = async () => {
    loadingRoutes.value = true;
    try {
        const response = await RouteService.getAllRoutes({ page: 1, limit: 1000 });
        routes.value = response.items;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar rotas', 
            life: 3000 
        });
    } finally {
        loadingRoutes.value = false;
    }
};

const goBack = () => {
    router.back();
};

const submitForm = async () => {
    submitted.value = true;
    
    if (!formData.name.trim() || !formData.routeId || !formData.order) {
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
        await RouteStopService.createRouteStop(formData);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Paragem criada com sucesso', 
            life: 3000 
        });
        // router.push('/transport/route-stops');
        goBack();
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao criar paragem', 
            life: 3000 
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadRoutes();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Nova Paragem de Rota</h5>
                    <Button label="Voltar" @click="goBack" class="mr-2 mb-2" severity="secondary">
                        <i class="pi pi-arrow-left"></i>
                    </Button>
                </div>

                <form @submit.prevent="submitForm">
                    <div class="grid">
                        <div class="col-12 md:col-12">
                            <div class="field">
                                <label for="name" class="font-medium">Nome da Paragem *</label>
                                <InputText 
                                    id="name"
                                    v-model="formData.name"
                                    :class="{ 'p-invalid': submitted && !formData.name.trim() }"
                                    placeholder="Ex: Praça Central"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.name.trim()" class="p-error">Nome é obrigatório</small>
                            </div>
                        </div>

                        <!-- <div class="col-12 md:col-3">
                            <div class="field">
                                <label for="order" class="font-medium">Ordem *</label>
                                <InputNumber 
                                    id="order"
                                    v-model="formData.order"
                                    :class="{ 'p-invalid': submitted && !formData.order }"
                                    :min="1"
                                    placeholder="1"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.order" class="p-error">Ordem é obrigatória</small>
                            </div>
                        </div> -->

                        

                        <div class="col-12">
                            <div class="field">
                                <label for="routeId" class="font-medium">Rota *</label>
                                <Dropdown 
                                    id="routeId"
                                    v-model="formData.routeId"
                                    :options="routes"
                                    optionLabel="name"
                                    optionValue="id"
                                    :class="{ 'p-invalid': submitted && !formData.routeId }"
                                    placeholder="Selecione uma rota"
                                    :loading="loadingRoutes"
                                    class="w-full"
                                    filter
                                >
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value">
                                            {{ routes.find(r => r.id === slotProps.value)?.name }}
                                        </div>
                                        <span v-else>{{ slotProps.placeholder }}</span>
                                    </template>
                                    <template #option="slotProps">
                                        <div>
                                            <div class="font-medium">{{ slotProps.option.name }}</div>
                                            <div class="text-sm text-600">{{ slotProps.option.origin }} → {{ slotProps.option.destination }}</div>
                                        </div>
                                    </template>
                                </Dropdown>
                                <small v-if="submitted && !formData.routeId" class="p-error">Rota é obrigatória</small>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label for="description" class="font-medium">Descrição</label>
                                <Textarea 
                                    id="description"
                                    v-model="formData.description"
                                    rows="4"
                                    placeholder="Descreva a localização da paragem..."
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <div class="col-12 md:col-3">
                            <div class="field">
                                <label for="is_active" class="font-medium">Status</label>
                                <div class="flex align-items-center mt-2">
                                    <InputSwitch v-model="formData.is_active" />
                                    <label class="ml-2">{{ formData.is_active ? 'Ativa' : 'Inativa' }}</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="flex gap-2 justify-content-end">
                                <Button 
                                    label="Cancelar" 
                                    severity="secondary" 
                                    @click="goBack"
                                    type="button"
                                />
                                <Button 
                                    label="Salvar" 
                                    type="submit"
                                    :loading="loading"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>