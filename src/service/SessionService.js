import { baseURL } from './APIConstant';
import axios from 'axios';

export default class SessionService {
    static async getAllSessions(params = {}) {
        const response = await axios.get(`${baseURL}/sessions`, {
            params: params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getMySessions(params = {}) {
        const { page = 1, limit = 10 } = params;
        const response = await axios.get(`${baseURL}/sessions/my`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getSessionById(id) {
        const response = await axios.get(`${baseURL}/sessions/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async getSessionReport(params = {}) {
        const response = await axios.get(`${baseURL}/sessions/reports`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    static async createSession(data) {
        const response = await axios.post(`${baseURL}/sessions`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static async closeSession(id, data) {
        const response = await axios.post(`${baseURL}/sessions/${id}/close`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    static getSessionStatuses() {
        return [
            { label: 'Aberta', value: 'open' },
            { label: 'Fechada', value: 'closed' }
        ];
    }

    static getStatusSeverity(status) {
        switch (status) {
            case 'open': return 'success';
            case 'closed': return 'info';
            default: return 'secondary';
        }
    }

    static getStatusLabel(status) {
        const statuses = this.getSessionStatuses();
        const found = statuses.find(s => s.value === status);
        return found ? found.label : status;
    }
}