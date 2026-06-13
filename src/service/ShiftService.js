import { baseURL } from './APIConstant';
import axios from 'axios';

export default class ShiftService {
    static async getAllShifts(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/shifts`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getShiftById(id) {
        const response = await axios.get(`${baseURL}/shifts/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createShift(data) {
        const response = await axios.post(`${baseURL}/shifts`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateShift(id, data) {
        const response = await axios.patch(`${baseURL}/shifts/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteShift(id) {
        await axios.delete(`${baseURL}/shifts/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    static async restoreShift(id) {
        const response = await axios.patch(`${baseURL}/shifts/${id}/restore`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
}
