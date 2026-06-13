<script setup>
import RouteCategoryService from '@/service/RouteCategoryService';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const submitted = ref(false);
const loading = ref(false);

const formData = reactive({
    name: '',
    description: '',
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
            detail: 'Por favor, preencha o nome da categoria', 
            life: 3000 
        });
        return;
    }

    loading.value = true;
    
    try {
        await RouteCategoryService.createRouteCategory(formData);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Categoria criada com sucesso', 
            life: 3000 
        });
        router.push('/transport/route-categories');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.response?.data?.message || 'Erro ao criar categoria', 
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
                    <h5 class="m-0">Nova Categoria de Rota</h5>
                    <Button label="Voltar" @click="goBack" class="mr-2 mb-2" severity="secondary">
                        <i class="pi pi-arrow-left"></i>
                    </Button>
                </div>

                <form @submit.prevent="submitForm">
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="name" class="font-medium">Nome da Categoria *</label>
                                <InputText 
                                    id="name"
                                    v-model="formData.name"
                                    :class="{ 'p-invalid': submitted && !formData.name.trim() }"
                                    placeholder="Ex: Rotas Urbanas"
                                    class="w-full"
                                />
                                <small v-if="submitted && !formData.name.trim()" class="p-error">Nome é obrigatório</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="is_active" class="font-medium">Status</label>
                                <div class="flex align-items-center mt-2">
                                    <InputSwitch v-model="formData.is_active" />
                                    <label class="ml-2">{{ formData.is_active ? 'Ativa' : 'Inativa' }}</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label for="description" class="font-medium">Descrição</label>
                                <Textarea 
                                    id="description"
                                    v-model="formData.description"
                                    rows="4"
                                    placeholder="Descreva o propósito desta categoria..."
                                    class="w-full"
                                />
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