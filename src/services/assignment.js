/** Rule-based lead assignment used by Task Hub (demo). */
export function openLoad(userId, tasks) {
  return tasks.filter((t) => t.assigneeId === userId && !['completed'].includes(t.status)).length;
}

export function suggestAssignee(lead, users, tasks, rules) {
  const sales = users.filter((u) => u.role === 'sales' && u.status === 'active');
  const pool = sales.length ? sales : users;
  const byLoad = [...pool].sort((a, b) => openLoad(a.id, tasks) - openLoad(b.id, tasks));
  const active = [...rules].filter((r) => r.active).sort((a, b) => a.priority - b.priority);
  for (const r of active) {
    if (r.method === 'priority' && lead.temperature === 'hot') {
      const u = pool.find((x) => x.skills.includes(lead.industry)) || byLoad[0];
      return { user: u, rule: r };
    }
    if (r.method === 'industry') { const u = pool.find((x) => x.skills.includes(lead.industry)); if (u) return { user: u, rule: r }; }
    if (r.method === 'territory') {
      const u = pool.find((x) => x.territory === lead.city || (lead.country !== 'Bangladesh' && x.territory === 'International'));
      if (u) return { user: u, rule: r };
    }
    if (r.method === 'workload') return { user: byLoad[0], rule: r };
    if (r.method === 'round_robin') return { user: pool[(lead.id.length + Number(String(lead.id).replace(/\D/g, ''))) % pool.length], rule: r };
  }
  return { user: byLoad[0], rule: null };
}
