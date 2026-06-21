import { AdminLayout } from '../../components/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { Button, Card } from '../../components/Common';
import { money, safeNumber } from '../../utils/helpers';

export function AdminShell({ view, navigate, title, children }) {
  const { apiStatus, syncWithBackend } = useStore();
  const lastSync = apiStatus.lastSync ? new Date(apiStatus.lastSync).toLocaleString() : 'Not synced yet';
  return <AdminLayout view={view} navigate={navigate} title={title}>
    <div className={`mb-4 grid gap-3 rounded-2xl border p-4 text-sm md:grid-cols-[1fr_auto] md:items-center ${apiStatus.connected ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-300/20 bg-amber-300/10 text-amber-100'}`} role="status" aria-live="polite">
      <div>
        <p><strong>Backend:</strong> {apiStatus.connected ? 'Connected' : 'Local fallback'} · {apiStatus.message}</p>
        <p className="mt-1 text-xs opacity-80">Last sync: {lastSync}{apiStatus.lastError ? ` · ${apiStatus.lastError}` : ''}</p>
      </div>
      <button onClick={syncWithBackend} className="rounded-xl border border-current px-4 py-2 font-bold disabled:opacity-50" disabled={apiStatus.loading}>{apiStatus.loading ? 'Syncing...' : 'Sync now'}</button>
    </div>
    {children}
  </AdminLayout>;
}

export function Toolbar({ children }) {
  return <Card className="mb-6 flex flex-wrap items-end gap-4 p-4">{children}</Card>;
}

export function MiniInput(props) {
  return <input className="field py-2" {...props} />;
}

export function Action({ children, ...props }) {
  return <button className="rounded-lg border border-[rgba(201,169,110,.18)] px-3 py-1.5 text-xs font-bold text-[#C8BAD0] hover:border-gold/50 hover:text-gold disabled:opacity-40" {...props}>{children}</button>;
}

export function Modal({ title, children, onClose, footer, wide = false }) {
  if (!title && !children) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-gold/20 bg-surface-1 shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(201,169,110,.12)] bg-surface-1/95 p-5 backdrop-blur">
          <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="rounded-xl border border-gold/20 px-3 py-2 text-sm text-[#C8BAD0] hover:text-gold">Close</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="border-t border-[rgba(201,169,110,.12)] p-5">{footer}</div>}
      </div>
    </div>
  );
}

export function DetailGrid({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-4">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#8A7A98]">{label}</p>
          <p className="mt-1 text-sm font-semibold text-white">{value || '—'}</p>
        </div>
      ))}
    </div>
  );
}

export function Timeline({ steps = [], current }) {
  const currentIndex = Math.max(0, steps.findIndex((step) => step.key === current));
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <div key={step.key} className="flex gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${done ? 'border-gold bg-gold text-ink' : 'border-gold/20 bg-surface-3 text-[#8A7A98]'}`}>{index + 1}</div>
            <div>
              <p className="font-bold text-white">{step.label}</p>
              <p className="text-sm text-[#8A7A98]">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BarList({ items = [], currency = '', maxValue }) {
  const max = maxValue || Math.max(1, ...items.map((item) => safeNumber(item.value)));
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const width = Math.max(4, Math.round((safeNumber(item.value) / max) * 100));
        return (
          <div key={item.label}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="font-semibold text-white">{item.label}</span>
              <span className="text-gold">{currency ? money(item.value, currency) : item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-gold" style={{ width: `${width}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export function PermissionMatrix({ roles = [], permissions = [], value = {}, onChange }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[rgba(201,169,110,.12)]">
      <table className="admin-table">
        <thead><tr><th>Permission</th>{roles.map((role) => <th key={role}>{role}</th>)}</tr></thead>
        <tbody>
          {permissions.map((permission) => <tr key={permission.key}><td><p className="font-bold text-white">{permission.label}</p><p className="text-xs text-[#8A7A98]">{permission.desc}</p></td>{roles.map((role) => {
            const checked = value?.[role]?.includes(permission.key) || role === 'Owner';
            return <td key={role}><input type="checkbox" disabled={role === 'Owner'} checked={checked} onChange={(e) => onChange?.(role, permission.key, e.target.checked)} /></td>;
          })}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export function SectionTitle({ title, children, action }) {
  return <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-bold text-white">{title}</h2>{children && <p className="mt-1 text-sm text-[#8A7A98]">{children}</p>}</div>{action}</div>;
}

export function ConfirmButton({ children, message = 'Are you sure?', onConfirm, ...props }) {
  return <Action {...props} onClick={() => window.confirm(message) && onConfirm?.()}>{children}</Action>;
}
