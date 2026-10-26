'use client';
import {api,toast,lines,useData,Badge,Skeleton} from './ui';
const BORDER={'Call Waiter':'border-red-500','Bill Requested':'border-amber-500',Pending:'border-amber-500',Preparing:'border-blue-500',Served:'border-emerald-500',Idle:'border-transparent'};
export default function Waiter(){const[d,load]=useData('waiter','/waiter/state',['table']);
 const act=async p=>{try{await api(p,{body:{}});toast('Status Updated');load()}catch(e){toast(e.message)}};
 if(!d)return<Skeleton/>;
 const alerts=d.tables.filter(t=>t.call||t.bill||t.status==='Pending').length;
 return<main className="mx-auto max-w-6xl p-4"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-2xl font-extrabold">Tables</h1><p className="text-sm text-stone-500">Tap anywhere once to enable the alert sound 🔔</p></div>
  <span className={'badge px-4 py-1.5 text-sm '+(alerts?'animate-pulse bg-red-100 text-red-800':'bg-emerald-100 text-emerald-800')}>{alerts?`${alerts} need attention`:'All calm'}</span></div>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{d.tables.map(t=><div key={t.id} className={'card animate-up border-l-4 transition '+BORDER[t.status]+(t.call||t.bill||t.status==='Pending'?' shadow-lg':'')}>
   <div className="flex items-center justify-between"><b className="text-lg">Table {t.id}</b><Badge s={t.status} pulse={t.call||t.bill}/></div>
   <div className="mt-1 flex flex-wrap gap-1">{t.call&&<Badge s="Call Waiter" pulse/>}{t.bill&&<Badge s="Bill Requested" pulse/>}</div>
   {t.orders.map(o=><div key={o.id} className="mt-3 rounded-xl bg-stone-100 p-3 dark:bg-stone-800"><p className="text-sm">{lines(o)}</p>
    <div className="mt-2 flex items-center justify-between"><Badge s={o.status}/>
     {o.status.startsWith('Pending')&&<button className="btn px-4 py-1.5 text-sm" onClick={()=>act(`/waiter/orders/${o.id}/accept`)}>Accept</button>}
     {o.status==='Preparing'&&<button className="btn px-4 py-1.5 text-sm" onClick={()=>act(`/waiter/orders/${o.id}/served`)}>Mark served</button>}</div></div>)}
   {t.status!=='Idle'&&<button className="btn-ghost mt-3 w-full py-1.5 text-sm" onClick={()=>act(`/waiter/tables/${t.id}/clear`)}>Clear table</button>}</div>)}</div></main>}
