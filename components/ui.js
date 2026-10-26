'use client';
import {useEffect,useRef,useState,useCallback} from 'react';
export const money=n=>Number(n).toLocaleString()+' ETB';
export const lines=o=>o.lines.map(l=>l.qty+'× '+l.name).join(', ');
export async function api(path,{method,body}={}){
 const r=await fetch('/api'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const j=await r.json().catch(()=>({}));
 if(!r.ok){if(r.status===401&&path!=='/auth')location.reload();throw new Error(j.error||'Request failed')}return j}
export const toast=m=>window.dispatchEvent(new CustomEvent('toast',{detail:m}));
export function Toaster(){const[m,setM]=useState('');
 useEffect(()=>{let t;const h=e=>{setM(e.detail);clearTimeout(t);t=setTimeout(()=>setM(''),2200)};window.addEventListener('toast',h);return()=>window.removeEventListener('toast',h)},[]);
 return m?<div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-pop rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-stone-900">{m}</div>:null}
const SC={'Pending Approval':'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200','Pending Waiter Acceptance':'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200','Pending':'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
 'Preparing':'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200','Served':'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200','Delivered':'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
 'Assigned':'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200','Pickup':'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200','On the Way':'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
 'Rejected':'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200','Call Waiter':'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200','Bill Requested':'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'};
export const Badge=({s,pulse})=><span className={'badge '+(SC[s]||'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300')+(pulse?' animate-pulse':'')}>{s}</span>;
export const Hero=({title,sub,children})=><header className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-5 pb-16 pt-12 text-center text-white">
 <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10"/><div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-black/10"/>
 <div className="relative mx-auto max-w-2xl animate-up"><div className="text-5xl drop-shadow">🍽️</div><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 text-white/90">{sub}</p>{children}</div></header>;
export const Skeleton=()=><div className="space-y-3 p-4">{[0,1,2].map(i=><div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800"/>)}</div>;
export const Empty=({icon='📭',text})=><div className="py-12 text-center text-stone-500"><div className="text-4xl">{icon}</div><p className="mt-2">{text}</p></div>;
export const copy=t=>navigator.clipboard.writeText(t).then(()=>toast('Copied'),()=>toast('Copy failed'));
export const shrink=(f,mx=900)=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.7))};im.onerror=no;im.src=r.result};r.onerror=no;r.readAsDataURL(f)});
let AC;
export function unlock(){try{AC=AC||new AudioContext();AC.resume()}catch{}}
export function beep(){try{unlock();const o=AC.createOscillator(),v=AC.createGain();o.connect(v);v.connect(AC.destination);o.frequency.value=880;v.gain.setValueAtTime(.3,AC.currentTime);v.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.7);o.start();o.stop(AC.currentTime+.7)}catch{}}
export function useLive(role,kinds,fn){const ref=useRef(fn);ref.current=fn;
 useEffect(()=>{window.addEventListener('pointerdown',unlock,{once:true});const es=new EventSource('/api/events?role='+role);
  es.onmessage=e=>{if(kinds.includes(JSON.parse(e.data).kind))beep();ref.current()};
  return()=>{es.close();window.removeEventListener('pointerdown',unlock)}},[role]);}
export function useData(role,path,kinds=[]){const[d,setD]=useState(null);
 const load=useCallback(()=>api(path).then(setD).catch(()=>{}),[path]);
 useEffect(()=>{load()},[load]);useLive(role,kinds,load);return[d,load]}
