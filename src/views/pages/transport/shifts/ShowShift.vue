<script setup>
import ShiftService from '@/service/ShiftService';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);
const shiftData = ref(null);
const displayConfirmation = ref(false);
const loadingButtonDelete = ref(false);

const shiftId = computed(() => parseInt(route.params.id));

const getData = async () => {
    loading.value = true;
    try {
        const response = await ShiftService.getShiftById(shiftId.value);
        shiftData.value = response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao carregar turno', 
            life: 3000 
        });
        router.push('/transport/shifts');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.back();
};

const confirmDeletion = () => {
    displayConfirmation.value = true;
};

const closeConfirmation = () => {
    displayConfirmation.value = false;
};

const deleteData = async () => {
    loadingButtonDelete.value = true;
    try {
        await ShiftService.deleteShift(shiftId.value);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Turno excluído com sucesso', 
            life: 3000 
        });
        router.push('/transport/shifts');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao excluir turno', 
            life: 3000 
        });
    } finally {
        loadingButtonDelete.value = false;
        closeConfirmation();
    }
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
    
    <div class="grid" v-else-if="shiftData">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes do Turno</h5>
                    <div class="flex gap-2">
                        <Button label="Voltar" @click="goBack" severity="secondary">
                            <i class="pi pi-arrow-left"></i>
                        </Button>
                        <router-link :to="'/transport/shifts/' + shiftId + '/edit'">
                            <Button label="Editar" severity="info">
                                <i class="pi pi-pencil"></i>
                            </Button>
                        </router-link>
                        <Button 
                            label="Excluir" 
                            severity="danger" 
                            @click="confirmDeletion"
                        >
                            <i class="pi pi-trash"></i>
                        </Button>
                    </div>
                </div>

                <div class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações Básicas</h6>
                            
                            <div class="field mb-3">
                                <label class="font-medium text-900">ID:</label>
                                <div class="mt-1">{{ shiftData.id }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Nome:</label>
                                <div class="mt-1 font-medium">{{ shiftData.name }}</div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Status:</label>
                                <div class="mt-1">
                                    <Tag :value="shiftData.is_active ? 'Ativo' : 'Inativo'" :severity="shiftData.is_active ? 'success' : 'danger'" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações de Horário -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Horário do Turno</h6>
                            
                            <div class="field mb-3">
                                <label class="font-medium text-900">Horário de Início:</label>
                                <div class="mt-1 flex align-items-center gap-2">
                                    <i class="pi pi-clock text-600"></i>
                                    <span class="font-medium">{{ shiftData.start_time }}</span>
                                </div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Horário de Término:</label>
                                <div class="mt-1 flex align-items-center gap-2">
                                    <i class="pi pi-clock text-600"></i>
                                    <span class="font-medium">{{ shiftData.end_time }}</span>
                                </div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Duração:</label>
                                <div class="mt-1">
                                    <Tag :value="calculateDuration(shiftData.start_time, shiftData.end_time)" severity="info" />
                                </div>
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
                                        <div class="mt-1">{{ shiftData.createdBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Data de Criação:</label>
                                        <div class="mt-1">{{ moment(shiftData.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <div class="field mb-3">
                                        <label class="font-medium text-900">Atualizado por:</label>
                                        <div class="mt-1">{{ shiftData.updatedBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Última Atualização:</label>
                                        <div class="mt-1">{{ moment(shiftData.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Dialog header="Confirmação" v-model:visible="displayConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja excluir este turno?</span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Excluir" icon="pi pi-check" @click="deleteData" class="p-button-text" :loading="loadingButtonDelete" autofocus />
        </template>
    </Dialog>
</template>

<script>
export default {
    methods: {
        calculateDuration(startTime, endTime) {
            if (!startTime || !endTime) return '-';
            
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            
            const diffMinutes = endMinutes - startMinutes;
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            
            if (hours > 0 && minutes > 0) {
                return `${hours}h ${minutes}min`;
            } else if (hours > 0) {
                return `${hours}h`;
            } else {
                return `${minutes}min`;
            }
        }
    }
}
</script>
