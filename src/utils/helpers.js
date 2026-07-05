export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
export const slugify = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const money = (amount = 0, currency = 'GH₵') => `${currency}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

// Ghana mobile numbers: local 0XXXXXXXXX (10 digits) or international
// +233XXXXXXXXX / 233XXXXXXXXX. Spaces, dashes and brackets are ignored.
export const isValidGhanaPhone = (phone = '') => /^(\+233|233|0)\d{9}$/.test(String(phone).replace(/[\s\-()]/g, ''));

// Normalises any accepted Ghana number to international digits (233XXXXXXXXX),
// which is the form wa.me links require.
export function toIntlDigits(raw = '') {
  let digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('0')) digits = `233${digits.slice(1)}`;
  else if (!digits.startsWith('233') && digits.length === 9) digits = `233${digits}`;
  return digits;
}

// Builds a WhatsApp click-to-chat link with an optional prefilled message.
export function whatsappLink(number, message = '') {
  const intl = toIntlDigits(number);
  return `https://wa.me/${intl}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
export const statusClass = (status = '') => {
  const key = status.toLowerCase();
  if (['delivered', 'approved', 'active', 'paid', 'completed', 'resolved'].includes(key)) return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
  if (['processing', 'requested', 'reviewing', 'scheduled'].includes(key)) return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
  if (['shipped', 'refunded'].includes(key)) return 'bg-sky-400/10 text-sky-300 border-sky-400/20';
  if (['cancelled', 'declined', 'hidden', 'blocked', 'out-of-stock'].includes(key)) return 'bg-rose/10 text-rose-light border-rose/20';
  return 'bg-gold/10 text-gold border-gold/20';
};
export function downloadFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
export function toCSV(rows = []) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
}
export function normalizeProduct(product = {}) {
  return {
    ...product,
    price: safeNumber(product.price),
    wasPrice: safeNumber(product.wasPrice),
    stock: safeNumber(product.stock),
    rating: safeNumber(product.rating, 4.5),
    reviews: safeNumber(product.reviews),
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : String(product.images || '').split(',').map((x) => x.trim()).filter(Boolean),
    available: Boolean(product.available)
  };
}
