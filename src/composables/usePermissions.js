import { ref, computed } from 'vue';

export function usePermissions() {
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

    // Verificar se o usuário tem um dos roles especificados
    const hasRole = (roles) => {
        if (!roles || roles.length === 0) return true;
        return roles.includes(userRole.value);
    };

    // Verificar se o usuário é admin
    const isAdmin = computed(() => userRole.value === 'admin');

    // Verificar se o usuário é coordenador
    const isCoordenador = computed(() => userRole.value === 'coordenador');

    // Verificar se o usuário é gestor (apenas visualização)
    const isGestor = computed(() => userRole.value === 'gestor');

    // Permissões específicas
    const permissions = computed(() => ({
        // Permissões de CRUD
        canCreate: hasRole(['admin', 'coordenador']),
        canEdit: hasRole(['admin', 'coordenador']),
        canDelete: hasRole(['admin']),
        canView: true, // Se está na página, pode ver

        // Permissões operacionais
        canManageSessions: hasRole(['admin', 'coordenador', 'caixa', 'supervisor']),
        canSellTickets: hasRole(['admin', 'coordenador', 'cobrador', 'caixa']),
        canSellPenaltyTickets: hasRole(['admin', 'coordenador', 'supervisor']),
        
        // Permissões administrativas
        canManageUsers: hasRole(['admin']),
        canManageRoutes: hasRole(['admin', 'coordenador']),
        canManageResources: hasRole(['admin', 'coordenador']),
        canManagePrices: hasRole(['admin', 'coordenador']),
        
        // Permissões de relatórios
        canViewReports: hasRole(['admin', 'coordenador', 'gestor']),
        canExportReports: hasRole(['admin', 'coordenador']),
    }));

    return {
        user,
        userRole,
        hasRole,
        isAdmin,
        isCoordenador,
        isGestor,
        permissions
    };
}
