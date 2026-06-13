import { baseURL } from './APIConstant';
import axios from 'axios';

class OrganizationService {
    // Configurar headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    }

    // Visualizar perfil da organização
    async getOrganizationProfile() {
        try {
            const response = await axios.get(`${baseURL}/organizations/profile`, { headers: this.getAuthHeaders() });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Atualizar perfil da organização
    async updateOrganizationProfile(updateData) {
        try {
            const response = await axios.patch(`${baseURL}/organizations/profile`, updateData, { headers: this.getAuthHeaders() });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Dashboard da organização
    async getOrganizationDashboard() {
        try {
            const response = await axios.get(`${baseURL}/organizations/dashboard`, { headers: this.getAuthHeaders() });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Opções de configuração
    async getConfigOptions() {
        try {
            const response = await axios.get(`${baseURL}/organizations/config-options`, { headers: this.getAuthHeaders() });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Completar setup (legado)
    async completeSetup(setupData) {
        try {
            const response = await axios.post(`${baseURL}/organizations/complete-setup`, setupData, { headers: this.getAuthHeaders() });
            return response.data.organization;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Upload de logo
    async uploadLogo(file) {
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await axios.post(`${baseURL}/organizations/upload-logo`, formData, {
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Utilitários
    formatCurrency(amount, currencyCode = 'MZN') {
        if (!amount) return 'MZN 0,00';
        
        const currencyMap = {
            MZN: 'pt-MZ',
            USD: 'en-US',
            EUR: 'pt-PT'
        };

        const locale = currencyMap[currencyCode] || 'pt-MZ';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode
        }).format(amount);
    }

    formatTrialExpiry(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'Expirado';
        } else if (diffDays === 0) {
            return 'Expira hoje';
        } else if (diffDays === 1) {
            return 'Expira amanhã';
        } else {
            return `${diffDays} dias restantes`;
        }
    }

    getStatusBadge(isActive) {
        return {
            severity: isActive ? 'success' : 'danger',
            value: isActive ? 'Ativa' : 'Inativa'
        };
    }

    getPlanBadge(planName) {
        const planMap = {
            Free: { severity: 'info', label: 'Gratuito' },
            Professional: { severity: 'success', label: 'Profissional' },
            Enterprise: { severity: 'warning', label: 'Empresarial' }
        };
        
        return planMap[planName] || { severity: 'secondary', label: planName };
    }

    // Validações
    validateNUIT(nuit) {
        if (!nuit) return true; // NUIT é opcional
        
        // Remove espaços e caracteres especiais
        const cleanNuit = nuit.replace(/\D/g, '');
        
        // NUIT deve ter 9 dígitos
        if (cleanNuit.length !== 9) {
            return 'NUIT deve ter 9 dígitos';
        }
        
        return true;
    }

    validatePhone(phone) {
        if (!phone) return true; // Telefone é opcional
        
        // Formato: +258 XX XXX XXXX ou similar
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return 'Formato de telefone inválido';
        }
        
        return true;
    }

    validateURL(url) {
        if (!url) return true; // URL é opcional
        
        try {
            new URL(url);
            return true;
        } catch {
            return 'URL inválida';
        }
    }

    // Tratamento de erros
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    throw new Error(data.message || 'Usuário não tem organização associada');
                case 404:
                    throw new Error('Organização não encontrada');
                case 422: {
                    const errors = data.errors || [];
                    throw new Error(errors.join(', ') || 'Dados de validação inválidos');
                }
                case 401:
                    throw new Error('Token de autenticação inválido ou expirado');
                case 403:
                    throw new Error('Você não tem permissão para executar esta operação');
                case 500:
                    throw new Error('Erro interno do servidor');
                default:
                    throw new Error(data.message || 'Erro desconhecido');
            }
        } else if (error.request) {
            throw new Error('Erro de conexão com o servidor');
        } else {
            throw new Error(error.message || 'Erro desconhecido');
        }
    }
}

export default new OrganizationService();
