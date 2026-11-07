import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', text, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400"><Icon size={22} /></span>
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {text && <p className="max-w-sm text-xs text-ink-500">{text}</p>}
    </div>
  );
}
