import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const articlesRouter = Router();

articlesRouter.get('/', asyncHandler(async (req, res) => {
  const { status, search, variant, article_number } = req.query;
  let query = supabase.from('articles').select('*, categories(name)');
  if (status) query = query.eq('status', status);
  if (variant) query = query.eq('variant', variant);
  if (article_number) query = query.eq('article_number', article_number);
  if (search) query = query.or(`name.ilike.%${search}%,article_number.ilike.%${search}%`);
  const { data, error } = await query.order('article_number');
  if (error) throw error;
  res.json(data);
}));

articlesRouter.get('/:id', asyncHandler(async (req, res) => {
  const { data: article, error } = await supabase
    .from('articles').select('*, categories(name)').eq('id', req.params.id).single();
  if (error) throw error;

  const { data: bom } = await supabase
    .from('bom_article_components')
    .select('*, components(id, component_number, name, additional_name, length_mm, width_mm, height_mm)')
    .eq('article_id', req.params.id)
    .order('sort_order');

  res.json({ ...article, bom: bom || [] });
}));

articlesRouter.post('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('articles').insert(req.body).select().single();
  if (error) throw error;
  res.status(201).json(data);
}));

articlesRouter.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('articles').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
}));

articlesRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('articles').delete().eq('id', req.params.id);
  if (error) throw error;
  res.status(204).send();
}));
