import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const componentsRouter = Router();

componentsRouter.get('/', asyncHandler(async (req, res) => {
  const { search, base_material_code, supplier } = req.query;
  let query = supabase.from('components').select('*, suppliers(name)');
  if (base_material_code) query = query.eq('base_material_code', base_material_code);
  if (search) query = query.or(`name.ilike.%${search}%,component_number.ilike.%${search}%`);
  const { data, error } = await query.order('component_number');
  if (error) throw error;
  res.json(data);
}));

componentsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('components').select('*, suppliers(name)').eq('id', req.params.id).single();
  if (error) throw error;
  res.json(data);
}));

componentsRouter.post('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('components').insert(req.body).select().single();
  if (error) throw error;
  res.status(201).json(data);
}));

componentsRouter.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('components').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
}));

componentsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('components').delete().eq('id', req.params.id);
  if (error) throw error;
  res.status(204).send();
}));
