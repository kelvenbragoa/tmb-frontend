import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/dashboard',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/myorganization',
                    name: 'myorganization',
                    component: () => import('@/views/pages/organizations/IndexOrganization.vue')
                },
                {
                    path: '/organization/settings',
                    name: 'organization.settings',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/organizations/OrganizationSettings.vue')
                },
                {
                    path: '/profile',
                    name: 'user.profile',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/UserProfile.vue')
                },
                {
                    path: '/pos/reports',
                    name: 'pos.reports',
                    component: () => import('@/views/pages/pos/IndexPosReport.vue')
                },
                {
                    path: '/pos',
                    name: 'pos',
                    component: () => import('@/views/pages/pos/IndexPos.vue')
                },
                {
                    path: '/categories',
                    name: '.categories',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/categories/IndexCategories.vue')
                },
                {
                    path: '/categories/create',
                    name: 'categories.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/categories/CreateCategories.vue')
                },
                {
                    path: '/categories/:id',
                    name: 'categories.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/categories/ShowCategories.vue')
                },
                {
                    path: '/categories/:id/edit',
                    name: 'categories.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/categories/EditCategories.vue')
                },

                {
                    path: '/users',
                    name: '.users',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/users/IndexUsers.vue')
                },
                {
                    path: '/users/create',
                    name: 'users.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/users/CreateUsers.vue')
                },
                {
                    path: '/users/:id',
                    name: 'users.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/users/ShowUsers.vue')
                },
                {
                    path: '/users/:id/edit',
                    name: 'users.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/users/EditUsers.vue')
                },

                {
                    path: '/shift',
                    name: '.shift',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/shift/IndexShift.vue')
                },
                {
                    path: '/shift/create',
                    name: 'shift.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/shift/CreateShift.vue')
                },
                {
                    path: '/shift/:id',
                    name: 'shift.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/shift/ShowShift.vue')
                },
                {
                    path: '/shift/:id/edit',
                    name: 'shift.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/shift/EditShift.vue')
                },


                {
                    path: '/costumers',
                    name: 'costumers.index',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumers/IndexCustomers.vue')
                },
                {
                    path: '/costumers/create',
                    name: 'costumers.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumers/CreateEditCustomers.vue')
                },
                {
                    path: '/costumers/:id',
                    name: 'costumers.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumers/ShowCustomers.vue')
                },
                {
                    path: '/costumers/:id/edit',
                    name: 'costumers.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumers/CreateEditCustomers.vue')
                },

                {
                    path: '/costumer-category',
                    name: '.costumer-category',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumer-category/IndexCostumerCategory.vue')
                },
                {
                    path: '/costumer-category/create',
                    name: 'costumer-category.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumer-category/CreateCostumerCategory.vue')
                },
                {
                    path: '/costumer-category/:id',
                    name: 'costumer-category.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumer-category/ShowCostumerCategory.vue')
                },
                {
                    path: '/costumer-category/:id/edit',
                    name: 'costumer-category.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/costumer-category/EditCostumerCategory.vue')
                },


                {
                    path: '/products',
                    name: '.products',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/products/IndexProducts.vue')
                },
                {
                    path: '/products/create',
                    name: 'products.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/products/CreateProducts.vue')
                },
                {
                    path: '/products/:id',
                    name: 'products.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/products/ShowProducts.vue')
                },
                {
                    path: '/products/:id/edit',
                    name: 'products.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/products/EditProducts.vue')
                },


                {
                    path: '/point-of-sale',
                    name: 'point-of-sale.index',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/point-of-sale/IndexPointOfSales.vue')
                },
                {
                    path: '/point-of-sale/create',
                    name: 'point-of-sale.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/point-of-sale/CreatePointOfSales.vue')
                },
                {
                    path: '/point-of-sale/:id',
                    name: 'point-of-sale.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/point-of-sale/ShowPointOfSales.vue')
                },
                {
                    path: '/point-of-sale/:id/edit',
                    name: 'point-of-sale.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/point-of-sale/EditPointOfSales.vue')
                },
                {
                    path: '/suppliers',
                    name: '.suppliers',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers/IndexSuppliers.vue')
                },
                {
                    path: '/suppliers/create',
                    name: 'suppliers.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers/CreateSuppliers.vue')
                },
                {
                    path: '/suppliers/:id',
                    name: 'suppliers.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers/ShowSuppliers.vue')
                },
                {
                    path: '/suppliers/:id/edit',
                    name: 'suppliers.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers/EditSuppliers.vue')
                },

                {
                    path: '/suppliers/category',
                    name: 'suppliers.category',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers-category/IndexSuppliersCategory.vue')
                },
                {
                    path: '/suppliers/category/create',
                    name: 'suppliers.category.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers-category/CreateSuppliersCategory.vue')
                },
                {
                    path: '/suppliers/category/:id',
                    name: 'suppliers.category.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers-category/ShowSuppliersCategory.vue')
                },
                {
                    path: '/suppliers/category/:id/edit',
                    name: 'suppliers.category.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/suppliers-category/EditSuppliersCategory.vue')
                },

                {
                    path: '/stock-movement/entry',
                    name: 'stockmovement.entry',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/stock-movement/IndexStockMovementEntry.vue')
                },
                {
                    path: '/stock-movement/out',
                    name: 'stockmovement.out',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/stock-movement/IndexStockMovementOut.vue')
                },
                {
                    path: '/stock-movement/transfer',
                    name: 'stockmovement.trnasfer',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/stock-movement/IndexStockMovementTransfer.vue')
                },
                {
                    path: '/stock-movement/inventory',
                    name: 'stockmovement.inventory',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/stock-movement/IndexStockMovementInventory.vue')
                },
                {
                    path: '/stock-movement/create',
                    name: 'stockmovement.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/stock-movement/CreateStockMovement.vue')
                },
                {
                    path: '/stock-movement/:id',
                    name: 'stockmovement.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/stock-movement/ShowStockMovement.vue')
                },
                {
                    path: '/stock-movement/:id/edit',
                    name: 'stockmovement.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/stock-movement/EditStockMovement.vue')
                },

                // ===== CONFIGURAÇÕES =====
                // Regiões
                {
                    path: '/settings/regions',
                    name: 'settings.regions',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/regions/IndexRegions.vue')
                },
                {
                    path: '/settings/regions/create',
                    name: 'settings.regions.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/regions/CreateRegions.vue')
                },
                {
                    path: '/settings/regions/:id',
                    name: 'settings.regions.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/regions/ShowRegions.vue')
                },
                {
                    path: '/settings/regions/:id/edit',
                    name: 'settings.regions.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/regions/EditRegions.vue')
                },

                // Câmbio
                {
                    path: '/settings/exchange-rates',
                    name: 'settings.exchange-rates',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/exchange-rates/IndexExchangeRates.vue')
                },
                {
                    path: '/settings/exchange-rates/create',
                    name: 'settings.exchange-rates.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/exchange-rates/CreateExchangeRates.vue')
                },
                {
                    path: '/settings/exchange-rates/:id',
                    name: 'settings.exchange-rates.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/exchange-rates/ShowExchangeRates.vue')
                },
                {
                    path: '/settings/exchange-rates/:id/edit',
                    name: 'settings.exchange-rates.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/exchange-rates/EditExchangeRates.vue')
                },

                // IVA (Impostos)
                {
                    path: '/settings/taxes',
                    name: 'settings.taxes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/taxes/IndexTaxes.vue')
                },
                {
                    path: '/settings/taxes/create',
                    name: 'settings.taxes.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/taxes/CreateTaxes.vue')
                },
                {
                    path: '/settings/taxes/:id',
                    name: 'settings.taxes.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/taxes/ShowTaxes.vue')
                },
                {
                    path: '/settings/taxes/:id/edit',
                    name: 'settings.taxes.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/taxes/EditTaxes.vue')
                },

                // Armazéns
                {
                    path: '/settings/warehouses',
                    name: 'settings.warehouses',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/warehouses/IndexWarehouses.vue')
                },
                {
                    path: '/settings/warehouses/create',
                    name: 'settings.warehouses.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/warehouses/CreateWarehouses.vue')
                },
                {
                    path: '/settings/warehouses/:id',
                    name: 'settings.warehouses.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/warehouses/ShowWarehouses.vue')
                },
                {
                    path: '/settings/warehouses/:id/edit',
                    name: 'settings.warehouses.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/warehouses/EditWarehouses.vue')
                },

                // Tipos de Documento
                {
                    path: '/settings/document-types',
                    name: 'settings.document-types',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/document-types/IndexDocumentTypes.vue')
                },
                {
                    path: '/settings/document-types/create',
                    name: 'settings.document-types.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/document-types/CreateDocumentTypes.vue')
                },
                // {
                //     path: '/settings/document-types/:id',
                //     name: 'settings.document-types.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/settings/document-types/ShowDocumentTypes.vue')
                // },
                // {
                //     path: '/settings/document-types/:id/edit',
                //     name: 'settings.document-types.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/settings/document-types/EditDocumentTypes.vue')
                // },

                // Modelos de Impressão
                {
                    path: '/settings/print-templates',
                    name: 'settings.print-templates',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/print-templates/IndexPrintTemplates.vue')
                },
                {
                    path: '/settings/print-templates/create',
                    name: 'settings.print-templates.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/print-templates/CreatePrintTemplates.vue')
                },
                // {
                //     path: '/settings/print-templates/:id',
                //     name: 'settings.print-templates.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/settings/print-templates/ShowPrintTemplates.vue')
                // },
                // {
                //     path: '/settings/print-templates/:id/edit',
                //     name: 'settings.print-templates.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/settings/print-templates/EditPrintTemplates.vue')
                // },

                // Métodos de Pagamento
                {
                    path: '/settings/payment-methods',
                    name: 'settings.payment-methods',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/payment-methods/IndexPaymentMethods.vue')
                },
                {
                    path: '/settings/payment-methods/create',
                    name: 'settings.payment-methods.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/payment-methods/CreatePaymentMethods.vue')
                },
                // {
                //     path: '/settings/payment-methods/:id',
                //     name: 'settings.payment-methods.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/settings/payment-methods/ShowPaymentMethods.vue')
                // },
                // {
                //     path: '/settings/payment-methods/:id/edit',
                //     name: 'settings.payment-methods.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/settings/payment-methods/EditPaymentMethods.vue')
                // },

                // Séries de Facturação
                {
                    path: '/settings/invoice-series',
                    name: 'settings.invoice-series',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/invoice-series/IndexInvoiceSeries.vue')
                },
                {
                    path: '/settings/invoice-series/create',
                    name: 'settings.invoice-series.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/invoice-series/CreateInvoiceSeries.vue')
                },
                {
                    path: '/settings/invoice-series/:id',
                    name: 'settings.invoice-series.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/invoice-series/ShowInvoiceSeries.vue')
                },
                {
                    path: '/settings/invoice-series/:id/edit',
                    name: 'settings.invoice-series.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/settings/invoice-series/EditInvoiceSeries.vue')
                },

                // ROTAS DE VENDAS
                {
                    path: '/sales/quotations',
                    name: 'sales.quotations',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/quotations/IndexQuotations.vue')
                },
                {
                    path: '/sales/quotations/create',
                    name: 'sales.quotations.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/quotations/CreateQuotations.vue')
                },
                {
                    path: '/sales/quotations/:id',
                    name: 'sales.quotations.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/quotations/ShowQuotations.vue')
                },
                {
                    path: '/sales/quotations/:id/edit',
                    name: 'sales.quotations.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/quotations/EditQuotations.vue')
                },
                {
                    path: '/sales/quotations/:id/pdf',
                    name: 'sales.quotations.pdf',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/quotations/PdfQuotations.vue')
                },

                {
                    path: '/sales/invoices',
                    name: 'sales.invoices',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/invoices/IndexInvoices.vue')
                },
                {
                    path: '/sales/invoices/create',
                    name: 'sales.invoices.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/invoices/CreateInvoices.vue')
                },
                {
                    path: '/sales/invoices/:id',
                    name: 'ShowInvoices',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/invoices/ShowInvoices.vue')
                },
                // {
                //     path: '/sales/invoices/:id/edit',
                //     name: 'sales.invoices.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/invoices/EditInvoices.vue')
                // },
                {
                    path: '/sales/invoices/:id/pdf',
                    name: 'sales.invoices.pdf',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/invoices/PdfInvoices.vue')
                },
                {
                    path: '/sales/invoices/:id/edit',
                    name: 'EditInvoices',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/invoices/EditInvoices.vue')
                },
                // ROTAS DE CASH SESSION
                {
                    path: '/cash-session',
                    name: 'cash-session.dashboard',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/cash-session/CashSessionDashboard.vue')
                },
                // ROTAS DE TESOURARIA
                {
                    path: '/treasury',
                    name: 'treasury.dashboard',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/TreasuryDashboard.vue')
                },
                {
                    path: '/treasury/accounts',
                    name: 'treasury.accounts',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/accounts/IndexAccounts.vue')
                },
                {
                    path: '/treasury/accounts/new',
                    name: 'treasury.accounts.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/accounts/CreateAccount.vue')
                },
                {
                    path: '/treasury/accounts/:id',
                    name: 'treasury.accounts.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/accounts/ShowAccount.vue')
                },
                {
                    path: '/treasury/accounts/:id/edit',
                    name: 'treasury.accounts.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/accounts/EditAccount.vue')
                },
                {
                    path: '/treasury/deposits',
                    name: 'treasury.deposits',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/deposits/IndexDeposits.vue')
                },
                {
                    path: '/treasury/deposits/new',
                    name: 'treasury.deposits.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/deposits/CreateDeposit.vue')
                },
                {
                    path: '/treasury/deposits/:id',
                    name: 'treasury.deposits.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/deposits/ShowDeposit.vue')
                },
                {
                    path: '/treasury/deposits/:id/edit',
                    name: 'treasury.deposits.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/deposits/EditDeposit.vue')
                },
                {
                    path: '/treasury/withdrawals',
                    name: 'treasury.withdrawals',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/withdrawals/IndexWithdrawals.vue')
                },
                {
                    path: '/treasury/withdrawals/new',
                    name: 'treasury.withdrawals.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/withdrawals/CreateWithdrawal.vue')
                },
                {
                    path: '/treasury/withdrawals/:id',
                    name: 'treasury.withdrawals.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/withdrawals/ShowWithdrawal.vue')
                },
                {
                    path: '/treasury/withdrawals/:id/edit',
                    name: 'treasury.withdrawals.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/withdrawals/EditWithdrawal.vue')
                },
                {
                    path: '/treasury/reports',
                    name: 'treasury.reports',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/treasury/reports/IndexReports.vue')
                },
                // ROTAS DE PAGAMENTOS
                {
                    path: '/payments',
                    name: 'IndexPayments',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/payments/IndexPayments.vue')
                },
                {
                    path: '/payments/create/:type?',
                    name: 'CreatePayment',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/payments/CreateEditPayment.vue')
                },
                {
                    path: '/payments/:id',
                    name: 'ShowPayment',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/payments/ShowPayment.vue')
                },
                {
                    path: '/payments/:id/edit',
                    name: 'EditPayment',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/payments/CreateEditPayment.vue')
                },

                // ROTAS DE ORDENS DE COMPRA
                {
                    path: '/purchase-orders',
                    name: 'purchase-orders.index',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchase-orders/IndexPurchaseOrders.vue')
                },
                {
                    path: '/purchase-orders/create',
                    name: 'purchase-orders.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchase-orders/CreateEditPurchaseOrder.vue')
                },
                {
                    path: '/purchase-orders/:id',
                    name: 'purchase-orders.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchase-orders/ShowPurchaseOrder.vue')
                },
                {
                    path: '/purchase-orders/:id/edit',
                    name: 'purchase-orders.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchase-orders/CreateEditPurchaseOrder.vue')
                },
                {
                    path: '/purchase-orders/:id/pdf',
                    name: 'purchase-orders.pdf',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchase-orders/PdfPurchaseOrder.vue')
                },

                // ROTAS DE FATURAS DE COMPRA
                {
                    path: '/purchases/invoices',
                    name: 'purchases.invoices.index',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchases/invoices/IndexPurchaseInvoices.vue')
                },
                {
                    path: '/purchases/invoices/create',
                    name: 'purchases.invoices.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchases/invoices/CreatePurchaseInvoices.vue')
                },
                {
                    path: '/purchases/invoices/:id',
                    name: 'purchases.invoices.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchases/invoices/ShowPurchaseInvoices.vue')
                },
                {
                    path: '/purchases/invoices/:id/edit',
                    name: 'purchases.invoices.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchases/invoices/EditPurchaseInvoices.vue')
                },
                {
                    path: '/purchases/invoices/:id/pdf',
                    name: 'purchases.invoices.pdf',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/purchases/invoices/PdfPurchaseInvoices.vue')
                },

                // ROTAS DE REQUISIÇÕES INTERNAS
                {
                    path: '/internal-requests',
                    name: 'internal-requests.index',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/internal-requests/IndexInternalRequest.vue')
                },
                
                // ROTAS DO SISTEMA DE TRANSPORTADORA
                // Tipos de Bilhete
                {
                    path: '/transport/ticket-types',
                    name: 'transport.ticket-types.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/ticket-types/IndexTicketTypes.vue')
                },
                {
                    path: '/transport/ticket-types/create',
                    name: 'transport.ticket-types.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/ticket-types/CreateEditTicketTypes.vue')
                },
                {
                    path: '/transport/ticket-types/:id',
                    name: 'transport.ticket-types.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/ticket-types/ShowTicketTypes.vue')
                },
                {
                    path: '/transport/ticket-types/:id/edit',
                    name: 'transport.ticket-types.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/ticket-types/CreateEditTicketTypes.vue')
                },

                // Categorias de Rotas
                {
                    path: '/transport/route-categories',
                    name: 'transport.route-categories.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-categories/IndexRouteCategories.vue')
                },
                {
                    path: '/transport/route-categories/create',
                    name: 'transport.route-categories.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-categories/CreateRouteCategory.vue')
                },
                {
                    path: '/transport/route-categories/:id',
                    name: 'transport.route-categories.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-categories/ShowRouteCategory.vue')
                },
                {
                    path: '/transport/route-categories/:id/edit',
                    name: 'transport.route-categories.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-categories/EditRouteCategory.vue')
                },

                // Rotas de Transporte
                {
                    path: '/transport/routes',
                    name: 'transport.routes.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/routes/IndexRoutes.vue')
                },
                {
                    path: '/transport/routes/create',
                    name: 'transport.routes.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/routes/CreateEditRoutes.vue')
                },
                {
                    path: '/transport/routes/:id',
                    name: 'transport.routes.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/routes/ShowRoutes.vue')
                },
                {
                    path: '/transport/routes/:id/edit',
                    name: 'transport.routes.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/routes/CreateEditRoutes.vue')
                },

                // Paragens de Rotas
                {
                    path: '/transport/route-stops',
                    name: 'transport.route-stops.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-stops/IndexRouteStops.vue')
                },
                {
                    path: '/transport/route-stops/create',
                    name: 'transport.route-stops.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-stops/CreateRouteStop.vue')
                },
                {
                    path: '/transport/route-stops/:id',
                    name: 'transport.route-stops.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-stops/ShowRouteStop.vue')
                },
                {
                    path: '/transport/route-stops/:id/edit',
                    name: 'transport.route-stops.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-stops/EditRouteStop.vue')
                },

                // Turnos
                {
                    path: '/transport/shifts',
                    name: 'transport.shifts.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/shifts/IndexShifts.vue')
                },
                {
                    path: '/transport/shifts/create',
                    name: 'transport.shifts.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/shifts/CreateShift.vue')
                },
                {
                    path: '/transport/shifts/:id',
                    name: 'transport.shifts.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/shifts/ShowShift.vue')
                },
                {
                    path: '/transport/shifts/:id/edit',
                    name: 'transport.shifts.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/shifts/EditShift.vue')
                },

                // Motoristas
                {
                    path: '/transport/drivers',
                    name: 'transport.drivers.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/drivers/IndexDrivers.vue')
                },
                {
                    path: '/transport/drivers/create',
                    name: 'transport.drivers.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/drivers/CreateDriver.vue')
                },
                {
                    path: '/transport/drivers/:id',
                    name: 'transport.drivers.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/drivers/ShowDriver.vue')
                },
                {
                    path: '/transport/drivers/:id/edit',
                    name: 'transport.drivers.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/drivers/EditDriver.vue')
                },

                // Veículos
                {
                    path: '/transport/vehicles',
                    name: 'transport.vehicles.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/vehicles/IndexVehicles.vue')
                },
                {
                    path: '/transport/vehicles/create',
                    name: 'transport.vehicles.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/vehicles/CreateEditVehicles.vue')
                },
                {
                    path: '/transport/vehicles/:id',
                    name: 'transport.vehicles.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/vehicles/ShowVehicles.vue')
                },
                {
                    path: '/transport/vehicles/:id/edit',
                    name: 'transport.vehicles.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/vehicles/CreateEditVehicles.vue')
                },

                // Bilhetes de Rota
                {
                    path: '/transport/route-tickets',
                    name: 'transport.route-tickets.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-tickets/IndexRouteTickets.vue')
                },
                {
                    path: '/transport/route-tickets/create',
                    name: 'transport.route-tickets.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-tickets/CreateEditRouteTicket.vue')
                },
                {
                    path: '/transport/route-tickets/:id',
                    name: 'transport.route-tickets.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-tickets/ShowRouteTicket.vue')
                },
                {
                    path: '/transport/route-tickets/:id/edit',
                    name: 'transport.route-tickets.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/route-tickets/CreateEditRouteTicket.vue')
                },

                // Sessões
                {
                    path: '/transport/sessions',
                    name: 'transport.sessions.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/sessions/IndexSessions.vue')
                },
                {
                    path: '/transport/sessions/create',
                    name: 'transport.sessions.create',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/sessions/CreateEditSession.vue')
                },
                {
                    path: '/transport/sessions/:id',
                    name: 'transport.sessions.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/sessions/ShowSession.vue')
                },
                {
                    path: '/transport/sessions/:id/edit',
                    name: 'transport.sessions.edit',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/sessions/CreateEditSession.vue')
                },

                // Relatórios de Sessões
                {
                    path: '/transport/sessions/reports/guia-receita',
                    name: 'transport.sessions.reports.guia-receita',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/sessions/reports/guia-receita.vue')
                },

                // Vendas de Bilhetes
                {
                    path: '/transport/ticket-sales',
                    name: 'transport.ticket-sales.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/ticket-sales/IndexTicketSales.vue')
                },
                {
                    path: '/transport/ticket-sales/:id',
                    name: 'transport.ticket-sales.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/ticket-sales/ShowTicketSale.vue')
                },

                // Vendas de Bilhetes de Multa
                {
                    path: '/transport/penalty-ticket-sales',
                    name: 'transport.penalty-ticket-sales.index',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/penalty-ticket-sales/IndexPenaltyTicketSales.vue')
                },
                {
                    path: '/transport/penalty-ticket-sales/:id',
                    name: 'transport.penalty-ticket-sales.show',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/transport/penalty-ticket-sales/ShowPenaltyTicketSale.vue')
                },

                {
                    path: '/internal-requests/create',
                    name: 'internal-requests.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/internal-requests/CreateInternalRequest.vue')
                },
                {
                    path: '/internal-requests/:id',
                    name: 'internal-requests.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/internal-requests/ShowInternalRequest.vue')
                },
                {
                    path: '/internal-requests/:id/edit',
                    name: 'internal-requests.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/internal-requests/EditInternalRequest.vue')
                },
                {
                    path: '/internal-requests/:id/pdf',
                    name: 'internal-requests.pdf',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/internal-requests/PdfInternalRequest.vue')
                },

                {
                    path: '/sales/delivery-notes',
                    name: 'sales.delivery-notes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/delivery-notes/IndexDeliveryNotes.vue')
                },
                // {
                //     path: '/sales/delivery-notes/create',
                //     name: 'sales.delivery-notes.create',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/delivery-notes/CreateDeliveryNotes.vue')
                // },
                // {
                //     path: '/sales/delivery-notes/:id',
                //     name: 'sales.delivery-notes.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/delivery-notes/ShowDeliveryNotes.vue')
                // },
                // {
                //     path: '/sales/delivery-notes/:id/edit',
                //     name: 'sales.delivery-notes.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/delivery-notes/EditDeliveryNotes.vue')
                // },
                // {
                //     path: '/sales/delivery-notes/:id/pdf',
                //     name: 'sales.delivery-notes.pdf',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/delivery-notes/PdfDeliveryNotes.vue')
                // },

                {
                    path: '/sales/credit-notes',
                    name: 'sales.credit-notes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/credit-notes/IndexCreditNotes.vue')
                },
                // {
                //     path: '/sales/credit-notes/create',
                //     name: 'sales.credit-notes.create',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/credit-notes/CreateCreditNotes.vue')
                // },
                // {
                //     path: '/sales/credit-notes/:id',
                //     name: 'sales.credit-notes.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/credit-notes/ShowCreditNotes.vue')
                // },
                // {
                //     path: '/sales/credit-notes/:id/edit',
                //     name: 'sales.credit-notes.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/credit-notes/EditCreditNotes.vue')
                // },
                // {
                //     path: '/sales/credit-notes/:id/pdf',
                //     name: 'sales.credit-notes.pdf',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/credit-notes/PdfCreditNotes.vue')
                // },

                {
                    path: '/sales/debit-notes',
                    name: 'sales.debit-notes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/debit-notes/IndexDebitNotes.vue')
                },
                // {
                //     path: '/sales/debit-notes/create',
                //     name: 'sales.debit-notes.create',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/debit-notes/CreateDebitNotes.vue')
                // },
                // {
                //     path: '/sales/debit-notes/:id',
                //     name: 'sales.debit-notes.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/debit-notes/ShowDebitNotes.vue')
                // },
                // {
                //     path: '/sales/debit-notes/:id/edit',
                //     name: 'sales.debit-notes.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/debit-notes/EditDebitNotes.vue')
                // },
                // {
                //     path: '/sales/debit-notes/:id/pdf',
                //     name: 'sales.debit-notes.pdf',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/debit-notes/PdfDebitNotes.vue')
                // },

                {
                    path: '/sales/advance-receipts',
                    name: 'sales.advance-receipts',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/advance-receipts/IndexAdvanceReceipts.vue')
                },
                // {
                //     path: '/sales/advance-receipts/create',
                //     name: 'sales.advance-receipts.create',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/advance-receipts/CreateAdvanceReceipts.vue')
                // },
                // {
                //     path: '/sales/advance-receipts/:id',
                //     name: 'sales.advance-receipts.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/advance-receipts/ShowAdvanceReceipts.vue')
                // },
                // {
                //     path: '/sales/advance-receipts/:id/edit',
                //     name: 'sales.advance-receipts.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/advance-receipts/EditAdvanceReceipts.vue')
                // },
                // {
                //     path: '/sales/advance-receipts/:id/pdf',
                //     name: 'sales.advance-receipts.pdf',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/advance-receipts/PdfAdvanceReceipts.vue')
                // },

                {
                    path: '/sales/cash-sales',
                    name: 'sales.cash-sales',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/cash-sales/IndexCashSales.vue')
                },
                // {
                //     path: '/sales/cash-sales/create',
                //     name: 'sales.cash-sales.create',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/cash-sales/CreateCashSales.vue')
                // },
                // {
                //     path: '/sales/cash-sales/:id',
                //     name: 'sales.cash-sales.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/cash-sales/ShowCashSales.vue')
                // },
                // {
                //     path: '/sales/cash-sales/:id/edit',
                //     name: 'sales.cash-sales.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/cash-sales/EditCashSales.vue')
                // },
                // {
                //     path: '/sales/cash-sales/:id/pdf',
                //     name: 'sales.cash-sales.pdf',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/cash-sales/PdfCashSales.vue')
                // },

                {
                    path: '/sales/payments',
                    name: 'sales.payments',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/sales/payments/IndexPayments.vue')
                },
                // {
                //     path: '/sales/payments/create',
                //     name: 'sales.payments.create',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/payments/CreatePayments.vue')
                // },
                // {
                //     path: '/sales/payments/:id',
                //     name: 'sales.payments.show',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/payments/ShowPayments.vue')
                // },
                // {
                //     path: '/sales/payments/:id/edit',
                //     name: 'sales.payments.edit',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/payments/EditPayments.vue')
                // },
                // {
                //     path: '/sales/payments/:id/pdf',
                //     name: 'sales.payments.pdf',
                //     meta: {
                //         requiresAuth: true
                //     },
                //     component: () => import('@/views/pages/sales/payments/PdfPayments.vue')
                // },


                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/Input.vue')
                },
                {
                    path: '/uikit/floatlabel',
                    name: 'floatlabel',
                    component: () => import('@/views/uikit/FloatLabel.vue')
                },
                {
                    path: '/uikit/invalidstate',
                    name: 'invalidstate',
                    component: () => import('@/views/uikit/InvalidState.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/Button.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/Table.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/List.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/Tree.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/Panels.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/Overlay.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/Media.vue')
                },
                {
                    path: '/uikit/menu',
                    component: () => import('@/views/uikit/Menu.vue'),
                    children: [
                        {
                            path: '/uikit/menu',
                            component: () => import('@/views/uikit/menu/PersonalDemo.vue')
                        },
                        {
                            path: '/uikit/menu/seat',
                            component: () => import('@/views/uikit/menu/SeatDemo.vue')
                        },
                        {
                            path: '/uikit/menu/payment',
                            component: () => import('@/views/uikit/menu/PaymentDemo.vue')
                        },
                        {
                            path: '/uikit/menu/confirmation',
                            component: () => import('@/views/uikit/menu/ConfirmationDemo.vue')
                        }
                    ]
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/Messages.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/File.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/Chart.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/Misc.vue')
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/utilities/icons',
                    name: 'icons',
                    component: () => import('@/views/utilities/Icons.vue')
                },
                {
                    path: '/pages/timeline',
                    name: 'timeline',
                    component: () => import('@/views/pages/Timeline.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/utilities/Documentation.vue')
                }
            ]
        },
        {
            path: '/',
            name: 'landing',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/signup',
            name: 'signup',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/account/setup',
            name: 'setup',
            component: () => import('@/views/pages/auth/AccountSetup.vue')
        },
    ]
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const publicPages = ['/auth/login', '/auth/signup', '/auth/access', '/auth/error'];
    const authRequired = !publicPages.includes(to.path);
    
    if (authRequired && !token) {
        return next('/auth/login');
    }
    
    if (to.path === '/auth/login' && token) {
        return next('/dashboard');
    }
    
    next();
});
export default router;
