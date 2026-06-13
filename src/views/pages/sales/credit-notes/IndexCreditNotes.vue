<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';
import moment from 'moment';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const creditNotes = ref([]);
const isLoadingData = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    client: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const selectedCreditNotes = ref([]);
const first = ref(0);
const globalFilterValue = ref('');

const statusOptions = [
    { label: 'Rascunho', value: 'DRAFT', severity: 'info' },
    { label: 'Pendente', value: 'PENDING', severity: 'warning' },
    { label: 'Aplicada', value: 'APPLIED', severity: 'success' },
    { label: 'Cancelada', value: 'CANCELLED', severity: 'danger' }
];

const reasonOptions = [
    'Devolução de mercadoria',
    'Desconto comercial',
    'Erro de facturação',
    'Produto defeituoso',
    'Cancelamento de serviço',
    'Acordo comercial',
    'Outros'
];

const getCreditNotesData = async () => {
    try {
        // Mock data para notas de crédito
        setTimeout(() => {
            const mockCreditNotes = [
                {
                    id: 1,
                    number: 'NC2024/0001',
                    client: 'João Silva Lda',
                    date: new Date('2024-08-20'),
                    total: 2500.00,
                    status: 'APPLIED',
                    reason: 'Devolução de mercadoria',
                    referenceInvoice: 'FT2024/0001',
                    appliedAmount: 2500.00,
                    remainingAmount: 0.00,
                    description: 'Devolução de licença de software - produto não atendeu expectativas',
                    createdAt: new Date('2024-08-20')
                },
                {
                    id: 2,
                    number: 'NC2024/0002',
                    client: 'Maria Santos SA',
                    date: new Date('2024-08-25'),
                    total: 1200.50,
                    status: 'PENDING',
                    reason: 'Desconto comercial',
                    referenceInvoice: 'FT2024/0005',
                    appliedAmount: 0.00,
                    remainingAmount: 1200.50,
                    description: 'Desconto negociado por volume de compras',
                    createdAt: new Date('2024-08-25')
                },
                {
                    id: 3,
                    number: 'NC2024/0003',
                    client: 'Pedro Mozambique Lda',
                    date: new Date('2024-09-01'),
                    total: 850.75,
                    status: 'DRAFT',
                    reason: 'Erro de facturação',
                    referenceInvoice: 'FT2024/0008',
                    appliedAmount: 0.00,
                    remainingAmount: 850.75,
                    description: 'Correção de preço cobrado incorretamente',
                    createdAt: new Date('2024-09-01')
                },
                {
                    id: 4,
                    number: 'NC2024/0004',
                    client: 'Ana Costa Comercial',
                    date: new Date('2024-08-15'),
                    total: 3200.00,
                    status: 'APPLIED',
                    reason: 'Produto defeituoso',
                    referenceInvoice: 'FT2024/0003',
                    appliedAmount: 1600.00,
                    remainingAmount: 1600.00,
                    description: 'Equipamento apresentou defeito após 1 semana de uso',
                    createdAt: new Date('2024-08-15')
                },
                {
                    id: 5,
                    number: 'NC2024/0005',
                    client: 'Carlos Distribuição',
                    date: new Date('2024-07-30'),
                    total: 750.25,
                    status: 'CANCELLED',
                    reason: 'Cancelamento de serviço',
                    referenceInvoice: 'FT2024/0002',
                    appliedAmount: 0.00,
                    remainingAmount: 0.00,
                    description: 'Nota cancelada - cliente optou por manter serviço',
                    createdAt: new Date('2024-07-30')
                }
            ];
            
            creditNotes.value = mockCreditNotes;
            isLoadingData.value = false;
        }, 1000);
    } catch (error) {
        console.error('Erro ao carregar notas de crédito:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar notas de crédito', life: 3000 });
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

const createCreditNote = () => {
    router.push('/sales/credit-notes/create');
};

const editCreditNote = (note) => {
    router.push(`/sales/credit-notes/${note.id}/edit`);
};

const viewCreditNote = (note) => {
    router.push(`/sales/credit-notes/${note.id}`);
};

const viewPdf = (note) => {
    router.push(`/sales/credit-notes/${note.id}/pdf`);
};

const viewReferenceInvoice = (note) => {
    if (note.referenceInvoice) {
        toast.add({ 
            severity: 'info', 
            summary: 'Fatura Original', 
            detail: `Abrindo fatura ${note.referenceInvoice}`, 
            life: 3000 
        });
        // Navegar para a fatura original seria implementado aqui
    }
};

const applyCredit = async (note) => {
    if (note.status !== 'PENDING') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas notas pendentes podem ser aplicadas', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Aplicar nota de crédito ${note.number}?`,
        header: 'Aplicar Crédito',
        icon: 'pi pi-check-circle',
        accept: () => {
            setTimeout(() => {
                const index = creditNotes.value.findIndex((cn) => cn.id === note.id);
                if (index !== -1) {
                    creditNotes.value[index].status = 'APPLIED';
                    creditNotes.value[index].appliedAmount = creditNotes.value[index].total;
                    creditNotes.value[index].remainingAmount = 0;
                    creditNotes.value[index].appliedAt = new Date();
                }
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota de crédito aplicada com sucesso', life: 3000 });
            }, 500);
        }
    });
};

const refundCredit = (note) => {
    if (note.remainingAmount <= 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Esta nota não possui saldo para reembolso', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Reembolsar ${formatCurrency(note.remainingAmount)} da nota ${note.number}?`,
        header: 'Confirmar Reembolso',
        icon: 'pi pi-money-bill',
        accept: () => {
            setTimeout(() => {
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Reembolso processado com sucesso', life: 3000 });
            }, 500);
        }
    });
};

const deleteCreditNote = (note) => {
    confirm.require({
        message: `Tem certeza que deseja excluir a nota ${note.number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    creditNotes.value = creditNotes.value.filter((cn) => cn.id !== note.id);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota de crédito excluída com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir nota:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir nota de crédito', life: 3000 });
            }
        }
    });
};

const deleteSelectedCreditNotes = () => {
    if (selectedCreditNotes.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione pelo menos uma nota', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir ${selectedCreditNotes.value.length} nota(s) selecionada(s)?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    const selectedIds = selectedCreditNotes.value.map((cn) => cn.id);
                    creditNotes.value = creditNotes.value.filter((cn) => !selectedIds.includes(cn.id));
                    selectedCreditNotes.value = [];
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Notas de crédito excluídas com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir notas:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir notas de crédito', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    getCreditNotesData();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h4>Notas de Crédito</h4>
                    <div class="flex gap-2">
                        <Button label="Excluir Selecionadas" icon="pi pi-trash" class="p-button-danger p-button-outlined" @click="deleteSelectedCreditNotes" :disabled="!selectedCreditNotes || selectedCreditNotes.length === 0" />
                        <Button label="Nova Nota de Crédito" icon="pi pi-plus" @click="createCreditNote" />
                    </div>
                </div>
                
                <DataTable 
                    v-model:selection="selectedCreditNotes"
                    :value="creditNotes" 
                    :paginator="true" 
                    :rows="10" 
                    :filters="filters"
                    :loading="isLoadingData"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} notas"
                    responsiveLayout="stack"
                    stripedRows
                    class="p-datatable-gridlines"
                    v-model:first="first"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" placeholder="Buscar notas..." @input="onGlobalFilterChange" class="w-full" />
                            </span>
                        </div>
                    </template>
                    
                    <template #empty>
                        <div class="text-center p-4">
                            <i class="pi pi-minus-circle text-4xl text-400 mb-3"></i>
                            <p class="text-600 text-lg">Nenhuma nota de crédito encontrada</p>
                            <Button label="Criar Primeira Nota" icon="pi pi-plus" @click="createCreditNote" />
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center p-4">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                            <p class="mt-2">Carregando notas de crédito...</p>
                        </div>
                    </template>
                    
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    
                    <Column field="number" header="Número" sortable>
                        <template #body="{ data }">
                            <span class="font-bold">{{ data.number }}</span>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Buscar por número" />
                        </template>
                    </Column>
                    
                    <Column field="client" header="Cliente" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Buscar por cliente" />
                        </template>
                    </Column>
                    
                    <Column field="date" header="Data" sortable>
                        <template #body="{ data }">
                            {{ moment(data.date).format('DD/MM/YYYY') }}
                        </template>
                    </Column>
                    
                    <Column field="referenceInvoice" header="Fatura Origem" sortable>
                        <template #body="{ data }">
                            <Button :label="data.referenceInvoice" class="p-button-link p-button-sm" @click="viewReferenceInvoice(data)" />
                        </template>
                    </Column>
                    
                    <Column field="reason" header="Motivo" style="max-width: 150px">
                        <template #body="{ data }">
                            <span class="text-sm">{{ data.reason }}</span>
                        </template>
                    </Column>
                    
                    <Column field="total" header="Valor" sortable>
                        <template #body="{ data }">
                            <span class="font-bold text-red-500">{{ formatCurrency(data.total) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="remainingAmount" header="Saldo" sortable>
                        <template #body="{ data }">
                            <span class="font-bold" :class="{'text-green-500': data.remainingAmount === 0, 'text-orange-500': data.remainingAmount > 0}">
                                {{ formatCurrency(data.remainingAmount) }}
                            </span>
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
                    
                    <Column header="Ações" style="width: 14rem">
                        <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewCreditNote(data)" v-tooltip="'Visualizar'" />
                                <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm" @click="viewPdf(data)" v-tooltip="'PDF'" />
                                <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editCreditNote(data)" v-tooltip="'Editar'" v-if="data.status === 'DRAFT'" />
                                <Button icon="pi pi-check" class="p-button-text p-button-success p-button-sm" @click="applyCredit(data)" v-tooltip="'Aplicar Crédito'" v-if="data.status === 'PENDING'" />
                                <Button icon="pi pi-money-bill" class="p-button-text p-button-info p-button-sm" @click="refundCredit(data)" v-tooltip="'Reembolsar'" v-if="data.remainingAmount > 0" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteCreditNote(data)" v-tooltip="'Excluir'" v-if="data.status === 'DRAFT'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
