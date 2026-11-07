import { useCallback, useEffect, useState } from 'react';
import { api, peek, subscribe } from '@/services/api';

/** Reads a collection and re-renders when it changes anywhere in the app. */
export default function useCollection(name) {
  const [items, setItems] = useState(() => peek(name));
  const reload = useCallback(async () => setItems([...(await api.list(name))]), [name]);
  useEffect(() => {
    reload();
    return subscribe(name, () => setItems([...peek(name)]));
  }, [name, reload]);
  const create = useCallback((p) => api.create(name, p), [name]);
  const update = useCallback((id, p) => api.update(name, id, p), [name]);
  const remove = useCallback((id) => api.remove(name, id), [name]);
  return { items, reload, create, update, remove };
}
