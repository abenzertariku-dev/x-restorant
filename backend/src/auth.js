import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

export const KEYS = {
  waiter: process.env.WAITER_KEY || '1111',
  manager: process.env.MANAGER_KEY || '2222',
  driver: process.env.DRIVER_KEY || '3333',
};

const sig = (r, e) => crypto.createHmac('sha256', SECRET).update(r + '.' + e).digest('hex');

export function mkCookieValue(role) {
  const e = Date.now() + 12 * 36e5;
  return `${e}.${sig(role, e)}`;
}

export function ok(role, v) {
  if (!v) return false;
  const [e, s] = String(v).split('.');
  if (!e || !s || +e < Date.now()) return false;
  const a = Buffer.from(s);
  const b = Buffer.from(sig(role, e));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hasRole(req, role) {
  if (!KEYS[role]) return false;
  const cookieVal =
    req.cookies?.[`rk_${role}`] ||
    (req.headers.cookie || '').match(new RegExp('(?:^|; )rk_' + role + '=([^;]+)'))?.[1];
  return ok(role, cookieVal);
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!hasRole(req, role)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };
}
