import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

export const KEYS = {
  waiter: process.env.WAITER_KEY || '1111',
  manager: process.env.MANAGER_KEY || '2222',
  driver: process.env.DRIVER_KEY || '3333',
};

const sig = (r, e) => crypto.createHmac('sha256', SECRET).update(r + '.' + e).digest('hex');

export function mkCookie(role) {
  const e = Date.now() + 12 * 36e5;
  return (
    `rk_${role}=${e}.${sig(role, e)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200` +
    (process.env.NODE_ENV === 'production' ? '; Secure' : '')
  );
}

function ok(role, v) {
  if (!v) return false;
  const [e, s] = v.split('.');
  if (!e || !s || +e < Date.now()) return false;
  const a = Buffer.from(s);
  const b = Buffer.from(sig(role, e));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hasRole(req, role) {
  if (!KEYS[role]) return false;
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|; )rk_' + role + '=([^;]+)'));
  return ok(role, m && m[1]);
}

export const pageHas = (role) => ok(role, cookies().get('rk_' + role)?.value);
