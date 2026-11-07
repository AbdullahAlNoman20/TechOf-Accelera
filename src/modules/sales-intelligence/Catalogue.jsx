import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import { money } from '@/utils/format';

const P_FIELDS = [
  { name: 'name', label: 'Product / service', required: true, span: 2 }, { name: 'category', label: 'Category', required: true }, { name: 'type', label: 'Type', type: 'select', options: ['service', 'product'], required: true },
  { name: 'price', label: 'Price ($)', type: 'number', min: 0, required: true }, { name: 'unit', label: 'Unit', type: 'select', options: ['project', 'month', 'year', 'hour', 'unit'], required: true }, { name: 'package', label: 'Package', type: 'select', options: ['Starter', 'Growth', 'Business', 'Enterprise'] }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Available for sale' },
];
const R_FIELDS = [
  { name: 'name', label: 'Rule name', required: true, span: 2 }, { name: 'condition', label: 'Condition', required: true, span: 2 }, { name: 'maxDiscount', label: 'Max discount (%)', type: 'number', min: 0, max: 100, required: true }, { name: 'approver', label: 'Approver', required: true }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' },
];

export default function Catalogue() {
  const [tab, setTab] = useState('products');
  return (
    <>
      <PageHeader title="Product & Service Catalogue" subtitle="Standard offerings, packages and pricing rules used by proposals and quotations." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'products', label: 'Products & services' }, { key: 'rules', label: 'Pricing & discount rules' }]} />
      {tab === 'products'
        ? <CrudTable collection="products" module="sales" noun="product" fields={P_FIELDS} searchKeys={['name', 'category']} defaults={{ active: true, type: 'service', unit: 'project' }} filters={[{ key: 'category', label: 'Category', options: ['Web', 'Software', 'Marketing', 'Infrastructure', 'Analytics', 'AI', 'Design', 'Consulting', 'Support'] }]}
            columns={[{ key: 'name', label: 'Name' }, { key: 'category', label: 'Category' }, { key: 'package', label: 'Package', render: (p) => <Badge tone="brand">{p.package}</Badge> }, { key: 'price', label: 'Price', render: (p) => `${money(p.price)} / ${p.unit}` }, { key: 'active', label: 'Status', render: (p) => <StatusBadge value={p.active ? 'active' : 'paused'} /> }]} />
        : <CrudTable collection="pricingRules" module="sales" noun="rule" fields={R_FIELDS} defaults={{ active: true }}
            columns={[{ key: 'name', label: 'Rule' }, { key: 'condition', label: 'Condition' }, { key: 'maxDiscount', label: 'Max discount', render: (r) => `${r.maxDiscount}%` }, { key: 'approver', label: 'Approval by' }, { key: 'active', label: 'Status', render: (r) => <StatusBadge value={r.active ? 'active' : 'paused'} /> }]} />}
    </>
  );
}
