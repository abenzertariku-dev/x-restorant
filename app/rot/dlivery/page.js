import {pageHas} from '@/lib/auth';import Gate from '@/components/Gate';import Driver from '@/components/Driver';
export const dynamic='force-dynamic';
export default function Page(){return pageHas('driver')?<Driver/>:<Gate role="driver" title="Driver access"/>}
