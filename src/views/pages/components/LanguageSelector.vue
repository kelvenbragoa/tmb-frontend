<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const languages = [
    { code: 'pt', label: 'PT', flag: 'https://flagcdn.com/w40/pt.png' },
    { code: 'en', label: 'EN', flag: 'https://flagcdn.com/w40/us.png' }
];

const selectedLanguage = ref(languages.find((lang) => lang.code === localStorage.getItem('language')) || languages[0]);

const changeLanguage = () => {
    locale.value = selectedLanguage.value.code;
    localStorage.setItem('language', selectedLanguage.value.code);
};

const languageTemplate = (option) => {
    return option
        ? `<div class="flex items-center gap-2">
         <img src="${option.flag}" alt="${option.label}" width="20" />
         <span>${option.label}</span>
       </div>`
        : '';
};
</script>

<template>
    <Dropdown v-model="selectedLanguage" :options="languages" optionLabel="label" class="w-32" @change="changeLanguage" :itemTemplate="languageTemplate" />
</template>

<style scoped>
/* Opcional: ajusta o alinhamento */
.p-dropdown {
    min-width: 1rem;
}
</style>
