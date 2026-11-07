import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FlaskConical, LogIn, Sparkles, ShieldCheck, Workflow } from 'lucide-react';
import Logo from '@/components/common/Logo';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import useCollection from '@/hooks/useCollection';
import { isEmail } from '@/utils/validators';
import { BRAND } from '@/config/brand';

const POINTS = [[Sparkles, 'AI finds, scores and prioritizes every lead'], [Workflow, 'Automation routes work to the right person in seconds'], [ShieldCheck, 'Secure, role-based and fully auditable']];

export default function Login() {
  const { user, login, role } = useAuth();
  const { push } = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const { items: users } = useCollection('users');
  const { items: roles } = useCollection('roles');
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!isEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await login(form.email, form.password);
    setBusy(false);
    if (!res.success) return push(res.message, 'error');
    push(`Welcome back, ${res.user.name.split(' ')[0]}!`);
    nav(loc.state?.from?.pathname || '/app/dashboard', { replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-brand-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-3"><Logo size={48} /><div><p className="text-lg font-bold">{BRAND.product}</p><p className="text-xs text-gold-300">by {BRAND.company}</p></div></div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">{BRAND.tagline}</h1>
          <p className="mt-3 max-w-md text-sm text-white/75">One connected platform to discover leads, convert sales, keep customers and grow your business.</p>
          <ul className="mt-8 space-y-4">{POINTS.map(([I, t]) => <li key={t} className="flex items-center gap-3 text-sm"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gold-300"><I size={18} /></span>{t}</li>)}</ul>
        </div>
        <p className="text-xs text-white/50">Sample data is stored in your browser for demonstration.</p>
      </aside>
      <main className="flex items-center justify-center bg-ink-50 p-5 sm:p-10">
        <div className="w-full max-w-md space-y-5">
          <div className="card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden"><Logo size={40} /><p className="font-bold text-brand-800">{BRAND.product}</p></div>
            <h2 className="text-xl font-bold text-ink-900">Sign in</h2>
            <p className="mb-5 text-sm text-ink-500">Access your {BRAND.fullName} workspace</p>
            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold text-ink-600">Email address</label>
                <input id="email" type="email" autoComplete="username" maxLength={254} className="input" placeholder="you@techofsolution.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-semibold text-ink-600">Password</label>
                <div className="relative">
                  <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" maxLength={128} className="input pr-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full" icon={LogIn} disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</Button>
            </form>
          </div>
          <div className="rounded-xl border-2 border-dashed border-gold-400 bg-white p-4">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gold-700"><FlaskConical size={14} />Demo accounts</p>
            <p className="mb-3 text-xs text-ink-500">Click an account to fill the form. Password: <code className="rounded bg-ink-100 px-1 font-mono">{BRAND.demoPassword}</code></p>
            <div className="max-h-56 space-y-1.5 overflow-y-auto">
              {users.filter((u) => u.status === 'active').map((u) => (
                <button key={u.id} type="button" onClick={() => { setForm({ email: u.email, password: BRAND.demoPassword }); setErrors({}); }} className="flex w-full items-center gap-3 rounded-lg border border-ink-100 px-3 py-2 text-left hover:border-brand-300 hover:bg-brand-50">
                  <Avatar name={u.name} color={u.avatarColor} size={30} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink-800">{u.name}</span><span className="block truncate text-xs text-ink-400">{roles.find((r) => r.id === u.role)?.name} - {u.email}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
