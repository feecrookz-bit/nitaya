-- Nitya Stones stock system: schema. The ledger is the truth; stock is a view.

CREATE TABLE products (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family TEXT NOT NULL,           -- sandstone, limestone, porcelain, indoor, cladding, chemical, granite, steps, edging, circle
  colour TEXT NOT NULL,
  size TEXT NOT NULL,             -- '600/900', 'bucket', '2.85 m'
  thickness TEXT NOT NULL,        -- '22 mm', '15kg'
  base_unit TEXT NOT NULL,        -- slab, box, bucket, piece
  mode TEXT NOT NULL CHECK (mode IN ('fixed', 'mixed')),
  per_pallet INTEGER NOT NULL DEFAULT 0,
  per_box INTEGER NOT NULL DEFAULT 0,
  m2_per_unit REAL NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  min_stock INTEGER NOT NULL DEFAULT 0,   -- in base units; 0 = no flag
  site_id TEXT,                   -- the site's product id, when the site sells it
  note TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A mixed pack's sizes: one row per size, per pack.
CREATE TABLE components (
  code TEXT NOT NULL REFERENCES products(code),
  size TEXT NOT NULL,
  per_pack INTEGER NOT NULL,
  m2_per_unit REAL NOT NULL,
  PRIMARY KEY (code, size)
);

CREATE TABLE bays (
  id TEXT PRIMARY KEY,            -- 'front', 'back', 'rack-a'
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'office', 'warehouse')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT, email TEXT, postcode TEXT,
  trade INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,              -- 'NS-000123'
  source TEXT NOT NULL CHECK (source IN ('counter', 'web', 'woocommerce')),
  status TEXT NOT NULL CHECK (status IN ('quote', 'new', 'confirmed', 'allocated', 'picked', 'dispatched', 'collected', 'cancelled')),
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT, phone TEXT, email TEXT,
  fulfilment TEXT NOT NULL CHECK (fulfilment IN ('delivery', 'collection')),
  day TEXT,                                  -- ISO date the customer chose, NULL = earliest
  postcode TEXT, address TEXT, access_notes TEXT,
  subtotal REAL, vat REAL, total REAL,
  external_ref TEXT,                         -- the WooCommerce order id, later
  created_by TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE order_lines (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  code TEXT NOT NULL REFERENCES products(code),
  quantity REAL NOT NULL,                    -- in `unit`
  unit TEXT NOT NULL CHECK (unit IN ('pallet', 'box', 'slab', 'bucket', 'piece', 'set', 'm2')),
  mix_counts TEXT,                           -- JSON [n900x600, n600x600, n600x290, n290x290] for a loose mixed set
  base_units REAL NOT NULL,                  -- the quantity in the product's base unit (slabs, boxes, buckets)
  m2 REAL,
  unit_price REAL, line_total REAL
);

-- The ledger. Quantities are in base units, positive in, negative out.
CREATE TABLE movements (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  user_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('goods_in', 'sale', 'dispatch', 'collection', 'breakage', 'adjustment', 'transfer', 'return', 'web_reserve', 'web_release', 'allocate', 'release')),
  code TEXT NOT NULL REFERENCES products(code),
  bay_id TEXT REFERENCES bays(id),
  quantity REAL NOT NULL,
  mix_counts TEXT,
  order_id INTEGER REFERENCES orders(id),
  reference TEXT,                            -- delivery note, count sheet, PO
  note TEXT
);
CREATE INDEX movements_code ON movements(code, at);
CREATE INDEX movements_order ON movements(order_id);

-- Allocations reserve stock without moving it; on hand ignores them, available counts them.
CREATE VIEW stock AS
SELECT p.code,
  COALESCE(SUM(CASE WHEN m.type NOT IN ('allocate', 'release', 'web_reserve', 'web_release') THEN m.quantity END), 0) AS on_hand,
  COALESCE(-SUM(CASE WHEN m.type IN ('allocate', 'release', 'web_reserve', 'web_release') THEN m.quantity END), 0) AS allocated,
  COALESCE(SUM(m.quantity), 0) AS available
FROM products p LEFT JOIN movements m ON m.code = p.code
GROUP BY p.code;

CREATE VIEW stock_by_bay AS
SELECT code, bay_id, SUM(quantity) AS on_hand
FROM movements WHERE type NOT IN ('allocate', 'release', 'web_reserve', 'web_release') AND bay_id IS NOT NULL
GROUP BY code, bay_id;

CREATE TABLE deliveries (
  id INTEGER PRIMARY KEY,
  day TEXT NOT NULL,
  van TEXT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  sequence INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('planned', 'out', 'delivered', 'failed')) DEFAULT 'planned',
  proof_photo TEXT, proof_signature TEXT, signed_name TEXT, delivered_at TEXT, note TEXT
);

CREATE TABLE purchase_orders (
  id INTEGER PRIMARY KEY,
  supplier TEXT NOT NULL, reference TEXT, expected_day TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'received', 'cancelled')) DEFAULT 'open',
  created_by TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE po_lines (
  id INTEGER PRIMARY KEY,
  po_id INTEGER NOT NULL REFERENCES purchase_orders(id),
  code TEXT NOT NULL REFERENCES products(code),
  quantity REAL NOT NULL, received REAL NOT NULL DEFAULT 0
);

CREATE TABLE audit (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  user_email TEXT NOT NULL,
  what TEXT NOT NULL,         -- 'product.update', 'user.create', 'order.status'
  key TEXT,                   -- the code, email or order number
  detail TEXT                 -- JSON
);

INSERT INTO bays (id, name) VALUES ('yard', 'Yard'), ('office', 'Office');
