import { baseURL } from './APIConstant';
import axios from 'axios';

export default class RouteService {
    static async getAllRoutes(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/routes`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getRouteById(id) {
        const response = await axios.get(`${baseURL}/routes/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createRoute(data) {
        const response = await axios.post(`${baseURL}/routes`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateRoute(id, data) {
        const response = await axios.patch(`${baseURL}/routes/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteRoute(id) {
        await axios.delete(`${baseURL}/routes/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    static async getRouteTickets(id) {
        const response = await axios.get(`${baseURL}/routes/${id}/tickets`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getRouteVehicles(id, params = {}) {
        const { page = 1, limit = 10 } = params;
        const response = await axios.get(`${baseURL}/routes/${id}/vehicles`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
}