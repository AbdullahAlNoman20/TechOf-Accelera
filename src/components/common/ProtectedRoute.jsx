import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

/** Redirects to /login when signed out; shows "no access" when the role lacks the module. */
export default function ProtectedRoute({ module, children }) {
  const { user, can } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (module && !can(module)) {
    return <div className="card mx-auto mt-16 max-w-md p-8 text-center"><h2 className="text-lg font-bold text-ink-900">No access</h2><p className="mt-1 text-sm text-ink-500">Your role does not include this module. Ask an administrator for access.</p></div>;
  }
  return children;
}
