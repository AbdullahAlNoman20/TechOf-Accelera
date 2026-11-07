import useCollection from '@/hooks/useCollection';
import { teamMetrics } from './metrics';

export default function useTeam() {
  const { items: users } = useCollection('users');
  const { items: tasks } = useCollection('tasks');
  const { items: deals } = useCollection('deals');
  const { items: leads } = useCollection('leads');
  const { items: fus } = useCollection('followUps');
  const { items: targets } = useCollection('targets');
  return { users, tasks, deals, leads, fus, targets, rows: teamMetrics({ users, tasks, deals, leads, fus, targets }) };
}
