import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import { PRODUCTS, FUEL_TYPE } from '../../../data/mock/products.js';
import { fuelTypeOptions } from '../../../data/options.js';

const columns = [
  { key: 'name', label: 'Product', render: (r) => <span className="cell-strong">{r.name}</span> },
  { key: 'fuelType', label: 'Fuel type', render: (r) => <span className={`chip ${FUEL_TYPE[r.fuelType].cls}`}>{FUEL_TYPE[r.fuelType].label}</span>, exportValue: (r) => r.fuelType },
  { key: 'unit', label: 'Unit' },
  { key: 'sellPrice', label: 'Sell price', align: 'right', render: (r) => `$${Number(r.sellPrice).toFixed(2)}` },
  { key: 'costPrice', label: 'Cost price', align: 'right', render: (r) => `$${Number(r.costPrice).toFixed(2)}` },
  { key: 'taxPct', label: 'Tax %', align: 'right', render: (r) => `${r.taxPct}%` },
  { key: 'active', label: 'Active', render: (r) => <span className={'status ' + (r.active ? 'status-green' : 'status-red')}>{r.active ? 'Active' : 'Inactive'}</span>, exportValue: (r) => (r.active ? 'Active' : 'Inactive') }
];

const fields = [
  { name: 'name', label: 'Product name', required: true, span: 2 },
  { name: 'fuelType', label: 'Fuel type', type: 'select', required: true, options: fuelTypeOptions },
  { name: 'unit', label: 'Unit', type: 'select', required: true, options: [{ value: 'L', label: 'Litre (L)' }, { value: 'kg', label: 'Kilogram (kg)' }] },
  { name: 'sellPrice', label: 'Sell price', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'costPrice', label: 'Cost price', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'taxPct', label: 'Tax %', type: 'number', min: 0, defaultValue: 21 }
];

export default function FuelProducts() {
  return (
    <ResourcePage
      perm="products"
      pretitle="Inventory"
      title="Fuel Products"
      data={PRODUCTS}
      columns={columns}
      searchKeys={['name', 'fuelType']}
      searchPlaceholder="Search products…"
      formFields={fields}
      addLabel="Add product"
      exportName="fuel-products"
      filters={[{ label: 'Fuel type', key: 'fuelType', options: fuelTypeOptions }]}
    />
  );
}
