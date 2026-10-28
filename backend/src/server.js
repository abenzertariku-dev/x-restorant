import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { db, save, emit, S, publicInfo, tableInfo } from './store.js';
import { KEYS, mkCookieValue, hasRole, requireRole } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || origin === FRONTEND_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Helpers
const s = (v, n = 100) => String(v ?? '').slice(0, n);

const build = (items) => {
  if (!Array.isArray(items) || !items.length) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }
  let total = 0;
  const lines = items.slice(0, 50).map((x) => {
    const m = db.menu.find((i) => i.id === +x.id && i.available);
    const q = Math.min(99, parseInt(x.qty) || 0);
    if (!m || q < 1) {
      const err = new Error('An item is out of stock or unavailable');
      err.status = 400;
      throw err;
    }
    total += m.price * q;
    return { name: m.name, price: m.price, qty: q };
  });
  return { lines, total };
};

const tid = (id) => {
  if (!/^\d{1,3}$/.test(id) || +id < 1 || +id > db.settings.tables) {
    const err = new Error('Unknown table');
    err.status = 404;
    throw err;
  }
  return id;
};

const tstat = (t, os) => {
  const x = db.tables[t] || {};
  return x.call
    ? 'Call Waiter'
    : x.bill
    ? 'Bill Requested'
    : os.some((o) => o.status === 'Pending Waiter Acceptance')
    ? 'Pending'
    : os.some((o) => o.status === 'Preparing')
    ? 'Preparing'
    : os.some((o) => o.status === 'Served')
    ? 'Served'
    : 'Idle';
};

const find = (id, type) => {
  const o = db.orders.find((o) => o.id === +id && o.type === type);
  if (!o) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  return o;
};

// Rate limiting map for /api/auth (per IP)
const ipFails = new Map();

// --- PUBLIC & CUSTOMER ROUTES ---

// Health check
app.get('/api/health', (req, res) => res.json({ ok: 1, time: Date.now() }));

// Public info & menu
app.get('/api/public-info', (req, res) => {
  res.json(publicInfo());
});

// Table specific info
app.get('/api/table/:id/info', (req, res) => {
  try {
    const id = tid(req.params.id);
    const { info, menu } = publicInfo();
    const t = tableInfo();
    res.json({ id, info, menu, wifi: { name: t.wifiName, pass: t.wifiPass } });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// Auth check
app.get('/api/auth/me', (req, res) => {
  const role = req.query.role;
  res.json({ authenticated: hasRole(req, role) });
});

// Role authentication
app.post('/api/auth', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const attempts = (ipFails.get(ip) || []).filter((t) => now - t < 6e5);

  if (attempts.length >= 10) {
    return res.status(429).json({ error: 'Too many attempts. Wait 10 minutes.' });
  }

  const { role, key } = req.body || {};
  if (!KEYS[role] || KEYS[role] !== key) {
    attempts.push(now);
    ipFails.set(ip, attempts);
    return res.status(401).json({ error: 'Wrong key' });
  }

  ipFails.delete(ip);
  const cookieVal = mkCookieValue(role);

  res.cookie(`rk_${role}`, cookieVal, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 43200 * 1000,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.json({ ok: 1 });
});

// Create delivery order
app.post('/api/orders', (req, res) => {
  try {
    const b = req.body || {};
    const { lines, total } = build(b.items);
    if (!b.name || !b.phone || !b.address) {
      return res.status(400).json({ error: 'Enter name, phone and address' });
    }
    if (!/^data:image\//.test(b.screenshot || '')) {
      return res.status(400).json({ error: 'Payment screenshot is required' });
    }
    const o = {
      id: db.seq++,
      type: 'delivery',
      name: s(b.name),
      phone: s(b.phone, 30),
      address: s(b.address, 300),
      lines,
      total,
      screenshot: b.screenshot,
      status: 'Pending Approval',
      created: Date.now(),
    };
    db.orders.push(o);
    save();
    emit('delivery');
    res.json({ id: o.id });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Create table order
app.post('/api/table/:id/order', (req, res) => {
  try {
    const t = tid(req.params.id);
    const { lines, total } = build(req.body?.items);
    const o = {
      id: db.seq++,
      type: 'table',
      table: t,
      lines,
      total,
      status: 'Pending Waiter Acceptance',
      created: Date.now(),
    };
    db.orders.push(o);
    save();
    emit('table');
    res.json({ id: o.id });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Table call / bill requests
['call', 'bill'].forEach((k) => {
  app.post(`/api/table/:id/${k}`, (req, res) => {
    try {
      const t = tid(req.params.id);
      (db.tables[t] = db.tables[t] || {})[k] = true;
      save();
      emit('table');
      res.json({ ok: 1 });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });
});

// Real-time Server-Sent Events (SSE)
app.get('/api/events', (req, res) => {
  const role = req.query.role;
  if (!hasRole(req, role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const cl = {
    send: (t) => {
      try {
        res.write(t);
      } catch {
        S.clients.delete(cl);
      }
    },
  };

  S.clients.add(cl);
  cl.send(':ok\n\n');

  req.on('close', () => {
    S.clients.delete(cl);
  });
});

// --- WAITER ROUTES ---

app.get('/api/waiter/state', requireRole('waiter'), (req, res) => {
  const tables = Array.from({ length: db.settings.tables }, (_, i) => {
    const id = String(i + 1);
    const os = db.orders.filter((o) => o.type === 'table' && o.table === id && o.status !== 'Closed');
    const x = db.tables[id] || {};
    return { id, call: !!x.call, bill: !!x.bill, status: tstat(id, os), orders: os };
  });
  res.json({ tables });
});

app.post('/api/waiter/orders/:id/accept', requireRole('waiter'), (req, res) => {
  try {
    find(req.params.id, 'table').status = 'Preparing';
    save();
    emit('state');
    res.json({ ok: 1 });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post('/api/waiter/orders/:id/served', requireRole('waiter'), (req, res) => {
  try {
    find(req.params.id, 'table').status = 'Served';
    save();
    emit('state');
    res.json({ ok: 1 });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post('/api/waiter/tables/:id/clear', requireRole('waiter'), (req, res) => {
  const id = req.params.id;
  db.tables[id] = {};
  db.orders.forEach((o) => {
    if (o.type === 'table' && o.table === id && o.status === 'Served') o.status = 'Closed';
  });
  save();
  emit('state');
  res.json({ ok: 1 });
});

// --- MANAGER ROUTES ---

app.get('/api/m/orders', requireRole('manager'), (req, res) => {
  res.json({
    orders: db.orders.filter((o) => o.type === 'delivery').reverse(),
    loc: db.loc,
  });
});

const pend = (id) => {
  const o = find(id, 'delivery');
  if (o.status !== 'Pending Approval') {
    const err = new Error('Already handled');
    err.status = 400;
    throw err;
  }
  return o;
};

app.post('/api/m/orders/:id/approve', requireRole('manager'), (req, res) => {
  try {
    pend(req.params.id).status = 'Assigned';
    save();
    emit('assign');
    emit('state');
    res.json({ ok: 1 });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post('/api/m/orders/:id/reject', requireRole('manager'), (req, res) => {
  try {
    pend(req.params.id).status = 'Rejected';
    save();
    emit('state');
    res.json({ ok: 1 });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get('/api/m/menu', requireRole('manager'), (req, res) => {
  res.json(db.menu);
});

app.post('/api/m/menu', requireRole('manager'), (req, res) => {
  const b = req.body || {};
  const price = +b.price;
  if (!b.name || !(price >= 0)) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const f = {
    name: s(b.name),
    price,
    desc: s(b.desc, 300),
    img: /^data:image\//.test(b.img || '') ? s(b.img, 250000) : '',
  };
  const i = db.menu.find((m) => m.id === +b.id);
  if (i) Object.assign(i, f);
  else db.menu.push({ id: db.seq++, available: true, ...f });
  save();
  emit('state');
  res.json({ ok: 1 });
});

app.post('/api/m/menu/:id/toggle', requireRole('manager'), (req, res) => {
  const i = db.menu.find((m) => m.id === +req.params.id);
  if (!i) return res.status(404).json({ error: 'No item' });
  i.available = !i.available;
  save();
  emit('state');
  res.json({ ok: 1 });
});

app.delete('/api/m/menu/:id', requireRole('manager'), (req, res) => {
  db.menu = db.menu.filter((m) => m.id !== +req.params.id);
  save();
  emit('state');
  res.json({ ok: 1 });
});

app.get('/api/m/settings', requireRole('manager'), (req, res) => {
  res.json(db.settings);
});

app.post('/api/m/settings', requireRole('manager'), (req, res) => {
  const b = req.body || {};
  for (const k of ['name', 'intro', 'wifiName', 'wifiPass', 'bankName', 'bankAcc']) {
    if (k in b) db.settings[k] = s(b[k], k === 'intro' ? 300 : 100);
  }
  if (b.tables) db.settings.tables = Math.min(60, Math.max(1, parseInt(b.tables) || 12));
  save();
  emit('state');
  res.json({ ok: 1 });
});

app.get('/api/m/stats', requireRole('manager'), (req, res) => {
  const ok = db.orders.filter((o) => !['Rejected', 'Pending Approval'].includes(o.status));
  const mon = (t) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getTime();
  };
  const agg = (keys, key, lab) =>
    keys.map((k) => {
      const os = ok.filter((o) => key(o.created) === k);
      return { l: lab(k), n: os.length, rev: os.reduce((a, o) => a + o.total, 0) };
    });
  const w0 = mon(Date.now());
  const weeks = [...Array(8)].map((_, i) => {
    const d = new Date(w0);
    d.setDate(d.getDate() - 7 * (7 - i));
    return d.getTime();
  });
  const now = new Date();
  const months = [...Array(6)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.getFullYear() * 12 + d.getMonth();
  });
  res.json({
    weeks: agg(weeks, mon, (k) =>
      new Date(k).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    ),
    months: agg(
      months,
      (t) => {
        const d = new Date(t);
        return d.getFullYear() * 12 + d.getMonth();
      },
      (k) => new Date(Math.floor(k / 12), k % 12, 1).toLocaleDateString('en', { month: 'short' })
    ),
  });
});

// --- DRIVER ROUTES ---

const NEXT = { Assigned: 'Pickup', Pickup: 'On the Way', 'On the Way': 'Delivered' };

app.get('/api/d/orders', requireRole('driver'), (req, res) => {
  const list = db.orders
    .filter((o) => o.type === 'delivery' && (NEXT[o.status] || o.status === 'Delivered'))
    .reverse()
    .slice(0, 40)
    .map(({ screenshot, ...o }) => o);
  res.json(list);
});

app.post('/api/d/orders/:id/next', requireRole('driver'), (req, res) => {
  try {
    const o = find(req.params.id, 'delivery');
    if (!NEXT[o.status]) return res.status(400).json({ error: 'Cannot advance' });
    o.status = NEXT[o.status];
    save();
    emit('state');
    res.json({ ok: 1 });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post('/api/d/loc', requireRole('driver'), (req, res) => {
  const b = req.body || {};
  if (Number.isFinite(+b.lat) && Number.isFinite(+b.lng)) {
    db.loc = { lat: +b.lat, lng: +b.lng, t: Date.now() };
    emit('state');
    res.json({ ok: 1 });
  } else {
    res.status(400).json({ error: 'Invalid coordinates' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Express backend running on http://localhost:${PORT}`);
  console.log(`👉 Allowed Frontend: ${FRONTEND_URL}`);
});
