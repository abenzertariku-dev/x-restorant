'use client';
import {useState,useEffect} from 'react';import MenuList,{cartItems,cartTotal,cartCount,CartBar} from './MenuList';import {api,money,copy,shrink,toast,Hero} from './ui';
const Steps=({n})=><div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold">{['Menu','Checkout','Done'].map((s,i)=><div key={s} className="flex items-center gap-2"><span className={'flex h-6 w-6 items-center justify-center rounded-full '+(i<=n?'bg-orange-600 text-white':'bg-stone-200 text-stone-500 dark:bg-stone-800')}>{i+1}</span><span className={i<=n?'':'text-stone-400'}>{s}</span>{i<2&&<span className="h-px w-6 bg-stone-300 dark:bg-stone-700"/>}</div>)}</div>;
export default function Delivery({info,menu}){
 const[cart,setCart]=useState({}),[step,setStep]=useState('menu'),[f,setF]=useState({name:'',phone:'',address:''}),[file,setFile]=useState(null),[prev,setPrev]=useState(''),[done,setDone]=useState(null),[busy,setBusy]=useState(false);
 const total=cartTotal(menu,cart),count=cartCount(cart),set=k=>e=>setF({...f,[k]:e.target.value});
 useEffect(()=>{if(!file)return setPrev('');const u=URL.createObjectURL(file);setPrev(u);return()=>URL.revokeObjectURL(u)},[file]);
 async function place(){if(!file)return toast('Attach the payment screenshot');setBusy(true);
  try{const j=await api('/orders',{body:{...f,items:cartItems(cart),screenshot:await shrink(file)}});setCart({});setDone(j.id);toast('Order Sent')}catch(e){toast(e.message)}setBusy(false)}
 return<><Hero title={info.name} sub={info.intro}/><main className="relative mx-auto -mt-8 max-w-3xl px-4 pb-32">
 <Steps n={done?2:step==='menu'?0:1}/>
 {done?<div className="card animate-up py-10 text-center"><div className="text-6xl">🎉</div><h2 className="mt-3 text-2xl font-bold">Order sent!</h2><p className="mt-2 text-stone-500">Order #{done} is waiting for approval. We will call you on the number you gave.</p><button className="btn mt-6" onClick={()=>{setDone(null);setStep('menu');setFile(null)}}>Order again</button></div>
 :step==='menu'?<><h2 className="mb-3 text-xl font-bold">Our menu</h2><MenuList menu={menu} cart={cart} setCart={setCart}/><CartBar count={count} total={total} label="Checkout" onClick={()=>setStep('checkout')}/></>
 :<div className="animate-up space-y-4"><h2 className="text-xl font-bold">Checkout</h2>
  <div className="card flex items-center justify-between"><span className="text-stone-500">Total to pay</span><b className="text-xl text-orange-600">{money(total)}</b></div>
  <div className="rounded-2xl bg-gradient-to-br from-stone-800 to-stone-950 p-5 text-white shadow-lg"><p className="text-xs uppercase tracking-widest text-white/60">Pay to this account</p>
   <p className="mt-2 flex items-center justify-between gap-2"><span>{info.bankName||'—'}</span><button className="rounded-lg bg-white/15 px-3 py-1 text-xs" onClick={()=>copy(info.bankName)}>Copy</button></p>
   <p className="mt-1 flex items-center justify-between gap-2 text-xl font-bold tracking-wider"><span>{info.bankAcc||'—'}</span><button className="rounded-lg bg-white/15 px-3 py-1 text-xs font-normal tracking-normal" onClick={()=>copy(info.bankAcc)}>Copy</button></p></div>
  <div className="card space-y-3"><div><label className="label">Your name</label><input className="input" value={f.name} onChange={set('name')}/></div>
   <div><label className="label">Phone number</label><input className="input" type="tel" value={f.phone} onChange={set('phone')}/></div>
   <div><label className="label">Delivery address</label><textarea className="input" rows="3" value={f.address} onChange={set('address')}/></div>
   <div><label className="label">Payment screenshot (required)</label>
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 p-5 text-center text-stone-500 transition hover:border-orange-500 dark:border-stone-700">
     {prev?<img src={prev} alt="" className="max-h-48 rounded-lg"/>:<><span className="text-3xl">📸</span><span className="text-sm">Tap to upload your payment screenshot</span></>}
     <input type="file" accept="image/*" className="hidden" onChange={e=>setFile(e.target.files[0]||null)}/></label></div></div>
  <div className="flex gap-3"><button className="btn-ghost" onClick={()=>setStep('menu')}>← Back</button><button className="btn flex-1" disabled={busy} onClick={place}>{busy?'Sending…':'Place order'}</button></div></div>}
 </main></>}
