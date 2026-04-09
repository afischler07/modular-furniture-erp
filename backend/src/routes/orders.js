import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const ordersRouter = Router();

ordersRouter.get('/', asyncHandler(async (req, res) => {
  const { status, order_type, customer_id } = req.query;
  let query = supabase.from('orders').select('*, customers(first_name, last_name, company_name)');
  if (status) query = query.eq('status', status);
  if (order_type) query = query.eq('order_type', order_type);
  if (customer_id) query = query.eq('customer_id', customer_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

ordersRouter.get('/:id', asyncHandler(async (req, res) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, customers(first_name, last_name, company_name, email)')
    .eq('id', req.params.id).single();
  if (error) throw error;

  const { data: items } = await supabase
    .from('order_items')
    .select('*, systems(name, system_number), articles(name, article_number, variant), components(name, component_number)')
    .eq('order_id', req.params.id);

  res.json({ ...order, items: items || [] });
}));

ordersRouter.post('/', asyncHandler(async (req, res) => {
  const { items, ...orderData } = req.body;
  const { data: order, error } = await supabase.from('orders').insert(orderData).select().single();
  if (error) throw error;

  if (items?.length) {
    const orderItems = items.map((item, i) => ({ ...item, order_id: order.id }));
    const { error: itemError } = await supabase.from('order_items').insert(orderItems);
    if (itemError) throw itemError;
  }

  res.status(201).json(order);
}));

ordersRouter.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('orders').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
}));

ordersRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
  if (error) throw error;
  res.status(204).send();
}));
