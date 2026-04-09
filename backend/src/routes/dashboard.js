import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', asyncHandler(async (req, res) => {
  const [systems, articles, components, customers, orders, invoices, rentals] = await Promise.all([
    supabase.from('systems').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('components').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).neq('status', 'cancelled'),
    supabase.from('invoices').select('id, total, status'),
    supabase.from('rental_contracts').select('id, monthly_total').eq('status', 'active')
  ]);

  const openInvoices = (invoices.data || []).filter(i => ['sent', 'overdue'].includes(i.status));
  const openAmount = openInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const rentalMonthly = (rentals.data || []).reduce((s, r) => s + Number(r.monthly_total || 0), 0);

  res.json({
    counts: {
      systems: systems.count || 0,
      articles: articles.count || 0,
      components: components.count || 0,
      customers: customers.count || 0,
      orders: orders.count || 0,
      active_rentals: (rentals.data || []).length
    },
    finance: {
      open_invoices_count: openInvoices.length,
      open_invoices_amount: openAmount,
      monthly_rental_income: rentalMonthly
    }
  });
}));
