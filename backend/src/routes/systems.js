import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const systemsRouter = Router();

// GET all systems
systemsRouter.get('/', asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  let query = supabase.from('systems').select('*, categories(name)');
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error } = await query.order('system_number');
  if (error) throw error;
  res.json(data);
}));

// GET single system with BOM
systemsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { data: system, error } = await supabase
    .from('systems').select('*, categories(name)').eq('id', req.params.id).single();
  if (error) throw error;

  const { data: bom } = await supabase
    .from('bom_system_articles')
    .select('*, articles(id, article_number, name, variant)')
    .eq('system_id', req.params.id)
    .order('sort_order');

  res.json({ ...system, bom: bom || [] });
}));

// POST create system
systemsRouter.post('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('systems').insert(req.body).select().single();
  if (error) throw error;
  res.status(201).json(data);
}));

// PUT update system
systemsRouter.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('systems').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
}));

// DELETE system
systemsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('systems').delete().eq('id', req.params.id);
  if (error) throw error;
  res.status(204).send();
}));
