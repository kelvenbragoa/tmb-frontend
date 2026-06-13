<script setup>
import DriverService from '@/service/DriverService';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const submitted = ref(false);
const loading = ref(false);

const formData = reactive({
    name: '',
    mobile: '',
    document: '',
    document_expiry_date: null,
    is_active: true
});

const goBack = () => {
    router.back();
};

const submitForm = async () => {
    submitted.value = true;
    
    if (!formData.name.trim()) {
        toast.add({ 
            severity: 'warn', 
            summary: 'Atenção', 
            detail: 'Por favor, preencha os dados do motorista', 
            life: 3000 
        });
        return;
    }

    loading.value = true;
    
    try {
        // Remover campos vazios opcionais
        const dataToSend = {
            name: formData.name,
            is_active: formData.is_active
        };
        
        if (formData.mobile.trim()) {
            dataToSend.mobile = formData.mobile;
        }
        
        if (formData.document.trim()) {
            dataToSend.document = formData.document;
        }
        if (formData.document_expiry_date) {
            dataToSend.document_expiry_date = new Date(formData.document_expiry_date).toISOString().split('T')[0];
        }
        
        await DriverService.createDriver(dataToSend);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Motorista criado com sucesso', 
            life: 3000 
        });
        router.push('/transport/drivers');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao criar motorista', 
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
                    <h5 class="m-0">Novo Motorista</h5>
                    <Button label="Voltar" @click="goBack" class="mr-2 mb-2" severity="secondary">
                        <i class="pi pi-arrow-left"></i>
                    </Button>
                </div>

                <form @submit.prevent="submitForm">
                    <div class="grid">
                        <div class="col-12 md:col-12">
                            <div class="field">
                                <label for="name" class="font-medium">Nome do Motorista *</label>
                                <InputText 
                                    id="name"
                                    v-model="formData.name"
                                    :class="{ 'p-invalid': submitted && !formData.name.trim() }"
                                    placeholder="Ex: Carlos Silva"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.name.trim()" class="p-error">Nome é obrigatório</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="mobile" class="font-medium">Contacto (Telemóvel)</label>
                                <InputText 
                                    id="mobile"
                                    v-model="formData.mobile"
                                    placeholder="Ex: 999999999"
                                    class="w-full"
                                />
                                <!-- <small class="text-600">Campo opcional</small> -->
                            </div>
                        </div>
<!-- 
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="document" class="font-medium">Carta de condução</label>
                                <InputText 
                                    id="document"
                                    v-model="formData.document"
                                    placeholder="Ex: 123456789"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.document.trim()" class="p-error">Carta de condução é obrigatória</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                                        <div class="field">
                                            <label for="document_expiry_date" class="font-medium">Data de validade*</label>
                                            <Calendar id="document_expiry_date" v-model="formData.document_expiry_date" placeholder="Selecione a data" class="w-full" dateFormat="dd/mm/yy" required />
                                            <small v-if="submitted && !formData.document_expiry_date" class="p-error">Data de validade é obrigatória</small>
                                        </div>
                                    </div> -->

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
