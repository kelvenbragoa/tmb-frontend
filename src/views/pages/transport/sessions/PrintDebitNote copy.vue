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
        <div class="container bg-white p-5" style="max-width: 900px;">
            <!-- Header -->
            <div class="row mb-4 pb-3">
                <div class="col-8">
                    <div class="px-2 fw-bold mb-2" style="font-size: 32px;">TMB</div>
                    <div class="fw-bold text-uppercase" style="font-size: 11px; letter-spacing: 0.5px;">- Empresa Municipal dos Transportes Públicos da Beira</div>
                    <div style="font-size: 10px;">Av. Samora Machel Nº 2487</div>
                </div>
                <div class="col-4 text-end">
                    <div class="fw-bold mb-2" style="font-size: 18px;">
                        NOTA DE DÉBITO Nº 
                        <span class="border-bottom border-dark d-inline-block" style="width: 150px; height: 25px;"></span>
                    </div>
                    <div style="font-size: 12px;">
                        <span class="border-bottom border-dark d-inline-block text-center" style="width: 80px; height: 20px;">{{ getDay(session.closed_at || new Date()) }}</span> de
                        <span class="border-bottom border-dark d-inline-block text-center" style="width: 80px; height: 20px;">{{ getMonth(session.closed_at || new Date()) }}</span> de 20<span class="border-bottom border-dark d-inline-block text-center" style="width: 40px; height: 20px;">{{ getYear(session.closed_at || new Date()) }}</span>
                    </div>
                </div>
            </div>

            <!-- Exmo. Senhor -->
            <div class="mb-4 pb-2 border-bottom border-2 border-dark">
                <div class="fw-bold mb-2" style="font-size: 14px;">Exmo. Senhor</div>
                <div class="border-bottom border-dark" style="height: 25px;">{{ session.operator?.name || '' }}</div>
            </div>

            <div class="border-bottom border-dark border-3 mb-3" style="border-style: double !important;"></div>

            <!-- Table -->
            <table class="table table-bordered border-dark border-2 mb-3">
                <thead class="table-secondary">
                    <tr class="text-center fw-bold text-uppercase">
                        <th class="text-start ps-3" style="width: 60%; font-size: 14px;">Designação</th>
                        <th colspan="3" style="width: 40%; font-size: 14px;">Importância</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="n in 6" :key="n" style="height: 40px;">
                        <td class="text-start ps-3"></td>
                        <td style="width: 13.33%;"></td>
                        <td style="width: 13.33%;"></td>
                        <td style="width: 13.33%;"></td>
                    </tr>
                </tbody>
            </table>

            <!-- Total -->
            <div class="text-end fw-bold mb-4" style="font-size: 14px;">
                TOTAL .... .... ....
                <span class="border border-2 border-dark d-inline-block ms-2" style="width: 120px; height: 30px;"></span>
                <span class="border border-2 border-dark d-inline-block ms-1" style="width: 120px; height: 30px;"></span>
                <span class="border border-2 border-dark d-inline-block ms-1" style="width: 120px; height: 30px;"></span>
            </div>

            <!-- Signatures -->
            <div class="row mt-5 pt-5">
                <div class="col-6 text-center">
                    <div class="fw-bold mb-5" style="font-size: 14px;">O CONFERENTE,</div>
                    <div class="border-top border-dark mx-auto" style="width: 250px;"></div>
                </div>
                <div class="col-6 text-center">
                    <div class="fw-bold mb-5" style="font-size: 14px;">O COBRADOR,</div>
                    <div class="border-top border-dark mx-auto" style="width: 250px;"></div>
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
