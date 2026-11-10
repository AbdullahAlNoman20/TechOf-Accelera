const KIND = { ai: ['AI', 'bg-gold-100 text-gold-700'], automation: ['Auto', 'bg-teal-50 text-teal-700'], integration: ['Link', 'bg-brand-50 text-brand-700'] };
/** Small chip placed inside a button: tells the user this action uses sample AI / automation logic for now. */
export default function Preview({ kind = 'ai' }) {
  const [l, c] = KIND[kind];
  return <span className={`ml-1 rounded px-1 py-px text-[10px] font-bold uppercase ${c}`} title="Preview: sample logic today. See the guide for how the real one will work.">{l}</span>;
}
