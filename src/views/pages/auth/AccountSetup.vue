<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import router from '../../../router';
import { baseURL } from '@/service/ApiConstant';

// Importações dos componentes PrimeVue
import Stepper from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import Avatar from 'primevue/avatar';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';

const toast = useToast();
const active = ref(0);
const submitting = ref(false);

// Dados do usuário logado
const userData = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const logoUrl = computed(() => {
    return `/layout/images/dynamis_logo_croped.png`;
});

const maxBirthDate = new Date();
maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 13);

// Dados do formulário
const profile = ref({
    fullName: userData.value.name || '',
    phone: '',
    birthDate: null,
    bio: '',
    avatar: null
});

const company = ref({
    name: '',
    type: '',
    nuit: '',
    address: '',
    city: '',
    province: ''
});

const settings = ref({
    currency: 'MZN',
    language: 'pt',
    timezone: 'Africa/Maputo',
    notifications: {
        email: true,
        sales: true,
        inventory: true
    }
});

const avatarPreview = ref(null);

// ✅ DADOS RAW DA API
const businessTypesRaw = ref([]);
const provincesRaw = ref([]);
const currenciesRaw = ref([]);
const languagesRaw = ref([]);
const timezonesRaw = ref([]);

// ✅ DADOS ESTÁTICOS COMO FALLBACK
const staticBusinessTypes = [
    { label: 'Varejo', value: 'retail' },
    { label: 'Atacado', value: 'wholesale' },
    { label: 'Restaurante', value: 'restaurant' },
    { label: 'Serviços', value: 'services' },
    { label: 'Outro', value: 'other' }
];

const staticProvinces = [
    { label: 'Maputo Cidade', value: 'maputo_city' },
    { label: 'Maputo Província', value: 'maputo_province' },
    { label: 'Gaza', value: 'gaza' },
    { label: 'Inhambane', value: 'inhambane' },
    { label: 'Sofala', value: 'sofala' },
    { label: 'Manica', value: 'manica' },
    { label: 'Tete', value: 'tete' },
    { label: 'Zambézia', value: 'zambezia' },
    { label: 'Nampula', value: 'nampula' },
    { label: 'Cabo Delgado', value: 'cabo_delgado' },
    { label: 'Niassa', value: 'niassa' }
];

const staticCurrencies = [
    { label: 'Metical (MZN)', value: 'MZN' },
    { label: 'Dólar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' }
];

const staticLanguages = [
    { label: 'Português', value: 'pt' },
    { label: 'English', value: 'en' }
];

const staticTimezones = [
    { label: 'África/Maputo (GMT+2)', value: 'Africa/Maputo' },
    { label: 'UTC (GMT+0)', value: 'UTC' }
];

// ✅ COMPUTED PARA USAR DADOS DA API OU FALLBACK
const businessTypes = computed(() => {
    if (businessTypesRaw.value && businessTypesRaw.value.length > 0) {
        return businessTypesRaw.value.map((item) => ({
            label: item.name,
            value: item.code || item.id
        }));
    }
    return staticBusinessTypes;
});

const provinces = computed(() => {
    if (provincesRaw.value && provincesRaw.value.length > 0) {
        return provincesRaw.value.map((item) => ({
            label: item.name,
            value: item.code || item.id
        }));
    }
    return staticProvinces;
});

const currencies = computed(() => {
    if (currenciesRaw.value && currenciesRaw.value.length > 0) {
        return currenciesRaw.value.map((item) => ({
            label: `${item.name} (${item.code})`,
            value: item.code
        }));
    }
    return staticCurrencies;
});

const languages = computed(() => {
    if (languagesRaw.value && languagesRaw.value.length > 0) {
        return languagesRaw.value.map((item) => ({
            label: item.name,
            value: item.code
        }));
    }
    return staticLanguages;
});

const timezones = computed(() => {
    if (timezonesRaw.value && timezonesRaw.value.length > 0) {
        return timezonesRaw.value.map((item) => ({
            label: item.display_name || item.name,
            value: item.name
        }));
    }
    return staticTimezones;
});

// ✅ MÉTODOS AUXILIARES CORRIGIDOS
const getCurrencyLabel = (value) => {
    const currency = currencies.value.find((c) => c.value === value);
    return currency ? currency.label : value;
};

const getLanguageLabel = (value) => {
    const language = languages.value.find((l) => l.value === value);
    return language ? language.label : value;
};

const getBusinessTypeLabel = (value) => {
    const businessType = businessTypes.value.find((bt) => bt.value === value);
    return businessType ? businessType.label : value;
};

const getProvinceLabel = (value) => {
    const province = provinces.value.find((p) => p.value === value);
    return province ? province.label : value;
};

const getTimezoneLabel = (value) => {
    const timezone = timezones.value.find((t) => t.value === value);
    return timezone ? timezone.label : value;
};

const onAvatarSelect = (event) => {
    const file = event.files[0];
    if (file) {
        profile.value.avatar = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarPreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};
const completeSetup = async () => {
    submitting.value = true;

    try {
        // ✅ DADOS SIMPLES - APENAS ORGANIZAÇÃO
        const payload = {
            name: company.value.name,
            nuit: company.value.nuit || null,
            address: company.value.address || null,
            city: company.value.city || null,
            province: company.value.province || null,
            email_notifications: settings.value.notifications?.email ?? true,
            sales_alerts: settings.value.notifications?.sales ?? true,
            inventory_alerts: settings.value.notifications?.inventory ?? true,
        };

        console.log('🔄 Enviando dados da organização:', payload);

        if (!payload.name) {
            throw new Error('Nome da empresa é obrigatório');
        }

        const response = await axios.post(`${baseURL}/organizations/complete-setup`, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('✅ Resposta do servidor:', response.data);

        toast.add({
            severity: 'success',
            summary: 'Configuração Concluída',
            detail: 'Dados da organização atualizados com sucesso!',
            life: 3000
        });

        router.replace('/dashboard');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar organização:', error);
        console.error('Detalhes do erro:', error.response?.data);
        
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.response?.data?.message || error.message || 'Erro ao atualizar dados da organização.',
            life: 5000
        });
    } finally {
        submitting.value = false;
    }
};

// const completeSetup = async () => {
//     submitting.value = true;

//     try {
//         const formData = new FormData();

//         // Adicionar dados do perfil
//         formData.append('profile', JSON.stringify(profile.value));
//         formData.append('company', JSON.stringify(company.value));
//         formData.append('settings', JSON.stringify(settings.value));

//         // Adicionar avatar se existir
//         // if (profile.value.avatar) {
//         //     formData.append('avatar', profile.value.avatar);
//         // }

//         console.log('🔄 Enviando dados de configuração:', {
//             profile: profile.value,
//             company: company.value,
//             settings: settings.value
//         });
//         console.log(formData);

//         const response = await axios.post(`${baseURL}/organization/complete-setup`, formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//                 Authorization: `Bearer ${localStorage.getItem('token')}`
//             }
//         });

//         toast.add({
//             severity: 'success',
//             summary: 'Configuração Concluída',
//             detail: 'Sua conta foi configurada com sucesso!',
//             life: 3000
//         });

//         // Atualizar dados do usuário no localStorage
//         // localStorage.setItem('user', JSON.stringify(response.data.user));

//         // router.replace('/dashboard');
//     } catch (error) {
//         console.error('Erro ao completar configuração:', error);
//         toast.add({
//             severity: 'error',
//             summary: 'Erro',
//             detail: 'Erro ao salvar configurações. Tente novamente.',
//             life: 5000
//         });
//     } finally {
//         submitting.value = false;
//     }
// };

const skipSetup = () => {
    router.replace('/dashboard');
};

// ✅ FUNÇÕES PARA CARREGAR DADOS DA API
const getLanguageData = async () => {
    try {
        console.log('🔄 Carregando idiomas...');
        const response = await axios.get(`${baseURL}/language`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        languagesRaw.value = response.data;
        console.log('✅ Idiomas carregados:', languagesRaw.value);
    } catch (error) {
        console.error('❌ Erro ao carregar idiomas:', error);
        languagesRaw.value = [];
    }
};

const getTimezoneData = async () => {
    try {
        console.log('🔄 Carregando fusos horários...');
        const response = await axios.get(`${baseURL}/timezone`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        timezonesRaw.value = response.data;
        console.log('✅ Fusos horários carregados:', timezonesRaw.value);
    } catch (error) {
        console.error('❌ Erro ao carregar fusos horários:', error);
        timezonesRaw.value = [];
    }
};

const getCurrencyData = async () => {
    try {
        console.log('🔄 Carregando moedas...');
        const response = await axios.get(`${baseURL}/currency`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        currenciesRaw.value = response.data;
        console.log('✅ Moedas carregadas:', currenciesRaw.value);
    } catch (error) {
        console.error('❌ Erro ao carregar moedas:', error);
        currenciesRaw.value = [];
    }
};

const getBusinessData = async () => {
    try {
        console.log('🔄 Carregando tipos de negócio...');
        const response = await axios.get(`${baseURL}/business-type`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        businessTypesRaw.value = response.data;
        console.log('✅ Tipos de negócio carregados:', businessTypesRaw.value);
    } catch (error) {
        console.error('❌ Erro ao carregar tipos de negócio:', error);
        businessTypesRaw.value = [];
    }
};

const getProvinceData = async () => {
    try {
        console.log('🔄 Carregando províncias...');
        const response = await axios.get(`${baseURL}/province`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        provincesRaw.value = response.data;
        console.log('✅ Províncias carregadas:', provincesRaw.value);
    } catch (error) {
        console.error('❌ Erro ao carregar províncias:', error);
        provincesRaw.value = [];
    }
};

onMounted(async () => {
    // Verificar se o usuário está logado primeiro
    const token = localStorage.getItem('token');
    if (!token) {
        router.replace('/login');
        return;
    }

    // Carregar dados em paralelo para melhor performance
    try {
        await Promise.allSettled([getLanguageData(), getTimezoneData(), getCurrencyData(), getBusinessData(), getProvinceData()]);
        console.log('🎉 Carregamento de dados concluído');
    } catch (error) {
        console.error('❌ Erro no carregamento:', error);
    }
});
</script>
<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <router-link to="/">
                <img :src="logoUrl" alt="" class="mb-5 w-6rem flex-shrink-0" />
            </router-link>

            <div class="card flex justify-content-center w-full stepper-container">
                <Stepper v-model:activeStep="active" class="w-full">
                    <!-- Step 1: Informações Pessoais -->
                    <StepperPanel>
                        <template #header="{ index, clickCallback }">
                            <button class="bg-transparent border-none inline-flex flex-column gap-2" @click="clickCallback">
                                <span :class="['border-round border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center', { 'bg-primary border-primary': index <= active, 'surface-border': index > active }]">
                                    <i class="pi pi-user" />
                                </span>
                                <span class="text-sm font-medium">Perfil</span>
                            </button>
                        </template>
                        <template #content="{ nextCallback }">
                            <div class="step-content">
                                <div class="step-header">
                                    <div class="text-center mt-3 mb-3 text-2xl font-semibold">Complete seu Perfil</div>
                                    <div class="text-center mb-4 text-600">Adicione informações pessoais para personalizar sua experiência</div>
                                </div>

                                <div class="step-body">
                                    <!-- Upload de Avatar -->
                                    <!-- <div class="flex flex-column align-items-center mb-4">
                                        <div class="relative">
                                            <Avatar :image="avatarPreview" size="xlarge" shape="circle" class="mb-3" :icon="!avatarPreview ? 'pi pi-user' : null" />
                                            <FileUpload
                                                mode="basic"
                                                accept="image/*"
                                                :maxFileSize="1000000"
                                                @select="onAvatarSelect"
                                                chooseLabel="Escolher"
                                                class="absolute bottom-0 right-0"
                                                :auto="true"
                                                :showUploadButton="false"
                                                :showCancelButton="false"
                                                chooseIcon="pi pi-camera"
                                            >
                                                <template #empty>
                                                    <Button icon="pi pi-camera" size="small" rounded />
                                                </template>
                                            </FileUpload>
                                        </div>
                                        <small class="text-500">Clique para adicionar uma foto</small>
                                    </div> -->

                                    <!-- Dados pessoais -->
                                    <div class="grid">
                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="fullName" class="block text-900 font-medium mb-2">Nome Completo</label>
                                                <InputText id="fullName" v-model="profile.fullName" placeholder="Seu nome completo" />
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="phone" class="block text-900 font-medium mb-2">Telefone</label>
                                                <InputText id="phone" v-model="profile.phone" placeholder="Seu número de telefone" />
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="birthDate" class="block text-900 font-medium mb-2">Data de Nascimento</label>
                                                <Calendar v-model="profile.birthDate" dateFormat="dd/mm/yy" placeholder="Selecione sua data de nascimento" :maxDate="maxBirthDate" showIcon />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="step-footer">
                                    <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" :disabled="!profile.fullName?.trim()" class="w-full" />
                                </div>
                            </div>
                        </template>
                    </StepperPanel>

                    <!-- Step 2: Configurações da Empresa/Loja -->
                    <StepperPanel>
                        <template #header="{ index, clickCallback }">
                            <button class="bg-transparent border-none inline-flex flex-column gap-2" @click="clickCallback">
                                <span :class="['border-round border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center', { 'bg-primary border-primary': index <= active, 'surface-border': index > active }]">
                                    <i class="pi pi-building" />
                                </span>
                                <span class="text-sm font-medium">Empresa</span>
                            </button>
                        </template>
                        <template #content="{ prevCallback, nextCallback }">
                            <div class="step-content">
                                <div class="step-header">
                                    <div class="text-center mt-3 mb-3 text-2xl font-semibold">Configure sua Empresa</div>
                                    <div class="text-center mb-4 text-600">Defina as informações da sua empresa ou loja</div>
                                </div>

                                <div class="step-body">
                                    <div class="grid">
                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="companyName" class="block text-900 font-medium mb-2">Nome da Empresa</label>
                                                <InputText id="companyName" v-model="company.name" placeholder="Nome da sua empresa" />
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="companyType" class="block text-900 font-medium mb-2">Tipo de Negócio</label>
                                                <Dropdown v-model="company.type" :options="businessTypes" optionLabel="label" optionValue="value" placeholder="Selecione o tipo de negócio" />
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="nuit" class="block text-900 font-medium mb-2">NUIT</label>
                                                <InputText id="nuit" v-model="company.nuit" placeholder="Número Único de Identificação Tributária" />
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="address" class="block text-900 font-medium mb-2">Endereço</label>
                                                <Textarea v-model="company.address" rows="2" placeholder="Endereço completo da empresa" />
                                            </div>
                                        </div>

                                        <div class="col-6">
                                            <div class="field p-fluid">
                                                <label for="city" class="block text-900 font-medium mb-2">Cidade</label>
                                                <InputText id="city" v-model="company.city" placeholder="Cidade" />
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="field p-fluid">
                                                <label for="province" class="block text-900 font-medium mb-2">Província</label>
                                                <Dropdown v-model="company.province" :options="provinces" optionLabel="label" optionValue="value" placeholder="Província" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="step-footer">
                                    <div class="grid">
                                        <div class="col-6">
                                            <Button label="Voltar" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" class="w-full" />
                                        </div>
                                        <div class="col-6">
                                            <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" :disabled="!company.name?.trim() || !company.type" class="w-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </StepperPanel>

                    <!-- Step 3: Configurações do Sistema -->
                    <StepperPanel>
                        <template #header="{ index, clickCallback }">
                            <button class="bg-transparent border-none inline-flex flex-column gap-2" @click="clickCallback">
                                <span :class="['border-round border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center', { 'bg-primary border-primary': index <= active, 'surface-border': index > active }]">
                                    <i class="pi pi-cog" />
                                </span>
                                <span class="text-sm font-medium">Sistema</span>
                            </button>
                        </template>
                        <template #content="{ prevCallback, nextCallback }">
                            <div class="step-content">
                                <div class="step-header">
                                    <div class="text-center mt-3 mb-3 text-2xl font-semibold">Configurações do Sistema</div>
                                    <div class="text-center mb-4 text-600">Personalize como o sistema funcionará para você</div>
                                </div>

                                <div class="step-body">
                                    <div class="grid">
                                        <div class="col-6">
                                            <div class="field p-fluid">
                                                <label for="currency" class="block text-900 font-medium mb-2">Moeda</label>
                                                <Dropdown v-model="settings.currency" :options="currencies" optionLabel="label" optionValue="value" placeholder="Selecione a moeda" />
                                            </div>
                                        </div>

                                        <div class="col-6">
                                            <div class="field p-fluid">
                                                <label for="language" class="block text-900 font-medium mb-2">Idioma</label>
                                                <Dropdown v-model="settings.language" :options="languages" optionLabel="label" optionValue="value" placeholder="Selecione o idioma" />
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="field p-fluid">
                                                <label for="timezone" class="block text-900 font-medium mb-2">Fuso Horário</label>
                                                <Dropdown v-model="settings.timezone" :options="timezones" optionLabel="label" optionValue="value" placeholder="Selecione o fuso horário" />
                                            </div>
                                        </div>

                                        <!-- Notificações -->
                                        <div class="col-12">
                                            <div class="field">
                                                <label class="block text-900 font-medium mb-3">Notificações</label>
                                                <div class="grid">
                                                    <div class="col-12 md:col-4">
                                                        <div class="flex align-items-center">
                                                            <Checkbox v-model="settings.notifications.email" inputId="emailNotif" binary />
                                                            <label for="emailNotif" class="ml-2">Notificações por email</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-12 md:col-4">
                                                        <div class="flex align-items-center">
                                                            <Checkbox v-model="settings.notifications.sales" inputId="salesNotif" binary />
                                                            <label for="salesNotif" class="ml-2">Alertas de vendas</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-12 md:col-4">
                                                        <div class="flex align-items-center">
                                                            <Checkbox v-model="settings.notifications.inventory" inputId="inventoryNotif" binary />
                                                            <label for="inventoryNotif" class="ml-2">Estoque baixo</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="step-footer">
                                    <div class="grid">
                                        <div class="col-6">
                                            <Button label="Voltar" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" class="w-full" />
                                        </div>
                                        <div class="col-6">
                                            <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" class="w-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </StepperPanel>

                    <!-- Step 4: Finalização -->
                    <StepperPanel>
                        <template #header="{ index, clickCallback }">
                            <button class="bg-transparent border-none inline-flex flex-column gap-2" @click="clickCallback">
                                <span :class="['border-round border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center', { 'bg-primary border-primary': index <= active, 'surface-border': index > active }]">
                                    <i class="pi pi-check" />
                                </span>
                                <span class="text-sm font-medium">Concluir</span>
                            </button>
                        </template>
                        <template #content="{ prevCallback }">
                            <div class="step-content">
                                <div class="step-header">
                                    <div class="mt-3 mb-3 text-center">
                                        <i class="pi pi-check-circle text-6xl text-green-500 mb-3"></i>
                                        <div class="text-2xl font-semibold mb-2">Configuração Concluída!</div>
                                        <div class="text-600 mb-4">Sua conta foi configurada com sucesso. Você já pode começar a usar o Dynamis OptiServ.</div>
                                    </div>
                                </div>

                                <div class="step-body">
                                    <!-- Resumo das configurações -->
                                    <div class="surface-100 border-round p-4">
                                        <div class="text-lg font-semibold mb-3 text-center">Resumo das Configurações</div>
                                        <div class="grid">
                                            <div class="col-12 mb-2">
                                                <div class="flex justify-content-between">
                                                    <strong>Perfil:</strong>
                                                    <span>{{ profile.fullName }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12 mb-2" v-if="company.name">
                                                <div class="flex justify-content-between">
                                                    <strong>Empresa:</strong>
                                                    <span>{{ company.name }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12 mb-2">
                                                <div class="flex justify-content-between">
                                                    <strong>Moeda:</strong>
                                                    <span>{{ getCurrencyLabel(settings.currency) }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12 mb-2">
                                                <div class="flex justify-content-between">
                                                    <strong>Idioma:</strong>
                                                    <span>{{ getLanguageLabel(settings.language) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="step-footer">
                                    <div class="grid">
                                        <div class="col-6">
                                            <Button label="Voltar" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" class="w-full" />
                                        </div>
                                        <div class="col-6">
                                            <Button label="Ir para Dashboard" icon="pi pi-home" @click="completeSetup" :loading="submitting" class="w-full" />
                                        </div>
                                    </div>

                                    <!-- <div class="col-12 mt-2">
                                        <Button label="Pular por agora" severity="secondary" @click="skipSetup" text size="small" class="w-full" />
                                    </div> -->
                                </div>
                            </div>
                        </template>
                    </StepperPanel>
                </Stepper>
            </div>
        </div>
    </div>
</template>
<style scoped>
.surface-ground {
    background: var(--surface-ground);
}

.stepper-container {
    width: 100%;
    max-width: 70rem;
    min-height: 70vh;
    overflow-x: hidden;
}

.step-content {
    display: flex;
    flex-direction: column;
    min-height: 70vh;
    width: 55rem; /* Largura fixa ao invés de max-width */
    margin: 0 auto;
    padding: 0 1rem;
    box-sizing: border-box;
    overflow-x: hidden;
}

.step-header {
    flex-shrink: 0;
    margin-bottom: 2rem;
    width: 100%;
    box-sizing: border-box;
}

.step-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 1rem;
    width: 100%;
    box-sizing: border-box;
    min-height: 35rem; /* Altura mínima fixa para o corpo */
}

.step-footer {
    flex-shrink: 0;
    margin-top: 2rem;
    padding-top: 1rem;
    width: 100%;
    box-sizing: border-box;
    height: 4rem; /* Altura fixa para o footer */
}

.p-stepper {
    width: 100%;
    overflow-x: hidden;
}

/* Forçar largura fixa em todos os panels */
.p-stepper-panels {
    width: 100%;
}

.p-stepper-panel {
    width: 100% !important;
}

.p-stepper-content {
    width: 100% !important;
    display: flex;
    justify-content: center;
}

/* Garante que o grid não ultrapasse a largura */
.grid {
    margin: 0 !important;
    width: 100%;
    box-sizing: border-box;
}

.col-12,
.col-6 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    box-sizing: border-box;
}

/* Garante que inputs não ultrapassem a largura */
.p-inputtext,
.p-dropdown,
.p-calendar,
.p-inputtextarea {
    max-width: 100%;
    box-sizing: border-box;
    width: 100%;
}

/* Avatar container com largura fixa */
.avatar-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
    height: 8rem; /* Altura fixa para consistência */
}

/* Resumo com largura fixa */
.summary-container {
    width: 100%;
    max-width: none;
    box-sizing: border-box;
}

/* Responsividade */
@media (max-width: 1200px) {
    .stepper-container {
        max-width: 90vw;
        margin: 0 auto;
    }

    .step-content {
        width: 42rem; /* Reduzido para telas menores */
    }
}

@media (max-width: 768px) {
    .stepper-container {
        max-width: 95vw;
        min-height: 80vh;
        margin: 0 auto;
    }

    .step-content {
        width: calc(100vw - 2rem); /* Largura fixa baseada na viewport */
        max-width: 35rem;
        min-height: 70vh;
        padding: 0 0.5rem;
    }

    .step-body {
        min-height: 30rem; /* Altura menor para mobile */
    }

    .step-header .text-2xl {
        font-size: 1.5rem;
    }

    /* Em mobile, forçar colunas de 6 para ficar 12 */
    .col-6 {
        flex: 0 0 100% !important;
        max-width: 100% !important;
    }
}

@media (max-width: 480px) {
    .step-content {
        width: calc(100vw - 1rem);
        max-width: 30rem;
    }
}

/* Animações suaves */
.step-content {
    transition: all 0.3s ease-in-out;
}

/* Melhorar aparência do FileUpload */
.p-fileupload-basic {
    padding: 0.5rem;
    border-radius: 50%;
    background: var(--primary-color);
    border: none;
}

.p-fileupload-basic .p-button {
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    padding: 0;
}

/* Melhorar espaçamento dos campos */
.field {
    margin-bottom: 1.5rem;
    width: 100%;
    box-sizing: border-box;
}

/* Melhorar aparência do resumo */
.surface-100 {
    background: var(--surface-100);
    border: 1px solid var(--surface-300);
    box-sizing: border-box;
    max-width: 100%;
}

/* Prevenir overflow em textos longos */
.text-600,
.text-900 {
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* Container principal sem scroll horizontal */
.min-w-screen {
    overflow-x: hidden;
}

/* Garante que o card principal não ultrapasse */
.card {
    box-sizing: border-box;
    max-width: 100%;
    overflow-x: hidden;
}

/* Força largura consistente do stepper */
.p-stepper-header {
    justify-content: center;
    margin-bottom: 2rem;
}

/* Botões com largura consistente */
.step-footer .p-button {
    min-height: 2.5rem;
}
</style>
