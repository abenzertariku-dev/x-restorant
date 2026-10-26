'use client';

import { useState } from 'react';
import { api, toast, lines, money, shrink, useData, Badge, Skeleton, Empty } from './ui';

const act = async (p, body, after, method) => {
  try {
    await api(p, { body: body || {}, method });
    toast('Status Updated');
    after && after();
  } catch (e) {
    toast(e.message);
  }
};

function Orders() {
  const [d, load] = useData('manager', '/m/orders', ['delivery']);
  if (!d) return <Skeleton />;
  return (
    <div className="space-y-3">
      {d.loc && (
        <div className="card flex items-center gap-2 text-sm">
          🚴 Driver location:{' '}
          <a
            className="font-semibold text-orange-600 underline"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.google.com/maps?q=${d.loc.lat},${d.loc.lng}`}
          >
            {d.loc.lat.toFixed(4)}, {d.loc.lng.toFixed(4)}
          </a>
        </div>
      )}
      {!d.orders.length && <Empty text="No delivery orders yet." />}
      {d.orders.map((o) => (
        <div className="card animate-up space-y-3 sm:flex sm:gap-4 sm:space-y-0" key={o.id}>
          <a href={o.screenshot} target="_blank" rel="noopener noreferrer" className="block shrink-0">
            <img
              src={o.screenshot}
              alt="Payment screenshot"
              className="h-40 w-full rounded-xl object-cover ring-1 ring-stone-200 sm:w-32 dark:ring-stone-700"
            />
          </a>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <b>
                #{o.id} {o.name}
              </b>
              <Badge s={o.status} />
            </div>
            <a className="block text-sm font-semibold text-orange-600" href={'tel:' + o.phone}>
              📞 {o.phone}
            </a>
            <p className="text-sm">📍 {o.address}</p>
            <p className="text-sm text-stone-500">{lines(o)}</p>
            <p className="font-bold">{money(o.total)}</p>
            {o.status === 'Pending Approval' && (
              <div className="flex flex-wrap gap-2 pt-2">
                <button className="btn" onClick={() => act(`/m/orders/${o.id}/approve`, 0, load)}>
                  ✓ Approve & assign to driver
                </button>
                <button className="btn-ghost" onClick={() => act(`/m/orders/${o.id}/reject`, 0, load)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const E = { id: '', name: '', price: '', desc: '', img: '' };

function MenuTab() {
  const [d, load] = useData('manager', '/m/menu');
  const [f, setF] = useState(E);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function pick(e) {
    const x = e.target.files[0];
    if (x)
      try {
        setF({ ...f, img: await shrink(x, 500) });
      } catch {
        toast('Could not read image');
      }
  }

  async function save() {
    try {
      await api('/m/menu', { body: f });
      toast('Status Updated');
      setF(E);
      load();
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h3 className="font-bold">{f.id ? '✏️ Edit item' : '➕ Add item'}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Name" value={f.name} onChange={set('name')} />
          <input
            className="input"
            type="number"
            placeholder="Price (ETB)"
            value={f.price}
            onChange={set('price')}
          />
        </div>
        <input className="input" placeholder="Description" value={f.desc} onChange={set('desc')} />
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-stone-300 p-3 text-sm text-stone-500 hover:border-orange-500 dark:border-stone-700">
          {f.img ? (
            <img className="h-16 w-16 rounded-lg object-cover" src={f.img} alt="" />
          ) : (
            <span className="text-2xl">📷</span>
          )}
          <span>{f.img ? 'Change photo' : 'Upload a photo (optional)'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={pick} />
        </label>
        <div className="flex gap-2">
          <button className="btn" onClick={save}>
            Save item
          </button>
          {f.id && (
            <button className="btn-ghost" onClick={() => setF(E)}>
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(d || []).map((i) => (
          <div className="card flex animate-up gap-3" key={i.id}>
            {i.img ? (
              <img className="h-16 w-16 shrink-0 rounded-xl object-cover" src={i.img} alt="" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl dark:bg-orange-900/30">
                🍴
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <b className="truncate">{i.name}</b>
                <span
                  className={
                    'badge ' +
                    (i.available ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600')
                  }
                >
                  {i.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <p className="text-sm font-semibold text-orange-600">{money(i.price)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  className="btn-ghost px-3 py-1 text-xs"
                  onClick={() => {
                    setF({ id: i.id, name: i.name, price: i.price, desc: i.desc, img: i.img });
                    scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-ghost px-3 py-1 text-xs"
                  onClick={() => act(`/m/menu/${i.id}/toggle`, 0, load)}
                >
                  {i.available ? 'Mark out of stock' : 'Mark in stock'}
                </button>
                <button
                  className="btn-ghost px-3 py-1 text-xs text-red-600"
                  onClick={() => confirm('Delete this item?') && act(`/m/menu/${i.id}`, 0, load, 'DELETE')}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const F = [
  ['name', 'Restaurant name'],
  ['intro', 'Intro text on the home page'],
  ['wifiName', 'WiFi name'],
  ['wifiPass', 'WiFi password'],
  ['bankName', 'Bank account holder name'],
  ['bankAcc', 'Bank account number'],
  ['tables', 'Number of tables'],
];

function SettingsTab() {
  const [d] = useData('manager', '/m/settings');
  return d ? <Form init={d} /> : <Skeleton />;
}

function Form({ init }) {
  const [f, setF] = useState(init);
  return (
    <div className="card grid gap-4 sm:grid-cols-2">
      {F.map(([k, l]) => (
        <div key={k} className={k === 'intro' ? 'sm:col-span-2' : ''}>
          <label className="label">{l}</label>
          <input className="input" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
        </div>
      ))}
      <div className="sm:col-span-2">
        <button className="btn" onClick={() => act('/m/settings', f)}>
          Save settings
        </button>
      </div>
    </div>
  );
}

function Bars({ rows, k }) {
  const mx = Math.max(1, ...rows.map((r) => r[k]));
  return (
    <svg viewBox={`0 0 ${rows.length * 60} 125`} className="w-full">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {rows.map((r, i) => {
        const h = (r[k] / mx) * 70;
        return (
          <g key={i}>
            <rect x={i * 60 + 10} y={90 - h} width="40" height={Math.max(h, 2)} rx="6" fill="url(#bg)" />
            <text
              x={i * 60 + 30}
              y={85 - h}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="currentColor"
            >
              {r[k]}
            </text>
            <text
              x={i * 60 + 30}
              y="108"
              textAnchor="middle"
              fontSize="10"
              opacity=".6"
              fill="currentColor"
            >
              {r.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Reports() {
  const [d] = useData('manager', '/m/stats', ['state']);
  if (!d) return <Skeleton />;
  const sum = (r, k) => r.reduce((a, x) => a + x[k], 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Orders (8 weeks)', sum(d.weeks, 'n'), '🧾'],
          ['Revenue (8 weeks)', money(sum(d.weeks, 'rev')), '💰'],
        ].map(([l, v, e]) => (
          <div key={l} className="card">
            <p className="text-sm text-stone-500">
              {e} {l}
            </p>
            <p className="text-2xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ['week', d.weeks],
          ['month', d.months],
        ].map(([n, rows]) => (
          <div className="card space-y-2" key={n}>
            <h3 className="font-bold">Orders per {n}</h3>
            <Bars rows={rows} k="n" />
            <h3 className="font-bold">Revenue per {n} (ETB)</h3>
            <Bars rows={rows} k="rev" />
          </div>
        ))}
      </div>
    </div>
  );
}

const T = {
  orders: ['🧾', 'Orders', Orders],
  menu: ['🍔', 'Menu', MenuTab],
  settings: ['⚙️', 'Settings', SettingsTab],
  reports: ['📊', 'Reports', Reports],
};

export default function Manager() {
  const [tab, setTab] = useState('orders');
  const C = T[tab][2];
  return (
    <div>
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto p-2">
          {Object.entries(T).map(([k, [e, l]]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                'flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ' +
                (k === tab
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800')
              }
            >
              {e} {l}
            </button>
          ))}
        </div>
      </div>
      <main className="mx-auto max-w-5xl p-4">
        <C key={tab} />
      </main>
    </div>
  );
}
