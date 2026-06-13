import { baseURL } from './APIConstant';
import axios from 'axios';

class UserService {
    // Configurar headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    }

    // Listar todos os usuários
    async getAllUsers(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/users`, {
                headers: this.getAuthHeaders(),
                params: {
                    page: params.page || 1,
                    limit: params.limit || 50,
                    query: params.query || '',
                    ...params
                }
            });
            return response.data.data || response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obter usuário por ID
    async getUserById(id) {
        try {
            const response = await axios.get(`${baseURL}/users/${id}`, {
                headers: this.getAuthHeaders()
            });
            return response.data.data || response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Criar usuário
    async createUser(userData) {
        try {
            const response = await axios.post(`${baseURL}/users`, userData, {
                headers: this.getAuthHeaders()
            });
            return response.data.data || response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Atualizar usuário
    async updateUser(id, userData) {
        try {
            const response = await axios.put(`${baseURL}/users/${id}`, userData, {
                headers: this.getAuthHeaders()
            });
            return response.data.data || response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Excluir usuário
    async deleteUser(id) {
        try {
            const response = await axios.delete(`${baseURL}/users/${id}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
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
                    throw new Error('Usuário não encontrado');
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

export default new UserService();
