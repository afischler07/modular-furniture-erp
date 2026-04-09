import { supabase } from './supabase';

// Direkte Supabase-Anbindung für GitHub Pages (kein Backend nötig)
export const db = {
  // ─── SYSTEME ──────────────────────────────────────────
  systems: {
    async list(search) {
      let q = supabase.from('systems').select('*, categories(name)').order('system_number');
      if (search) q = q.ilike('name', `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    async get(id) {
      const { data, error } = await supabase.from('systems').select('*, categories(name)').eq('id', id).single();
      if (error) throw error;
      const { data: bom } = await supabase
        .from('bom_system_articles')
        .select('*, articles(id, article_number, name, variant)')
        .eq('system_id', id).order('sort_order');
      return { ...data, bom: bom || [] };
    },
    async create(body) { const { data, error } = await supabase.from('systems').insert(body).select().single(); if (error) throw error; return data; },
    async update(id, body) { const { data, error } = await supabase.from('systems').update(body).eq('id', id).select().single(); if (error) throw error; return data; },
    async remove(id) { const { error } = await supabase.from('systems').delete().eq('id', id); if (error) throw error; },
  },

  // ─── ARTIKEL ──────────────────────────────────────────
  articles: {
    async list(search, variant) {
      let q = supabase.from('articles').select('*, categories(name)').order('article_number');
      if (variant) q = q.eq('variant', variant);
      if (search) q = q.or(`name.ilike.%${search}%,article_number.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    async get(id) {
      const { data, error } = await supabase.from('articles').select('*, categories(name)').eq('id', id).single();
      if (error) throw error;
      const { data: bom } = await supabase
        .from('bom_article_components')
        .select('*, components(id, component_number, name, additional_name, length_mm, width_mm, height_mm)')
        .eq('article_id', id).order('sort_order');
      return { ...data, bom: bom || [] };
    },
    async create(body) { const { data, error } = await supabase.from('articles').insert(body).select().single(); if (error) throw error; return data; },
    async update(id, body) { const { data, error } = await supabase.from('articles').update(body).eq('id', id).select().single(); if (error) throw error; return data; },
    async remove(id) { const { error } = await supabase.from('articles').delete().eq('id', id); if (error) throw error; },
  },

  // ─── KOMPONENTEN ──────────────────────────────────────
  components: {
    async list(search) {
      let q = supabase.from('components').select('*, suppliers(name)').order('component_number');
      if (search) q = q.or(`name.ilike.%${search}%,component_number.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  },

  // ─── KUNDEN ───────────────────────────────────────────
  customers: {
    async list(search) {
      let q = supabase.from('customers').select('*').order('customer_number');
      if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%,customer_number.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    async create(body) { const { data, error } = await supabase.from('customers').insert(body).select().single(); if (error) throw error; return data; },
    async update(id, body) { const { data, error } = await supabase.from('customers').update(body).eq('id', id).select().single(); if (error) throw error; return data; },
  },

  // ─── AUFTRÄGE ─────────────────────────────────────────
  orders: {
    async list() {
      const { data, error } = await supabase.from('orders').select('*, customers(first_name, last_name, company_name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async get(id) {
      const { data, error } = await supabase.from('orders').select('*, customers(first_name, last_name, company_name, email)').eq('id', id).single();
      if (error) throw error;
      const { data: items } = await supabase.from('order_items')
        .select('*, systems(name, system_number), articles(name, article_number, variant), components(name, component_number)')
        .eq('order_id', id);
      return { ...data, items: items || [] };
    },
  },

  // ─── INVENTAR ─────────────────────────────────────────
  inventory: {
    async list() {
      const { data, error } = await supabase.from('inventory')
        .select('*, warehouses(name), articles(article_number, name, variant), components(component_number, name)');
      if (error) throw error;
      return data;
    },
  },

  // ─── RECHNUNGEN ───────────────────────────────────────
  invoices: {
    async list(status) {
      let q = supabase.from('invoices').select('*, customers(first_name, last_name, company_name)').order('invoice_date', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  },

  // ─── DASHBOARD ────────────────────────────────────────
  dashboard: {
    async get() {
      const [systems, articles, components, customers, orders, invoices, rentals] = await Promise.all([
        supabase.from('systems').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('components').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).neq('status', 'cancelled'),
        supabase.from('invoices').select('id, total, status'),
        supabase.from('rental_contracts').select('id, monthly_total').eq('status', 'active'),
      ]);
      const openInv = (invoices.data || []).filter(i => ['sent', 'overdue'].includes(i.status));
      return {
        counts: {
          systems: systems.count || 0, articles: articles.count || 0, components: components.count || 0,
          customers: customers.count || 0, orders: orders.count || 0, active_rentals: (rentals.data || []).length,
        },
        finance: {
          open_invoices_count: openInv.length,
          open_invoices_amount: openInv.reduce((s, i) => s + Number(i.total || 0), 0),
          monthly_rental_income: (rentals.data || []).reduce((s, r) => s + Number(r.monthly_total || 0), 0),
        }
      };
    },
  },
};
