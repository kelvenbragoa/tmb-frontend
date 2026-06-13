<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PurchaseOrderService from '@/service/PurchaseOrderService';

export default {
    name: 'ShowPurchaseOrder',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const toast = useToast();
        const confirm = useConfirm();

        // Estado
        const loading = ref(false);
        const purchaseOrder = ref({});

        // Computed
        const canEdit = computed(() => {
            return PurchaseOrderService.canEditOrder(purchaseOrder.value.status);
        });

        const canDelete = computed(() => {
            return PurchaseOrderService.canDeleteOrder(purchaseOrder.value.status);
        });

        const statusOptions = computed(() => {
            const currentStatus = purchaseOrder.value.status;
            const options = [];

            // Lógica de transição de status permitida
            if (currentStatus === 'draft') {
                options.push(
                    { label: 'Enviar', value: 'sent', icon: 'pi pi-send' },
                    { label: 'Confirmar', value: 'confirmed', icon: 'pi pi-check' },
                    { label: 'Cancelar', value: 'cancelled', icon: 'pi pi-times' }
                );
            } else if (currentStatus === 'sent') {
                options.push(
                    { label: 'Confirmar', value: 'confirmed', icon: 'pi pi-check' },
                    { label: 'Cancelar', value: 'cancelled', icon: 'pi pi-times' }
                );
            } else if (currentStatus === 'confirmed') {
                options.push(
                    { label: 'Receber Totalmente', value: 'received', icon: 'pi pi-box' },
                    { label: 'Receber Parcialmente', value: 'partially_received', icon: 'pi pi-minus' },
                    { label: 'Cancelar', value: 'cancelled', icon: 'pi pi-times' }
                );
            } else if (currentStatus === 'partially_received') {
                options.push(
                    { label: 'Receber Totalmente', value: 'received', icon: 'pi pi-check' }
                );
            }

            return options;
        });

        // Métodos
        const loadPurchaseOrder = async () => {
            loading.value = true;
            try {
                const response = await PurchaseOrderService.getPurchaseOrderById(route.params.id);
                purchaseOrder.value = response;
            } catch (error) {
                console.error('Erro ao carregar ordem de compra:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao carregar ordem de compra',
                    life: 5000
                });
                goBack();
            } finally {
                loading.value = false;
            }
        };

        const editPurchaseOrder = () => {
            router.push({ name: 'purchase-orders.edit', params: { id: purchaseOrder.value.id } });
        };

        const duplicatePurchaseOrder = async () => {
            try {
                const duplicatedOrder = await PurchaseOrderService.duplicatePurchaseOrder(purchaseOrder.value.id);
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Ordem ${duplicatedOrder.order_number} criada com sucesso`,
                    life: 3000
                });
                router.push({ name: 'purchase-orders.show', params: { id: duplicatedOrder.id } });
            } catch (error) {
                console.error('Erro ao duplicar ordem de compra:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao duplicar ordem de compra',
                    life: 5000
                });
            }
        };

        const updateStatus = async (newStatus) => {
            try {
                await PurchaseOrderService.updatePurchaseOrderStatus(purchaseOrder.value.id, newStatus);
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Status atualizado para ${PurchaseOrderService.getPurchaseOrderStatusLabel(newStatus)}`,
                    life: 3000
                });
                await loadPurchaseOrder(); // Recarregar dados
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao atualizar status',
                    life: 5000
                });
            }
        };

        const deletePurchaseOrder = () => {
            if (!canDelete.value) {
                toast.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: 'Não é possível excluir uma ordem já recebida',
                    life: 3000
                });
                return;
            }

            confirm.require({
                message: `Tem certeza que deseja excluir a ordem "${purchaseOrder.value.order_number}"?`,
                header: 'Confirmar Exclusão',
                icon: 'pi pi-exclamation-triangle',
                rejectClass: 'p-button-text',
                acceptClass: 'p-button-danger',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Excluir',
                accept: async () => {
                    try {
                        await PurchaseOrderService.deletePurchaseOrder(purchaseOrder.value.id);
                        toast.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Ordem de compra excluída com sucesso',
                            life: 3000
                        });
                        goBack();
                    } catch (error) {
                        console.error('Erro ao excluir ordem de compra:', error);
                        toast.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: error.message || 'Erro ao excluir ordem de compra',
                            life: 5000
                        });
                    }
                }
            });
        };

        const viewPdf = () => {
            router.push({ name: 'purchase-orders.pdf', params: { id: route.params.id } });
        };

        const goBack = () => {
            router.push({ name: 'purchase-orders.index' });
        };

        const getStatusSeverity = (status) => {
            return PurchaseOrderService.getStatusSeverity(status);
        };

        const getStatusLabel = (status) => {
            return PurchaseOrderService.getPurchaseOrderStatusLabel(status);
        };

        const getDeliveryTermLabel = (term) => {
            return PurchaseOrderService.getDeliveryTermLabel(term);
        };

        const formatDate = (date) => {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('pt-BR');
        };

        const formatCurrency = (value) => {
            if (!value) return 'MZN 0,00';
            return new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN'
            }).format(value);
        };

        const calculateItemTotal = (item) => {
            return PurchaseOrderService.calculateItemTotal(
                item.quantity || 0,
                item.unit_price || 0,
                item.discount_rate || 0,
                item.discount_amount || 0
            );
        };

        // Lifecycle
        onMounted(() => {
            loadPurchaseOrder();
        });

        return {
            // Estado
            loading,
            purchaseOrder,

            // Computed
            canEdit,
            canDelete,
            statusOptions,

            // Métodos
            editPurchaseOrder,
            duplicatePurchaseOrder,
            updateStatus,
            deletePurchaseOrder,
            viewPdf,
            goBack,
            getStatusSeverity,
            getStatusLabel,
            getDeliveryTermLabel,
            formatDate,
            formatCurrency,
            calculateItemTotal
        };
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!-- Cabeçalho -->
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">
                        Ordem de Compra
                        <Tag v-if="purchaseOrder.status" :value="getStatusLabel(purchaseOrder.status)" :severity="getStatusSeverity(purchaseOrder.status)" class="ml-2" />
                    </h5>
                    <div class="flex gap-2">
                        <Button label="Ver PDF" icon="pi pi-file-pdf" @click="viewPdf" class="p-button-outlined p-button-secondary" />
                        <Button label="Editar" icon="pi pi-pencil" @click="editPurchaseOrder" :disabled="!canEdit" class="p-button-outlined" />
                        <Button label="Duplicar" icon="pi pi-copy" @click="duplicatePurchaseOrder" class="p-button-outlined" />
                        
                        <!-- Menu de Status -->
                        <SplitButton 
                            v-if="statusOptions.length > 0"
                            label="Alterar Status" 
                            icon="pi pi-cog" 
                            :model="statusOptions.map(option => ({ 
                                label: option.label, 
                                icon: option.icon, 
                                command: () => updateStatus(option.value) 
                            }))"
                            class="p-button-outlined"
                        />

                        <Button label="Excluir" icon="pi pi-trash" @click="deletePurchaseOrder" :disabled="!canDelete" class="p-button-outlined p-button-danger" />
                        <Button label="Voltar" icon="pi pi-arrow-left" @click="goBack" class="p-button-text" />
                    </div>
                </div>

                <div v-if="loading" class="text-center py-8">
                    <ProgressSpinner />
                    <p class="mt-3 text-600">Carregando detalhes da ordem...</p>
                </div>

                <div v-else-if="purchaseOrder.id" class="grid">
                    <!-- Informações Básicas -->
                    <div class="col-12">
                        <Panel header="Informações Básicas" class="mb-4">
                            <div class="grid">
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Número da Ordem</label>
                                        <p class="mt-2 mb-0 text-700">{{ purchaseOrder.order_number }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Data da Ordem</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDate(purchaseOrder.order_date) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Entrega Prevista</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDate(purchaseOrder.expected_delivery_date) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Referência</label>
                                        <p class="mt-2 mb-0 text-700">{{ purchaseOrder.reference_number || '-' }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Termos de Entrega</label>
                                        <p class="mt-2 mb-0 text-700">{{ getDeliveryTermLabel(purchaseOrder.delivery_terms) || '-' }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Endereço de Entrega</label>
                                        <p class="mt-2 mb-0 text-700">{{ purchaseOrder.delivery_address || '-' }}</p>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Fornecedor -->
                    <div class="col-12 md:col-6">
                        <Panel header="Fornecedor" class="mb-4">
                            <div v-if="purchaseOrder.supplier">
                                <div class="grid">
                                    <div class="col-12">
                                        <div class="field">
                                            <label class="font-medium text-900">Nome</label>
                                            <p class="mt-2 mb-0 text-700">{{ purchaseOrder.supplier.name }}</p>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Email</label>
                                            <p class="mt-2 mb-0 text-700">{{ purchaseOrder.supplier.email || '-' }}</p>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label class="font-medium text-900">Telefone</label>
                                            <p class="mt-2 mb-0 text-700">{{ purchaseOrder.supplier.phone || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <p class="text-600">Informações do fornecedor não disponíveis</p>
                            </div>
                        </Panel>
                    </div>

                    <!-- Resumo Financeiro -->
                    <div class="col-12 md:col-6">
                        <Panel header="Resumo Financeiro" class="mb-4">
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Subtotal</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatCurrency(purchaseOrder.subtotal) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Desconto</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatCurrency(purchaseOrder.discount_amount) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Imposto ({{ purchaseOrder.tax_rate }}%)</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatCurrency(purchaseOrder.tax_amount) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="field">
                                        <label class="font-medium text-900">Envio</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatCurrency(purchaseOrder.shipping_cost) }}</p>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="border-top-1 border-300 pt-3">
                                        <div class="field">
                                            <label class="font-medium text-900 text-xl">Total</label>
                                            <p class="mt-2 mb-0 text-primary font-bold text-2xl">{{ formatCurrency(purchaseOrder.total) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <!-- Itens -->
                    <div class="col-12">
                        <Panel header="Itens da Ordem" class="mb-4">
                            <DataTable :value="purchaseOrder.items" responsiveLayout="scroll" class="p-datatable-gridlines">
                                <template #empty>
                                    <div class="text-center py-4">
                                        <p class="text-600">Nenhum item encontrado</p>
                                    </div>
                                </template>

                                <Column field="description" header="Descrição" class="min-w-16rem">
                                    <template #body="{ data }">
                                        <div>
                                            <div class="font-medium">{{ data.description }}</div>
                                            <div v-if="data.product" class="text-sm text-600">SKU: {{ data.product.sku || '-' }}</div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="quantity" header="Quantidade" class="min-w-8rem">
                                    <template #body="{ data }">
                                        <div class="text-center">
                                            <div class="font-medium">{{ data.quantity }}</div>
                                            <div v-if="data.received_quantity > 0" class="text-sm text-green-600">
                                                Recebido: {{ data.received_quantity }}
                                            </div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="unit_price" header="Preço Unit." class="min-w-10rem">
                                    <template #body="{ data }">
                                        <div class="text-right">{{ formatCurrency(data.unit_price) }}</div>
                                    </template>
                                </Column>

                                <Column header="Desconto" class="min-w-8rem">
                                    <template #body="{ data }">
                                        <div class="text-center">
                                            <div v-if="data.discount_rate > 0">{{ data.discount_rate }}%</div>
                                            <div v-else-if="data.discount_amount > 0">{{ formatCurrency(data.discount_amount) }}</div>
                                            <div v-else>-</div>
                                        </div>
                                    </template>
                                </Column>

                                <Column header="Total" class="min-w-10rem">
                                    <template #body="{ data }">
                                        <div class="text-right font-medium">
                                            {{ formatCurrency(calculateItemTotal(data)) }}
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </Panel>
                    </div>

                    <!-- Observações e Termos -->
                    <div class="col-12" v-if="purchaseOrder.notes || purchaseOrder.terms_and_conditions">
                        <div class="grid">
                            <div class="col-12 md:col-6" v-if="purchaseOrder.notes">
                                <Panel header="Observações" class="mb-4">
                                    <p class="m-0 text-700 line-height-3">{{ purchaseOrder.notes }}</p>
                                </Panel>
                            </div>
                            <div class="col-12 md:col-6" v-if="purchaseOrder.terms_and_conditions">
                                <Panel header="Termos e Condições" class="mb-4">
                                    <p class="m-0 text-700 line-height-3">{{ purchaseOrder.terms_and_conditions }}</p>
                                </Panel>
                            </div>
                        </div>
                    </div>

                    <!-- Informações de Auditoria -->
                    <div class="col-12">
                        <Panel header="Informações de Auditoria" class="mb-4">
                            <div class="grid">
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Criado por</label>
                                        <p class="mt-2 mb-0 text-700">{{ purchaseOrder.createdByUser?.name || '-' }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Data de Criação</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDate(purchaseOrder.createdAt) }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Atualizado por</label>
                                        <p class="mt-2 mb-0 text-700">{{ purchaseOrder.updatedByUser?.name || '-' }}</p>
                                    </div>
                                </div>
                                <div class="col-12 md:col-3">
                                    <div class="field">
                                        <label class="font-medium text-900">Data de Atualização</label>
                                        <p class="mt-2 mb-0 text-700">{{ formatDate(purchaseOrder.updatedAt) }}</p>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
}

.line-height-3 {
    line-height: 1.75;
}
</style>