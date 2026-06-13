<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import QuotationService from '@/service/QuotationService';
import CustomerService from '@/service/CustomerService';
import ProductService from '@/service/ProductService';

const router = useRouter();
const toast = useToast();

// Estado do formulário
const formData = ref({
    quotation_number: '',
    quotation_date: new Date(),
    expiry_date: new Date(new Date().setDate(new Date().getDate() + 15)),
    status: 'DRAFT',
    costumer_id: null,
    notes: '',
    items: [
        {
            product_id: null,
            product_name: '',
            description: '',
            quantity: 1,
            unit_price: 0,
            discount: 0,
            tax_rate: 17,
            total: 0
        }
    ]
});

// Estado de carregamento
const isSaving = ref(false);
const loadingCustomers = ref(false);
const loadingProducts = ref(false);

// Dados auxiliares
const customers = ref([]);
const selectedCustomer = ref(null);
const products = ref([]);
const errors = ref({});

// Opções de status
const statusOptions = [
    { label: 'Rascunho', value: 'draft' },
    { label: 'Enviado', value: 'sent' },
    { label: 'Aceito', value: 'accepted' },
    { label: 'Rejeitado', value: 'rejected' }
];

// Taxas de IVA disponíveis
const taxRates = [
    { label: '0%', value: 0 },
    { label: '17%', value: 17 }
];

// Data mínima para validade
const minExpiryDate = computed(() => {
    return formData.value.quotation_date || new Date();
});

// Totais calculados
const totals = computed(() => {
    const items = formData.value.items || [];

    const subtotal = items.reduce((sum, item) => {
        const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
        return sum + itemSubtotal;
    }, 0);

    const discountAmount = items.reduce((sum, item) => {
        const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
        const itemDiscount = itemSubtotal * ((item.discount || 0) / 100);
        return sum + itemDiscount;
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
        const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
        const itemDiscount = itemSubtotal * ((item.discount || 0) / 100);
        const itemTaxable = itemSubtotal - itemDiscount;
        const itemTax = itemTaxable * ((item.tax_rate || 0) / 100);
        return sum + itemTax;
    }, 0);

    const totalAmount = subtotal - discountAmount + taxAmount;

    return {
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount
    };
});

// Métodos
const loadCustomers = async () => {
    try {
        loadingCustomers.value = true;
        const response = await CustomerService.getActiveCustomers();

        // Mapear os dados da API para o formato esperado pelo componente
        customers.value = response.items.map((customer) => ({
            id: customer.id,
            name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente sem nome',
            email: customer.email || '',
            phone: customer.phone || customer.mobile || '',
            address: customer.address || `${customer.street || ''}, ${customer.city || ''}, ${customer.province || ''}`.trim() || 'Endereço não informado'
        }));
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar lista de clientes',
            life: 3000
        });
    } finally {
        loadingCustomers.value = false;
    }
};

const loadProducts = async () => {
    try {
        loadingProducts.value = true;
        const response = await ProductService.getActiveProducts();

        // Mapear os dados da API para o formato esperado pelo componente

        products.value = response.items.map((product) => ({
            id: product.id,
            name: product.name || product.product_name || 'Produto sem nome',
            description: product.description || '',
            price: parseFloat(product.price || product.unit_price || 0),
            category: product.category || '',
            sku: product.sku || product.code || ''
        }));
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        // Em caso de erro da API, usar produtos de exemplo
        products.value = [
            {
                id: 1,
                name: 'Serviço de Consultoria',
                description: 'Hora de consultoria técnica',
                price: 1500.0,
                category: 'Serviços',
                sku: 'SERV-CONS'
            }
        ];

        toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Não foi possível carregar produtos da API. Usando dados de exemplo.',
            life: 5000
        });
    } finally {
        loadingProducts.value = false;
    }
};

const generateQuotationNumber = async () => {
    try {
        // Mock - gerar número baseado no ano atual e próximo ID
        const year = new Date().getFullYear();
        const nextNumber = Math.floor(Math.random() * 9999) + 1;
        formData.value.quotation_number = `COT${year}/${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Erro ao gerar número da cotação:', error);
    }
};

const onCustomerChange = () => {
    selectedCustomer.value = customers.value.find((c) => c.id === formData.value.costumer_id) || null;
};

const addItem = () => {
    formData.value.items.push({
        product_id: null,
        product_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount: 0,
        tax_rate: 17,
        total: 0
    });
};

const onProductSelect = (productId, index) => {
    const selectedProduct = products.value.find((p) => p.id === productId);
    if (selectedProduct) {
        const item = formData.value.items[index];
        item.product_id = selectedProduct.id;
        item.product_name = selectedProduct.name;
        item.description = selectedProduct.description || selectedProduct.name;
        item.unit_price = selectedProduct.price;

        // Recalcular total do item
        calculateItemTotal(index);
    }
};

const removeItem = (index) => {
    if (formData.value.items.length > 1) {
        formData.value.items.splice(index, 1);
    }
};

const calculateItemTotal = (index) => {
    const item = formData.value.items[index];
    const subtotal = (item.quantity || 0) * (item.unit_price || 0);
    const discountAmount = subtotal * ((item.discount || 0) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((item.tax_rate || 0) / 100);

    item.total = subtotal - discountAmount + taxAmount;
};

const validateForm = () => {
    const newErrors = {};

    if (!formData.value.quotation_number) {
        newErrors.quotation_number = 'Número da cotação é obrigatório';
    }

    if (!formData.value.quotation_date) {
        newErrors.quotation_date = 'Data da cotação é obrigatória';
    }

    if (!formData.value.expiry_date) {
        newErrors.expiry_date = 'Data de validade é obrigatória';
    }

    if (!formData.value.costumer_id) {
        newErrors.costumer_id = 'Cliente é obrigatório';
    }

    // Validar itens
    const hasValidItems = formData.value.items.some((item) => item.description && item.quantity > 0 && item.unit_price > 0);

    if (!hasValidItems) {
        newErrors.items = 'Adicione pelo menos um item válido';
    }

    formData.value.items.forEach((item, index) => {
        if (item.description && (!item.quantity || item.quantity <= 0)) {
            newErrors[`items.${index}.quantity`] = 'Quantidade deve ser maior que 0';
        }
        if (item.description && (!item.unit_price || item.unit_price <= 0)) {
            newErrors[`items.${index}.unit_price`] = 'Preço deve ser maior que 0';
        }
    });

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

const saveQuotation = async (status = 'draft') => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Por favor, corrija os erros no formulário',
            life: 3000
        });
        return;
    }

    try {
        isSaving.value = true;

        const quotationData = {
            ...formData.value,
            status,
            quotation_date: formatDateForAPI(formData.value.quotation_date),
            expiry_date: formatDateForAPI(formData.value.expiry_date),
            ...totals.value
        };

        await QuotationService.createQuotation(quotationData);

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cotação criada com sucesso',
            life: 3000
        });

        router.push('/sales/quotations');
    } catch (error) {
        console.error('Erro ao salvar cotação:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar cotação',
            life: 3000
        });
    } finally {
        isSaving.value = false;
    }
};

const saveAsDraft = () => saveQuotation('draft');
const saveAndSend = () => saveQuotation('sent');

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN'
    }).format(value || 0);
};

const formatDateForAPI = (date) => {
    if (!date) return null;

    // Converter para objeto Date se for string
    const dateObj = new Date(date);

    // Formatar para YYYY-MM-DD (formato MySQL DATE)
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// Watch para recalcular totais quando itens mudarem
watch(
    () => formData.value.items,
    () => {
        formData.value.items.forEach((item, index) => {
            calculateItemTotal(index);
        });
    },
    { deep: true }
);

// Inicialização
onMounted(async () => {
    await loadCustomers();
    await loadProducts();
    await generateQuotationNumber();
});
</script>

<template>
    <div class="card">
        <div class="flex justify-content-between align-items-center mb-3">
            <h3><i class="pi pi-plus-circle mr-2"></i>Nova Cotação</h3>
            <Button label="Voltar" icon="pi pi-arrow-left" outlined @click="$router.push('/quotations')" />
        </div>

        <form @submit.prevent="saveQuotation">
            <!-- Informações Gerais -->
            <div class="grid">
                <div class="col-12 md:col-6">
                    <div class="p-fluid">
                        <label for="quotation_number">Número da Cotação *</label>
                        <InputText id="quotation_number" v-model="formData.quotation_number" :class="{ 'p-invalid': errors.quotation_number }" placeholder="Ex: ORC2024/0001" />
                        <small v-if="errors.quotation_number" class="p-error">{{ errors.quotation_number }}</small>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="p-fluid">
                        <label for="quotation_date">Data da Cotação *</label>
                        <Calendar id="quotation_date" v-model="formData.quotation_date" :class="{ 'p-invalid': errors.quotation_date }" dateFormat="dd/mm/yy" :showIcon="true" />
                        <small v-if="errors.quotation_date" class="p-error">{{ errors.quotation_date }}</small>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="p-fluid">
                        <label for="expiry_date">Data de Validade *</label>
                        <Calendar id="expiry_date" v-model="formData.expiry_date" :class="{ 'p-invalid': errors.expiry_date }" dateFormat="dd/mm/yy" :showIcon="true" :minDate="minExpiryDate" />
                        <small v-if="errors.expiry_date" class="p-error">{{ errors.expiry_date }}</small>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="p-fluid">
                        <label for="status">Status</label>
                        <Dropdown id="status" v-model="formData.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Selecione o status" />
                    </div>
                </div>
            </div>

            <!-- Informações do Cliente -->
            <div class="mt-4">
                <h4><i class="pi pi-user mr-2"></i>Cliente</h4>
                <div class="grid">
                    <div class="col-12">
                        <div class="p-fluid">
                            <label for="costumer">Cliente *</label>
                            <Dropdown
                                id="costumer"
                                v-model="formData.costumer_id"
                                :options="customers"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Selecione um cliente"
                                :class="{ 'p-invalid': errors.costumer_id }"
                                filter
                                filterBy="name"
                                :loading="loadingCustomers"
                                @change="onCustomerChange"
                            />
                            <small v-if="errors.costumer_id" class="p-error">{{ errors.costumer_id }}</small>
                        </div>
                    </div>

                    <!-- Informações do cliente selecionado -->
                    <div v-if="selectedCustomer" class="col-12">
                        <div class="surface-50 p-3 border-round">
                            <div class="grid">
                                <div class="col-12 md:col-4"><strong>Nome:</strong> {{ selectedCustomer.name }}</div>
                                <div class="col-12 md:col-4"><strong>Email:</strong> {{ selectedCustomer.email }}</div>
                                <div class="col-12 md:col-4"><strong>Telefone:</strong> {{ selectedCustomer.phone }}</div>
                                <div class="col-12"><strong>Endereço:</strong> {{ selectedCustomer.phone }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Itens da Cotação -->
            <div class="mt-4">
                <div class="flex justify-content-between align-items-center mb-3">
                    <h4><i class="pi pi-list mr-2"></i>Itens da Cotação</h4>
                    <Button label="Adicionar Item" icon="pi pi-plus" @click="addItem" outlined />
                </div>

                <DataTable :value="formData.items" responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="product" header="Produto" style="min-width: 200px">
                        <template #body="{ data, index }">
                            <Dropdown
                                v-model="data.product_id"
                                :options="products"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Selecione um produto"
                                :loading="loadingProducts"
                                filter
                                filterBy="name"
                                @change="onProductSelect(data.product_id, index)"
                                class="w-full"
                            >
                                <template #option="slotProps">
                                    <div>
                                        <div class="font-bold">{{ slotProps.option.name }}</div>
                                        <div class="text-sm text-500">{{ formatCurrency(slotProps.option.price) }}</div>
                                    </div>
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <Column field="description" header="Descrição" style="min-width: 150px">
                        <template #body="{ data, index }">
                            <InputText v-model="data.description" placeholder="Descrição do item" :class="{ 'p-invalid': errors[`items.${index}.description`] }" @input="calculateItemTotal(index)" />
                        </template>
                    </Column>

                    <Column field="quantity" header="Qtd" style="width: 100px">
                        <template #body="{ data, index }">
                            <InputNumber v-model="data.quantity" :min="0" :maxFractionDigits="2" :class="{ 'p-invalid': errors[`items.${index}.quantity`] }" @input="calculateItemTotal(index)" />
                        </template>
                    </Column>

                    <Column field="unit_price" header="Preço Unit." style="width: 120px">
                        <template #body="{ data, index }">
                            <InputNumber v-model="data.unit_price" mode="currency" currency="MZN" locale="pt-MZ" :min="0" :maxFractionDigits="2" :class="{ 'p-invalid': errors[`items.${index}.unit_price`] }" @input="calculateItemTotal(index)" />
                        </template>
                    </Column>

                    <Column field="discount" header="Desconto %" style="width: 100px">
                        <template #body="{ data, index }">
                            <InputNumber v-model="data.discount" suffix="%" :min="0" :max="100" :maxFractionDigits="2" @input="calculateItemTotal(index)" />
                        </template>
                    </Column>

                    <Column field="tax_rate" header="IVA %" style="width: 100px">
                        <template #body="{ data, index }">
                            <Dropdown v-model="data.tax_rate" :options="taxRates" optionLabel="label" optionValue="value" placeholder="IVA" @change="calculateItemTotal(index)" />
                        </template>
                    </Column>

                    <Column field="total" header="Total" style="width: 120px">
                        <template #body="{ data }">
                            <span class="font-bold">
                                {{ formatCurrency(data.total || 0) }}
                            </span>
                        </template>
                    </Column>

                    <Column header="Ações" style="width: 80px">
                        <template #body="{ index }">
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" @click="removeItem(index)" :disabled="formData.items.length === 1" />
                        </template>
                    </Column>
                </DataTable>

                <div v-if="errors.items" class="p-error mt-2">
                    {{ errors.items }}
                </div>
            </div>

            <!-- Resumo Financeiro -->
            <div class="mt-4">
                <div class="grid">
                    <div class="col-12 md:col-8">
                        <div class="p-fluid">
                            <label for="notes">Observações</label>
                            <Textarea id="notes" v-model="formData.notes" rows="4" placeholder="Observações adicionais sobre a cotação" />
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="surface-100 p-3 border-round">
                            <h5 class="mt-0 mb-3">Resumo Financeiro</h5>

                            <div class="flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>{{ formatCurrency(totals.subtotal) }}</span>
                            </div>

                            <div class="flex justify-content-between mb-2">
                                <span>Desconto:</span>
                                <span class="text-red-500">-{{ formatCurrency(totals.discount_amount) }}</span>
                            </div>

                            <div class="flex justify-content-between mb-2">
                                <span>IVA:</span>
                                <span>{{ formatCurrency(totals.tax_amount) }}</span>
                            </div>

                            <Divider />

                            <div class="flex justify-content-between">
                                <span class="font-bold text-lg">Total:</span>
                                <span class="font-bold text-lg text-primary">
                                    {{ formatCurrency(totals.total_amount) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Botões de Ação -->
            <div class="flex justify-content-end gap-3 mt-4">
                <Button label="Cancelar" icon="pi pi-times" outlined @click="$router.push('/quotations')" />
                <Button label="Salvar como Rascunho" icon="pi pi-save" outlined @click="saveAsDraft" :loading="isSaving" />
                <Button label="Salvar e Enviar" icon="pi pi-check" @click="saveAndSend" :loading="isSaving" />
            </div>
        </form>
    </div>
</template>

<style scoped>
.p-datatable .p-datatable-tbody > tr > td {
    padding: 0.5rem;
}

.p-inputtext,
.p-dropdown,
.p-calendar {
    width: 100%;
}

.surface-100 {
    background-color: var(--surface-100);
}

.surface-50 {
    background-color: var(--surface-50);
}
</style>
