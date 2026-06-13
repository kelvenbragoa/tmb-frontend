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

class SupplierService {
    // Listar todos os fornecedores
    async getAllSuppliers(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/suppliers`, {
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
            console.error('Erro ao buscar fornecedores:', error);
            throw error;
        }
    }

    // Buscar fornecedor por ID
    async getSupplierById(id) {
        try {
            const response = await axios.get(`${baseURL}/suppliers/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar fornecedor ${id}:`, error);
            throw error;
        }
    }

    // Criar novo fornecedor
    async createSupplier(supplierData) {
        try {
            const response = await axios.post(`${baseURL}/suppliers`, supplierData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar fornecedor:', error);
            throw error;
        }
    }

    // Atualizar fornecedor
    async updateSupplier(id, supplierData) {
        try {
            const response = await axios.patch(`${baseURL}/suppliers/${id}`, supplierData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar fornecedor ${id}:`, error);
            throw error;
        }
    }

    // Deletar fornecedor
    async deleteSupplier(id) {
        try {
            const response = await axios.delete(`${baseURL}/suppliers/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar fornecedor ${id}:`, error);
            throw error;
        }
    }

    // Buscar fornecedores ativos (para dropdowns)
    async getActiveSuppliers() {
        try {
            const response = await axios.get(`${baseURL}/suppliers`, {
                headers: getAuthHeaders(),
                params: {
                    status: 'active',
                    limit: 1000 // Buscar todos os fornecedores ativos
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar fornecedores ativos:', error);
            throw error;
        }
    }

    // Métodos legados para compatibilidade (podem ser removidos posteriormente)
    getSuppliersSmall() {
        return this.getAllSuppliers({ limit: 10 });
    }

    getSuppliersMedium() {
        return this.getAllSuppliers({ limit: 50 });
    }

    getSuppliersLarge() {
        return this.getAllSuppliers({ limit: 100 });
    }
}

export default new SupplierService();
