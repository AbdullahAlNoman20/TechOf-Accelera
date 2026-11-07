export const cn = (...a) => a.filter(Boolean).join(' ');
export const humanize = (s) => String(s ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const money = (n, compact = false) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: compact ? 'compact' : 'standard' }).format(Number(n) || 0);
export const num = (n) => new Intl.NumberFormat('en-US').format(Number(n) || 0);
export const pct = (n, d = 0) => `${(Number(n) || 0).toFixed(d)}%`;
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-');
export const initials = (n = '') => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
export const daysFromNow = (d) => Math.ceil((new Date(d).getTime() - Date.now()) / 864e5);
export const timeAgo = (d) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 6e4);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
};
export const countdown = (d) => {
  const m = Math.round((new Date(d).getTime() - Date.now()) / 6e4);
  const a = Math.abs(m);
  const t = a < 60 ? `${a}m` : a < 1440 ? `${Math.round(a / 60)}h` : `${Math.round(a / 1440)}d`;
  return m < 0 ? { text: `${t} overdue`, late: true } : { text: `${t} left`, late: false };
};
export const sum = (rows, key) => rows.reduce((s, r) => s + (Number(typeof key === 'function' ? key(r) : r[key]) || 0), 0);
export const avg = (rows, key) => (rows.length ? sum(rows, key) / rows.length : 0);
export const groupCount = (rows, key) =>
  Object.entries(rows.reduce((m, r) => { const k = typeof key === 'function' ? key(r) : r[key]; m[k] = (m[k] || 0) + 1; return m; }, {})).map(([label, value]) => ({ label, value }));
export const downloadCsv = (name, rows) => {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== 'object');
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};
