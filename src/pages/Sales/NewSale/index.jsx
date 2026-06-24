import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';
import FormField from '../../../components/crud/FormField.jsx';
import { showToast } from '../../../v4/toast.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { STATIONS } from '../../../data/mock/stations.js';
import { PUMPS } from '../../../data/mock/pumps.js';
import { PRODUCTS } from '../../../data/mock/products.js';
import { CUSTOMERS } from '../../../data/mock/people.js';
import { PAYMENT_METHOD } from '../../../data/mock/sales.js';

const blank = { stationId: '', pumpId: '', productId: '', quantity: '', unitPrice: '', customerId: '', paymentMethod: 'cash', notes: '' };

export default function NewSale() {
  const navigate = useNavigate();
  const { stations } = useAuth();
  const [v, setV] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (name, value) => {
    setV((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'productId') {
        const p = PRODUCTS.find((x) => x.id === value);
        if (p) next.unitPrice = String(p.sellPrice);
      }
      return next;
    });
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const pumps = useMemo(() => PUMPS.filter((p) => !v.stationId || p.stationId === v.stationId), [v.stationId]);
  const amount = useMemo(() => {
    const q = parseFloat(v.quantity) || 0;
    const p = parseFloat(v.unitPrice) || 0;
    return q * p;
  }, [v.quantity, v.unitPrice]);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!v.stationId) next.stationId = 'Station is required';
    if (!v.productId) next.productId = 'Fuel product is required';
    if (!v.quantity || parseFloat(v.quantity) <= 0) next.quantity = 'Enter a quantity';
    if (!v.unitPrice || parseFloat(v.unitPrice) <= 0) next.unitPrice = 'Enter a unit price';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast(`Sale recorded · $${amount.toFixed(2)}`, { variant: 'success' });
      navigate('/sales');
    }, 500);
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Sales" title="New Sale" />
      <form onSubmit={submit} noValidate>
        <div className="row col-8-4">
          <div className="card">
            <div className="card-header"><div className="card-title">Sale details</div></div>
            <div className="card-body">
              <div className="form-row">
                <FormField name="stationId" label="Station" type="select" required value={v.stationId} onChange={set} error={errors.stationId}
                  options={stations.map((s) => ({ value: s.id, label: s.name }))} />
                <FormField name="pumpId" label="Pump" type="select" value={v.pumpId} onChange={set}
                  options={pumps.map((p) => ({ value: p.id, label: `${p.pumpNumber} · ${p.tankName}` }))} />
              </div>
              <div className="form-row">
                <FormField name="productId" label="Fuel product" type="select" required value={v.productId} onChange={set} error={errors.productId}
                  options={PRODUCTS.filter((p) => p.active).map((p) => ({ value: p.id, label: p.name }))} />
                <FormField name="customerId" label="Customer" type="select" value={v.customerId} onChange={set}
                  options={CUSTOMERS.map((c) => ({ value: c.id, label: c.name }))} />
              </div>
              <div className="form-row cols-3">
                <FormField name="quantity" label="Quantity (L)" type="number" min="0" step="0.01" required value={v.quantity} onChange={set} error={errors.quantity} />
                <FormField name="unitPrice" label="Unit price" type="number" min="0" step="0.01" required value={v.unitPrice} onChange={set} error={errors.unitPrice} />
                <FormField name="paymentMethod" label="Payment method" type="select" value={v.paymentMethod} onChange={set}
                  options={Object.entries(PAYMENT_METHOD).map(([value, label]) => ({ value, label }))} />
              </div>
              <FormField name="notes" label="Notes" type="textarea" value={v.notes} onChange={set} placeholder="Optional notes…" />
            </div>
          </div>

          <div className="card" style={{ alignSelf: 'flex-start' }}>
            <div className="card-header"><div className="card-title">Summary</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
              <Row label="Quantity" value={`${parseFloat(v.quantity) || 0} L`} />
              <Row label="Unit price" value={`$${(parseFloat(v.unitPrice) || 0).toFixed(2)}`} />
              <div style={{ height: 1, background: 'var(--border-color-light)' }} />
              <Row label="Total" value={`$${amount.toFixed(2)}`} strong />
              <button className="btn btn-primary btn-block" type="submit" disabled={saving} style={{ marginTop: 8, width: '100%' }}>
                {saving ? 'Recording…' : 'Record sale'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

const Row = ({ label, value, strong }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className={strong ? 'cell-strong' : undefined} style={strong ? { fontSize: 18 } : undefined}>{value}</span>
  </div>
);
