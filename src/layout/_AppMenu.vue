<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        // label: 'Home',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/dashboard'
            },
            {
                label: 'Gestão Comercial',
                icon: 'pi pi-fw pi-tag',
                items: [
                    { label: 'Painel', icon: 'pi pi-fw pi-chart-bar', to: '/pos/reports' },
                    { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/costumers' },
                    { label: 'Fornecedores', icon: 'pi pi-fw pi-truck', to: '/suppliers' },
                    // { label: 'Entidades', icon: 'pi pi-fw pi-users', to: '/sales' },
                    { label: 'Pontos de Venda', icon: 'pi pi-fw pi-table', to: '/point-of-sale' },
                    { label: 'Artigo & Serviço', icon: 'pi pi-fw pi-paperclip', to: '/products' },
                    {
                        label: 'Vendas',
                        icon: 'pi pi-fw pi-tag',
                        items: [
                            { label: 'Cotação', icon: 'pi pi-fw pi-circle', to: '/sales/quotations' },
                            { label: 'Fatura', icon: 'pi pi-fw pi-circle', to: '/sales/invoices' },
                            { label: 'Guia de Remessa', icon: 'pi pi-fw pi-circle', to: '/sales/delivery-notes' },
                            { label: 'Nota de Crédito', icon: 'pi pi-fw pi-circle', to: '/sales/credit-notes' },
                            { label: 'Nota de Débito', icon: 'pi pi-fw pi-circle', to: '/sales/debit-notes' },
                            { label: 'Recibo de Adiantamento', icon: 'pi pi-fw pi-circle', to: '/sales/advance-receipts' },
                            { label: 'Venda a Dinheiro', icon: 'pi pi-fw pi-circle', to: '/sales/cash-sales' },
                            { label: 'Recibo', icon: 'pi pi-fw pi-circle', to: '/sales/receipts' }
                        ]
                    },
                    {
                        label: 'Compras',
                        icon: 'pi pi-fw pi-shopping-cart',
                        items: [
                            { label: 'Adiantamento ao fornecedor', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Compra a dinheiro', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Factura de compra', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Nota de crédito', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Nota de débito', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Ordem de compra', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Pagamento ao fornecedor', icon: 'pi pi-fw pi-circle', to: '/sales' }
                        ]
                    },
                    {
                        label: 'Documentos Internos',
                        icon: 'pi pi-fw pi-file',
                        items: [
                            { label: 'Entrada de stock', icon: 'pi pi-fw pi-circle', to: '/stock-movement/entry' },
                            { label: 'Saída de stock', icon: 'pi pi-fw pi-circle', to: '/stock-movement/out' },
                            { label: 'Transferência de stock', icon: 'pi pi-fw pi-circle', to: '/stock-movement/transfer' },
                            { label: 'Ajuste de stock', icon: 'pi pi-fw pi-circle', to: '/stock-movement/inventory' }
                        ]
                    },
                    {
                        label: 'Tesouraria',
                        icon: 'pi pi-fw pi-wallet',
                        items: [
                            { label: 'Conta de tesouraria', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Depósito', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Levantamento', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Transferência', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Despesa', icon: 'pi pi-fw pi-circle', to: '/sales' }
                        ]
                    },
                    {
                        label: 'Relatórios',
                        icon: 'pi pi-fw pi-database',
                        items: [
                            { label: 'Documentos', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Pagamentos', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Documentos pendentes', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Artigos', icon: 'pi pi-fw pi-circle', to: '/sales' },
                            { label: 'Despesas', icon: 'pi pi-fw pi-circle', to: '/sales' }
                        ]
                    },
                    {
                        label: 'Configurações',
                        icon: 'pi pi-fw pi-cog',
                        items: [
                            { label: 'Região', icon: 'pi pi-fw pi-circle', to: '/settings/regions' },
                            { label: 'Câmbio', icon: 'pi pi-fw pi-circle', to: '/settings/exchange-rates' },
                            { label: 'IVA', icon: 'pi pi-fw pi-circle', to: '/settings/taxes' },
                            { label: 'Armazém', icon: 'pi pi-fw pi-circle', to: '/settings/warehouses' },
                            { label: 'Tipo de documento', icon: 'pi pi-fw pi-circle', to: '/settings/document-types' },
                            { label: 'Modelo de impressão', icon: 'pi pi-fw pi-circle', to: '/settings/print-templates' },
                            { label: 'Método de pagamento', icon: 'pi pi-fw pi-circle', to: '/settings/payment-methods' },
                            { label: 'Série de facturação', icon: 'pi pi-fw pi-circle', to: '/settings/invoice-series' }
                        ]
                    }
                ]
            },
            {
                label: 'POS',
                icon: 'pi pi-fw pi-desktop',
                items: [
                    { label: 'Interface de retalho', icon: 'pi pi-fw pi-chart-bar', to: '/pos' },
                    { label: 'Turno', icon: 'pi pi-fw pi-cog', to: '/shift' },
                    { label: 'Pontos de Venda', icon: 'pi pi-fw pi-table', to: '/point-of-sale' },
                    { label: 'Relatórios', icon: 'pi pi-fw pi-wallet', to: '/pos/reports' }
                ]
            },
            { label: 'Gestão de usuários', icon: 'pi pi-fw pi-users', to: '/users' },
            // { label: 'Empresa', icon: 'pi pi-fw pi-building', to: '/company' },
            {
                label: 'Pagamentos e subscrições',
                icon: 'pi pi-fw pi-credit-card',
                items: [
                    { label: 'Adiantamentos', icon: 'pi pi-fw pi-money-bill', to: '/payments/methods' },
                    { label: 'Histórico de pagamentos', icon: 'pi pi-fw pi-history', to: '/payments/history' },
                    { label: 'Subscrições', icon: 'pi pi-fw pi-file', to: '/payments/subscriptions' }
                ]
            }
        ]
    },
    // {
    //     // label: 'Produtos',
    //     items: [
    //         { label: 'Categorias', icon: 'pi pi-fw pi-tags', to: '/categories' },
    //         // { label: 'SubCategorias', icon: 'pi pi-fw pi-sitemap', to: '/subcategories' },
    //         // { label: 'Produtos', icon: 'pi pi-fw pi-box', to: '/products' }
    //     ]
    // },
    {
        // label: 'Clientes e Mesas',
        // items: [
        //     { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/costumers' },
        //     { label: 'Pontos de Venda', icon: 'pi pi-fw pi-table', to: '/point-of-sale' }
        // ]
        // },
        // {
        //     label: 'UI Components',
        //     items: [
        //         { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
        //         { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
        //         { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', to: '/uikit/floatlabel' },
        //         { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', to: '/uikit/invalidstate' },
        //         { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
        //         { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
        //         { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
        //         { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
        //         { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
        //         { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
        //         { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
        //         { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu', preventExact: true },
        //         { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
        //         { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
        //         { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
        //         { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
        //     ]
        // },
        // {
        //     label: 'Prime Blocks',
        //     items: [
        //         { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', to: '/blocks', badge: 'NEW' },
        //         { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: 'https://www.primefaces.org/primeblocks-vue', target: '_blank' }
        //     ]
        // },
        // {
        //     label: 'Utilities',
        //     items: [
        //         { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', to: '/utilities/icons' },
        //         { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: 'https://www.primefaces.org/primeflex/', target: '_blank' }
        //     ]
        // },
        // {
        //     label: 'Pages',
        //     icon: 'pi pi-fw pi-briefcase',
        //     to: '/pages',
        //     items: [
        //         {
        //             label: 'Landing',
        //             icon: 'pi pi-fw pi-globe',
        //             to: '/landing'
        //         },
        //         {
        //             label: 'Auth',
        //             icon: 'pi pi-fw pi-user',
        //             items: [
        //                 {
        //                     label: 'Login',
        //                     icon: 'pi pi-fw pi-sign-in',
        //                     to: '/auth/login'
        //                 },
        //                 {
        //                     label: 'Error',
        //                     icon: 'pi pi-fw pi-times-circle',
        //                     to: '/auth/error'
        //                 },
        //                 {
        //                     label: 'Access Denied',
        //                     icon: 'pi pi-fw pi-lock',
        //                     to: '/auth/access'
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Crud',
        //             icon: 'pi pi-fw pi-pencil',
        //             to: '/pages/crud'
        //         },
        //         {
        //             label: 'Timeline',
        //             icon: 'pi pi-fw pi-calendar',
        //             to: '/pages/timeline'
        //         },
        //         {
        //             label: 'Not Found',
        //             icon: 'pi pi-fw pi-exclamation-circle',
        //             to: '/pages/notfound'
        //         },
        //         {
        //             label: 'Empty',
        //             icon: 'pi pi-fw pi-circle-off',
        //             to: '/pages/empty'
        //         }
        //     ]
        // },
        // {
        //     label: 'Hierarchy',
        //     items: [
        //         {
        //             label: 'Submenu 1',
        //             icon: 'pi pi-fw pi-bookmark',
        //             items: [
        //                 {
        //                     label: 'Submenu 1.1',
        //                     icon: 'pi pi-fw pi-bookmark',
        //                     items: [
        //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
        //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
        //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
        //                     ]
        //                 },
        //                 {
        //                     label: 'Submenu 1.2',
        //                     icon: 'pi pi-fw pi-bookmark',
        //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Submenu 2',
        //             icon: 'pi pi-fw pi-bookmark',
        //             items: [
        //                 {
        //                     label: 'Submenu 2.1',
        //                     icon: 'pi pi-fw pi-bookmark',
        //                     items: [
        //                         { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
        //                         { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
        //                     ]
        //                 },
        //                 {
        //                     label: 'Submenu 2.2',
        //                     icon: 'pi pi-fw pi-bookmark',
        //                     items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
        //                 }
        //             ]
        //         }
        //     ]
        // },
        // {
        //     label: 'Get Started',
        //     items: [
        //         {
        //             label: 'Documentation',
        //             icon: 'pi pi-fw pi-question',
        //             to: '/documentation'
        //         },
        //         {
        //             label: 'Figma',
        //             url: 'https://www.dropbox.com/scl/fi/bhfwymnk8wu0g5530ceas/sakai-2023.fig?rlkey=u0c8n6xgn44db9t4zkd1brr3l&dl=0',
        //             icon: 'pi pi-fw pi-pencil',
        //             target: '_blank'
        //         },
        //         {
        //             label: 'View Source',
        //             icon: 'pi pi-fw pi-search',
        //             url: 'https://github.com/primefaces/sakai-vue',
        //             target: '_blank'
        //         },
        //         {
        //             label: 'Nuxt Version',
        //             url: 'https://github.com/primefaces/sakai-nuxt',
        //             icon: 'pi pi-fw pi-star'
        //         }
        //     ]
        // }
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
        <!-- <li>
            <a href="https://www.primefaces.org/primeblocks-vue/#/" target="_blank">
                <img src="/layout/images/banner-primeblocks.png" alt="Prime Blocks" class="w-full mt-3" />
            </a>
        </li> -->
    </ul>
</template>

<style lang="scss" scoped></style>
