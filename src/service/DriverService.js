import { baseURL } from './APIConstant';
import axios from 'axios';

export default class DriverService {
    static async getAllDrivers(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/drivers`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getDriverById(id) {
        const response = await axios.get(`${baseURL}/drivers/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createDriver(data) {
        const response = await axios.post(`${baseURL}/drivers`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateDriver(id, data) {
        const response = await axios.patch(`${baseURL}/drivers/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteDriver(id) {
        await axios.delete(`${baseURL}/drivers/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    static async restoreDriver(id) {
        const response = await axios.patch(`${baseURL}/drivers/${id}/restore`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
}
