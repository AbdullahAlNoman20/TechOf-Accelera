import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { money } from '@/utils/format';
import Preview from '@/components/ui/Preview';
import { Sparkles } from 'lucide-react';

const calc = (items) => Math.round(items.reduce((s, i) => s + i.qty * i.price * (1 - i.discount / 100), 0));

export default function ProposalBuilder({ open, onClose, initial }) {
  const { items: deals } = useCollection('deals');
  const { items: products } = useCollection('products');
  const { items: rules } = useCollection('pricingRules');
  const { create, update } = useCollection('proposals');
  const { user } = useAuth();
  const { push } = useToast();
  const [dealId, setDealId] = useState(initial?.dealId || '');
  const [items, setItems] = useState(initial?.items?.length ? initial.items : [{ product: '', qty: 1, price: 0, discount: 0 }]);
  const [valid, setValid] = useState(initial?.validUntil || new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10));
  const limit = rules.find((r) => r.name === 'Standard discount')?.maxDiscount ?? 10;
  const maxDisc = Math.max(0, ...items.map((i) => i.discount));
  const total = calc(items);
  const set = (k, patch) => setItems((l) => l.map((x, i) => (i === k ? { ...x, ...patch } : x)));

  function aiDraft() {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return push('Select a deal first', 'error');
    const p = products.find((x) => x.name === deal.service) || products[0];
    const extra = products.find((x) => x.id !== p.id && x.category === 'Support') || products[products.length - 1];
    setItems([{ product: p.name, qty: 1, price: p.price, discount: 0 }, { product: extra.name, qty: 1, price: extra.price, discount: 0 }]);
    push('AI drafted the lines from the deal needs. Please check prices and quantities.', 'info');
  }
  async function save() {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return push('Select a deal', 'error');
    const valid_ = items.filter((i) => i.product);
    if (!valid_.length) return push('Add at least one product or service', 'error');
    if (items.some((i) => i.qty < 1 || i.discount < 0 || i.discount > 100)) return push('Check quantity and discount values', 'error');
    const needs = maxDisc > limit;
    const payload = { dealId, title: `Proposal - ${deal.company}`, company: deal.company, items: valid_, total: calc(valid_), discountPct: maxDisc, validUntil: valid, ownerId: deal.ownerId, status: needs ? 'pending_approval' : 'draft' };
    const rec = initial?.id ? await update(initial.id, payload) : await create({ ...payload, version: 1 });
    if (needs) { await api.create('approvals', { type: 'discount', title: `Quotation ${rec.id}: ${maxDisc}% discount`, requestedBy: user.name, at: new Date().toISOString(), status: 'pending', detail: `${deal.company} - ${money(payload.total)}`, amount: Math.round(payload.total * maxDisc / 100), approverRole: maxDisc > 20 ? 'super_admin' : 'manager' }); push(`Discount above ${limit}% needs manager approval - request sent`, 'info'); }
    else push('Quotation saved');
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? `Edit ${initial.id}` : 'New proposal / quotation'} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save}>Save quotation</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold text-ink-600">Deal</label><select className="input" value={dealId} onChange={(e) => setDealId(e.target.value)}><option value="">Select...</option>{deals.map((d) => <option key={d.id} value={d.id}>{d.company} - {d.title.slice(0, 30)}</option>)}</select></div>
        <div><label className="mb-1 block text-xs font-semibold text-ink-600">Valid until</label><input type="date" className="input" value={valid} onChange={(e) => setValid(e.target.value)} /></div></div>
      <div className="mt-4 space-y-2"><Button size="sm" variant="secondary" icon={Sparkles} onClick={aiDraft}>Draft lines with AI<Preview /></Button>
        {items.map((it, k) => (
          <div key={k} className="grid grid-cols-12 items-end gap-2">
            <div className="col-span-12 sm:col-span-5"><label className="mb-1 block text-[11px] text-ink-500">Product / service</label><select className="input" value={it.product} onChange={(e) => { const p = products.find((x) => x.name === e.target.value); set(k, { product: e.target.value, price: p?.price || 0 }); }}><option value="">Select...</option>{products.filter((p) => p.active).map((p) => <option key={p.id} value={p.name}>{p.name} ({money(p.price)}/{p.unit})</option>)}</select></div>
            <div className="col-span-3 sm:col-span-2"><label className="mb-1 block text-[11px] text-ink-500">Qty</label><input type="number" min="1" className="input" value={it.qty} onChange={(e) => set(k, { qty: Number(e.target.value) })} /></div>
            <div className="col-span-4 sm:col-span-2"><label className="mb-1 block text-[11px] text-ink-500">Discount %</label><input type="number" min="0" max="100" className="input" value={it.discount} onChange={(e) => set(k, { discount: Number(e.target.value) })} /></div>
            <div className="col-span-4 sm:col-span-2 text-right text-sm font-semibold">{money(it.qty * it.price * (1 - it.discount / 100))}</div>
            <div className="col-span-1"><Button size="icon" variant="ghost" aria-label="Remove line" icon={Trash2} className="text-red-500" onClick={() => setItems((l) => (l.length > 1 ? l.filter((_, i) => i !== k) : l))} /></div>
          </div>))}
        <Button size="sm" variant="secondary" icon={Plus} onClick={() => setItems([...items, { product: '', qty: 1, price: 0, discount: 0 }])}>Add line</Button>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-50 p-3"><span className="text-sm text-ink-600">{maxDisc > limit ? <b className="text-amber-700">Discount above {limit}%: manager approval required</b> : `Discount within the ${limit}% limit`}</span><b className="text-lg text-brand-800">{money(total)}</b></div>
    </Modal>
  );
}
