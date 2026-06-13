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

const receipts = ref([]);
const isLoadingData = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    client: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const selectedReceipts = ref([]);
const first = ref(0);
const globalFilterValue = ref('');

const statusOptions = [
    { label: 'Válido', value: 'VALID', severity: 'success' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'danger' },
    { label: 'Estornado', value: 'REVERSED', severity: 'warning' }
];

const paymentMethodOptions = [
    'Dinheiro',
    'Transferência Bancária',
    'Cheque',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Multicaixa',
    'M-Pesa',
    'E-Mola'
];

const getReceiptsData = async () => {
    try {
        // Mock data para recibos
        setTimeout(() => {
            const mockReceipts = [
                {
                    id: 1,
                    number: 'REC2024/0001',
                    client: 'João Silva Lda',
                    date: new Date('2024-09-01'),
                    amount: 18500.00,
                    status: 'VALID',
                    paymentMethod: 'Transferência Bancária',
                    description: 'Pagamento da fatura FT2024/0001',
                    referenceInvoices: ['FT2024/0001'],
                    bankAccount: 'BCI - 123456789',
                    transactionRef: 'TXN789123456',
                    receivedBy: 'Maria Silva',
                    createdAt: new Date('2024-09-01')
                },
                {
                    id: 2,
                    number: 'REC2024/0002',
                    client: 'Maria Santos SA',
                    date: new Date('2024-09-02'),
                    amount: 12300.50,
                    status: 'VALID',
                    paymentMethod: 'Dinheiro',
                    description: 'Pagamento à vista',
                    referenceInvoices: ['FT2024/0002'],
                    bankAccount: '',
                    transactionRef: '',
                    receivedBy: 'João Santos',
                    createdAt: new Date('2024-09-02')
                },
                {
                    id: 3,
                    number: 'REC2024/0003',
                    client: 'Pedro Mozambique Lda',
                    date: new Date('2024-09-03'),
                    amount: 8400.25,
                    status: 'VALID',
                    paymentMethod: 'Multicaixa',
                    description: 'Pagamento via Multicaixa',
                    referenceInvoices: ['FT2024/0003', 'FT2024/0004'],
                    bankAccount: '',
                    transactionRef: 'MCX456789123',
                    receivedBy: 'Ana Costa',
                    createdAt: new Date('2024-09-03')
                },
                {
                    id: 4,
                    number: 'REC2024/0004',
                    client: 'Ana Costa Comercial',
                    date: new Date('2024-08-28'),
                    amount: 5600.00,
                    status: 'CANCELLED',
                    paymentMethod: 'Cheque',
                    description: 'Recibo cancelado - cheque devolvido',
                    referenceInvoices: ['FT2024/0006'],
                    bankAccount: '',
                    transactionRef: 'CHQ001234',
                    receivedBy: 'Carlos Nunes',
                    createdAt: new Date('2024-08-28')
                },
                {
                    id: 5,
                    number: 'REC2024/0005',
                    client: 'Carlos Distribuição',
                    date: new Date('2024-08-30'),
                    amount: 3200.75,
                    status: 'REVERSED',
                    paymentMethod: 'M-Pesa',
                    description: 'Pagamento estornado por solicitação do cliente',
                    referenceInvoices: ['FT2024/0007'],
                    bankAccount: '',
                    transactionRef: 'MP987654321',
                    receivedBy: 'Maria Silva',
                    createdAt: new Date('2024-08-30')
                }
            ];
            
            receipts.value = mockReceipts;
            isLoadingData.value = false;
        }, 1000);
    } catch (error) {
        console.error('Erro ao carregar recibos:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar recibos', life: 3000 });
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

const createReceipt = () => {
    router.push('/sales/receipts/create');
};

const editReceipt = (receipt) => {
    router.push(`/sales/receipts/${receipt.id}/edit`);
};

const viewReceipt = (receipt) => {
    router.push(`/sales/receipts/${receipt.id}`);
};

const viewPdf = (receipt) => {
    router.push(`/sales/receipts/${receipt.id}/pdf`);
};

const printReceipt = (receipt) => {
    // Abrir página PDF em nova janela para impressão
    const receiptUrl = `/sales/receipts/${receipt.id}/pdf`;
    window.open(receiptUrl, '_blank');
};

const viewInvoices = (receipt) => {
    if (receipt.referenceInvoices && receipt.referenceInvoices.length > 0) {
        const invoicesList = receipt.referenceInvoices.join(', ');
        toast.add({ 
            severity: 'info', 
            summary: 'Faturas Pagas', 
            detail: `Faturas: ${invoicesList}`, 
            life: 5000 
        });
    }
};

const cancelReceipt = (receipt) => {
    if (receipt.status !== 'VALID') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas recibos válidos podem ser cancelados', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja cancelar o recibo ${receipt.number}? Esta ação não pode ser desfeita.`,
        header: 'Cancelar Recibo',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            setTimeout(() => {
                const index = receipts.value.findIndex((r) => r.id === receipt.id);
                if (index !== -1) {
                    receipts.value[index].status = 'CANCELLED';
                    receipts.value[index].cancelledAt = new Date();
                }
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Recibo cancelado com sucesso', life: 3000 });
            }, 500);
        }
    });
};

const reverseReceipt = (receipt) => {
    if (receipt.status !== 'VALID') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas recibos válidos podem ser estornados', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Confirmar estorno do recibo ${receipt.number}? O valor será devolvido ao cliente.`,
        header: 'Estornar Recibo',
        icon: 'pi pi-undo',
        accept: () => {
            setTimeout(() => {
                const index = receipts.value.findIndex((r) => r.id === receipt.id);
                if (index !== -1) {
                    receipts.value[index].status = 'REVERSED';
                    receipts.value[index].reversedAt = new Date();
                }
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Recibo estornado com sucesso', life: 3000 });
            }, 500);
        }
    });
};

const deleteReceipt = (receipt) => {
    if (receipt.status === 'VALID') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Recibos válidos não podem ser excluídos. Cancele primeiro.', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir o recibo ${receipt.number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    receipts.value = receipts.value.filter((r) => r.id !== receipt.id);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Recibo excluído com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir recibo:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir recibo', life: 3000 });
            }
        }
    });
};

const deleteSelectedReceipts = () => {
    if (selectedReceipts.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione pelo menos um recibo', life: 3000 });
        return;
    }
    
    const validReceipts = selectedReceipts.value.filter((r) => r.status === 'VALID');
    if (validReceipts.length > 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Não é possível excluir recibos válidos', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir ${selectedReceipts.value.length} recibo(s) selecionado(s)?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    const selectedIds = selectedReceipts.value.map((r) => r.id);
                    receipts.value = receipts.value.filter((r) => !selectedIds.includes(r.id));
                    selectedReceipts.value = [];
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Recibos excluídos com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir recibos:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir recibos', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    getReceiptsData();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h4>Recibos de Pagamento</h4>
                    <div class="flex gap-2">
                        <Button label="Excluir Selecionados" icon="pi pi-trash" class="p-button-danger p-button-outlined" @click="deleteSelectedReceipts" :disabled="!selectedReceipts || selectedReceipts.length === 0" />
                        <Button label="Novo Recibo" icon="pi pi-plus" @click="createReceipt" />
                    </div>
                </div>
                
                <DataTable 
                    v-model:selection="selectedReceipts"
                    :value="receipts" 
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
                            <p class="text-600 text-lg">Nenhum recibo encontrado</p>
                            <Button label="Criar Primeiro Recibo" icon="pi pi-plus" @click="createReceipt" />
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center p-4">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                            <p class="mt-2">Carregando recibos...</p>
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
                            {{ moment(data.date).format('DD/MM/YYYY HH:mm') }}
                        </template>
                    </Column>
                    
                    <Column field="amount" header="Valor" sortable>
                        <template #body="{ data }">
                            <span class="font-bold text-green-600">{{ formatCurrency(data.amount) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="paymentMethod" header="Forma Pagamento" style="max-width: 130px">
                        <template #body="{ data }">
                            <Tag :value="data.paymentMethod" severity="info" />
                        </template>
                    </Column>
                    
                    <Column field="receivedBy" header="Recebido por" style="max-width: 120px">
                        <template #body="{ data }">
                            <span class="text-sm">{{ data.receivedBy }}</span>
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
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewReceipt(data)" v-tooltip="'Visualizar'" />
                                <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm" @click="viewPdf(data)" v-tooltip="'PDF'" />
                                <Button icon="pi pi-print" class="p-button-text p-button-sm" @click="printReceipt(data)" v-tooltip="'Imprimir'" />
                                <Button icon="pi pi-list" class="p-button-text p-button-sm" @click="viewInvoices(data)" v-tooltip="'Ver Faturas'" v-if="data.referenceInvoices && data.referenceInvoices.length > 0" />
                                <Button icon="pi pi-ban" class="p-button-text p-button-warning p-button-sm" @click="cancelReceipt(data)" v-tooltip="'Cancelar'" v-if="data.status === 'VALID'" />
                                <Button icon="pi pi-undo" class="p-button-text p-button-info p-button-sm" @click="reverseReceipt(data)" v-tooltip="'Estornar'" v-if="data.status === 'VALID'" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteReceipt(data)" v-tooltip="'Excluir'" v-if="data.status !== 'VALID'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
