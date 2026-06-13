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

const debitNotes = ref([]);
const isLoadingData = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    client: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const selectedDebitNotes = ref([]);
const first = ref(0);
const globalFilterValue = ref('');

const statusOptions = [
    { label: 'Rascunho', value: 'DRAFT', severity: 'info' },
    { label: 'Pendente', value: 'PENDING', severity: 'warning' },
    { label: 'Pago', value: 'PAID', severity: 'success' },
    { label: 'Atrasado', value: 'OVERDUE', severity: 'danger' },
    { label: 'Cancelada', value: 'CANCELLED', severity: 'secondary' }
];

const reasonOptions = [
    'Juros de mora',
    'Multa por atraso',
    'Taxa adicional',
    'Correção de preço',
    'Serviço adicional',
    'Despesas de cobrança',
    'Outros'
];

const getDebitNotesData = async () => {
    try {
        // Mock data para notas de débito
        setTimeout(() => {
            const mockDebitNotes = [
                {
                    id: 1,
                    number: 'ND2024/0001',
                    client: 'João Silva Lda',
                    date: new Date('2024-08-30'),
                    dueDate: new Date('2024-09-15'),
                    total: 450.25,
                    status: 'PAID',
                    reason: 'Juros de mora',
                    referenceInvoice: 'FT2024/0001',
                    interestRate: 2.0,
                    daysOverdue: 15,
                    description: 'Juros de mora por atraso no pagamento da fatura FT2024/0001',
                    paidAt: new Date('2024-09-10'),
                    createdAt: new Date('2024-08-30')
                },
                {
                    id: 2,
                    number: 'ND2024/0002',
                    client: 'Maria Santos SA',
                    date: new Date('2024-09-01'),
                    dueDate: new Date('2024-09-16'),
                    total: 320.00,
                    status: 'PENDING',
                    reason: 'Taxa adicional',
                    referenceInvoice: 'FT2024/0005',
                    interestRate: 0.0,
                    daysOverdue: 0,
                    description: 'Taxa adicional por alteração de escopo do projeto',
                    paidAt: null,
                    createdAt: new Date('2024-09-01')
                },
                {
                    id: 3,
                    number: 'ND2024/0003',
                    client: 'Pedro Mozambique Lda',
                    date: new Date('2024-09-02'),
                    dueDate: new Date('2024-09-17'),
                    total: 180.50,
                    status: 'DRAFT',
                    reason: 'Multa por atraso',
                    referenceInvoice: 'FT2024/0008',
                    interestRate: 1.5,
                    daysOverdue: 10,
                    description: 'Multa por atraso na entrega de documentação',
                    paidAt: null,
                    createdAt: new Date('2024-09-02')
                },
                {
                    id: 4,
                    number: 'ND2024/0004',
                    client: 'Ana Costa Comercial',
                    date: new Date('2024-08-25'),
                    dueDate: new Date('2024-09-10'),
                    total: 750.75,
                    status: 'OVERDUE',
                    reason: 'Correção de preço',
                    referenceInvoice: 'FT2024/0003',
                    interestRate: 0.0,
                    daysOverdue: 0,
                    description: 'Correção de preço devido a alteração cambial',
                    paidAt: null,
                    createdAt: new Date('2024-08-25')
                },
                {
                    id: 5,
                    number: 'ND2024/0005',
                    client: 'Carlos Distribuição',
                    date: new Date('2024-08-20'),
                    dueDate: new Date('2024-09-05'),
                    total: 125.00,
                    status: 'CANCELLED',
                    reason: 'Despesas de cobrança',
                    referenceInvoice: 'FT2024/0002',
                    interestRate: 0.0,
                    daysOverdue: 0,
                    description: 'Nota cancelada - cliente quitou antes do vencimento',
                    paidAt: null,
                    createdAt: new Date('2024-08-20')
                }
            ];
            
            debitNotes.value = mockDebitNotes;
            isLoadingData.value = false;
        }, 1000);
    } catch (error) {
        console.error('Erro ao carregar notas de débito:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar notas de débito', life: 3000 });
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

const createDebitNote = () => {
    router.push('/sales/debit-notes/create');
};

const editDebitNote = (note) => {
    router.push(`/sales/debit-notes/${note.id}/edit`);
};

const viewDebitNote = (note) => {
    router.push(`/sales/debit-notes/${note.id}`);
};

const viewPdf = (note) => {
    router.push(`/sales/debit-notes/${note.id}/pdf`);
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

const markAsPaid = async (note) => {
    if (note.status !== 'PENDING' && note.status !== 'OVERDUE') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas notas pendentes ou atrasadas podem ser marcadas como pagas', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Marcar nota ${note.number} como paga?`,
        header: 'Confirmar Pagamento',
        icon: 'pi pi-check-circle',
        accept: () => {
            setTimeout(() => {
                const index = debitNotes.value.findIndex((dn) => dn.id === note.id);
                if (index !== -1) {
                    debitNotes.value[index].status = 'PAID';
                    debitNotes.value[index].paidAt = new Date();
                }
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota marcada como paga', life: 3000 });
            }, 500);
        }
    });
};

const sendReminder = (note) => {
    if (note.status !== 'PENDING' && note.status !== 'OVERDUE') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Lembretes só podem ser enviados para notas pendentes ou atrasadas', life: 3000 });
        return;
    }
    
    toast.add({ 
        severity: 'info', 
        summary: 'Lembrete Enviado', 
        detail: `Lembrete de pagamento enviado para ${note.client}`, 
        life: 3000 
    });
};

const calculateInterest = (note) => {
    if (note.interestRate > 0 && note.daysOverdue > 0) {
        const interest = (note.total - (note.total / (1 + (note.interestRate / 100)))) * note.daysOverdue;
        return interest;
    }
    return 0;
};

const deleteDebitNote = (note) => {
    confirm.require({
        message: `Tem certeza que deseja excluir a nota ${note.number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    debitNotes.value = debitNotes.value.filter((dn) => dn.id !== note.id);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota de débito excluída com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir nota:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir nota de débito', life: 3000 });
            }
        }
    });
};

const deleteSelectedDebitNotes = () => {
    if (selectedDebitNotes.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione pelo menos uma nota', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir ${selectedDebitNotes.value.length} nota(s) selecionada(s)?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    const selectedIds = selectedDebitNotes.value.map((dn) => dn.id);
                    debitNotes.value = debitNotes.value.filter((dn) => !selectedIds.includes(dn.id));
                    selectedDebitNotes.value = [];
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Notas de débito excluídas com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir notas:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir notas de débito', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    getDebitNotesData();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h4>Notas de Débito</h4>
                    <div class="flex gap-2">
                        <Button label="Excluir Selecionadas" icon="pi pi-trash" class="p-button-danger p-button-outlined" @click="deleteSelectedDebitNotes" :disabled="!selectedDebitNotes || selectedDebitNotes.length === 0" />
                        <Button label="Nova Nota de Débito" icon="pi pi-plus" @click="createDebitNote" />
                    </div>
                </div>
                
                <DataTable 
                    v-model:selection="selectedDebitNotes"
                    :value="debitNotes" 
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
                            <i class="pi pi-plus-circle text-4xl text-400 mb-3"></i>
                            <p class="text-600 text-lg">Nenhuma nota de débito encontrada</p>
                            <Button label="Criar Primeira Nota" icon="pi pi-plus" @click="createDebitNote" />
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center p-4">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                            <p class="mt-2">Carregando notas de débito...</p>
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
                    
                    <Column field="dueDate" header="Vencimento" sortable>
                        <template #body="{ data }">
                            <span :class="{'text-red-500': new Date(data.dueDate) < new Date() && data.status !== 'PAID'}">
                                {{ moment(data.dueDate).format('DD/MM/YYYY') }}
                            </span>
                        </template>
                    </Column>
                    
                    <Column field="referenceInvoice" header="Fatura Origem" sortable>
                        <template #body="{ data }">
                            <Button :label="data.referenceInvoice" class="p-button-link p-button-sm" @click="viewReferenceInvoice(data)" />
                        </template>
                    </Column>
                    
                    <Column field="reason" header="Motivo" style="max-width: 120px">
                        <template #body="{ data }">
                            <span class="text-sm">{{ data.reason }}</span>
                        </template>
                    </Column>
                    
                    <Column field="total" header="Valor" sortable>
                        <template #body="{ data }">
                            <span class="font-bold text-red-600">{{ formatCurrency(data.total) }}</span>
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
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewDebitNote(data)" v-tooltip="'Visualizar'" />
                                <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm" @click="viewPdf(data)" v-tooltip="'PDF'" />
                                <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editDebitNote(data)" v-tooltip="'Editar'" v-if="data.status === 'DRAFT'" />
                                <Button icon="pi pi-check" class="p-button-text p-button-success p-button-sm" @click="markAsPaid(data)" v-tooltip="'Marcar como Pago'" v-if="data.status === 'PENDING' || data.status === 'OVERDUE'" />
                                <Button icon="pi pi-send" class="p-button-text p-button-info p-button-sm" @click="sendReminder(data)" v-tooltip="'Enviar Lembrete'" v-if="data.status === 'PENDING' || data.status === 'OVERDUE'" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteDebitNote(data)" v-tooltip="'Excluir'" v-if="data.status === 'DRAFT'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
