<script setup>
import CustomerService from '@/service/CustomerService';
import TicketTypeService from '@/service/TicketTypeService';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);
const isEdit = ref(false);

const customer = ref({
    name: '',
    email: '',
    mobile: '',
    nuit: '',
    ticket_type_id: ''
});

const ticketTypes = ref([]);

const getTicketTypes = async () => {
    try {
        const response = await TicketTypeService.getAllTicketTypes({ limit: 1000 });
        ticketTypes.value = response.items.map((type) => ({
            label: `${type.name} (${type.code})`,
            value: type.id
        }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar tipos de bilhete', life: 3000 });
    }
};

const getCustomerById = async () => {
    if (route.params.id) {
        isEdit.value = true;
        loading.value = true;
        try {
            const response = await CustomerService.getCustomerById(route.params.id);
            customer.value = response;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar cliente', life: 3000 });
        } finally {
            loading.value = false;
        }
    }
};

const save = async () => {
    loading.value = true;
    try {
        if (isEdit.value) {
            await CustomerService.updateCustomer(route.params.id, customer.value);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado com sucesso', life: 3000 });
        } else {
            await CustomerService.createCustomer(customer.value);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente criado com sucesso', life: 3000 });
        }
        router.push('/costumers');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar cliente', life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getTicketTypes();
    getCustomerById();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">{{ isEdit ? 'Editar Cliente' : 'Novo Cliente' }}</h5>
                    <router-link to="/costumers">
                        <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-text" />
                    </router-link>
                </div>

                <div v-if="loading && isEdit" class="flex justify-content-center">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <form @submit.prevent="save" v-else>
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="name" class="font-medium">Nome Completo *</label>
                                <InputText id="name" v-model="customer.name" placeholder="Nome completo do cliente" class="w-full" required />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="email" class="font-medium">Email *</label>
                                <InputText id="email" v-model="customer.email" type="email" placeholder="exemplo@email.com" class="w-full" required />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="mobile" class="font-medium">Celular *</label>
                                <InputText id="mobile" v-model="customer.mobile" placeholder="+258 84 123 4567" class="w-full" required />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="nuit" class="font-medium">NUIT *</label>
                                <InputText id="nuit" v-model="customer.nuit" placeholder="Número Único de Identificação Tributária" class="w-full" required />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="ticket_type_id" class="font-medium">Tipo de Bilhete *</label>
                                <Dropdown id="ticket_type_id" v-model="customer.ticket_type_id" :options="ticketTypes" optionLabel="label" optionValue="value" placeholder="Selecione o tipo de bilhete" class="w-full" required />
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-content-end mt-4">
                        <Button type="submit" :label="isEdit ? 'Atualizar' : 'Criar'" :loading="loading" icon="pi pi-check" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>