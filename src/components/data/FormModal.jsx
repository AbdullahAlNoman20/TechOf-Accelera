import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import useCollection from '@/hooks/useCollection';
import { validateFields } from '@/utils/validators';

const norm = (o) => (typeof o === 'object' ? o : { value: o, label: String(o).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) });

function RemoteOptions({ field, value, onChange, id }) {
  const { items } = useCollection(field.optionsFrom);
  const rows = field.optionFilter ? items.filter(field.optionFilter) : items;
  return (
    <select id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select...</option>
      {rows.map((r) => <option key={r.id} value={r[field.optionValue || 'id']}>{r[field.optionLabel || 'name']}</option>)}
    </select>
  );
}

function Input({ field, value, onChange, id }) {
  const common = { id, className: 'input', placeholder: field.placeholder, value: value ?? '' };
  if (field.optionsFrom) return <RemoteOptions field={field} value={value} onChange={onChange} id={id} />;
  if (field.type === 'select')
    return (
      <select {...common} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {field.options.map((o) => { const x = norm(o); return <option key={x.value} value={x.value}>{x.label}</option>; })}
      </select>
    );
  if (field.type === 'textarea') return <textarea {...common} rows={field.rows || 3} maxLength={field.maxLength || 2000} onChange={(e) => onChange(e.target.value)} />;
  if (field.type === 'checkbox')
    return (
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input id={id} type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-700" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {field.checkLabel || 'Enabled'}
      </label>
    );
  if (field.type === 'tags') return <input {...common} value={Array.isArray(value) ? value.join(', ') : value ?? ''} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trimStart()))} placeholder={field.placeholder || 'Comma separated'} />;
  const shown = field.type === 'date' ? String(value ?? '').slice(0, 10) : field.type === 'datetime-local' ? String(value ?? '').slice(0, 16) : value ?? '';
  return <input {...common} value={shown} type={field.type || 'text'} min={field.min} max={field.max} step={field.step} maxLength={field.maxLength || 254} onChange={(e) => onChange(e.target.value)} />;
}

/** Config-driven create/edit form with validation. `fields` items: { name, label, type, options, optionsFrom, required, span }. */
export default function FormModal({ open, onClose, title, subtitle, fields, initial = {}, onSubmit, submitLabel = 'Save', size = 'md' }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setValues({ ...initial }); setErrors({}); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  async function submit(e) {
    e.preventDefault();
    const errs = validateFields(fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const out = { ...values };
    fields.forEach((f) => {
      if (f.type === 'number' && out[f.name] !== '' && out[f.name] !== undefined) out[f.name] = Number(out[f.name]);
      if (f.type === 'tags') out[f.name] = (out[f.name] || []).map((s) => s.trim()).filter(Boolean);
    });
    setBusy(true);
    try { await onSubmit(out); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} size={size}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="crud-form" disabled={busy}>{busy ? 'Saving...' : submitLabel}</Button></>}>
      <form id="crud-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.span === 2 || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            {f.type !== 'checkbox' && <label htmlFor={`f-${f.name}`} className="mb-1 block text-xs font-semibold text-ink-600">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>}
            <Input field={f} id={`f-${f.name}`} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
            {f.help && !errors[f.name] && <p className="mt-1 text-xs text-ink-400">{f.help}</p>}
            {errors[f.name] && <p className="mt-1 text-xs text-red-600">{errors[f.name]}</p>}
          </div>
        ))}
      </form>
    </Modal>
  );
}
