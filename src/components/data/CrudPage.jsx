import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import useCollection from '@/hooks/useCollection';
import CrudTable from './CrudTable';

/** Page = header + optional KPI cards + CrudTable. `stats(rows)` returns StatCard props. */
export default function CrudPage({ title, subtitle, stats, headerActions, collection, ...table }) {
  const { items } = useCollection(collection);
  const cards = stats ? stats(items) : [];
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={headerActions} />
      {cards.length > 0 && <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((c) => <StatCard key={c.label} {...c} />)}</div>}
      <CrudTable collection={collection} {...table} />
    </>
  );
}
