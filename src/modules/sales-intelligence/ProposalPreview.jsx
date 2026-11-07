import { Printer } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Logo from '@/components/common/Logo';
import { BRAND } from '@/config/brand';
import { fmtDate, money } from '@/utils/format';

/** Printable proposal / quotation. Use the browser's "Save as PDF". */
export default function ProposalPreview({ proposal, onClose }) {
  if (!proposal) return null;
  const sub = (proposal.items || []).reduce((s, i) => s + i.qty * i.price, 0);
  return (
    <Modal open onClose={onClose} title={`Quotation ${proposal.id}`} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button icon={Printer} onClick={() => window.print()}>Print / Save PDF</Button></>}>
      <div className="print-area bg-white p-2 text-ink-800">
        <div className="flex items-start justify-between border-b-4 border-gold-500 pb-4"><div className="flex items-center gap-3"><Logo size={52} /><div><p className="text-lg font-bold text-brand-800">{BRAND.company}</p><p className="text-xs text-ink-500">{BRAND.tagline}</p></div></div><div className="text-right text-sm"><p className="text-xl font-bold text-brand-800">QUOTATION</p><p>No. {proposal.id} (v{proposal.version})</p><p>Valid until {fmtDate(proposal.validUntil)}</p></div></div>
        <p className="mt-4 text-sm"><b>Prepared for:</b> {proposal.company}</p>
        <table className="mt-4 w-full text-sm"><thead><tr className="bg-brand-800 text-left text-white"><th className="p-2">Item</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Unit price</th><th className="p-2 text-right">Discount</th><th className="p-2 text-right">Amount</th></tr></thead>
          <tbody>{(proposal.items || []).map((i, k) => <tr key={k} className="border-b border-ink-100"><td className="p-2">{i.product}</td><td className="p-2 text-right">{i.qty}</td><td className="p-2 text-right">{money(i.price)}</td><td className="p-2 text-right">{i.discount}%</td><td className="p-2 text-right">{money(i.qty * i.price * (1 - i.discount / 100))}</td></tr>)}</tbody></table>
        <div className="mt-4 ml-auto w-60 space-y-1 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>{money(sub)}</span></p><p className="flex justify-between"><span>Discount</span><span>-{money(sub - proposal.total)}</span></p><p className="flex justify-between border-t border-ink-200 pt-1 text-base font-bold text-brand-800"><span>Total</span><span>{money(proposal.total)}</span></p></div>
        <p className="mt-6 text-xs text-ink-500">Terms: 50% advance, balance on delivery. Prices exclude applicable taxes. This quotation is valid until the date shown above.</p>
      </div>
    </Modal>
  );
}
