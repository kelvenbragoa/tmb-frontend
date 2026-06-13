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

const advanceReceipts = ref([]);
const isLoadingData = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    client: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const selectedAdvanceReceipts = ref([]);
const first = ref(0);
const globalFilterValue = ref('');

const statusOptions = [
    { label: 'Pendente', value: 'PENDING', severity: 'warning' },
    { label: 'Aplicado', value: 'APPLIED', severity: 'success' },
    { label: 'Parcialmente Aplicado', value: 'PARTIALLY_APPLIED', severity: 'info' },
    { label: 'Expirado', value: 'EXPIRED', severity: 'danger' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'secondary' }
];

const getAdvanceReceiptsData = async () => {
    try {
        // Mock data para recibos de adiantamento
        setTimeout(() => {
            const mockAdvanceReceipts = [
                {
                    id: 1,
                    number: 'RA2024/0001',
                    client: 'João Silva Lda',
                    date: new Date('2024-08-15'),
                    amount: 15000.00,
                    appliedAmount: 15000.00,
                    remainingAmount: 0.00,
                    status: 'APPLIED',
                    paymentMethod: 'Transferência Bancária',
                    description: 'Adiantamento para projeto de sistema',
                    appliedInvoices: ['FT2024/0001'],
                    createdAt: new Date('2024-08-15')
                },
                {
                    id: 2,
                    number: 'RA2024/0002',
                    client: 'Maria Santos SA',
                    date: new Date('2024-08-20'),
                    amount: 25000.00,
                    appliedAmount: 12000.00,
                    remainingAmount: 13000.00,
                    status: 'PARTIALLY_APPLIED',
                    paymentMethod: 'Dinheiro',
                    description: 'Adiantamento para desenvolvimento personalizado',
                    appliedInvoices: ['FT2024/0002'],
                    createdAt: new Date('2024-08-20')
                },
                {
                    id: 3,
                    number: 'RA2024/0003',
                    client: 'Pedro Mozambique Lda',
                    date: new Date('2024-09-01'),
                    amount: 8500.00,
                    appliedAmount: 0.00,
                    remainingAmount: 8500.00,
                    status: 'PENDING',
                    paymentMethod: 'Cheque',
                    description: 'Adiantamento para suporte técnico anual',
                    appliedInvoices: [],
                    createdAt: new Date('2024-09-01')
                },
                {
                    id: 4,
                    number: 'RA2024/0004',
                    client: 'Ana Costa Comercial',
                    date: new Date('2024-07-10'),
                    amount: 5000.00,
                    appliedAmount: 0.00,
                    remainingAmount: 5000.00,
                    status: 'EXPIRED',
                    paymentMethod: 'Transferência Bancária',
                    description: 'Adiantamento não utilizado - cliente cancelou projeto',
                    appliedInvoices: [],
                    createdAt: new Date('2024-07-10')
                },
                {
                    id: 5,
                    number: 'RA2024/0005',
                    client: 'Carlos Distribuição',
                    date: new Date('2024-08-25'),
                    amount: 12000.00,
                    appliedAmount: 0.00,
                    remainingAmount: 0.00,
                    status: 'CANCELLED',
                    paymentMethod: 'Dinheiro',
                    description: 'Adiantamento cancelado - reembolsado',
                    appliedInvoices: [],
                    createdAt: new Date('2024-08-25')
                }
            ];
            
            advanceReceipts.value = mockAdvanceReceipts;
            isLoadingData.value = false;
        }, 1000);
    } catch (error) {
        console.error('Erro ao carregar recibos de adiantamento:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar recibos de adiantamento', life: 3000 });
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

const createAdvanceReceipt = () => {
    router.push('/sales/advance-receipts/create');
};

const editAdvanceReceipt = (receipt) => {
    router.push(`/sales/advance-receipts/${receipt.id}/edit`);
};

const viewAdvanceReceipt = (receipt) => {
    router.push(`/sales/advance-receipts/${receipt.id}`);
};

const viewPdf = (receipt) => {
    router.push(`/sales/advance-receipts/${receipt.id}/pdf`);
};

const applyToInvoice = (receipt) => {
    if (receipt.remainingAmount <= 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Este adiantamento já foi totalmente aplicado', life: 3000 });
        return;
    }
    
    toast.add({ severity: 'info', summary: 'Em desenvolvimento', detail: 'Funcionalidade de aplicação será implementada', life: 3000 });
};

const refundAdvanceReceipt = (receipt) => {
    if (receipt.status !== 'PENDING') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas adiantamentos pendentes podem ser reembolsados', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Confirmar reembolso do adiantamento ${receipt.number}?`,
        header: 'Confirmar Reembolso',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            setTimeout(() => {
                const index = advanceReceipts.value.findIndex((ar) => ar.id === receipt.id);
                if (index !== -1) {
                    advanceReceipts.value[index].status = 'CANCELLED';
                }
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Adiantamento reembolsado com sucesso', life: 3000 });
            }, 500);
        }
    });
};

const deleteAdvanceReceipt = (receipt) => {
    confirm.require({
        message: `Tem certeza que deseja excluir o recibo ${receipt.number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    advanceReceipts.value = advanceReceipts.value.filter((ar) => ar.id !== receipt.id);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Recibo de adiantamento excluído com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir recibo:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir recibo de adiantamento', life: 3000 });
            }
        }
    });
};

const deleteSelectedAdvanceReceipts = () => {
    if (selectedAdvanceReceipts.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione pelo menos um recibo', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir ${selectedAdvanceReceipts.value.length} recibo(s) selecionado(s)?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    const selectedIds = selectedAdvanceReceipts.value.map((ar) => ar.id);
                    advanceReceipts.value = advanceReceipts.value.filter((ar) => !selectedIds.includes(ar.id));
                    selectedAdvanceReceipts.value = [];
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Recibos de adiantamento excluídos com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir recibos:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir recibos de adiantamento', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    getAdvanceReceiptsData();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h4>Recibos de Adiantamento</h4>
                    <div class="flex gap-2">
                        <Button label="Excluir Selecionados" icon="pi pi-trash" class="p-button-danger p-button-outlined" @click="deleteSelectedAdvanceReceipts" :disabled="!selectedAdvanceReceipts || selectedAdvanceReceipts.length === 0" />
                        <Button label="Novo Recibo" icon="pi pi-plus" @click="createAdvanceReceipt" />
                    </div>
                </div>
                
                <DataTable 
                    v-model:selection="selectedAdvanceReceipts"
                    :value="advanceReceipts" 
                    :paginator="true" 
                    :rows="10" 
                    :filters="filters"
                    :loading="isLoadingData"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} recibos"
                    responsiveLayout="stack"
                    stripedRows
                    class="p-datatable-gridlines"
                    v-model:first="first"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" placeholder="Buscar recibos..." @input="onGlobalFilterChange" class="w-full" />
                            </span>
                        </div>
                    </template>
                    
                    <template #empty>
                        <div class="text-center p-4">
                            <i class="pi pi-receipt text-4xl text-400 mb-3"></i>
                            <p class="text-600 text-lg">Nenhum recibo de adiantamento encontrado</p>
                            <Button label="Criar Primeiro Recibo" icon="pi pi-plus" @click="createAdvanceReceipt" />
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center p-4">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                            <p class="mt-2">Carregando recibos de adiantamento...</p>
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
                    
                    <Column field="amount" header="Valor" sortable>
                        <template #body="{ data }">
                            <span class="font-bold">{{ formatCurrency(data.amount) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="remainingAmount" header="Saldo" sortable>
                        <template #body="{ data }">
                            <span class="font-bold" :class="{'text-green-500': data.remainingAmount === 0, 'text-orange-500': data.remainingAmount > 0}">
                                {{ formatCurrency(data.remainingAmount) }}
                            </span>
                        </template>
                    </Column>
                    
                    <Column field="paymentMethod" header="Forma Pagamento" style="max-width: 150px">
                        <template #body="{ data }">
                            <span class="text-overflow-ellipsis">{{ data.paymentMethod }}</span>
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
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewAdvanceReceipt(data)" v-tooltip="'Visualizar'" />
                                <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm" @click="viewPdf(data)" v-tooltip="'PDF'" />
                                <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editAdvanceReceipt(data)" v-tooltip="'Editar'" v-if="data.status === 'PENDING'" />
                                <Button icon="pi pi-link" class="p-button-text p-button-sm" @click="applyToInvoice(data)" v-tooltip="'Aplicar em Fatura'" v-if="data.remainingAmount > 0" />
                                <Button icon="pi pi-undo" class="p-button-text p-button-warning p-button-sm" @click="refundAdvanceReceipt(data)" v-tooltip="'Reembolsar'" v-if="data.status === 'PENDING'" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteAdvanceReceipt(data)" v-tooltip="'Excluir'" v-if="data.status === 'PENDING'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
