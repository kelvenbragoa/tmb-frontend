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

class ProductService {
    // Listar todos os produtos
    async getAllProducts(params = {}) {
        try {
            const response = await axios.get(`${baseURL}/products`, {
                headers: getAuthHeaders(),
                params: {
                    page: params.page || 1,
                    limit: params.limit || 100,
                    search: params.search || '',
                    category: params.category || '',
                    status: params.status || 'active'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            throw error;
        }
    }

    // Buscar produto por ID
    async getProductById(id) {
        try {
            const response = await axios.get(`${baseURL}/products/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar produto ${id}:`, error);
            throw error;
        }
    }

    // Buscar produtos ativos (para dropdowns)
    async getActiveProducts() {
        try {
            const response = await axios.get(`${baseURL}/products`, {
                headers: getAuthHeaders(),
                params: {
                    status: 'active',
                    limit: 1000 // Buscar todos os produtos ativos
                }
            });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Erro ao buscar produtos ativos:', error);
            throw error;
        }
    }

    // Criar novo produto
    async createProduct(productData) {
        try {
            const response = await axios.post(`${baseURL}/products`, productData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw error;
        }
    }

    // Atualizar produto
    async updateProduct(id, productData) {
        try {
            const response = await axios.patch(`${baseURL}/products/${id}`, productData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar produto ${id}:`, error);
            throw error;
        }
    }

    // Deletar produto
    async deleteProduct(id) {
        try {
            const response = await axios.delete(`${baseURL}/products/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar produto ${id}:`, error);
            throw error;
        }
    }

    // Métodos legados para compatibilidade
    getProductsSmall() {
        return this.getAllProducts({ limit: 10 });
    }

    getProducts() {
        return this.getAllProducts({ limit: 50 });
    }

    getProductsMixed() {
        return this.getAllProducts({ limit: 100 });
    }

    getProductsWithOrdersSmall() {
        return this.getAllProducts({ limit: 10 });
    }

    getProductsWithOrdersLarge() {
        return this.getAllProducts({ limit: 100 });
    }
}

export default new ProductService();
