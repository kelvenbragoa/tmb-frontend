<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, onBeforeMount, ref } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import LanguageSelector from './components/LanguageSelector.vue';

const { layoutConfig } = useLayout();
const token = ref(null);
const smoothScroll = (id) => {
    document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
    });
};

const logoUrl = computed(() => {
    return `layout/images/dynamis_logo_croped.png`;
});

onBeforeMount(() => {
    token.value = localStorage.getItem('token');
});
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div class="py-4 px-4 mx-0 md:mx-6 lg:mx-8 lg:px-8 flex align-items-center justify-content-between relative lg:static mb-3">
                <a class="flex align-items-center" href="#"> <img :src="logoUrl" alt="Sakai Logo" height="50" class="mr-0 lg:mr-2" /><span class="text-900 font-medium text-2xl line-height-3 mr-8"></span> </a>
                <a class="cursor-pointer block lg:hidden text-700 p-ripple" v-ripple v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }">
                    <i class="pi pi-bars text-4xl"></i>
                </a>
                <div class="align-items-center surface-0 flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full left-0 px-6 lg:px-0 z-2" style="top: 120px">
                    <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer">
                        <li>
                            <a @click="smoothScroll('#hero')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                                <span>{{ $t('message.home') }}</span>
                            </a>
                        </li>
                        <li>
                            <a @click="smoothScroll('#features')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                                <span>{{ $t('message.retail') }}</span>
                            </a>
                        </li>
                        <li>
                            <a @click="smoothScroll('#highlights')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                                <span>{{ $t('message.help') }}</span>
                            </a>
                        </li>
                        <li>
                            <a @click="smoothScroll('#pricing')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                                <span>{{ $t('message.price') }}</span>
                            </a>
                        </li>
                    </ul>
                    <div class="flex justify-content-between lg:block border-top-1 lg:border-top-none surface-border py-3 lg:py-0 mt-3 lg:mt-0">
                        <router-link to="/auth/login" v-if="!token"
                            ><Button class="p-button-text p-button-rounded border-none font-light line-height-2 text-blue-500">{{ $t('message.login') }}</Button></router-link
                        >
                        <router-link to="/auth/signup" v-if="!token">
                            <Button class="p-button-rounded border-none ml-5 mr-2 font-light text-white line-height-2 bg-blue-500">{{ $t('message.signup') }}</Button>
                        </router-link>
                        <router-link to="/dashboard" v-if="token">
                            <Button class="p-button-rounded border-none ml-5 mr-2 font-light text-white line-height-2 bg-blue-500">{{ $t('message.home') }}</Button>
                        </router-link>
                        <LanguageSelector />
                    </div>
                </div>
            </div>

            <div id="hero" class="flex flex-column pt-4 px-4 lg:px-8 overflow-hidden" style="background: linear-gradient(135deg, #0a2750 30%, #60a5fa 90%)">
                <div class="mx-4 md:mx-8 mt-0 md:mt-4">
                    <h1 class="text-6xl font-bold text-gray-100 line-height-2">
                        <span class="font-light block">{{ $t('message.banner_title_1') }} </span>{{ $t('message.banner_title_2') }}
                    </h1>
                    <p class="font-normal text-2xl line-height-3 md:mt-3 text-gray-100">
                        {{ $t('message.banner_subtitle') }}
                    </p>
                    <Button class="p-button-rounded text-xl border border-white mt-5 bg-white text-blue-600 hover:bg-gray-100 font-medium px-4">
                        {{ $t('message.signup') }}
                    </Button>
                </div>
                <div class="flex justify-content-center md:justify-content-end">
                    <img src="/demo/images/landing/screen-1.png" alt="Hero Image" class="w-9 md:w-auto" />
                </div>
            </div>

            <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                <div class="grid justify-content-center">
                    <div class="col-12 text-center mt-8 mb-4">
                        <h1 class="text-900 font-bold mb-2">{{ $t('message.features_title') }}</h1>
                    </div>

                    <div class="col-12 md:col-6 lg:col-6 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0 flex justify-center">
                        <TabView class="w-full max-w-4xl">
                            <template #header>
                                <div style="display: flex; justify-content: center" />
                            </template>
                            <TabPanel :header="$t('invoice.title')">
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <img src="/demo/images/landing/screen-1.png" :alt="$t('invoice.title')" class="w-full border-round" style="max-height: 300px; object-fit: cover" />
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <h2 class="mt-0">{{ $t('invoice.title') }}</h2>
                                        <div class="flex align-items-center mb-3">
                                            <i class="pi pi-check-circle text-primary mr-2"></i>
                                            <span>{{ $t('invoice.features.compatible') }}</span>
                                        </div>
                                        <div class="flex align-items-center mb-3">
                                            <i class="pi pi-check-circle text-primary mr-2"></i>
                                            <span>{{ $t('invoice.features.printing') }}</span>
                                        </div>
                                        <div class="flex align-items-center mb-3">
                                            <i class="pi pi-check-circle text-primary mr-2"></i>
                                            <span>{{ $t('invoice.features.payments') }}</span>
                                        </div>
                                        <div class="flex align-items-center mb-3">
                                            <i class="pi pi-check-circle text-primary mr-2"></i>
                                            <span>{{ $t('invoice.features.accounts') }}</span>
                                        </div>
                                        <div class="flex align-items-center mb-3">
                                            <i class="pi pi-check-circle text-primary mr-2"></i>
                                            <span>{{ $t('invoice.features.reports') }}</span>
                                        </div>

                                        <div class="mt-4">
                                            <p class="font-bold mb-2">{{ $t('invoice.ideal_for.title') }}</p>
                                            <p class="mt-0">
                                                - {{ $t('invoice.ideal_for.items[0]') }}<br />
                                                - {{ $t('invoice.ideal_for.items[1]') }}<br />
                                                - {{ $t('invoice.ideal_for.items[2]') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel :header="$t('pos.title_extended')">
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <img src="/demo/images/landing/screen-1.png" :alt="$t('pos.title_extended')" class="w-full border-round shadow-2" style="max-height: 300px; object-fit: cover" />
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <h2 class="mt-0 text-900">{{ $t('pos.title_extended') }}</h2>

                                        <div class="grid mt-4">
                                            <div class="col-12 md:col-6">
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.tables') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.menus') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.orders') }}</span>
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6">
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.consult') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.split') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.cash') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel :header="$t('pos.title_extended')">
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <img src="/demo/images/landing/screen-1.png" :alt="$t('pos.title_extended')" class="w-full border-round shadow-2" style="max-height: 300px; object-fit: cover" />
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <h2 class="mt-0 text-900">{{ $t('pos.title_extended') }}</h2>

                                        <div class="grid mt-4">
                                            <div class="col-12 md:col-6">
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.tables') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.menus') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.orders') }}</span>
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6">
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.consult') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.split') }}</span>
                                                </div>
                                                <div class="flex align-items-start mb-3">
                                                    <i class="pi pi-check-circle text-primary mr-2 mt-1"></i>
                                                    <span>{{ $t('pos.features.cash') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>

            <div id="pricing" class="py-4 px-4 lg:px-8 my-2 md:my-4">
                <div class="text-center">
                    <h2 class="text-900 font-bold mb-2">{{ $t('cta.title') }}</h2>
                    <span class="text-600 text-2xl">{{ $t('cta.subtitle') }}</span>
                </div>

                <div class="grid justify-content-between mt-8 md:mt-0">
                    <div class="col-12 lg:col-4 p-0 md:p-3">
                        <div class="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-primary transition-duration-300 transition-all" style="border-radius: 10px">
                            <h3 class="text-900 text-center my-5">Basic</h3>
                            <!-- <img src="/demo/images/landing/free.svg" class="w-10 h-10 mx-auto" alt="free" /> -->
                            <div class="my-5 text-center">
                                <span class="text-5xl font-bold mr-2 text-900">2.999,00 MZN</span>
                                <span class="text-600">por mês</span>
                                <Button label="Inicie Agora" class="block mx-auto mt-4 p-button-rounded border-none ml-3 font-light line-height-2 bg-blue-500 text-white"></Button>
                            </div>
                            <Divider class="w-full bg-surface-200"></Divider>
                            <ul class="my-5 list-none p-0 flex text-900 flex-column">
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">POS Retalho</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-times text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Módulo de Stock</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-times text-xl text-red-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Facturação</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Até 5 utilizadores</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="col-12 lg:col-4 p-0 md:p-3 mt-4 md:mt-0">
                        <div class="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-primary transition-duration-300 transition-all" style="border-radius: 10px">
                            <h3 class="text-900 text-center my-5">Pro</h3>
                            <!-- <img src="/demo/images/landing/startup.svg" class="w-10 h-10 mx-auto" alt="startup" /> -->
                            <div class="my-5 text-center">
                                <span class="text-5xl font-bold mr-2 text-900">5.999,00 MZN</span>
                                <span class="text-600">por mês</span>
                                <Button label="Inicie Agora" class="block mx-auto mt-4 p-button-rounded border-none ml-3 font-light line-height-2 bg-blue-500 text-white"></Button>
                            </div>
                            <Divider class="w-full bg-surface-200"></Divider>
                            <ul class="my-5 list-none p-0 flex text-900 flex-column">
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">POS Retalho</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Módulo de Stock</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Facturação</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Até 10 utilizadores</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="col-12 lg:col-4 p-0 md:p-3 mt-4 md:mt-0">
                        <div class="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-primary transition-duration-300 transition-all" style="border-radius: 10px">
                            <h3 class="text-900 text-center my-5">Entreprise</h3>
                            <!-- <img src="/demo/images/landing/enterprise.svg" class="w-10 h-10 mx-auto" alt="enterprise" /> -->
                            <div class="my-5 text-center">
                                <span class="text-5xl font-bold mr-2 text-900">Entre em contacto</span>
                                <span class="text-600"></span>
                                <Button label="Obter Informações" class="block mx-auto mt-4 p-button-rounded border-none ml-3 font-light line-height-2 bg-blue-500 text-white"></Button>
                            </div>
                            <Divider class="w-full bg-surface-200"></Divider>
                            <ul class="my-5 list-none p-0 flex text-900 flex-column">
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">POS Retalho</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Módulo de Stock</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Facturação</span>
                                </li>
                                <li class="py-2">
                                    <i class="pi pi-fw pi-check text-xl text-green-500 mr-2"></i>
                                    <span class="text-xl line-height-3">Até 200 utilizadores</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="py-4 px-4 mx-0 mt-8 lg:mx-8">
                <div class="grid justify-content-between">
                    <div class="col-12 md:col-2" style="margin-top: -1.5rem">
                        <a @click="smoothScroll('#home')" class="flex flex-wrap align-items-center justify-content-center md:justify-content-start md:mb-0 mb-3 cursor-pointer">
                            <img :src="logoUrl" alt="footer sections" width="100" height="50" class="mr-2" />
                            <h4 class="font-medium text-3xl text-900"></h4>
                        </a>
                    </div>

                    <div class="col-12 md:col-10 lg:col-7">
                        <div class="grid text-center md:text-left">
                            <div class="col-12 md:col-3">
                                <h4 class="font-medium text-2xl line-height-3 mb-3 text-900">Empresa</h4>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Sobre Nós</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Nossa História</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Trabalhe Conosco</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Localização</a>
                                <a class="line-height-3 text-xl block cursor-pointer text-700">Contato</a>
                            </div>

                            <div class="col-12 md:col-3 mt-4 md:mt-0">
                                <h4 class="font-medium text-2xl line-height-3 mb-3 text-900">Vendas</h4>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Nossos Produtos</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Catálogo</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Orçamentos</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Promoções</a>
                                <a class="line-height-3 text-xl block cursor-pointer text-700">Formas de Pagamento</a>
                            </div>

                            <div class="col-12 md:col-3 mt-4 md:mt-0">
                                <h4 class="font-medium text-2xl line-height-3 mb-3 text-900">Pós-Vendas</h4>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Suporte Técnico</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Garantia</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Manual do Usuário</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Assistência</a>
                                <a class="line-height-3 text-xl block cursor-pointer text-700">Peças e Acessórios</a>
                            </div>

                            <div class="col-12 md:col-3 mt-4 md:mt-0">
                                <h4 class="font-medium text-2xl line-height-3 mb-3 text-900">Atendimento</h4>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Central de Ajuda</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">FAQ</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Chat Online</a>
                                <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Ouvidoria</a>
                                <a class="line-height-3 text-xl block cursor-pointer text-700">Política de Privacidade</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.p-tabview .p-tabview-nav {
    border-bottom: none !important;
    /* Se quiser remover todas as bordas */
    border: none !important;
}
.p-tabview-nav {
    justify-content: center !important;
}
</style>

<!-- <style scoped>
#hero {
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #eeefaf 0%, #c3e3fa 100%);
    height: 700px;
    overflow: hidden;
}

@media screen and (min-width: 768px) {
    #hero {
        -webkit-clip-path: ellipse(150% 87% at 93% 13%);
        clip-path: ellipse(150% 87% at 93% 13%);
        height: 530px;
    }
}

@media screen and (min-width: 1300px) {
    #hero > img {
        position: absolute;
    }

    #hero > div > p {
        max-width: 450px;
    }
}

@media screen and (max-width: 1300px) {
    #hero {
        height: 600px;
    }

    #hero > img {
        position: static;
        transform: scale(1);
        margin-left: auto;
    }

    #hero > div {
        width: 100%;
    }

    #hero > div > p {
        width: 100%;
        max-width: 100%;
    }
}
</style> -->
