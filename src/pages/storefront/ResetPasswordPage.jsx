import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, Card, Field, PageHero } from '../../components/Common';

export function ResetPasswordPage({ navigate, params = {} }) {
  const { resetPassword } = useStore();
  const token = params.token || '';
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    setMessage({ type: '', text: 'Updating password...' });
    const result = await resetPassword(token, form.newPassword);
    if (!result.ok) return setMessage({ type: 'error', text: result.message });
    setDone(true);
    setMessage({ type: 'success', text: result.message });
  }

  const noticeClass = message.type === 'success'
    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    : 'border-rose/20 bg-rose/10 text-rose-light';

  return (
    <>
      <PageHero eyebrow="Account Access" title="Choose a new password">Set a new password for your GLOWOUT GH account.</PageHero>
      <section className="pb-16">
        <div className="container-lux flex justify-center">
          <Card className="w-full max-w-md p-7">
            {!token ? (
              <div>
                <h3 className="font-display text-2xl font-bold">Invalid reset link</h3>
                <p className="mt-2 text-sm leading-6 text-[#8A7A98]">This link is missing its reset token. Please request a new password reset from the login page.</p>
                <Button className="mt-6 w-full" onClick={() => navigate('forgot-password')}>Request a new link</Button>
              </div>
            ) : done ? (
              <div>
                <h3 className="font-display text-2xl font-bold">Password updated</h3>
                <p className="mt-2 text-sm leading-6 text-[#8A7A98]">You can now sign in with your new password.</p>
                <Button className="mt-6 w-full" onClick={() => navigate('login')}>Go to login</Button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3 className="font-display text-3xl font-bold">Reset password</h3>
                <p className="mt-2 text-sm leading-6 text-[#8A7A98]">Enter and confirm your new password below.</p>
                <div className="mt-6 space-y-4">
                  <Field label="New Password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
                  <Field label="Confirm New Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                </div>
                {message.text && <p className={`mt-4 rounded-xl border p-3 text-sm ${noticeClass}`}>{message.text}</p>}
                <Button className="mt-6 w-full" type="submit">Update Password</Button>
                <button type="button" onClick={() => navigate('login')} className="mt-4 block w-full text-center text-sm text-gold">Back to login</button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
