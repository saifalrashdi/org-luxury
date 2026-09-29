'use strict';
/**
 * server.js — Org Luxury storefront + admin API.
 * Express 4 + better-sqlite3. No build step, no external services.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const { db, LOCATIONS, ZONES, getFees, toAED, locationById } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jiwan2026';
const SESSION_SECRET = process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(`orglux:${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).digest('hex');
const WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER || '971500000000').replace(/[^0-9]/g, '');
const COOKIE_NAME = 'orglux_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', index: 'index.html' }));

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */
function bad(res, status, message) { return res.status(status).json({ error: message }); }
function s(v, max = 500) { return String(v == null ? '' : v).trim().slice(0, max); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : NaN; }
function boolInt(v) { return v ? 1 : 0; }

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function sign(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}
function timingSafeEq(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}
function isAuthed(req) {
  const raw = parseCookies(req)[COOKIE_NAME];
  if (!raw) return false;
  const [user, exp, sig] = raw.split('.');
  if (!user || !exp || !sig) return false;
  const payload = `${user}.${exp}`;
  const expected = sign(payload);
  if (!timingSafeEq(sig, expected)) return false;
  if (Number(exp) < Date.now()) return false;
  return user === ADMIN_USERNAME;
}
function requireAdmin(req, res, next) {
  if (!isAuthed(req)) return bad(res, 401, 'Not authenticated');
  next();
}

const PRODUCT_PUBLIC = `
  SELECT id, name, name_ar, brand, category, price, currency, stock,
         description, description_ar, image, featured
  FROM products WHERE hidden = 0`;

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */
app.get('/api/config', (req, res) => {
  res.json({
    whatsapp: WHATSAPP_NUMBER,
    zones: ZONES,
    locations: LOCATIONS,
  });
});

app.get('/api/products', (req, res) => {
  const { category, q, featured } = req.query;
  let sql = PRODUCT_PUBLIC;
  const params = {};
  if (category && category !== 'all') { sql += ' AND category = @category'; params.category = s(category, 40); }
  if (featured === '1') { sql += ' AND featured = 1'; }
  if (q) {
    sql += ` AND (name LIKE @q OR name_ar LIKE @q OR brand LIKE @q OR description LIKE @q)`;
    params.q = `%${s(q, 80)}%`;
  }
  sql += ' ORDER BY featured DESC, id ASC';
  res.json(db.prepare(sql).all(params));
});

app.get('/api/products/:id', (req, res) => {
  const p = db.prepare(`${PRODUCT_PUBLIC} AND id = ?`).get(n(req.params.id));
  if (!p) return bad(res, 404, 'Product not found');
  res.json(p);
});

app.get('/api/shipping-fees', (req, res) => res.json(getFees()));

app.post('/api/interest', (req, res) => {
  const productId = n(req.body && req.body.product_id);
  const name = s(req.body && req.body.name, 120);
  const contact = s(req.body && req.body.contact, 160);
  if (!Number.isInteger(productId) || productId < 1) return bad(res, 400, 'Invalid product');
  if (!name || !contact) return bad(res, 400, 'Name and contact are required');
  const p = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!p) return bad(res, 404, 'Product not found');
  db.prepare('INSERT INTO interest_requests (product_id, name, contact) VALUES (?, ?, ?)')
    .run(productId, name, contact);
  res.json({ ok: true });
});

const PAYMENT_METHODS = ['cod', 'applepay', 'visa'];

app.post('/api/orders', (req, res) => {
  const b = req.body || {};
  const customerName = s(b.customer_name, 120);
  const phone = s(b.phone, 60);
  const email = s(b.email, 160);
  const address = s(b.address, 400);
  const notes = s(b.notes, 600);
  const location = s(b.location, 60);
  const paymentMethod = s(b.payment_method, 20);
  const newsletter = boolInt(b.newsletter);
  const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];

  if (!customerName) return bad(res, 400, 'Name is required');
  if (!phone) return bad(res, 400, 'Phone is required');
  if (!address) return bad(res, 400, 'Address is required');
  const loc = locationById(location);
  if (!loc) return bad(res, 400, 'Please choose a delivery area');
  if (!PAYMENT_METHODS.includes(paymentMethod)) return bad(res, 400, 'Invalid payment method');
  if (items.length === 0) return bad(res, 400, 'Cart is empty');

  // Validate items and compute totals server-side (never trust the client).
  const lines = [];
  for (const it of items) {
    const pid = n(it.product_id);
    const qty = Math.floor(n(it.qty));
    if (!Number.isInteger(pid) || pid < 1 || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return bad(res, 400, 'Invalid cart item');
    }
    const p = db.prepare('SELECT * FROM products WHERE id = ? AND hidden = 0').get(pid);
    if (!p) return bad(res, 400, `Product #${pid} is no longer available`);
    if (p.stock < qty) return bad(res, 409, `"${p.name}" has only ${p.stock} left in stock`);
    lines.push({ product: p, qty });
  }

  const fees = getFees();
  const shippingFee = fees[loc.zone] != null ? fees[loc.zone] : 0;
  const subtotal = lines.reduce((sum, l) => sum + toAED(l.product.price, l.product.currency) * l.qty, 0);
  const total = Math.round((subtotal + shippingFee) * 100) / 100;
  const orderNo = 'OL-' + Date.now().toString(36).toUpperCase() + '-' +
    crypto.randomBytes(2).toString('hex').toUpperCase();

  const place = db.transaction(() => {
    const info = db.prepare(`INSERT INTO orders
      (order_no, customer_name, phone, email, address, notes, location, shipping_zone,
       shipping_fee, payment_method, newsletter, subtotal, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`)
      .run(orderNo, customerName, phone, email, address, notes, location, loc.zone,
        shippingFee, paymentMethod, newsletter, subtotal, total);
    const orderId = info.lastInsertRowid;
    const insItem = db.prepare(`INSERT INTO order_items
      (order_id, product_id, name, price, currency, qty) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const l of lines) {
      insItem.run(orderId, l.product.id, l.product.name, l.product.price, l.product.currency, l.qty);
    }
    return orderId;
  });

  try {
    const orderId = place();
    res.json({ ok: true, order_no: orderNo, id: orderId, subtotal, shipping_fee: shippingFee, total, payment_method: paymentMethod });
  } catch (e) {
    console.error('[orders] failed:', e);
    bad(res, 500, 'Could not place the order. Please try again.');
  }
});

app.get('/api/orders/:orderNo', (req, res) => {
  const o = db.prepare(`SELECT order_no, customer_name, location, shipping_zone, shipping_fee,
    payment_method, subtotal, total, status, created_at FROM orders WHERE order_no = ?`)
    .get(s(req.params.orderNo, 40));
  if (!o) return bad(res, 404, 'Order not found');
  const items = db.prepare('SELECT name, price, currency, qty FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_no = ?)')
    .all(o.order_no);
  res.json({ ...o, items });
});

/* ------------------------------------------------------------------ */
/* Admin auth                                                          */
/* ------------------------------------------------------------------ */
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!timingSafeEq(s(username, 80), ADMIN_USERNAME) || !timingSafeEq(s(password, 120), ADMIN_PASSWORD)) {
    return bad(res, 401, 'Wrong username or password');
  }
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${ADMIN_USERNAME}.${exp}`;
  const cookie = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(cookie)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`);
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
  res.json({ ok: true });
});

app.get('/api/admin/session', (req, res) => res.json({ authenticated: isAuthed(req) }));

/* ------------------------------------------------------------------ */
/* Admin: orders                                                       */
/* ------------------------------------------------------------------ */
const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  for (const o of orders) o.items = itemsStmt.all(o.id);
  res.json(orders);
});

app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const id = n(req.params.id);
  const next = s(req.body && req.body.status, 20);
  if (!ORDER_STATUSES.includes(next)) return bad(res, 400, 'Invalid status');
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return bad(res, 404, 'Order not found');
  const prev = order.status;
  if (prev === next) return res.json({ ok: true, status: next });

  // Stock rules: deduct when marked completed; restore if a completed order is cancelled.
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  const apply = db.transaction(() => {
    if (next === 'completed' && prev !== 'completed') {
      for (const it of items) {
        if (!it.product_id) continue;
        const r = db.prepare(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'
        ).run(it.qty, it.product_id, it.qty);
        if (r.changes === 0) {
          throw new Error(`Not enough stock for "${it.name}" (needs ${it.qty})`);
        }
      }
    }
    if (prev === 'completed' && next === 'cancelled') {
      for (const it of items) {
        if (!it.product_id) continue;
        db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(it.qty, it.product_id);
      }
    }
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(next, id);
  });

  try {
    apply();
    res.json({ ok: true, status: next });
  } catch (e) {
    bad(res, 409, e.message || 'Could not update status');
  }
});

/* ------------------------------------------------------------------ */
/* Admin: products / inventory                                         */
/* ------------------------------------------------------------------ */
app.get('/api/admin/products', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY id DESC').all());
});

const PRODUCT_CATEGORIES = ['rolex', 'patek', 'richard-mille', 'vintage', 'jewelry'];
const CURRENCIES = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'CHF'];

function saveBase64Image(dataUrl) {
  const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/i.exec(String(dataUrl || ''));
  if (!m) throw new Error('Image must be a PNG, JPG or WebP data URL');
  const ext = m[1].toLowerCase().replace('jpeg', 'jpg');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 8 * 1024 * 1024) throw new Error('Image is too large (max 8 MB)');
  const dir = path.join(__dirname, 'public', 'images', 'products');
  fs.mkdirSync(dir, { recursive: true });
  const fname = `upload-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(dir, fname), buf);
  return `/images/products/${fname}`;
}

function validateProductBody(b) {
  const p = {
    name: s(b.name, 160),
    name_ar: s(b.name_ar, 200),
    brand: s(b.brand, 80),
    category: s(b.category, 40),
    price: n(b.price),
    currency: s(b.currency || 'AED', 8).toUpperCase(),
    stock: Math.floor(n(b.stock)),
    description: s(b.description, 1200),
    description_ar: s(b.description_ar, 1400),
    featured: boolInt(b.featured),
    hidden: boolInt(b.hidden),
  };
  if (!p.name) return { error: 'Name is required' };
  if (!PRODUCT_CATEGORIES.includes(p.category)) return { error: 'Invalid category' };
  if (!Number.isFinite(p.price) || p.price < 0) return { error: 'Invalid price' };
  if (!CURRENCIES.includes(p.currency)) return { error: 'Invalid currency' };
  if (!Number.isInteger(p.stock) || p.stock < 0) return { error: 'Invalid stock' };
  return { value: p };
}

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const b = req.body || {};
  const { value: p, error } = validateProductBody(b);
  if (error) return bad(res, 400, error);
  let image = '';
  if (b.image_data) {
    try { image = saveBase64Image(b.image_data); } catch (e) { return bad(res, 400, e.message); }
  } else if (b.image) {
    image = s(b.image, 300);
  }
  const info = db.prepare(`INSERT INTO products
    (name, name_ar, brand, category, price, currency, stock, description, description_ar, image, featured, hidden)
    VALUES (@name, @name_ar, @brand, @category, @price, @currency, @stock, @description, @description_ar, @image, @featured, @hidden)`)
    .run({ ...p, image });
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
  const id = n(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return bad(res, 404, 'Product not found');
  const b = req.body || {};
  const merged = { ...existing, ...b };
  const { value: p, error } = validateProductBody(merged);
  if (error) return bad(res, 400, error);
  let image = existing.image;
  if (b.image_data) {
    try { image = saveBase64Image(b.image_data); } catch (e) { return bad(res, 400, e.message); }
  } else if (typeof b.image === 'string' && b.image) {
    image = s(b.image, 300);
  }
  db.prepare(`UPDATE products SET
      name=@name, name_ar=@name_ar, brand=@brand, category=@category, price=@price,
      currency=@currency, stock=@stock, description=@description, description_ar=@description_ar,
      image=@image, featured=@featured, hidden=@hidden
    WHERE id=@id`).run({ ...p, image, id });
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const id = n(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return bad(res, 404, 'Product not found');
  const used = db.prepare('SELECT COUNT(*) AS c FROM order_items WHERE product_id = ?').get(id).c;
  if (used > 0) {
    return bad(res, 409,
      `"${existing.name}" appears in ${used} past order item(s) and cannot be deleted. Hide it instead.`);
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* Admin: interest requests                                            */
/* ------------------------------------------------------------------ */
app.get('/api/admin/interest', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT ir.id, ir.name, ir.contact, ir.created_at,
           p.id AS product_id, p.name AS product_name, p.name_ar AS product_name_ar, p.stock
    FROM interest_requests ir
    LEFT JOIN products p ON p.id = ir.product_id
    ORDER BY p.id, ir.id DESC`).all();
  const grouped = {};
  for (const r of rows) {
    const key = r.product_id || 0;
    if (!grouped[key]) {
      grouped[key] = {
        product_id: r.product_id,
        product_name: r.product_name || '(deleted product)',
        product_name_ar: r.product_name_ar || '',
        stock: r.stock,
        requests: [],
      };
    }
    grouped[key].requests.push({ id: r.id, name: r.name, contact: r.contact, created_at: r.created_at });
  }
  res.json(Object.values(grouped));
});

/* ------------------------------------------------------------------ */
/* Admin: shipping fees                                                */
/* ------------------------------------------------------------------ */
app.put('/api/admin/shipping', requireAdmin, (req, res) => {
  const fees = (req.body && req.body.fees) || {};
  const upd = db.prepare(`INSERT INTO shipping_fees (zone, fee) VALUES (?, ?)
    ON CONFLICT(zone) DO UPDATE SET fee = excluded.fee`);
  const tx = db.transaction(() => {
    for (const zone of ZONES) {
      const fee = n(fees[zone]);
      if (!Number.isFinite(fee) || fee < 0 || fee > 100000) {
        throw new Error(`Invalid fee for zone "${zone}"`);
      }
      upd.run(zone, fee);
    }
  });
  try { tx(); res.json({ ok: true, fees: getFees() }); }
  catch (e) { bad(res, 400, e.message); }
});

/* ------------------------------------------------------------------ */
/* SPA fallback (hash routing means "/" is enough, but be safe)        */
/* ------------------------------------------------------------------ */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[org-luxury] listening on http://localhost:${PORT}`);
  console.log(`[org-luxury] admin panel: http://localhost:${PORT}/#/admin (user: ${ADMIN_USERNAME})`);
});
