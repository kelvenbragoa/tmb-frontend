# 🏢 Configurações da Organização

## Visão Geral

A página de **Configurações da Organização** permite que administradores visualizem e atualizem todas as informações da organização, incluindo dados básicos, configurações regionais e preferências de notificação.

## Funcionalidades Implementadas

### ✅ Componentes Criados

1. **OrganizationService.js** - Serviço para integração com a API
2. **OrganizationSettings.vue** - Página principal de configurações
3. **OrganizationDemoService.js** - Serviço de demonstração com dados mock

### ✅ Recursos Implementados

#### 📊 Dashboard de Status
- **Status da Organização**: Ativo/Inativo
- **Plano Atual**: Free, Professional, Enterprise
- **Período de Avaliação**: Contagem regressiva
- **Status do Setup**: Concluído/Pendente

#### 📝 Informações Básicas
- Nome da organização
- NUIT (Número Único de Identificação Tributária)
- Endereço completo
- Cidade
- Telefone de contato
- Upload de logotipo da empresa

#### ⚙️ Configurações Regionais
- Tipo de negócio (Comércio, Restaurante, Serviços, etc.)
- Província de Moçambique
- Moeda (MZN, USD, EUR)
- Idioma (Português, Inglês)
- Fuso horário

#### 🔔 Preferências de Notificação
- Notificações por email
- Alertas de vendas
- Alertas de estoque baixo

#### 💳 Informações do Plano
- Detalhes do plano atual
- Limite de usuários
- Preço mensal
- Próxima cobrança
- Status do período de avaliação

## Arquitetura Técnica

### 🛠️ Tecnologias Utilizadas
- **Vue 3** com Composition API
- **PrimeVue** para componentes UI
- **Axios** para requisições HTTP
- **Vue Router** para navegação

### 📁 Estrutura de Arquivos

```
src/
├── service/
│   ├── OrganizationService.js      # Serviço principal da API
│   └── OrganizationDemoService.js  # Dados mock para demonstração
├── views/pages/organizations/
│   └── OrganizationSettings.vue    # Página de configurações
└── router/
    └── index.js                    # Rota adicionada
```

### 🔗 Endpoints da API Implementados

```javascript
// Buscar perfil da organização
GET /api/v1/organizations/profile

// Atualizar perfil da organização  
PATCH /api/v1/organizations/profile

// Buscar dashboard da organização
GET /api/v1/organizations/dashboard

// Buscar opções de configuração
GET /api/v1/organizations/config-options

// Completar setup inicial
POST /api/v1/organizations/complete-setup
```

## 🎯 Como Usar

### Acesso à Página
1. Faça login na aplicação
2. No menu lateral, vá em **Administração > Configurações da Organização**
3. Ou acesse diretamente: `/organization/settings`

### Navegação por Abas
A página é organizada em 4 abas principais:

1. **Informações Básicas**
   - Dados essenciais da empresa
   - Upload de logotipo

2. **Configurações**
   - Configurações regionais
   - Tipo de negócio

3. **Notificações**
   - Preferências de alertas
   - Configurações de email

4. **Plano**
   - Informações de cobrança
   - Detalhes da assinatura

### Modo Demonstração
- A página funciona com dados mock quando o backend não está disponível
- Banner azul indica quando está em modo demonstração
- Alterações são simuladas mas não persistidas

## 🔧 Configuração para Produção

### Ativar Integração com Backend
No arquivo `OrganizationSettings.vue`, altere:

```javascript
const isDemoMode = ref(false); // Alterar de true para false
```

### Configurar URLs da API
No arquivo `APIConstant.js`, certifique-se de que a `baseURL` está configurada corretamente:

```javascript
export const baseURL = 'https://sua-api.com/api/v1';
```

## 🎨 Personalização Visual

### Temas Suportados
- Todos os temas do PrimeVue são suportados
- Layout responsivo para desktop e mobile
- Ícones do PrimeIcons

### Customização de Cores
Os componentes seguem o sistema de design do PrimeVue e podem ser personalizados através de CSS customizado ou alteração do tema.

## 🧪 Validações Implementadas

### Campos Obrigatórios
- Nome da organização

### Validações Específicas
- **NUIT**: Deve ter exatamente 9 dígitos
- **Telefone**: Formato internacional (+258 XX XXX XXXX)
- **Logo**: URL válida ou upload de arquivo (máx. 2MB)
- **Email**: Formato válido para notificações

### Mensagens de Erro
- Validação em tempo real
- Toasts informativos para sucesso/erro
- Indicadores visuais de campos obrigatórios

## 🔍 Funcionalidades Avançadas

### Upload de Logo
- Suporte para JPG, PNG, GIF
- Preview em tempo real
- Limite de 2MB por arquivo
- Fallback para URLs externas

### Cálculos Automáticos
- Formatação de moeda baseada na região
- Contagem regressiva do período de trial
- Badges dinâmicos de status

### Experiência do Usuário
- Loading states durante requisições
- Formulário auto-preenchido
- Botão "Restaurar" para reverter alterações
- Feedback visual para todas as ações

## 🚀 Próximos Passos

### Melhorias Planejadas
- [ ] Histórico de alterações
- [ ] Backup/restore de configurações
- [ ] Integração com sistema de billing
- [ ] Notificações push
- [ ] Multi-tenancy avançado

### Integrações Futuras
- [ ] Sistema de relatórios
- [ ] Analytics de uso
- [ ] Conformidade fiscal
- [ ] Sincronização com ERP

## 📞 Suporte

Para dúvidas sobre implementação ou uso da funcionalidade:

1. Consulte a documentação da API
2. Verifique os logs do console para erros
3. Teste primeiro em modo demonstração
4. Entre em contato com a equipe de desenvolvimento

---

**Versão**: 1.0.0  
**Última Atualização**: 6 de outubro de 2025  
**Desenvolvido com**: ❤️ para o sistema Dynamis