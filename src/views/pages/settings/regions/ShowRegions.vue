<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { baseURL } from '@/service/APIConstant';
import moment from 'moment';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const isLoadingData = ref(true);
const data = ref(null);

const getData = async () => {
    try {
        const response = await axios.get(`${baseURL}/settings/regions/${route.params.id}`);
        data.value = response.data;
        isLoadingData.value = false;
    } catch (error) {
        console.error('Erro ao carregar região:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar dados da região', life: 3000 });
        router.push('/settings/regions');
    }
};

const goBack = () => {
    router.push('/settings/regions');
};

const goToEdit = () => {
    router.push(`/settings/regions/${route.params.id}/edit`);
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="grid" v-if="isLoadingData">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Carregando" />
        </div>
    </div>
    
    <div class="grid" v-else-if="data">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5>Detalhes da Região</h5>
                    <div class="flex gap-2">
                        <Button label="Editar" icon="pi pi-pencil" @click="goToEdit" />
                        <Button label="Voltar" icon="pi pi-arrow-left" class="p-button-text" @click="goBack" />
                    </div>
                </div>
                
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label class="font-semibold">ID:</label>
                            <p class="mt-2">{{ data.id }}</p>
                        </div>
                    </div>
                    
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label class="font-semibold">Nome:</label>
                            <p class="mt-2">{{ data.name }}</p>
                        </div>
                    </div>
                    
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label class="font-semibold">Código:</label>
                            <p class="mt-2">
                                <Tag :value="data.code" severity="info"></Tag>
                            </p>
                        </div>
                    </div>
                    
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label class="font-semibold">País:</label>
                            <p class="mt-2">{{ data.country }}</p>
                        </div>
                    </div>
                    
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label class="font-semibold">Status:</label>
                            <p class="mt-2">
                                <Tag :value="data.status ? 'Ativo' : 'Inativo'" :severity="data.status ? 'success' : 'danger'"></Tag>
                            </p>
                        </div>
                    </div>
                    
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label class="font-semibold">Data de Criação:</label>
                            <p class="mt-2">{{ moment(data.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</p>
                        </div>
                    </div>
                    
                    <div class="col-12 md:col-6" v-if="data.updatedAt">
                        <div class="field">
                            <label class="font-semibold">Última Atualização:</label>
                            <p class="mt-2">{{ moment(data.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</p>
                        </div>
                    </div>
                    
                    <div class="col-12" v-if="data.description">
                        <div class="field">
                            <label class="font-semibold">Descrição:</label>
                            <p class="mt-2">{{ data.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}

.field label {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

.field p {
    margin: 0;
    color: var(--text-color);
    font-size: 1rem;
}
</style>
