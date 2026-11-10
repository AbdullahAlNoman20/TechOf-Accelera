import useAuth from './useAuth';
import useCollection from './useCollection';

/** Field-level permissions: show('Deal value') is false when the signed-in role is in that field's hidden list. */
export default function useFieldAccess() {
  const { user } = useAuth();
  const { items } = useCollection('fieldPermissions');
  return { show: (field) => !items.some((f) => f.field === field && f.hiddenFor.includes(user?.role)) };
}
