'use client';

import { useEffect, useRef, useState } from 'react';
import { api, toast, lines, money, useData, Badge, Skeleton, Empty } from './ui';

const STEPS = ['Assigned', 'Pickup', 'On the Way', 'Delivered'];
const NEXT = { Assigned: 'Pickup', Pickup: 'On the Way', 'On the Way': 'Delivered' };

export default function Driver() {
  const [d, load] = useData('driver', '/d/orders', ['assign']);
  const [loc, setLoc] = useState(null);
  const [err, setErr] = useState('');
  const last = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) return setErr('Location not supported');
    const w = navigator.geolocation.watchPosition(
      (p) => {
        const c = { lat: p.coords.latitude, lng: p.coords.longitude };
        setLoc(c);
        if (Date.now() - last.current > 15000) {
          last.current = Date.now();
          api('/d/loc', { body: c }).catch(() => {});
        }
      },
      () => setErr('Location unavailable. Allow location permission.'),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(w);
  }, []);

  const next = async (id) => {
    try {
      await api(`/d/orders/${id}/next`, { body: {} });
      toast('Status Updated');
      load();
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-extrabold">🚴 Deliveries</h1>
      <div className="card flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span
            className={
              'absolute inline-flex h-full w-full rounded-full opacity-75 ' +
              (loc ? 'animate-ping bg-emerald-500' : 'bg-stone-400')
            }
          />
          <span
            className={
              'relative inline-flex h-3 w-3 rounded-full ' + (loc ? 'bg-emerald-500' : 'bg-stone-400')
            }
          />
        </span>
        <div className="text-sm">
          {loc ? (
            <>
              Live location: <b>{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</b> ·{' '}
              <a
                className="font-semibold text-orange-600 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
              >
                Open map
              </a>
            </>
          ) : (
            err || 'Locating…'
          )}
        </div>
      </div>
      {!d ? (
        <Skeleton />
      ) : !d.length ? (
        <Empty icon="📦" text="No assigned deliveries yet." />
      ) : (
        d.map((o) => {
          const si = STEPS.indexOf(o.status);
          return (
            <div className="card animate-up space-y-3" key={o.id}>
              <div className="flex items-center justify-between">
                <b>#{o.id} {o.name}</b>
                <Badge s={o.status} />
              </div>
              <div className="flex items-center">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <div
                      className={
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ' +
                        (i <= si ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-500 dark:bg-stone-800')
                      }
                    >
                      {i < si ? '✓' : i + 1}
                    </div>
                    {i < 3 && (
                      <div
                        className={
                          'mx-1 h-1 flex-1 rounded ' +
                          (i < si ? 'bg-orange-600' : 'bg-stone-200 dark:bg-stone-800')
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-medium text-stone-500">
                {STEPS.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="space-y-1 text-sm">
                <a className="flex items-center gap-2 font-semibold text-orange-600" href={'tel:' + o.phone}>
                  📞 {o.phone}
                </a>
                <p>📍 {o.address}</p>
                <p className="text-stone-500">
                  {lines(o)} · <b className="text-stone-900 dark:text-stone-100">{money(o.total)}</b>
                </p>
              </div>
              {NEXT[o.status] && (
                <button className="btn w-full py-3" onClick={() => next(o.id)}>
                  Mark: {NEXT[o.status]}
                </button>
              )}
            </div>
          );
        })
      )}
    </main>
  );
}
