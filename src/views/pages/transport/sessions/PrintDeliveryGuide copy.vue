<script setup>
import moment from 'moment';
import { defineProps, defineExpose, computed, onMounted, ref } from 'vue';
import { usePaperizer } from 'paperizer';

const props = defineProps({
    session: {
        type: Object,
        required: true
    }
});

const paperizeFunc = ref(null);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value || 0);
};

const formatCurrencySimple = (value) => {
    return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
};

const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY') : '';
};

// Agrupar vendas por preço (tarifa)
const salesByPrice = computed(() => {
    if (!props.session.salesByRouteTicket) return [];
    
    // Agrupar por preço
    const grouped = {};
    props.session.salesByRouteTicket.forEach(item => {
        const price = item.price || 0;
        if (!grouped[price]) {
            grouped[price] = {
                price: price,
                total_tickets: 0,
                total_amount: 0
            };
        }
        grouped[price].total_tickets += item.total_tickets || 0;
        grouped[price].total_amount += item.total_amount || 0;
    });
    
    // Converter para array e ordenar por preço decrescente
    return Object.values(grouped).sort((a, b) => b.price - a.price);
});

const totalPassengers = computed(() => {
    return salesByPrice.value.reduce((sum, item) => sum + item.total_tickets, 0);
});

const totalAmount = computed(() => {
    return salesByPrice.value.reduce((sum, item) => sum + item.total_amount, 0);
});

onMounted(() => {
    const { paperize } = usePaperizer('delivery-guide-print', {
        styles: [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        ],
        windowTitle: `Guia_Entrega_${props.session.id}_${moment().format('YYYYMMDD')}`
    });
    paperizeFunc.value = paperize;
});

const print = () => {
    if (paperizeFunc.value) {
        paperizeFunc.value();
    }
};

defineExpose({ print });
</script>

<template>
    <div id="delivery-guide-print" class="delivery-guide-container">
        <div class="container bg-white p-4" style="max-width: 850px;">
            <!-- Header -->
            <div class="text-center mb-4">
                <div class="d-flex align-items-center justify-content-center mb-2">
                    <div class="border border-2 border-dark px-2 fw-bold" style="font-size: 28px;">TMB</div>
                    <div class="ms-2" style="font-size: 18px;">– Empresa Municipal dos Transportes Públicos da Beira</div>
                </div>
                <div class="fw-bold text-uppercase" style="font-size: 12px;">Departamento de Administração e Finanças</div>
                <div class="fw-bold text-uppercase" style="font-size: 14px;">Secção Comercial</div>
                <div class="fw-bold text-uppercase mt-2" style="font-size: 16px;">Guia de Entrega</div>
            </div>

            <!-- Form Lines -->
            <div class="mb-2" style="font-size: 12px;">
                Eu <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 200px;">{{ session.operator?.name || '___________________' }}</span> 
                Cobrador Nº <span class="border-bottom border-dark px-1" style="display: inline-block; width: 80px;">{{ session.operator?.id || '____' }}</span> 
                entreguei a importância de
            </div>

            <div class="mb-2" style="font-size: 12px;">
                Proveniente da receita da linha <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 400px;">{{ session.salesByRoute && session.salesByRoute.length > 0 ? session.salesByRoute.map(r => r.route_name).join(', ') : '___________________________________' }}</span>
            </div>

            <div class="mb-3" style="font-size: 12px;">
                Nº de trajectos, <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 150px;">{{ session.total_tickets_sold || '___________' }}</span> 
                conforme a discriminação das tarifas abaixo:
                <span class="ms-3">
                    Carro Nº <span class="border-bottom border-dark px-1" style="display: inline-block; width: 80px;">{{ session.salesByVehicle && session.salesByVehicle.length > 0 ? session.salesByVehicle[0].vehicle_plate : '____' }}</span> 
                    Turno <span class="border-bottom border-dark px-1" style="display: inline-block; width: 80px;">{{ session.shift?.name || '____' }}</span>
                </span>
            </div>

            <!-- Main Content Row -->
            <div class="row g-3 mb-3">
                <!-- Left Section -->
                <div class="col-4">
                    <div class="border border-2 border-dark p-3" style="font-size: 11px; line-height: 1.6;">
                        <div class="fw-bold mb-2">Confesso ter cometido nesta data a</div>
                        <div class="text-justify">
                            falha de cobrança no valor de
                            <span class="border-bottom border-dark text-center" style="display: inline-block; width: 70px;">{{ formatCurrencySimple(session.total_penalty_sales || 0) }}</span>MT, no 
                            <span class="border-bottom border-dark text-center" style="display: inline-block; width: 40px;">{{ session.shift?.name || '__' }}</span>Turno
                            e recebi multa por irregularidade no valor de 
                            <span class="border-bottom border-dark text-center" style="display: inline-block; width: 90px;">{{ formatCurrencySimple(session.total_penalty_sales || 0) }}</span>MT, os quais passo assumir.
                        </div>
                        <div class="text-center fw-bold mt-4">O Cobrador</div>
                        <div class="border-top border-dark mt-4"></div>
                    </div>
                </div>

                <!-- Right Section - Table -->
                <div class="col-8">
                    <table class="table table-bordered border-dark border-2" style="font-size: 11px;">
                        <thead class="table-secondary">
                            <tr class="text-center fw-bold">
                                <th class="text-start ps-2" style="width: 30%;">Tarifa</th>
                                <th style="width: 35%;">Nº de<br>Passageiros</th>
                                <th style="width: 35%;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in salesByPrice" :key="index" class="text-center">
                                <td class="text-start ps-2">{{ formatCurrencySimple(item.price) }}MT</td>
                                <td>{{ item.total_tickets }}</td>
                                <td>{{ formatCurrencySimple(item.total_amount) }}MT</td>
                            </tr>
                            <tr v-for="n in Math.max(0, 10 - salesByPrice.length)" :key="'empty-' + n" style="height: 28px;">
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="fw-bold table-light text-center">
                                <td class="text-start ps-2">TOTAL</td>
                                <td>{{ totalPassengers }}</td>
                                <td>{{ formatCurrencySimple(totalAmount) }}MT</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Bottom Section -->
            <div class="mt-4">
                <div class="row mb-3">
                    <div class="col-6 text-center">
                        <div style="font-size: 11px; margin-bottom: 30px;">DATA {{ formatDate(session.closed_at || new Date()) }}</div>
                        <div class="fw-bold" style="font-size: 12px;">O Caixa</div>
                        <div class="border-top border-dark mt-2 mx-4"></div>
                    </div>
                    <div class="col-6 text-center">
                        <div style="height: 41px;"></div>
                        <div class="fw-bold" style="font-size: 12px;">O Cobrador</div>
                        <div class="border-top border-dark mt-2 mx-4"></div>
                    </div>
                </div>

                <div class="text-center fw-bold border-top border-dark pt-2" style="font-size: 10px;">
                    NB: O não preenchimento correcto da guia implica uma sansão disciplinar
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.delivery-guide-container {
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 850px;
}

@media print {
    .delivery-guide-container {
        position: static !important;
        left: auto !important;
        top: auto !important;
    }
}
</style>
