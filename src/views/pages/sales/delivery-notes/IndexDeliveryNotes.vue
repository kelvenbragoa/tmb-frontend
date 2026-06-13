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

const deliveryNotes = ref([]);
const isLoadingData = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    client: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const selectedDeliveryNotes = ref([]);
const first = ref(0);
const globalFilterValue = ref('');

const statusOptions = [
    { label: 'Rascunho', value: 'DRAFT', severity: 'info' },
    { label: 'Pendente', value: 'PENDING', severity: 'warning' },
    { label: 'Em Trânsito', value: 'IN_TRANSIT', severity: 'info' },
    { label: 'Entregue', value: 'DELIVERED', severity: 'success' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'danger' }
];

const getDeliveryNotesData = async () => {
    try {
        // Mock data para guias de remessa
        setTimeout(() => {
            const mockDeliveryNotes = [
                {
                    id: 1,
                    number: 'GR2024/0001',
                    client: 'João Silva Lda',
                    date: new Date('2024-09-01'),
                    deliveryDate: new Date('2024-09-03'),
                    total: 14500.75,
                    status: 'DELIVERED',
                    driver: 'Manuel Costa',
                    vehicle: 'Toyota Hiace - ABC-123',
                    destination: 'Av. Julius Nyerere, 123 - Maputo',
                    createdAt: new Date('2024-09-01')
                },
                {
                    id: 2,
                    number: 'GR2024/0002',
                    client: 'Maria Santos SA',
                    date: new Date('2024-09-02'),
                    deliveryDate: new Date('2024-09-04'),
                    total: 8900.25,
                    status: 'IN_TRANSIT',
                    driver: 'Carlos Nunes',
                    vehicle: 'Isuzu NPR - DEF-456',
                    destination: 'Rua da Paz, 456 - Maputo',
                    createdAt: new Date('2024-09-02')
                },
                {
                    id: 3,
                    number: 'GR2024/0003',
                    client: 'Pedro Mozambique Lda',
                    date: new Date('2024-09-03'),
                    deliveryDate: new Date('2024-09-05'),
                    total: 22300.50,
                    status: 'PENDING',
                    driver: 'José Santos',
                    vehicle: 'Mercedes Sprinter - GHI-789',
                    destination: 'Av. Samora Machel, 789 - Beira',
                    createdAt: new Date('2024-09-03')
                },
                {
                    id: 4,
                    number: 'GR2024/0004',
                    client: 'Ana Costa Comercial',
                    date: new Date('2024-09-04'),
                    deliveryDate: new Date('2024-09-06'),
                    total: 6700.00,
                    status: 'DRAFT',
                    driver: '',
                    vehicle: '',
                    destination: 'Centro de Maputo',
                    createdAt: new Date('2024-09-04')
                },
                {
                    id: 5,
                    number: 'GR2024/0005',
                    client: 'Carlos Distribuição',
                    date: new Date('2024-08-28'),
                    deliveryDate: new Date('2024-08-30'),
                    total: 3450.25,
                    status: 'CANCELLED',
                    driver: 'António Silva',
                    vehicle: 'Ford Transit - JKL-012',
                    destination: 'Matola Gare',
                    createdAt: new Date('2024-08-28')
                }
            ];
            
            deliveryNotes.value = mockDeliveryNotes;
            isLoadingData.value = false;
        }, 1000);
    } catch (error) {
        console.error('Erro ao carregar guias de remessa:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar guias de remessa', life: 3000 });
        isLoadingData.value = false;
    }
};

const onGlobalFilterChange = () => {
    filters.value.global.value = globalFilterValue.value;
};

const getStatusSeverity = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.severity : 'info';
};

const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const createDeliveryNote = () => {
    router.push('/sales/delivery-notes/create');
};

const editDeliveryNote = (deliveryNote) => {
    router.push(`/sales/delivery-notes/${deliveryNote.id}/edit`);
};

const viewDeliveryNote = (deliveryNote) => {
    router.push(`/sales/delivery-notes/${deliveryNote.id}`);
};

const viewPdf = (deliveryNote) => {
    router.push(`/sales/delivery-notes/${deliveryNote.id}/pdf`);
};

const trackDelivery = (deliveryNote) => {
    if (deliveryNote.status === 'IN_TRANSIT') {
        toast.add({ 
            severity: 'info', 
            summary: 'Rastreamento', 
            detail: `Motorista: ${deliveryNote.driver} | Veículo: ${deliveryNote.vehicle}`, 
            life: 5000 
        });
    } else {
        toast.add({ 
            severity: 'warn', 
            summary: 'Atenção', 
            detail: 'Apenas entregas em trânsito podem ser rastreadas', 
            life: 3000 
        });
    }
};

const markAsDelivered = async (deliveryNote) => {
    if (deliveryNote.status !== 'IN_TRANSIT') {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Apenas entregas em trânsito podem ser marcadas como entregues', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Confirmar entrega da guia ${deliveryNote.number}?`,
        header: 'Confirmar Entrega',
        icon: 'pi pi-check-circle',
        accept: () => {
            setTimeout(() => {
                const index = deliveryNotes.value.findIndex(dn => dn.id === deliveryNote.id);
                if (index !== -1) {
                    deliveryNotes.value[index].status = 'DELIVERED';
                    deliveryNotes.value[index].deliveredAt = new Date();
                }
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Entrega confirmada com sucesso', life: 3000 });
            }, 500);
        }
    });
};

const deleteDeliveryNote = (deliveryNote) => {
    confirm.require({
        message: `Tem certeza que deseja excluir a guia ${deliveryNote.number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                // Mock API
                setTimeout(() => {
                    deliveryNotes.value = deliveryNotes.value.filter(dn => dn.id !== deliveryNote.id);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Guia de remessa excluída com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir guia:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir guia de remessa', life: 3000 });
            }
        }
    });
};

const deleteSelectedDeliveryNotes = () => {
    if (selectedDeliveryNotes.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione pelo menos uma guia', life: 3000 });
        return;
    }
    
    confirm.require({
        message: `Tem certeza que deseja excluir ${selectedDeliveryNotes.value.length} guia(s) selecionada(s)?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                // Mock API
                setTimeout(() => {
                    const selectedIds = selectedDeliveryNotes.value.map(dn => dn.id);
                    deliveryNotes.value = deliveryNotes.value.filter(dn => !selectedIds.includes(dn.id));
                    selectedDeliveryNotes.value = [];
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Guias de remessa excluídas com sucesso', life: 3000 });
                }, 500);
            } catch (error) {
                console.error('Erro ao excluir guias:', error);
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir guias de remessa', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    getDeliveryNotesData();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h4>Guias de Remessa</h4>
                    <div class="flex gap-2">
                        <Button label="Excluir Selecionadas" icon="pi pi-trash" class="p-button-danger p-button-outlined" @click="deleteSelectedDeliveryNotes" :disabled="!selectedDeliveryNotes || selectedDeliveryNotes.length === 0" />
                        <Button label="Nova Guia" icon="pi pi-plus" @click="createDeliveryNote" />
                    </div>
                </div>
                
                <DataTable 
                    v-model:selection="selectedDeliveryNotes"
                    :value="deliveryNotes" 
                    :paginator="true" 
                    :rows="10" 
                    :filters="filters"
                    :loading="isLoadingData"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} guias"
                    responsiveLayout="stack"
                    stripedRows
                    class="p-datatable-gridlines"
                    v-model:first="first"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" placeholder="Buscar guias..." @input="onGlobalFilterChange" class="w-full" />
                            </span>
                        </div>
                    </template>
                    
                    <template #empty>
                        <div class="text-center p-4">
                            <i class="pi pi-truck text-4xl text-400 mb-3"></i>
                            <p class="text-600 text-lg">Nenhuma guia de remessa encontrada</p>
                            <Button label="Criar Primeira Guia" icon="pi pi-plus" @click="createDeliveryNote" />
                        </div>
                    </template>
                    
                    <template #loading>
                        <div class="text-center p-4">
                            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" />
                            <p class="mt-2">Carregando guias de remessa...</p>
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
                    
                    <Column field="deliveryDate" header="Previsão Entrega" sortable>
                        <template #body="{ data }">
                            <span :class="{'text-red-500': new Date(data.deliveryDate) < new Date() && data.status !== 'DELIVERED'}">
                                {{ moment(data.deliveryDate).format('DD/MM/YYYY') }}
                            </span>
                        </template>
                    </Column>
                    
                    <Column field="destination" header="Destino" style="max-width: 200px">
                        <template #body="{ data }">
                            <span class="text-overflow-ellipsis">{{ data.destination }}</span>
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
                    
                    <Column header="Ações" style="width: 14rem">
                        <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewDeliveryNote(data)" v-tooltip="'Visualizar'" />
                                <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm" @click="viewPdf(data)" v-tooltip="'PDF'" />
                                <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editDeliveryNote(data)" v-tooltip="'Editar'" v-if="data.status === 'DRAFT'" />
                                <Button icon="pi pi-map-marker" class="p-button-text p-button-sm" @click="trackDelivery(data)" v-tooltip="'Rastrear'" v-if="data.status === 'IN_TRANSIT'" />
                                <Button icon="pi pi-check" class="p-button-text p-button-success p-button-sm" @click="markAsDelivered(data)" v-tooltip="'Marcar como Entregue'" v-if="data.status === 'IN_TRANSIT'" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteDeliveryNote(data)" v-tooltip="'Excluir'" v-if="data.status === 'DRAFT'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
