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

const cashSales = ref([]);
const isLoadingData = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    client: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const selectedCashSales = ref([]);
const first = ref(0);
const globalFilterValue = ref('');

const statusOptions = [
    { label: 'Pendente', value: 'PENDING', severity: 'warning' },
    { label: 'Confirmado', value: 'CONFIRMED', severity: 'success' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'danger' }
];

const getCashSalesData = async () => {
    try {
        // Mock data para vendas a dinheiro
        setTimeout(() => {
            const mockCashSales = [
                {
                    id: 1,
                    number: 'VD2024/0001',
                    client: 'Cliente Balcão',
                    date: new Date('2024-09-04'),
                    total: 2500.5,
                    status: 'CONFIRMED',
                    paymentMethod: 'Dinheiro',
                    cashier: 'Maria Silva',
                    items: [{ description: 'Licença Software Básico', quantity: 1, unitPrice: 2500.5 }],
                    cashReceived: 3000,
                    change: 499.5,
                    createdAt: new Date('2024-09-04')
                },
                {
                    id: 2,
                    number: 'VD2024/0002',
                    client: 'António Pereira',
                    date: new Date('2024-09-04'),
                    total: 1200.0,
                    status: 'CONFIRMED',
                    paymentMethod: 'Cartão',
                    cashier: 'João Santos',
                    items: [{ description: 'Consultoria Técnica', quantity: 2, unitPrice: 600.0 }],
                    cashReceived: 1200.0,
                    change: 0.0,
                    createdAt: new Date('2024-09-04')
                },
                {
                    id: 3,
                    number: 'VD2024/0003',
                    client: 'Rosa Maputo Lda',
                    date: new Date('2024-09-04'),
                    total: 850.75,
                    status: 'PENDING',
                    paymentMethod: 'Dinheiro',
                    cashier: 'Ana Costa',
                    items: [{ description: 'Suporte Telefónico', quantity: 1, unitPrice: 850.75 }],
                    cashReceived: 0.0,
                    change: 0.0,
                    createdAt: new Date('2024-09-04')
                },
                {
                    id: 4,
                    number: 'VD2024/0004',
                    client: 'Paulo Silva',
                    date: new Date('2024-09-03'),
                    total: 4500.0,
                    status: 'CONFIRMED',
                    paymentMethod: 'Multicaixa',
                    cashier: 'Carlos Nunes',
                    items: [{ description: 'Formação em Excel', quantity: 1, unitPrice: 4500.0 }],
                    cashReceived: 4500.0,
                    change: 0.0,
                    createdAt: new Date('2024-09-03')
                },
                {
                    id: 5,
                    number: 'VD2024/0005',
                    client: 'Fernanda Costa',
                    date: new Date('2024-09-02'),
                    total: 320.25,
                    status: 'CANCELLED',
                    paymentMethod: 'Dinheiro',
                    cashier: 'Maria Silva',
                    items: [{ description: 'CD de Backup', quantity: 3, unitPrice: 106.75 }],
                    cashReceived: 0.0,
                    change: 0.0,
                    createdAt: new Date('2024-09-02')
                }
            ];
            
            cashSales.value = mockCashSales;
            isLoadingData.value = false;
        }, 1000);
    } catch (error) {
        console.error('Erro ao carregar vendas a dinheiro:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar vendas a dinheiro', life: 3000 });
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

const createCashSale = () => {
    router.push('/sales/cash-sales/create');
};

const editCashSale = (sale) => {
    router.push(`/sales/cash-sales/${sale.id}/edit`);
};

const viewCashSale = (sale) => {
    router.push(`/sales/cash-sales/${sale.id}`);
};

const viewPdf = (sale) => {
    router.push(`/sales/cash-sales/${sale.id}/pdf`);
};

const confirmSale = async (sale) => {
    if (sale.status !== 'PENDING') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas vendas pendentes podem ser confirmadas', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Confirmar venda ${sale.number}?`,
        header: 'Confirmar Venda',
        icon: 'pi pi-check-circle',
        accept: () => {
            setTimeout(() => {
                const index = cashSales.value.findIndex((cs) => cs.id === sale.id);
                if (index !== -1) {
                    cashSales.value[index].status = 'CONFIRMED';
                    cashSales.value[index].confirmedAt = new Date();
                }
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Venda confirmada com sucesso', life: 3000 });
            }, 500);
        }
    });
};

const printReceipt = (sale) => {
    if (sale.status !== 'CONFIRMED') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas vendas confirmadas podem ter recibo impresso', life: 3000 });
        return;
    }
    
    // Abrir página PDF em nova janela para impressão de recibo
    const receiptUrl = `/sales/cash-sales/${sale.id}/pdf`;
    window.open(receiptUrl, '_blank');
};

const openCashDrawer = () => {
    toast.add({ severity: 'info', summary: 'Gaveta', detail: 'Comando enviado para abrir gaveta do dinheiro', life: 3000 });
};

const deleteCashSale = (sale) => {
    confirm.require({
        message: `Tem certeza que deseja excluir a venda ${sale.number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    cashSales.value = cashSales.value.filter((cs) => cs.id !== sale.id);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Venda excluída com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir venda:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir venda', life: 3000 });
            }
        }
    });
};

const deleteSelectedCashSales = () => {
    if (selectedCashSales.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione pelo menos uma venda', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir ${selectedCashSales.value.length} venda(s) selecionada(s)?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                setTimeout(() => {
                    const selectedIds = selectedCashSales.value.map((cs) => cs.id);
                    cashSales.value = cashSales.value.filter((cs) => !selectedIds.includes(cs.id));
                    selectedCashSales.value = [];
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Vendas excluídas com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir vendas:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir vendas', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    getCashSalesData();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h4>Vendas a Dinheiro / PDV</h4>
                    <div class="flex gap-2">
                        <Button label="Abrir Gaveta" icon="pi pi-box" class="p-button-secondary p-button-outlined" @click="openCashDrawer" />
                        <Button label="Excluir Selecionadas" icon="pi pi-trash" class="p-button-danger p-button-outlined" @click="deleteSelectedCashSales" :disabled="!selectedCashSales || selectedCashSales.length === 0" />
                        <Button label="Nova Venda" icon="pi pi-plus" @click="createCashSale" />
                    </div>
                </div>
                
                <DataTable
                    v-model:selection="selectedCashSales"
                    :value="cashSales"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    :loading="isLoadingData"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} vendas"
                    responsiveLayout="stack"
                    stripedRows
                    class="p-datatable-gridlines"
                    v-model:first="first"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" placeholder="Buscar vendas..." @input="onGlobalFilterChange" class="w-full" />
                            </span>
                        </div>
                    </template>
                    
                    <template #empty>
                        <div class="text-center p-4">
                            <i class="pi pi-shopping-cart text-4xl text-400 mb-3"></i>
                            <p class="text-600 text-lg">Nenhuma venda a dinheiro encontrada</p>
                            <Button label="Fazer Primeira Venda" icon="pi pi-plus" @click="createCashSale" />
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center p-4">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                            <p class="mt-2">Carregando vendas a dinheiro...</p>
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
                    
                    <Column field="date" header="Data/Hora" sortable>
                        <template #body="{ data }">
                            {{ moment(data.date).format('DD/MM/YYYY HH:mm') }}
                        </template>
                    </Column>
                    
                    <Column field="total" header="Total" sortable>
                        <template #body="{ data }">
                            <span class="font-bold">{{ formatCurrency(data.total) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="paymentMethod" header="Pagamento" style="max-width: 120px">
                        <template #body="{ data }">
                            <Tag :value="data.paymentMethod" :severity="data.paymentMethod === 'Dinheiro' ? 'success' : 'info'" />
                        </template>
                    </Column>
                    
                    <Column field="cashier" header="Operador" style="max-width: 120px">
                        <template #body="{ data }">
                            <span class="text-sm">{{ data.cashier }}</span>
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
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewCashSale(data)" v-tooltip="'Visualizar'" />
                                <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm" @click="viewPdf(data)" v-tooltip="'PDF'" />
                                <Button icon="pi pi-print" class="p-button-text p-button-sm" @click="printReceipt(data)" v-tooltip="'Imprimir Recibo'" v-if="data.status === 'CONFIRMED'" />
                                <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editCashSale(data)" v-tooltip="'Editar'" v-if="data.status === 'PENDING'" />
                                <Button icon="pi pi-check" class="p-button-text p-button-success p-button-sm" @click="confirmSale(data)" v-tooltip="'Confirmar Venda'" v-if="data.status === 'PENDING'" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteCashSale(data)" v-tooltip="'Excluir'" v-if="data.status === 'PENDING'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
