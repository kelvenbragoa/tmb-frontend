# Quotation API Documentation

## Overview
O sistema de cotações permite criar, gerenciar e acompanhar orçamentos para clientes. Cada cotação possui itens detalhados, cálculos automáticos de impostos e descontos, e controle de status.

## Endpoints Disponíveis

### 1. Criar Cotação
```http
POST /v1/quotations
Content-Type: application/json
Authorization: Bearer <token>

{
  "costumer_id": 1,
  "quotation_date": "2024-01-15",
  "expiry_date": "2024-01-30",
  "tax_rate": 10.5,
  "discount_rate": 5.0,
  "notes": "Cotação para produtos eletrônicos",
  "terms_and_conditions": "Válida até a data de vencimento",
  "items": [
    {
      "product_id": 1,
      "description": "Notebook Dell",
      "quantity": 2,
      "unit_price": 2500.00,
      "discount_rate": 5.0
    },
    {
      "description": "Mouse Wireless",
      "quantity": 3,
      "unit_price": 85.00
    }
  ]
}
```

### 2. Listar Cotações
```http
GET /v1/quotations?page=1&limit=10&status=draft&search=notebook
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `status`: Filtrar por status (`draft`, `sent`, `accepted`, `rejected`, `expired`)
- `costumer_id`: Filtrar por cliente
- `search`: Buscar por número da cotação ou nome do cliente

### 3. Buscar Cotação por ID
```http
GET /v1/quotations/1
Authorization: Bearer <token>
```

### 4. Atualizar Cotação
```http
PATCH /v1/quotations/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "sent",
  "notes": "Cotação enviada para cliente",
  "items": [
    {
      "product_id": 1,
      "description": "Notebook Dell Atualizado",
      "quantity": 1,
      "unit_price": 2800.00
    }
  ]
}
```

### 5. Atualizar Status da Cotação
```http
PATCH /v1/quotations/1/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "accepted"
}
```

### 6. Duplicar Cotação
```http
POST /v1/quotations/1/duplicate
Authorization: Bearer <token>
```

### 7. Excluir Cotação
```http
DELETE /v1/quotations/1
Authorization: Bearer <token>
```

## Status da Cotação

- `draft`: Rascunho - cotação em edição
- `sent`: Enviada - cotação enviada para o cliente
- `accepted`: Aceita - cliente aceitou a cotação
- `rejected`: Rejeitada - cliente rejeitou a cotação
- `expired`: Expirada - cotação passou da data de validade

## Cálculos Automáticos

O sistema calcula automaticamente:
- **Subtotal**: Soma de todos os itens (quantidade × preço unitário - desconto do item)
- **Desconto Global**: Pode ser por percentual ou valor fixo
- **Impostos**: Aplicados após o desconto sobre o subtotal
- **Total Final**: Subtotal - Desconto + Impostos

## Multi-tenancy

Todas as operações são isoladas por organização. Usuários só podem:
- Ver cotações da sua organização
- Criar cotações para clientes da sua organização
- Editar/excluir apenas suas próprias cotações

## Regras de Negócio

1. **Numeração Automática**: Se não informado, o sistema gera automaticamente no formato `COT-AAAAMM-0001`
2. **Edição**: Cotações aceitas não podem ser editadas ou excluídas
3. **Exclusão**: Apenas cotações não aceitas podem ser excluídas (soft delete)
4. **Validação**: Cliente deve existir e pertencer à organização do usuário
5. **Itens**: Cada cotação deve ter pelo menos 1 item
6. **Datas**: Data de validade deve ser posterior à data da cotação

## Exemplos de Resposta

### Cotação Criada
```json
{
  "id": 1,
  "quotation_number": "COT-202401-0001",
  "status": "draft",
  "quotation_date": "2024-01-15T00:00:00.000Z",
  "expiry_date": "2024-01-30T00:00:00.000Z",
  "subtotal": 4755.00,
  "tax_rate": 10.5,
  "tax_amount": 499.28,
  "discount_rate": 5.0,
  "discount_amount": 237.75,
  "total": 5016.53,
  "costumer": {
    "id": 1,
    "name": "Cliente Exemplo"
  },
  "items": [
    {
      "id": 1,
      "description": "Notebook Dell",
      "quantity": 2,
      "unit_price": 2500.00,
      "discount_rate": 5.0,
      "discount_amount": 250.00,
      "line_total": 4750.00,
      "product": {
        "id": 1,
        "name": "Notebook Dell Inspiron"
      }
    }
  ],
  "createdByUser": {
    "id": 1,
    "name": "Usuário Admin"
  }
}
```

### Lista Paginada
```json
{
  "items": [...],
  "meta": {
    "itemCount": 2,
    "totalItems": 25,
    "itemsPerPage": 10,
    "totalPages": 3,
    "currentPage": 1
  },
  "links": {
    "first": "...",
    "previous": "",
    "next": "...",
    "last": "..."
  }
}
```