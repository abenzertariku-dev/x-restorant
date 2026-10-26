import {pageHas} from '@/lib/auth';import Gate from '@/components/Gate';import Waiter from '@/components/Waiter';
export const dynamic='force-dynamic';
export default function Page(){return pageHas('waiter')?<Waiter/>:<Gate role="waiter" title="Waiter access"/>}
