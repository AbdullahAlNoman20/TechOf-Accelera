import { useLocation } from 'react-router-dom';
import PageGuide from './PageGuide';
import { guideFor } from '@/config/guides';

/** Title and tagline come from the guide config for list pages, so names stay consistent everywhere. */
export default function PageHeader({ title, subtitle, actions, back }) {
  const { pathname } = useLocation();
  const g = guideFor(pathname);
  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {back}
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">{g?.name || title}</h1>
          {(g?.tagline || subtitle) && <p className="mt-0.5 max-w-3xl text-sm font-medium text-teal-700">{g?.tagline || subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <PageGuide />
    </>
  );
}
