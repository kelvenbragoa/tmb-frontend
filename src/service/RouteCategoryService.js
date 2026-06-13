import { baseURL } from './APIConstant';
import axios from 'axios';

export default class RouteCategoryService {
    static async getAllRouteCategories(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/route-categories`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getRouteCategoryById(id) {
        const response = await axios.get(`${baseURL}/route-categories/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createRouteCategory(data) {
        const response = await axios.post(`${baseURL}/route-categories`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateRouteCategory(id, data) {
        const response = await axios.patch(`${baseURL}/route-categories/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteRouteCategory(id) {
        await axios.delete(`${baseURL}/route-categories/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    static async restoreRouteCategory(id) {
        const response = await axios.patch(`${baseURL}/route-categories/${id}/restore`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
}