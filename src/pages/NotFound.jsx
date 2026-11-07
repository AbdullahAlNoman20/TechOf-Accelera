import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function NotFound({ inApp }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-extrabold text-brand-800">404</p>
      <p className="text-sm text-ink-500">This page could not be found.</p>
      <Link to={inApp ? '/app/dashboard' : '/'}><Button>Back to {inApp ? 'dashboard' : 'home'}</Button></Link>
    </div>
  );
}
