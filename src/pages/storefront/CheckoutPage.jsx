import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, EmptyState, Field, PageHero, ProductImage, SelectField } from '../../components/Common';
import { money, safeNumber } from '../../utils/helpers';

const DELIVERY_METHODS = [
  { id: 'standard', name: 'Standard delivery', price: 35, window: '2–4 business days', note: 'Best for regular Accra and nationwide deliveries.' },
  { id: 'express', name: 'Express delivery', price: 60, window: 'Same day / next day', note: 'Recommended for urgent beauty restocks within supported areas.' },
  { id: 'pickup', name: 'Store pickup', price: 0, window: 'Ready after confirmation', note: 'Pick up after your order is confirmed by the GLOWOUT GH team.' }
];

const PAYMENT_METHODS = [
  { id: 'momo', name: 'Mobile Money', badge: 'Recommended', description: 'Pay with MTN, Telecel/Vodafone or AirtelTigo Mobile Money.' },
  { id: 'card', name: 'Card', badge: 'Paystack-ready', description: 'Pay securely with Visa or Mastercard when backend payment is connected.' },
  { id: 'bank', name: 'Bank Transfer', badge: 'Manual confirmation', description: 'Transfer to the store account and submit your payment reference.' },
  { id: 'cod', name: 'Cash on Delivery', badge: 'Selected areas', description: 'Pay when your package arrives. Subject to confirmation.' }
];

function Row({ label, value, big = false, muted = false }) {
  return <div className={`flex items-center justify-between gap-4 ${big ? 'text-lg font-bold text-white' : muted ? 'text-sm text-[#8A7A98]' : 'text-sm text-[#C8BAD0]'}`}><span>{label}</span><span className={big ? 'text-gold' : 'text-white'}>{value}</span></div>;
}

function StepPill({ active, complete, number, label }) {
  return (
    <div className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm ${active ? 'border-gold bg-gold/10 text-gold' : complete ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-[rgba(201,169,110,.12)] bg-surface-2 text-[#8A7A98]'}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-0 text-xs font-bold">{complete ? '✓' : number}</span>
      <span className="hidden font-semibold sm:inline">{label}</span>
    </div>
  );
}

function PaymentFields({ method, form, update }) {
  if (method === 'Mobile Money') {
    return (
      <div className="mt-5 grid gap-4 rounded-2xl border border-gold/15 bg-surface-2/70 p-5 sm:grid-cols-2">
        <SelectField label="Network" value={form.momoNetwork} onChange={(e) => update('momoNetwork', e.target.value)}>
          <option>MTN Mobile Money</option>
          <option>Telecel Cash</option>
          <option>AirtelTigo Money</option>
        </SelectField>
        <Field label="MoMo Number" value={form.momo} onChange={(e) => update('momo', e.target.value)} placeholder="024 000 0000" />
        <p className="sm:col-span-2 text-sm leading-7 text-[#8A7A98]">When backend payment is connected, this option will initialize Paystack Mobile Money payment and verify the transaction before the order is marked as paid.</p>
      </div>
    );
  }
  if (method === 'Card') {
    return (
      <div className="mt-5 rounded-2xl border border-gold/15 bg-surface-2/70 p-5">
        <p className="text-sm leading-7 text-[#C8BAD0]">Card payment is Paystack-ready. For this frontend phase, the card flow creates a pending payment order and routes the customer to a payment status screen. The backend will later provide the hosted Paystack checkout link.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Cardholder Name" value={form.cardName} onChange={(e) => update('cardName', e.target.value)} placeholder="Name on card" />
          <Field label="Billing Email" type="email" value={form.billingEmail} onChange={(e) => update('billingEmail', e.target.value)} placeholder="payment email" />
        </div>
      </div>
    );
  }
  if (method === 'Bank Transfer') {
    return (
      <div className="mt-5 rounded-2xl border border-gold/15 bg-surface-2/70 p-5">
        <div className="grid gap-3 text-sm text-[#C8BAD0] sm:grid-cols-2">
          <p><span className="block text-xs uppercase tracking-[.14em] text-[#8A7A98]">Bank</span> GLOWOUT GH Business Account</p>
          <p><span className="block text-xs uppercase tracking-[.14em] text-[#8A7A98]">Account Name</span> GLOWOUT GH</p>
          <p><span className="block text-xs uppercase tracking-[.14em] text-[#8A7A98]">Reference</span> Your order ID after checkout</p>
          <p><span className="block text-xs uppercase tracking-[.14em] text-[#8A7A98]">Status</span> Order remains pending until confirmed</p>
        </div>
        <div className="mt-4">
          <Field label="Transfer Reference / Note" value={form.bankReference} onChange={(e) => update('bankReference', e.target.value)} placeholder="Enter transfer reference if already paid" />
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5 rounded-2xl border border-gold/15 bg-surface-2/70 p-5 text-sm leading-7 text-[#C8BAD0]">
      Cash on Delivery is available only after order confirmation. The order will be saved as unpaid until the delivery team confirms cash collection.
    </div>
  );
}

export function CheckoutPage({ navigate }) {
  const { cartItems, cartTotals, placeOrder, settings, applyCoupon, clearCoupon, appliedCouponCode, currentUser, savedAddresses } = useStore();
  const [step, setStep] = useState(1);
  const [couponInput, setCouponInput] = useState(appliedCouponCode || '');
  const [couponMessage, setCouponMessage] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', address: '', deliveryMethod: 'standard', paymentMethod: 'Mobile Money', momoNetwork: 'MTN Mobile Money', momo: '', cardName: '', billingEmail: '', bankReference: '', notes: '', terms: false
  });

  useEffect(() => {
    if (currentUser) {
      setForm((x) => ({ ...x, name: x.name || currentUser.name || '', email: x.email || currentUser.email || '', billingEmail: x.billingEmail || currentUser.email || '' }));
    }
  }, [currentUser]);

  const selectedAddress = savedAddresses?.[0];
  const selectedDelivery = DELIVERY_METHODS.find((method) => method.id === form.deliveryMethod) || DELIVERY_METHODS[0];
  const checkoutTotals = useMemo(() => {
    const shipping = selectedDelivery.price;
    const total = Math.max(cartTotals.subtotal - cartTotals.discount, 0) + shipping + cartTotals.tax;
    return { ...cartTotals, shipping, total };
  }, [cartTotals, selectedDelivery.price]);

  if (!cartItems.length) {
    return <><PageHero eyebrow="Checkout" title="Nothing to checkout" /><section className="pb-16"><div className="container-lux"><EmptyState title="Your checkout is empty" action={<Button onClick={() => navigate('shop')}>Shop Now</Button>}>Add products to your cart first.</EmptyState></div></section></>;
  }

  function update(key, value) { setForm((x) => ({ ...x, [key]: value })); setMessage(''); }
  function applyAddress(address) {
    if (!address) return;
    setForm((x) => ({ ...x, name: x.name || address.name || '', phone: x.phone || address.phone || '', city: address.city || x.city, address: address.address || x.address }));
  }
  function handleCoupon(e) {
    e.preventDefault();
    const code = couponInput.trim();
    if (!code) { clearCoupon(); setCouponMessage('Coupon removed.'); return; }
    const result = applyCoupon(code);
    setCouponMessage(result.valid ? `${result.coupon.code} applied successfully.` : result.reason);
  }
  function validateStep(targetStep = step) {
    if (targetStep >= 1 && (!form.name || !form.email || !form.phone || !form.city || !form.address)) return 'Please complete your contact and delivery address details.';
    if (targetStep >= 2 && form.paymentMethod === 'Mobile Money' && !form.momo) return 'Please enter your Mobile Money number.';
    if (targetStep >= 2 && form.paymentMethod === 'Card' && (!form.cardName || !form.billingEmail)) return 'Please enter the cardholder name and billing email.';
    if (targetStep >= 3 && !form.terms) return 'Please accept the order terms before placing your order.';
    return '';
  }
  function nextStep() {
    const err = validateStep(step);
    if (err) return setMessage(err);
    setStep((x) => Math.min(3, x + 1));
  }
  async function submit(e) {
    e.preventDefault();
    const err = validateStep(3);
    if (err) return setMessage(err);
    const paymentStatus = form.paymentMethod === 'Cash on Delivery' || form.paymentMethod === 'Bank Transfer' ? 'unpaid' : 'pending';
    const reference = `PAY-${Date.now().toString().slice(-7)}`;
    setMessage('Creating your order...');
    const order = await placeOrder(
      { name: form.name, email: form.email, phone: form.phone, city: form.city, address: form.address },
      form.paymentMethod,
      {
        deliveryMethod: selectedDelivery.name,
        deliveryWindow: selectedDelivery.window,
        paymentStatus,
        paymentReference: reference,
        paymentDetails: { momoNetwork: form.momoNetwork, momo: form.momo, cardName: form.cardName, billingEmail: form.billingEmail, bankReference: form.bankReference },
        notes: form.notes,
        totals: checkoutTotals,
        status: paymentStatus === 'pending' ? 'payment pending' : 'processing'
      }
    );
    if (!order) return setMessage('Unable to place order. Please refresh and try again.');
    if (form.paymentMethod === 'Card' || form.paymentMethod === 'Mobile Money') navigate('payment-status', { order: order.id, status: 'pending', method: form.paymentMethod });
    else navigate('order-confirmation', { order: order.id });
  }

  return (
    <>
      <PageHero eyebrow="Checkout" title="Secure checkout">Choose delivery, payment, and confirm your order in a guided checkout flow.</PageHero>
      <section className="pb-16">
        <form onSubmit={submit} className="container-lux grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <StepPill number="1" label="Delivery" active={step === 1} complete={step > 1} />
              <StepPill number="2" label="Payment" active={step === 2} complete={step > 2} />
              <StepPill number="3" label="Review" active={step === 3} complete={false} />
            </div>

            {step === 1 && <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><h3 className="font-display text-2xl font-bold">Customer & Delivery</h3><p className="mt-2 text-sm text-[#8A7A98]">Where should we send your GLOWOUT GH order?</p></div>
                {selectedAddress && <Button type="button" variant="outline" onClick={() => applyAddress(selectedAddress)}>Use Saved Address</Button>}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
                <Field label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
                <Field label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                <Field label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div className="mt-4"><Field label="Delivery Address" as="textarea" rows="4" value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
              <h4 className="mt-8 font-display text-xl font-bold">Delivery Method</h4>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {DELIVERY_METHODS.map((method) => <button type="button" key={method.id} onClick={() => update('deliveryMethod', method.id)} className={`rounded-2xl border p-4 text-left transition ${form.deliveryMethod === method.id ? 'border-gold bg-gold/10' : 'border-[rgba(201,169,110,.12)] bg-surface-2 hover:border-gold/40'}`}>
                  <div className="flex items-center justify-between gap-3"><span className="font-bold text-white">{method.name}</span><span className="font-bold text-gold">{money(method.price, settings.currency)}</span></div>
                  <p className="mt-2 text-sm text-[#C8BAD0]">{method.window}</p><p className="mt-2 text-xs leading-5 text-[#8A7A98]">{method.note}</p>
                </button>)}
              </div>
              <div className="mt-6 flex justify-end"><Button type="button" onClick={nextStep}>Continue to Payment</Button></div>
            </Card>}

            {step === 2 && <Card className="p-6">
              <h3 className="font-display text-2xl font-bold">Payment Method</h3>
              <p className="mt-2 text-sm text-[#8A7A98]">Select how the customer will pay. Real payment verification will connect to the backend payment routes later.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((method) => <button type="button" key={method.id} onClick={() => update('paymentMethod', method.name)} className={`rounded-2xl border p-4 text-left transition ${form.paymentMethod === method.name ? 'border-gold bg-gold/10' : 'border-[rgba(201,169,110,.12)] bg-surface-2 hover:border-gold/40'}`}>
                  <div className="flex items-start justify-between gap-3"><span className="font-display text-lg font-bold text-white">{method.name}</span><Badge>{method.badge}</Badge></div>
                  <p className="mt-3 text-sm leading-6 text-[#8A7A98]">{method.description}</p>
                </button>)}
              </div>
              <PaymentFields method={form.paymentMethod} form={form} update={update} />
              <div className="mt-6 flex flex-wrap justify-between gap-3"><Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button><Button type="button" onClick={nextStep}>Review Order</Button></div>
            </Card>}

            {step === 3 && <Card className="p-6">
              <h3 className="font-display text-2xl font-bold">Review Order</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-4"><p className="label">Delivery To</p><p className="font-bold text-white">{form.name}</p><p className="mt-2 text-sm leading-6 text-[#C8BAD0]">{form.address}<br />{form.city}<br />{form.phone}</p></div>
                <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-4"><p className="label">Method</p><p className="font-bold text-white">{selectedDelivery.name}</p><p className="mt-2 text-sm leading-6 text-[#C8BAD0]">{selectedDelivery.window}<br />Payment: {form.paymentMethod}</p></div>
              </div>
              <div className="mt-5"><Field label="Order Notes (Optional)" as="textarea" rows="3" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Delivery instructions, preferred call time, or packaging note" /></div>
              <label className="mt-5 flex items-start gap-3 text-sm text-[#C8BAD0]"><input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} className="mt-1" /> I confirm the order details are correct and accept GLOWOUT GH order, delivery, payment and return terms.</label>
              <div className="mt-6 flex flex-wrap justify-between gap-3"><Button type="button" variant="ghost" onClick={() => setStep(2)}>Back</Button><Button type="submit">Place Order</Button></div>
            </Card>}

            {message && <p className="rounded-xl border border-rose/20 bg-rose/10 p-4 text-rose-light">{message}</p>}
          </div>

          <Card className="h-fit p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-2xl font-bold">Order Summary</h3>
            <div className="mt-5 space-y-4">
              {cartItems.map(({ product, qty }) => <div key={product.id} className="grid grid-cols-[64px_1fr_auto] gap-3 rounded-2xl bg-surface-2 p-3 text-sm">
                <ProductImage product={product} className="h-16" />
                <div><p className="font-bold text-white">{product.name}</p><p className="mt-1 text-[#8A7A98]">Qty {qty} · {money(product.price, settings.currency)}</p></div>
                <span className="font-bold text-gold">{money(product.price * qty, settings.currency)}</span>
              </div>)}
            </div>
            <form onSubmit={handleCoupon} className="mt-5 flex gap-2">
              <input className="field" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" />
              <Button type="submit" variant="outline">Apply</Button>
            </form>
            {couponMessage && <p className={`mt-2 text-sm ${cartTotals.couponInfo?.valid ? 'text-gold-light' : 'text-rose-light'}`}>{couponMessage}</p>}
            <div className="mt-5 space-y-3 border-t border-[rgba(201,169,110,.12)] pt-5">
              <Row label="Subtotal" value={money(checkoutTotals.subtotal, settings.currency)} />
              <Row label={`Delivery · ${selectedDelivery.name}`} value={money(checkoutTotals.shipping, settings.currency)} />
              <Row label="Discount" value={`- ${money(checkoutTotals.discount, settings.currency)}`} />
              <Row label={`VAT (${settings.taxRate}%)`} value={money(checkoutTotals.tax, settings.currency)} />
              <Row label="Total" value={money(checkoutTotals.total, settings.currency)} big />
            </div>
            {appliedCouponCode && <p className="mt-3 rounded-xl bg-gold/10 p-3 text-sm text-gold-light">Coupon applied: {appliedCouponCode}</p>}
            <div className="mt-5 rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-4 text-xs leading-6 text-[#8A7A98]">Backend-ready checkout: this screen now captures delivery, payment, customer notes, payment reference fields and order totals needed for real API integration.</div>
          </Card>
        </form>
      </section>
    </>
  );
}
