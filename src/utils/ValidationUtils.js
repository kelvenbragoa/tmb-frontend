/**
 * Utilitários de validação centralizados
 * Contém todas as regras de validação usadas na aplicação
 */

export class ValidationUtils {
    // Validação de email
    static validateEmail(email) {
        if (!email || !email.trim()) return { valid: false, message: 'Email é obrigatório' };
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return { valid: false, message: 'Formato de email inválido' };
        }
        
        if (email.length > 255) {
            return { valid: false, message: 'Email deve ter no máximo 255 caracteres' };
        }
        
        return { valid: true, message: '' };
    }

    // Validação de senha
    static validatePassword(password) {
        if (!password) {
            return { valid: false, message: 'Senha é obrigatória' };
        }

        const errors = [];
        
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

        return {
            valid: errors.length === 0,
            message: errors.join(', '),
            errors
        };
    }

    // Validação de telefone
    static validatePhone(phone) {
        if (!phone) return { valid: true, message: '' }; // Telefone é opcional
        
        const cleaned = phone.replace(/[\s\-()]/g, '');
        
        if (cleaned.length < 8) {
            return { valid: false, message: 'Telefone deve ter pelo menos 8 dígitos' };
        }
        
        if (cleaned.length > 18) {
            return { valid: false, message: 'Telefone deve ter no máximo 18 dígitos' };
        }
        
        const phoneRegex = /^(\+?[1-9]\d{1,3})?[1-9]\d{7,14}$/;
        if (!phoneRegex.test(cleaned)) {
            return { valid: false, message: 'Formato de telefone inválido' };
        }
        
        return { valid: true, message: '' };
    }

    // Validação de nome
    static validateName(name) {
        if (!name || !name.trim()) {
            return { valid: false, message: 'Nome é obrigatório' };
        }
        
        const trimmed = name.trim();
        
        if (trimmed.length < 2) {
            return { valid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
        }
        
        if (trimmed.length > 50) {
            return { valid: false, message: 'Nome deve ter no máximo 50 caracteres' };
        }
        
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
        if (!nameRegex.test(trimmed)) {
            return { valid: false, message: 'Nome deve conter apenas letras, espaços, hífens e apostrofes' };
        }
        
        return { valid: true, message: '' };
    }

    // Validação de endereço
    static validateAddress(address) {
        if (!address) return { valid: true, message: '' }; // Endereço é opcional
        
        const trimmed = address.trim();
        
        if (trimmed.length < 5) {
            return { valid: false, message: 'Endereço deve ter pelo menos 5 caracteres' };
        }
        
        if (trimmed.length > 255) {
            return { valid: false, message: 'Endereço deve ter no máximo 255 caracteres' };
        }
        
        return { valid: true, message: '' };
    }

    // Validação de biografia
    static validateBio(bio) {
        if (!bio) return { valid: true, message: '' }; // Bio é opcional
        
        const trimmed = bio.trim();
        
        if (trimmed.length > 500) {
            return { valid: false, message: 'Biografia deve ter no máximo 500 caracteres' };
        }
        
        return { valid: true, message: '' };
    }

    // Validação de data de nascimento
    static validateBirthDate(birthDate) {
        if (!birthDate) return { valid: true, message: '' }; // Data é opcional
        
        const date = new Date(birthDate);
        const now = new Date();
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
            return { valid: false, message: 'Data de nascimento inválida' };
        }
        
        // Verificar idade mínima (13 anos)
        const minAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
        if (date > minAge) {
            return { valid: false, message: 'Idade mínima é 13 anos' };
        }
        
        // Verificar idade máxima (120 anos)
        const maxAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
        if (date < maxAge) {
            return { valid: false, message: 'Idade máxima é 120 anos' };
        }
        
        return { valid: true, message: '' };
    }

    // Validação de confirmação de senha
    static validatePasswordConfirmation(password, confirmation) {
        if (!confirmation) {
            return { valid: false, message: 'Confirmação de senha é obrigatória' };
        }
        
        if (password !== confirmation) {
            return { valid: false, message: 'As senhas não coincidem' };
        }
        
        return { valid: true, message: '' };
    }

    // Verificar se senha contém informações pessoais
    static validatePasswordPersonalInfo(password, personalInfo = []) {
        if (!password) return { valid: true, message: '' };
        
        const passwordLower = password.toLowerCase();
        const hasPersonalInfo = personalInfo
            .filter(Boolean)
            .filter(info => info.length > 2)
            .some(info => passwordLower.includes(info.toLowerCase()));
        
        if (hasPersonalInfo) {
            return { valid: false, message: 'A senha não deve conter informações pessoais' };
        }
        
        return { valid: true, message: '' };
    }

    // Verificar se nova senha é diferente da atual
    static validatePasswordDifferent(currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            return { valid: true, message: '' };
        }
        
        if (currentPassword === newPassword) {
            return { valid: false, message: 'A nova senha deve ser diferente da senha atual' };
        }
        
        return { valid: true, message: '' };
    }

    // Cálculo de força da senha
    static calculatePasswordStrength(password) {
        if (!password) return { score: 0, label: '', color: 'danger' };
        
        let score = 0;
        
        // Critérios de força
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;
        
        const strengthMap = {
            0: { label: 'Muito Fraca', color: 'danger' },
            1: { label: 'Fraca', color: 'danger' },
            2: { label: 'Regular', color: 'warning' },
            3: { label: 'Boa', color: 'info' },
            4: { label: 'Forte', color: 'success' },
            5: { label: 'Muito Forte', color: 'success' }
        };
        
        return { score, ...strengthMap[score] };
    }

    // Formatação de telefone
    static formatPhone(phone) {
        if (!phone) return '';
        
        // Remove caracteres especiais
        const cleaned = phone.replace(/\D/g, '');
        
        // Formatos para Moçambique
        if (cleaned.startsWith('258')) {
            const number = cleaned.substring(3);
            if (number.length === 9) {
                return `+258 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
            }
        } else if (cleaned.length === 9 && cleaned.startsWith('8')) {
            return `+258 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
        }
        
        // Formato brasileiro
        if (cleaned.startsWith('55')) {
            const number = cleaned.substring(2);
            if (number.length === 11) {
                return `+55 ${number.substring(0, 2)} ${number.substring(2, 7)} ${number.substring(7)}`;
            }
        }
        
        return phone;
    }

    // Limpeza de telefone para armazenamento
    static cleanPhone(phone) {
        if (!phone) return '';
        return phone.replace(/[\s\-()]/g, '');
    }

    // Validação em lote de um objeto
    static validateObject(obj, rules) {
        const errors = {};
        let isValid = true;
        
        Object.keys(rules).forEach((field) => {
            const rule = rules[field];
            const value = obj[field];
            
            if (typeof rule === 'function') {
                const result = rule(value);
                if (!result.valid) {
                    errors[field] = result.message;
                    isValid = false;
                }
            } else if (Array.isArray(rule)) {
                // Múltiplas validações para o mesmo campo
                for (const validator of rule) {
                    const result = validator(value);
                    if (!result.valid) {
                        errors[field] = result.message;
                        isValid = false;
                        break;
                    }
                }
            }
        });
        
        return { isValid, errors };
    }

    // Debounce para validação em tempo real
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

export default ValidationUtils;