class CashSessionDemoService {
    constructor() {
        this.sessions = [
            {
                id: 1,
                session_number: 'CS-202410-0001',
                opening_balance: 100,
                closing_balance: null,
                expected_balance: 345.5,
                total_entries: 275.5,
                total_exits: 30,
                total_sales: 245.5,
                status: 'open',
                opened_at: '2024-10-07T08:00:00Z',
                closed_at: null,
                opening_notes: 'Abertura do caixa matutino',
                closing_notes: null,
                user: {
                    id: 1,
                    name: 'João Silva',
                    email: 'joao.silva@empresa.co.mz'
                },
                point_of_sale: {
                    id: 1,
                    name: 'Caixa Principal',
                    location: 'Loja Central'
                }
            },
            {
                id: 2,
                session_number: 'CS-202410-0002',
                opening_balance: 150,
                closing_balance: 420.75,
                expected_balance: 415.25,
                total_entries: 300.25,
                total_exits: 35,
                total_sales: 280.25,
                status: 'closed',
                opened_at: '2024-10-06T08:30:00Z',
                closed_at: '2024-10-06T18:15:00Z',
                opening_notes: 'Abertura normal',
                closing_notes: 'Fechamento com diferença de +5.50',
                user: {
                    id: 2,
                    name: 'Maria Santos',
                    email: 'maria.santos@empresa.co.mz'
                },
                point_of_sale: {
                    id: 1,
                    name: 'Caixa Principal',
                    location: 'Loja Central'
                }
            }
        ];

        this.movements = [
            {
                id: 1,
                cash_session_id: 1,
                movement_number: 'CM-20241007-0001',
                type: 'opening',
                category: 'opening_balance',
                amount: 100,
                balance_before: 0,
                balance_after: 100,
                description: 'Saldo inicial da sessão',
                notes: 'Abertura do caixa matutino',
                reference_type: null,
                reference_id: null,
                created_at: '2024-10-07T08:00:00Z',
                user: {
                    id: 1,
                    name: 'João Silva'
                }
            },
            {
                id: 2,
                cash_session_id: 1,
                movement_number: 'CM-20241007-0002',
                type: 'entry',
                category: 'sale',
                amount: 85.5,
                balance_before: 100,
                balance_after: 185.5,
                description: 'Venda em dinheiro',
                notes: 'Venda de produtos diversos',
                reference_type: 'sale',
                reference_id: 123,
                created_at: '2024-10-07T09:30:00Z',
                user: {
                    id: 1,
                    name: 'João Silva'
                }
            },
            {
                id: 3,
                cash_session_id: 1,
                movement_number: 'CM-20241007-0003',
                type: 'exit',
                category: 'other',
                amount: 15,
                balance_before: 185.5,
                balance_after: 170.5,
                description: 'Troco para cliente',
                notes: 'Troco da venda #123',
                reference_type: 'sale',
                reference_id: 123,
                created_at: '2024-10-07T09:31:00Z',
                user: {
                    id: 1,
                    name: 'João Silva'
                }
            }
        ];

        this.dashboardData = {
            summary: {
                active_sessions: 1,
                total_sessions_today: 3,
                total_cash_today: 1245.75,
                total_movements_today: 25,
                average_session_duration: '8h 30min'
            },
            recent_sessions: this.sessions.slice(0, 5),
            movement_categories: {
                sale: { count: 15, total: 1200.5 },
                payment_received: { count: 8, total: 350.25 },
                cash_deposit: { count: 3, total: 150 },
                cash_withdrawal: { count: 2, total: 200 },
                other: { count: 5, total: 75.5 }
            }
        };
    }

    delay(ms = 1000) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async openSession(sessionData) {
        await this.delay(1200);
        
        const activeSession = this.sessions.find((s) => s.status === 'open');
        if (activeSession) {
            throw new Error('Já existe uma sessão de caixa ativa.');
        }

        const newSession = {
            id: this.sessions.length + 1,
            session_number: `CS-202410-${String(this.sessions.length + 1).padStart(4, '0')}`,
            opening_balance: sessionData.opening_balance,
            closing_balance: null,
            expected_balance: sessionData.opening_balance,
            total_entries: 0,
            total_exits: 0,
            total_sales: 0,
            status: 'open',
            opened_at: new Date().toISOString(),
            closed_at: null,
            opening_notes: sessionData.opening_notes || '',
            closing_notes: null,
            user: {
                id: 1,
                name: 'João Silva',
                email: 'joao.silva@empresa.co.mz'
            },
            point_of_sale: {
                id: sessionData.point_of_sale_id,
                name: 'Caixa Principal',
                location: 'Loja Central'
            }
        };

        this.sessions.unshift(newSession);
        return newSession;
    }

    async closeSession(sessionId, closingData) {
        await this.delay(1500);
        
        const session = this.sessions.find((s) => s.id === parseInt(sessionId));
        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        if (session.status === 'closed') {
            throw new Error('Esta sessão já foi fechada');
        }

        session.closing_balance = closingData.closing_balance;
        session.status = 'closed';
        session.closed_at = new Date().toISOString();
        session.closing_notes = closingData.closing_notes || '';

        return {
            ...session,
            difference: closingData.closing_balance - session.expected_balance
        };
    }

    async getSessions(filters = {}) {
        await this.delay(800);
        
        let filteredSessions = [...this.sessions];

        if (filters.status) {
            filteredSessions = filteredSessions.filter((s) => s.status === filters.status);
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            filteredSessions = filteredSessions.filter((s) => new Date(s.opened_at) >= startDate);
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            filteredSessions = filteredSessions.filter((s) => new Date(s.opened_at) <= endDate);
        }

        return {
            data: filteredSessions,
            meta: {
                total: filteredSessions.length,
                per_page: 20,
                current_page: 1,
                last_page: Math.ceil(filteredSessions.length / 20)
            }
        };
    }

    async getActiveSession() {
        await this.delay(600);
        
        const activeSession = this.sessions.find((s) => s.status === 'open');
        if (!activeSession) {
            throw new Error('Nenhuma sessão ativa encontrada');
        }

        return activeSession;
    }

    async getSession(sessionId) {
        await this.delay(700);
        
        const session = this.sessions.find((s) => s.id === parseInt(sessionId));
        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        return session;
    }

    async getSessionMovements(sessionId, filters = {}) {
        await this.delay(900);
        
        let movements = this.movements.filter((m) => m.cash_session_id === parseInt(sessionId));

        if (filters.type) {
            movements = movements.filter((m) => m.type === filters.type);
        }

        if (filters.category) {
            movements = movements.filter((m) => m.category === filters.category);
        }

        return {
            data: movements,
            meta: {
                total: movements.length,
                per_page: 20,
                current_page: 1,
                last_page: Math.ceil(movements.length / 20)
            }
        };
    }

    async createMovement(sessionId, movementData) {
        await this.delay(1100);
        
        const session = this.sessions.find((s) => s.id === parseInt(sessionId));
        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        if (session.status === 'closed') {
            throw new Error('Não é possível criar movimentos em sessão fechada');
        }

        const sessionMovements = this.movements.filter((m) => m.cash_session_id === parseInt(sessionId));
        const currentBalance = sessionMovements.length > 0 ? sessionMovements[0].balance_after : session.opening_balance;

        const newBalance = movementData.type === 'entry' ? currentBalance + movementData.amount : currentBalance - movementData.amount;

        if (newBalance < 0) {
            throw new Error('Movimento resultaria em saldo negativo');
        }

        const newMovement = {
            id: this.movements.length + 1,
            cash_session_id: parseInt(sessionId),
            movement_number: `CM-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(this.movements.length + 1).padStart(4, '0')}`,
            type: movementData.type,
            category: movementData.category,
            amount: movementData.amount,
            balance_before: currentBalance,
            balance_after: newBalance,
            description: movementData.description,
            notes: movementData.notes || '',
            reference_type: null,
            reference_id: null,
            created_at: new Date().toISOString(),
            user: {
                id: 1,
                name: 'João Silva'
            }
        };

        this.movements.unshift(newMovement);

        if (movementData.type === 'entry') {
            session.total_entries += movementData.amount;
        } else {
            session.total_exits += movementData.amount;
        }
        
        session.expected_balance = newBalance;

        return newMovement;
    }

    async getSessionReport(sessionId) {
        await this.delay(1300);
        
        const session = this.sessions.find((s) => s.id === parseInt(sessionId));
        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        const movements = this.movements.filter((m) => m.cash_session_id === parseInt(sessionId));
        
        const categories = {};
        movements.forEach((movement) => {
            if (!categories[movement.category]) {
                categories[movement.category] = {
                    count: 0,
                    total: 0,
                    movements: []
                };
            }
            
            categories[movement.category].count++;
            categories[movement.category].total += movement.amount;
            categories[movement.category].movements.push(movement);
        });

        return {
            session,
            totals: {
                difference: session.closing_balance ? session.closing_balance - session.expected_balance : 0,
                total_entries: session.total_entries,
                total_exits: session.total_exits,
                movement_count: movements.length
            },
            categories,
            movements
        };
    }

    async getDashboardSummary() {
        await this.delay(1000);
        
        this.dashboardData.summary.total_cash_today += Math.random() * 50;
        this.dashboardData.summary.total_movements_today += Math.floor(Math.random() * 3);

        return this.dashboardData;
    }
}

export default new CashSessionDemoService();
