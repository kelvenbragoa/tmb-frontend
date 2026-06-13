<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import router from '../../../router';
import { baseURL, baseURL2 } from '@/service/ApiConstant';

const toast = useToast();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const phone = ref('');
const role = ref('admin'); // Valor padrão
const acceptTerms = ref(false);
const submitted = ref(false);
const errorMessage = ref('');

const logoUrl = computed(() => {
    return `/layout/images/dynamis_logo_croped.png`;
});

const validateForm = () => {
    if (!name.value.trim()) {
        errorMessage.value = 'Nome é obrigatório';
        return false;
    }

    if (!email.value.trim()) {
        errorMessage.value = 'Email é obrigatório';
        return false;
    }

    if (!email.value.includes('@')) {
        errorMessage.value = 'Email inválido';
        return false;
    }

    if (password.value.length < 6) {
        errorMessage.value = 'Senha deve ter pelo menos 6 caracteres';
        return false;
    }

    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Senhas não coincidem';
        return false;
    }

    if (!acceptTerms.value) {
        errorMessage.value = 'Você deve aceitar os termos e condições';
        return false;
    }

    errorMessage.value = '';
    return true;
};

const registerUser = () => {
    if (!validateForm()) {
        toast.add({
            severity: 'error',
            summary: 'Erro de validação',
            detail: errorMessage.value,
            life: 3000
        });
        return;
    }

    submitted.value = true;

    axios
        .post(`${baseURL}/auth/register`, {
            name: name.value.trim(),
            email: email.value.toLowerCase().trim(),
            password: password.value,
            role: 'admin'
            // password_confirmation: confirmPassword.value,
            // phone: phone.value.trim(),
            // role: role.value
        })
        .then((response) => {
            toast.add({
                severity: 'success',
                summary: 'Registro realizado com sucesso!',
                detail: 'Conta criada com sucesso. Redirecionando...',
                life: 3000
            });

            // Opcional: fazer login automático após registro
            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                setTimeout(() => {
                    router.replace('/account/setup');
                }, 1500);
            } else {
                // Se não fizer login automático, redirecionar para login
                setTimeout(() => {
                    router.replace('/login');
                }, 1500);
            }
        })
        .catch((error) => {
            const message = error.response?.data?.message || 'Erro ao criar conta';
            errorMessage.value = message;

            toast.add({
                severity: 'error',
                summary: 'Erro no registro',
                detail: message,
                life: 5000
            });
        })
        .finally(() => {
            submitted.value = false;
        });
};

const goToLogin = () => {
    router.push('/login');
};

onBeforeMount(() => {
    const token = localStorage.getItem('token');
    if (token) {
        // User is already authenticated, redirect to dashboard
        router.replace('/dashboard');
    }
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <router-link to="/">
                <img :src="logoUrl" alt="" class="mb-5 w-6rem flex-shrink-0" />
            </router-link>
            <div style="border-radius: 56px; padding: 0.3rem">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Criar Conta</div>
                        <span class="text-600 font-medium">Preencha os dados para se registrar</span>
                    </div>

                    <div class="text-center mb-5" v-if="errorMessage">
                        <Message :closable="false" severity="error">{{ errorMessage }}</Message>
                    </div>

                    <div>
                        <!-- Nome -->
                        <label for="name" class="block text-900 text-xl font-medium mb-2">Nome Completo</label>
                        <InputText id="name" type="text" placeholder="Seu nome completo" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="name" :class="{ 'p-invalid': errorMessage && !name.trim() }" />

                        <!-- Email -->
                        <label for="email" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email" type="email" placeholder="Seu email" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" :class="{ 'p-invalid': errorMessage && (!email.trim() || !email.includes('@')) }" />

                        <!-- Telefone (opcional) -->
                        <label for="phone" class="block text-900 text-xl font-medium mb-2">Telefone <small class="text-500">(opcional)</small></label>
                        <InputText id="phone" type="tel" placeholder="Seu telefone" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="phone" />

                        <!-- Senha -->
                        <label for="password" class="block text-900 font-medium text-xl mb-2">Senha</label>
                        <Password
                            id="password"
                            v-model="password"
                            placeholder="Sua senha"
                            :toggleMask="true"
                            class="w-full mb-3"
                            inputClass="w-full"
                            :inputStyle="{ padding: '1rem' }"
                            :class="{ 'p-invalid': errorMessage && password.length < 6 }"
                            :feedback="false"
                        />

                        <!-- Confirmar Senha -->
                        <label for="confirmPassword" class="block text-900 font-medium text-xl mb-2">Confirmar Senha</label>
                        <Password
                            id="confirmPassword"
                            v-model="confirmPassword"
                            placeholder="Confirme sua senha"
                            :toggleMask="true"
                            class="w-full mb-5"
                            inputClass="w-full"
                            :inputStyle="{ padding: '1rem' }"
                            :class="{ 'p-invalid': errorMessage && password !== confirmPassword }"
                            :feedback="false"
                        />

                        <!-- Aceitar termos -->
                        <div class="flex align-items-center justify-content-start mb-5">
                            <Checkbox v-model="acceptTerms" id="terms" binary class="mr-2"></Checkbox>
                            <label for="terms" class="text-900">
                                Eu aceito os
                                <a href="#" class="font-medium no-underline ml-1 cursor-pointer" style="color: var(--primary-color)"> termos e condições </a>
                            </label>
                        </div>

                        <!-- Botão de registro -->
                        <Button label="Criar Conta" class="w-full p-3 text-xl mb-4" @click="registerUser" v-if="!submitted" :disabled="!acceptTerms" />

                        <!-- Loading -->
                        <div class="text-center mb-4" v-if="submitted">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Criando conta..." />
                        </div>

                        <!-- Link para login -->
                        <div class="text-center">
                            <span class="text-600">Já tem uma conta? </span>
                            <a class="font-medium no-underline cursor-pointer" style="color: var(--primary-color)" @click="goToLogin"> Faça login aqui </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.p-invalid {
    border-color: var(--red-500) !important;
}
</style>
