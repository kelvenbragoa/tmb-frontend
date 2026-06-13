<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';
import moment from 'moment';
import QuotationService from '@/service/QuotationService';
import ConvertToInvoiceModal from '@/components/ConvertToInvoiceModal.vue';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const quotations = ref([]);
const quotationsMeta = ref({});
const isLoadingData = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    quotation_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'costumer.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const selectedQuotations = ref([]);
const first = ref(0);
const globalFilterValue = ref('');

// Variáveis para conversão em fatura
const showConvertModal = ref(false);
const selectedQuotationForConvert = ref(null);
const isConverting = ref(false);

// Parâmetros de busca da API (será usado futuramente)
// const searchParams = ref({
//     page: 1,
//     limit: 10,
//     search: '',
//     status: '',
//     costumer_id: null
// });

const statusOptions = [
    { label: 'Rascunho', value: 'DRAFT', severity: 'info' },
    { label: 'Enviado', value: 'SENT', severity: 'warning' },
    { label: 'Aceito', value: 'ACCEPTED', severity: 'success' },
    { label: 'Rejeitado', value: 'REJECTED', severity: 'danger' },
    { label: 'Expirado', value: 'EXPIRED', severity: 'secondary' }
];

const getQuotationsData = async () => {
    try {
        isLoadingData.value = true;
        
        // Usar API real em produção, mock em desenvolvimento
        const response = await QuotationService.getQuotations();
        
        quotations.value = response.items;
        quotationsMeta.value = response.meta;
    } catch (error) {
        console.error('Erro ao carregar cotações:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar cotações', life: 3000 });
    } finally {
        isLoadingData.value = false;
    }
};

const onGlobalFilterChange = () => {
    filters.value.global.value = globalFilterValue.value;
};

const getStatusSeverity = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.severity : 'info';
};

const getStatusLabel = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const createQuotation = () => {
    router.push('/sales/quotations/create');
};

const editQuotation = (quotation) => {
    router.push(`/sales/quotations/${quotation.id}/edit`);
};

const viewQuotation = (quotation) => {
    router.push(`/sales/quotations/${quotation.id}`);
};

const viewPdf = (quotation) => {
    router.push(`/sales/quotations/${quotation.id}/pdf`);
};

const duplicateQuotation = async (quotation) => {
    try {
        await QuotationService.duplicateQuotation(quotation.id);
        await getQuotationsData();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'cotação duplicado com sucesso', life: 3000 });
    } catch (error) {
        console.error('Erro ao duplicar cotação:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao duplicar cotação', life: 3000 });
    }
};

const convertToInvoice = async (quotation) => {
    const status = quotation.status?.toUpperCase();
    if (status !== 'ACCEPTED') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas cotações aceitas podem ser convertidas em faturas', life: 3000 });
        return;
    }
    
    selectedQuotationForConvert.value = quotation;
    showConvertModal.value = true;
};

const handleConvertToInvoice = async (invoiceData) => {
    try {
        isConverting.value = true;
        
        const response = await QuotationService.convertToInvoice(
            selectedQuotationForConvert.value.id, 
            invoiceData
        );
        
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: `Cotação ${selectedQuotationForConvert.value.quotation_number} convertida em fatura ${response.invoice_number}`, 
            life: 5000 
        });
        
        showConvertModal.value = false;
        selectedQuotationForConvert.value = null;
        
        // Redirecionar para a fatura criada
        router.push(`/sales/invoices/${response.id}`);
        
    } catch (error) {
        console.error('Erro ao converter cotação:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao converter cotação em fatura. Tente novamente.', 
            life: 3000 
        });
    } finally {
        isConverting.value = false;
    }
};

const deleteQuotation = (quotation) => {
    confirm.require({
        message: `Tem certeza que deseja excluir o cotação ${quotation.number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                // Mock API
                setTimeout(() => {
                    quotations.value = quotations.value.filter((q) => q.id !== quotation.id);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'cotação excluído com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir cotação:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir cotação', life: 3000 });
            }
        }
    });
};

const deleteSelectedQuotations = () => {
    if (selectedQuotations.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione pelo menos um cotação', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir ${selectedQuotations.value.length} cotação(s) selecionado(s)?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                // Mock API
                setTimeout(() => {
                    const selectedIds = selectedQuotations.value.map((q) => q.id);
                    quotations.value = quotations.value.filter((q) => !selectedIds.includes(q.id));
                    selectedQuotations.value = [];
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'cotações excluídos com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir cotações:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir cotações', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    getQuotationsData();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h3><i class="pi pi-file-text mr-2"></i>Gestão de Cotações</h3>
                    <div class="flex gap-2">
                        <Button label="Excluir Selecionados" icon="pi pi-trash" class="p-button-danger p-button-outlined" @click="deleteSelectedQuotations" :disabled="!selectedQuotations || selectedQuotations.length === 0" />
                        <Button label="Nova Cotação" icon="pi pi-plus" @click="createQuotation" />
                    </div>
                </div>
                <div class="flex justify-content-between flex-column sm:flex-row">
                            <span class="p-input-icon-left mb-2">
                                
                                <InputText v-model="globalFilterValue" placeholder="Buscar cotações..." @input="onGlobalFilterChange" class="w-full" />
                            </span>
                        </div>
                
                <DataTable
                    v-model:selection="selectedQuotations"
                    :value="quotations"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    :loading="isLoadingData"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} cotações"
                    responsiveLayout="stack"
                    stripedRows
                    class="p-datatable-gridlines"
                    v-model:first="first"
                >
                    <template #header>
                <div class="flex justify-content-between align-items-center">
                    <span class="text-xl font-bold">
                        Total: {{ quotationsMeta.totalItems }} cotações
                    </span>
                </div>
            </template>
                    
                    <template #empty>
                        <div class="text-center p-4">
                            <i class="pi pi-file-o text-4xl text-400 mb-3"></i>
                            <p class="text-600 text-lg">Nenhum cotação encontrado</p>
                            <Button label="Criar cotação" icon="pi pi-plus" @click="createQuotation" />
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center p-4">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                            <p class="mt-2">Carregando cotações...</p>
                        </div>
                    </template>
                    
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    
                    <Column field="quotation_number" header="Número" sortable>
                        <template #body="{ data }">
                            <span class="font-bold">{{ data.quotation_number }}</span>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Buscar por número" />
                        </template>
                    </Column>
                    
                    <Column field="costumer.name" header="Cliente" sortable>
                        <template #body="{ data }">
                            {{ data.costumer.name }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Buscar por cliente" />
                        </template>
                    </Column>
                    
                    <Column field="quotation_date" header="Data" sortable>
                        <template #body="{ data }">
                            {{ moment(data.quotation_date).format('DD/MM/YYYY') }}
                        </template>
                    </Column>
                    
                    <Column field="expiry_date" header="Válido até" sortable>
                        <template #body="{ data }">
                            <span :class="{ 'text-red-500': new Date(data.expiry_date) < new Date() }">
                                {{ moment(data.expiry_date).format('DD/MM/YYYY') }}
                            </span>
                        </template>
                    </Column>
                    
                    <Column field="total" header="Total" sortable>
                        <template #body="{ data }">
                            <span class="font-bold">{{ formatCurrency(data.total) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Todos" class="p-column-filter" showClear />
                        </template>
                    </Column>
                    
                    <Column header="Ações" style="width: 12rem">
                        <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewQuotation(data)" v-tooltip="'Visualizar'" />
                                <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm" @click="viewPdf(data)" v-tooltip="'PDF'" />
                                <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editQuotation(data)" v-tooltip="'Editar'" v-if="data.status === 'DRAFT'" />
                                <Button icon="pi pi-copy" class="p-button-text p-button-sm" @click="duplicateQuotation(data)" v-tooltip="'Duplicar'" />
                                <Button icon="pi pi-file-o" class="p-button-text p-button-sm" @click="convertToInvoice(data)" v-tooltip="'Converter em Fatura'" v-if="data.status?.toUpperCase() === 'ACCEPTED'" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteQuotation(data)" v-tooltip="'Excluir'" v-if="data.status === 'DRAFT'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- Modal de conversão para fatura -->
    <ConvertToInvoiceModal 
        v-model:visible="showConvertModal"
        :quotation="selectedQuotationForConvert"
        :loading="isConverting"
        @convert="handleConvertToInvoice"
    />
</template>
