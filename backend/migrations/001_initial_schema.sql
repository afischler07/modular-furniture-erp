-- ============================================================
-- Modulares Möbel-ERP: Datenbankschema (Supabase / PostgreSQL)
-- 3-stufiger Artikelstamm: System → Artikel → Komponente
-- Basierend auf realen Produktdaten (Square Outdoor)
-- ============================================================

-- ─── ENABLE UUID ────────────────────────────────────────────
-- (Supabase hat dies standardmässig, lokal ggf. nötig)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── KATEGORIEN ─────────────────────────────────────────────

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LIEFERANTEN ────────────────────────────────────────────

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(200),
  email VARCHAR(200),
  phone VARCHAR(50),
  street VARCHAR(200),
  zip_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Schweiz',
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BASISMATERIALIEN ───────────────────────────────────────
-- z.B. SPD9, SPD18, SPD27, FI-SL67, LA-FL71 etc.

CREATE TABLE base_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,           -- z.B. "SPD18", "FI-SL67"
  name VARCHAR(200) NOT NULL,
  description TEXT,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'stk',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STUFE 1: SYSTEME ──────────────────────────────────────
-- z.B. "Square Outdoor School I" (10000)

CREATE TABLE systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sale_price DECIMAL(10,2),
  rental_price_monthly DECIMAL(10,2),
  available_for_sale BOOLEAN DEFAULT true,
  available_for_rent BOOLEAN DEFAULT true,
  image_urls TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STUFE 2: ARTIKEL ──────────────────────────────────────
-- z.B. "4er-Bank lang tief" (1005)

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_number VARCHAR(50) NOT NULL,        -- z.B. "1005" (nicht unique, da Varianten)
  name VARCHAR(200) NOT NULL,
  variant VARCHAR(50),                         -- z.B. "Fichte", "Lärche"
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  rental_price_monthly DECIMAL(10,2),
  rental_price_weekly DECIMAL(10,2),
  available_for_sale BOOLEAN DEFAULT true,
  available_for_rent BOOLEAN DEFAULT true,
  width_cm DECIMAL(8,2),
  height_cm DECIMAL(8,2),
  depth_cm DECIMAL(8,2),
  weight_kg DECIMAL(8,2),
  image_urls TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_number, variant)
);

-- ─── STUFE 3: KOMPONENTEN ──────────────────────────────────
-- z.B. "H-SDP18-SE-351x312" (Siebdruckplatte)

CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_number VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  additional_name VARCHAR(200),                -- Zusatz-Bezeichnung (Rückenlehne, Seite, etc.)
  length_mm DECIMAL(10,2),
  width_mm DECIMAL(10,2),
  height_mm DECIMAL(10,2),
  unit VARCHAR(20) DEFAULT 'Stk.',
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  base_material_code VARCHAR(50),              -- z.B. "SPD18", "FI-SL67"
  calculation_type VARCHAR(50),                -- z.B. "FLAECHE", "LFM", "STK"
  price DECIMAL(10,2),
  drawing_number VARCHAR(100),
  drawing_link TEXT,
  image_urls TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STÜCKLISTE SYSTEME (System → Artikel) ─────────────────

CREATE TABLE bom_system_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  notes TEXT,
  UNIQUE(system_id, article_id)
);

-- ─── STÜCKLISTE ARTIKEL (Artikel → Komponenten) ────────────

CREATE TABLE bom_article_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  notes TEXT,
  UNIQUE(article_id, component_id)
);

-- ─── KUNDENVERWALTUNG ──────────────────────────────────────

CREATE TYPE customer_type AS ENUM ('private', 'business');

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_number VARCHAR(50) UNIQUE NOT NULL,
  customer_type customer_type DEFAULT 'private',
  company_name VARCHAR(200),
  vat_number VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  street VARCHAR(200),
  zip_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Schweiz',
  delivery_street VARCHAR(200),
  delivery_zip VARCHAR(20),
  delivery_city VARCHAR(100),
  delivery_country VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUFTRÄGE ───────────────────────────────────────────────

CREATE TYPE order_type AS ENUM ('purchase', 'rental');
CREATE TYPE order_status AS ENUM ('draft', 'confirmed', 'in_delivery', 'delivered', 'completed', 'cancelled');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  order_type order_type NOT NULL,
  status order_status DEFAULT 'draft',
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  rental_start DATE,
  rental_end DATE,
  rental_duration_months INT,
  delivery_street VARCHAR(200),
  delivery_zip VARCHAR(20),
  delivery_city VARCHAR(100),
  subtotal DECIMAL(12,2) DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 8.1,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positionen: können System, Artikel oder Komponente referenzieren
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('system', 'article', 'component')),
  system_id UUID REFERENCES systems(id),
  article_id UUID REFERENCES articles(id),
  component_id UUID REFERENCES components(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  rental_price_monthly DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MIETVERTRÄGE ───────────────────────────────────────────

CREATE TABLE rental_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_open_ended BOOLEAN DEFAULT false,
  monthly_total DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated', 'expired')),
  termination_date DATE,
  termination_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LAGERVERWALTUNG ────────────────────────────────────────

CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  address VARCHAR(300),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('article', 'component')),
  article_id UUID REFERENCES articles(id),
  component_id UUID REFERENCES components(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  quantity_total INT DEFAULT 0,
  quantity_available INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_rented INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  reorder_point INT DEFAULT 0,
  location VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE movement_type AS ENUM ('in', 'out', 'transfer', 'adjustment', 'rental_out', 'rental_return');

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('article', 'component')),
  article_id UUID REFERENCES articles(id),
  component_id UUID REFERENCES components(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  target_warehouse_id UUID REFERENCES warehouses(id),
  movement_type movement_type NOT NULL,
  quantity INT NOT NULL,
  order_id UUID REFERENCES orders(id),
  reference VARCHAR(200),
  notes TEXT,
  performed_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FINANZEN ───────────────────────────────────────────────

CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'credited');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'cash', 'lsv', 'paypal', 'twint');

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  rental_contract_id UUID REFERENCES rental_contracts(id),
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12,2) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 8.1,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  status invoice_status DEFAULT 'draft',
  payment_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  payment_date DATE DEFAULT CURRENT_DATE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method payment_method DEFAULT 'bank_transfer',
  reference VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDIZES ────────────────────────────────────────────────

CREATE INDEX idx_systems_number ON systems(system_number);
CREATE INDEX idx_articles_number ON articles(article_number);
CREATE INDEX idx_articles_variant ON articles(article_number, variant);
CREATE INDEX idx_components_number ON components(component_number);
CREATE INDEX idx_bom_sa_system ON bom_system_articles(system_id);
CREATE INDEX idx_bom_sa_article ON bom_system_articles(article_id);
CREATE INDEX idx_bom_ac_article ON bom_article_components(article_id);
CREATE INDEX idx_bom_ac_component ON bom_article_components(component_id);
CREATE INDEX idx_customers_number ON customers(customer_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_inventory_article ON inventory(article_id);
CREATE INDEX idx_inventory_component ON inventory(component_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ─── VIEWS ──────────────────────────────────────────────────

CREATE VIEW v_system_bom AS
SELECT
  s.system_number, s.name AS system_name,
  a.article_number, a.name AS article_name, a.variant,
  bsa.quantity
FROM systems s
JOIN bom_system_articles bsa ON s.id = bsa.system_id
JOIN articles a ON bsa.article_id = a.id
ORDER BY s.system_number, bsa.sort_order;

CREATE VIEW v_article_bom AS
SELECT
  a.article_number, a.name AS article_name, a.variant,
  c.component_number, c.name AS component_name, c.additional_name,
  bac.quantity,
  c.length_mm, c.width_mm, c.height_mm
FROM articles a
JOIN bom_article_components bac ON a.id = bac.article_id
JOIN components c ON bac.component_id = c.id
ORDER BY a.article_number, a.variant, bac.sort_order;

CREATE VIEW v_open_invoices AS
SELECT
  inv.*, c.company_name,
  c.first_name || ' ' || c.last_name AS customer_name,
  inv.total - COALESCE(SUM(p.amount), 0) AS outstanding_amount
FROM invoices inv
JOIN customers c ON inv.customer_id = c.id
LEFT JOIN payments p ON inv.id = p.invoice_id
WHERE inv.status IN ('sent', 'overdue')
GROUP BY inv.id, c.company_name, c.first_name, c.last_name;

CREATE VIEW v_active_rentals AS
SELECT
  rc.*, o.order_number,
  c.company_name, c.first_name || ' ' || c.last_name AS customer_name
FROM rental_contracts rc
JOIN orders o ON rc.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE rc.status = 'active';

-- ─── TRIGGER ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_systems_upd BEFORE UPDATE ON systems FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_articles_upd BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_components_upd BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_customers_upd BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_upd BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_contracts_upd BEFORE UPDATE ON rental_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_invoices_upd BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_categories_upd BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_suppliers_upd BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── SEED: Lager & Kategorien ───────────────────────────────

INSERT INTO warehouses (name, address, is_default) VALUES
('Hauptlager', 'Industriestrasse 10, 8005 Zürich', true);

INSERT INTO categories (name, description) VALUES
('Bänke tief', 'Sitzmodule in tiefer Ausführung'),
('Bänke hoch', 'Sitzmodule in hoher Ausführung'),
('Bänke mit Stauraum tief', 'Sitzmodule tief mit Stauraumfunktion'),
('Bänke mit Stauraum hoch', 'Sitzmodule hoch mit Stauraumfunktion'),
('Pflanzmodule hoch', 'Pflanzgefässe in hoher Ausführung'),
('Pflanzmodule tief', 'Pflanzgefässe in tiefer Ausführung'),
('Funktionsmodule', 'Solar, Recycling, Wasser, etc.'),
('Tische', 'Tischsysteme und Unterbauten'),
('Zubehör', 'Side Tables, Podeste, Sonnenschirme');

INSERT INTO suppliers (name) VALUES
('Oertle'), ('Holz AG'), ('Koch'), ('Hettich'), ('Diverse');
