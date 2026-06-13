<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { baseURL } from '@/service/APIConstant';
import moment from 'moment';
import axios from 'axios';

const toast = useToast();
const isLoading = ref(false);
const selectedDate = ref(new Date()); // Usar objeto Date para o PrimeVue Calendar
const reportData = ref(null);

// Dados dos gráficos
const salesChartData = ref(null);
const salesChartOptions = ref(null);
const topProductsChartData = ref(null);
const topProductsChartOptions = ref(null);

// Buscar relatório de vendas
const getSalesReport = async () => {
    if (!selectedDate.value) {
        toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Por favor, selecione uma data', life: 3000 });
        return;
    }

    isLoading.value = true;
    
    try {
        // Formatar data para envio à API (YYYY-MM-DD)
        const formattedDate = moment(selectedDate.value).format('YYYY-MM-DD');
        
        // O token será automaticamente adicionado pelo interceptador do axios configurado no main.js
        const response = await axios.get(`${baseURL}/sales/report`, {
            params: {
                date: formattedDate
            }
        });
        
        // Mapear dados da API para o formato esperado pela interface
        reportData.value = mapApiDataToInterface(response.data);
        setupCharts();
        
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Relatório carregado com sucesso', life: 3000 });
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        
        if (error.response?.status === 401) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Token de autenticação inválido', life: 3000 });
        } else if (error.response?.status === 400) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Formato de data inválido', life: 3000 });
        } else {
            // Usar dados simulados em caso de erro para demonstração
            reportData.value = generateMockData();
            setupCharts();
            toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Erro na API - usando dados simulados', life: 3000 });
        }
    } finally {
        isLoading.value = false;
    }
};

// Mapear dados da API para o formato da interface
const mapApiDataToInterface = (apiData) => {
    return {
        // Resumo principal
        totalSales: apiData.summary.total_revenue,
        salesGrowth: 0, // Não fornecido pela API
        totalTransactions: apiData.summary.total_sales,
        transactionsGrowth: 0, // Não fornecido pela API
        averageTicket: apiData.summary.average_sale_value,
        averageTicketGrowth: 0, // Não fornecido pela API
        activeSellers: apiData.sales_by_user?.length || 0,
        
        // Gráfico de vendas por hora (simular baseado nas vendas)
        salesByHour: generateHourlyData(apiData.sales),
        
        // Top produtos mais vendidos
        topProducts: apiData.top_products.map((product) => ({
            productName: product.product_name,
            quantity: product.quantity,
            totalRevenue: product.total
        })),
        
        // Top vendedores
        topSellers: (apiData.sales_by_user || []).map((user) => ({
            sellerName: user.user_name,
            totalSales: user.total_revenue,
            transactions: user.sales_count
        })),
        
        // Pontos de venda
        pointOfSales: apiData.sales_by_point_of_sale.map((pos) => ({
            pointName: pos.point_of_sale_name,
            totalSales: pos.total_revenue,
            transactions: pos.sales_count,
            averageTicket: pos.total_revenue / pos.sales_count,
            status: 'Ativo'
        })),
        
        // Métodos de pagamento
        paymentMethods: apiData.payment_methods,
        
        // Lista de vendas
        salesList: apiData.sales
    };
};

// Gerar dados de vendas por hora baseado nas vendas
const generateHourlyData = (sales) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, total: 0 }));
    
    sales.forEach((sale) => {
        const hour = new Date(sale.created_at).getHours();
        hourlyData[hour].total += sale.total;
    });
    
    // Filtrar apenas as horas que tiveram vendas
    return hourlyData.filter((item) => item.total > 0);
};

// Gerar dados simulados para demonstração
const generateMockData = () => {
    return {
        totalSales: 15420.5,
        salesGrowth: 12.5,
        totalTransactions: 47,
        transactionsGrowth: 8.2,
        averageTicket: 328.1,
        averageTicketGrowth: 3.8,
        activeSellers: 5,
        salesByHour: [
            { hour: 8, total: 850 },
            { hour: 9, total: 1200.5 },
            { hour: 10, total: 1850.75 },
            { hour: 11, total: 2100.25 },
            { hour: 12, total: 1650 },
            { hour: 13, total: 890.3 },
            { hour: 14, total: 2200.8 },
            { hour: 15, total: 1875.45 },
            { hour: 16, total: 1520.2 },
            { hour: 17, total: 1273.25 }
        ],
        topProducts: [
            { productName: 'Smartphone Galaxy', quantity: 12, totalRevenue: 7200 },
            { productName: 'Notebook Dell', quantity: 8, totalRevenue: 4800 },
            { productName: 'Mouse Wireless', quantity: 25, totalRevenue: 750 },
            { productName: 'Teclado Mecânico', quantity: 15, totalRevenue: 2250 },
            { productName: 'Monitor 24"', quantity: 6, totalRevenue: 1800 }
        ],
        topSellers: [
            { sellerName: 'João Silva', totalSales: 4200, transactions: 12 },
            { sellerName: 'Maria Santos', totalSales: 3850.5, transactions: 10 },
            { sellerName: 'Pedro Costa', totalSales: 3200.75, transactions: 9 },
            { sellerName: 'Ana Oliveira', totalSales: 2900.25, transactions: 8 },
            { sellerName: 'Carlos Lima', totalSales: 1267, transactions: 8 }
        ],
        pointOfSales: [
            { pointName: 'Loja Centro', totalSales: 8500, transactions: 25, averageTicket: 340, status: 'Ativo' },
            { pointName: 'Loja Shopping Mall', totalSales: 4920.5, transactions: 15, averageTicket: 328.03, status: 'Ativo' },
            { pointName: 'Loja Bairro Norte', totalSales: 2000, transactions: 7, averageTicket: 285.71, status: 'Ativo' }
        ]
    };
};

// Configurar gráficos
const setupCharts = () => {
    if (!reportData.value) return;

    // Gráfico de vendas por hora
    const salesByHour = reportData.value.salesByHour || [];
    salesChartData.value = {
        labels: salesByHour.map((item) => `${item.hour}h`),
        datasets: [
            {
                label: 'Vendas por Hora',
                data: salesByHour.map((item) => item.total),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true
            }
        ]
    };

    salesChartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return 'MT ' + value.toLocaleString('pt-MZ');
                    }
                }
            }
        }
    };

    // Gráfico de produtos mais vendidos
    const topProducts = reportData.value.topProducts || [];
    topProductsChartData.value = {
        labels: topProducts.map((item) => item.productName),
        datasets: [
            {
                label: 'Quantidade Vendida',
                data: topProducts.map((item) => item.quantity),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }
        ]
    };

    topProductsChartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        }
    };
};

// Formatar valor em moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN'
    }).format(value || 0);
};

// Obter nome legível do método de pagamento
const getPaymentMethodName = (method) => {
    const methods = {
        credit_card: 'Cartão de Crédito',
        debit_card: 'Cartão de Débito',
        cash: 'Dinheiro',
        pix: 'PIX',
        bank_transfer: 'Transferência'
    };
    return methods[method] || method;
};

// Obter ícone do método de pagamento
const getPaymentIcon = (method) => {
    const icons = {
        credit_card: 'pi pi-credit-card',
        debit_card: 'pi pi-credit-card',
        cash: 'pi pi-money-bill',
        pix: 'pi pi-mobile',
        bank_transfer: 'pi pi-building'
    };
    return icons[method] || 'pi pi-wallet';
};

onMounted(() => {
    // Carregar automaticamente o relatório do dia atual
    getSalesReport();
});
</script>

<template>
    <!-- Cabeçalho com seletor de data -->
    <div class="grid mb-4">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center">
                    <h2 class="m-0">Relatório de Vendas</h2>
                    <div class="flex align-items-center gap-3">
                        <label for="dateSelector" class="font-semibold">Data:</label>
                        <Calendar id="dateSelector" v-model="selectedDate" dateFormat="dd/mm/yy" placeholder="Selecione a data" :showIcon="true" />
                        <Button label="Buscar Relatório" icon="pi pi-search" @click="getSalesReport" :loading="isLoading" class="p-button-primary" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading -->
    <div class="grid" v-if="isLoading">
        <div class="col-12 flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px"  animationDuration=".5s" aria-label="Carregando relatório" />
        </div>
    </div>

    <!-- Relatório de Vendas -->
    <div class="grid" v-else-if="reportData">
        <!-- Cards de Métricas Principais -->
        <div class="col-12 lg:col-3 md:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Receita Total</span>
                        <div class="text-900 font-medium text-xl">
                            {{ formatCurrency(reportData.totalSales) }}
                        </div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500">Total arrecadado no dia selecionado</span>
            </div>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Quantidade de Vendas</span>
                        <div class="text-900 font-medium text-xl">{{ reportData.totalTransactions || 0 }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-receipt text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500">Número total de transações</span>
            </div>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Ticket Médio</span>
                        <div class="text-900 font-medium text-xl">
                            {{ formatCurrency(reportData.averageTicket) }}
                        </div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500">Valor médio por venda</span>
            </div>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Vendedores Ativos</span>
                        <div class="text-900 font-medium text-xl">{{ reportData.activeSellers || 0 }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-purple-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-500">vendedores realizaram vendas</span>
            </div>
        </div>

        <!-- Gráficos -->
        <div class="col-12 lg:col-8">
            <div class="card">
                <h5>Vendas por Hora</h5>
                <Chart type="line" :data="salesChartData" :options="salesChartOptions" class="h-30rem"></Chart>
            </div>
        </div>

        <div class="col-12 lg:col-4">
            <div class="card">
                <h5>Produtos Mais Vendidos</h5>
                <Chart type="doughnut" :data="topProductsChartData" :options="topProductsChartOptions" class="h-30rem"></Chart>
            </div>
        </div>

        <!-- Tabelas de Detalhes -->
        <div class="col-12 lg:col-6">
            <div class="card">
                <h5>Top Vendedores</h5>
                <DataTable :value="reportData.topSellers" :rows="5" responsiveLayout="scroll">
                    <Column field="sellerName" header="Vendedor" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <Avatar :label="data.sellerName.charAt(0)" class="mr-2" size="normal" shape="circle" />
                                <span>{{ data.sellerName }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="totalSales" header="Total Vendas">
                        <template #body="{ data }">
                            {{ formatCurrency(data.totalSales) }}
                        </template>
                    </Column>
                    <Column field="transactions" header="Qtd. Vendas" style="min-width: 8rem">
                        <template #body="{ data }">
                            <Badge :value="data.transactions" severity="info"></Badge>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <div class="col-12 lg:col-6">
            <div class="card">
                <h5>Produtos Mais Vendidos (Detalhado)</h5>
                <DataTable :value="reportData.topProducts" :rows="5" responsiveLayout="scroll">
                    <Column field="productName" header="Produto" style="min-width: 12rem"></Column>
                    <Column field="quantity" header="Quantidade">
                        <template #body="{ data }">
                            <Badge :value="data.quantity" severity="success"></Badge>
                        </template>
                    </Column>
                    <Column field="totalRevenue" header="Receita Total">
                        <template #body="{ data }">
                            {{ formatCurrency(data.totalRevenue) }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Informações dos Pontos de Venda -->
        <div class="col-12" v-if="reportData.pointOfSales && reportData.pointOfSales.length > 0">
            <div class="card">
                <h5>Vendas por Ponto de Venda</h5>
                <DataTable :value="reportData.pointOfSales" responsiveLayout="scroll" :paginator="true" :rows="10">
                    <Column field="pointName" header="Ponto de Venda" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-map-marker text-primary"></i>
                                <span>{{ data.pointName }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="totalSales" header="Total de Vendas">
                        <template #body="{ data }">
                            {{ formatCurrency(data.totalSales) }}
                        </template>
                    </Column>
                    <Column field="transactions" header="Transações">
                        <template #body="{ data }">
                            <Badge :value="data.transactions" severity="info"></Badge>
                        </template>
                    </Column>
                    <Column field="averageTicket" header="Ticket Médio">
                        <template #body="{ data }">
                            {{ formatCurrency(data.averageTicket) }}
                        </template>
                    </Column>
                    <Column field="status" header="Status">
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="data.status === 'Ativo' ? 'success' : 'warning'"></Tag>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Métodos de Pagamento -->
        <div class="col-12 lg:col-6" v-if="reportData.paymentMethods && reportData.paymentMethods.length > 0">
            <div class="card">
                <h5>Métodos de Pagamento</h5>
                <DataTable :value="reportData.paymentMethods" responsiveLayout="scroll">
                    <Column field="method" header="Método">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <i :class="getPaymentIcon(data.method)" class="text-primary"></i>
                                <span>{{ getPaymentMethodName(data.method) }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="count" header="Qtd. Transações">
                        <template #body="{ data }">
                            <Badge :value="data.count" severity="success"></Badge>
                        </template>
                    </Column>
                    <Column field="total" header="Total">
                        <template #body="{ data }">
                            {{ formatCurrency(data.total) }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Lista de Vendas Detalhada -->
        <div class="col-12 lg:col-6" v-if="reportData.salesList && reportData.salesList.length > 0">
            <div class="card">
                <h5>Vendas Detalhadas</h5>
                <DataTable :value="reportData.salesList" responsiveLayout="scroll" :paginator="true" :rows="5">
                    <Column field="id" header="ID" style="min-width: 4rem">
                        <template #body="{ data }">
                            <Badge :value="data.id" severity="info"></Badge>
                        </template>
                    </Column>
                    <Column field="costumer_name" header="Cliente" style="min-width: 10rem"></Column>
                    <Column field="total" header="Total">
                        <template #body="{ data }">
                            {{ formatCurrency(data.total) }}
                        </template>
                    </Column>
                    <Column field="payment_method" header="Pagamento">
                        <template #body="{ data }">
                            <Tag :value="getPaymentMethodName(data.payment_method)" severity="info"></Tag>
                        </template>
                    </Column>
                    <Column field="user_name" header="Vendedor" style="min-width: 8rem"></Column>
                    <Column field="created_at" header="Data/Hora">
                        <template #body="{ data }">
                            {{ moment(data.created_at).format('DD/MM HH:mm') }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- Estado vazio -->
    <div class="grid" v-else-if="!isLoading">
        <div class="col-12">
            <div class="card text-center">
                <div class="flex flex-column align-items-center justify-content-center py-6">
                    <i class="pi pi-chart-bar text-6xl text-400 mb-3"></i>
                    <h3 class="text-600">Nenhum dado encontrado</h3>
                    <p class="text-500">Selecione uma data e clique em "Buscar Relatório" para visualizar os dados de vendas.</p>
                </div>
            </div>
        </div>
    </div>
</template>
