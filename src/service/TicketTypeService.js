import { baseURL } from './APIConstant';
import axios from 'axios';

export default class TicketTypeService {
    static async getAllTicketTypes(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/ticket-types`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getTicketTypeById(id) {
        const response = await axios.get(`${baseURL}/ticket-types/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createTicketType(data) {
        const response = await axios.post(`${baseURL}/ticket-types`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateTicketType(id, data) {
        const response = await axios.patch(`${baseURL}/ticket-types/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteTicketType(id) {
        await axios.delete(`${baseURL}/ticket-types/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }
}