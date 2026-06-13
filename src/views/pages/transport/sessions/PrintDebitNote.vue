<script setup>
import moment from 'moment';
import { defineProps, defineExpose, onMounted, ref } from 'vue';
import { usePaperizer } from 'paperizer';

const props = defineProps({
    session: {
        type: Object,
        required: true
    }
});

const paperizeFunc = ref(null);

const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY') : '';
};

const getDay = (date) => {
    return date ? moment(date).format('DD') : '__';
};

const getMonth = (date) => {
    return date ? moment(date).format('MM') : '__';
};

const getYear = (date) => {
    return date ? moment(date).format('YY') : '__';
};

const formatCurrencySimple = (value) => {
    const amount = Math.abs(Number(value) || 0);
    return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

onMounted(() => {
    const { paperize } = usePaperizer('debit-note-print', {
        styles: [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        ],
        windowTitle: `Nota_Debito_${props.session.id}_${moment().format('YYYYMMDD')}`
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
    <div id="debit-note-print" class="debit-note-container">
        <div class="container bg-white p-3" style="max-width: 900px;">
            <!-- Header -->
            <div class="row mb-3 pb-2">
                <div class="col-8">
                    <div class="fw-bold text-uppercase" style="font-size: 12px; letter-spacing: 0.4px;">TMB- Empresa Municipal dos Transportes Públicos da Beira</div>
                    <div style="font-size: 8px;">Av. Samora Machel Nº 2487</div>
                </div>
                <div class="col-4 text-end">
                    <div class="fw-bold mb-1" style="font-size: 14px;">
                        NOTA DE DÉBITO Nº 
                        <span class="border-bottom border-dark d-inline-block" style="width: 120px; height: 20px;">{{ session.id }}</span>
                    </div>
                    <div style="font-size: 12px;">
                        <span class="border-bottom border-dark d-inline-block text-center" style="width: 60px; height: 16px;">{{ getDay(session.closed_at || new Date()) }}</span> de
                        <span class="border-bottom border-dark d-inline-block text-center" style="width: 60px; height: 16px;">{{ getMonth(session.closed_at || new Date()) }}</span> de 20<span class="border-bottom border-dark d-inline-block text-center" style="width: 35px; height: 16px;">{{ getYear(session.closed_at || new Date()) }}</span>
                    </div>
                </div>
            </div>

            <!-- Exmo. Senhor -->
            <div class="mb-3 pb-1 border-bottom border-2 border-dark">
                <div class="fw-bold mb-1" style="font-size: 12px;">Exmo. Senhor</div>
                <div class="border-bottom border-dark" style="height: 20px; font-size: 12px; padding-top: 2px;">{{ session.operator?.name || '' }}</div>
            </div>

            <div class="border-bottom border-dark border-2 mb-2" style="border-style: double !important;"></div>

            <!-- Table -->
            <table class="table table-bordered border-dark border-2 mb-2">
                <thead class="table-secondary">
                    <tr class="text-center fw-bold text-uppercase">
                        <th class="text-start ps-3" style="width: 60%; font-size: 12px; padding: 6px;">Designação</th>
                        <th colspan="3" style="width: 40%; font-size: 12px; padding: 6px;">Importância</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-start ps-3" style="padding: 3px;">Falha cometida na cobrança</td>
                        <td style="width: 13.33%; padding: 3px;">{{ formatCurrencySimple((session.total_amount - session.actual_amount_delivered)) }} MT</td>
                    </tr>
                </tbody>
            </table>

            <!-- Total -->
            <div class="text-end fw-bold mb-3" style="font-size: 12px;">
                TOTAL
                <span class="border border-2 border-dark d-inline-block ms-1" style="width: 90px; height: 22px;">{{ formatCurrencySimple((session.total_amount - session.actual_amount_delivered)) }}</span>MT
            </div>

            <!-- Signatures -->
            <div class="row mt-4 pt-3">
                <div class="col-6 text-center">
                    <div class="fw-bold mb-4" style="font-size: 12px;">O CONFERENTE,</div>
                    <div class="border-top border-dark mx-auto" style="width: 200px;"></div>
                </div>
                <div class="col-6 text-center">
                    <div class="fw-bold mb-4" style="font-size: 12px;">O COBRADOR,</div>
                    <div class="border-top border-dark mx-auto" style="width: 200px;">{{ session.operator?.name || '' }}</div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.debit-note-container {
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 900px;
}

@media print {
    .debit-note-container {
        position: static !important;
        left: auto !important;
        top: auto !important;
    }
}
</style>
