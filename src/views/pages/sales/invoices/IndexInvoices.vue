<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';
import InvoiceService from '@/service/InvoiceService';

const router = useRouter();
const toast = useToast();

// Estado da aplicação
const isLoadingData = ref(true);
const loadingButtonDelete = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('');
const showOverdueOnly = ref(false);

// Dados das faturas
const invoices = ref([]);
const selectedInvoices = ref([]);
const invoiceToDelete = ref(null);
const displayConfirmation = ref(false);

// Paginação
const first = ref(0);
const totalRecords = ref(0);
const invoicesMeta = ref({
    current_page: 1,
    from: 1,
    last_page: 1,
    per_page: 10,
    to: 10,
    total: 0
});

const createInvoice = () => {
    router.push('/sales/invoices/create');
};
// Opções de filtro
const statusOptions = InvoiceService.getStatusOptions();
const paymentMethods = InvoiceService.getPaymentMethods();

const getInvoicesData = async () => {
    try {
        isLoadingData.value = true;
        
        const params = {
            page: invoicesMeta.value.current_page,
            limit: invoicesMeta.value.per_page,
            search: searchQuery.value,
            status: selectedStatus.value,
            overdue: showOverdueOnly.value
        };

        // Tentar carregar da API, com fallback para dados mock
        try {
            const response = await InvoiceService.getAllInvoices(params);
            invoices.value = response.items || [];
            
            if (response.meta) {
                invoicesMeta.value = {
                    current_page: response.meta.currentPage,
                    from: (response.meta.currentPage - 1) * response.meta.itemsPerPage + 1,
                    last_page: response.meta.totalPages,
                    per_page: response.meta.itemsPerPage,
                    to: Math.min(response.meta.currentPage * response.meta.itemsPerPage, response.meta.totalItems),
                    total: response.meta.totalItems
                };
            }
            
            first.value = (invoicesMeta.value.current_page - 1) * invoicesMeta.value.per_page;
            totalRecords.value = invoicesMeta.value.total;
            
        } catch (apiError) {
            console.warn('API não disponível, usando dados mock:', apiError);
            
            // Usar dados mock do serviço
            const mockResponse = InvoiceService.getMockInvoices();
            invoices.value = mockResponse.items;
            
            // Filtrar dados mock conforme parâmetros
            let filteredData = mockResponse.items;
            
            if (searchQuery.value) {
                filteredData = filteredData.filter((invoice) => 
                    invoice.invoice_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                    invoice.costumer.name.toLowerCase().includes(searchQuery.value.toLowerCase())
                );
            }
            
            if (selectedStatus.value) {
                filteredData = filteredData.filter((invoice) => invoice.status === selectedStatus.value);
            }
            
            if (showOverdueOnly.value) {
                filteredData = filteredData.filter((invoice) => invoice.status === 'overdue');
            }
            
            invoices.value = filteredData;
            totalRecords.value = filteredData.length;
            
            toast.add({
                severity: 'info',
                summary: 'Modo Demo',
                detail: 'Exibindo dados de exemplo. Conecte à API para dados reais.',
                life: 5000
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar faturas:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar faturas',
            life: 3000
        });
    } finally {
        isLoadingData.value = false;
    }
};

const deleteInvoice = async () => {
    try {
        loadingButtonDelete.value = true;
        await InvoiceService.deleteInvoice(invoiceToDelete.value.id);
        
        invoices.value = invoices.value.filter((invoice) => invoice.id !== invoiceToDelete.value.id);
        displayConfirmation.value = false;
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Fatura excluída com sucesso',
            life: 3000
        });
        
    } catch (error) {
        console.error('Erro ao excluir fatura:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao excluir fatura',
            life: 3000
        });
    } finally {
        loadingButtonDelete.value = false;
    }
};

const confirmDelete = (invoice) => {
    invoiceToDelete.value = invoice;
    displayConfirmation.value = true;
};

const onPageChange = (event) => {
    invoicesMeta.value.current_page = event.page + 1;
    invoicesMeta.value.per_page = event.rows;
    getInvoicesData();
};

const debouncedSearch = debounce(() => {
    invoicesMeta.value.current_page = 1;
    getInvoicesData();
}, 300);

// Funções auxiliares
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN'
    }).format(value || 0);
};

const formatDate = (dateStr) => {
    return moment(dateStr).format('DD/MM/YYYY');
};

const getStatusOption = (status) => {
    return statusOptions.find((option) => option.value === status) || { 
        label: status, 
        severity: 'info',
        icon: 'pi pi-circle'
    };
};

const getPaymentMethodLabel = (method) => {
    const paymentMethod = paymentMethods.find((pm) => pm.value === method);
    return paymentMethod ? paymentMethod.label : method || 'Não informado';
};

const updateInvoiceStatus = async (invoice, newStatus) => {
    try {
        await InvoiceService.updateInvoiceStatus(invoice.id, newStatus);
        invoice.status = newStatus;
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Status atualizado para ${getStatusOption(newStatus).label}`,
            life: 3000
        });
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar status da fatura',
            life: 3000
        });
    }
};

const viewPdf = (id) => {
    router.push(`/sales/invoices/${id}/pdf`);
};

watch(searchQuery, debouncedSearch);

// Watchers
watch([searchQuery, selectedStatus, showOverdueOnly], () => {
    debouncedSearch();
});

onMounted(() => {
    getInvoicesData();
});
</script>

<template>
    <div class="card">
        
        <div class="flex justify-content-between align-items-center mb-3">
            <h3><i class="pi pi-file-text mr-2"></i>Gestão de Faturas</h3>
            <Button 
                label="Nova Fatura" 
                icon="pi pi-plus" 
                @click="$router.push('/sales/invoices/create')" 
            />
        </div>

        <!-- Filtros -->
        <div class="grid mb-3">
            <div class="col-12 md:col-4">
                <div class="p-fluid">
                    <label for="search">Pesquisar</label>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText 
                            id="search" 
                            v-model="searchQuery" 
                            placeholder="Número, cliente..." 
                        />
                    </IconField>
                </div>
            </div>

            <div class="col-12 md:col-3">
                <div class="p-fluid">
                    <label for="statusFilter">Status</label>
                    <Dropdown 
                        id="statusFilter" 
                        v-model="selectedStatus" 
                        :options="statusOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        placeholder="Todos os status" 
                        :showClear="true"
                    />
                </div>
            </div>

            <div class="col-12 md:col-3">
                <div class="p-fluid">
                    <label>&nbsp;</label>
                    <div class="field-checkbox">
                        <Checkbox id="overdue" v-model="showOverdueOnly" :binary="true" />
                        <label for="overdue">Apenas em atraso</label>
                    </div>
                </div>
            </div>

            <div class="col-12 md:col-2">
                <div class="p-fluid">
                    <label>&nbsp;</label>
                    <Button 
                        label="Limpar" 
                        icon="pi pi-refresh" 
                        outlined 
                        @click="searchQuery = ''; selectedStatus = ''; showOverdueOnly = false" 
                    />
                </div>
            </div>
        </div>

        <!-- Tabela de Faturas -->
        <DataTable 
            :value="invoices" 
            :loading="isLoadingData"
            :paginator="true" 
            :rows="invoicesMeta.per_page" 
            :totalRecords="totalRecords" 
            :lazy="true" 
            :first="first"
            @page="onPageChange"
            dataKey="id" 
            :rowHover="true" 
            v-model:selection="selectedInvoices" 
            responsiveLayout="scroll"
            :globalFilterFields="['invoice_number', 'costumer.name']"
            showGridlines
        >
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <span class="text-xl font-bold">
                        Total: {{ totalRecords }} faturas
                    </span>
                </div>
            </template>

            <!-- <template #empty>
                <div class="text-center py-4">
                    <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                    <p class="text-600 text-lg">Nenhuma fatura encontrada</p>
                </div>
            </template> -->
            <template #empty>
                        <div class="text-center p-4">
                            <i class="pi pi-file-o text-4xl text-400 mb-3"></i>
                            <p class="text-600 text-lg">Nenhuma factura encontrada</p>
                            <Button label="Criar factura" icon="pi pi-plus" @click="createInvoice" />
                        </div>
                    </template>

            <template #loading>
                Carregando faturas...
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="invoice_number" header="Número" sortable style="min-width: 150px">
                <template #body="{ data }">
                    <div class="flex align-items-center">
                        <i class="pi pi-file-text mr-2 text-500"></i>
                        <span class="font-semibold">{{ data.invoice_number }}</span>
                    </div>
                </template>
            </Column>

            <Column field="costumer.name" header="Cliente" sortable style="min-width: 200px">
                <template #body="{ data }">
                    <div>
                        <div class="font-semibold">{{ data.costumer?.name || 'Cliente não informado' }}</div>
                        <div class="text-sm text-500">{{ data.costumer?.email || '' }}</div>
                    </div>
                </template>
            </Column>

            <Column field="invoice_date" header="Data Fatura" sortable style="min-width: 120px">
                <template #body="{ data }">
                    {{ formatDate(data.invoice_date) }}
                </template>
            </Column>

            <Column field="due_date" header="Vencimento" sortable style="min-width: 120px">
                <template #body="{ data }">
                    <span :class="{ 'text-red-500': new Date(data.due_date) < new Date() && data.status !== 'paid' }">
                        {{ formatDate(data.due_date) }}
                    </span>
                </template>
            </Column>

            <Column field="total_amount" header="Valor Total" sortable style="min-width: 120px">
                <template #body="{ data }">
                    <span class="font-bold text-primary">
                        {{ formatCurrency(data.total) }}
                    </span>
                </template>
            </Column>

            <Column field="payment_method" header="Pagamento" style="min-width: 130px">
                <template #body="{ data }">
                    {{ getPaymentMethodLabel(data.payment_method) }}
                </template>
            </Column>

            <Column field="status" header="Status" style="min-width: 120px">
                <template #body="{ data }">
                    <Dropdown 
                        v-model="data.status" 
                        :options="statusOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        @change="updateInvoiceStatus(data, data.status)"
                        class="w-full"
                    >
                        <template #value="{ value }">
                            <Tag 
                                :value="getStatusOption(value).label" 
                                :severity="getStatusOption(value).severity" 
                                :icon="getStatusOption(value).icon"
                            />
                        </template>
                        <template #option="{ option }">
                            <Tag 
                                :value="option.label" 
                                :severity="option.severity" 
                                :icon="option.icon"
                            />
                        </template>
                    </Dropdown>
                </template>
            </Column>

            <Column header="Ações" :exportable="false" style="min-width: 120px">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button 
                            icon="pi pi-eye" 
                            outlined 
                            rounded 
                            @click="$router.push(`/sales/invoices/${data.id}`)"
                            v-tooltip="'Ver detalhes'" 
                        />
                        <Button 
                            icon="pi pi-pencil" 
                            outlined 
                            rounded 
                            @click="$router.push(`/sales/invoices/${data.id}/edit`)"
                            v-tooltip="'Editar fatura'" 
                        />
                        <Button 
                            icon="pi pi-file-pdf" 
                            outlined 
                            rounded 
                            severity="warning"
                            @click="viewPdf(data.id)"
                            v-tooltip="'Gerar PDF'" 
                        />
                        <Button 
                            icon="pi pi-trash" 
                            outlined 
                            rounded 
                            severity="danger" 
                            @click="confirmDelete(data)"
                            v-tooltip="'Excluir fatura'" 
                        />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Informações de Paginação -->
        <div class="flex justify-content-between align-items-center mt-3">
            <small class="text-500">
                Exibindo {{ invoicesMeta.from }} a {{ invoicesMeta.to }} de {{ invoicesMeta.total }} registros
            </small>
            <small class="text-500">
                Página {{ invoicesMeta.current_page }} de {{ invoicesMeta.last_page }}
            </small>
        </div>
    </div>

    <!-- Dialog de Confirmação -->
    <ConfirmDialog />

    <!-- Dialog de Confirmação de Exclusão -->
    <Dialog 
        header="Confirmar Exclusão" 
        v-model:visible="displayConfirmation" 
        :style="{ width: '450px' }" 
        :modal="true"
    >
        <div class="flex align-items-center">
            <i class="pi pi-exclamation-triangle mr-3 text-orange-500" style="font-size: 2rem" />
            <div>
                <p class="mb-2">Tem certeza que deseja excluir esta fatura?</p>
                <p class="text-sm text-500 mb-0">
                    <strong>{{ invoiceToDelete?.invoice_number }}</strong> - {{ invoiceToDelete?.costumer?.name }}
                </p>
                <small class="text-red-500">Esta ação não pode ser desfeita.</small>
            </div>
        </div>
        
        <template #footer>
            <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                outlined 
                @click="displayConfirmation = false" 
            />
            <Button 
                label="Excluir" 
                icon="pi pi-trash" 
                severity="danger" 
                @click="deleteInvoice" 
                :loading="loadingButtonDelete" 
            />
        </template>
    </Dialog>
</template>
