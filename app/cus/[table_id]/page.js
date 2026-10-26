import {notFound} from 'next/navigation';import TableApp from '@/components/TableApp';import {publicInfo,tableInfo} from '@/lib/store';
export const dynamic='force-dynamic';
export default function Page({params}){const id=params.table_id,t=tableInfo();
 if(!/^\d{1,3}$/.test(id)||+id<1||+id>t.tables)notFound();
 const{info,menu}=publicInfo();return<TableApp id={id} info={info} menu={menu} wifi={{name:t.wifiName,pass:t.wifiPass}}/>}
