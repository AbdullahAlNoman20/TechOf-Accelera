import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { downloadCsv } from '@/utils/format';

/** columns: [{ key, label, render?(row), sortable?, sortValue?(row), className? }]  filters: [{ key, label, options }] */
export default function DataTable({ columns, rows, searchKeys = [], filters = [], pageSize = 10, onRowClick, toolbar, exportName, emptyTitle, emptyText, defaultSort }) {
  const [q, setQ] = useState('');
  const [fv, setFv] = useState({});
  const [sort, setSort] = useState(defaultSort || null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = rows.filter((r) => filters.every((f) => !fv[f.key] || String(r[f.key]) === fv[f.key]));
    if (term && searchKeys.length) out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(term)));
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      const val = (r) => (col?.sortValue ? col.sortValue(r) : r[sort.key]);
      out = [...out].sort((a, b) => { const x = val(a), y = val(b); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? '')); return sort.dir === 'asc' ? c : -c; });
    }
    return out;
  }, [rows, q, fv, sort, filters, searchKeys, columns]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const view = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const toggleSort = (c) => { if (c.sortable === false) return; setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' })); };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
        {searchKeys.length > 0 && (
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search..." aria-label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
        )}
        {filters.map((f) => (
          <select key={f.key} aria-label={f.label} className="input w-auto" value={fv[f.key] || ''} onChange={(e) => { setFv((s) => ({ ...s, [f.key]: e.target.value })); setPage(1); }}>
            <option value="">{f.label}: All</option>
            {f.options.map((o) => <option key={o} value={o}>{String(o).replace(/_/g, ' ')}</option>)}
          </select>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          {exportName && <Button variant="secondary" size="sm" icon={Download} onClick={() => downloadCsv(exportName, filtered)}>Export</Button>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="rtable min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="th" scope="col">
                  <button type="button" disabled={c.sortable === false} onClick={() => toggleSort(c)} className="inline-flex items-center gap-1 uppercase">
                    {c.label}{sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {view.map((r) => (
              <tr key={r.id} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? 'cursor-pointer hover:bg-brand-50/50' : 'hover:bg-ink-50/60'}>
                {columns.map((c) => <td key={c.key} data-label={c.label} className={`td ${c.className || ''}`}>{c.render ? c.render(r) : r[c.key] ?? '-'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!view.length && <EmptyState title={emptyTitle || 'No records found'} text={emptyText || 'Try a different search or filter.'} />}
      </div>
      <div className="flex items-center justify-between border-t border-ink-100 px-4 py-2.5 text-xs text-ink-500">
        <span>{filtered.length} record{filtered.length === 1 ? '' : 's'}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous page" disabled={cur <= 1} onClick={() => setPage(cur - 1)} icon={ChevronLeft} />
          <span>Page {cur} of {pages}</span>
          <Button variant="ghost" size="icon" aria-label="Next page" disabled={cur >= pages} onClick={() => setPage(cur + 1)} icon={ChevronRight} />
        </div>
      </div>
    </div>
  );
}
