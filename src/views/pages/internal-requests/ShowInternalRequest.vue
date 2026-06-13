<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// PrimeVue Components
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import ProgressSpinner from 'primevue/progressspinner';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';

// Services
import InternalRequestService from '@/service/InternalRequestService';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// State
const loading = ref(false);
const actionLoading = ref(false);
const request = ref(null);
const rejectDialog = ref(false);
const rejection_reason = ref('');

// Get request ID from route
const requestId = computed(() => route.params.id);

// Methods
const loadRequest = async () => {
    try {
        loading.value = true;
        request.value = await InternalRequestService.getInternalRequest(requestId.value);
    } catch (error) {
        console.error('Erro ao carregar requisição:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar requisição interna',
            life: 3000
        });
        router.push('/internal-requests');
    } finally {
        loading.value = false;
    }
};

// Actions
const approveRequest = () => {
    confirm.require({
        message: 'Tem certeza que deseja aprovar esta requisição?',
        header: 'Confirmar Aprovação',
        icon: 'pi pi-check-circle',
        accept: async () => {
            try {
                actionLoading.value = true;
                
                const updated = await InternalRequestService.approveInternalRequest(requestId.value);
                request.value = updated;
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Requisição aprovada com sucesso',
                    life: 3000
                });
            } catch (error) {
                console.error('Erro ao aprovar requisição:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao aprovar requisição',
                    life: 3000
                });
            } finally {
                actionLoading.value = false;
            }
        }
    });
};

const rejectRequest = () => {
    rejection_reason.value = '';
    rejectDialog.value = true;
};

const confirmReject = async () => {
    if (!rejection_reason.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Por favor, informe o motivo da rejeição',
            life: 3000
        });
        return;
    }

    try {
        actionLoading.value = true;
        
        const updated = await InternalRequestService.rejectInternalRequest(requestId.value, rejection_reason.value.trim());
        request.value = updated;
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Requisição rejeitada',
            life: 3000
        });
        
        rejectDialog.value = false;
    } catch (error) {
        console.error('Erro ao rejeitar requisição:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao rejeitar requisição',
            life: 3000
        });
    } finally {
        actionLoading.value = false;
    }
};

const cancelReject = () => {
    rejectDialog.value = false;
    rejection_reason.value = '';
};

const duplicateRequest = async () => {
    try {
        actionLoading.value = true;
        
        const duplicated = await InternalRequestService.duplicateInternalRequest(requestId.value);
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Requisição duplicada: ${duplicated.request_number}`,
            life: 3000
        });
        
        router.push(`/internal-requests/${duplicated.id}`);
    } catch (error) {
        console.error('Erro ao duplicar requisição:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao duplicar requisição',
            life: 3000
        });
    } finally {
        actionLoading.value = false;
    }
};

const deleteRequest = () => {
    confirm.require({
        message: 'Tem certeza que deseja excluir esta requisição? Esta ação não pode ser desfeita.',
        header: 'Confirmar Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                actionLoading.value = true;
                
                await InternalRequestService.deleteInternalRequest(requestId.value);
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Requisição excluída com sucesso',
                    life: 3000
                });
                
                router.push('/internal-requests');
            } catch (error) {
                console.error('Erro ao excluir requisição:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao excluir requisição',
                    life: 3000
                });
            } finally {
                actionLoading.value = false;
            }
        }
    });
};

// Navigation
const goToEdit = () => {
    router.push(`/internal-requests/${requestId.value}/edit`);
};

const goToIndex = () => {
    router.push('/internal-requests');
};

const generatePDF = () => {
    router.push(`/internal-requests/${requestId.value}/pdf`);
};

// Utility methods
const getStatusLabel = (status) => InternalRequestService.getStatusLabel(status);
const getStatusSeverity = (status) => InternalRequestService.getStatusSeverity(status);
const getPriorityLabel = (priority) => InternalRequestService.getPriorityLabel(priority);
const getPrioritySeverity = (priority) => InternalRequestService.getPrioritySeverity(priority);
const formatCurrency = (value) => InternalRequestService.formatCurrency(value);
const formatDate = (date) => InternalRequestService.formatDate(date);

// Calculate item total
const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
};

// Calculate request totals
const calculateRequestTotals = computed(() => {
    if (!request.value?.items) return { subtotal: 0, total: 0 };
    
    const subtotal = request.value.items.reduce((sum, item) => {
        return sum + calculateItemTotal(item);
    }, 0);
    
    return {
        subtotal,
        total: subtotal
    };
});

// Permissions
const canEdit = computed(() => {
    if (!request.value) return false;
    // Mock current user - em produção deve vir do auth store
    const currentUser = { id: 1, role: 'admin', permissions: ['approve_requests'] };
    return InternalRequestService.canEdit(request.value, currentUser);
});

const canApprove = computed(() => {
    if (!request.value) return false;
    // Mock current user - em produção deve vir do auth store
    const currentUser = { id: 1, role: 'admin', permissions: ['approve_requests'] };
    return InternalRequestService.canApprove(request.value, currentUser);
});

const canDelete = computed(() => {
    if (!request.value) return false;
    // Mock current user - em produção deve vir do auth store
    const currentUser = { id: 1, role: 'admin', permissions: ['approve_requests'] };
    return InternalRequestService.canDelete(request.value, currentUser);
});

onMounted(() => {
    loadRequest();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!-- Header -->
                <div class="flex justify-content-between align-items-center mb-4">
                    <div class="flex align-items-center gap-3">
                        <Button icon="pi pi-arrow-left" class="p-button-text p-button-rounded" v-tooltip.right="'Voltar'" @click="goToIndex" />
                        <div v-if="request">
                            <h5 class="m-0">{{ request.request_number }}</h5>
                            <p class="text-600 m-0">{{ request.title }}</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-2" v-if="request">
                        <Button label="PDF" icon="pi pi-file-pdf" class="p-button-outlined" severity="danger" @click="generatePDF" />
                        <Button label="Duplicar" icon="pi pi-copy" class="p-button-outlined" severity="info" @click="duplicateRequest" :loading="actionLoading" />
                        <Button label="Editar" icon="pi pi-pencil" class="p-button-outlined" severity="warning" @click="goToEdit" :disabled="!canEdit" />
                        <Button label="Excluir" icon="pi pi-trash" class="p-button-outlined" severity="danger" @click="deleteRequest" :disabled="!canDelete" :loading="actionLoading" />
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-content-center align-items-center" style="min-height: 200px">
                    <ProgressSpinner />
                </div>

                <!-- Content -->
                <div v-else-if="request">
                    <!-- Status and Actions -->
                    <div class="card mb-4">
                        <div class="flex justify-content-between align-items-center">
                            <div class="flex align-items-center gap-3">
                                <Tag :value="getStatusLabel(request.status)" :severity="getStatusSeverity(request.status)" class="font-semibold text-lg" />
                                <Tag :value="getPriorityLabel(request.priority)" :severity="getPrioritySeverity(request.priority)" class="font-semibold" />
                            </div>
                            
                            <div class="flex gap-2" v-if="canApprove">
                                <Button label="Aprovar" icon="pi pi-check" class="p-button-success" @click="approveRequest" :loading="actionLoading" />
                                <Button label="Rejeitar" icon="pi pi-times" class="p-button-danger" @click="rejectRequest" :loading="actionLoading" />
                            </div>
                        </div>
                    </div>

                    <!-- Basic Information -->
                    <div class="card mb-4">
                        <h6>Informações Básicas</h6>
                        <div class="grid">
                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-900 font-medium mb-2">Título</label>
                                    <p class="m-0 text-700">{{ request.title }}</p>
                                </div>
                            </div>
                            
                            <div class="col-12">
                                <div class="field">
                                    <label class="block text-900 font-medium mb-2">Descrição</label>
                                    <p class="m-0 text-700" style="white-space: pre-wrap">{{ request.description }}</p>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-900 font-medium mb-2">Solicitante</label>
                                    <div class="flex align-items-center gap-2">
                                        <Avatar :label="request.requestedByUser?.name?.charAt(0) || 'U'" size="small" shape="circle" />
                                        <span>{{ request.requestedByUser?.name || request.requested_by }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field" v-if="request.approvedByUser">
                                    <label class="block text-900 font-medium mb-2">Aprovado por</label>
                                    <div class="flex align-items-center gap-2">
                                        <Avatar :label="request.approvedByUser.name?.charAt(0) || 'A'" size="small" shape="circle" />
                                        <span>{{ request.approvedByUser.name }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 md:col-4">
                                <div class="field">
                                    <label class="block text-900 font-medium mb-2">Data da Requisição</label>
                                    <p class="m-0 text-700">{{ formatDate(request.request_date) }}</p>
                                </div>
                            </div>

                            <div class="col-12 md:col-4">
                                <div class="field" v-if="request.required_date">
                                    <label class="block text-900 font-medium mb-2">Data Necessária</label>
                                    <p class="m-0 text-700">{{ formatDate(request.required_date) }}</p>
                                </div>
                            </div>

                            <div class="col-12 md:col-4">
                                <div class="field" v-if="request.approved_date">
                                    <label class="block text-900 font-medium mb-2">Data de Aprovação</label>
                                    <p class="m-0 text-700">{{ formatDate(request.approved_date) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Items -->
                    <div class="card mb-4">
                        <h6>Items da Requisição</h6>
                        <DataTable :value="request.items" responsiveLayout="scroll" :paginator="false" dataKey="id">
                            <template #empty>
                                <div class="text-center p-4">
                                    <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                                    <p class="text-600 font-medium">Nenhum item encontrado</p>
                                </div>
                            </template>

                            <Column field="description" header="Descrição" style="min-width: 15rem">
                                <template #body="{ data }">
                                    <span class="font-medium">{{ data.description }}</span>
                                </template>
                            </Column>

                            <Column field="quantity" header="Quantidade" style="min-width: 8rem">
                                <template #body="{ data }">
                                    {{ data.quantity }}
                                </template>
                            </Column>

                            <Column field="unit" header="Unidade" style="min-width: 8rem">
                                <template #body="{ data }">
                                    {{ data.unit }}
                                </template>
                            </Column>

                            <Column field="unit_price" header="Preço Unit." style="min-width: 10rem">
                                <template #body="{ data }">
                                    {{ formatCurrency(data.unit_price) }}
                                </template>
                            </Column>

                            <Column field="total" header="Total" style="min-width: 10rem">
                                <template #body="{ data }">
                                    <span class="font-semibold">{{ formatCurrency(calculateItemTotal(data)) }}</span>
                                </template>
                            </Column>
                        </DataTable>

                        <!-- Totals -->
                        <div class="flex justify-content-end mt-4">
                            <div class="border-1 border-300 border-round p-3" style="min-width: 300px">
                                <div class="flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span class="font-medium">{{ formatCurrency(calculateRequestTotals.subtotal) }}</span>
                                </div>
                                <Divider class="my-2" />
                                <div class="flex justify-content-between">
                                    <span class="font-bold">Total:</span>
                                    <span class="font-bold text-xl">{{ formatCurrency(calculateRequestTotals.total) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Notes and Comments -->
                    <div class="card" v-if="request.notes">
                        <h6>Observações</h6>
                        <p class="m-0 text-700" style="white-space: pre-wrap">{{ request.notes }}</p>
                    </div>

                    <!-- Audit Information -->
                    <div class="card">
                        <h6>Informações de Auditoria</h6>
                        <div class="grid">
                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-900 font-medium mb-2">Criado em</label>
                                    <p class="m-0 text-700">{{ formatDate(request.created_at) }}</p>
                                </div>
                            </div>
                            
                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-900 font-medium mb-2">Atualizado em</label>
                                    <p class="m-0 text-700">{{ formatDate(request.updated_at) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog />
    
    <!-- Reject Dialog -->
    <Dialog v-model:visible="rejectDialog" modal header="Rejeitar Requisição" style="width: 500px" :closable="false">
        <p class="mb-3">Informe o motivo da rejeição desta requisição:</p>
        <Textarea v-model="rejection_reason" placeholder="Digite o motivo da rejeição..." rows="4" class="w-full" :class="{ 'p-invalid': !rejection_reason.trim() }" />
        
        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-outlined" @click="cancelReject" :disabled="actionLoading" />
                <Button label="Rejeitar" icon="pi pi-check" class="p-button-danger" @click="confirmReject" :loading="actionLoading" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.field label {
    font-weight: 600;
}

.field p {
    min-height: 1.5rem;
}
</style>
