import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackLink({ to, children }) {
  return <Link to={to} className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"><ArrowLeft size={14} />{children}</Link>;
}
