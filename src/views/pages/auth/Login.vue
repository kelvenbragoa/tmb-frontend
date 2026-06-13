<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import router from '../../../router';
import { baseURL, baseURL2 } from '@/service/APIConstant';

const toast = useToast();
const username = ref('');
const password = ref('');
const checked = ref(false);
const submitted = ref(false);
const errorMessage = ref('');
const logoUrl = computed(() => {
    return `/layout/images/dynamis_logo_croped.png`;
});
const loginUser = () => {
    submitted.value = true;
    // axios.get(`${baseURL2}/sanctum/csrf-cookie`).then(() => {

    axios
        .post(`${baseURL}/auth/login`, {
            username: username.value.toLowerCase(),
            password: password.value
        })
        .then(async (response) => {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.add({ severity: 'success', summary: 'Successo', detail: 'Message Detail', life: 3000 });
            
            // router.replace('/dashboard');
            try {
                await router.push('/dashboard');
            } catch (error) {
                // Se a navegação falhar, força reload
                window.location.href = '/dashboard';
            }
            
        })
        .catch((error) => {
            errorMessage.value = error.response.data.message;
            toast.add({ severity: 'error', summary: `${error.response.data.message}`, detail: 'Message Detail', life: 3000 });
        })
        .finally(() => {
            submitted.value = false;
        });
    // })
};

// onBeforeMount(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         // User is authenticated, proceed to the route
//         router.replace('/dashboard');
//     }
// });
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <router-link to="/">
                <img :src="logoUrl" alt="" class="mb-5 w-20rem flex-shrink-0" />
            </router-link>
            <div style="border-radius: 56px; padding: 0.3rem">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <!-- <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Welcome, Isabel!</div>
                        <span class="text-600 font-medium">Sign in to continue</span>
                    </div> -->
                    <div class="text-center mb-5" v-if="errorMessage">
                        <Button :label="errorMessage" class="mr-2" severity="danger" />
                    </div>

                    <div>
                        <label for="username1" class="block text-900 text-xl font-medium mb-2">Usuario</label>
                        <InputText id="username1" type="text" placeholder="Usuario" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="username" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Palavra passe</label>
                        <Password id="password1" v-model="password" placeholder="Palavra passe" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <!-- <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Forgot password?</a> -->
                        </div>
                        <Button label="Entrar" class="w-full p-3 text-xl" @click="loginUser" v-if="!submitted"></Button>
                        <div class="text-center mb-5" v-if="submitted">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" />
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
</style>
