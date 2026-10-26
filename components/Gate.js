'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import {api,toast} from './ui';
export default function Gate({role,title}){const[k,setK]=useState('');const r=useRouter();
 async function go(e){e.preventDefault();try{await api('/auth',{body:{role,key:k}});r.refresh()}catch(x){toast(x.message)}}
 return<main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-4">
  <form onSubmit={go} className="card w-full max-w-sm animate-up space-y-4 p-6 text-center shadow-2xl">
   <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl dark:bg-orange-900/40">🔐</div>
   <div><h1 className="text-xl font-bold">{title}</h1><p className="text-sm text-stone-500">Enter your access key to continue</p></div>
   <input className="input text-center text-lg tracking-widest" type="password" inputMode="numeric" value={k} onChange={e=>setK(e.target.value)} placeholder="••••" autoFocus/>
   <button className="btn w-full py-3">Unlock</button></form></main>}
