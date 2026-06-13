import { baseURL } from './APIConstant';
import axios from 'axios';

export default class RouteTicketService {
    static async getAllRouteTickets(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const response = await axios.get(`${baseURL}/route-tickets`, {
            params: { page, limit, search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getRouteTicketById(id) {
        const response = await axios.get(`${baseURL}/route-tickets/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createRouteTicket(data) {
        const response = await axios.post(`${baseURL}/route-tickets`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async updateRouteTicket(id, data) {
        const response = await axios.patch(`${baseURL}/route-tickets/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async deleteRouteTicket(id) {
        await axios.delete(`${baseURL}/route-tickets/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }
}