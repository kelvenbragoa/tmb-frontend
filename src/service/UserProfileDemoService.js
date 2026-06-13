class UserProfileDemoService {
    constructor() {
        this.profile = {
            user: {
                id: 1,
                name: 'João Carlos Silva',
                email: 'joao.silva@empresa.co.mz',
                email_verified_at: '2024-01-15T10:30:00Z',
                username: 'joao.silva',
                status: 'active',
                created_at: '2024-01-01T08:00:00Z',
                updated_at: '2024-01-15T14:20:00Z',
                last_login_at: '2024-01-15T09:15:00Z'
            },
            profile: {
                id: 1,
                user_id: 1,
                first_name: 'João Carlos',
                last_name: 'Silva',
                mobile: '+258 84 123 4567',
                address: 'Rua da Paz, 123, Maputo',
                birth_date: '1985-06-15',
                gender: 'M',
                bio: 'Profissional de TI com mais de 10 anos de experiência em desenvolvimento de sistemas.',
                avatar: null,
                settings: {
                    language: 'pt',
                    timezone: 'Africa/Maputo',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                },
                created_at: '2024-01-01T08:00:00Z',
                updated_at: '2024-01-15T14:20:00Z'
            },
            activity: [
                {
                    id: 1,
                    type: 'profile_update',
                    description: 'Perfil atualizado',
                    created_at: '2024-01-15T14:20:00Z'
                },
                {
                    id: 2,
                    type: 'login',
                    description: 'Login realizado',
                    created_at: '2024-01-15T09:15:00Z'
                },
                {
                    id: 3,
                    type: 'password_change',
                    description: 'Senha alterada',
                    created_at: '2024-01-10T16:30:00Z'
                }
            ]
        };

        this.organization = {
            id: 1,
            name: 'Empresa Moçambicana Lda',
            type: 'private',
            size: 'medium',
            industry: 'technology',
            logo: null,
            email: 'info@empresa.co.mz',
            phone: '+258 21 123 456',
            website: 'https://empresa.co.mz',
            address: {
                street: 'Av. Julius Nyerere, 789',
                city: 'Maputo',
                state: 'Maputo',
                postal_code: '1100',
                country: 'Moçambique'
            },
            established_date: '2015-03-20',
            nuit: '123456789',
            status: 'active',
            created_at: '2015-03-20T08:00:00Z',
            updated_at: '2024-01-10T11:45:00Z'
        };

        this.dashboard = {
            profile_completeness: 85,
            total_logins: 342,
            last_login: '2024-01-15T09:15:00Z',
            account_age_days: 15,
            activities_count: 23,
            organization_role: 'Administrator',
            permissions: ['profile.view', 'profile.edit', 'organization.view', 'organization.edit', 'users.manage'],
            recent_activities: [
                {
                    id: 1,
                    type: 'profile_update',
                    description: 'Informações pessoais atualizadas',
                    ip_address: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    created_at: '2024-01-15T14:20:00Z'
                },
                {
                    id: 2,
                    type: 'login',
                    description: 'Login realizado com sucesso',
                    ip_address: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    created_at: '2024-01-15T09:15:00Z'
                },
                {
                    id: 3,
                    type: 'organization_update',
                    description: 'Configurações da organização alteradas',
                    ip_address: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    created_at: '2024-01-14T16:45:00Z'
                }
            ],
            stats: {
                total_purchases: 45,
                total_sales: 123,
                total_customers: 89,
                total_invoices: 234
            }
        };
    }

    // Simular delay de API
    delay(ms = 1000) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Visualizar meu perfil completo
    async getMyProfile() {
        await this.delay(800);
        return this.profile;
    }

    // Atualizar meu perfil
    async updateMyProfile(profileData) {
        await this.delay(1200);
        
        // Simular atualização
        if (profileData.first_name) {
            this.profile.profile.first_name = profileData.first_name;
        }
        if (profileData.last_name) {
            this.profile.profile.last_name = profileData.last_name;
        }
        if (profileData.mobile) {
            this.profile.profile.mobile = profileData.mobile;
        }
        if (profileData.address) {
            this.profile.profile.address = profileData.address;
        }
        if (profileData.bio) {
            this.profile.profile.bio = profileData.bio;
        }
        if (profileData.settings) {
            this.profile.profile.settings = { ...this.profile.profile.settings, ...profileData.settings };
        }
        
        // Atualizar data de modificação
        this.profile.profile.updated_at = new Date().toISOString();
        
        // Adicionar atividade
        this.profile.activity.unshift({
            id: this.profile.activity.length + 1,
            type: 'profile_update',
            description: 'Perfil atualizado',
            created_at: new Date().toISOString()
        });

        return this.profile;
    }

    // Alterar senha
    async changePassword(passwordData) {
        await this.delay(1500);
        
        // Simular validação
        if (passwordData.current_password !== 'senha123') {
            throw new Error('Senha atual incorreta');
        }
        
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            throw new Error('Nova senha e confirmação não coincidem');
        }
        
        if (passwordData.new_password.length < 6) {
            throw new Error('Nova senha deve ter pelo menos 6 caracteres');
        }
        
        // Adicionar atividade
        this.profile.activity.unshift({
            id: this.profile.activity.length + 1,
            type: 'password_change',
            description: 'Senha alterada com sucesso',
            created_at: new Date().toISOString()
        });

        return {
            message: 'Senha alterada com sucesso',
            status: 'success'
        };
    }

    // Visualizar minha organização
    async getMyOrganization() {
        await this.delay(600);
        return this.organization;
    }

    // Dashboard do perfil
    async getProfileDashboard() {
        await this.delay(900);
        
        // Atualizar estatísticas em tempo real
        this.dashboard.total_logins += Math.floor(Math.random() * 3);
        this.dashboard.activities_count += Math.floor(Math.random() * 2);
        
        return this.dashboard;
    }

    // Simular erro de rede
    simulateNetworkError() {
        throw new Error('Erro de conexão com o servidor');
    }

    // Simular erro de autorização
    simulateAuthError() {
        throw new Error('Token de autenticação inválido ou expirado');
    }

    // Simular erro de validação
    simulateValidationError() {
        throw new Error('Email já está em uso por outro usuário');
    }
}

export default new UserProfileDemoService();