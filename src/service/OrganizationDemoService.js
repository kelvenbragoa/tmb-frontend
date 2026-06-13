import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import OrganizationService from '@/service/OrganizationService';

// Mock data para demonstração quando o backend não estiver disponível
const mockOrganization = {
    id: 1,
    name: "Dynamis Solutions Lda",
    nuit: "123456789",
    address: "Avenida Julius Nyerere, 1234, Maputo",
    city: "Maputo",
    mobile: "+258 84 123 4567",
    logo: "https://via.placeholder.com/200x100/007bff/ffffff?text=DYNAMIS",
    trial_expires_at: "2025-12-31T23:59:59Z",
    is_active: 1,
    email_notifications: true,
    sales_alerts: true,
    inventory_alerts: false,
    setup_completed: true,
    setup_completed_at: "2025-10-01T10:00:00Z",
    plan: {
        id: 2,
        name: "Professional",
        user_limit: 50,
        monthly_price: 2500
    },
    businessType: {
        id: 2,
        name: "Comércio Retalhista",
        code: "retail",
        description: "Venda direta ao consumidor"
    },
    province: {
        id: 1,
        name: "Maputo Cidade",
        code: "maputo_city"
    },
    currency: {
        id: 1,
        name: "Metical Moçambicano",
        code: "MZN",
        symbol: "MT"
    },
    language: {
        id: 1,
        name: "Português",
        code: "pt"
    },
    timezone: {
        id: 1,
        name: "Africa/Maputo",
        description: "Maputo, Moçambique"
    },
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2025-10-06T15:30:00Z"
};

const mockConfigOptions = {
    businessTypes: [
        {
            id: 1,
            name: "Comércio Grossista",
            code: "wholesale",
            description: "Venda para revenda"
        },
        {
            id: 2,
            name: "Comércio Retalhista",
            code: "retail",
            description: "Venda direta ao consumidor"
        },
        {
            id: 3,
            name: "Restaurante",
            code: "restaurant",
            description: "Serviços de alimentação"
        },
        {
            id: 4,
            name: "Serviços",
            code: "services",
            description: "Prestação de serviços"
        }
    ],
    provinces: [
        {
            id: 1,
            name: "Maputo Cidade",
            code: "maputo_city"
        },
        {
            id: 2,
            name: "Maputo Província",
            code: "maputo_province"
        },
        {
            id: 3,
            name: "Gaza",
            code: "gaza"
        },
        {
            id: 4,
            name: "Inhambane",
            code: "inhambane"
        },
        {
            id: 5,
            name: "Sofala",
            code: "sofala"
        },
        {
            id: 6,
            name: "Manica",
            code: "manica"
        },
        {
            id: 7,
            name: "Tete",
            code: "tete"
        },
        {
            id: 8,
            name: "Zambézia",
            code: "zambezia"
        },
        {
            id: 9,
            name: "Nampula",
            code: "nampula"
        },
        {
            id: 10,
            name: "Cabo Delgado",
            code: "cabo_delgado"
        },
        {
            id: 11,
            name: "Niassa",
            code: "niassa"
        }
    ],
    currencies: [
        {
            id: 1,
            name: "Metical Moçambicano",
            code: "MZN",
            symbol: "MT"
        },
        {
            id: 2,
            name: "Dólar Americano",
            code: "USD",
            symbol: "$"
        },
        {
            id: 3,
            name: "Euro",
            code: "EUR",
            symbol: "€"
        }
    ],
    languages: [
        {
            id: 1,
            name: "Português",
            code: "pt"
        },
        {
            id: 2,
            name: "English",
            code: "en"
        }
    ],
    timezones: [
        {
            id: 1,
            name: "Africa/Maputo",
            description: "Maputo, Moçambique (UTC+2)"
        }
    ],
    plans: [
        {
            id: 1,
            name: "Free",
            user_limit: 5,
            monthly_price: 0
        },
        {
            id: 2,
            name: "Professional",
            user_limit: 50,
            monthly_price: 2500
        },
        {
            id: 3,
            name: "Enterprise",
            user_limit: 200,
            monthly_price: 7500
        }
    ]
};

// Hook personalizado para usar dados mock ou real
export const useOrganizationDemo = () => {
    const toast = useToast();
    const useMockData = ref(true); // Altere para false quando o backend estiver disponível

    const loadOrganizationProfile = async () => {
        if (useMockData.value) {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockOrganization;
        } else {
            return await OrganizationService.getOrganizationProfile();
        }
    };

    const loadConfigOptions = async () => {
        if (useMockData.value) {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 800));
            return mockConfigOptions;
        } else {
            return await OrganizationService.getConfigOptions();
        }
    };

    const updateOrganizationProfile = async (updateData) => {
        if (useMockData.value) {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simular atualização dos dados mock
            Object.assign(mockOrganization, updateData);
            
            toast.add({
                severity: 'success',
                summary: 'Demo Mode',
                detail: 'Dados salvos em modo demonstração (não persistidos)',
                life: 4000
            });
            
            return mockOrganization;
        } else {
            return await OrganizationService.updateOrganizationProfile(updateData);
        }
    };

    const uploadLogo = async (file) => {
        if (useMockData.value) {
            // Simular upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Criar URL temporária para preview
            const mockUrl = URL.createObjectURL(file);
            
            toast.add({
                severity: 'info',
                summary: 'Demo Mode',
                detail: 'Logo carregado em modo demonstração',
                life: 3000
            });
            
            return { url: mockUrl };
        } else {
            return await OrganizationService.uploadLogo(file);
        }
    };

    return {
        useMockData,
        loadOrganizationProfile,
        loadConfigOptions,
        updateOrganizationProfile,
        uploadLogo,
        mockOrganization,
        mockConfigOptions
    };
};

export default {
    mockOrganization,
    mockConfigOptions,
    useOrganizationDemo
};