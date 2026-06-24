import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultCategories, defaultCoupons, defaultProducts, defaultReturns, defaultSettings, defaultTeam, demoCustomers, demoOrders } from '../data/defaultData';
import { normalizeProduct, safeNumber, slugify, todayISO, uid } from '../utils/helpers';
import {
  BACKEND_ENABLED,
  clearAuthToken,
  healthApi,
  setAuthToken,
  authApi,
  productApi,
  categoryApi,
  orderApi,
  couponApi,
  returnApi,
  customerApi,
  settingsApi,
  marketingApi,
  teamApi,
  backendProductToLocal,
  localProductToBackend,
  backendCategoryToLocal,
  localCategoryToBackend,
  backendCouponToLocal,
  localCouponToBackend,
  backendUserToLocal,
  localTeamUserToBackend,
  backendCustomerToLocal,
  localCustomerToBackend,
  backendOrderToLocal,
  checkoutToBackend,
  backendReturnToLocal,
  localReturnToBackend,
  backendCampaignToLocal,
  localCampaignToBackend,
  backendSettingsToLocal,
  localSettingsToBackend
} from '../services';

const StoreContext = createContext(null);
const LS_PREFIX = 'glowoutgh_react_';

function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

const toApiOrderStatus = (status) => String(status || 'PROCESSING').toUpperCase().replaceAll(' ', '_');
const toApiPaymentStatus = (status) => String(status || 'UNPAID').toUpperCase().replaceAll(' ', '_');

export function StoreProvider({ children }) {
  const [settings, setSettingsLocal] = useLocalState('settings', defaultSettings);
  const [products, setProducts] = useLocalState('products', defaultProducts);
  const [categories, setCategories] = useLocalState('categories', defaultCategories);
  const [cart, setCart] = useLocalState('cart', []);
  const [wishlist, setWishlist] = useLocalState('wishlist', []);
  const [orders, setOrders] = useLocalState('orders', []);
  const [coupons, setCoupons] = useLocalState('coupons', defaultCoupons);
  const [returns, setReturns] = useLocalState('returns', defaultReturns);
  const [team, setTeam] = useLocalState('team', defaultTeam);
  const [customersManual, setCustomersManual] = useLocalState('customers', demoCustomers);
  const [campaigns, setCampaignsLocal] = useLocalState('campaigns', [
    { id: 'camp_1', title: 'Weekend Glow Drop', description: 'Feature perfumes and skincare bundles for the weekend.', active: true },
    { id: 'camp_2', title: 'Wig Care Week', description: 'Promote wig units with care instructions and bundle offer.', active: false }
  ]);
  const [appliedCouponCode, setAppliedCouponCode] = useLocalState('applied_coupon', '');
  const [currentUser, setCurrentUser] = useLocalState('current_user', null);
  const [savedAddresses, setSavedAddresses] = useLocalState('saved_addresses', []);
  const [passwordResetRequests, setPasswordResetRequests] = useLocalState('password_reset_requests', []);
  const [apiStatus, setApiStatus] = useState({ enabled: BACKEND_ENABLED, connected: false, loading: false, message: BACKEND_ENABLED ? 'Backend not checked yet.' : 'Backend integration disabled.', lastSync: '', lastError: '' });

  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const visibleCategories = useMemo(() => categories.filter((c) => c.visible).sort((a, b) => safeNumber(a.order) - safeNumber(b.order)), [categories]);

  function apiTask(label, task, { silent = false } = {}) {
    if (!BACKEND_ENABLED) return Promise.resolve(null);
    if (!silent) setApiStatus((s) => ({ ...s, loading: true, message: `${label}...`, lastError: '' }));
    return Promise.resolve()
      .then(task)
      .then((result) => {
        setApiStatus((s) => ({ ...s, connected: true, loading: false, message: `${label} completed.`, lastSync: new Date().toISOString(), lastError: '' }));
        return result;
      })
      .catch((error) => {
        setApiStatus((s) => ({ ...s, connected: false, loading: false, message: 'Using local fallback data.', lastError: error?.message || String(error) }));
        return null;
      });
  }

  async function syncPublicData() {
    if (!BACKEND_ENABLED) return { ok: false, message: 'Backend disabled.' };
    setApiStatus((s) => ({ ...s, loading: true, message: 'Syncing public storefront data...', lastError: '' }));
    try {
      await healthApi();
      const [apiProducts, apiCategories, apiSettings, apiCampaigns] = await Promise.all([
        productApi.list().catch(() => null),
        categoryApi.list().catch(() => null),
        settingsApi.read().catch(() => null),
        marketingApi.list().catch(() => null)
      ]);
      if (Array.isArray(apiProducts)) setProducts(apiProducts.map(backendProductToLocal));
      if (Array.isArray(apiCategories)) setCategories(apiCategories.map(backendCategoryToLocal));
      if (apiSettings && typeof apiSettings === 'object' && !Array.isArray(apiSettings)) setSettingsLocal((old) => ({ ...old, ...backendSettingsToLocal(apiSettings) }));
      if (Array.isArray(apiCampaigns)) setCampaignsLocal(apiCampaigns.map(backendCampaignToLocal));
      setApiStatus({ enabled: true, connected: true, loading: false, message: 'Backend public data synced.', lastSync: new Date().toISOString(), lastError: '' });
      return { ok: true };
    } catch (error) {
      setApiStatus({ enabled: true, connected: false, loading: false, message: 'Backend unavailable. The frontend is using local fallback data.', lastSync: '', lastError: error?.message || String(error) });
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function syncAdminData() {
    if (!BACKEND_ENABLED) return { ok: false, message: 'Backend disabled.' };
    return apiTask('Syncing admin data', async () => {
      const [apiOrders, apiCoupons, apiReturns, apiCustomers, apiTeam] = await Promise.all([
        orderApi.list().catch(() => null),
        couponApi.list().catch(() => null),
        returnApi.list().catch(() => null),
        customerApi.list().catch(() => null),
        teamApi.list().catch(() => null)
      ]);
      if (Array.isArray(apiOrders)) setOrders(apiOrders.map(backendOrderToLocal));
      if (Array.isArray(apiCoupons)) setCoupons(apiCoupons.map(backendCouponToLocal));
      if (Array.isArray(apiReturns)) setReturns(apiReturns.map(backendReturnToLocal));
      if (Array.isArray(apiCustomers)) setCustomersManual(apiCustomers.map(backendCustomerToLocal));
      if (Array.isArray(apiTeam)) setTeam(apiTeam.map(backendUserToLocal));
      return { ok: true };
    }, { silent: false }) || { ok: false };
  }

  async function syncWithBackend() {
    const publicResult = await syncPublicData();
    if (currentUser?.type === 'admin') await syncAdminData();
    return publicResult;
  }

  useEffect(() => { syncPublicData(); }, []);

  function upsertProduct(raw) {
    const product = normalizeProduct({
      ...raw,
      id: raw.id || uid('p'),
      sku: raw.sku || `GOGH-${Date.now().toString().slice(-5)}`,
      createdAt: raw.createdAt || todayISO()
    });
    setProducts((list) => list.some((p) => p.id === product.id) ? list.map((p) => p.id === product.id ? product : p) : [product, ...list]);
    apiTask('Saving product to backend', async () => {
      const payload = localProductToBackend(product);
      const saved = raw.id ? await productApi.update(raw.id, payload) : await productApi.create(payload);
      const mapped = backendProductToLocal(saved);
      setProducts((list) => list.map((p) => p.id === product.id ? mapped : p));
      return mapped;
    }, { silent: true });
    return product;
  }
  function deleteProduct(id) {
    setProducts((list) => list.filter((p) => p.id !== id));
    setCart((list) => list.filter((item) => item.productId !== id));
    setWishlist((list) => list.filter((x) => x !== id));
    apiTask('Deleting product from backend', () => productApi.remove(id), { silent: true });
  }
  function duplicateProduct(product) {
    if (BACKEND_ENABLED && product.id) {
      apiTask('Duplicating product in backend', async () => {
        const copy = backendProductToLocal(await productApi.duplicate(product.id));
        setProducts((list) => [copy, ...list]);
        return copy;
      }, { silent: true });
    }
    return upsertProduct({ ...product, id: '', name: `${product.name} Copy`, sku: `${product.sku || 'SKU'}-COPY`, createdAt: todayISO() });
  }
  function resetProducts() { setProducts(defaultProducts); }

  function upsertCategory(raw) {
    const oldCategory = categories.find((c) => c.id === raw.id);
    const slug = raw.slug ? slugify(raw.slug) : slugify(raw.name);
    const category = { ...raw, id: raw.id || uid('cat'), slug, createdAt: raw.createdAt || todayISO(), order: safeNumber(raw.order, categories.length + 1) };
    setCategories((list) => list.some((c) => c.id === category.id) ? list.map((c) => c.id === category.id ? category : c) : [...list, category]);
    if (oldCategory && oldCategory.slug !== category.slug) setProducts((list) => list.map((product) => product.category === oldCategory.slug ? { ...product, category: category.slug } : product));
    apiTask('Saving category to backend', async () => {
      const payload = localCategoryToBackend(category);
      const saved = raw.id ? await categoryApi.update(raw.id, payload) : await categoryApi.create(payload);
      const mapped = backendCategoryToLocal(saved);
      setCategories((list) => list.map((c) => c.id === category.id ? mapped : c));
      return mapped;
    }, { silent: true });
    return category;
  }
  function deleteCategory(id) {
    const category = categories.find((c) => c.id === id);
    if (!category || category.core) return false;
    setCategories((list) => list.filter((c) => c.id !== id));
    setProducts((list) => list.map((p) => p.category === category.slug ? { ...p, category: 'perfumes' } : p));
    apiTask('Deleting category from backend', () => categoryApi.remove(id), { silent: true });
    return true;
  }
  function toggleCategory(id, field) {
    setCategories((list) => list.map((c) => {
      if (c.id !== id) return c;
      const next = { ...c, [field]: !c[field] };
      apiTask('Updating category status', () => categoryApi.update(id, localCategoryToBackend(next)), { silent: true });
      return next;
    }));
  }
  function resetCategories() { setCategories(defaultCategories); }

  function addToCart(productId, qty = 1) {
    const product = productsById[productId];
    if (!product || !product.available || product.stock <= 0) return false;
    setCart((list) => {
      const existing = list.find((item) => item.productId === productId);
      if (existing) return list.map((item) => item.productId === productId ? { ...item, qty: Math.min(item.qty + qty, product.stock) } : item);
      return [...list, { productId, qty: Math.min(qty, product.stock) }];
    });
    return true;
  }
  function updateCartQty(productId, qty) {
    const product = productsById[productId];
    const nextQty = Math.max(0, Math.min(safeNumber(qty), product?.stock || 0));
    setCart((list) => nextQty === 0 ? list.filter((item) => item.productId !== productId) : list.map((item) => item.productId === productId ? { ...item, qty: nextQty } : item));
  }
  function removeFromCart(productId) { setCart((list) => list.filter((item) => item.productId !== productId)); }
  function clearCart() { setCart([]); setAppliedCouponCode(''); }
  function toggleWishlist(productId) { setWishlist((list) => list.includes(productId) ? list.filter((id) => id !== productId) : [...list, productId]); }
  function saveForLater(productId) { toggleWishlist(productId); removeFromCart(productId); }

  const cartItems = useMemo(() => cart.map((item) => ({ ...item, product: productsById[item.productId] })).filter((item) => item.product), [cart, productsById]);
  const validateCoupon = (code = appliedCouponCode, items = cartItems) => {
    const normalCode = String(code || '').trim().toUpperCase();
    if (!normalCode) return { valid: false, reason: '', coupon: null, discount: 0, freeShipping: false };
    const coupon = coupons.find((c) => c.code.toUpperCase() === normalCode);
    if (!coupon) return { valid: false, reason: 'Coupon code not found.', coupon: null, discount: 0, freeShipping: false };
    const now = new Date(todayISO());
    if (!coupon.active) return { valid: false, reason: 'Coupon is hidden or inactive.', coupon, discount: 0, freeShipping: false };
    if (coupon.startDate && now < new Date(coupon.startDate)) return { valid: false, reason: 'Coupon is not active yet.', coupon, discount: 0, freeShipping: false };
    if (coupon.endDate && now > new Date(coupon.endDate)) return { valid: false, reason: 'Coupon has expired.', coupon, discount: 0, freeShipping: false };
    if (coupon.usageLimit && safeNumber(coupon.used) >= safeNumber(coupon.usageLimit)) return { valid: false, reason: 'Coupon usage limit reached.', coupon, discount: 0, freeShipping: false };
    const eligibleItems = coupon.category && coupon.category !== 'all' ? items.filter((item) => item.product.category === coupon.category) : items;
    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    if (eligibleSubtotal < safeNumber(coupon.minOrder)) return { valid: false, reason: `Minimum order is ${settings.currency}${coupon.minOrder}.`, coupon, discount: 0, freeShipping: false };
    let discount = 0; let freeShipping = false;
    if (coupon.type === 'percentage') discount = eligibleSubtotal * safeNumber(coupon.value) / 100;
    if (coupon.type === 'fixed') discount = safeNumber(coupon.value);
    if (coupon.type === 'shipping') freeShipping = true;
    if (coupon.maxDiscount) discount = Math.min(discount, safeNumber(coupon.maxDiscount));
    return { valid: true, reason: 'Coupon applied.', coupon, discount, freeShipping };
  };
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const couponInfo = validateCoupon(appliedCouponCode, cartItems);
    const baseShipping = subtotal <= 0 || subtotal >= safeNumber(settings.freeDeliveryThreshold) ? 0 : safeNumber(settings.deliveryFee);
    const shipping = couponInfo.freeShipping ? 0 : baseShipping;
    const discount = couponInfo.valid ? couponInfo.discount : 0;
    const tax = Math.max(subtotal - discount, 0) * safeNumber(settings.taxRate) / 100;
    const total = Math.max(subtotal - discount, 0) + shipping + tax;
    return { subtotal, shipping, discount, tax, total, couponInfo };
  }, [cartItems, appliedCouponCode, coupons, settings]);

  function applyCoupon(code) {
    const result = validateCoupon(code, cartItems);
    apiTask('Validating coupon with backend', async () => {
      const backendResult = await couponApi.validate({ code, customerEmail: currentUser?.email, items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.qty })) });
      return backendResult;
    }, { silent: true });
    if (result.valid) setAppliedCouponCode(String(code || '').trim().toUpperCase());
    return result;
  }
  function clearCoupon() { setAppliedCouponCode(''); }
  function incrementCouponUse(code) {
    if (!code) return;
    setCoupons((list) => list.map((c) => c.code.toUpperCase() === String(code).toUpperCase() ? { ...c, used: safeNumber(c.used) + 1 } : c));
  }

  async function placeOrder(customer, paymentMethod = 'Mobile Money', checkoutDetails = {}) {
    if (!cartItems.length) return null;
    const totals = checkoutDetails.totals || cartTotals;
    const paymentStatus = checkoutDetails.paymentStatus || (paymentMethod === 'Cash on Delivery' ? 'unpaid' : 'pending');
    const localOrder = {
      id: `GH-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: checkoutDetails.status || 'processing',
      paid: paymentStatus === 'paid', paymentStatus, paymentMethod,
      deliveryMethod: checkoutDetails.deliveryMethod || 'Standard delivery', deliveryWindow: checkoutDetails.deliveryWindow || '', deliveryFee: safeNumber(totals.shipping),
      paymentReference: checkoutDetails.paymentReference || '', paymentDetails: checkoutDetails.paymentDetails || {}, courier: '', trackingCode: '', notes: checkoutDetails.notes || '', customer,
      items: cartItems.map((item) => ({ productId: item.product.id, name: item.product.name, qty: item.qty, price: item.product.price, image: item.product.images?.[0] || '' })),
      subtotal: safeNumber(totals.subtotal), shipping: safeNumber(totals.shipping), tax: safeNumber(totals.tax), discount: safeNumber(totals.discount), total: safeNumber(totals.total),
      couponCode: totals.couponInfo?.valid ? totals.couponInfo.coupon.code : (checkoutDetails.couponCode || '')
    };
    let finalOrder = localOrder;
    if (BACKEND_ENABLED) {
      const backendOrder = await apiTask('Creating backend order', async () => orderApi.checkout(checkoutToBackend(customer, cartItems, paymentMethod, { ...checkoutDetails, totals })), { silent: false });
      if (backendOrder) finalOrder = backendOrderToLocal(backendOrder);
    }
    setOrders((list) => [finalOrder, ...list]);
    setProducts((list) => list.map((product) => {
      const bought = cartItems.find((item) => item.product.id === product.id);
      return bought ? { ...product, stock: Math.max(0, safeNumber(product.stock) - bought.qty) } : product;
    }));
    incrementCouponUse(finalOrder.couponCode);
    clearCart();
    return finalOrder;
  }
  function loadDemoOrders() { setOrders((list) => list.length ? list : demoOrders); }
  function upsertOrder(order) {
    setOrders((list) => list.some((o) => o.id === order.id) ? list.map((o) => o.id === order.id ? order : o) : [order, ...list]);
    const targetId = order.backendId || order.id;
    apiTask('Updating backend order', async () => {
      if (order.status) await orderApi.updateStatus(targetId, toApiOrderStatus(order.status));
      if (order.paymentStatus) await orderApi.updatePayment(targetId, toApiPaymentStatus(order.paymentStatus));
      if (order.courier || order.trackingCode || order.notes) await orderApi.updateFulfillment(targetId, { courierName: order.courier, trackingCode: order.trackingCode, fulfillmentNote: order.notes });
    }, { silent: true });
  }
  function deleteOrder(id) {
    const order = orders.find((o) => o.id === id);
    setOrders((list) => list.filter((o) => o.id !== id));
    apiTask('Deleting backend order', () => orderApi.remove(order?.backendId || id), { silent: true });
  }

  function upsertCoupon(raw) {
    const coupon = { ...raw, id: raw.id || uid('coupon'), code: String(raw.code || '').trim().toUpperCase(), createdAt: raw.createdAt || todayISO(), used: safeNumber(raw.used) };
    setCoupons((list) => list.some((c) => c.id === coupon.id) ? list.map((c) => c.id === coupon.id ? coupon : c) : [coupon, ...list]);
    apiTask('Saving coupon to backend', async () => {
      const payload = localCouponToBackend(coupon);
      const saved = raw.id ? await couponApi.update(raw.id, payload) : await couponApi.create(payload);
      const mapped = backendCouponToLocal(saved);
      setCoupons((list) => list.map((c) => c.id === coupon.id ? mapped : c));
      return mapped;
    }, { silent: true });
    return coupon;
  }
  function deleteCoupon(id) { setCoupons((list) => list.filter((c) => c.id !== id)); apiTask('Deleting coupon from backend', () => couponApi.remove(id), { silent: true }); }
  function resetCoupons() { setCoupons(defaultCoupons); }

  function upsertReturn(raw) {
    const ret = { ...raw, id: raw.id || `RET-${Date.now().toString().slice(-5)}`, createdAt: raw.createdAt || todayISO() };
    setReturns((list) => list.some((r) => r.id === ret.id) ? list.map((r) => r.id === ret.id ? ret : r) : [ret, ...list]);
    apiTask('Saving return to backend', async () => {
      const payload = localReturnToBackend(ret);
      const saved = raw.id ? await returnApi.update(raw.id, payload) : await returnApi.create(payload);
      const mapped = backendReturnToLocal(saved);
      setReturns((list) => list.map((r) => r.id === ret.id ? mapped : r));
      return mapped;
    }, { silent: true });
    return ret;
  }
  function deleteReturn(id) { setReturns((list) => list.filter((r) => r.id !== id)); apiTask('Deleting return from backend', () => returnApi.remove(id), { silent: true }); }

  const customers = useMemo(() => {
    const map = new Map(customersManual.map((c) => [c.email, { ...c }]));
    orders.forEach((order) => {
      const email = order.customer?.email || `guest-${order.id}@local`;
      const existing = map.get(email) || { id: uid('cust'), name: order.customer?.name || 'Guest Customer', email, phone: order.customer?.phone || '', city: order.customer?.city || '', vip: false, blocked: false, orders: 0, spend: 0 };
      existing.orders = safeNumber(existing.orders) + 1;
      existing.spend = safeNumber(existing.spend) + safeNumber(order.total);
      map.set(email, existing);
    });
    return [...map.values()];
  }, [customersManual, orders]);
  function upsertCustomer(raw) {
    const customer = { ...raw, id: raw.id || uid('cust'), email: String(raw.email || '').trim().toLowerCase() };
    setCustomersManual((list) => list.some((c) => c.id === customer.id || c.email?.toLowerCase() === customer.email) ? list.map((c) => (c.id === customer.id || c.email?.toLowerCase() === customer.email) ? { ...c, ...customer } : c) : [customer, ...list]);
    apiTask('Updating backend customer', () => customerApi.update(customer.id, localCustomerToBackend(customer)), { silent: true });
    return customer;
  }
  function deleteCustomer(id) { setCustomersManual((list) => list.filter((c) => c.id !== id)); }

  function upsertTeamUser(raw) {
    const localUser = { ...raw, id: raw.id || uid('user') };
    setTeam((list) => list.some((u) => u.id === localUser.id) ? list.map((u) => u.id === localUser.id ? localUser : u) : [localUser, ...list]);
    apiTask('Saving team member to backend', async () => {
      const payload = localTeamUserToBackend(localUser);
      const saved = raw.id ? await teamApi.update(raw.id, payload) : await teamApi.create(payload);
      const mapped = backendUserToLocal(saved);
      setTeam((list) => list.map((u) => u.id === localUser.id ? mapped : u));
      return mapped;
    }, { silent: true });
  }
  function deleteTeamUser(id) { setTeam((list) => list.filter((u) => u.id !== id)); apiTask('Deleting team user from backend', () => teamApi.remove(id), { silent: true }); }

  async function login(email, password) {
    const normalEmail = String(email || '').trim().toLowerCase();
    const normalPassword = String(password || '');
    if (BACKEND_ENABLED) {
      const backendResult = await apiTask('Logging in with backend', () => authApi.login({ email: normalEmail, password: normalPassword }), { silent: false });
      if (backendResult?.user && backendResult?.token) {
        setAuthToken(backendResult.token);
        const user = backendUserToLocal(backendResult.user);
        setCurrentUser(user);
        if (user.type === 'admin') await syncAdminData();
        return { ok: true, user, source: 'backend' };
      }
    }
    const demoPassword = 'glowoutgh123';
    const teamUser = team.find((user) => user.email.toLowerCase() === normalEmail && user.active !== false);
    const customerUser = customers.find((customer) => customer.email.toLowerCase() === normalEmail && !customer.blocked);
    const customerPasswordOk = customerUser?.password ? customerUser.password === normalPassword : normalPassword === demoPassword;
    if (teamUser && normalPassword === demoPassword) {
      const user = { id: teamUser.id, name: teamUser.name, email: teamUser.email, role: teamUser.role, type: 'admin' };
      setCurrentUser(user);
      return { ok: true, user, source: 'local' };
    }
    if (customerUser && customerPasswordOk) {
      const user = { id: customerUser.id, name: customerUser.name, email: customerUser.email, role: 'Customer', type: 'customer' };
      setCurrentUser(user);
      return { ok: true, user, source: 'local' };
    }
    return { ok: false, message: 'Invalid login details. Use a backend account or demo password glowoutgh123.' };
  }

  async function loginWithGoogle(credential) {
    if (!credential) return { ok: false, message: 'Google sign-in was cancelled.' };
    if (!BACKEND_ENABLED) return { ok: false, message: 'Google sign-in requires the backend API to be enabled.' };
    const backendResult = await apiTask('Verifying Google sign-in', () => authApi.google(credential), { silent: false });
    if (backendResult?.user && backendResult?.token) {
      setAuthToken(backendResult.token);
      const user = backendUserToLocal(backendResult.user);
      setCurrentUser(user);
      if (user.type === 'admin') await syncAdminData();
      return { ok: true, user, source: 'backend' };
    }
    return { ok: false, message: 'Google sign-in failed. Make sure you already have an account with this email.' };
  }

  async function registerCustomer(raw) {
    const email = String(raw.email || '').trim().toLowerCase();
    if (!raw.name || !email || !raw.password) return { ok: false, message: 'Name, email and password are required.' };
    if (raw.password.length < 6) return { ok: false, message: 'Password must be at least 6 characters.' };
    if (BACKEND_ENABLED) {
      const backendResult = await apiTask('Creating backend account', () => authApi.register({ name: raw.name, email, phone: raw.phone || undefined, password: raw.password, role: 'CUSTOMER' }), { silent: false });
      if (backendResult?.user && backendResult?.token) {
        setAuthToken(backendResult.token);
        const user = backendUserToLocal(backendResult.user);
        setCurrentUser(user);
        return { ok: true, user, source: 'backend' };
      }
    }
    if (team.some((user) => user.email.toLowerCase() === email) || customers.some((customer) => customer.email.toLowerCase() === email)) return { ok: false, message: 'An account already exists with this email.' };
    const customer = upsertCustomer({ name: raw.name, email, phone: raw.phone || '', city: raw.city || '', vip: false, blocked: false, orders: 0, spend: 0, password: raw.password, joinedAt: todayISO() });
    const user = { id: customer.id, name: customer.name, email: customer.email, role: 'Customer', type: 'customer' };
    setCurrentUser(user);
    return { ok: true, user, source: 'local' };
  }

  function updateCurrentUserProfile(raw) {
    if (!currentUser) return { ok: false, message: 'No active account.' };
    const updated = { ...currentUser, name: raw.name || currentUser.name, email: String(raw.email || currentUser.email).trim().toLowerCase() };
    if (currentUser.type === 'customer') {
      const existing = customers.find((customer) => customer.id === currentUser.id || customer.email.toLowerCase() === currentUser.email.toLowerCase()) || {};
      upsertCustomer({ ...existing, ...raw, id: existing.id || currentUser.id, name: updated.name, email: updated.email });
    } else {
      setTeam((list) => list.map((user) => user.id === currentUser.id ? { ...user, name: updated.name, email: updated.email } : user));
    }
    setCurrentUser(updated);
    return { ok: true, user: updated };
  }

  async function changePassword(currentPassword, nextPassword) {
    if (!currentUser) return { ok: false, message: 'Login required.' };
    if (!nextPassword || nextPassword.length < 6) return { ok: false, message: 'New password must be at least 6 characters.' };
    if (BACKEND_ENABLED) {
      const result = await apiTask('Updating backend password', () => authApi.changePassword({ currentPassword, newPassword: nextPassword }), { silent: false });
      if (result !== null) return { ok: true, message: 'Password updated.' };
    }
    const customer = customers.find((item) => item.id === currentUser.id || item.email.toLowerCase() === currentUser.email.toLowerCase());
    if (currentUser.type === 'customer' && customer?.password && customer.password !== currentPassword) return { ok: false, message: 'Current password is incorrect.' };
    if (currentUser.type === 'customer' && customer) upsertCustomer({ ...customer, password: nextPassword });
    return { ok: true, message: 'Password updated for this demo account.' };
  }

  async function requestPasswordReset(email) {
    const normalEmail = String(email || '').trim().toLowerCase();
    if (!normalEmail) return { ok: false, message: 'Enter your email address.' };
    if (BACKEND_ENABLED) {
      try {
        await authApi.requestPasswordReset(normalEmail);
      } catch {
        // The backend always returns success to avoid leaking which emails
        // exist; a thrown error here means a network/server problem, not a
        // missing account. We still show the same neutral message.
      }
      return { ok: true, message: 'If an account exists for that email, a reset link has been sent. Check your inbox.' };
    }
    setPasswordResetRequests((list) => [{ id: uid('reset'), email: normalEmail, status: 'requested', createdAt: new Date().toISOString() }, ...list]);
    return { ok: true, message: 'Password reset request saved (local demo mode).' };
  }

  async function resetPassword(token, newPassword) {
    if (!token) return { ok: false, message: 'This reset link is missing its token.' };
    if (!newPassword || newPassword.length < 8) return { ok: false, message: 'New password must be at least 8 characters.' };
    if (!BACKEND_ENABLED) return { ok: false, message: 'Password reset requires the backend API to be enabled.' };
    try {
      await authApi.resetPassword(token, newPassword);
      return { ok: true, message: 'Password updated. You can now sign in with your new password.' };
    } catch (error) {
      return { ok: false, message: error?.message || 'This reset link is invalid or has expired.' };
    }
  }

  function upsertAddress(raw) {
    if (!currentUser) return null;
    const address = { ...raw, id: raw.id || uid('addr'), userEmail: currentUser.email, createdAt: raw.createdAt || todayISO() };
    setSavedAddresses((list) => list.some((item) => item.id === address.id) ? list.map((item) => item.id === address.id ? address : item) : [address, ...list]);
    return address;
  }
  function deleteAddress(id) { setSavedAddresses((list) => list.filter((address) => address.id !== id)); }

  function logout() {
    if (BACKEND_ENABLED) {
      // Clears the httpOnly auth cookie server-side. Fire-and-forget; we clear
      // local state regardless of the network result.
      apiTask('Signing out', () => authApi.logout(), { silent: true }).catch(() => {});
    }
    clearAuthToken();
    setCurrentUser(null);
  }

  function setSettings(nextSettings) {
    setSettingsLocal(nextSettings);
    apiTask('Saving settings to backend', () => settingsApi.update(localSettingsToBackend(nextSettings)), { silent: true });
  }
  function setCampaigns(nextCampaigns) {
    if (typeof nextCampaigns === 'function') setCampaignsLocal((old) => nextCampaigns(old));
    else setCampaignsLocal(nextCampaigns);
  }
  function upsertCampaign(raw) {
    const localCampaign = { ...raw, id: raw.id || uid('camp'), createdAt: raw.createdAt || todayISO() };
    setCampaignsLocal((list) => list.some((c) => c.id === localCampaign.id) ? list.map((c) => c.id === localCampaign.id ? localCampaign : c) : [localCampaign, ...list]);
    apiTask('Saving campaign to backend', async () => {
      const payload = localCampaignToBackend(localCampaign);
      const saved = raw.id ? await marketingApi.update(raw.id, payload) : await marketingApi.create(payload);
      const mapped = backendCampaignToLocal(saved);
      setCampaignsLocal((list) => list.map((c) => c.id === localCampaign.id ? mapped : c));
      return mapped;
    }, { silent: true });
    return localCampaign;
  }
  function deleteCampaign(id) { setCampaignsLocal((list) => list.filter((c) => c.id !== id)); apiTask('Deleting campaign from backend', () => marketingApi.remove(id), { silent: true }); }

  const analytics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + safeNumber(order.total), 0);
    const discounts = orders.reduce((sum, order) => sum + safeNumber(order.discount), 0);
    const tax = orders.reduce((sum, order) => sum + safeNumber(order.tax), 0);
    const refunds = returns.reduce((sum, ret) => ['approved', 'refunded'].includes(ret.status) ? sum + safeNumber(ret.refundAmount) : sum, 0);
    const openOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
    const lowStock = products.filter((p) => safeNumber(p.stock) <= safeNumber(settings.lowStockThreshold) && p.available).length;
    const productSales = {}; const categorySales = {};
    orders.forEach((order) => order.items.forEach((item) => {
      productSales[item.name] = (productSales[item.name] || 0) + item.qty;
      const product = productsById[item.productId];
      if (product) categorySales[product.category] = (categorySales[product.category] || 0) + item.qty * item.price;
    }));
    return { revenue, discounts, tax, refunds, netRevenue: revenue - refunds, openOrders, lowStock, aov: orders.length ? revenue / orders.length : 0, productSales, categorySales };
  }, [orders, products, productsById, returns, settings.lowStockThreshold]);

  const value = {
    settings, setSettings, products, setProducts, categories, setCategories, visibleCategories, cart, cartItems, wishlist, orders, setOrders, coupons, setCoupons, returns, setReturns, team, customers, campaigns, setCampaigns, appliedCouponCode, currentUser, savedAddresses, passwordResetRequests, apiStatus,
    syncWithBackend, syncPublicData, syncAdminData,
    upsertProduct, deleteProduct, duplicateProduct, resetProducts,
    upsertCategory, deleteCategory, toggleCategory, resetCategories,
    addToCart, updateCartQty, removeFromCart, clearCart, toggleWishlist, saveForLater, cartTotals, applyCoupon, clearCoupon, validateCoupon, placeOrder,
    upsertOrder, deleteOrder, loadDemoOrders,
    upsertCoupon, deleteCoupon, resetCoupons,
    upsertReturn, deleteReturn,
    upsertCustomer, deleteCustomer,
    upsertTeamUser, deleteTeamUser, login, loginWithGoogle, registerCustomer, updateCurrentUserProfile, changePassword, requestPasswordReset, resetPassword, upsertAddress, deleteAddress, logout,
    upsertCampaign, deleteCampaign,
    analytics
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
};
