<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import PurchaseInvoiceService from '@/service/PurchaseInvoiceService';
import PurchaseOrderService from '@/service/PurchaseOrderService';

export default {
    name: 'ConvertPOModal',
    emits: ['close', 'converted'],
    setup(props, { emit }) {
        const toast = useToast();

        // Estado
        const loading = ref(false);
        const purchaseOrders = ref([]);
        const selectedPO = ref(null);

        // Formulário
        const form = reactive({
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            payment_terms: 'net_30',
            notes: '',
            reference_number: '',
            keep_po_notes: true
        });

        // Computed
        const paymentTermsOptions = computed(() => PurchaseInvoiceService.getPaymentTerms());
        
        const poOptions = computed(() => 
            purchaseOrders.value
                .filter(po => po.status === 'received' && !po.has_invoice)
                .map(po => ({
                    label: `${po.order_number} - ${po.supplier?.name || 'Sem fornecedor'}`,
                    value: po.id,
                    po
                }))
        );

        const selectedPODetails = computed(() => {
            if (!selectedPO.value) return null;
            return purchaseOrders.value.find(po => po.id === selectedPO.value);
        });

        // Métodos
        const loadPurchaseOrders = async () => {
            try {
                const response = await PurchaseOrderService.getAllPurchaseOrders({ 
                    limit: 1000,
                    status: 'received'
                });
                purchaseOrders.value = response.items || [];
            } catch (error) {
                console.error('Erro ao carregar purchase orders:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar purchase orders',
                    life: 5000
                });
            }
        };

        const calculateDueDate = () => {
            if (!form.invoice_date || !form.payment_terms) return;
            
            const invoiceDate = new Date(form.invoice_date);
            let dueDate = new Date(invoiceDate);
            
            switch (form.payment_terms) {
                case 'immediate':
                    dueDate = invoiceDate;
                    break;
                case 'net_15':
                    dueDate.setDate(dueDate.getDate() + 15);
                    break;
                case 'net_30':
                    dueDate.setDate(dueDate.getDate() + 30);
                    break;
                case 'net_45':
                    dueDate.setDate(dueDate.getDate() + 45);
                    break;
                case 'net_60':
                    dueDate.setDate(dueDate.getDate() + 60);
                    break;
                case 'net_90':
                    dueDate.setDate(dueDate.getDate() + 90);
                    break;
            }
            
            form.due_date = dueDate.toISOString().split('T')[0];
        };

        const onPOSelect = () => {
            if (selectedPODetails.value) {
                // Pré-preencher campos baseados na PO
                if (!form.reference_number) {
                    form.reference_number = `PO-${selectedPODetails.value.order_number}`;
                }
                
                if (form.keep_po_notes && selectedPODetails.value.notes && !form.notes) {
                    form.notes = selectedPODetails.value.notes;
                }
            }
        };

        const validateForm = () => {
            const errors = [];

            if (!selectedPO.value) errors.push('Purchase Order é obrigatória');
            if (!form.invoice_date) errors.push('Data da fatura é obrigatória');
            if (!form.due_date) errors.push('Data de vencimento é obrigatória');

            return errors;
        };

        const convertPO = async () => {
            const errors = validateForm();
            if (errors.length > 0) {
                toast.add({
                    severity: 'error',
                    summary: 'Erro de Validação',
                    detail: errors.join(', '),
                    life: 5000
                });
                return;
            }

            loading.value = true;
            try {
                const response = await PurchaseInvoiceService.convertFromPurchaseOrder(selectedPO.value, form);
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Fatura ${response.invoice_number} criada a partir da PO`,
                    life: 3000
                });

                emit('converted', response);
                closeModal();
            } catch (error) {
                console.error('Erro ao converter PO:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao converter Purchase Order',
                    life: 5000
                });
            } finally {
                loading.value = false;
            }
        };

        const closeModal = () => {
            emit('close');
        };

        const formatCurrency = (value) => {
            if (!value) return 'MZN 0,00';
            return new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN'
            }).format(value);
        };

        const formatDate = (date) => {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('pt-BR');
        };

        // Watchers
        const watchPaymentTerms = () => {
            calculateDueDate();
        };

        // Lifecycle
        onMounted(() => {
            loadPurchaseOrders();
            calculateDueDate();
        });

        return {
            // Estado
            loading,
            selectedPO,
            form,

            // Computed
            paymentTermsOptions,
            poOptions,
            selectedPODetails,

            // Métodos
            onPOSelect,
            convertPO,
            closeModal,
            formatCurrency,
            formatDate,
            watchPaymentTerms
        };
    }
};
</script>

<template>
    <Dialog 
        :visible="true" 
        @hide="closeModal" 
        header="Converter Purchase Order em Fatura" 
        :modal="true" 
        :closable="true"
        :style="{ width: '800px' }"
        class="p-fluid"
    >
        <div class="grid">
            <!-- Seleção da Purchase Order -->
            <div class="col-12">
                <div class="field">
                    <label for="purchase_order" class="font-medium">Purchase Order *</label>
                    <Dropdown 
                        id="purchase_order" 
                        v-model="selectedPO" 
                        :options="poOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        placeholder="Selecione uma Purchase Order recebida" 
                        @change="onPOSelect"
                        class="w-full" 
                        filter 
                    />
                    <small class="text-600">Apenas POs com status "Recebida" e sem fatura são mostradas</small>
                </div>
            </div>

            <!-- Detalhes da PO Selecionada -->
            <div v-if="selectedPODetails" class="col-12">
                <div class="p-3 surface-50 border-round mb-3">
                    <h6 class="text-600 mb-2">Detalhes da Purchase Order</h6>
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="flex justify-content-between mb-1">
                                <span class="text-600">Número:</span>
                                <span class="font-medium">{{ selectedPODetails.order_number }}</span>
                            </div>
                            <div class="flex justify-content-between mb-1">
                                <span class="text-600">Fornecedor:</span>
                                <span class="font-medium">{{ selectedPODetails.supplier?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-content-between">
                                <span class="text-600">Data:</span>
                                <span>{{ formatDate(selectedPODetails.order_date) }}</span>
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="flex justify-content-between mb-1">
                                <span class="text-600">Total:</span>
                                <span class="font-medium">{{ formatCurrency(selectedPODetails.total_amount) }}</span>
                            </div>
                            <div class="flex justify-content-between mb-1">
                                <span class="text-600">Itens:</span>
                                <span>{{ selectedPODetails.items?.length || 0 }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dados da Fatura -->
            <div class="col-12 md:col-4">
                <div class="field">
                    <label for="invoice_date" class="font-medium">Data da Fatura *</label>
                    <Calendar 
                        id="invoice_date" 
                        v-model="form.invoice_date" 
                        dateFormat="yy-mm-dd" 
                        @input="watchPaymentTerms"
                        class="w-full" 
                    />
                </div>
            </div>

            <div class="col-12 md:col-4">
                <div class="field">
                    <label for="payment_terms" class="font-medium">Condições de Pagamento</label>
                    <Dropdown 
                        id="payment_terms" 
                        v-model="form.payment_terms" 
                        :options="paymentTermsOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        @change="watchPaymentTerms"
                        class="w-full" 
                    />
                </div>
            </div>

            <div class="col-12 md:col-4">
                <div class="field">
                    <label for="due_date" class="font-medium">Data de Vencimento *</label>
                    <Calendar 
                        id="due_date" 
                        v-model="form.due_date" 
                        dateFormat="yy-mm-dd" 
                        class="w-full" 
                    />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="reference_number" class="font-medium">Número de Referência</label>
                    <InputText 
                        id="reference_number" 
                        v-model="form.reference_number" 
                        placeholder="Ex: REF-PO-001" 
                        class="w-full" 
                    />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <div class="flex align-items-center mt-4">
                        <Checkbox 
                            id="keep_po_notes" 
                            v-model="form.keep_po_notes" 
                            :binary="true" 
                        />
                        <label for="keep_po_notes" class="ml-2">Manter observações da PO</label>
                    </div>
                </div>
            </div>

            <div class="col-12">
                <div class="field">
                    <label for="notes" class="font-medium">Observações da Fatura</label>
                    <Textarea 
                        id="notes" 
                        v-model="form.notes" 
                        rows="3" 
                        placeholder="Observações específicas para esta fatura..." 
                        class="w-full" 
                    />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button 
                    label="Cancelar" 
                    icon="pi pi-times" 
                    @click="closeModal" 
                    class="p-button-text" 
                />
                <Button 
                    label="Converter em Fatura" 
                    icon="pi pi-check" 
                    @click="convertPO" 
                    :loading="loading" 
                    :disabled="!selectedPO"
                />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
}
</style>