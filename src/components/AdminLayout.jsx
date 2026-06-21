import { Button } from './Common';
import { useStore } from '../context/StoreContext';

const adminNav = [
  ['admin.dashboard', 'Overview', '🏠'],
  ['admin.products', 'Product Manager', '🧴'],
  ['admin.categories', 'Categories', '🗂️'],
  ['admin.orders', 'Orders', '📦'],
  ['admin.coupons', 'Coupons', '🎟️'],
  ['admin.returns', 'Returns', '↩️'],
  ['admin.customers', 'Customers', '👥'],
  ['admin.analytics', 'Analytics', '📊'],
  ['admin.marketing', 'Marketing', '📣'],
  ['admin.finance', 'Finance Reports', '💰'],
  ['admin.settings', 'Store Settings', '⚙️'],
  ['admin.team', 'Team & Access', '🔐']
];

export function AdminLayout({ view, navigate, title, children }) {
  const { currentUser, logout } = useStore();
  const userLabel = currentUser?.name || 'Admin User';
  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[rgba(201,169,110,.12)] bg-surface-1 p-5 lg:block">
        <button onClick={() => navigate('home')} className="mb-6 block font-display text-2xl font-bold">Glow<span className="italic text-gold">Haus</span></button>
        <div className="mb-4 rounded-2xl border border-gold/20 bg-gold/10 p-4 text-sm text-gold-light"><p className="font-bold">{userLabel}</p><p className="mt-1 text-xs opacity-80">{currentUser?.role || 'Admin access'} · Backend-ready dashboard</p></div>
        <nav className="space-y-1">
          {adminNav.map(([id, label, icon]) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${view === id ? 'bg-gold text-ink' : 'text-[#C8BAD0] hover:bg-surface-2 hover:text-gold'}`}><span>{icon}</span><span>{label}</span></button>)}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[rgba(201,169,110,.12)] bg-ink/90 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="section-eyebrow">Admin</p><h1 className="font-display text-3xl font-bold">{title}</h1></div>
            <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => navigate('home')}>View Store</Button><Button variant="ghost" onClick={() => navigate('admin.dashboard')}>Dashboard</Button>{currentUser && <Button variant="ghost" onClick={() => { logout(); navigate('login'); }}>Logout</Button>}</div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {adminNav.map(([id, label, icon]) => <button key={id} onClick={() => navigate(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${view === id ? 'bg-gold text-ink' : 'bg-surface-2 text-[#C8BAD0]'}`}>{icon} {label}</button>)}
          </div>
        </header>
        <main id="admin-main" className="p-4 pb-24 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
