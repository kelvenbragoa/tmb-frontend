import { baseURL } from './APIConstant';
import axios from 'axios';

export default class TicketSaleService {
    static async getAllTicketSales(params = {}) {
        const response = await axios.get(`${baseURL}/ticket-sales`, {
            params: params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getSessionSales(sessionId, params = {}) {
        const { page = 1, limit = 10 } = params;
        const response = await axios.get(`${baseURL}/sessions/${sessionId}/sales`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createSessionSale(sessionId, data) {
        const response = await axios.post(`${baseURL}/sessions/${sessionId}/sales`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async getTicketSaleById(id) {
        const response = await axios.get(`${baseURL}/ticket-sales/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
}