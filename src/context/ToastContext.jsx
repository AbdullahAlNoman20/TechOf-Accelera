import { createContext, useCallback, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext({ push: () => {} });
const ICON = { success: CheckCircle2, error: AlertCircle, info: Info };
const TONE = { success: 'border-emerald-200 text-emerald-700', error: 'border-red-200 text-red-700', info: 'border-brand-200 text-brand-700' };

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setList((l) => [...l, { id, message, type }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
        {list.map((t) => {
          const Icon = ICON[t.type] || Info;
          return (
            <div key={t.id} className={`flex items-start gap-2 rounded-lg border bg-white p-3 text-sm shadow-lg ${TONE[t.type] || TONE.info}`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-ink-800">{t.message}</p>
              <button type="button" aria-label="Dismiss" onClick={() => setList((l) => l.filter((x) => x.id !== t.id))}><X size={14} className="text-ink-400" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
