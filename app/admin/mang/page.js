import { pageHas } from '@/lib/auth';
import Gate from '@/components/Gate';
import Manager from '@/components/Manager';

export const dynamic = 'force-dynamic';

export default function Page() {
  return pageHas('manager') ? <Manager /> : <Gate role="manager" title="Manager access" />;
}
