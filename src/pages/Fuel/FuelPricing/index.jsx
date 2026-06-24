import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import { PRODUCTS, FUEL_TYPE } from '../../../data/mock/products.js';
import { fuelTypeOptions } from '../../../data/options.js';

const margin = (r) => {
  const sell = Number(r.sellPrice) || 0;
  const cost = Number(r.costPrice) || 0;
  return sell ? Math.round(((sell - cost) / sell) * 100) : 0;
};

const columns = [
  { key: 'name', label: 'Product', render: (r) => <span className="cell-strong">{r.name}</span> },
  { key: 'fuelType', label: 'Fuel type', render: (r) => <span className={`chip ${FUEL_TYPE[r.fuelType].cls}`}>{FUEL_TYPE[r.fuelType].label}</span>, exportValue: (r) => r.fuelType },
  { key: 'costPrice', label: 'Cost', align: 'right', render: (r) => `$${Number(r.costPrice).toFixed(2)}` },
  { key: 'sellPrice', label: 'Sell price', align: 'right', render: (r) => <span className="cell-strong">${Number(r.sellPrice).toFixed(2)}</span> },
  { key: 'margin', label: 'Margin', align: 'right', render: (r) => <span style={{ color: margin(r) >= 15 ? 'var(--green)' : 'var(--yellow)' }}>{margin(r)}%</span>, exportValue: (r) => `${margin(r)}%`, sortable: false },
  { key: 'taxPct', label: 'Tax', align: 'right', render: (r) => `${r.taxPct}%` }
];

const fields = [
  { name: 'name', label: 'Product', required: true, span: 2 },
  { name: 'fuelType', label: 'Fuel type', type: 'select', required: true, options: fuelTypeOptions },
  { name: 'costPrice', label: 'Cost price', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'sellPrice', label: 'Sell price', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'taxPct', label: 'Tax %', type: 'number', min: 0, defaultValue: 21 }
];

export default function FuelPricing() {
  const summary = (rows) => [
    { icon: 'price', tone: 'teal', label: 'Priced Products', value: rows.length },
    { icon: 'fuel', tone: 'blue', label: 'Avg Sell Price', value: `$${(rows.reduce((s, r) => s + Number(r.sellPrice), 0) / (rows.length || 1)).toFixed(2)}` },
    { icon: 'receipt', tone: 'green', label: 'Avg Margin', value: `${Math.round(rows.reduce((s, r) => s + margin(r), 0) / (rows.length || 1))}%` }
  ];
  return (
    <ResourcePage
      perm="fuel_pricing"
      pretitle="Fuel"
      title="Fuel Pricing"
      data={PRODUCTS}
      columns={columns}
      searchKeys={['name', 'fuelType']}
      searchPlaceholder="Search products…"
      formFields={fields}
      addLabel="Add price"
      exportName="fuel-pricing"
      summary={summary}
      filters={[{ label: 'Fuel type', key: 'fuelType', options: fuelTypeOptions }]}
    />
  );
}
