import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, EmptyState, Field, PageHero, ProductCard, SelectField, StatCard } from '../../components/Common';
import { money, todayISO } from '../../utils/helpers';

const tabs = [
  ['overview', 'Overview'],
  ['profile', 'Profile'],
  ['addresses', 'Addresses'],
  ['orders', 'Orders'],
  ['wishlist', 'Wishlist'],
  ['returns', 'Returns'],
  ['security', 'Security']
];

export function AccountPage({ navigate }) {
  const {
    currentUser, logout, orders, wishlist, products, settings, customers, returns,
    savedAddresses, updateCurrentUserProfile, changePassword, upsertAddress, deleteAddress,
    upsertReturn, toggleWishlist, addToCart
  } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const savedProducts = products.filter((p) => wishlist.includes(p.id));
  const customerRecord = useMemo(() => currentUser ? customers.find((customer) => customer.id === currentUser.id || customer.email?.toLowerCase() === currentUser.email.toLowerCase()) : null, [customers, currentUser]);
  const customerOrders = useMemo(() => currentUser ? orders.filter((order) => order.customer?.email?.toLowerCase() === currentUser.email.toLowerCase()) : [], [orders, currentUser]);
  const customerReturns = useMemo(() => currentUser ? returns.filter((ret) => customerOrders.some((order) => order.id === ret.orderId) || ret.email?.toLowerCase() === currentUser.email.toLowerCase()) : [], [returns, customerOrders, currentUser]);
  const accountAddresses = useMemo(() => currentUser ? savedAddresses.filter((address) => address.userEmail?.toLowerCase() === currentUser.email.toLowerCase()) : [], [savedAddresses, currentUser]);

  const [profile, setProfile] = useState(() => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: customerRecord?.phone || '',
    city: customerRecord?.city || '',
    birthday: customerRecord?.birthday || '',
    beautyPreference: customerRecord?.beautyPreference || 'Perfumes'
  }));
  const [profileMessage, setProfileMessage] = useState('');
  const [addressForm, setAddressForm] = useState({ label: 'Home', name: currentUser?.name || '', phone: customerRecord?.phone || '', city: customerRecord?.city || '', address: '', landmark: '', primary: true });
  const [returnForm, setReturnForm] = useState({ orderId: '', reason: 'Wrong item', notes: '' });
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', nextPassword: '', confirmPassword: '' });
  const [securityMessage, setSecurityMessage] = useState('');
  const totalSpend = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const latestOrder = customerOrders[0];

  if (!currentUser) {
    return (
      <>
        <PageHero eyebrow="My Account" title="Login required">Sign in to view your profile, saved products and order history.</PageHero>
        <section className="pb-16"><div className="container-lux"><EmptyState title="You are not logged in" action={<Button onClick={() => navigate('login')}>Go to Login</Button>}>Use the login page to access customer or admin features.</EmptyState></div></section>
      </>
    );
  }

  function saveProfile(e) {
    e.preventDefault();
    const result = updateCurrentUserProfile(profile);
    setProfileMessage(result.ok ? 'Profile updated successfully.' : result.message);
  }

  function saveAddress(e) {
    e.preventDefault();
    upsertAddress(addressForm);
    setAddressForm({ label: 'Home', name: currentUser.name, phone: customerRecord?.phone || '', city: '', address: '', landmark: '', primary: false });
  }

  function submitReturn(e) {
    e.preventDefault();
    const order = customerOrders.find((item) => item.id === returnForm.orderId);
    if (!order) return;
    upsertReturn({
      orderId: order.id,
      customer: currentUser.name,
      email: currentUser.email,
      reason: returnForm.reason,
      status: 'requested',
      refundAmount: order.total,
      createdAt: todayISO(),
      notes: returnForm.notes
    });
    setReturnForm({ orderId: '', reason: 'Wrong item', notes: '' });
  }

  async function updatePassword(e) {
    e.preventDefault();
    if (securityForm.nextPassword !== securityForm.confirmPassword) return setSecurityMessage('New passwords do not match.');
    setSecurityMessage('Updating password...');
    const result = await changePassword(securityForm.currentPassword, securityForm.nextPassword);
    setSecurityMessage(result.message);
    if (result.ok) setSecurityForm({ currentPassword: '', nextPassword: '', confirmPassword: '' });
  }

  return (
    <>
      <PageHero eyebrow="My Account" title={`Welcome, ${currentUser.name}`}>Manage profile, saved addresses, orders, returns and wishlist from your GLOWOUT GH account.</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[320px_1fr]">
          <Card className="h-fit p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-3xl font-black text-ink">{currentUser.name.slice(0, 1)}</div>
            <h3 className="mt-4 font-display text-2xl font-bold">{currentUser.name}</h3>
            <p className="text-sm text-[#8A7A98]">{currentUser.email}</p>
            <div className="mt-3"><Badge>{currentUser.role}</Badge></div>
            <div className="mt-6 grid gap-2">
              {tabs.map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition ${activeTab === id ? 'bg-gold text-ink' : 'bg-surface-2 text-[#C8BAD0] hover:text-gold'}`}>{label}</button>)}
            </div>
            <div className="mt-6 grid gap-3">
              <Button onClick={() => navigate(currentUser.type === 'admin' ? 'admin.dashboard' : 'shop')}>{currentUser.type === 'admin' ? 'Open Dashboard' : 'Continue Shopping'}</Button>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </div>
          </Card>

          <div className="grid gap-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard label="Orders" value={customerOrders.length} />
                  <StatCard label="Wishlist" value={savedProducts.length} />
                  <StatCard label="Returns" value={customerReturns.length} />
                  <StatCard label="Spend" value={money(totalSpend, settings.currency)} />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="p-6">
                    <h3 className="font-display text-2xl font-bold">Latest Order</h3>
                    {latestOrder ? <div className="mt-4 rounded-2xl bg-surface-2 p-5"><p className="font-bold text-gold">{latestOrder.id}</p><p className="mt-1 text-sm text-[#8A7A98]">{new Date(latestOrder.createdAt).toLocaleDateString()} · {latestOrder.status}</p><p className="mt-3 text-2xl font-bold">{money(latestOrder.total, settings.currency)}</p><Button className="mt-4" variant="outline" onClick={() => navigate('tracking', { order: latestOrder.id })}>Track Order</Button></div> : <p className="mt-3 text-[#8A7A98]">No orders yet.</p>}
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-display text-2xl font-bold">Account Quick Actions</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2"><Button variant="ghost" onClick={() => setActiveTab('addresses')}>Add Address</Button><Button variant="ghost" onClick={() => setActiveTab('returns')}>Request Return</Button><Button variant="ghost" onClick={() => navigate('wishlist')}>Open Wishlist</Button><Button variant="ghost" onClick={() => navigate('contact')}>Contact Support</Button></div>
                  </Card>
                </div>
              </>
            )}

            {activeTab === 'profile' && (
              <Card className="p-6">
                <h3 className="font-display text-2xl font-bold">Profile Details</h3>
                <form onSubmit={saveProfile} className="mt-6 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /><Field label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /><Field label="City" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></div>
                  <div className="grid gap-4 md:grid-cols-2"><Field label="Birthday" type="date" value={profile.birthday} onChange={(e) => setProfile({ ...profile, birthday: e.target.value })} /><SelectField label="Beauty Preference" value={profile.beautyPreference} onChange={(e) => setProfile({ ...profile, beautyPreference: e.target.value })}><option>Perfumes</option><option>Skincare</option><option>Wigs</option><option>Bodycare</option></SelectField></div>
                  {profileMessage && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{profileMessage}</p>}
                  <Button className="w-fit" type="submit">Save Profile</Button>
                </form>
              </Card>
            )}

            {activeTab === 'addresses' && (
              <div className="grid gap-6">
                <Card className="p-6"><h3 className="font-display text-2xl font-bold">Saved Addresses</h3>{accountAddresses.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{accountAddresses.map((address) => <div key={address.id} className="rounded-2xl bg-surface-2 p-4"><div className="flex items-center justify-between"><p className="font-bold text-gold">{address.label}</p>{address.primary && <Badge>Primary</Badge>}</div><p className="mt-2 text-sm text-white">{address.name} · {address.phone}</p><p className="mt-1 text-sm text-[#8A7A98]">{address.address}, {address.city}</p>{address.landmark && <p className="mt-1 text-xs text-[#8A7A98]">Landmark: {address.landmark}</p>}<Button variant="danger" className="mt-4" onClick={() => deleteAddress(address.id)}>Remove</Button></div>)}</div> : <p className="mt-3 text-[#8A7A98]">No saved addresses yet.</p>}</Card>
                <Card className="p-6"><h3 className="font-display text-2xl font-bold">Add Delivery Address</h3><form onSubmit={saveAddress} className="mt-6 grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Label" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} /><Field label="Receiver Name" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} /></div><div className="grid gap-4 md:grid-cols-2"><Field label="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} /><Field label="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></div><Field label="Address" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} /><Field label="Landmark" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} /><label className="flex items-center gap-3 text-sm text-[#C8BAD0]"><input type="checkbox" checked={addressForm.primary} onChange={(e) => setAddressForm({ ...addressForm, primary: e.target.checked })} /> Make this primary address</label><Button className="w-fit" type="submit">Save Address</Button></form></Card>
              </div>
            )}

            {activeTab === 'orders' && (
              <Card className="p-6"><h3 className="font-display text-2xl font-bold">Order History</h3>{customerOrders.length ? <div className="mt-4 space-y-3">{customerOrders.map((order) => <div key={order.id} className="rounded-2xl bg-surface-2 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-gold">{order.id}</p><p className="text-sm text-[#8A7A98]">{new Date(order.createdAt).toLocaleDateString()} · {order.status} · {order.paymentMethod}</p></div><p className="font-bold">{money(order.total, settings.currency)}</p><Button variant="outline" onClick={() => navigate('tracking', { order: order.id })}>Track</Button></div><div className="mt-3 grid gap-2 text-sm text-[#8A7A98]">{order.items.map((item) => <p key={`${order.id}-${item.name}`}>{item.qty} × {item.name} — {money(item.price, settings.currency)}</p>)}</div></div>)}</div> : <EmptyState title="No orders yet" action={<Button onClick={() => navigate('shop')}>Start Shopping</Button>}>Orders placed with this email will appear here.</EmptyState>}</Card>
            )}

            {activeTab === 'wishlist' && (
              <Card className="p-6"><h3 className="font-display text-2xl font-bold">Saved Products</h3>{savedProducts.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{savedProducts.map((p) => <div key={p.id}><ProductCard product={p} navigate={navigate} compact /><div className="mt-2 grid grid-cols-2 gap-2"><Button variant="ghost" onClick={() => addToCart(p.id)}>Move to Cart</Button><Button variant="danger" onClick={() => toggleWishlist(p.id)}>Remove</Button></div></div>)}</div> : <EmptyState title="No saved products" action={<Button onClick={() => navigate('shop')}>Browse Products</Button>}>Save products you love so you can find them again quickly.</EmptyState>}</Card>
            )}

            {activeTab === 'returns' && (
              <div className="grid gap-6">
                <Card className="p-6"><h3 className="font-display text-2xl font-bold">Return Requests</h3>{customerReturns.length ? <div className="mt-4 space-y-3">{customerReturns.map((ret) => <div key={ret.id} className="rounded-2xl bg-surface-2 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-gold">{ret.id}</p><p className="text-sm text-[#8A7A98]">Order {ret.orderId} · {ret.reason}</p></div><Badge status={ret.status}>{ret.status}</Badge></div><p className="mt-2 text-sm text-[#8A7A98]">{ret.notes}</p></div>)}</div> : <p className="mt-3 text-[#8A7A98]">No return requests yet.</p>}</Card>
                <Card className="p-6"><h3 className="font-display text-2xl font-bold">Request a Return</h3><form onSubmit={submitReturn} className="mt-6 grid gap-4"><SelectField label="Order" value={returnForm.orderId} onChange={(e) => setReturnForm({ ...returnForm, orderId: e.target.value })} required><option value="">Select order</option>{customerOrders.map((order) => <option key={order.id} value={order.id}>{order.id} — {money(order.total, settings.currency)}</option>)}</SelectField><SelectField label="Reason" value={returnForm.reason} onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}><option>Wrong item</option><option>Damaged item</option><option>Size or fit issue</option><option>Changed mind</option><option>Other</option></SelectField><Field as="textarea" label="Notes" value={returnForm.notes} onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} /><Button className="w-fit" disabled={!customerOrders.length} type="submit">Submit Return Request</Button></form></Card>
              </div>
            )}

            {activeTab === 'security' && (
              <Card className="p-6"><h3 className="font-display text-2xl font-bold">Security</h3><p className="mt-2 text-sm leading-6 text-[#8A7A98]">This updates the local demo customer password. Backend auth will handle real password hashing and password resets later.</p><form onSubmit={updatePassword} className="mt-6 grid gap-4"><Field label="Current Password" type="password" value={securityForm.currentPassword} onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} /><div className="grid gap-4 md:grid-cols-2"><Field label="New Password" type="password" value={securityForm.nextPassword} onChange={(e) => setSecurityForm({ ...securityForm, nextPassword: e.target.value })} /><Field label="Confirm New Password" type="password" value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} /></div>{securityMessage && <p className="rounded-xl border border-gold/20 bg-gold/10 p-3 text-sm text-gold">{securityMessage}</p>}<Button className="w-fit" type="submit">Update Password</Button></form></Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
