import { useMemo, useState } from 'react';
import { Badge, Button, Card, Field, SelectField, StatCard } from '../../components/Common';
import { useStore } from '../../context/StoreContext';
import { downloadFile, safeNumber, todayISO, uid } from '../../utils/helpers';
import { Action, AdminShell, ConfirmButton, SectionTitle, Toolbar } from './_AdminShared.jsx';

function campaignStatus(campaign) {
  const today = todayISO();
  if (!campaign.active) return 'hidden';
  if (campaign.startDate && campaign.startDate > today) return 'scheduled';
  if (campaign.endDate && campaign.endDate < today) return 'expired';
  return 'active';
}

export function MarketingPage({ view, navigate }) {
  const { campaigns, setCampaigns, upsertCampaign, deleteCampaign: removeCampaign, settings, setSettings, products, categories } = useStore();
  const blank = { title: '', description: '', placement: 'homepage', ctaLabel: 'Shop Now', ctaRoute: 'shop', image: '', productId: '', categorySlug: '', active: true, startDate: todayISO(), endDate: '', priority: 1 };
  const [draft, setDraft] = useState(blank);
  const [status, setStatus] = useState('all');
  const [announcement, setAnnouncement] = useState(settings.announcement || settings.announcementText || '');
  const [announcementActive, setAnnouncementActive] = useState(settings.announcementActive !== false);

  const list = useMemo(() => campaigns
    .filter((campaign) => status === 'all' || campaignStatus(campaign) === status)
    .sort((a, b) => safeNumber(a.priority) - safeNumber(b.priority)), [campaigns, status]);

  function saveCampaign(e) {
    e.preventDefault();
    if (!draft.title) return alert('Campaign title is required.');
    const campaign = { ...draft, id: draft.id || uid('camp'), createdAt: draft.createdAt || new Date().toISOString() };
    upsertCampaign(campaign);
    setDraft(blank);
  }

  function deleteCampaign(id) {
    removeCampaign(id);
  }

  function toggleCampaign(campaign) {
    upsertCampaign({ ...campaign, active: !campaign.active });
  }

  function saveAnnouncement() {
    setSettings({ ...settings, announcement: announcement, announcementText: announcement, announcementActive });
    alert('Announcement settings saved.');
  }

  return (
    <AdminShell view={view} navigate={navigate} title="Marketing Manager">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Campaigns" value={campaigns.length} />
        <StatCard label="Active" value={campaigns.filter((c) => campaignStatus(c) === 'active').length} />
        <StatCard label="Scheduled" value={campaigns.filter((c) => campaignStatus(c) === 'scheduled').length} />
        <StatCard label="Placements" value={new Set(campaigns.map((c) => c.placement)).size || 0} />
      </div>

      <Toolbar>
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="scheduled">Scheduled</option><option value="expired">Expired</option><option value="hidden">Hidden</option></SelectField>
        <Button variant="outline" onClick={() => downloadFile('glowoutgh-marketing-campaigns.json', JSON.stringify(campaigns, null, 2))}>Export Campaigns</Button>
      </Toolbar>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle title="Announcement Bar">Control the storewide top message from one place.</SectionTitle>
            <Field label="Announcement Message" as="textarea" rows="3" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
            <label className="mt-3 flex gap-2 text-sm text-[#C8BAD0]"><input type="checkbox" checked={announcementActive} onChange={(e) => setAnnouncementActive(e.target.checked)} /> Show announcement bar</label>
            <Button className="mt-4" onClick={saveAnnouncement}>Save Announcement</Button>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-2xl font-bold">{draft.id ? 'Edit' : 'Create'} Campaign</h2>
            <form onSubmit={saveCampaign} className="mt-5 space-y-4">
              <Field label="Campaign Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <Field label="Description" as="textarea" rows="3" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3"><SelectField label="Placement" value={draft.placement} onChange={(e) => setDraft({ ...draft, placement: e.target.value })}><option value="homepage">Homepage</option><option value="shop">Shop</option><option value="category">Category</option><option value="checkout">Checkout</option><option value="account">Account</option></SelectField><Field label="Priority" type="number" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: safeNumber(e.target.value) })} /></div>
              <div className="grid grid-cols-2 gap-3"><Field label="Start Date" type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /><Field label="End Date" type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} /></div>
              <Field label="Image URL" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
              <div className="grid grid-cols-2 gap-3"><SelectField label="Linked Product" value={draft.productId} onChange={(e) => setDraft({ ...draft, productId: e.target.value })}><option value="">None</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</SelectField><SelectField label="Linked Category" value={draft.categorySlug} onChange={(e) => setDraft({ ...draft, categorySlug: e.target.value })}><option value="">None</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</SelectField></div>
              <div className="grid grid-cols-2 gap-3"><Field label="CTA Label" value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} /><Field label="CTA Route" value={draft.ctaRoute} onChange={(e) => setDraft({ ...draft, ctaRoute: e.target.value })} /></div>
              <label className="flex gap-2 text-sm text-[#C8BAD0]"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active</label>
              <div className="flex gap-2"><Button type="submit">Save Campaign</Button><Button type="button" variant="ghost" onClick={() => setDraft(blank)}>Clear</Button></div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle title="Live Campaign Preview">How cards will feel on the storefront.</SectionTitle>
            <div className="grid gap-4 md:grid-cols-2">{list.slice(0, 4).map((campaign) => <div key={campaign.id} className="overflow-hidden rounded-2xl border border-gold/15 bg-surface-2"><div className="h-36 product-image" style={{ backgroundImage: campaign.image ? `url(${campaign.image})` : undefined }} /><div className="p-4"><Badge status={campaignStatus(campaign)}>{campaignStatus(campaign)}</Badge><h3 className="mt-3 font-display text-xl font-bold text-white">{campaign.title}</h3><p className="mt-2 text-sm text-[#8A7A98]">{campaign.description}</p><button className="mt-4 rounded-full bg-gold px-4 py-2 text-xs font-bold text-ink">{campaign.ctaLabel || 'Shop Now'}</button></div></div>)}</div>
          </Card>

          <Card className="overflow-x-auto p-0">
            <table className="admin-table"><thead><tr><th>Campaign</th><th>Placement</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead><tbody>{list.map((campaign) => <tr key={campaign.id}><td><p className="font-bold text-white">{campaign.title}</p><p className="text-xs text-[#8A7A98]">{campaign.description}</p></td><td>{campaign.placement}</td><td>{campaign.startDate || 'Now'} → {campaign.endDate || 'No end'}</td><td><Badge status={campaignStatus(campaign)}>{campaignStatus(campaign)}</Badge></td><td><div className="flex flex-wrap gap-2"><Action onClick={() => setDraft(campaign)}>Edit</Action><Action onClick={() => toggleCampaign(campaign)}>{campaign.active ? 'Hide' : 'Activate'}</Action><Action onClick={() => upsertCampaign({ ...campaign, id: '', title: `${campaign.title} Copy`, createdAt: new Date().toISOString() })}>Duplicate</Action><ConfirmButton message="Delete campaign?" onConfirm={() => deleteCampaign(campaign.id)}>Delete</ConfirmButton></div></td></tr>)}</tbody></table>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
