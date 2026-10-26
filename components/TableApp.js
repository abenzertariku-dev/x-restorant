'use client';

import { useState } from 'react';
import MenuList, { cartItems, cartTotal, cartCount, CartBar } from './MenuList';
import { api, money, copy, toast, Hero } from './ui';

const L = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const win = (b) => {
  for (const [a, c, d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
};

function aiPick(b) {
  const e = [...b.keys()].filter((i) => !b[i]);
  const tr = (p) =>
    e.find((k) => {
      const c = [...b];
      c[k] = p;
      return win(c) === p;
    });
  return tr('O') ?? tr('X') ?? (e.includes(4) ? 4 : e[Math.floor(Math.random() * e.length)]);
}

function TTT() {
  const [mode, setMode] = useState('ai');
  const [b, setB] = useState(Array(9).fill(''));
  const [t, setT] = useState('X');
  const w = win(b);
  const draw = !w && b.every(Boolean);
  const over = w || draw;
  const reset = (m) => {
    setMode(m);
    setB(Array(9).fill(''));
    setT('X');
  };
  function move(i) {
    if (over || b[i]) return;
    const nb = [...b];
    nb[i] = t;
    let nt = t === 'X' ? 'O' : 'X';
    if (mode === 'ai' && !win(nb) && nb.some((x) => !x)) {
      nb[aiPick(nb)] = 'O';
      nt = 'X';
    }
    setB(nb);
    setT(nt);
  }
  return (
    <div className="card animate-up space-y-4 text-center">
      <h2 className="text-xl font-bold">Tic-Tac-Toe</h2>
      <div className="inline-flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
        {[
          ['ai', 'vs Computer'],
          ['2p', '2 Players'],
        ].map(([m, l]) => (
          <button
            key={m}
            onClick={() => reset(m)}
            className={
              'rounded-lg px-4 py-1.5 text-sm font-semibold transition ' +
              (mode === m ? 'bg-white shadow dark:bg-stone-700' : 'text-stone-500')
            }
          >
            {l}
          </button>
        ))}
      </div>
      <p className="h-6 font-semibold">{w ? `🎉 ${w} wins!` : draw ? '🤝 Draw!' : `Turn: ${t}`}</p>
      <div className="mx-auto grid w-64 grid-cols-3 gap-2">
        {b.map((c, i) => (
          <button
            key={i}
            onClick={() => move(i)}
            className={
              'aspect-square rounded-2xl bg-stone-100 text-4xl font-extrabold transition hover:bg-stone-200 active:scale-95 dark:bg-stone-800 dark:hover:bg-stone-700 ' +
              (c === 'X' ? 'text-orange-600' : 'text-sky-500')
            }
          >
            {c}
          </button>
        ))}
      </div>
      <button className="btn-ghost" onClick={() => reset(mode)}>
        Restart
      </button>
    </div>
  );
}

const Row = ({ label, v }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-stone-100 p-3 dark:bg-stone-800">
    <div className="min-w-0">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="truncate text-lg font-bold">{v || '—'}</p>
    </div>
    <button className="btn px-3 py-1.5 text-sm" onClick={() => copy(v)}>
      Copy
    </button>
  </div>
);

const TILES = [
  ['menu', '🍔', 'Menu & Order', 'from-orange-500 to-red-500'],
  ['wifi', '📶', 'WiFi', 'from-sky-500 to-blue-600'],
  ['games', '🎮', 'Games', 'from-violet-500 to-purple-600'],
  ['pay', '💳', 'Payment Info', 'from-emerald-500 to-teal-600'],
  ['bill', '🧾', 'Request Bill', 'from-amber-500 to-orange-500'],
  ['call', '🔔', 'Call Waiter', 'from-rose-500 to-pink-600'],
];

export default function TableApp({ id, info, menu, wifi }) {
  const [view, setView] = useState('');
  const [cart, setCart] = useState({});
  const [note, setNote] = useState('');
  const total = cartTotal(menu, cart);
  const count = cartCount(cart);

  async function post(p, body, msg) {
    try {
      await api('/table/' + id + p, { body: body || {} });
      toast(msg);
      return true;
    } catch (e) {
      toast(e.message);
    }
  }

  async function send() {
    if (!total) return toast('Add items first');
    if (await post('/order', { items: cartItems(cart) }, 'Order Sent')) {
      setCart({});
      setView('');
      setNote('✅ Order sent. A waiter will confirm it shortly.');
    }
  }

  async function tap(k) {
    if (k === 'bill') {
      if (await post('/bill', 0, 'Bill Requested')) setNote('🧾 Bill requested. A waiter is on the way.');
    } else if (k === 'call') {
      if (await post('/call', 0, 'Waiter notified')) setNote('🔔 Waiter has been notified');
    } else {
      setNote('');
      setView(k);
    }
  }

  return (
    <>
      <Hero title={info.name} sub={`Welcome! You are at Table ${id}`} />
      <main className="relative mx-auto -mt-8 max-w-3xl px-4 pb-32">
        {!view ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TILES.map(([k, e, l, g], n) => (
                <button
                  key={k}
                  onClick={() => tap(k)}
                  style={{ animationDelay: n * 50 + 'ms' }}
                  className={`flex aspect-[4/3] animate-up flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${g} p-3 text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95`}
                >
                  <span className="text-4xl drop-shadow">{e}</span>
                  <span className="font-bold">{l}</span>
                </button>
              ))}
            </div>
            {note && <div className="card animate-up border-l-4 border-orange-500 font-medium">{note}</div>}
          </div>
        ) : (
          <div className="space-y-4">
            <button className="btn-ghost" onClick={() => setView('')}>
              ← Back
            </button>
            {view === 'menu' && (
              <>
                <h2 className="text-xl font-bold">Menu</h2>
                <MenuList menu={menu} cart={cart} setCart={setCart} />
                <CartBar count={count} total={total} label="Send order" onClick={send} />
              </>
            )}
            {view === 'wifi' && (
              <div className="card animate-up space-y-3">
                <h2 className="text-xl font-bold">📶 WiFi</h2>
                <Row label="Network name" v={wifi.name} />
                <Row label="Password" v={wifi.pass} />
              </div>
            )}
            {view === 'pay' && (
              <div className="card animate-up space-y-3">
                <h2 className="text-xl font-bold">💳 Payment info</h2>
                <Row label="Account name" v={info.bankName} />
                <Row label="Account number" v={info.bankAcc} />
                <p className="text-sm text-stone-500">
                  Show your payment screenshot to the waiter, or pay them directly.
                </p>
              </div>
            )}
            {view === 'games' && <TTT />}
          </div>
        )}
      </main>
    </>
  );
}
