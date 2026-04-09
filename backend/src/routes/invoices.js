import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const invoicesRouter = Router();

invoicesRouter.get('/', asyncHandler(async (req, res) => {
  const { status, customer_id } = req.query;
  let query = supabase.from('invoices').select('*, customers(first_name, last_name, company_name)');
  if (status) query = query.eq('status', status);
  if (customer_id) query = query.eq('customer_id', customer_id);
  const { data, error } = await query.order('invoice_date', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

invoicesRouter.get('/:id', asyncHandler(async (req, res) => {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, customers(*), orders(order_number)')
    .eq('id', req.params.id).single();
  if (error) throw error;

  const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', req.params.id);
  const { data: payments } = await supabase.from('payments').select('*').eq('invoice_id', req.params.id);

  res.json({ ...invoice, items: items || [], payments: payments || [] });
}));

invoicesRouter.post('/', asyncHandler(async (req, res) => {
  const { items, ...invoiceData } = req.body;
  const { data: invoice, error } = await supabase.from('invoices').insert(invoiceData).select().single();
  if (error) throw error;

  if (items?.length) {
    const invoiceItems = items.map(item => ({ ...item, invoice_id: invoice.id }));
    await supabase.from('invoice_items').insert(invoiceItems);
  }
  res.status(201).json(invoice);
}));

invoicesRouter.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('invoices').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
}));

// Zahlung erfassen
invoicesRouter.post('/:id/payments', asyncHandler(async (req, res) => {
  const payment = { ...req.body, invoice_id: req.params.id };
  const { data, error } = await supabase.from('payments').insert(payment).select().single();
  if (error) throw error;

  // Prüfen ob Rechnung komplett bezahlt
  const { data: payments } = await supabase.from('payments').select('amount').eq('invoice_id', req.params.id);
  const { data: invoice } = await supabase.from('invoices').select('total').eq('id', req.params.id).single();
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  if (totalPaid >= Number(invoice.total)) {
    await supabase.from('invoices').update({ status: 'paid' }).eq('id', req.params.id);
  }

  res.status(201).json(data);
}));
