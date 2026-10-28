import fs from 'fs';
import path from 'path';

const F = process.env.DATA_FILE || path.join(process.cwd(), 'data.json');
const G = globalThis;

if (!G.__rest) {
  const db = {
    seq: 100,
    tables: {},
    orders: [],
    loc: null,
    settings: {
      name: 'Our Restaurant',
      intro: 'Fresh food, made with love. Order for delivery or from your table.',
      wifiName: '',
      wifiPass: '',
      bankName: '',
      bankAcc: '',
      tables: 12,
    },
    menu: [
      { id: 1, name: 'Beef Burger', price: 250, desc: 'Beef, cheese, fries', img: '', available: true },
      { id: 2, name: 'Pizza Margherita', price: 300, desc: 'Tomato, mozzarella, basil', img: '', available: true },
      { id: 3, name: 'Fresh Juice', price: 80, desc: 'Mango or avocado', img: '', available: true },
    ],
  };

  try {
    const s = JSON.parse(fs.readFileSync(F, 'utf8'));
    Object.assign(db, s, { settings: { ...db.settings, ...s.settings } });
  } catch {}

  G.__rest = { db, clients: new Set() };
  const t = setInterval(() => G.__rest.clients.forEach((c) => c.send(':\n\n')), 25000);
  t.unref && t.unref();
}

export const S = G.__rest;
export const db = S.db;

export const save = () => {
  try {
    fs.writeFileSync(F, JSON.stringify(db));
  } catch {}
};

export const emit = (kind) => S.clients.forEach((c) => c.send('data:' + JSON.stringify({ kind }) + '\n\n'));

export const publicInfo = () => {
  const s = db.settings;
  return {
    info: { name: s.name, intro: s.intro, bankName: s.bankName, bankAcc: s.bankAcc },
    menu: db.menu.filter((m) => m.available),
  };
};

export const tableInfo = () => ({
  wifiName: db.settings.wifiName,
  wifiPass: db.settings.wifiPass,
  tables: db.settings.tables,
});
