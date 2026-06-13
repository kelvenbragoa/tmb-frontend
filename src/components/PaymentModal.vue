<script>
import { ref, reactive, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import PurchaseInvoiceService from '@/service/PurchaseInvoiceService';

export default {
    name: 'PaymentModal',
    props: {
        invoice: {
            type: Object,
            required: true
        }
    },
    emits: ['close', 'payment-recorded'],
    setup(props, { emit }) {
        const toast = useToast();

        // Estado
        const loading = ref(false);

        // Formulário
        const form = reactive({
            amount: props.invoice.balance_due || 0,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'bank_transfer',
            reference_number: '',
            notes: ''
        });

        // Computed
        const paymentMethodOptions = computed(() => PurchaseInvoiceService.getPaymentMethods());
        
        const maxAmount = computed(() => props.invoice.balance_due || 0);
        
        const remainingBalance = computed(() => {
            return Math.max(0, maxAmount.value - (form.amount || 0));
        });

        const isFullPayment = computed(() => {
            return form.amount >= maxAmount.value;
        });

        // Métodos
        const validateForm = () => {
            const errors = [];

            if (!form.amount || form.amount <= 0) {
                errors.push('Valor do pagamento deve ser maior que zero');
            }
            
            if (form.amount > maxAmount.value) {
                errors.push('Valor do pagamento não pode exceder o saldo devedor');
            }

            if (!form.payment_date) {
                errors.push('Data do pagamento é obrigatória');
            }

            if (!form.payment_method) {
                errors.push('Método de pagamento é obrigatório');
            }

            // Validar data não futura
            const paymentDate = new Date(form.payment_date);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Final do dia

            if (paymentDate > today) {
                errors.push('Data do pagamento não pode ser futura');
            }

            return errors;
        };

        const recordPayment = async () => {
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
                const response = await PurchaseInvoiceService.recordPayment(props.invoice.id, form);
                
                toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: isFullPayment.value 
                        ? 'Pagamento registrado. Fatura quitada!' 
                        : 'Pagamento parcial registrado com sucesso',
                    life: 3000
                });

                emit('payment-recorded', response);
                closeModal();
            } catch (error) {
                console.error('Erro ao registrar pagamento:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.message || 'Erro ao registrar pagamento',
                    life: 5000
                });
            } finally {
                loading.value = false;
            }
        };

        const payFullAmount = () => {
            form.amount = maxAmount.value;
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

        const getPaymentMethodLabel = (method) => {
            return PurchaseInvoiceService.getPaymentMethodLabel(method);
        };

        return {
            // Estado
            loading,
            form,

            // Computed
            paymentMethodOptions,
            maxAmount,
            remainingBalance,
            isFullPayment,

            // Métodos
            recordPayment,
            payFullAmount,
            closeModal,
            formatCurrency,
            getPaymentMethodLabel
        };
    }
};
</script>

<template>
    <Dialog 
        :visible="true" 
        @hide="closeModal" 
        header="Registrar Pagamento" 
        :modal="true" 
        :closable="true"
        :style="{ width: '600px' }"
        class="p-fluid"
    >
        <!-- Informações da Fatura -->
        <div class="mb-4 p-3 surface-50 border-round">
            <div class="flex justify-content-between align-items-center mb-2">
                <span class="font-bold">{{ invoice.invoice_number }}</span>
                <Tag :value="PurchaseInvoiceService.getPurchaseInvoiceStatusLabel(invoice.status)" 
                     :severity="PurchaseInvoiceService.getStatusSeverity(invoice.status)" />
            </div>
            
            <div class="grid">
                <div class="col-12 md:col-6">
                    <div class="flex justify-content-between mb-1">
                        <span class="text-600">Fornecedor:</span>
                        <span class="font-medium">{{ invoice.supplier?.name || '-' }}</span>
                    </div>
                    <div class="flex justify-content-between mb-1">
                        <span class="text-600">Total da Fatura:</span>
                        <span class="font-medium">{{ formatCurrency(invoice.total_amount) }}</span>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="flex justify-content-between mb-1">
                        <span class="text-600">Valor Pago:</span>
                        <span class="text-green-600">{{ formatCurrency(invoice.amount_paid) }}</span>
                    </div>
                    <div class="flex justify-content-between">
                        <span class="text-600 font-medium">Saldo Devedor:</span>
                        <span class="font-bold text-orange-600">{{ formatCurrency(invoice.balance_due) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Formulário de Pagamento -->
        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="amount" class="font-medium">Valor do Pagamento *</label>
                    <div class="p-inputgroup">
                        <InputNumber 
                            id="amount" 
                            v-model="form.amount" 
                            mode="currency" 
                            currency="MZN" 
                            locale="pt-MZ"
                            :min="0"
                            :max="maxAmount"
                            class="w-full" 
                        />
                        <Button 
                            label="Total" 
                            icon="pi pi-check-circle" 
                            @click="payFullAmount" 
                            class="p-button-outlined"
                            v-tooltip.top="'Pagar valor total'"
                        />
                    </div>
                    <small class="text-600">Máximo: {{ formatCurrency(maxAmount) }}</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="payment_date" class="font-medium">Data do Pagamento *</label>
                    <Calendar 
                        id="payment_date" 
                        v-model="form.payment_date" 
                        dateFormat="yy-mm-dd" 
                        :maxDate="new Date()"
                        class="w-full" 
                    />
                </div>
            </div>

            <div class="col-12">
                <div class="field">
                    <label for="payment_method" class="font-medium">Método de Pagamento *</label>
                    <Dropdown 
                        id="payment_method" 
                        v-model="form.payment_method" 
                        :options="paymentMethodOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        class="w-full" 
                    />
                </div>
            </div>

            <div class="col-12">
                <div class="field">
                    <label for="reference_number" class="font-medium">Número de Referência</label>
                    <InputText 
                        id="reference_number" 
                        v-model="form.reference_number" 
                        placeholder="Ex: TRF-123456, CHQ-789, etc." 
                        class="w-full" 
                    />
                    <small class="text-600">Número do comprovante, transferência, cheque, etc.</small>
                </div>
            </div>

            <div class="col-12">
                <div class="field">
                    <label for="notes" class="font-medium">Observações</label>
                    <Textarea 
                        id="notes" 
                        v-model="form.notes" 
                        rows="3" 
                        placeholder="Observações sobre este pagamento..." 
                        class="w-full" 
                    />
                </div>
            </div>
        </div>

        <!-- Resumo do Pagamento -->
        <div v-if="form.amount > 0" class="mt-3 p-3 border-1 surface-border border-round">
            <h6 class="text-600 mb-2">Resumo do Pagamento</h6>
            <div class="flex justify-content-between mb-2">
                <span>Valor a pagar:</span>
                <span class="font-bold text-green-600">{{ formatCurrency(form.amount) }}</span>
            </div>
            <div class="flex justify-content-between mb-2">
                <span>Saldo restante:</span>
                <span :class="remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'">
                    {{ formatCurrency(remainingBalance) }}
                </span>
            </div>
            <div class="flex justify-content-between">
                <span>Status após pagamento:</span>
                <Tag :value="isFullPayment ? 'Paga' : 'Parcialmente Paga'" 
                     :severity="isFullPayment ? 'success' : 'info'" />
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
                    :label="isFullPayment ? 'Quitar Fatura' : 'Registrar Pagamento'" 
                    icon="pi pi-credit-card" 
                    @click="recordPayment" 
                    :loading="loading" 
                    :disabled="!form.amount || form.amount <= 0"
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

.text-green-600 {
    color: #16a34a;
}

.text-orange-600 {
    color: #ea580c;
}
</style>