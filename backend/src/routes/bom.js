import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const bomRouter = Router();

// Stückliste System → Artikel
bomRouter.get('/system/:systemId', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('bom_system_articles')
    .select('*, articles(id, article_number, name, variant, sale_price, rental_price_monthly)')
    .eq('system_id', req.params.systemId)
    .order('sort_order');
  if (error) throw error;
  res.json(data);
}));

bomRouter.post('/system', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('bom_system_articles').insert(req.body).select().single();
  if (error) throw error;
  res.status(201).json(data);
}));

bomRouter.delete('/system/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('bom_system_articles').delete().eq('id', req.params.id);
  if (error) throw error;
  res.status(204).send();
}));

// Stückliste Artikel → Komponenten
bomRouter.get('/article/:articleId', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('bom_article_components')
    .select('*, components(id, component_number, name, additional_name, length_mm, width_mm, height_mm, unit, base_material_code)')
    .eq('article_id', req.params.articleId)
    .order('sort_order');
  if (error) throw error;
  res.json(data);
}));

bomRouter.post('/article', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('bom_article_components').insert(req.body).select().single();
  if (error) throw error;
  res.status(201).json(data);
}));

bomRouter.delete('/article/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('bom_article_components').delete().eq('id', req.params.id);
  if (error) throw error;
  res.status(204).send();
}));

// Volle Stückliste für ein System (System → Artikel → Komponenten)
bomRouter.get('/full/:systemId', asyncHandler(async (req, res) => {
  const { data: systemArticles, error: saErr } = await supabase
    .from('bom_system_articles')
    .select('*, articles(id, article_number, name, variant)')
    .eq('system_id', req.params.systemId);
  if (saErr) throw saErr;

  const result = [];
  for (const sa of systemArticles || []) {
    const { data: components } = await supabase
      .from('bom_article_components')
      .select('*, components(component_number, name, additional_name, length_mm, width_mm, height_mm)')
      .eq('article_id', sa.articles.id);

    result.push({
      article: sa.articles,
      quantity: sa.quantity,
      components: (components || []).map(c => ({
        ...c.components,
        quantity: c.quantity
      }))
    });
  }

  res.json(result);
}));
