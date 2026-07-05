import { safeNumber, slugify } from '../utils/helpers';

const roleToUi = {
  OWNER: 'Owner', ADMIN: 'Admin', PRODUCT_MANAGER: 'Product Manager', ORDER_MANAGER: 'Order Manager',
  MARKETING_MANAGER: 'Marketing Manager', FINANCE_MANAGER: 'Finance Manager', CUSTOMER_SUPPORT: 'Customer Support', CUSTOMER: 'Customer'
};
const roleToApi = Object.fromEntries(Object.entries(roleToUi).map(([api, ui]) => [ui, api]));
const productStatusToUi = (status) => status === 'ACTIVE';
const paymentMethodToApi = {
  'Mobile Money': 'MOMO', Card: 'CARD', 'Bank Transfer': 'BANK_TRANSFER', 'Cash on Delivery': 'CASH_ON_DELIVERY', Paystack: 'PAYSTACK'
};
const paymentMethodToUi = {
  MOMO: 'Mobile Money', CARD: 'Card', BANK_TRANSFER: 'Bank Transfer', CASH_ON_DELIVERY: 'Cash on Delivery', PAYSTACK: 'Paystack'
};

export function mapBackendRole(role) { return roleToUi[role] || role || 'Customer'; }
export function mapUiRole(role) { return roleToApi[role] || String(role || 'CUSTOMER').toUpperCase().replaceAll(' ', '_'); }
export function mapPaymentMethodToApi(method) { return paymentMethodToApi[method] || method || 'CASH_ON_DELIVERY'; }
export function mapPaymentMethodToUi(method) { return paymentMethodToUi[method] || method || 'Cash on Delivery'; }

export function backendProductToLocal(product) {
  if (!product) return product;
  const images = Array.isArray(product.images)
    ? product.images.map((image) => typeof image === 'string' ? image : image.url).filter(Boolean)
    : [];
  return {
    id: product.id,
    sku: product.sku || '',
    name: product.name || '',
    brand: product.brand || '',
    category: product.category?.slug || product.categorySlug || product.category || 'perfumes',
    price: safeNumber(product.price),
    wasPrice: safeNumber(product.compareAtPrice),
    stock: safeNumber(product.stock),
    available: productStatusToUi(product.status),
    featured: Boolean(product.attributes?.featured || product.featured),
    badge: product.badge || '',
    rating: safeNumber(product.rating, 0),
    reviews: safeNumber(product.reviewCount || product.reviews, 0),
    images,
    description: product.description || '',
    createdAt: product.createdAt || new Date().toISOString()
  };
}

export function localProductToBackend(product) {
  return {
    name: product.name,
    brand: product.brand || 'GLOWOUT GH',
    description: product.description || '',
    categorySlug: product.category || 'perfumes',
    price: safeNumber(product.price),
    compareAtPrice: safeNumber(product.wasPrice) || undefined,
    stock: safeNumber(product.stock),
    sku: product.sku || undefined,
    status: product.available === false ? 'HIDDEN' : 'ACTIVE',
    badge: product.badge || undefined,
    rating: safeNumber(product.rating, 0) || undefined,
    reviewCount: safeNumber(product.reviews, 0),
    tags: product.tags || [],
    attributes: { featured: Boolean(product.featured) },
    images: (product.images || []).filter(Boolean).map((url, index) => ({ url, alt: product.name, sortOrder: index, isMain: index === 0 }))
  };
}

export function backendCategoryToLocal(category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    subtitle: category.description || category.subtitle || '',
    image: category.imageUrl || category.image || '',
    visible: category.isVisible ?? category.visible ?? true,
    featured: category.isFeatured ?? category.featured ?? false,
    core: category.isCore ?? category.core ?? false,
    order: safeNumber(category.sortOrder ?? category.order, 0),
    productCount: safeNumber(category._count?.products || category.productCount, 0),
    createdAt: category.createdAt || new Date().toISOString()
  };
}

export function localCategoryToBackend(category) {
  return {
    name: category.name,
    slug: category.slug || slugify(category.name),
    description: category.subtitle || category.description || '',
    imageUrl: category.image || category.imageUrl || undefined,
    isCore: Boolean(category.core),
    isVisible: category.visible !== false,
    isFeatured: Boolean(category.featured),
    sortOrder: safeNumber(category.order, 0)
  };
}

export function backendUserToLocal(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || user.customer?.phone || '',
    role: mapBackendRole(user.role),
    type: user.role && user.role !== 'CUSTOMER' ? 'admin' : 'customer',
    active: user.status ? user.status === 'ACTIVE' : true,
    lastSeen: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Backend account',
    permissions: user.permissions || {}
  };
}

export function localTeamUserToBackend(user) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    role: mapUiRole(user.role),
    status: user.active === false ? 'SUSPENDED' : 'ACTIVE',
    permissions: user.permissions || {},
    ...(user.password ? { password: user.password } : {})
  };
}

export function backendCustomerToLocal(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone || '',
    city: customer.city || '',
    address: customer.address || '',
    vip: Boolean(customer.isVip ?? customer.vip),
    blocked: Boolean(customer.isBlocked ?? customer.blocked),
    notes: customer.notes || '',
    orders: safeNumber(customer._count?.orders || customer.orders?.length || customer.orders, 0),
    spend: safeNumber(customer.lifetimeValue || customer.spend, 0),
    joinedAt: customer.createdAt || new Date().toISOString()
  };
}

export function localCustomerToBackend(customer) {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone || undefined,
    address: customer.address || undefined,
    city: customer.city || undefined,
    country: customer.country || 'Ghana',
    isVip: Boolean(customer.vip),
    isBlocked: Boolean(customer.blocked),
    notes: customer.notes || undefined
  };
}

export function backendOrderToLocal(order) {
  const items = (order.items || []).map((item) => ({
    id: item.id,
    productId: item.productId || '',
    name: item.productName || item.name,
    qty: safeNumber(item.quantity || item.qty, 1),
    price: safeNumber(item.unitPrice || item.price, 0),
    image: item.imageUrl || item.image || ''
  }));
  return {
    id: order.orderNumber || order.id,
    backendId: order.id,
    createdAt: order.placedAt || order.createdAt || new Date().toISOString(),
    status: String(order.status || 'PENDING').toLowerCase().replaceAll('_', ' '),
    paid: order.paymentStatus === 'PAID',
    paymentStatus: String(order.paymentStatus || 'UNPAID').toLowerCase(),
    paymentMethod: mapPaymentMethodToUi(order.paymentMethod),
    courier: order.courierName || order.courier || '',
    trackingCode: order.trackingCode || '',
    notes: order.adminNote || order.fulfillmentNote || order.notes || '',
    customer: {
      name: order.customerName || order.customer?.name || '',
      email: order.customerEmail || order.customer?.email || '',
      phone: order.customerPhone || order.customer?.phone || '',
      city: order.city || order.customer?.city || '',
      address: order.deliveryAddress || order.customer?.address || ''
    },
    items,
    subtotal: safeNumber(order.subtotal),
    shipping: safeNumber(order.shippingTotal),
    tax: safeNumber(order.taxTotal),
    discount: safeNumber(order.discountTotal),
    total: safeNumber(order.grandTotal)
  };
}

export function checkoutToBackend(customer, cartItems, paymentMethod, checkoutDetails = {}) {
  return {
    customer: { ...customer, country: customer.country || 'Ghana' },
    items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.qty })),
    deliveryMethod: checkoutDetails.deliveryMethod || 'Standard delivery',
    paymentMethod: mapPaymentMethodToApi(paymentMethod),
    adminNote: checkoutDetails.notes || undefined
  };
}

export function backendReturnToLocal(ret) {
  return {
    id: ret.id,
    orderId: ret.order?.orderNumber || ret.orderId,
    backendOrderId: ret.orderId,
    customer: ret.order?.customerName || ret.customer?.name || ret.customer || '',
    reason: ret.reason,
    details: ret.details || '',
    status: String(ret.status || 'REQUESTED').toLowerCase().replaceAll('_', ' '),
    resolution: String(ret.resolution || 'NONE').toLowerCase().replaceAll('_', ' '),
    refundAmount: safeNumber(ret.refundAmount),
    notes: ret.adminNote || ret.notes || '',
    createdAt: ret.createdAt || new Date().toISOString()
  };
}

export function localReturnToBackend(ret) {
  return {
    orderId: ret.backendOrderId || ret.orderId,
    reason: ret.reason,
    details: ret.details || ret.notes || undefined,
    resolution: String(ret.resolution || 'NONE').toUpperCase().replaceAll(' ', '_'),
    refundAmount: safeNumber(ret.refundAmount) || undefined,
    status: ret.status ? String(ret.status).toUpperCase().replaceAll(' ', '_') : undefined,
    adminNote: ret.notes || undefined
  };
}


export function backendSettingsToLocal(settings = {}) {
  const socialLinks = settings.socialLinks || {};
  const currency = settings.currency === 'GHS' ? 'GH₵' : (settings.currency || 'GH₵');
  // Canonical formats: the backend always stores the tax rate as a fraction
  // (0.075) and the storefront always works in percent (7.5). Convert with a
  // single, deterministic ×100 — no "is this a fraction or a percent?" guessing.
  const taxRate = safeNumber(settings.taxRate, 0.075);
  return {
    storeName: settings.storeName || 'GlowOut gh',
    tagline: settings.tagline || 'Perfumes · Skincare · Wigs',
    announcement: settings.announcement ?? settings.announcementText ?? '',
    announcementActive: settings.announcementActive ?? settings.announcementEnabled ?? false,
    email: settings.email || settings.storeEmail || 'hello@glowoutghbeauty.com',
    phone: settings.phone || settings.storePhone || '+233 55 000 0000',
    whatsapp: settings.whatsapp || socialLinks.whatsapp || '+233550000000',
    address: settings.address || 'Accra, Ghana',
    currency,
    taxRate: taxRate * 100,
    deliveryFee: safeNumber(settings.deliveryFee, 35),
    expressDeliveryFee: safeNumber(settings.expressDeliveryFee, 60),
    freeDeliveryThreshold: safeNumber(settings.freeDeliveryThreshold, 800),
    instagram: settings.instagram || socialLinks.instagram || 'https://instagram.com/glowoutghbeauty',
    tiktok: settings.tiktok || socialLinks.tiktok || 'https://tiktok.com/@glowoutghbeauty',
    facebook: settings.facebook || socialLinks.facebook || 'https://facebook.com/glowoutghbeauty',
    lowStockThreshold: safeNumber(settings.lowStockThreshold, 5)
  };
}

export function localSettingsToBackend(settings = {}) {
  // Storefront percent (7.5) → backend fraction (0.075). Deterministic ÷100.
  const taxRatePercent = safeNumber(settings.taxRate, 7.5);
  return {
    storeName: settings.storeName || 'GlowOut gh',
    storeEmail: settings.email || settings.storeEmail || 'hello@glowoutghbeauty.com',
    storePhone: settings.phone || settings.storePhone || '+233 55 000 0000',
    currency: settings.currency === 'GH₵' ? 'GHS' : (settings.currency || 'GHS'),
    taxRate: taxRatePercent / 100,
    deliveryFee: safeNumber(settings.deliveryFee, 35),
    expressDeliveryFee: safeNumber(settings.expressDeliveryFee, 60),
    freeDeliveryThreshold: safeNumber(settings.freeDeliveryThreshold, 800),
    announcementText: settings.announcement || settings.announcementText || '',
    announcementEnabled: Boolean(settings.announcementActive && (settings.announcement || settings.announcementText)),
    socialLinks: {
      instagram: settings.instagram || '',
      tiktok: settings.tiktok || '',
      facebook: settings.facebook || '',
      whatsapp: settings.whatsapp || ''
    }
  };
}

export function backendCampaignToLocal(campaign) {
  return {
    id: campaign.id,
    title: campaign.title,
    subtitle: campaign.subtitle || '',
    description: campaign.description || '',
    ctaLabel: campaign.ctaLabel || '',
    ctaUrl: campaign.ctaUrl || '',
    imageUrl: campaign.imageUrl || '',
    status: String(campaign.status || 'DRAFT').toLowerCase(),
    active: campaign.status === 'ACTIVE',
    startsAt: campaign.startsAt ? String(campaign.startsAt).slice(0, 10) : '',
    endsAt: campaign.endsAt ? String(campaign.endsAt).slice(0, 10) : '',
    createdAt: campaign.createdAt || new Date().toISOString()
  };
}

export function localCampaignToBackend(campaign) {
  return {
    title: campaign.title,
    subtitle: campaign.subtitle || undefined,
    description: campaign.description || undefined,
    ctaLabel: campaign.ctaLabel || undefined,
    ctaUrl: campaign.ctaUrl || undefined,
    imageUrl: campaign.imageUrl || undefined,
    status: campaign.active ? 'ACTIVE' : String(campaign.status || 'DRAFT').toUpperCase(),
    startsAt: campaign.startsAt || undefined,
    endsAt: campaign.endsAt || undefined
  };
}
