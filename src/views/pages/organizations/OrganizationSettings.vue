<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import OrganizationService from '@/service/OrganizationService';
import { useOrganizationDemo } from '@/service/OrganizationDemoService';

export default {
    name: 'OrganizationSettings',
    setup() {
        const toast = useToast();
        const orgDemo = useOrganizationDemo();

        // Estado
        const loading = ref(false);
        const saving = ref(false);
        const organization = ref(null);
        const configOptions = ref(null);
        const activeTab = ref(0);
        const logoFile = ref(null);
        const logoPreview = ref(null);
        const isDemoMode = ref(false); // Agora usando dados reais dos endpoints

        // Formulário
        const form = reactive({
            name: '',
            nuit: '',
            address: '',
            city: '',
            mobile: '',
            logo: '',
            business_type_id: null,
            province_id: null,
            currency_id: null,
            language_id: null,
            timezone_id: null,
            email_notifications: true,
            sales_alerts: true,
            inventory_alerts: false
        });

        // Computed
        const businessTypeOptions = computed(() => {
            if (!configOptions.value?.businessTypes) return [];
            return configOptions.value.businessTypes.map((type) => ({
                label: type.name || '',
                value: type.id,
                description: type.description || ''
            }));
        });

        const provinceOptions = computed(() => {
            if (!configOptions.value?.provinces) return [];
            return configOptions.value.provinces.map((province) => ({
                label: province.name || '',
                value: province.id
            }));
        });

        const currencyOptions = computed(() => {
            if (!configOptions.value?.currencies) return [];
            return configOptions.value.currencies.map((currency) => ({
                label: `${currency.name || ''} (${currency.code || ''})`,
                value: currency.id,
                symbol: currency.symbol || ''
            }));
        });

        const languageOptions = computed(() => {
            if (!configOptions.value?.languages) return [];
            return configOptions.value.languages.map((language) => ({
                label: language.name || '',
                value: language.id
            }));
        });

        const timezoneOptions = computed(() => {
            if (!configOptions.value?.timezones) return [];
            return configOptions.value.timezones.map((timezone) => ({
                label: timezone.description || timezone.name || '',
                value: timezone.id
            }));
        });

        const planInfo = computed(() => {
            if (!organization.value?.plan) return null;
            
            const plan = organization.value.plan;
            const badge = OrganizationService.getPlanBadge(plan.name);
            
            return {
                ...plan,
                ...badge
            };
        });

        const statusInfo = computed(() => {
            if (!organization.value) return null;
            return OrganizationService.getStatusBadge(organization.value.is_active);
        });

        const trialInfo = computed(() => {
            if (!organization.value?.trial_expires_at) return null;
            return OrganizationService.formatTrialExpiry(organization.value.trial_expires_at);
        });

        // Métodos
        const loadData = async () => {
            loading.value = true;
            try {
                const [orgData, options] = isDemoMode.value
                    ? await Promise.all([orgDemo.loadOrganizationProfile(), orgDemo.loadConfigOptions()])
                    : await Promise.all([OrganizationService.getOrganizationProfile(), OrganizationService.getConfigOptions()]);

                organization.value = orgData;
                configOptions.value = options;

                // Preencher formulário
                form.name = orgData.name || '';
                form.nuit = orgData.nuit || '';
                form.address = orgData.address || '';
                form.city = orgData.city || '';
                form.mobile = orgData.mobile || '';
                form.logo = orgData.logo || '';
                form.business_type_id = orgData.businessType?.id || null;
                form.province_id = orgData.province?.id || null;
                form.currency_id = orgData.currency?.id || null;
                form.language_id = orgData.language?.id || null;
                form.timezone_id = orgData.timezone?.id || null;
                form.email_notifications = orgData.email_notifications ?? true;
                form.sales_alerts = orgData.sales_alerts ?? true;
                form.inventory_alerts = orgData.inventory_alerts ?? false;

                logoPreview.value = orgData.logo;
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                
                // Se falhar com API real, tentar carregar dados demo como fallback
                if (!isDemoMode.value) {
                    console.log('Tentando carregar dados de demonstração como fallback...');
                    try {
                        const [orgData, options] = await Promise.all([orgDemo.loadOrganizationProfile(), orgDemo.loadConfigOptions()]);
                        organization.value = orgData;
                        configOptions.value = options;
                        
                        // Preencher formulário com dados demo
                        form.name = orgData.name || '';
                        form.nuit = orgData.nuit || '';
                        form.address = orgData.address || '';
                        form.city = orgData.city || '';
                        form.mobile = orgData.mobile || '';
                        form.logo = orgData.logo || '';
                        form.business_type_id = orgData.businessType?.id || null;
                        form.province_id = orgData.province?.id || null;
                        form.currency_id = orgData.currency?.id || null;
                        form.language_id = orgData.language?.id || null;
                        form.timezone_id = orgData.timezone?.id || null;
                        form.email_notifications = orgData.email_notifications ?? true;
                        form.sales_alerts = orgData.sales_alerts ?? true;
                        form.inventory_alerts = orgData.inventory_alerts ?? false;

                        logoPreview.value = orgData.logo;
                        
                        // Ativar modo demo
                        isDemoMode.value = true;
                        
                        toast.add({
                            severity: 'warn',
                            summary: 'Modo Fallback',
                            detail: 'Não foi possível conectar à API. Carregando dados de demonstração.',
                            life: 5000
                        });
                        return;
                    } catch (demoError) {
                        console.error('Erro ao carregar dados demo:', demoError);
                    }
                }
                
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar configurações da organização',
                    life: 5000
                });
            } finally {
                loading.value = false;
            }
        };

        const handleLogoUpload = (event) => {
            const file = event.files[0];
            if (file) {
                logoFile.value = file;
                
                // Criar preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    logoPreview.value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        const uploadLogo = async () => {
            if (!logoFile.value) return null;

            try {
                const uploadedLogo = await OrganizationService.uploadLogo(logoFile.value);
                return uploadedLogo.url;
            } catch (error) {
                console.error('Erro ao fazer upload do logo:', error);
                throw error;
            }
        };

        const validateForm = () => {
            const errors = [];

            if (!form.name?.trim()) errors.push('Nome da organização é obrigatório');
            
            // Validar NUIT
            const nuitValidation = OrganizationService.validateNUIT(form.nuit);
            if (nuitValidation !== true) errors.push(nuitValidation);

            // Validar telefone
            const phoneValidation = OrganizationService.validatePhone(form.mobile);
            if (phoneValidation !== true) errors.push(phoneValidation);

            // Validar URL do logo
            const logoValidation = OrganizationService.validateURL(form.logo);
            if (logoValidation !== true) errors.push(logoValidation);

            return errors;
        };

        const saveOrganization = async () => {
            const errors = validateForm();
            if (errors.length > 0) {
                toast.add({
                    severity: 'error',
                    summary: 'Erro de Validação',
                    detail: errors.join(', '),
                    life: 5000
                });
                return;
            }

            saving.value = true;
            try {
                let logoUrl = form.logo;

                // Upload do logo se houver arquivo selecionado
                if (logoFile.value) {
                    logoUrl = isDemoMode.value ? (await orgDemo.uploadLogo(logoFile.value)).url : await uploadLogo();
                }

                const updateData = {
                    ...form,
                    logo: logoUrl
                };

                const updatedOrg = isDemoMode.value ? await orgDemo.updateOrganizationProfile(updateData) : await OrganizationService.updateOrganizationProfile(updateData);
                organization.value = updatedOrg;

                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Configurações da organização atualizadas com sucesso',
                    life: 3000
                });

                // Resetar upload de logo
                logoFile.value = null;
            } catch (error) {
                console.error('Erro ao salvar organização:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao atualizar configurações da organização',
                    life: 5000
                });
            } finally {
                saving.value = false;
            }
        };

        const resetForm = () => {
            if (organization.value) {
                // Restaurar valores originais
                const orgData = organization.value;
                form.name = orgData.name || '';
                form.nuit = orgData.nuit || '';
                form.address = orgData.address || '';
                form.city = orgData.city || '';
                form.mobile = orgData.mobile || '';
                form.logo = orgData.logo || '';
                form.business_type_id = orgData.businessType?.id || null;
                form.province_id = orgData.province?.id || null;
                form.currency_id = orgData.currency?.id || null;
                form.language_id = orgData.language?.id || null;
                form.timezone_id = orgData.timezone?.id || null;
                form.email_notifications = orgData.email_notifications ?? true;
                form.sales_alerts = orgData.sales_alerts ?? true;
                form.inventory_alerts = orgData.inventory_alerts ?? false;

                logoPreview.value = orgData.logo;
                logoFile.value = null;

                toast.add({
                    severity: 'info',
                    summary: 'Informação',
                    detail: 'Formulário restaurado aos valores originais',
                    life: 3000
                });
            }
        };

        const formatCurrency = (value, currencyCode = 'MZN') => {
            return OrganizationService.formatCurrency(value, currencyCode);
        };

        // Lifecycle
        onMounted(loadData);

        return {
            // Estado
            loading,
            saving,
            organization,
            configOptions,
            activeTab,
            logoFile,
            logoPreview,
            form,
            isDemoMode,

            // Computed
            businessTypeOptions,
            provinceOptions,
            currencyOptions,
            languageOptions,
            timezoneOptions,
            planInfo,
            statusInfo,
            trialInfo,

            // Métodos
            loadData,
            handleLogoUpload,
            saveOrganization,
            resetForm,
            formatCurrency
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Configurações da Organização</h5>
                    <div class="flex gap-2">
                        <Button label="Restaurar" icon="pi pi-refresh" @click="resetForm" class="p-button-outlined" :disabled="loading || saving" />
                        <Button label="Salvar" icon="pi pi-check" @click="saveOrganization" :loading="saving" :disabled="loading" />
                    </div>
                </div>

                <!-- Demo Mode Banner -->
                <div v-if="isDemoMode" class="p-3 mb-4 bg-blue-50 border-1 border-blue-200 border-round flex align-items-center">
                    <i class="pi pi-info-circle text-blue-600 mr-3"></i>
                    <div class="flex-1">
                        <span class="font-medium text-blue-800">Modo Demonstração</span>
                        <p class="m-0 text-blue-700 text-sm">Esta página está funcionando com dados de demonstração. As alterações não serão salvas permanentemente.</p>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-content-center align-items-center" style="min-height: 400px">
                    <ProgressSpinner />
                </div>

                <!-- Main Content -->
                <div v-else-if="organization">
                    <!-- Status Cards -->
                    <div class="grid mb-4">
                        <div class="col-12 md:col-3">
                            <div class="card border-1 surface-border h-full">
                                <div class="flex align-items-center">
                                    <div class="flex-1">
                                        <span class="block text-500 font-medium mb-1">Status</span>
                                        <Badge :value="statusInfo.value" :severity="statusInfo.severity" />
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                        <i class="pi pi-building text-blue-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-3">
                            <div class="card border-1 surface-border h-full">
                                <div class="flex align-items-center">
                                    <div class="flex-1">
                                        <span class="block text-500 font-medium mb-1">Plano</span>
                                        <Badge v-if="planInfo" :value="planInfo.label" :severity="planInfo.severity" />
                                        <span v-else class="text-500">N/A</span>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                        <i class="pi pi-star text-green-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-3">
                            <div class="card border-1 surface-border h-full">
                                <div class="flex align-items-center">
                                    <div class="flex-1">
                                        <span class="block text-500 font-medium mb-1">Período de Avaliação</span>
                                        <span class="text-900 font-medium">{{ trialInfo || 'N/A' }}</span>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                        <i class="pi pi-clock text-orange-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-3">
                            <div class="card border-1 surface-border h-full">
                                <div class="flex align-items-center">
                                    <div class="flex-1">
                                        <span class="block text-500 font-medium mb-1">Setup</span>
                                        <Badge :value="organization.setup_completed ? 'Concluído' : 'Pendente'" :severity="organization.setup_completed ? 'success' : 'warning'" />
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                        <i class="pi pi-cog text-purple-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <TabView v-model:activeIndex="activeTab">
                        <!-- Informações Básicas -->
                        <TabPanel header="Informações Básicas">
                            <div class="grid">
                                <div class="col-12 md:col-8">
                                    <div class="grid">
                                        <div class="col-12 md:col-6">
                                            <div class="field">
                                                <label for="name" class="font-medium">Nome da Organização *</label>
                                                <InputText id="name" v-model="form.name" class="w-full" placeholder="Digite o nome da empresa" />
                                            </div>
                                        </div>
                                        <div class="col-12 md:col-6">
                                            <div class="field">
                                                <label for="nuit" class="font-medium">NUIT</label>
                                                <InputText id="nuit" v-model="form.nuit" class="w-full" placeholder="000000000" maxlength="9" />
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="field">
                                                <label for="address" class="font-medium">Endereço</label>
                                                <Textarea id="address" v-model="form.address" rows="3" class="w-full" placeholder="Endereço completo da empresa" />
                                            </div>
                                        </div>
                                        <div class="col-12 md:col-6">
                                            <div class="field">
                                                <label for="city" class="font-medium">Cidade</label>
                                                <InputText id="city" v-model="form.city" class="w-full" placeholder="Nome da cidade" />
                                            </div>
                                        </div>
                                        <div class="col-12 md:col-6">
                                            <div class="field">
                                                <label for="mobile" class="font-medium">Telefone</label>
                                                <InputText id="mobile" v-model="form.mobile" class="w-full" placeholder="+258 XX XXX XXXX" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field">
                                        <label class="font-medium mb-3 block">Logo da Empresa</label>
                                        <div class="text-center">
                                            <div v-if="logoPreview" class="mb-3">
                                                <img :src="logoPreview" alt="Logo" class="max-w-full h-auto border-round" style="max-height: 150px" />
                                            </div>
                                            <div v-else class="flex align-items-center justify-content-center bg-gray-100 border-2 border-dashed border-gray-300 border-round mb-3" style="height: 150px">
                                                <i class="pi pi-image text-gray-400 text-4xl"></i>
                                            </div>
                                            <FileUpload mode="basic" accept="image/*" :maxFileSize="2000000" @select="handleLogoUpload" :auto="false" chooseLabel="Selecionar Logo" class="w-full" />
                                            <small class="text-500">Máximo 2MB. Formatos: JPG, PNG, GIF</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Configurações -->
                        <TabPanel header="Configurações">
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label for="business_type" class="font-medium">Tipo de Negócio</label>
                                        <Dropdown id="business_type" v-model="form.business_type_id" :options="businessTypeOptions" optionLabel="label" optionValue="value" placeholder="Selecione o tipo de negócio" class="w-full" />
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label for="province" class="font-medium">Província</label>
                                        <Dropdown id="province" v-model="form.province_id" :options="provinceOptions" optionLabel="label" optionValue="value" placeholder="Selecione a província" class="w-full" />
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label for="currency" class="font-medium">Moeda</label>
                                        <Dropdown id="currency" v-model="form.currency_id" :options="currencyOptions" optionLabel="label" optionValue="value" placeholder="Selecione a moeda" class="w-full" />
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label for="language" class="font-medium">Idioma</label>
                                        <Dropdown id="language" v-model="form.language_id" :options="languageOptions" optionLabel="label" optionValue="value" placeholder="Selecione o idioma" class="w-full" />
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label for="timezone" class="font-medium">Fuso Horário</label>
                                        <Dropdown id="timezone" v-model="form.timezone_id" :options="timezoneOptions" optionLabel="label" optionValue="value" placeholder="Selecione o fuso horário" class="w-full" />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Notificações -->
                        <TabPanel header="Notificações">
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <div class="field-checkbox">
                                        <Checkbox id="email_notifications" v-model="form.email_notifications" :binary="true" />
                                        <label for="email_notifications" class="ml-2 font-medium">Notificações por Email</label>
                                        <small class="block text-500 mt-1">Receber notificações importantes por email</small>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field-checkbox">
                                        <Checkbox id="sales_alerts" v-model="form.sales_alerts" :binary="true" />
                                        <label for="sales_alerts" class="ml-2 font-medium">Alertas de Vendas</label>
                                        <small class="block text-500 mt-1">Notificações sobre vendas importantes</small>
                                    </div>
                                </div>
                                <div class="col-12 md:col-4">
                                    <div class="field-checkbox">
                                        <Checkbox id="inventory_alerts" v-model="form.inventory_alerts" :binary="true" />
                                        <label for="inventory_alerts" class="ml-2 font-medium">Alertas de Estoque</label>
                                        <small class="block text-500 mt-1">Notificações sobre níveis baixos de estoque</small>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Informações do Plano -->
                        <TabPanel header="Plano">
                            <div v-if="organization.plan" class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="card border-1 surface-border">
                                        <h6 class="mt-0">Plano Atual</h6>
                                        <div class="flex align-items-center justify-content-between mb-3">
                                            <span class="text-xl font-bold">{{ organization.plan.name }}</span>
                                            <Badge v-if="planInfo" :value="planInfo.label" :severity="planInfo.severity" />
                                        </div>
                                        <div class="text-500 mb-2">
                                            <i class="pi pi-users mr-2"></i>
                                            <span>Até {{ organization.plan.user_limit }} usuários</span>
                                        </div>
                                        <div class="text-500 mb-3">
                                            <i class="pi pi-money-bill mr-2"></i>
                                            <span>{{ formatCurrency(organization.plan.monthly_price, organization.currency?.code) }}/mês</span>
                                        </div>
                                        <Button label="Alterar Plano" icon="pi pi-arrow-up" class="w-full" />
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="card border-1 surface-border">
                                        <h6 class="mt-0">Informações de Cobrança</h6>
                                        <div class="mb-3">
                                            <span class="text-500">Próxima Cobrança:</span>
                                            <div class="font-medium">{{ new Date(organization.trial_expires_at).toLocaleDateString('pt-BR') }}</div>
                                        </div>
                                        <div class="mb-3">
                                            <span class="text-500">Status do Trial:</span>
                                            <div class="font-medium">{{ trialInfo }}</div>
                                        </div>
                                        <Button label="Histórico de Pagamentos" icon="pi pi-history" class="p-button-outlined w-full" />
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-center py-4">
                                <i class="pi pi-info-circle text-4xl text-500 mb-3"></i>
                                <p class="text-500">Informações do plano não disponíveis</p>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>

                <!-- Error State -->
                <div v-else class="text-center py-4">
                    <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
                    <p class="text-500">Erro ao carregar configurações da organização</p>
                    <Button label="Tentar Novamente" icon="pi pi-refresh" @click="loadData" class="p-button-outlined" />
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
    display: block;
    margin-bottom: 0.5rem;
}

.field-checkbox {
    margin-bottom: 1rem;
}

.card {
    border-radius: 8px;
}
</style>
