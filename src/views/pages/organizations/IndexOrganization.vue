<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash-es';
import moment from 'moment';
import InvoiceService from '@/service/InvoiceService';

const router = useRouter();
const toast = useToast();

// Estado da aplicação
const isLoadingData = ref(true);
const loadingButtonDelete = ref(false);

</script>

<template>
    <div class="card">
        


        <!-- Filtros -->
        <div class="grid mb-3">
            

          

           

           
        </div>


    </div>


</template>
