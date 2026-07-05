import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { whatsappLink } from '../utils/helpers';

// Site-wide floating WhatsApp chat button. Sits above the mobile quick-nav on
// small screens and in the bottom corner on desktop.
export function FloatingWhatsApp() {
  const { settings } = useStore();
  if (!settings.whatsapp) return null;
  const href = whatsappLink(settings.whatsapp, `Hi ${settings.storeName || 'GlowOut gh'}, I'd like to ask about a product.`);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-bold text-white shadow-xl transition hover:scale-105 lg:bottom-6 lg:right-6"
    >
      <MessageCircle size={22} strokeWidth={2.4} />
      <span className="hidden sm:inline">Chat</span>
    </a>
  );
}

// Inline "Order via WhatsApp" button, prefilled with the product details.
export function WhatsAppOrderButton({ product, className = '' }) {
  const { settings } = useStore();
  if (!settings.whatsapp) return null;
  const price = product ? `${settings.currency}${Number(product.price || 0).toLocaleString()}` : '';
  const link = typeof window !== 'undefined' ? window.location.href : '';
  const message = product
    ? `Hi ${settings.storeName || 'GlowOut gh'}, I'd like to order:\n${product.name}${price ? ` — ${price}` : ''}\n${link}`
    : `Hi ${settings.storeName || 'GlowOut gh'}, I'd like to place an order.`;
  return (
    <a
      href={whatsappLink(settings.whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn inline-flex items-center justify-center gap-2 bg-[#25D366] text-white hover:brightness-110 ${className}`}
    >
      <MessageCircle size={18} strokeWidth={2.4} />
      Order via WhatsApp
    </a>
  );
}
