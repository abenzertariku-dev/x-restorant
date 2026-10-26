import {db,save,emit} from './store';
import {KEYS,mkCookie,hasRole} from './auth';
const R=[],err=(c,m)=>{throw{c,m}},s=(v,n=100)=>String(v??'').slice(0,n);
const route=(m,p,role,fn)=>R.push({m,role,fn,re:new RegExp('^'+p.replace(/:(\w+)/g,'(?<$1>[^/]+)')+'$')});
const build=items=>{if(!Array.isArray(items)||!items.length)err(400,'Cart is empty');let total=0;
 const lines=items.slice(0,50).map(x=>{const m=db.menu.find(i=>i.id===+x.id&&i.available),q=Math.min(99,parseInt(x.qty)||0);if(!m||q<1)err(400,'An item is out of stock or unavailable');total+=m.price*q;return{name:m.name,price:m.price,qty:q}});return{lines,total}};
const tid=id=>{if(!/^\d{1,3}$/.test(id)||+id<1||+id>db.settings.tables)err(404,'Unknown table');return id};
const tstat=(t,os)=>{const x=db.tables[t]||{};return x.call?'Call Waiter':x.bill?'Bill Requested':os.some(o=>o.status==='Pending Waiter Acceptance')?'Pending':os.some(o=>o.status==='Preparing')?'Preparing':os.some(o=>o.status==='Served')?'Served':'Idle'};
const find=(id,type)=>db.orders.find(o=>o.id===+id&&o.type===type)||err(404,'Order not found');
let fails=[];
route('POST','/auth',null,({b})=>{const now=Date.now();fails=fails.filter(t=>now-t<6e5);if(fails.length>=10)err(429,'Too many attempts. Wait 10 minutes.');
 if(!KEYS[b.role]||KEYS[b.role]!==b.key){fails.push(now);err(401,'Wrong key')}return{ok:1,_cookie:mkCookie(b.role)}});
route('POST','/orders',null,({b})=>{const{lines,total}=build(b.items);if(!b.name||!b.phone||!b.address)err(400,'Enter name, phone and address');
 if(!/^data:image\//.test(b.screenshot||''))err(400,'Payment screenshot is required');
 const o={id:db.seq++,type:'delivery',name:s(b.name),phone:s(b.phone,30),address:s(b.address,300),lines,total,screenshot:b.screenshot,status:'Pending Approval',created:Date.now()};
 db.orders.push(o);save();emit('delivery');return{id:o.id}});
route('POST','/table/:id/order',null,({p,b})=>{const t=tid(p.id),{lines,total}=build(b.items);
 const o={id:db.seq++,type:'table',table:t,lines,total,status:'Pending Waiter Acceptance',created:Date.now()};db.orders.push(o);save();emit('table');return{id:o.id}});
for(const k of['call','bill'])route('POST','/table/:id/'+k,null,({p})=>{const t=tid(p.id);(db.tables[t]=db.tables[t]||{})[k]=true;save();emit('table')});
route('GET','/waiter/state','waiter',()=>({tables:Array.from({length:db.settings.tables},(_,i)=>{const id=String(i+1),os=db.orders.filter(o=>o.type==='table'&&o.table===id&&o.status!=='Closed'),x=db.tables[id]||{};return{id,call:!!x.call,bill:!!x.bill,status:tstat(id,os),orders:os}})}));
route('POST','/waiter/orders/:id/accept','waiter',({p})=>{find(p.id,'table').status='Preparing';save();emit('state')});
route('POST','/waiter/orders/:id/served','waiter',({p})=>{find(p.id,'table').status='Served';save();emit('state')});
route('POST','/waiter/tables/:id/clear','waiter',({p})=>{db.tables[p.id]={};db.orders.forEach(o=>{if(o.type==='table'&&o.table===p.id&&o.status==='Served')o.status='Closed'});save();emit('state')});
route('GET','/m/orders','manager',()=>({orders:db.orders.filter(o=>o.type==='delivery').reverse(),loc:db.loc}));
const pend=id=>{const o=find(id,'delivery');if(o.status!=='Pending Approval')err(400,'Already handled');return o};
route('POST','/m/orders/:id/approve','manager',({p})=>{pend(p.id).status='Assigned';save();emit('assign');emit('state')});
route('POST','/m/orders/:id/reject','manager',({p})=>{pend(p.id).status='Rejected';save();emit('state')});
route('GET','/m/menu','manager',()=>db.menu);
route('POST','/m/menu','manager',({b})=>{const price=+b.price;if(!b.name||!(price>=0))err(400,'Name and price are required');
 const f={name:s(b.name),price,desc:s(b.desc,300),img:/^data:image\//.test(b.img||'')?s(b.img,250000):''},i=db.menu.find(m=>m.id===+b.id);
 if(i)Object.assign(i,f);else db.menu.push({id:db.seq++,available:true,...f});save();emit('state')});
route('POST','/m/menu/:id/toggle','manager',({p})=>{const i=db.menu.find(m=>m.id===+p.id)||err(404,'No item');i.available=!i.available;save();emit('state')});
route('DELETE','/m/menu/:id','manager',({p})=>{db.menu=db.menu.filter(m=>m.id!==+p.id);save();emit('state')});
route('GET','/m/settings','manager',()=>db.settings);
route('POST','/m/settings','manager',({b})=>{for(const k of['name','intro','wifiName','wifiPass','bankName','bankAcc'])if(k in b)db.settings[k]=s(b[k],k==='intro'?300:100);
 if(b.tables)db.settings.tables=Math.min(60,Math.max(1,parseInt(b.tables)||12));save();emit('state')});
route('GET','/m/stats','manager',()=>{const ok=db.orders.filter(o=>!['Rejected','Pending Approval'].includes(o.status));
 const mon=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};
 const agg=(keys,key,lab)=>keys.map(k=>{const os=ok.filter(o=>key(o.created)===k);return{l:lab(k),n:os.length,rev:os.reduce((a,o)=>a+o.total,0)}});
 const w0=mon(Date.now()),weeks=[...Array(8)].map((_,i)=>{const d=new Date(w0);d.setDate(d.getDate()-7*(7-i));return d.getTime()});
 const now=new Date(),months=[...Array(6)].map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-(5-i),1);return d.getFullYear()*12+d.getMonth()});
 return{weeks:agg(weeks,mon,k=>new Date(k).toLocaleDateString('en',{month:'short',day:'numeric'})),
 months:agg(months,t=>{const d=new Date(t);return d.getFullYear()*12+d.getMonth()},k=>new Date(Math.floor(k/12),k%12,1).toLocaleDateString('en',{month:'short'}))}});
const NEXT={Assigned:'Pickup',Pickup:'On the Way','On the Way':'Delivered'};
route('GET','/d/orders','driver',()=>db.orders.filter(o=>o.type==='delivery'&&(NEXT[o.status]||o.status==='Delivered')).reverse().slice(0,40).map(({screenshot,...o})=>o));
route('POST','/d/orders/:id/next','driver',({p})=>{const o=find(p.id,'delivery');if(!NEXT[o.status])err(400,'Cannot advance');o.status=NEXT[o.status];save();emit('state')});
route('POST','/d/loc','driver',({b})=>{if(Number.isFinite(+b.lat)&&Number.isFinite(+b.lng)){db.loc={lat:+b.lat,lng:+b.lng,t:Date.now()};emit('state')}});
export async function handle(req,{params}){
 const p='/'+(params.path||[]).join('/'),m=req.method;
 try{for(const r of R){if(r.m!==m)continue;const x=r.re.exec(p);if(!x)continue;
   if(r.role&&!hasRole(req,r.role))err(401,'Unauthorized');
   const b=m==='GET'?{}:await req.json().catch(()=>({}));
   const out=(await r.fn({p:x.groups||{},b}))||{ok:1},h=new Headers();
   if(out._cookie){h.append('Set-Cookie',out._cookie);delete out._cookie}
   return Response.json(out,{headers:h})}
  err(404,'Not found')}catch(e){return Response.json({error:e.m||'Server error'},{status:e.c||500})}}
