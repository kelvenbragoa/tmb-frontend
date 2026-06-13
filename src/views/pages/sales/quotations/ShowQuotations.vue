<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import moment from 'moment';
import QuotationService from '@/service/QuotationService';
import ConvertToInvoiceModal from '@/components/ConvertToInvoiceModal.vue';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

// Estado da cotação
const quotation = ref(null);
const isLoading = ref(true);
const isUpdatingStatus = ref(false);

// Modal de conversão
const showConvertModal = ref(false);
const isConverting = ref(false);

// Opções de status
const statusOptions = [
    { label: 'Rascunho', value: 'DRAFT', severity: 'info', color: '#6366f1' },
    { label: 'Enviado', value: 'SENT', severity: 'warning', color: '#f59e0b' },
    { label: 'Aceito', value: 'ACCEPTED', severity: 'success', color: '#10b981' },
    { label: 'Rejeitado', value: 'REJECTED', severity: 'danger', color: '#ef4444' },
    { label: 'Expirado', value: 'EXPIRED', severity: 'secondary', color: '#6b7280' }
];

// Computed properties
const canEdit = computed(() => {
    return quotation.value?.status?.toUpperCase() === 'DRAFT';
});

const canConvertToInvoice = computed(() => {
    return quotation.value?.status?.toUpperCase() === 'ACCEPTED';
});

const isExpired = computed(() => {
    if (!quotation.value?.expiry_date) return false;
    return new Date(quotation.value.expiry_date) < new Date();
});

const statusInfo = computed(() => {
    if (!quotation.value?.status) return statusOptions[0];
    return statusOptions.find(opt => opt.value === quotation.value.status.toUpperCase()) || statusOptions[0];
});

// Métodos
const loadQuotation = async () => {
    try {
        isLoading.value = true;
        const response = await QuotationService.getQuotationById(route.params.id);
        quotation.value = response;
    } catch (error) {
        console.error('Erro ao carregar cotação:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar cotação', 
            life: 3000 
        });
        router.push('/sales/quotations');
    } finally {
        isLoading.value = false;
    }
};

const formatCurrency = (value) => {
    if (!value) return 'MZN 0,00';
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2
    }).format(value);
};

const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
};

const formatDateTime = (date) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
};

const editQuotation = () => {
    router.push(`/sales/quotations/${quotation.value.id}/edit`);
};

const duplicateQuotation = async () => {
    try {
        const response = await QuotationService.duplicateQuotation(quotation.value.id);
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Cotação duplicada com sucesso', 
            life: 3000 
        });
        router.push(`/sales/quotations/${response.id}/edit`);
    } catch (error) {
        console.error('Erro ao duplicar cotação:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao duplicar cotação', 
            life: 3000 
        });
    }
};

const updateStatus = async (newStatus) => {
    try {
        isUpdatingStatus.value = true;
        await QuotationService.updateQuotationStatus(quotation.value.id, newStatus);
        quotation.value.status = newStatus;
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Status atualizado com sucesso', 
            life: 3000 
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao atualizar status', 
            life: 3000 
        });
    } finally {
        isUpdatingStatus.value = false;
    }
};

const deleteQuotation = () => {
    confirm.require({
        message: `Tem certeza que deseja excluir a cotação ${quotation.value.quotation_number}?`,
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await QuotationService.deleteQuotation(quotation.value.id);
                toast.add({ 
                    severity: 'success', 
                    summary: 'Sucesso', 
                    detail: 'Cotação excluída com sucesso', 
                    life: 3000 
                });
                router.push('/sales/quotations');
            } catch (error) {
                console.error('Erro ao excluir cotação:', error);
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Erro ao excluir cotação', 
                    life: 3000 
                });
            }
        }
    });
};

const generatePdf = async () => {
    try {
        const pdfBlob = await QuotationService.generatePdf(quotation.value.id);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cotacao-${quotation.value.quotation_number}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'PDF gerado com sucesso', 
            life: 3000 
        });
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao gerar PDF', 
            life: 3000 
        });
    }
};

const convertToInvoice = () => {
    showConvertModal.value = true;
};

const handleConvertToInvoice = async (invoiceData) => {
    try {
        isConverting.value = true;
        const response = await QuotationService.convertToInvoice(quotation.value.id, invoiceData);
        
        toast.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: `Cotação convertida em fatura ${response.invoice_number}`, 
            life: 5000 
        });
        
        showConvertModal.value = false;
        router.push(`/sales/invoices/${response.id}`);
        
    } catch (error) {
        console.error('Erro ao converter cotação:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao converter cotação em fatura', 
            life: 3000 
        });
    } finally {
        isConverting.value = false;
    }
};

const goBack = () => {
    router.push('/sales/quotations');
};

onMounted(() => {
    loadQuotation();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <!-- Loading State -->
            <div v-if="isLoading" class="card">
                <div class="text-center p-6">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                    <p class="mt-3">Carregando cotação...</p>
                </div>
            </div>

            <!-- Content -->
            <div v-else-if="quotation" class="card">
                <!-- Header -->
                <div class="flex justify-content-between align-items-start mb-4">
                    <div>
                        <div class="flex align-items-center gap-3 mb-2">
                            <Button 
                                icon="pi pi-arrow-left" 
                                class="p-button-text p-button-plain"
                                @click="goBack"
                                v-tooltip="'Voltar'"
                            />
                            <h3 class="m-0">Cotação {{ quotation.quotation_number }}</h3>
                            <Tag 
                                :value="statusInfo.label" 
                                :severity="statusInfo.severity"
                                :style="{ backgroundColor: statusInfo.color }"
                            />
                            <Tag 
                                v-if="isExpired && quotation.status.toUpperCase() !== 'ACCEPTED'"
                                value="Expirada" 
                                severity="danger"
                            />
                        </div>
                        <div class="text-500">
                            <i class="pi pi-calendar mr-1"></i>
                            Criada em {{ formatDateTime(quotation.created_at) }}
                            <span v-if="quotation.createdByUser" class="ml-2">
                                por <strong>{{ quotation.createdByUser.name }}</strong>
                            </span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <Button 
                            label="PDF" 
                            icon="pi pi-file-pdf" 
                            class="p-button-outlined"
                            @click="generatePdf"
                        />
                        <Button 
                            label="Duplicar" 
                            icon="pi pi-copy" 
                            class="p-button-outlined"
                            @click="duplicateQuotation"
                        />
                        <Button 
                            v-if="canEdit"
                            label="Editar" 
                            icon="pi pi-pencil" 
                            @click="editQuotation"
                        />
                        <Button 
                            v-if="canConvertToInvoice"
                            label="Converter em Fatura" 
                            icon="pi pi-file-o" 
                            class="p-button-success"
                            @click="convertToInvoice"
                        />
                        <Button 
                            v-if="canEdit"
                            icon="pi pi-trash" 
                            class="p-button-danger p-button-outlined"
                            @click="deleteQuotation"
                            v-tooltip="'Excluir'"
                        />
                    </div>
                </div>

                <!-- Main Content -->
                <div class="grid">
                    <!-- Left Column - Customer and Details -->
                    <div class="col-12 md:col-8">
                        <!-- Customer Info -->
                        <div class="card mb-4">
                            <h5><i class="pi pi-user mr-2"></i>Informações do Cliente</h5>
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field-group">
                                        <label class="font-semibold">Nome:</label>
                                        <span class="ml-2">{{ quotation.costumer.name }}</span>
                                    </div>
                                    <div class="field-group" v-if="quotation.costumer.email">
                                        <label class="font-semibold">Email:</label>
                                        <span class="ml-2">{{ quotation.costumer.email }}</span>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field-group" v-if="quotation.costumer.phone">
                                        <label class="font-semibold">Telefone:</label>
                                        <span class="ml-2">{{ quotation.costumer.phone }}</span>
                                    </div>
                                    <div class="field-group" v-if="quotation.costumer.address">
                                        <label class="font-semibold">Endereço:</label>
                                        <span class="ml-2">{{ quotation.costumer.address }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Items -->
                        <div class="card">
                            <h5><i class="pi pi-list mr-2"></i>Items da Cotação</h5>
                            <DataTable 
                                :value="quotation.items" 
                                class="p-datatable-sm"
                                responsiveLayout="scroll"
                            >
                                <Column header="#" style="width: 60px">
                                    <template #body="{ index }">
                                        {{ index + 1 }}
                                    </template>
                                </Column>
                                <Column field="description" header="Descrição">
                                    <template #body="{ data }">
                                        <div>
                                            <div class="font-semibold">{{ data.description }}</div>
                                            <div v-if="data.product" class="text-sm text-500">
                                                Produto: {{ data.product.name }}
                                            </div>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="quantity" header="Qtd" style="width: 80px" class="text-center">
                                    <template #body="{ data }">
                                        {{ data.quantity }}
                                    </template>
                                </Column>
                                <Column field="unit_price" header="Preço Unit." style="width: 120px" class="text-right">
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.unit_price) }}
                                    </template>
                                </Column>
                                <Column field="discount_amount" header="Desconto" style="width: 120px" class="text-right">
                                    <template #body="{ data }">
                                        <span v-if="data.discount_amount > 0" class="text-orange-500">
                                            -{{ formatCurrency(data.discount_amount) }}
                                        </span>
                                        <span v-else>-</span>
                                    </template>
                                </Column>
                                <Column field="line_total" header="Total" style="width: 120px" class="text-right">
                                    <template #body="{ data }">
                                        <span class="font-semibold">{{ formatCurrency(data.line_total) }}</span>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                    <!-- Right Column - Summary and Actions -->
                    <div class="col-12 md:col-4">
                        <!-- Summary -->
                        <div class="card mb-4">
                            <h5><i class="pi pi-calculator mr-2"></i>Resumo Financeiro</h5>
                            
                            <div class="field-group">
                                <label>Subtotal:</label>
                                <span class="ml-auto font-semibold">{{ formatCurrency(quotation.subtotal) }}</span>
                            </div>
                            
                            <div class="field-group" v-if="quotation.discount_amount > 0">
                                <label>Desconto ({{ quotation.discount_rate }}%):</label>
                                <span class="ml-auto text-orange-500">-{{ formatCurrency(quotation.discount_amount) }}</span>
                            </div>
                            
                            <div class="field-group">
                                <label>Impostos ({{ quotation.tax_rate }}%):</label>
                                <span class="ml-auto">{{ formatCurrency(quotation.tax_amount) }}</span>
                            </div>
                            
                            <Divider class="my-3" />
                            
                            <div class="field-group">
                                <label class="text-xl font-bold">Total:</label>
                                <span class="ml-auto text-xl font-bold text-primary">{{ formatCurrency(quotation.total) }}</span>
                            </div>
                        </div>

                        <!-- Dates -->
                        <div class="card mb-4">
                            <h5><i class="pi pi-calendar mr-2"></i>Datas Importantes</h5>
                            
                            <div class="field-group">
                                <label>Data da Cotação:</label>
                                <span class="ml-auto">{{ formatDate(quotation.quotation_date) }}</span>
                            </div>
                            
                            <div class="field-group">
                                <label>Válida até:</label>
                                <span class="ml-auto" :class="{ 'text-red-500': isExpired }">
                                    {{ formatDate(quotation.expiry_date) }}
                                </span>
                            </div>
                            
                            <div class="field-group" v-if="quotation.updated_at !== quotation.created_at">
                                <label>Última atualização:</label>
                                <span class="ml-auto text-sm">{{ formatDateTime(quotation.updated_at) }}</span>
                            </div>
                        </div>

                        <!-- Status Actions -->
                        <div class="card" v-if="quotation.status.toUpperCase() === 'SENT'">
                            <h5><i class="pi pi-cog mr-2"></i>Ações de Status</h5>
                            
                            <div class="flex flex-column gap-2">
                                <Button 
                                    label="Marcar como Aceita" 
                                    icon="pi pi-check" 
                                    class="p-button-success p-button-sm"
                                    :loading="isUpdatingStatus"
                                    @click="updateStatus('accepted')"
                                />
                                <Button 
                                    label="Marcar como Rejeitada" 
                                    icon="pi pi-times" 
                                    class="p-button-danger p-button-outlined p-button-sm"
                                    :loading="isUpdatingStatus"
                                    @click="updateStatus('rejected')"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                <div v-if="quotation.notes" class="card mt-4">
                    <h5><i class="pi pi-comment mr-2"></i>Observações</h5>
                    <p class="text-700 line-height-3 m-0">{{ quotation.notes }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de conversão para fatura -->
    <ConvertToInvoiceModal 
        v-model:visible="showConvertModal"
        :quotation="quotation"
        :loading="isConverting"
        @convert="handleConvertToInvoice"
    />
</template>

<style scoped>
.field-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding: 0.25rem 0;
}

.field-group label {
    font-weight: 500;
    color: var(--text-color-secondary);
}

.card {
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    background: var(--surface-card);
}

.card h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-color);
    font-weight: 600;
}
</style>