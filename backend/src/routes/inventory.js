import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const inventoryRouter = Router();

inventoryRouter.get('/', asyncHandler(async (req, res) => {
  const { warehouse_id, item_type, low_stock } = req.query;
  let query = supabase.from('inventory').select(`
    *, warehouses(name),
    articles(article_number, name, variant),
    components(component_number, name)
  `);
  if (warehouse_id) query = query.eq('warehouse_id', warehouse_id);
  if (item_type) query = query.eq('item_type', item_type);
  if (low_stock === 'true') query = query.lte('quantity_available', supabase.raw('min_stock'));
  const { data, error } = await query;
  if (error) throw error;
  res.json(data);
}));

// Lagerbewegung erfassen
inventoryRouter.post('/movements', asyncHandler(async (req, res) => {
  const movement = req.body;
  const { data, error } = await supabase.from('inventory_movements').insert(movement).select().single();
  if (error) throw error;

  // Bestand aktualisieren
  const field = movement.item_type === 'article' ? 'article_id' : 'component_id';
  const itemId = movement[field];

  let updateQuery = supabase.from('inventory')
    .select('*')
    .eq('warehouse_id', movement.warehouse_id)
    .eq(field, itemId)
    .single();

  const { data: inv } = await updateQuery;

  if (inv) {
    let qty = inv.quantity_total;
    let avail = inv.quantity_available;
    const q = movement.quantity;

    switch (movement.movement_type) {
      case 'in': qty += q; avail += q; break;
      case 'out': qty -= q; avail -= q; break;
      case 'rental_out': avail -= q; break;
      case 'rental_return': avail += q; break;
      case 'adjustment': qty = q; avail = q; break;
    }

    await supabase.from('inventory').update({
      quantity_total: qty,
      quantity_available: avail,
      quantity_rented: movement.movement_type === 'rental_out'
        ? inv.quantity_rented + q
        : movement.movement_type === 'rental_return'
          ? inv.quantity_rented - q
          : inv.quantity_rented
    }).eq('id', inv.id);
  }

  res.status(201).json(data);
}));

inventoryRouter.get('/movements', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*, warehouses(name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  res.json(data);
}));

inventoryRouter.get('/warehouses', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('warehouses').select('*');
  if (error) throw error;
  res.json(data);
}));
