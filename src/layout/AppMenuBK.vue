<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Principal',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/dashboard'
            }
        ]
    },
    {
        label: 'Operações',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            { 
                label: 'Sessões de Operação', 
                icon: 'pi pi-fw pi-calendar', 
                to: '/transport/sessions' 
            },
            { 
                label: 'Vendas de Bilhetes', 
                icon: 'pi pi-fw pi-shopping-cart', 
                to: '/transport/ticket-sales' 
            },
            { 
                label: 'Vendas de Multas', 
                icon: 'pi pi-fw pi-exclamation-triangle', 
                to: '/transport/penalty-ticket-sales' 
            }
        ]
    },
    {
        label: 'Rotas e Transportes',
        icon: 'pi pi-fw pi-map',
        items: [
            { 
                label: 'Rotas', 
                icon: 'pi pi-fw pi-map-marker', 
                to: '/transport/routes' 
            },
            { 
                label: 'Paragens', 
                icon: 'pi pi-fw pi-flag', 
                to: '/transport/route-stops' 
            },
            { 
                label: 'Categorias de Rotas', 
                icon: 'pi pi-fw pi-tag', 
                to: '/transport/route-categories' 
            }
        ]
    },
    {
        label: 'Bilhetes e Preços',
        icon: 'pi pi-fw pi-ticket',
        items: [
            { 
                label: 'Tipos de Bilhete', 
                icon: 'pi pi-fw pi-id-card', 
                to: '/transport/ticket-types' 
            },
            { 
                label: 'Preços por Rota', 
                icon: 'pi pi-fw pi-money-bill', 
                to: '/transport/route-tickets' 
            }
        ]
    },
    {
        label: 'Recursos',
        icon: 'pi pi-fw pi-th-large',
        items: [
            { 
                label: 'Veículos', 
                icon: 'pi pi-fw pi-car', 
                to: '/transport/vehicles' 
            },
            { 
                label: 'Motoristas', 
                icon: 'pi pi-fw pi-id-card', 
                to: '/transport/drivers' 
            },
            { 
                label: 'Turnos', 
                icon: 'pi pi-fw pi-clock', 
                to: '/transport/shifts' 
            }
        ]
    },
    {
        label: 'Administração',
        icon: 'pi pi-fw pi-cog',
        items: [
            { 
                label: 'Meu Perfil', 
                icon: 'pi pi-fw pi-user', 
                to: '/profile' 
            },
            { 
                label: 'Usuários', 
                icon: 'pi pi-fw pi-users', 
                to: '/users' 
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
