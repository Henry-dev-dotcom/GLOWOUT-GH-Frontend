import { useMemo, useState } from 'react';
import { Badge, Button, Card, Field, SelectField, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { downloadFile, money, safeNumber, todayISO, toCSV } from '../../utils/helpers';
import { Action, AdminShell, BarList, ConfirmButton, DetailGrid, Modal, SectionTitle, Toolbar } from './_AdminShared.jsx';

function couponStatus(coupon) {
  const today = todayISO();
  if (!coupon.active) return 'hidden';
  if (coupon.startDate && coupon.startDate > today) return 'scheduled';
  if (coupon.endDate && coupon.endDate < today) return 'expired';
  if (coupon.usageLimit && safeNumber(coupon.used) >= safeNumber(coupon.usageLimit)) return 'exhausted';
  return 'active';
}

export function CouponsManager({ view, navigate }) {
  const { coupons, upsertCoupon, deleteCoupon, resetCoupons, setCoupons, categories, settings, orders } = useStore();
  const blank = { code: '', name: '', description: '', type: 'percentage', value: 10, minOrder: 0, maxDiscount: 0, usageLimit: 0, used: 0, active: true, startDate: todayISO(), endDate: '2026-12-31', category: 'all' };
  const [draft, setDraft] = useState(blank);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [activeCouponId, setActiveCouponId] = useState(null);
  const activeCoupon = coupons.find((coupon) => coupon.id === activeCouponId);

  const usageByCode = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      if (!order.couponCode) return;
      const code = order.couponCode.toUpperCase();
      map[code] = map[code] || { count: 0, discount: 0, revenue: 0, orders: [] };
      map[code].count += 1;
      map[code].discount += safeNumber(order.discount);
      map[code].revenue += safeNumber(order.total);
      map[code].orders.push(order);
    });
    return map;
  }, [orders]);

  const list = useMemo(() => coupons
    .filter((c) => `${c.code} ${c.name} ${c.description}`.toLowerCase().includes(query.toLowerCase()))
    .filter((c) => status === 'all' || couponStatus(c) === status)
    .filter((c) => type === 'all' || c.type === type)
    .sort((a, b) => safeNumber(b.used) - safeNumber(a.used)), [coupons, query, status, type]);

  const totalDiscount = orders.reduce((sum, order) => sum + safeNumber(order.discount), 0);
  const activeCount = coupons.filter((c) => couponStatus(c) === 'active').length;

  function save(e) {
    e.preventDefault();
    if (!draft.code) return alert('Coupon code is required.');
    upsertCoupon(draft);
    setDraft(blank);
  }

  function importCoupons(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => { try { const data = JSON.parse(text); if (Array.isArray(data)) setCoupons(data); } catch { alert('Invalid JSON'); } });
  }

  function exportCSV() {
    downloadFile('glowoutgh-coupons.csv', toCSV(list.map((c) => ({ code: c.code, name: c.name, type: c.type, value: c.value, minOrder: c.minOrder, usage: c.used, status: couponStatus(c), startDate: c.startDate, endDate: c.endDate }))), 'text/csv');
  }

  const couponPerformance = coupons.map((coupon) => ({ label: coupon.code, value: usageByCode[coupon.code]?.revenue || 0 })).filter((item) => item.value > 0).slice(0, 6);

  return (
    <AdminShell view={view} navigate={navigate} title="Coupons Manager">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Coupons" value={coupons.length} />
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Redemptions" value={coupons.reduce((s, c) => s + safeNumber(c.used), 0)} />
        <StatCard label="Discount Given" value={money(totalDiscount, settings.currency)} />
      </div>

      <Toolbar>
        <Field label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="scheduled">Scheduled</option><option value="expired">Expired</option><option value="hidden">Hidden</option><option value="exhausted">Exhausted</option></SelectField>
        <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option><option value="percentage">Percentage</option><option value="fixed">Fixed</option><option value="shipping">Shipping</option></SelectField>
        <Button variant="outline" onClick={() => downloadFile('glowoutgh-coupons.json', JSON.stringify(coupons, null, 2))}>Export JSON</Button>
        <Button variant="ghost" onClick={exportCSV}>Export CSV</Button>
        <label className="btn btn-ghost">Import<input className="hidden" type="file" accept="application/json" onChange={importCoupons} /></label>
        <Button variant="danger" onClick={resetCoupons}>Reset Demo</Button>
      </Toolbar>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="p-5">
          <h2 className="font-display text-2xl font-bold">{draft.id ? 'Edit' : 'Add'} Coupon</h2>
          <form onSubmit={save} className="mt-5 space-y-4">
            <Field label="Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase().replace(/\s+/g, '') })} />
            <Field label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Field label="Description" as="textarea" rows="3" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <SelectField label="Type" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="shipping">Free Shipping</option></SelectField>
            <div className="grid grid-cols-2 gap-3"><Field label="Value" type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: safeNumber(e.target.value) })} /><Field label="Minimum Order" type="number" value={draft.minOrder} onChange={(e) => setDraft({ ...draft, minOrder: safeNumber(e.target.value) })} /><Field label="Max Discount" type="number" value={draft.maxDiscount} onChange={(e) => setDraft({ ...draft, maxDiscount: safeNumber(e.target.value) })} /><Field label="Usage Limit" type="number" value={draft.usageLimit} onChange={(e) => setDraft({ ...draft, usageLimit: safeNumber(e.target.value) })} /></div>
            <SelectField label="Category Target" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}><option value="all">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</SelectField>
            <div className="grid grid-cols-2 gap-3"><Field label="Start" type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /><Field label="End" type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} /></div>
            <label className="flex gap-2 text-sm text-[#C8BAD0]"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active</label>
            <div className="flex gap-2"><Button type="submit">Save Coupon</Button><Button type="button" variant="ghost" onClick={() => setDraft(blank)}>Clear</Button></div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-5"><SectionTitle title="Coupon Performance">Revenue influenced by coupon codes in saved orders.</SectionTitle>{couponPerformance.length ? <BarList items={couponPerformance} currency={settings.currency} /> : <p className="text-sm text-[#8A7A98]">No coupon redemptions yet.</p>}</Card>
          <Card className="overflow-x-auto p-0">
            <table className="admin-table"><thead><tr><th>Code</th><th>Type</th><th>Rule</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead><tbody>{list.map((c) => <tr key={c.id}>
              <td><p className="font-bold text-gold">{c.code}</p><p className="text-xs text-[#8A7A98]">{c.name}</p></td>
              <td>{c.type}</td>
              <td>{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? money(c.value, settings.currency) : 'Free shipping'} from {money(c.minOrder, settings.currency)}</td>
              <td>{usageByCode[c.code]?.count || c.used || 0}/{c.usageLimit || '∞'}</td>
              <td><Badge status={couponStatus(c)}>{couponStatus(c)}</Badge></td>
              <td><div className="flex flex-wrap gap-2"><Action onClick={() => setActiveCouponId(c.id)}>Usage</Action><Action onClick={() => setDraft(c)}>Edit</Action><Action onClick={() => upsertCoupon({ ...c, id: '', code: `${c.code}COPY`, used: 0 })}>Duplicate</Action><Action onClick={() => upsertCoupon({ ...c, active: !c.active })}>{c.active ? 'Hide' : 'Activate'}</Action><ConfirmButton message="Delete coupon?" onConfirm={() => deleteCoupon(c.id)}>Delete</ConfirmButton></div></td>
            </tr>)}</tbody></table>
          </Card>
        </div>
      </div>

      {activeCoupon && <Modal title={`Coupon Usage · ${activeCoupon.code}`} onClose={() => setActiveCouponId(null)} wide>
        <DetailGrid items={[
          ['Code', activeCoupon.code], ['Status', couponStatus(activeCoupon)], ['Type', activeCoupon.type], ['Value', activeCoupon.type === 'percentage' ? `${activeCoupon.value}%` : money(activeCoupon.value, settings.currency)], ['Minimum Order', money(activeCoupon.minOrder, settings.currency)], ['Category', activeCoupon.category || 'all']
        ]} />
        <Card className="mt-6 p-5"><SectionTitle title="Redemption History" />{usageByCode[activeCoupon.code]?.orders?.length ? <div className="space-y-3">{usageByCode[activeCoupon.code].orders.map((order) => <button key={order.id} onClick={() => navigate('admin.orders', { order: order.id })} className="flex w-full justify-between rounded-2xl bg-surface-2 p-3 text-left"><span><b className="text-white">{order.id}</b><p className="text-xs text-[#8A7A98]">{order.customer?.name} · {new Date(order.createdAt).toLocaleDateString()}</p></span><span><b className="text-gold">{money(order.discount, settings.currency)}</b><p className="text-xs text-[#8A7A98]">discount</p></span></button>)}</div> : <p className="text-sm text-[#8A7A98]">No recorded order redemptions yet.</p>}</Card>
      </Modal>}
    </AdminShell>
  );
}
