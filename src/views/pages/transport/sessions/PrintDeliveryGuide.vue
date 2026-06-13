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
    const amount = Math.abs(Number(value) || 0);
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(amount);
};

const formatCurrencySimple = (value) => {
    const amount = Math.abs(Number(value) || 0);
    return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
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
                ticket_type_name: item.ticket_type_name,
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
        <div class="container bg-white p-3" style="max-width: 850px;">
            <!-- Header -->
            <div class="text-center mb-3">
                <div class="d-flex align-items-center justify-content-center mb-2">
                    <div class="px-2 fw-bold" style="font-size: 22px;">TMB</div>
                    <div class="ms-2" style="font-size: 14px;">– Empresa Municipal dos Transportes Públicos da Beira</div>
                </div>
                <div class="fw-bold text-uppercase" style="font-size: 10px;">Departamento de Administração e Finanças</div>
                <div class="fw-bold text-uppercase" style="font-size: 11px;">Secção Comercial</div>
                <div class="fw-bold text-uppercase mt-1" style="font-size: 13px;">Guia de Entrega</div>
            </div>

            <!-- Form Lines -->
            <div class="mb-2" style="font-size: 10px;">
                Eu <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 180px;">{{ session.operator?.name || '___________________' }}</span> 
                Cobrador Nº <span class="border-bottom border-dark px-1" style="display: inline-block; width: 70px;">{{ session.operator?.id || '____' }}</span> 
                entreguei a importância de <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 200px;">{{ formatCurrency(session.actual_amount_delivered) }}</span>
            </div>

            <div class="mb-2" style="font-size: 10px;">
                Proveniente da receita da linha <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 350px;">{{ session.salesByRoute && session.salesByRoute.length > 0 ? session.salesByRoute.map(r => r.route_name).join(', ') : '___________________________________' }}</span>
            </div>

            <div class="mb-2" style="font-size: 10px;">
                Nº de trajectos, <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 120px;">{{ session.total_tickets_sold || '___________' }}</span> 
                conforme a discriminação das tarifas abaixo:
                <span class="ms-2">
                    Carro Nº <span class="border-bottom border-dark px-1" style="display: inline-block; width: 70px;">{{ session.salesByVehicle && session.salesByVehicle.length > 0 ? session.salesByVehicle[0].vehicle_plate : '____' }}</span> 
                    Turno <span class="border-bottom border-dark px-1" style="display: inline-block; width: 100px;">{{ session.shift?.name || '____' }}</span>
                </span>
            </div>

            <!-- Main Content Row -->
            <div class="row g-2 mb-2">
                <!-- Left Section -->
                <div class="col-4">
                    <div class="border border-2 border-dark p-2" style="font-size: 9px; line-height: 1.5;">
                        <div class="fw-bold mb-1">Confesso ter cometido nesta data a</div>
                        <div class="text-justify">
                            falha de cobrança no valor de
                            <span class="border-bottom border-dark text-center" style="display: inline-block; width: 60px;">{{ formatCurrencySimple((session.total_amount - session.actual_amount_delivered)) }}</span>MT, no 
                            <span class="border-bottom border-dark text-center" style="display: inline-block; width: 60px;">{{ session.shift?.name || '__' }}</span>Turno
                            e recebi multa por irregularidade no valor de 
                            <span class="border-bottom border-dark text-center" style="display: inline-block; width: 70px;">{{ formatCurrencySimple(session.total_penalty_sales || 0) }}</span>MT, os quais passo assumir.
                        </div>
                        <div class="text-center fw-bold mt-3">O Cobrador</div>
                        <div class="border-top border-dark mt-3"></div>
                    </div>
                </div>

                <!-- Right Section - Table -->
                <div class="col-8">
                    <table class="table table-bordered border-dark border-2 mb-0" style="font-size: 9px;">
                        <thead class="table-secondary">
                            <tr class="text-center fw-bold">
                                <th class="text-start ps-2" style="width: 30%; padding: 5px;">Tarifa</th>
                                <th style="width: 35%; padding: 5px;">Nº de<br>Passageiros</th>
                                <th style="width: 35%; padding: 5px;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            
                            <tr v-for="(item, index) in salesByPrice" :key="index" class="text-center">
                                <td class="text-start ps-2" style="padding: 3px 5px;">{{ formatCurrencySimple(item.price) }}MT - {{ item.ticket_type_name || '____' }}</td>
                                <td style="padding: 3px 5px;">{{ item.total_tickets }}</td>
                                <td style="padding: 3px 5px;">{{ formatCurrencySimple(item.total_amount) }}MT</td>
                            </tr>
                            <tr v-for="n in Math.max(0, 10 - salesByPrice.length)" :key="'empty-' + n" style="height: 22px;">
                                <td style="padding: 3px;"></td>
                                <td style="padding: 3px;"></td>
                                <td style="padding: 3px;"></td>
                            </tr>
                            <tr class="fw-bold table-light text-center">
                                <td class="text-start ps-2" style="padding: 5px;">TOTAL</td>
                                <td style="padding: 5px;">{{ totalPassengers }}</td>
                                <td style="padding: 5px;">{{ formatCurrencySimple(totalAmount) }}MT</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Bottom Section -->
            <div class="mt-3">
                <div class="row mb-2">
                    <div class="col-6 text-center">
                        <div style="font-size: 9px; margin-bottom: 20px;">DATA {{ formatDate(session.closed_at || new Date()) }}</div>
                        <div class="fw-bold" style="font-size: 10px;">O Caixa</div> <br>
                        <div class="border-top border-dark mt-2 mx-4"></div>
                    </div>
                    <div class="col-6 text-center">
                        <div style="height: 29px;"></div>
                        <div class="fw-bold" style="font-size: 10px;">O Cobrador</div> <br>
                        <div class="border-top border-dark mt-2 mx-4"></div>
                    </div>
                </div> 
                <br>

                <div class="text-center fw-bold border-top border-dark pt-2" style="font-size: 8px;">
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
