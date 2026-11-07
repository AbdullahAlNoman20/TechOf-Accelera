import { createContext, useCallback, useMemo, useState } from 'react';
import { api, lookup, peek } from '@/services/api';
import { storage } from '@/services/storage';
import { BRAND } from '@/config/brand';

export const AuthContext = createContext(null);
const WRITE = ['full', 'own'];

export function AuthProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => storage.get('session')?.id || null);
  const user = sessionId ? lookup('users', sessionId) : null;
  const role = user ? peek('roles').find((r) => r.id === user.role) : null;

  const login = useCallback(async (email, password) => {
    const u = peek('users').find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!u || password !== BRAND.demoPassword) {
      api.log('login_failed', 'auth', `Failed login for ${String(email).slice(0, 60)}`);
      return { success: false, message: 'Invalid email or password' };
    }
    if (u.status !== 'active') return { success: false, message: 'This account is inactive' };
    storage.set('session', { id: u.id });
    setSessionId(u.id);
    api.log('login', 'auth', 'Signed in');
    return { success: true, user: u };
  }, []);

  const logout = useCallback(() => { storage.remove('session'); setSessionId(null); }, []);
  const level = useCallback((m) => (m ? role?.access?.[m] || 'none' : 'full'), [role]);

  const value = useMemo(() => ({
    user, role, login, logout, level,
    can: (m) => level(m) !== 'none',
    canWrite: (m) => WRITE.includes(level(m)),
    isManager: ['super_admin', 'admin', 'manager'].includes(user?.role),
  }), [user, role, login, logout, level]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
