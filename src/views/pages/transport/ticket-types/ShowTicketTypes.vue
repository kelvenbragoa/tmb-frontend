<script setup>
import TicketTypeService from '@/service/TicketTypeService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const ticketType = ref(null);

const loadTicketType = async () => {
    try {
        const response = await TicketTypeService.getTicketTypeById(route.params.id);
        ticketType.value = response;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.response?.data?.message || 'Erro ao carregar tipo de bilhete',
            life: 5000
        });
        router.push('/transport/ticket-types');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push('/transport/ticket-types');
};

const goToEdit = () => {
    router.push(`/transport/ticket-types/${route.params.id}/edit`);
};

onMounted(() => {
    loadTicketType();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <div>
                        <h5 class="m-0">Detalhes do Tipo de Bilhete</h5>
                        <p class="text-600 mt-1 mb-0">Informações detalhadas do tipo de bilhete</p>
                    </div>
                    <div class="flex gap-2">
                        <Button 
                            label="Voltar" 
                            @click="goBack" 
                            class="p-button-outlined"
                            icon="pi pi-arrow-left"
                        />
                        <Button 
                            label="Editar" 
                            @click="goToEdit" 
                            icon="pi pi-pencil"
                            v-if="ticketType"
                        />
                    </div>
                </div>

                <!-- Loading state -->
                <div v-if="loading" class="text-center py-8">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                    <p class="mt-3">Carregando dados do tipo de bilhete...</p>
                </div>

                <!-- Content -->
                <div v-else-if="ticketType" class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12">
                        <div class="card">
                            <h6 class="mb-3">Informações Básicas</h6>
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">ID</label>
                                        <p class="mt-2 mb-0">{{ ticketType.id }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Código</label>
                                        <p class="mt-2 mb-0">
                                            <Tag :value="ticketType.code" severity="info" />
                                        </p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Nome</label>
                                        <p class="mt-2 mb-0 font-medium">{{ ticketType.name }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Status</label>
                                        <p class="mt-2 mb-0">
                                            <Tag 
                                                :value="ticketType.is_active ? 'Ativo' : 'Inativo'" 
                                                :severity="ticketType.is_active ? 'success' : 'danger'" 
                                            />
                                        </p>
                                    </div>
                                </div>
                                <div class="col-12" v-if="ticketType.description">
                                    <div class="field">
                                        <label class="font-medium text-900">Descrição</label>
                                        <p class="mt-2 mb-0">{{ ticketType.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações de Auditoria -->
                    <div class="col-12">
                        <div class="card">
                            <h6 class="mb-3">Informações de Auditoria</h6>
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Criado por</label>
                                        <p class="mt-2 mb-0">{{ ticketType.createdBy?.name || '-' }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Data de Criação</label>
                                        <p class="mt-2 mb-0">{{ moment(ticketType.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6" v-if="ticketType.updatedAt && ticketType.updatedAt !== ticketType.createdAt">
                                    <div class="field">
                                        <label class="font-medium text-900">Última Atualização</label>
                                        <p class="mt-2 mb-0">{{ moment(ticketType.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</p>
                                    </div>
                                </div>
                            </div>
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
</style>