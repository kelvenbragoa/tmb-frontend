import { baseURL } from './APIConstant';
import axios from 'axios';

class UserProfileService {
    // Configurar headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    }

    // Visualizar meu perfil completo
    async getMyProfile() {
        try {
            const response = await axios.get(`${baseURL}/users/profile/me`, { headers: this.getAuthHeaders() });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Atualizar meu perfil
    async updateMyProfile(profileData) {
        try {
            const response = await axios.patch(`${baseURL}/users/profile/me`, profileData, { headers: this.getAuthHeaders() });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Alterar senha
    async changePassword(passwordData) {
        try {
            const response = await axios.post(`${baseURL}/users/profile/change-password`, passwordData, { headers: this.getAuthHeaders() });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Visualizar minha organização (se disponível)
    async getMyOrganization() {
        try {
            const response = await axios.get(`${baseURL}/profile/organization`, { headers: this.getAuthHeaders() });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Dashboard do perfil (se disponível)
    async getProfileDashboard() {
        try {
            const response = await axios.get(`${baseURL}/profile/dashboard`, { headers: this.getAuthHeaders() });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Utilitários
    validateEmail(email) {
        if (!email || !email.trim()) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim()) && email.length <= 255;
    }

    validatePassword(password) {
        if (!password) return false;
        // Pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password) && password.length <= 255;
    }

    validatePhone(phone) {
        if (!phone) return true; // Telefone é opcional
        
        // Remove espaços e caracteres especiais
        const cleaned = phone.replace(/[\s\-()]/g, '');
        
        // Formatos aceitos: +258841234567, 841234567, +55119876543210
        const phoneRegex = /^(\+?[1-9]\d{1,3})?[1-9]\d{7,14}$/;
        return phoneRegex.test(cleaned) && cleaned.length >= 8 && cleaned.length <= 18;
    }

    validateName(name) {
        if (!name || !name.trim()) return false;
        const trimmed = name.trim();
        // Apenas letras, espaços, hífens e apostrofes
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
        return nameRegex.test(trimmed) && trimmed.length >= 2 && trimmed.length <= 50;
    }

    validateAddress(address) {
        if (!address) return true; // Endereço é opcional
        const trimmed = address.trim();
        return trimmed.length >= 5 && trimmed.length <= 255;
    }

    validateBio(bio) {
        if (!bio) return true; // Bio é opcional
        const trimmed = bio.trim();
        return trimmed.length <= 500;
    }

    validateBirthDate(birthDate) {
        if (!birthDate) return true; // Data de nascimento é opcional
        
        const date = new Date(birthDate);
        const now = new Date();
        const minAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
        const maxAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
        
        return date >= minAge && date <= maxAge;
    }

    getPasswordValidationErrors(password) {
        const errors = [];
        
        if (!password) {
            errors.push('Senha é obrigatória');
            return errors;
        }
        
        if (password.length < 8) {
            errors.push('Deve ter pelo menos 8 caracteres');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Deve conter pelo menos uma letra minúscula');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Deve conter pelo menos uma letra maiúscula');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Deve conter pelo menos um número');
        }
        
        if (password.length > 255) {
            errors.push('Deve ter no máximo 255 caracteres');
        }
        
        return errors;
    }

    getPhoneValidationErrors(phone) {
        const errors = [];
        
        if (!phone) return errors; // Telefone é opcional
        
        const cleaned = phone.replace(/[\s\-()]/g, '');
        
        if (cleaned.length < 8) {
            errors.push('Telefone deve ter pelo menos 8 dígitos');
        }
        
        if (cleaned.length > 18) {
            errors.push('Telefone deve ter no máximo 18 dígitos');
        }
        
        if (!/^(\+?[1-9]\d{1,3})?[1-9]\d{7,14}$/.test(cleaned)) {
            errors.push('Formato de telefone inválido');
        }
        
        return errors;
    }

    // Formatação de dados
    formatPhoneNumber(phone) {
        if (!phone) return '';
        
        // Remove caracteres especiais
        const cleaned = phone.replace(/\D/g, '');
        
        // Formata para padrão brasileiro se for número nacional
        if (cleaned.length === 11) {
            return `+55 ${cleaned.substr(0, 2)} ${cleaned.substr(2, 5)}-${cleaned.substr(7)}`;
        } else if (cleaned.length === 10) {
            return `+55 ${cleaned.substr(0, 2)} ${cleaned.substr(2, 4)}-${cleaned.substr(6)}`;
        }
        
        return phone;
    }

    formatAccountAge(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} dias`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} ${months === 1 ? 'mês' : 'meses'}`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} ${years === 1 ? 'ano' : 'anos'}`;
        }
    }

    getProfileCompleteness(user, profile) {
        let completeness = 0;
        const fields = [user?.name, user?.email, profile?.first_name, profile?.last_name, profile?.mobile, profile?.address];
        
        fields.forEach((field) => {
            if (field && field.trim().length > 0) {
                completeness += 100 / fields.length;
            }
        });
        
        return Math.round(completeness);
    }

    getActivityTypeLabel(type) {
        const typeMap = {
            profile_update: 'Perfil atualizado',
            password_change: 'Senha alterada',
            login: 'Login realizado',
            logout: 'Logout realizado',
            organization_update: 'Organização atualizada'
        };
        return typeMap[type] || type;
    }

    getActivityIcon(type) {
        const iconMap = {
            profile_update: 'pi-user-edit',
            password_change: 'pi-lock',
            login: 'pi-sign-in',
            logout: 'pi-sign-out',
            organization_update: 'pi-building'
        };
        return iconMap[type] || 'pi-info-circle';
    }

    formatLastLogin(lastLoginAt) {
        if (!lastLoginAt) return 'Nunca';
        
        const now = new Date();
        const lastLogin = new Date(lastLoginAt);
        const diffTime = Math.abs(now - lastLogin);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 60) {
            return `${diffMinutes} minutos atrás`;
        } else if (diffHours < 24) {
            return `${diffHours} horas atrás`;
        } else if (diffDays < 7) {
            return `${diffDays} dias atrás`;
        } else {
            return lastLogin.toLocaleDateString('pt-BR');
        }
    }

    // Tratamento de erros
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    if (Array.isArray(data.message)) {
                        throw new Error(data.message.join(', '));
                    }
                    throw new Error(data.message || 'Dados inválidos fornecidos');
                case 401:
                    throw new Error('Token de autenticação inválido ou expirado');
                case 403:
                    throw new Error('Você não tem permissão para executar esta operação');
                case 404:
                    throw new Error('Recurso não encontrado');
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

export default new UserProfileService();