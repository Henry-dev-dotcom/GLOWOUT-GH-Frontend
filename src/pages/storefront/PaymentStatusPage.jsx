import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { backendOrderToLocal } from '../../services';
import { Badge, Button, Card, EmptyState, PageHero, Reveal } from '../../components/Common';
import { money } from '../../utils/helpers';

// Paystack normally appends ?trxref=...&reference=... to the callback URL.
// Depending on how the redirect is built the reference can land either inside
// the hash route params or in the regular query string, so check both.
function getPaystackReference(params) {
  if (params.reference || params.trxref) return params.reference || params.trxref;
  const search = new URLSearchParams(window.location.search);
  return search.get('reference') || search.get('trxref') || '';
}

export function PaymentStatusPage({ navigate, params = {} }) {
  const { orders, settings, verifyPayment } = useStore();
  const reference = getPaystackReference(params);
  const [verifyState, setVerifyState] = useState(reference ? 'verifying' : 'idle');
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    let active = true;
    if (!reference) return undefined;
    verifyPayment(reference).then((result) => {
      if (!active) return;
      setVerifyResult(result);
      setVerifyState(result.ok ? 'done' : 'error');
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const verifiedOrder = verifyResult?.payment?.order ? backendOrderToLocal(verifyResult.payment.order) : null;
  const order = useMemo(() => {
    const wanted = params.order || verifyResult?.orderId || '';
    return orders.find((item) => item.id === wanted) || verifiedOrder || (wanted ? null : orders[0]) || null;
  }, [orders, params.order, verifyResult, verifiedOrder]);

  if (!order) {
    return <><PageHero eyebrow="Payment" title="Payment not found" /><section className="pb-16"><div className="container-lux"><EmptyState title="No payment session" action={<Button onClick={() => navigate('checkout')}>Back to Checkout</Button>}>Place an order first before opening payment status.</EmptyState></div></section></>;
  }

  const verifiedStatus = verifyState === 'done' ? String(verifyResult?.status || '') : '';
  const current = verifyState === 'verifying' ? 'verifying'
    : verifiedStatus === 'paid' ? 'paid'
    : verifiedStatus === 'failed' ? 'failed'
    : order.paymentStatus === 'paid' ? 'paid'
    : order.paymentStatus === 'failed' ? 'failed'
    : 'pending';
  const title = current === 'verifying' ? 'Confirming your payment...' : current === 'paid' ? 'Payment successful' : current === 'failed' ? 'Payment failed' : 'Payment pending';
  const referenceLabel = reference || verifyResult?.payment?.reference || order.paymentReference || 'Pending';

  return (
    <>
      <PageHero eyebrow="Payment Status" title={title}>We confirm every payment before dispatch. Your order status updates here and in your account.</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[1fr_360px]">
          <Reveal>
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="section-eyebrow">Order</p><h2 className="mt-2 font-display text-3xl font-bold">{order.id}</h2></div>
              <Badge status={current === 'verifying' ? 'pending' : current}>
                {current === 'verifying' ? <span className="inline-flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> checking</span> : current}
              </Badge>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5"><p className="label">Amount</p><p className="font-display text-2xl font-bold text-gold">{money(order.total, settings.currency)}</p></div>
              <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5"><p className="label">Method</p><p className="font-bold text-white">{order.paymentMethod}</p></div>
              <div className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-5"><p className="label">Reference</p><p className="break-all font-bold text-white">{referenceLabel}</p></div>
            </div>

            <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/10 p-5 text-sm leading-7 text-gold-light">
              {current === 'verifying' ? 'Please wait while we confirm your payment with Paystack. This usually takes a few seconds.'
                : current === 'paid' ? 'Your payment has been confirmed. We are preparing your order for dispatch.'
                : current === 'failed' ? 'Your payment could not be confirmed. You have not been charged for a failed transaction — you can try again or contact us for help.'
                : verifyState === 'error' ? 'We could not confirm the payment automatically. If you completed the payment, do not worry — our team verifies every transaction and will update your order shortly.'
                : 'Your payment is being confirmed. You will see the update here — keep your order number handy.'}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('order-confirmation', { order: order.id })}>View Order Confirmation</Button>
              {current === 'failed' && <Button type="button" onClick={() => navigate('contact')}>Contact Support</Button>}
            </div>
          </Card>
          </Reveal>

          <Reveal delay={120}>
          <Card className="h-fit p-6">
            <h3 className="font-display text-2xl font-bold">Payment Checklist</h3>
            <div className="mt-5 space-y-3 text-sm text-[#C8BAD0]">
              <p className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-300" /> Order has been created</p>
              <p className="flex items-center gap-2">
                {current === 'paid' ? <><CheckCircle2 size={16} className="shrink-0 text-emerald-300" /> Payment verified</>
                  : current === 'failed' ? <><AlertCircle size={16} className="shrink-0 text-rose-light" /> Payment not confirmed</>
                  : <><Loader2 size={16} className="shrink-0 animate-spin text-gold" /> Payment verification in progress</>}
              </p>
              <p className="flex items-center gap-2">
                {current === 'paid' ? <><Circle size={16} className="shrink-0 text-[#564869]" /> Preparing for dispatch</> : <><Circle size={16} className="shrink-0 text-[#564869]" /> Dispatch after payment confirmation</>}
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <Button variant="outline" onClick={() => navigate('tracking', { order: order.id })}>Track Order</Button>
              <Button variant="ghost" onClick={() => navigate('shop')}>Continue Shopping</Button>
            </div>
          </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
