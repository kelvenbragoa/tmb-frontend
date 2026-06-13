<template>
    <Dialog 
        :visible="visible" 
        @update:visible="$emit('update:visible', $event)"
        modal 
        header="Converter Cotação em Fatura"
        :style="{ width: '50vw' }"
        :closable="true"
        :draggable="false"
        class="convert-modal"
    >
        <div v-if="quotation">
            <div class="grid">
                <div class="col-12">
                    <Message severity="info" :closable="false">
                        <template #default>
                            <div class="flex align-items-center">
                                <i class="pi pi-info-circle mr-2"></i>
                                <span>Esta ação irá converter a cotação <strong>{{ quotation.quotation_number }}</strong> em uma nova fatura.</span>
                            </div>
                        </template>
                    </Message>
                </div>

                <!-- Informações da Cotação -->
                <div class="col-12 md:col-6">
                    <div class="card">
                        <h5>Dados da Cotação</h5>
                        <div class="field-group">
                            <label class="font-semibold">Número:</label>
                            <span class="ml-2">{{ quotation.quotation_number }}</span>
                        </div>
                        <div class="field-group">
                            <label class="font-semibold">Cliente:</label>
                            <span class="ml-2">{{ quotation.costumer.name }}</span>
                        </div>
                        <div class="field-group">
                            <label class="font-semibold">Data:</label>
                            <span class="ml-2">{{ formatDate(quotation.quotation_date) }}</span>
                        </div>
                        <div class="field-group">
                            <label class="font-semibold">Total:</label>
                            <span class="ml-2 font-bold text-lg">{{ formatCurrency(quotation.total) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Configurações da Fatura -->
                <div class="col-12 md:col-6">
                    <div class="card">
                        <h5>Configurações da Fatura</h5>
                        
                        <div class="field">
                            <label for="invoice_date">Data da Fatura</label>
                            <Calendar 
                                v-model="invoiceData.invoice_date" 
                                id="invoice_date"
                                dateFormat="dd/mm/yy"
                                :showIcon="true"
                                class="w-full"
                            />
                        </div>

                        <div class="field">
                            <label for="due_date">Data de Vencimento</label>
                            <Calendar 
                                v-model="invoiceData.due_date" 
                                id="due_date"
                                dateFormat="dd/mm/yy"
                                :showIcon="true"
                                class="w-full"
                            />
                        </div>

                        <div class="field">
                            <label for="payment_terms">Condições de Pagamento</label>
                            <Dropdown 
                                v-model="invoiceData.payment_terms" 
                                id="payment_terms"
                                :options="paymentTermsOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione as condições"
                                class="w-full"
                            />
                        </div>

                        <div class="field-checkbox">
                            <Checkbox 
                                v-model="invoiceData.keep_quotation_notes" 
                                id="keep_notes" 
                                :binary="true"
                            />
                            <label for="keep_notes">Manter observações da cotação</label>
                        </div>
                    </div>
                </div>

                <!-- Items da Cotação -->
                <div class="col-12">
                    <div class="card">
                        <h5>Items da Cotação ({{ quotation.items?.length || 0 }} items)</h5>
                        <DataTable 
                            :value="quotation.items" 
                            class="p-datatable-sm"
                            responsiveLayout="scroll"
                        >
                            <Column field="description" header="Descrição">
                                <template #body="{ data }">
                                    {{ data.description }}
                                </template>
                            </Column>
                            <Column field="quantity" header="Qtd" style="width: 100px">
                                <template #body="{ data }">
                                    {{ data.quantity }}
                                </template>
                            </Column>
                            <Column field="unit_price" header="Preço Unit." style="width: 120px">
                                <template #body="{ data }">
                                    {{ formatCurrency(data.unit_price) }}
                                </template>
                            </Column>
                            <Column field="line_total" header="Total" style="width: 120px">
                                <template #body="{ data }">
                                    {{ formatCurrency(data.line_total) }}
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>

                <!-- Notas Adicionais -->
                <div class="col-12" v-if="invoiceData.keep_quotation_notes && quotation.notes">
                    <div class="field">
                        <label for="notes">Observações (da cotação)</label>
                        <Textarea 
                            v-model="displayNotes" 
                            id="notes"
                            rows="3" 
                            class="w-full"
                            readonly
                        />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-between w-full">
                <Button 
                    label="Cancelar" 
                    icon="pi pi-times" 
                    class="p-button-text"
                    @click="$emit('update:visible', false)"
                />
                <Button 
                    label="Converter em Fatura" 
                    icon="pi pi-file-o" 
                    class="p-button-success"
                    :loading="loading"
                    @click="convertToInvoice"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import moment from 'moment';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    quotation: {
        type: Object,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'convert']);

// Dados da fatura a ser criada
const invoiceData = ref({
    invoice_date: new Date(),
    due_date: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 dias a partir de hoje
    payment_terms: 'NET_30',
    keep_quotation_notes: true
});

// Opções de condições de pagamento
const paymentTermsOptions = [
    { label: 'À vista', value: 'CASH' },
    { label: '15 dias', value: 'NET_15' },
    { label: '30 dias', value: 'NET_30' },
    { label: '45 dias', value: 'NET_45' },
    { label: '60 dias', value: 'NET_60' },
    { label: '90 dias', value: 'NET_90' }
];

// Computed para mostrar as notas
const displayNotes = computed(() => {
    return invoiceData.value.keep_quotation_notes ? props.quotation?.notes || '' : '';
});

// Watcher para resetar dados quando o modal abrir
watch(() => props.visible, (newVal) => {
    if (newVal && props.quotation) {
        // Reset para valores padrão
        invoiceData.value = {
            invoice_date: new Date(),
            due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
            payment_terms: 'NET_30',
            keep_quotation_notes: true
        };
    }
});

// Métodos de formatação
const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
};

const formatCurrency = (value) => {
    if (!value) return 'MZN 0,00';
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2
    }).format(value);
};

// Método para converter
const convertToInvoice = () => {
    const convertData = {
        ...invoiceData.value,
        notes: invoiceData.value.keep_quotation_notes ? props.quotation?.notes : ''
    };
    
    emit('convert', convertData);
};
</script>

<style scoped>
.convert-modal .field-group {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.convert-modal .field {
    margin-bottom: 1rem;
}

.convert-modal .card {
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    padding: 1rem;
    background: var(--surface-card);
}

.convert-modal h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-color);
}
</style>