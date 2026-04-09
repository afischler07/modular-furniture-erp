import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const customersRouter = Router();

customersRouter.get('/', asyncHandler(async (req, res) => {
  const { search, status, customer_type } = req.query;
  let query = supabase.from('customers').select('*');
  if (status) query = query.eq('status', status);
  if (customer_type) query = query.eq('customer_type', customer_type);
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%,customer_number.ilike.%${search}%`);
  const { data, error } = await query.order('customer_number');
  if (error) throw error;
  res.json(data);
}));

customersRouter.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*').eq('id', req.params.id).single();
  if (error) throw error;
  res.json(data);
}));

customersRouter.post('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('customers').insert(req.body).select().single();
  if (error) throw error;
  res.status(201).json(data);
}));

customersRouter.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('customers').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
}));

customersRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('customers').delete().eq('id', req.params.id);
  if (error) throw error;
  res.status(204).send();
}));
