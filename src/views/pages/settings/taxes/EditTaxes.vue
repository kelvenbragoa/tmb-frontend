<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const isLoading = ref(true);

const data = reactive({
    id: null,
    name: '',
    rate: 0,
    type: '',
    code: '',
    description: '',
    status: true
});

const errors = ref({});

const validationRules = {
    name: { required: true, message: 'Nome é obrigatório' },
    rate: { required: true, message: 'Taxa é obrigatória' },
    type: { required: true, message: 'Tipo é obrigatório' },
    code: { required: true, message: 'Código é obrigatório' }
};

const taxTypes = [
    { label: 'IVA', value: 'IVA' },
    { label: 'IRPS', value: 'IRPS' },
    { label: 'Selo', value: 'SELO' },
    { label: 'Outros', value: 'OUTROS' }
];

const goBack = () => {
    router.push('/settings/taxes');
};

const validateField = (field) => {
    if (validationRules[field]?.required && !data[field]) {
        errors.value[field] = validationRules[field].message;
        return false;
    }
    delete errors.value[field];
    return true;
};

const validateForm = () => {
    let isValid = true;
    Object.keys(validationRules).forEach((field) => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    return isValid;
};

const getTax = async () => {
    try {
        isLoading.value = true;
        
        // Mock data baseado no ID
        const mockData = {
            1: {
                id: 1,
                name: 'IVA Padrão',
                rate: 17.0,
                type: 'IVA',
                status: true,
                description: 'Imposto sobre Valor Acrescentado padrão aplicado na maioria dos produtos e serviços',
                code: 'IVA17',
                createdBy: 'Sistema',
                createdAt: new Date('2024-01-10')
            },
            2: {
                id: 2,
                name: 'IVA Isento',
                rate: 0.0,
                type: 'IVA',
                status: true,
                description: 'Isenção de IVA para produtos e serviços específicos conforme legislação',
                code: 'IVA0',
                createdBy: 'Admin',
                createdAt: new Date('2024-01-10')
            },
            3: {
                id: 3,
                name: 'IRPS Categoria A',
                rate: 10.0,
                type: 'IRPS',
                status: true,
                description: 'Imposto sobre Rendimento de Pessoas Singulares - Categoria A (rendimentos do trabalho)',
                code: 'IRPS10',
                createdBy: 'Sistema',
                createdAt: new Date('2024-01-11')
            },
            4: {
                id: 4,
                name: 'IRPS Categoria B',
                rate: 15.0,
                type: 'IRPS',
                status: true,
                description: 'Imposto sobre Rendimento de Pessoas Singulares - Categoria B (rendimentos empresariais)',
                code: 'IRPS15',
                createdBy: 'Sistema',
                createdAt: new Date('2024-01-11')
            },
            5: {
                id: 5,
                name: 'Selo do Estado',
                rate: 0.5,
                type: 'SELO',
                status: false,
                description: 'Taxa de selo aplicada em documentos e transações específicas',
                code: 'SELO',
                createdBy: 'Admin',
                createdAt: new Date('2024-01-12')
            }
        };

        const tax = mockData[route.params.id];
        
        if (tax) {
            Object.assign(data, tax);
        } else {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Imposto não encontrado', life: 3000 });
            router.push('/settings/taxes');
        }
    } catch (error) {
        console.error('Erro ao carregar imposto:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar imposto', life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

const updateTax = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Por favor, corrija os erros no formulário', life: 3000 });
        return;
    }

    try {
        loading.value = true;
        
        // Simulação da atualização
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Imposto atualizado com sucesso!', life: 3000 });
        router.push('/settings/taxes');
    } catch (error) {
        console.error('Erro ao atualizar imposto:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar imposto', life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getTax();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 class="mb-0">Editar Imposto</h4>
                        <p class="text-500 mb-0">Atualizar informações do imposto</p>
                    </div>
                    <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
                </div>

                <div v-if="isLoading" class="text-center py-4">
                    <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                    <p class="mt-3">Carregando dados...</p>
                </div>

                <form v-else @submit.prevent="updateTax" class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12 lg:col-6">
                        <div class="card">
                            <h5>Informações Básicas</h5>
                            
                            <div class="grid">
                                <div class="col-12">
                                    <label for="name" class="block text-900 font-medium mb-2">Nome do Imposto *</label>
                                    <InputText id="name" v-model="data.name" :class="{ 'p-invalid': errors.name }" class="w-full" placeholder="Ex: IVA Padrão" @blur="validateField('name')" />
                                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label for="code" class="block text-900 font-medium mb-2">Código *</label>
                                    <InputText id="code" v-model="data.code" :class="{ 'p-invalid': errors.code }" class="w-full" placeholder="Ex: IVA17" @blur="validateField('code')" />
                                    <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label for="rate" class="block text-900 font-medium mb-2">Taxa (%) *</label>
                                    <InputNumber id="rate" v-model="data.rate" :class="{ 'p-invalid': errors.rate }" class="w-full" :min="0" :max="100" :minFractionDigits="2" :maxFractionDigits="4" placeholder="0.00" @blur="validateField('rate')" />
                                    <small v-if="errors.rate" class="p-error">{{ errors.rate }}</small>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label for="type" class="block text-900 font-medium mb-2">Tipo *</label>
                                    <Dropdown
                                        id="type"
                                        v-model="data.type"
                                        :options="taxTypes"
                                        optionLabel="label"
                                        optionValue="value"
                                        :class="{ 'p-invalid': errors.type }"
                                        class="w-full"
                                        placeholder="Selecione o tipo"
                                        @change="validateField('type')"
                                    />
                                    <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
                                </div>

                                <div class="col-12 md:col-6">
                                    <label for="status" class="block text-900 font-medium mb-2">Status</label>
                                    <div class="flex align-items-center">
                                        <InputSwitch id="status" v-model="data.status" />
                                        <label for="status" class="ml-2">{{ data.status ? 'Ativo' : 'Inativo' }}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Descrição e Observações -->
                    <div class="col-12 lg:col-6">
                        <div class="card h-full">
                            <h5>Descrição e Observações</h5>
                            
                            <div class="grid">
                                <div class="col-12">
                                    <label for="description" class="block text-900 font-medium mb-2">Descrição</label>
                                    <Textarea id="description" v-model="data.description" class="w-full" rows="5" placeholder="Descrição detalhada do imposto, quando aplicar, legislação relevante, etc." />
                                    <small class="text-500">Forneça uma descrição clara sobre quando e como este imposto deve ser aplicado</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Simulação de Cálculo -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Simulação de Cálculo</h5>
                            <p class="text-500 mb-3">Veja como o imposto será calculado com a taxa atual</p>
                            
                            <div class="grid">
                                <div class="col-12 md:col-3">
                                    <div class="surface-100 p-3 border-round text-center">
                                        <h6 class="mt-0">Valor Base: 1.000 MZN</h6>
                                        <p class="mb-1">Imposto: {{ ((1000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                        <p class="mb-0 font-bold">Total: {{ (1000 + (1000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="surface-100 p-3 border-round text-center">
                                        <h6 class="mt-0">Valor Base: 5.000 MZN</h6>
                                        <p class="mb-1">Imposto: {{ ((5000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                        <p class="mb-0 font-bold">Total: {{ (5000 + (5000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="surface-100 p-3 border-round text-center">
                                        <h6 class="mt-0">Valor Base: 10.000 MZN</h6>
                                        <p class="mb-1">Imposto: {{ ((10000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                        <p class="mb-0 font-bold">Total: {{ (10000 + (10000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="surface-100 p-3 border-round text-center">
                                        <h6 class="mt-0">Valor Base: 50.000 MZN</h6>
                                        <p class="mb-1">Imposto: {{ ((50000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                        <p class="mb-0 font-bold">Total: {{ (50000 + (50000 * (data.rate || 0)) / 100).toFixed(2) }} MZN</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="col-12">
                        <div class="flex justify-content-end gap-2">
                            <Button label="Cancelar" icon="pi pi-times" severity="secondary" @click="goBack" :disabled="loading" />
                            <Button label="Atualizar Imposto" icon="pi pi-check" type="submit" :loading="loading" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
