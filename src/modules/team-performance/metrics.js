import { avg, sum } from '@/utils/format';

/** Per-employee metrics shared by Team Analytics and Team Performance pages. */
export function teamMetrics({ users, tasks, deals, leads, fus, targets }) {
  return users.filter((u) => ['sales', 'manager'].includes(u.role)).map((u) => {
    const t = tasks.filter((x) => x.assigneeId === u.id), d = deals.filter((x) => x.ownerId === u.id), l = leads.filter((x) => x.ownerId === u.id && x.firstResponseMin);
    const f = fus.filter((x) => x.ownerId === u.id), tg = targets.filter((x) => x.userId === u.id);
    const completed = t.filter((x) => x.status === 'completed').length, overdue = t.filter((x) => x.status !== 'completed' && new Date(x.dueAt) < new Date()).length;
    const won = d.filter((x) => x.stage === 'won');
    return {
      id: u.id, name: u.name, team: u.team, capacity: u.capacity, assigned: t.length, completed, overdue, open: t.length - completed, taskRate: t.length ? (completed / t.length) * 100 : 0,
      sla: t.length ? ((t.length - t.filter((x) => new Date(x.slaAt) < new Date() && x.status !== 'completed').length) / t.length) * 100 : 100,
      conversion: d.length ? (won.length / d.length) * 100 : 0, won: won.length, revenue: sum(won, 'value'), responseMin: avg(l, 'firstResponseMin'), followRate: f.length ? (f.filter((x) => x.status === 'done').length / f.length) * 100 : 0,
      targetPct: tg.length ? avg(tg.map((x) => ({ v: Math.min(120, (x.achieved / x.target) * 100) })), 'v') : 0, openDeals: d.filter((x) => !['won', 'lost'].includes(x.stage)).length,
    };
  });
}
