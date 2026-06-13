import axios from 'axios';
import { baseURL } from './APIConstant';

// Configurar headers padrão para autenticação
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

class CustomerService {
    // Listar todos os clientes
    async getAllCustomers(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/costumers`, {
                headers: getAuthHeaders(),
                params: {
                    page: params.page || 1,
                    limit: params.limit || 100,
                    search: params.search || '',
                    status: params.status || ''
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw error;
        }
    }

    // Buscar cliente por ID
    async getCustomerById(id) {
        try {
            const response = await axios.get(`${baseURL}/costumers/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cliente ${id}:`, error);
            throw error;
        }
    }

    // Buscar cliente por número
    async getCustomerByNumber(customerNumber) {
        try {
            const response = await axios.get(`${baseURL}/costumers/by-number/${customerNumber}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cliente por número ${customerNumber}:`, error);
            throw error;
        }
    }

    // Criar novo cliente
    async createCustomer(customerData) {
        try {
            const response = await axios.post(`${baseURL}/costumers`, customerData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            throw error;
        }
    }

    // Atualizar cliente
    async updateCustomer(id, customerData) {
        try {
            const response = await axios.patch(`${baseURL}/costumers/${id}`, customerData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar cliente ${id}:`, error);
            throw error;
        }
    }

    // Deletar cliente
    async deleteCustomer(id) {
        try {
            const response = await axios.delete(`${baseURL}/costumers/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar cliente ${id}:`, error);
            throw error;
        }
    }

    // Buscar clientes ativos (para dropdowns)
    async getActiveCustomers() {
        try {
            const response = await axios.get(`${baseURL}/costumers`, {
                headers: getAuthHeaders(),
                params: {
                    status: 'active',
                    limit: 1000 // Buscar todos os clientes ativos
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar clientes ativos:', error);
            throw error;
        }
    }

    // Métodos legados para compatibilidade (podem ser removidos posteriormente)
    getCustomersSmall() {
        return this.getAllCustomers({ limit: 10 });
    }

    getCustomersMedium() {
        return this.getAllCustomers({ limit: 50 });
    }

    getCustomersLarge() {
        return this.getAllCustomers({ limit: 100 });
    }
}

export default new CustomerService();
