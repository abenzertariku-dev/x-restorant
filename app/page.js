import Delivery from '@/components/Delivery';import {publicInfo} from '@/lib/store';
export const dynamic='force-dynamic';
export default function Home(){const{info,menu}=publicInfo();return<Delivery info={info} menu={menu}/>}
