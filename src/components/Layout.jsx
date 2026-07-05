import { useEffect, useState } from 'react';
import { Heart, Home, Menu, ShoppingCart, Sparkles, User, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from './Common';
import { FloatingWhatsApp } from './WhatsAppButton';

const navItems = [
  ['home', 'Home'], ['shop', 'Shop'], ['categories', 'Categories'], ['about', 'About'], ['blog', 'Blog'], ['contact', 'Contact']
];

function MobileQuickNav({ view, navigate, currentUser, cartCount, wishlistCount }) {
  const items = [
    ['home', 'Home', Home],
    ['shop', 'Shop', Sparkles],
    ['wishlist', 'Saved', Heart, wishlistCount],
    ['cart', 'Cart', ShoppingCart, cartCount],
    [currentUser ? 'account' : 'login', currentUser ? 'Me' : 'Login', User]
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(201,169,110,.12)] bg-ink/95 px-2 py-2 backdrop-blur-2xl lg:hidden" aria-label="Mobile quick navigation">
      <div className="grid grid-cols-5 gap-1">
        {items.map(([id, label, Icon, count]) => (
          <button key={id} onClick={() => navigate(id)} className={`relative rounded-2xl px-2 py-2 text-center text-[11px] font-bold ${view === id ? 'bg-gold text-ink' : 'text-[#C8BAD0] hover:bg-surface-2 hover:text-gold'}`}>
            <Icon size={18} className="mx-auto" />
            <span className="mt-1 block truncate">{label}</span>
            {Number(count) > 0 && <span className="absolute right-2 top-1 rounded-full bg-rose px-1.5 text-[9px] text-white">{count}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function Header({ view, navigate }) {
  const { settings, cartItems, wishlist, products, currentUser } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => { setOpen(false); }, [view]);
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  function submitSearch(e) {
    e.preventDefault();
    if (!query.trim()) return navigate('shop');
    navigate('shop', { q: query.trim() });
  }
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:font-bold focus:text-ink">Skip to content</a>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(201,169,110,.12)] bg-ink/85 backdrop-blur-2xl">
        <div className="container-lux flex h-20 items-center gap-5">
          <button onClick={() => navigate('home')} className="shrink-0 font-display text-2xl font-black tracking-wide" aria-label="Go to GlowOut gh home">Glow<span className="italic text-gold">Out</span> gh</button>
          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[.12em] transition ${view === id ? 'text-gold' : 'text-[#C8BAD0] hover:text-gold'}`} aria-current={view === id ? 'page' : undefined}>{label}</button>)}
          </nav>
          <form onSubmit={submitSearch} className="hidden max-w-xs flex-1 md:block" role="search">
            <label className="sr-only" htmlFor="site-search">Search products</label>
            <input id="site-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${products.length} products...`} className="field py-2" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => navigate('wishlist')} className="relative rounded-xl px-3 py-2 text-[#C8BAD0] hover:bg-surface-2 hover:text-gold" aria-label={`Wishlist with ${wishlist.length} items`}><Heart size={20} /><span className="absolute -right-1 -top-1 rounded-full bg-rose px-1.5 text-[10px] font-bold text-white">{wishlist.length}</span></button>
            <button onClick={() => navigate('cart')} className="relative rounded-xl px-3 py-2 text-[#C8BAD0] hover:bg-surface-2 hover:text-gold" aria-label={`Cart with ${cartItems.length} items`}><ShoppingCart size={20} /><span className="absolute -right-1 -top-1 rounded-full bg-rose px-1.5 text-[10px] font-bold text-white">{cartItems.length}</span></button>
            <Button variant="ghost" onClick={() => navigate(currentUser ? 'account' : 'login')} className="hidden sm:inline-flex">{currentUser ? 'Account' : 'Login'}</Button>
            {currentUser?.type === 'admin' && <Button variant="outline" onClick={() => navigate('admin.dashboard')} className="hidden sm:inline-flex">Admin</Button>}
            <button className="rounded-xl border border-[rgba(201,169,110,.12)] px-3 py-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open mobile menu" aria-expanded={open}><Menu size={20} /></button>
          </div>
        </div>
      </div>
      {settings.announcementActive !== false && settings.announcement && <div className="fixed inset-x-0 top-20 z-40 bg-gold px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-ink">{settings.announcement}</div>}
      {open && <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} role="presentation"><div className="ml-auto flex h-full w-[85vw] max-w-sm flex-col bg-surface-1 p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Mobile menu"><div className="mb-6 flex items-center justify-between"><span className="font-display text-2xl font-bold">Glow<span className="text-gold">Out</span> gh</span><button onClick={() => setOpen(false)} className="rounded-xl border border-gold/20 px-3 py-2" aria-label="Close menu"><X size={18} /></button></div><form onSubmit={submitSearch} className="mb-5" role="search"><label className="sr-only" htmlFor="mobile-search">Search products</label><input id="mobile-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="field" /></form><div className="min-h-0 flex-1 overflow-y-auto">{[...navItems, ['wishlist','Wishlist'], ['cart','Cart'], [currentUser ? 'account' : 'login', currentUser ? 'Account' : 'Login'], ...(currentUser?.type === 'admin' ? [['admin.dashboard','Admin']] : [])].map(([id,label]) => <button key={id} onClick={() => navigate(id)} className="block w-full border-b border-[rgba(201,169,110,.12)] py-4 text-left font-semibold text-[#C8BAD0] hover:text-gold">{label}</button>)}</div></div></div>}
      <MobileQuickNav view={view} navigate={navigate} currentUser={currentUser} cartCount={cartItems.length} wishlistCount={wishlist.length} />
    </>
  );
}

export function Footer({ navigate }) {
  const { settings } = useStore();
  return (
    <footer className="border-t border-[rgba(201,169,110,.12)] bg-surface-1 py-12 pb-28 lg:pb-12">
      <div className="container-lux grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div><h2 className="font-display text-3xl font-bold">Glow<span className="italic text-gold">Out</span> gh</h2><p className="mt-4 max-w-sm leading-7 text-[#8A7A98]">Premium beauty shopping for authentic perfumes, skincare and wigs with a refined digital experience.</p></div>
        <div><h3 className="mb-4 font-bold text-white">Shop</h3>{['Perfumes','Skincare','Wigs','Bodycare'].map((x) => <button key={x} onClick={() => navigate('shop', { category: x.toLowerCase() })} className="block py-1 text-[#8A7A98] hover:text-gold">{x}</button>)}</div>
        <div><h3 className="mb-4 font-bold text-white">Support</h3>{[['faq','FAQ'],['returns','Returns'],['tracking','Track Order'],['contact','Contact'],['terms','Terms of Service'],['privacy','Privacy Policy']].map(([id,label]) => <button key={id} onClick={() => navigate(id)} className="block py-1 text-[#8A7A98] hover:text-gold">{label}</button>)}</div>
        <div><h3 className="mb-4 font-bold text-white">Contact</h3><p className="text-[#8A7A98]">{settings.email}</p><p className="text-[#8A7A98]">{settings.phone}</p><p className="text-[#8A7A98]">{settings.address}</p></div>
      </div>
      <div className="container-lux mt-10 border-t border-[rgba(201,169,110,.12)] pt-6 text-sm text-[#564869]">© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</div>
    </footer>
  );
}

export function StoreLayout({ view, navigate, children }) {
  return <div className="page-wrap"><Header view={view} navigate={navigate} /><main id="main" className="min-h-screen pt-24 pb-16 lg:pb-0" tabIndex="-1">{children}</main><Footer navigate={navigate} /><FloatingWhatsApp /></div>;
}
