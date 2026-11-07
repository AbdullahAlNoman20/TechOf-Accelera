import { lookup } from '@/services/api';
import Avatar from '@/components/ui/Avatar';

/** Shows the name of a referenced record, e.g. <Ref col="users" id="U-03" />. */
export default function Ref({ col = 'users', id, avatar = true, field = 'name' }) {
  const r = id ? lookup(col, id) : null;
  if (!r) return <span className="text-ink-300">Unassigned</span>;
  return (
    <span className="inline-flex items-center gap-2">
      {avatar && col === 'users' && <Avatar name={r.name} color={r.avatarColor} size={24} />}
      <span className="truncate">{r[field]}</span>
    </span>
  );
}
