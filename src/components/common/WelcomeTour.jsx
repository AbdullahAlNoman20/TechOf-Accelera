import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Logo from '@/components/common/Logo';
import { storage } from '@/services/storage';
import { BRAND } from '@/config/brand';

const STEPS = [
  ['Welcome to Accelera', 'One simple place to find leads, win sales and keep customers. This quick tour takes under a minute.'],
  ['Every page explains itself', 'Under each page title you will find a short guide: how to use the page, what you need, and what AI and automation will add later.'],
  ['Find anything fast', 'Use the "Where is...?" box at the top, or open Explore Accelera to see every feature in plain words.'],
  ['You stay in control', 'AI writes drafts and gives advice. Anything that sends a message, changes a price or deletes data waits for approval.'],
];
export default function WelcomeTour({ userId }) {
  const key = `tour:${userId}`;
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(() => !storage.get(key));
  const done = () => { storage.set(key, true); setOpen(false); };
  const last = i === STEPS.length - 1;
  return (
    <Modal open={open} onClose={done} title={STEPS[i][0]} size="sm" footer={<><Button variant="ghost" onClick={done}>Skip</Button><Button onClick={() => (last ? done() : setI(i + 1))}>{last ? 'Start using Accelera' : 'Next'}</Button></>}>
      <div className="flex flex-col items-center gap-3 text-center">{i === 0 && <Logo size={64} />}<p className="text-sm text-ink-600">{STEPS[i][1]}</p><p className="text-xs text-ink-400">Step {i + 1} of {STEPS.length} - {BRAND.fullName}</p></div>
    </Modal>
  );
}
