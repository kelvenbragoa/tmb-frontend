<script setup>
import moment from 'moment';
import { defineProps, defineExpose, computed, onMounted, ref } from 'vue';
import { usePaperizer } from 'paperizer';

const props = defineProps({
    report: {
        type: Object,
        required: true
    },
    operatorName: {
        type: String,
        default: ''
    },
    operatorId: {
        type: [Number, String],
        default: null
    },
    reportDate: {
        type: [Date, String],
        default: () => new Date()
    }
});

const paperizeFunc = ref(null);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(Number(value) || 0);
};

const formatCurrencySimple = (value) => {
    return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
};

const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY') : '';
};

const salesByTicketType = computed(() => props.report?.salesByTicketType || []);

const totalAmountByShift = computed(() => props.report?.totalAmountByShift || []);

const totalAmountByShiftAndRoute = computed(() => props.report?.totalAmountByShiftAndRoute || []);

const totalAmount = computed(() => Number(props.report?.totalAmount) || 0);

const totalPassengers = computed(() => {
    return salesByTicketType.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});

const routeNames = computed(() => {
    const names = new Set();
    totalAmountByShiftAndRoute.value.forEach((shift) => {
        shift.routes?.forEach((route) => names.add(route.route_name));
    });
    return Array.from(names).join(', ');
});

onMounted(() => {
    const { paperize } = usePaperizer('guia-receita-print', {
        styles: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'],
        windowTitle: `Guia_Receita_${props.operatorId || 'operador'}_${moment(props.reportDate).format('YYYYMMDD')}`
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
    <div id="guia-receita-print" class="guia-receita-container">
        <div class="container bg-white p-3" style="max-width: 850px;">
            <div class="text-center mb-3">
                <div class="d-flex align-items-center justify-content-center mb-2">
                    <div class="px-2 fw-bold" style="font-size: 22px;">TMB</div>
                    <div class="ms-2" style="font-size: 14px;">– Empresa Municipal dos Transportes Públicos da Beira</div>
                </div>
                <div class="fw-bold text-uppercase" style="font-size: 10px;">Departamento de Administração e Finanças</div>
                <div class="fw-bold text-uppercase" style="font-size: 11px;">Secção Comercial</div>
                <div class="fw-bold text-uppercase mt-1" style="font-size: 13px;">Guia de Receita</div>
            </div>

            <div class="mb-2" style="font-size: 10px;">
                Eu <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 180px;">{{ operatorName || '___________________' }}</span>
                Cobrador Nº <span class="border-bottom border-dark px-1" style="display: inline-block; width: 70px;">{{ operatorId || '____' }}</span>
                entreguei a importância de <span class="border-bottom border-dark px-1 fw-bold" style="display: inline-block; min-width: 200px;">{{ formatCurrency(totalAmount) }}</span>
            </div>

            <div class="mb-2" style="font-size: 10px;">
                Proveniente da receita da linha <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 350px;">{{ routeNames || '___________________________________' }}</span>
            </div>

            <div class="mb-2" style="font-size: 10px;">
                Nº de passageiros, <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 120px;">{{ totalPassengers || '___________' }}</span>
                referente ao dia <span class="border-bottom border-dark px-1" style="display: inline-block; min-width: 100px;">{{ formatDate(reportDate) }}</span>
                conforme a discriminação das tarifas abaixo:
            </div>

            <div class="row g-2 mb-2">
                <div class="col-12">
                    <table class="table table-bordered border-dark border-2 mb-0" style="font-size: 9px;">
                        <thead class="table-secondary">
                            <tr class="text-center fw-bold">
                                <th class="text-start ps-2" style="width: 40%; padding: 5px;">Tipo de Bilhete</th>
                                <th style="width: 30%; padding: 5px;">Nº de<br>Passageiros</th>
                                <th style="width: 30%; padding: 5px;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in salesByTicketType" :key="index" class="text-center">
                                <td class="text-start ps-2" style="padding: 3px 5px;">{{ item.ticket_type_name || '____' }}</td>
                                <td style="padding: 3px 5px;">{{ item.quantity }}</td>
                                <td style="padding: 3px 5px;">{{ formatCurrencySimple(item.total_amount) }}MT</td>
                            </tr>
                            <tr v-for="n in Math.max(0, 8 - salesByTicketType.length)" :key="'empty-' + n" style="height: 22px;">
                                <td style="padding: 3px;"></td>
                                <td style="padding: 3px;"></td>
                                <td style="padding: 3px;"></td>
                            </tr>
                            <tr class="fw-bold table-light text-center">
                                <td class="text-start ps-2" style="padding: 5px;">TOTAL DO DIA</td>
                                <td style="padding: 5px;">{{ totalPassengers }}</td>
                                <td style="padding: 5px;">{{ formatCurrencySimple(totalAmount) }}MT</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mb-3" v-if="totalAmountByShift.length">
                <div class="fw-bold mb-1" style="font-size: 10px;">Total por Turno</div>
                <table class="table table-bordered border-dark border-2 mb-0" style="font-size: 9px;">
                    <thead class="table-secondary">
                        <tr class="text-center fw-bold">
                            <th class="text-start ps-2" style="padding: 5px;">Turno</th>
                            <th style="padding: 5px;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="shift in totalAmountByShift" :key="shift.shift_id" class="text-center">
                            <td class="text-start ps-2" style="padding: 3px 5px;">{{ shift.shift_name }}</td>
                            <td style="padding: 3px 5px;">{{ formatCurrencySimple(shift.totalAmount) }}MT</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mb-3" v-if="totalAmountByShiftAndRoute.length">
                <div class="fw-bold mb-1" style="font-size: 10px;">Total por Turno e Rota</div>
                <template v-for="shiftGroup in totalAmountByShiftAndRoute" :key="shiftGroup.shift_id">
                    <div class="fw-semibold mt-2 mb-1" style="font-size: 9px;">{{ shiftGroup.shift_name }}</div>
                    <table class="table table-bordered border-dark border-2 mb-2" style="font-size: 9px;">
                        <thead class="table-secondary">
                            <tr class="text-center fw-bold">
                                <th class="text-start ps-2" style="padding: 5px;">Rota</th>
                                <th style="padding: 5px;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="route in shiftGroup.routes" :key="route.route_id" class="text-center">
                                <td class="text-start ps-2" style="padding: 3px 5px;">{{ route.route_name }}</td>
                                <td style="padding: 3px 5px;">{{ formatCurrencySimple(route.total_amount) }}MT</td>
                            </tr>
                        </tbody>
                    </table>
                </template>
            </div>

            <div class="mt-3">
                <div class="row mb-2">
                    <div class="col-6 text-center">
                        <div style="font-size: 9px; margin-bottom: 20px;">DATA {{ formatDate(reportDate) }}</div>
                        <div class="fw-bold" style="font-size: 10px;">O Caixa</div>
                        <br />
                        <div class="border-top border-dark mt-2 mx-4"></div>
                    </div>
                    <div class="col-6 text-center">
                        <div style="height: 29px;"></div>
                        <div class="fw-bold" style="font-size: 10px;">O Cobrador</div>
                        <br />
                        <div class="border-top border-dark mt-2 mx-4"></div>
                    </div>
                </div>
                <br />

                <div class="text-center fw-bold border-top border-dark pt-2" style="font-size: 8px;">
                    NB: O não preenchimento correcto da guia implica uma sansão disciplinar
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.guia-receita-container {
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 850px;
}

@media print {
    .guia-receita-container {
        position: static !important;
        left: auto !important;
        top: auto !important;
    }
}
</style>
