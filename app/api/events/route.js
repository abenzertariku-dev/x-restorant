import {S} from '@/lib/store';import {hasRole} from '@/lib/auth';
export const dynamic='force-dynamic';export const runtime='nodejs';
export async function GET(req){
 const role=new URL(req.url).searchParams.get('role');
 if(!hasRole(req,role))return Response.json({error:'Unauthorized'},{status:401});
 const enc=new TextEncoder();let cl;
 const stream=new ReadableStream({start(c){cl={send:t=>{try{c.enqueue(enc.encode(t))}catch{S.clients.delete(cl)}}};S.clients.add(cl);cl.send(':ok\n\n');req.signal.addEventListener('abort',()=>S.clients.delete(cl))},cancel(){S.clients.delete(cl)}});
 return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform',Connection:'keep-alive'}})}
