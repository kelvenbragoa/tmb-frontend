<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import UserProfileService from '@/service/UserProfileService';
import moment from 'moment';

const toast = useToast();

// Estados
const loading = ref(false);
const updating = ref(false);
const changingPassword = ref(false);
const activeTab = ref(0);

// Dados
const profile = ref(null);

// Formulários
const profileForm = reactive({
    name: '',
    username: '',
    mobile: ''
});

const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
});

// Erros
const profileErrors = reactive({});
const passwordErrors = reactive({});

// Métodos
const loadProfile = async () => {
    loading.value = true;

    try {
        const data = await UserProfileService.getMyProfile();
        profile.value = data;
        populateProfileForm();
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.message || 'Erro ao carregar perfil',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const populateProfileForm = () => {
    if (profile.value) {
        profileForm.name = profile.value.name || '';
        profileForm.username = profile.value.username || '';
        profileForm.mobile = profile.value.mobile || '';
    }
};

const validateProfileForm = () => {
    Object.keys(profileErrors).forEach((key) => delete profileErrors[key]);

    if (!profileForm.name?.trim()) {
        profileErrors.name = 'Nome é obrigatório';
    }

    if (!profileForm.username?.trim()) {
        profileErrors.username = 'Usuario é obrigatório';
    }

    return Object.keys(profileErrors).length === 0;
};

const updateProfile = async () => {
    if (!validateProfileForm()) return;

    updating.value = true;

    try {
        const updateData = {
            name: profileForm.name,
            username: profileForm.username,
            mobile: profileForm.mobile
        };

        const data = await UserProfileService.updateMyProfile(updateData);
        profile.value = data;

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Perfil atualizado com sucesso',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.message || 'Erro ao atualizar perfil',
            life: 3000
        });
    } finally {
        updating.value = false;
    }
};

const validatePasswordForm = () => {
    Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);

    if (!passwordForm.currentPassword?.trim()) {
        passwordErrors.currentPassword = 'Senha atual é obrigatória';
    } else if (passwordForm.currentPassword.length < 6) {
        passwordErrors.currentPassword = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!passwordForm.newPassword) {
        passwordErrors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordForm.newPassword.length < 6) {
        passwordErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!passwordForm.confirmNewPassword) {
        passwordErrors.confirmNewPassword = 'Confirmação de senha é obrigatória';
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        passwordErrors.confirmNewPassword = 'As senhas não coincidem';
    }

    return Object.keys(passwordErrors).length === 0;
};

const changePassword = async () => {
    if (!validatePasswordForm()) return;

    changingPassword.value = true;

    try {
        await UserProfileService.changePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        });

        resetPasswordForm();
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Senha alterada com sucesso',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.message || 'Erro ao alterar senha',
            life: 3000
        });
    } finally {
        changingPassword.value = false;
    }
};

const resetProfileForm = () => {
    populateProfileForm();
    Object.keys(profileErrors).forEach((key) => delete profileErrors[key]);
};

const resetPasswordForm = () => {
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';
    Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);
};

const getInitials = () => {
    if (!profile.value?.name) return 'U';
    const names = profile.value.name.split(' ');
    return names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0];
};

const getRoleName = (role) => {
    const roles = {
        admin: 'Administrador',
        coordenador: 'Coordenador',
        gestor: 'Gestor',
        caixa: 'Caixa',
        cobrador: 'Cobrador',
        supervisor: 'Supervisor',
        operator: 'Operador',
        user: 'Usuário',
        revisor: 'Revisor'
    };
    return roles[role] || role;
};

const getRoleSeverity = (role) => {
    const severities = {
        admin: 'danger',
        coordenador: 'success',
        gestor: 'info',
        caixa: 'warning',
        cobrador: 'secondary',
        supervisor: 'success',
        operator: 'secondary',
        user: 'secondary',
        revisor: 'info'
    };
    return severities[role] || 'secondary';
};

// Inicialização
onMounted(() => {
    loadProfile();
});
</script>

<template>
    <div class="grid" v-if="loading">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>

    <div class="grid" v-else-if="profile">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Meu Perfil</h5>
                    <Button icon="pi pi-refresh" severity="secondary" @click="loadProfile" :loading="loading" v-tooltip.bottom="'Atualizar dados'" />
                </div>

                <TabView v-model:activeIndex="activeTab">
                    <!-- Aba de Perfil -->
                    <TabPanel header="Informações Pessoais">
                        <div class="grid">
                            <!-- Card de Resumo -->
                            <div class="col-12 lg:col-4">
                                <div class="card border-1 surface-border text-center">
                                    <Avatar :label="getInitials()" size="xlarge" shape="circle" class="mb-3" style="background-color: #3b82f6; color: white" />

                                    <h4 class="mb-2">{{ profile.name }}</h4>
                                    <p class="text-600 mb-2">
                                        <i class="pi pi-envelope mr-2"></i>
                                        {{ profile.username }}
                                    </p>
                                    <Tag :value="getRoleName(profile.role)" :severity="getRoleSeverity(profile.role)" class="mb-3" />

                                    <div class="field mt-4" v-if="profile.is_active !== undefined">
                                        <label class="font-medium text-900">Status:</label>
                                        <div class="mt-1">
                                            <Tag :value="profile.is_active ? 'Ativo' : 'Inativo'" :severity="profile.is_active ? 'success' : 'danger'" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Formulário de Edição -->
                            <div class="col-12 lg:col-8">
                                <div class="card border-1 surface-border">
                                    <h6 class="text-900 font-semibold mb-3">Editar Informações</h6>

                                    <form @submit.prevent="updateProfile">
                                        <div class="field mb-3">
                                            <label for="name" class="font-medium text-900">Nome *</label>
                                            <InputText id="name" v-model="profileForm.name" placeholder="Seu nome completo" :class="{ 'p-invalid': profileErrors.name }" class="w-full mt-2" />
                                            <small v-if="profileErrors.name" class="p-error">
                                                {{ profileErrors.name }}
                                            </small>
                                        </div>

                                        <div class="field mb-3">
                                            <label for="username" class="font-medium text-900">Usuario *</label>
                                            <InputText id="username" readonly v-model="profileForm.username" placeholder="seu.username@exemplo.com" type="username" :class="{ 'p-invalid': profileErrors.username }" class="w-full mt-2" />
                                            <small v-if="profileErrors.username" class="p-error">
                                                {{ profileErrors.username }}
                                            </small>
                                        </div>

                                        <div class="field mb-4">
                                            <label for="mobile" class="font-medium text-900">Telefone</label>
                                            <InputText id="mobile" v-model="profileForm.mobile" placeholder="+258 84 123 4567" :class="{ 'p-invalid': profileErrors.mobile }" class="w-full mt-2" />
                                            <small v-if="profileErrors.mobile" class="p-error">
                                                {{ profileErrors.mobile }}
                                            </small>
                                        </div>

                                        <div class="flex justify-content-end gap-2">
                                            <Button label="Cancelar" icon="pi pi-times" severity="secondary" @click="resetProfileForm" />
                                            <Button label="Salvar Alterações" icon="pi pi-check" type="submit" :loading="updating" />
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <!-- Informações de Auditoria -->
                            <div class="col-12">
                                <div class="card border-1 surface-border">
                                    <h6 class="text-900 font-semibold mb-3">Informações da Conta</h6>

                                    <div class="grid">
                                        <div class="col-12 md:col-6">
                                            <div class="field mb-0">
                                                <label class="font-medium text-900">Conta criada em:</label>
                                                <div class="mt-1">{{ moment(profile.createdAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                            </div>
                                        </div>

                                        <div class="col-12 md:col-6" v-if="profile.updatedAt">
                                            <div class="field mb-0">
                                                <label class="font-medium text-900">Última atualização:</label>
                                                <div class="mt-1">{{ moment(profile.updatedAt).format('DD/MM/YYYY HH:mm:ss') }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <!-- Aba de Segurança -->
                    <TabPanel header="Segurança">
                        <div class="grid">
                            <div class="col-12 lg:col-6">
                                <div class="card border-1 surface-border">
                                    <h6 class="text-900 font-semibold mb-3">Alterar Senha</h6>

                                    <form @submit.prevent="changePassword">
                                        <div class="field mb-3">
                                            <label for="currentPassword" class="font-medium text-900">Senha Atual *</label>
                                            <Password
                                                id="currentPassword"
                                                v-model="passwordForm.currentPassword"
                                                placeholder="Digite sua senha atual"
                                                :class="{ 'p-invalid': passwordErrors.currentPassword }"
                                                class="w-full mt-2"
                                                :feedback="false"
                                                toggleMask
                                                inputClass="w-full"
                                            />
                                            <small v-if="passwordErrors.currentPassword" class="p-error">
                                                {{ passwordErrors.currentPassword }}
                                            </small>
                                        </div>

                                        <div class="field mb-3">
                                            <label for="newPassword" class="font-medium text-900">Nova Senha *</label>
                                            <Password
                                                id="newPassword"
                                                v-model="passwordForm.newPassword"
                                                placeholder="Digite a nova senha (mín. 6 caracteres)"
                                                :class="{ 'p-invalid': passwordErrors.newPassword }"
                                                class="w-full mt-2"
                                                toggleMask
                                                inputClass="w-full"
                                                promptLabel="Escolha uma senha"
                                                weakLabel="Fraca"
                                                mediumLabel="Média"
                                                strongLabel="Forte"
                                            />
                                            <small v-if="passwordErrors.newPassword" class="p-error">
                                                {{ passwordErrors.newPassword }}
                                            </small>
                                        </div>

                                        <div class="field mb-4">
                                            <label for="confirmNewPassword" class="font-medium text-900">Confirmar Nova Senha *</label>
                                            <Password
                                                id="confirmNewPassword"
                                                v-model="passwordForm.confirmNewPassword"
                                                placeholder="Confirme a nova senha"
                                                :class="{ 'p-invalid': passwordErrors.confirmNewPassword }"
                                                class="w-full mt-2"
                                                :feedback="false"
                                                toggleMask
                                                inputClass="w-full"
                                            />
                                            <small v-if="passwordErrors.confirmNewPassword" class="p-error">
                                                {{ passwordErrors.confirmNewPassword }}
                                            </small>
                                        </div>

                                        <div class="flex justify-content-end gap-2">
                                            <Button label="Cancelar" icon="pi pi-times" severity="secondary" @click="resetPasswordForm" />
                                            <Button label="Alterar Senha" icon="pi pi-lock" type="submit" :loading="changingPassword" />
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div class="col-12 lg:col-6">
                                <div class="card border-1 surface-border">
                                    <h6 class="text-900 font-semibold mb-3">Dicas de Segurança</h6>

                                    <div class="p-3 mb-3 surface-100 border-round">
                                        <div class="flex align-items-start">
                                            <i class="pi pi-check-circle text-green-600 mr-2 mt-1"></i>
                                            <div>
                                                <p class="font-medium mb-1">Use senhas fortes</p>
                                                <p class="text-600 text-sm m-0">Mínimo de 6 caracteres</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="p-3 mb-3 surface-100 border-round">
                                        <div class="flex align-items-start">
                                            <i class="pi pi-shield text-blue-600 mr-2 mt-1"></i>
                                            <div>
                                                <p class="font-medium mb-1">Senhas únicas</p>
                                                <p class="text-600 text-sm m-0">Não reutilize senhas de outros serviços</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="p-3 surface-100 border-round">
                                        <div class="flex align-items-start">
                                            <i class="pi pi-key text-orange-600 mr-2 mt-1"></i>
                                            <div>
                                                <p class="font-medium mb-1">Altere regularmente</p>
                                                <p class="text-600 text-sm m-0">Atualize sua senha periodicamente</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-password-input) {
    width: 100%;
}
</style>
