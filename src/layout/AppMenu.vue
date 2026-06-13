<script setup>
import { ref, computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

// Obter dados do usuário do storage
const getUserData = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        return null;
    }
};

const user = ref(getUserData());
const userRole = computed(() => user.value?.role || null);


// Função para verificar se o item deve ser exibido
const shouldShowItem = (item) => {
    if (!item.roles) return true; // Se não tem restrição, mostra para todos
    return item.roles.includes(userRole.value);
};

const allMenuItems = ref([
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
        roles: ['admin', 'coordenador', 'caixa', 'cobrador', 'supervisor'],
        items: [
            { 
                label: 'Sessões de Operação', 
                icon: 'pi pi-fw pi-calendar', 
                to: '/transport/sessions',
                roles: ['admin', 'coordenador', 'caixa', 'supervisor']
            },
            { 
                label: 'Vendas de Bilhetes', 
                icon: 'pi pi-fw pi-shopping-cart', 
                to: '/transport/ticket-sales',
                roles: ['admin', 'coordenador', 'cobrador', 'caixa']
            },
            { 
                label: 'Vendas de Multas', 
                icon: 'pi pi-fw pi-exclamation-triangle', 
                to: '/transport/penalty-ticket-sales',
                roles: ['admin', 'coordenador', 'supervisor']
            }
        ]
    },
    {
        label: 'Rotas e Transportes',
        icon: 'pi pi-fw pi-map',
        roles: ['admin', 'coordenador'],
        items: [
            { 
                label: 'Categorias de Rotas', 
                icon: 'pi pi-fw pi-tag', 
                to: '/transport/route-categories',
                roles: ['admin', 'coordenador']
            },
            { 
                label: 'Rotas', 
                icon: 'pi pi-fw pi-map-marker', 
                to: '/transport/routes',
                roles: ['admin', 'coordenador']
            },
            { 
                label: 'Paragens', 
                icon: 'pi pi-fw pi-flag', 
                to: '/transport/route-stops',
                roles: ['admin', 'coordenador']
            }
            
        ]
    },
    {
        label: 'Bilhetes e Preços',
        icon: 'pi pi-fw pi-ticket',
        roles: ['admin', 'coordenador'],
        items: [
            { 
                label: 'Tipos de Bilhete', 
                icon: 'pi pi-fw pi-id-card', 
                to: '/transport/ticket-types',
                roles: ['admin', 'coordenador']
            },
            { 
                label: 'Preços por Rota', 
                icon: 'pi pi-fw pi-money-bill', 
                to: '/transport/route-tickets',
                roles: ['admin', 'coordenador']
            }
        ]
    },
    {
        label: 'Recursos',
        icon: 'pi pi-fw pi-th-large',
        roles: ['admin', 'coordenador'],
        items: [
            { 
                label: 'Veículos', 
                icon: 'pi pi-fw pi-car', 
                to: '/transport/vehicles',
                roles: ['admin', 'coordenador']
            },
            { 
                label: 'Motoristas', 
                icon: 'pi pi-fw pi-id-card', 
                to: '/transport/drivers',
                roles: ['admin', 'coordenador']
            },
            { 
                label: 'Turnos', 
                icon: 'pi pi-fw pi-clock', 
                to: '/transport/shifts',
                roles: ['admin', 'coordenador']
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
                to: '/users',
                roles: ['admin']
            }
        ]
    }
]);

// Computed para filtrar menus baseado no role
const model = computed(() => {
    return allMenuItems.value
        .filter(section => shouldShowItem(section))
        .map(section => ({
            ...section,
            items: section.items?.filter(item => shouldShowItem(item))
        }))
        .filter(section => !section.items || section.items.length > 0);
});
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
