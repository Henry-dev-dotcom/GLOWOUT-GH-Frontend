import { useState } from 'react';
import { Badge, Button, Card, Field, SelectField, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { downloadFile, uid } from '../../utils/helpers';
import { Action, AdminShell, ConfirmButton, PermissionMatrix, SectionTitle, Toolbar } from './_AdminShared.jsx';

const roles = ['Owner', 'Admin', 'Product Manager', 'Order Manager', 'Marketing Manager', 'Finance Manager', 'Support'];
const permissions = [
  { key: 'products.manage', label: 'Manage products', desc: 'Create, edit, duplicate and delete products.' },
  { key: 'orders.manage', label: 'Manage orders', desc: 'View order details and update fulfilment.' },
  { key: 'coupons.manage', label: 'Manage coupons', desc: 'Create and control coupon rules.' },
  { key: 'returns.manage', label: 'Manage returns', desc: 'Approve, decline, refund and restock returns.' },
  { key: 'customers.manage', label: 'Manage customers', desc: 'View customer profiles, VIPs and notes.' },
  { key: 'finance.view', label: 'View finance', desc: 'Access sales, tax and refund reports.' },
  { key: 'settings.manage', label: 'Manage settings', desc: 'Update store profile, fees and policy settings.' },
  { key: 'team.manage', label: 'Manage team', desc: 'Invite, edit and remove admin users.' }
];

const defaultPermissions = {
  Owner: permissions.map((p) => p.key),
  Admin: permissions.map((p) => p.key).filter((key) => key !== 'team.manage'),
  'Product Manager': ['products.manage'],
  'Order Manager': ['orders.manage', 'returns.manage', 'customers.manage'],
  'Marketing Manager': ['coupons.manage', 'customers.manage'],
  'Finance Manager': ['finance.view', 'orders.manage'],
  Support: ['orders.manage', 'returns.manage', 'customers.manage']
};

export function TeamPage({ view, navigate }) {
  const { team, upsertTeamUser, deleteTeamUser } = useStore();
  const [draft, setDraft] = useState({ name: '', email: '', role: 'Support', active: true });
  const [permissionsByRole, setPermissionsByRole] = useState(() => {
    try { return JSON.parse(localStorage.getItem('glowoutgh_react_permissions')) || defaultPermissions; } catch { return defaultPermissions; }
  });

  function savePermissions(next) {
    setPermissionsByRole(next);
    try { localStorage.setItem('glowoutgh_react_permissions', JSON.stringify(next)); } catch {}
  }

  function updatePermission(role, permission, checked) {
    const current = permissionsByRole[role] || [];
    const next = { ...permissionsByRole, [role]: checked ? [...new Set([...current, permission])] : current.filter((item) => item !== permission) };
    savePermissions(next);
  }

  function saveUser(e) {
    e.preventDefault();
    if (!draft.name || !draft.email) return alert('Name and email are required.');
    upsertTeamUser({ ...draft, id: draft.id || uid('user'), active: draft.active !== false, permissions: permissionsByRole[draft.role] || [] });
    setDraft({ name: '', email: '', role: 'Support', active: true });
  }

  return (
    <AdminShell view={view} navigate={navigate} title="Team & Access">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Team Users" value={team.length} />
        <StatCard label="Active" value={team.filter((user) => user.active !== false).length} />
        <StatCard label="Owners" value={team.filter((user) => user.role === 'Owner').length} />
        <StatCard label="Roles" value={new Set(team.map((user) => user.role)).size} />
      </div>

      <Toolbar>
        <Button variant="outline" onClick={() => downloadFile('glowoutgh-team.json', JSON.stringify({ team, permissionsByRole }, null, 2))}>Export Team Setup</Button>
        <Button variant="ghost" onClick={() => savePermissions(defaultPermissions)}>Reset Permissions</Button>
      </Toolbar>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="p-5">
          <h2 className="font-display text-2xl font-bold">{draft.id ? 'Edit Team Member' : 'Add Team Member'}</h2>
          <form onSubmit={saveUser} className="mt-5 space-y-4">
            <Field label="Full Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Field label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <SelectField label="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</SelectField>
            <label className="flex gap-2 text-sm text-[#C8BAD0]"><input type="checkbox" checked={draft.active !== false} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active account</label>
            <div className="rounded-2xl bg-surface-2 p-4 text-sm text-[#8A7A98]">New users use the current demo password <b className="text-gold">glowoutgh123</b> until backend auth/invitation emails are connected.</div>
            <div className="flex gap-2"><Button type="submit">Save User</Button><Button type="button" variant="ghost" onClick={() => setDraft({ name: '', email: '', role: 'Support', active: true })}>Clear</Button></div>
          </form>
        </Card>

        <Card className="overflow-x-auto p-0">
          <table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Permissions</th><th>Actions</th></tr></thead><tbody>{team.map((user) => <tr key={user.id}><td><p className="font-bold text-white">{user.name}</p><p className="text-xs text-[#8A7A98]">{user.email}</p></td><td>{user.role}</td><td><Badge status={user.active !== false ? 'active' : 'hidden'}>{user.active !== false ? 'Active' : 'Disabled'}</Badge></td><td>{(permissionsByRole[user.role] || []).length} permissions</td><td><div className="flex flex-wrap gap-2"><Action onClick={() => setDraft(user)}>Edit</Action><Action onClick={() => upsertTeamUser({ ...user, active: user.active === false })}>{user.active === false ? 'Enable' : 'Disable'}</Action><ConfirmButton message="Remove this team user?" onConfirm={() => deleteTeamUser(user.id)} disabled={user.role === 'Owner'}>Remove</ConfirmButton></div></td></tr>)}</tbody></table>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <SectionTitle title="Permission Matrix">Use this as the frontend role model until backend RBAC is connected.</SectionTitle>
        <PermissionMatrix roles={roles} permissions={permissions} value={permissionsByRole} onChange={updatePermission} />
      </Card>
    </AdminShell>
  );
}
