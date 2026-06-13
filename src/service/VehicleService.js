import { baseURL } from './APIConstant';
import axios from 'axios';

export default class VehicleService {
    static async getAllVehicles(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/vehicles`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getActiveVehicles(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/vehicles/active`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getVehiclesByRoute(routeId, params = {}) {
        const { page = 1, limit = 10 } = params;
        const response = await axios.get(`${baseURL}/vehicles/route/${routeId}`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getVehicleById(id) {
        const response = await axios.get(`${baseURL}/vehicles/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createVehicle(data) {
        const response = await axios.post(`${baseURL}/vehicles`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateVehicle(id, data) {
        const response = await axios.patch(`${baseURL}/vehicles/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteVehicle(id) {
        await axios.delete(`${baseURL}/vehicles/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    static async addRouteToVehicle(vehicleId, routeId) {
        await axios.post(`${baseURL}/vehicles/${vehicleId}/routes/${routeId}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    static async removeRouteFromVehicle(vehicleId, routeId) {
        await axios.delete(`${baseURL}/vehicles/${vehicleId}/routes/${routeId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }
}