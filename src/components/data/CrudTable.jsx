import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import DataTable from './DataTable';
import FormModal from './FormModal';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';

/**
 * Generic list + create/edit/delete for one collection.
 * Props: collection, columns, fields, filters, searchKeys, rows (optional override), defaults, module (permission key),
 * rowActions(row), onRowClick, canDelete, createLabel, noun, transform(values, isEdit), onSaved(rec)
 */
export default function CrudTable({
  collection, columns, fields, filters, searchKeys, rows, defaults = {}, module, rowActions, onRowClick, canDelete = true, canCreate = true, createLabel, noun = 'record',
  transform, onSaved, exportName, toolbar, pageSize, defaultSort, formSize,
}) {
  const { items, create, update, remove } = useCollection(collection);
  const { canWrite } = useAuth();
  const { push } = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const writable = module ? canWrite(module) : true;
  const data = rows || items;

  async function save(values) {
    try {
      const payload = transform ? transform(values, !!editing?.id) : values;
      const rec = editing?.id ? await update(editing.id, payload) : await create({ ...defaults, ...payload });
      push(editing?.id ? `${noun} updated` : `${noun} created`);
      setEditing(null);
      onSaved?.(rec);
    } catch (e) { push(e.message || 'Could not save', 'error'); }
  }

  const cols = [...columns];
  if (writable || rowActions) {
    cols.push({
      key: '_actions', label: '', sortable: false, className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {rowActions?.(r)}
          {writable && <Button variant="ghost" size="icon" aria-label="Edit" icon={Pencil} onClick={() => setEditing(r)} />}
          {writable && canDelete && <Button variant="ghost" size="icon" aria-label="Delete" icon={Trash2} className="text-red-500 hover:bg-red-50" onClick={() => setDeleting(r)} />}
        </div>
      ),
    });
  }

  return (
    <>
      <DataTable columns={cols} rows={data} searchKeys={searchKeys} filters={filters} onRowClick={onRowClick} exportName={exportName} pageSize={pageSize} defaultSort={defaultSort}
        toolbar={<>{toolbar}{writable && canCreate && <Button icon={Plus} onClick={() => setEditing({})}>{createLabel || `New ${noun}`}</Button>}</>} />
      <FormModal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Edit ${noun}` : createLabel || `New ${noun}`} fields={fields} initial={editing || defaults} onSubmit={save} size={formSize} />
      <ConfirmDialog open={!!deleting} danger title={`Delete ${noun}?`} message="This action cannot be undone." confirmLabel="Delete"
        onCancel={() => setDeleting(null)} onConfirm={async () => { await remove(deleting.id); push(`${noun} deleted`); setDeleting(null); }} />
    </>
  );
}
