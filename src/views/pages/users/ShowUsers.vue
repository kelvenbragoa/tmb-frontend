<script setup>
import UserService from '@/service/UserService';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { usePermissions } from '@/composables/usePermissions';
import moment from 'moment';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { permissions } = usePermissions();
const loading = ref(false);
const userData = ref(null);
const displayConfirmation = ref(false);
const loadingButtonDelete = ref(false);

const userId = computed(() => parseInt(route.params.id));

const getData = async () => {
    loading.value = true;
    try {
        const response = await UserService.getUserById(userId.value);
        userData.value = response;
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.message || 'Erro ao carregar usuário', 
            life: 3000 
        });
        router.push('/users');
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
        await UserService.deleteUser(userId.value);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Usuário excluído com sucesso', 
            life: 3000 
        });
        router.push('/users');
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: error.message || 'Erro ao excluir usuário', 
            life: 3000 
        });
    } finally {
        loadingButtonDelete.value = false;
        closeConfirmation();
    }
};

const getRoleName = (role) => {
    const roles = {
        'admin': 'Administrador',
        'coordenador': 'Coordenador',
        'gestor': 'Gestor',
        'caixa': 'Caixa',
        'cobrador': 'Cobrador',
        'supervisor': 'Supervisor',
        'operator': 'Operador',
        'user': 'Usuário',
        'revisor': 'Revisor'
    };
    return roles[role] || role;
};

const getRoleSeverity = (role) => {
    const severities = {
        'admin': 'danger',
        'coordenador': 'success',
        'gestor': 'info',
        'caixa': 'warning',
        'cobrador': 'secondary',
        'supervisor': 'success',
        'operator': 'secondary',
        'user': 'secondary',
        'revisor': 'info'
    };
    return severities[role] || 'secondary';
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="grid" v-if="loading">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>
    
    <div class="grid" v-else-if="userData">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Detalhes do Usuário</h5>
                    <div class="flex gap-2">
                        <Button label="Voltar" @click="goBack" severity="secondary">
                            <i class="pi pi-arrow-left"></i>
                        </Button>
                        <router-link :to="'/users/' + userId + '/edit'" v-if="permissions.canEdit">
                            <Button label="Editar" severity="info">
                                <i class="pi pi-pencil"></i>
                            </Button>
                        </router-link>
                        <Button 
                            v-if="permissions.canDelete"
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
                                <div class="mt-1">{{ userData.id }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Nome:</label>
                                <div class="mt-1 font-medium">{{ userData.name }}</div>
                            </div>

                            <div class="field mb-3">
                                <label class="font-medium text-900">Usuario:</label>
                                <div class="mt-1">
                                    <i class="pi pi-envelope mr-2"></i>
                                    {{ userData.username }}
                                </div>
                            </div>

                            <div class="field mb-0">
                                <label class="font-medium text-900">Nível de Acesso:</label>
                                <div class="mt-1">
                                    <Tag :value="getRoleName(userData.role)" :severity="getRoleSeverity(userData.role)" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informações Adicionais -->
                    <div class="col-12 md:col-6">
                        <div class="card border-1 surface-border">
                            <h6 class="text-900 font-semibold mb-3">Informações Adicionais</h6>
                            
                            <div class="field mb-3" v-if="userData.phone">
                                <label class="font-medium text-900">Telefone:</label>
                                <div class="mt-1">
                                    <i class="pi pi-phone mr-2"></i>
                                    {{ userData.phone }}
                                </div>
                            </div>

                            <div class="field mb-3" v-if="userData.organization">
                                <label class="font-medium text-900">Organização:</label>
                                <div class="mt-1">{{ userData.organization.name }}</div>
                            </div>

                            <div class="field mb-3" v-if="userData.is_active !== undefined">
                                <label class="font-medium text-900">Status:</label>
                                <div class="mt-1">
                                    <Tag :value="userData.is_active ? 'Ativo' : 'Inativo'" :severity="userData.is_active ? 'success' : 'danger'" />
                                </div>
                            </div>

                            <div class="field mb-0" v-if="userData.last_login">
                                <label class="font-medium text-900">Último Login:</label>
                                <div class="mt-1">{{ moment(userData.last_login).format('DD/MM/YYYY HH:mm:ss') }}</div>
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
                                        <div class="mt-1">{{ userData.createdBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0">
                                        <label class="font-medium text-900">Data de Criação:</label>
                                        <div class="mt-1">{{ moment(userData.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                    </div>
                                </div>

                                <div class="col-12 md:col-6">
                                    <div class="field mb-3" v-if="userData.updatedBy">
                                        <label class="font-medium text-900">Atualizado por:</label>
                                        <div class="mt-1">{{ userData.updatedBy?.name || '-' }}</div>
                                    </div>

                                    <div class="field mb-0" v-if="userData.updatedAt">
                                        <label class="font-medium text-900">Última Atualização:</label>
                                        <div class="mt-1">{{ moment(userData.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
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
            <span>Tem certeza que deseja excluir este usuário?</span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Excluir" icon="pi pi-check" @click="deleteData" class="p-button-text" :loading="loadingButtonDelete" autofocus />
        </template>
    </Dialog>
</template>