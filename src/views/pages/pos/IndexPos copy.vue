<script setup>
import ProductService  from '@/service/ProductService';
import { onBeforeMount, reactive, ref, onMounted, watch, computed } from 'vue';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

// import { debounce } from 'lodash';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import { baseURL, storageURL } from '@/service/APIConstant';

import moment from 'moment';
import axios from 'axios';
const openListQuickSellDialog = ref(false);

const showReceiptDialog = ref(false);
const receiptCart = ref([]);
function printReceipt() {
    const printContents = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=400');
    printWindow.document.write('<html><head><title>Recibo</title></head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

const schema = yup.object({
    category_id: yup.string().required().trim().label('Name')
});
const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const router = useRouter();
const toast = useToast();
const loading1 = ref(null);
const isLoadingDiv = ref(true);
const categories = ref([]);
const products = ref([]);
const cart = ref([]);
const sellsretail = ref([]);
const rowsPerPageSellsRetail = ref(10);
const totalRecordsSellsRetail = ref(0);
const currentPageSellsRetail = ref(1);

const searchQuery = ref('');
const expandedRows = ref([]);

const selectedCategory = ref(null);

const searchCostumerQuery = ref('');
const searchCostumerCategoryQuery = ref('');

const totalCostumerRecords = ref(0);
const totalCostumerCategoryRecords = ref(0);
const rowsPerPage = ref(10);
const showCheckoutDialog = ref(false);
// const [category_id] = defineField('category_id');
const costumerName = ref('');
const amountPaid = ref(0);
const discount = ref(0);
const paymentMethod = ref('Cash');
const pointOfSaleId = ref(1);

const nestedMenuitems = [
    {
        label: 'Venda Rápida',
        items: [
            // {
            //     label: 'Inicar Venda Rápida',
            //     icon: 'pi pi-fw pi-shopping-cart',
            //     command: () => {
            //         router.push('/admin/pdv/quicksell');
            //     } // Abre o dialog ao clicar
            // },
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                command: () => {
                    openListQuickSellDialog.value = true;
                } // Abre o dialog ao clicar
            }
        ]
    },
    {
        label: 'Caixa',
        items: [
            {
                label: 'Abertura de caixa',
                icon: 'pi pi-fw pi-unlock',
                command: () => {
                    // openCashRegisterDialog.value = true;
                } // Abre o dialog ao clicar
            },
            {
                label: 'Fecho de caixa',
                icon: 'pi pi-fw pi-lock',
                command: () => {
                    // closeCashRegisterDialog.value = true;
                } // Abre o dialog ao clicar
            },
            {
                label: 'Relatório de caixa',
                icon: 'pi pi-fw pi-check',
                command: () => {
                    // router.push('/admin/cashregisters/dashboard');
                } // Abre o dialog ao clicar
            }
        ]
    }
];

const closeListQuickSellDialog = () => {
    openListQuickSellDialog.value = false;
};
const onPageChange = (event) => {
    currentPageSellsRetail.value = event.page + 1;
    rowsPerPage.value = event.rows;
    getData(currentPageSellsRetail.value);
};

// Obter categorias
const getCategoriesData = async () => {
    try {
        const response = await axios.get(`${baseURL}/categories`, {
            params: { query: searchCostumerCategoryQuery.value }
        });
        categories.value = response.data.items;
        totalCostumerCategoryRecords.value = response.data.meta.totalItems;
        rowsPerPage.value = response.data.meta.itemsPerPage;
        isLoadingDiv.value = false;
    } catch (error) {
        isLoadingDiv.value = false;
        toast.add({ severity: 'error', summary: error.message, detail: 'Erro ao carregar categorias', life: 3000 });
    }
};

const getProductsData = async () => {
    try {
        const response = await axios.get(`${baseURL}/stockcenterproducts/stockcenter/1`, {
            params: { query: searchCostumerQuery.value }
        });
        products.value = response.data;
        // totalCostumerRecords.value = response.data.meta.totalItems;
        // rowsPerPage.value = response.data.meta.itemsPerPage;
    } catch (error) {
        toast.add({ severity: 'error', summary: error.message, detail: 'Erro ao carregar produtos', life: 3000 });
    }
};

const getSellsRetails = async (page = 1) => {
    axios
        .get(`${baseURL}/sales?page=${page}`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            sellsretail.value = response.data.items;
            totalRecordsSellsRetail.value = response.data.meta.totalItems;
            rowsPerPageSellsRetail.value = response.data.meta.itemsPerPage;
        })
        .catch((error) => {
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
        });
};
// Filtrar produtos pela categoria
// const filteredProducts = computed(() => (selectedCategory.value ? products.value.filter((p) => p.category_id === selectedCategory.value) : products.value));
// const filteredProducts = computed(() => (selectedCategory.value ? products.value.filter((p) => p.category_name === selectedCategory.value) : products.value));

const filteredProducts = computed(() => (selectedCategory.value ? products.value.filter((p) => p.product.category_id === selectedCategory.value) : products.value));
// const filteredProducts = computed(() => (selectedCategory.value ? products.value.filter((p) => p.category_name === selectedCategory.value) : products.value));

// Ações
function selectCategory(categoryId, categoryName) {
    // selectedCategory.value = categoryName;
    selectedCategory.value = categoryId;
}

function addToCart(product) {
    const existing = cart.value.find((item) => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.value.push({ ...product, quantity: 1 });
    }
    toast.add({ severity: 'info', summary: 'Produto adicionado', detail: product.product.name, life: 2000 });
}

function removeFromCart(productId) {
    cart.value = cart.value.filter((item) => item.id !== productId);
}

const totalAmount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity * item.product.price, 0));

function checkout() {
    showCheckoutDialog.value = true;
    // toast.add({ severity: 'success', summary: 'Venda finalizada', detail: `Total: ${totalAmount.value.toFixed(2)} MZN`, life: 3000 });
    // cart.value = [];
}

async function confirmCheckout() {
    const totalComDesconto = totalAmount.value - discount.value;

    if (amountPaid.value < totalComDesconto) {
        toast.add({
            severity: 'warn',
            summary: 'Pagamento insuficiente',
            detail: `O valor pago (${amountPaid.value.toFixed(2)} MZN) é inferior ao total (${totalComDesconto.toFixed(2)} MZN)`,
            life: 4000
        });
        return;
    }

    const payload = {
        status: 'progress',
        costumer_name: costumerName.value,
        discount: discount.value,
        amount_paid: amountPaid.value,
        change: change.value,
        payment_method: paymentMethod.value,
        point_of_sale_id: pointOfSaleId.value,
        items: cart.value.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            price: Number(item.product.price),
            quantity: item.quantity,
            product_stock_id: item.id
        }))
    };

    try {
        await axios.post(`${baseURL}/sales`, payload);
        toast.add({
            severity: 'success',
            summary: 'Venda registrada com sucesso',
            detail: `Total: ${totalAmount.value.toFixed(2)} MZN`,
            life: 3000
        });
        showReceiptDialog.value = true;

        // Opcional: guardar uma cópia do carrinho para mostrar no recibo
        receiptCart.value = [...cart.value];
        cart.value = [];
        costumerName.value = '';
        amountPaid.value = 0;
        discount.value = 0;
        paymentMethod.value = 'Cash';
        getSellsRetails();
        getProductsData();
        showCheckoutDialog.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro ao registrar venda',
            detail: error.message,
            life: 3000
        });
    }
}

function formatCurrency(value) {
    return value.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });
}

const change = computed(() => {
    const total = totalAmount.value - discount.value;
    return amountPaid.value > total ? amountPaid.value - total : 0;
});
// Carregar ao montar
onMounted(() => {
    getSellsRetails();
    getCategoriesData();
    getProductsData();
});
</script>

<template>
    <div class="grid" v-if="isLoadingDiv">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
    </div>
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <div class="grid">
                    <!-- Coluna esquerda: Categorias e Produtos -->
                    <div class="col-9">
                        <div class="grid">
                            <!-- Categorias -->
                            <div class="col-12 mb-3">
                                <div class="flex flex-wrap gap-2">
                                    <Button v-for="category in categories" :key="category.id" :label="category.name" class="p-button-outlined" @click="selectCategory(category.id, category.name)" />
                                </div>
                            </div>

                            <!-- Produtos -->
                            <div class="col-12">
                                <div class="grid">
                                    <div class="col-12 md:col-4 lg:col-3" v-for="product in filteredProducts" :key="product.id">
                                        <!-- <Card class="h-full cursor-pointer" @click="addToCart(product)">
                                            <template #header>
                                                <img :src="product.image_url ? storageURL + '/' + product.image_url : '/noimage.jpg'" alt="Imagem do produto" class="w-full h-40 object-cover" />
                                            </template>

                                            <template #title>
                                                <div class="text-lg font-bold">{{ product.name }}</div>
                                            </template>

                                            <template #content>
                                                <div class="text-sm mb-2">{{ product.description }}</div>
                                                <div class="text-xl font-semibold text-primary">{{ Number(product.price).toFixed(2) }} MZN</div>
                                            </template>
                                        </Card> -->
                                        <Card class="h-full cursor-pointer" @click="addToCart(product)">
                                            <template #header>
                                                <img :src="product.product.image_url ? storageURL + '/' + product.product.image_url : '/noimage.jpg'" alt="Imagem do produto" class="w-full h-40 object-cover" />
                                            </template>

                                            <template #title>
                                                <div class="text-lg font-bold">{{ product.product.name }}</div>
                                            </template>

                                            <template #content>
                                                <div class="text-sm mb-2">QTY: {{ product.quantity }}</div>
                                                <div class="text-sm mb-2">{{ product.unique_code ?? 'N/A' }}</div>
                                                <div class="text-xl font-semibold text-primary">{{ Number(product.product.price).toFixed(2) }} MZN</div>
                                            </template>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Coluna direita: Resumo da venda -->
                    <div class="col-3">
                        <div class="grid">
                            <div class="col-12 mb-3">
                                <div class="flex flex-wrap gap-2">
                                    <Menubar :model="nestedMenuitems"></Menubar>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <h3>Resumo da Venda</h3>
                            <div v-if="cart.length === 0" class="text-center mt-4">Nenhum item no carrinho</div>
                            <div v-else>
                                <div v-for="item in cart" :key="item.id" class="flex justify-between mb-2">
                                    <Button icon="pi pi-trash" class="p-button-sm p-button-text text-red-500 text-right" @click="removeFromCart(item.id)" />
                                    <div>
                                        <strong>{{ item.product.name }}</strong
                                        ><br />
                                        <small>{{ item.quantity }} x {{ Number(item.product.price).toFixed(2) }}</small>
                                    </div>
                                    <div class="ml-3">{{ (item.quantity * Number(item.product.price)).toFixed(2) }} MZN</div>
                                </div>

                                <hr />

                                <div class="flex justify-between font-bold text-lg mt-2">
                                    <span>Total:</span>
                                    <span>{{ totalAmount.toFixed(2) }} MZN</span>
                                </div>

                                <Button label="Finalizar Venda" class="mt-4 w-full" icon="pi pi-check" @click="checkout" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog header="Resumo da Venda" v-model:visible="showCheckoutDialog" :modal="true" :style="{ width: '500px' }">
        <div class="field mb-3">
            <label>Nome do Cliente</label>
            <InputText v-model="costumerName" class="w-full" placeholder="Ex: João Carlos" />
        </div>

        <div class="field mb-3">
            <label>Método de Pagamento</label>
            <Dropdown v-model="paymentMethod" :options="['Cash', 'Card', 'Mpesa']" placeholder="Selecionar" class="w-full" />
        </div>

        <div class="field mb-3">
            <label>Valor Pago</label>
            <InputNumber v-model="amountPaid" class="w-full" mode="currency" currency="MZN" locale="pt-MZ" />
        </div>

        <div class="field mb-3">
            <label>Desconto (MZN)</label>
            <InputNumber v-model="discount" class="w-full" mode="currency" currency="MZN" locale="pt-MZ" />
        </div>

        <div class="mb-3">
            <h4>Itens</h4>
            <div v-for="item in cart" :key="item.id" class="mb-2 flex justify-between border-bottom pb-2">
                <div>
                    <strong>{{ item.product.name }}</strong
                    ><br />
                    <small>{{ item.quantity }} x {{ Number(item.product.price).toFixed(2) }} MZN</small>
                </div>
                <div>{{ (item.quantity * Number(item.product.price)).toFixed(2) }} MZN</div>
            </div>
            <div class="flex justify-between font-bold text-lg mt-2">
                <span>Total:</span>
                <span>{{ (totalAmount - discount).toFixed(2) }} MZN</span>
            </div>

            <div class="flex justify-between text-lg mt-2">
                <span>Troco:</span>
                <span>{{ change.toFixed(2) }} MZN</span>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="showCheckoutDialog = false" class="p-button-text" />
            <Button label="Confirmar Venda" icon="pi pi-check" @click="confirmCheckout" autofocus />
        </template>
    </Dialog>

    <Dialog v-model:visible="showReceiptDialog" header="Recibo de Venda" :modal="true" :style="{ width: '420px' }">
        <div id="receipt-content" class="receipt">
            <div class="center">
                <div class="title uppercase">Recibo de Venda</div>
                <div class="brand">OptiServ</div>
                <div class="muted">Tel: 843820084</div>
                <div class="muted">NUIT: 12345678</div>
            </div>

            <hr class="divider" />

            <div class="section-title">Cliente</div>
            <p><strong>Nome:</strong> {{ costumerName.value }}</p>
            <p><strong>Método:</strong> {{ paymentMethod.value }}</p>

            <hr class="divider" />

            <div class="section-title">Itens</div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="qty">Qtd</th>
                        <th class="price">Preço</th>
                        <th class="total">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in cart" :key="item.id">
                        <td>{{ item.product.name }}</td>
                        <td class="qty">{{ item.quantity }}</td>
                        <td class="price">{{ item.product.price }}</td>
                        <td class="total">{{ item.product.price * item.quantity }}</td>
                    </tr>
                </tbody>
            </table>

            <hr class="divider" />

            <div class="totals">
                <div class="row">
                    <span>Total:</span><span>{{ totalAmount.value }}</span>
                </div>
                <div class="row">
                    <span>Desconto:</span><span>{{ discount.value }}</span>
                </div>
                <div class="row">
                    <span>Pago:</span><span>{{ amountPaid.value }}</span>
                </div>
                <div class="row">
                    <span>Troco:</span><span>{{ change.value }}</span>
                </div>
            </div>

            <hr class="divider" />

            <div class="footer">
                <div>Obrigado pela preferência!</div>
                <div>Volte sempre!</div>
            </div>
        </div>

        <div class="center p-mt-3">
            <Button label="Imprimir" icon="pi pi-print" @click="printReceipt" />
        </div>
    </Dialog>
    <Dialog header="Lista de Vendas Rápidas" v-model:visible="openListQuickSellDialog" :style="{ width: '90vw', maxWidth: '940px' }" :modal="true">
        <div class="p-fluid">
            <DataTable
                v-model:expandedRows="expandedRows"
                :paginator="true"
                :rows="rowsPerPageSellsRetail"
                :totalRecords="totalRecordsSellsRetail"
                dataKey="id"
                :lazy="true"
                :rowHover="true"
                :first="(currentPageSellsRetail - 1) * rowsPerPage"
                :onPage="onPageChange"
                showGridlines
                :value="sellsretail"
                tableStyle="min-width: 60rem"
            >
                <Column expander style="width: 5rem" />
                <Column header="Ações" style="min-width: 12rem">
                    <template #body="{ data }">
                        <i class="pi pi-trash m-4" @click="confirmDelete(data.id)"></i>
                        <i class="pi pi-print m-4" @click="printReceipt(data.id)"></i>
                    </template>
                </Column>
                <Column header="ID" style="min-width: 12rem">
                    <template #body="{ data }"> #{{ data.id }} </template>
                </Column>
                <Column header="Valor" style="min-width: 12rem">
                    <template #body="{ data }"> {{ data.total }} MT </template>
                </Column>
                <Column header="Garçom" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.createdBy.name }}
                    </template>
                </Column>
                <Column header="Estado" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.status.toUpperCase() }}
                    </template>
                </Column>
                <Column header="Itens" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.items.length }}
                    </template>
                </Column>

                <Column header="Data" dataType="date" style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ moment(data.createdAt).format('DD-MM-YYYY H:mm') }}
                    </template>
                </Column>

                <template #expansion="slotProps">
                    <div class="p-4">
                        <h5>Orders for #{{ slotProps.data.id }} ({{ slotProps.data.items.length }})</h5>
                        <DataTable :value="slotProps.data.items">
                            <Column field="id" header="Id" sortable></Column>
                            <Column header="Produto" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.product_name }}
                                </template>
                            </Column>
                            <Column header="Quantidade" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ data.quantity }}
                                </template>
                            </Column>
                            <Column header="Preço" style="min-width: 12rem">
                                <template #body="{ data }"> {{ data.price }} MT </template>
                            </Column>
                            <Column header="Total" style="min-width: 12rem">
                                <template #body="{ data }"> {{ data.total }} MT </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </DataTable>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeListQuickSellDialog" class="p-button-text" />
        </template>
    </Dialog>
</template>

<style scoped>
.card {
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
</style>
