import { baseURL } from './APIConstant';
import axios from 'axios';

export default class PenaltyTicketSaleService {
    // Listar vendas de multa de uma sessão específica
    static async getPenaltyTicketSalesBySession(sessionId, params = {}) {
        const { page = 1, limit = 10 } = params;
        const response = await axios.get(`${baseURL}/penalty-ticket-sales/session/${sessionId}`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    // Obter relatório de vendas de multa de uma sessão
    static async getSessionReport(sessionId) {
        const response = await axios.get(`${baseURL}/penalty-ticket-sales/session/${sessionId}/report`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    // Listar todas as vendas de multa (ADMIN apenas)
    static async getAllPenaltyTicketSales(params = {}) {
        const response = await axios.get(`${baseURL}/penalty-ticket-sales`, {
            params: params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }

    // Obter detalhes de uma venda de multa específica
    static async getPenaltyTicketSaleById(id) {
        const response = await axios.get(`${baseURL}/penalty-ticket-sales/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
}
