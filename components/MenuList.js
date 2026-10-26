'use client';

import { money } from './ui';

export const cartItems = (cart) =>
  Object.entries(cart)
    .filter(([, q]) => q)
    .map(([id, qty]) => ({ id: +id, qty }));

export const cartTotal = (menu, cart) =>
  menu.reduce((s, i) => s + (cart[i.id] || 0) * i.price, 0);

export const cartCount = (cart) => Object.values(cart).reduce((a, b) => a + b, 0);

export function CartBar({ count, total, label, onClick }) {
  return count ? (
    <div className="fixed inset-x-0 bottom-0 z-30 animate-up bg-gradient-to-t from-stone-50 via-stone-50/90 to-transparent p-3 dark:from-stone-950 dark:via-stone-950/90">
      <button
        onClick={onClick}
        className="btn mx-auto flex w-full max-w-3xl justify-between rounded-2xl px-5 py-4 text-base shadow-lg shadow-orange-600/30"
      >
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-sm">{count}</span>
          {label}
        </span>
        <span>{money(total)}</span>
      </button>
    </div>
  ) : null;
}

export default function MenuList({ menu, cart, setCart }) {
  const q = (id, d) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + d) }));
  if (!menu.length)
    return (
      <div className="py-12 text-center text-stone-500">
        <div className="text-4xl">🍽️</div>
        <p className="mt-2">The menu is empty right now.</p>
      </div>
    );
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {menu.map((i, n) => (
        <div
          key={i.id}
          style={{ animationDelay: n * 40 + 'ms' }}
          className="card flex animate-up gap-3 p-3 transition hover:shadow-md"
        >
          {i.img ? (
            <img src={i.img} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl dark:from-orange-900/30 dark:to-amber-900/30">
              🍴
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <b className="truncate">{i.name}</b>
            <p className="line-clamp-2 text-sm text-stone-500">{i.desc}</p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="font-bold text-orange-600 dark:text-orange-400">{money(i.price)}</span>
              {cart[i.id] ? (
                <div className="flex items-center gap-1 rounded-full bg-orange-100 p-0.5 dark:bg-orange-900/40">
                  <button
                    onClick={() => q(i.id, -1)}
                    className="h-8 w-8 rounded-full text-lg font-bold transition active:scale-90"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{cart[i.id]}</span>
                  <button
                    onClick={() => q(i.id, 1)}
                    className="h-8 w-8 rounded-full bg-orange-600 text-lg font-bold text-white transition active:scale-90"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button onClick={() => q(i.id, 1)} className="btn rounded-full px-4 py-1.5 text-sm">
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
