import { baseURL } from './APIConstant';
import axios from 'axios';

export default class RouteStopService {
    static async getAllRouteStops(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/route-stops`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getRouteStopsByRoute(routeId, params = {}) {
        const { page = 1, limit = 50 } = params;
        const response = await axios.get(`${baseURL}/route-stops/route/${routeId}`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getRouteStopById(id) {
        const response = await axios.get(`${baseURL}/route-stops/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createRouteStop(data) {
        const response = await axios.post(`${baseURL}/route-stops`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateRouteStop(id, data) {
        const response = await axios.patch(`${baseURL}/route-stops/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteRouteStop(id) {
        await axios.delete(`${baseURL}/route-stops/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    static async restoreRouteStop(id) {
        const response = await axios.patch(`${baseURL}/route-stops/${id}/restore`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
}