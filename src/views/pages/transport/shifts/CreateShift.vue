<script setup>
import ShiftService from '@/service/ShiftService';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const submitted = ref(false);
const loading = ref(false);

const formData = reactive({
    name: '',
    start_time: '',
    end_time: '',
    is_active: true
});

const goBack = () => {
    router.back();
};

const submitForm = async () => {
    submitted.value = true;
    
    if (!formData.name.trim() || !formData.start_time || !formData.end_time) {
        toast.add({ 
            severity: 'warn', 
            summary: 'Atenção', 
            detail: 'Por favor, preencha todos os campos obrigatórios', 
            life: 3000 
        });
        return;
    }

    // Validar que end_time é maior que start_time
    if (formData.start_time >= formData.end_time) {
        toast.add({ 
            severity: 'warn', 
            summary: 'Atenção', 
            detail: 'O horário de fim deve ser maior que o horário de início', 
            life: 3000 
        });
        return;
    }

    loading.value = true;
    
    try {
        await ShiftService.createShift(formData);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Turno criado com sucesso', 
            life: 3000 
        });
        router.push('/transport/shifts');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao criar turno', 
            life: 3000 
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Novo Turno</h5>
                    <Button label="Voltar" @click="goBack" class="mr-2 mb-2" severity="secondary">
                        <i class="pi pi-arrow-left"></i>
                    </Button>
                </div>

                <form @submit.prevent="submitForm">
                    <div class="grid">
                        <div class="col-12 md:col-12">
                            <div class="field">
                                <label for="name" class="font-medium">Nome do Turno *</label>
                                <InputText 
                                    id="name"
                                    v-model="formData.name"
                                    :class="{ 'p-invalid': submitted && !formData.name.trim() }"
                                    placeholder="Ex: 1ºTurno, 2ºTurno, 3ºTurno"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.name.trim()" class="p-error">Nome é obrigatório</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="start_time" class="font-medium">Horário de Início *</label>
                                <InputMask 
                                    id="start_time"
                                    v-model="formData.start_time"
                                    mask="99:99"
                                    :class="{ 'p-invalid': submitted && !formData.start_time }"
                                    placeholder="HH:MM"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.start_time" class="p-error">Horário de início é obrigatório</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="end_time" class="font-medium">Horário de Término *</label>
                                <InputMask 
                                    id="end_time"
                                    v-model="formData.end_time"
                                    mask="99:99"
                                    :class="{ 'p-invalid': submitted && !formData.end_time }"
                                    placeholder="HH:MM"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.end_time" class="p-error">Horário de término é obrigatório</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-3">
                            <div class="field">
                                <label for="is_active" class="font-medium">Status</label>
                                <div class="flex align-items-center mt-2">
                                    <InputSwitch v-model="formData.is_active" />
                                    <label class="ml-2">{{ formData.is_active ? 'Ativo' : 'Inativo' }}</label>
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
