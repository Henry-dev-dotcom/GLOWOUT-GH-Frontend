import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge, Button, Card, Field, PageHero } from '../../components/Common';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { isValidEmail, isValidGhanaPhone } from '../../utils/helpers';

export function LoginPage({ navigate, mode = 'login' }) {
  const { currentUser, login, loginWithGoogle, logout, registerCustomer, requestPasswordReset } = useStore();
  const [activeMode, setActiveMode] = useState(mode);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', city: '', password: '', confirmPassword: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const pageTitle = useMemo(() => activeMode === 'register' ? 'Create your GLOWOUT GH account' : activeMode === 'forgot' ? 'Reset account access' : 'Login to GLOWOUT GH', [activeMode]);

  async function submitLogin(e) {
    e.preventDefault();
    setMessage({ type: '', text: 'Checking account...' });
    const result = await login(loginForm.email, loginForm.password);
    if (!result.ok) return setMessage({ type: 'error', text: result.message });
    setMessage({ type: 'success', text: 'Login successful. Redirecting...' });
    navigate(result.user.type === 'admin' ? 'admin.dashboard' : 'account');
  }

  async function handleGoogleCredential(credential) {
    setMessage({ type: '', text: 'Verifying Google sign-in...' });
    const result = await loginWithGoogle(credential);
    if (!result.ok) return setMessage({ type: 'error', text: result.message });
    setMessage({ type: 'success', text: 'Login successful. Redirecting...' });
    navigate(result.user.type === 'admin' ? 'admin.dashboard' : 'account');
  }

  async function submitRegister(e) {
    e.preventDefault();
    if (!isValidEmail(registerForm.email)) return setMessage({ type: 'error', text: 'Please enter a valid email address.' });
    if (registerForm.phone && !isValidGhanaPhone(registerForm.phone)) return setMessage({ type: 'error', text: 'Please enter a valid Ghana phone number, e.g. 024 000 0000.' });
    if (registerForm.password.length < 8) return setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
    if (registerForm.password !== registerForm.confirmPassword) return setMessage({ type: 'error', text: 'Passwords do not match.' });
    setMessage({ type: '', text: 'Creating account...' });
    const result = await registerCustomer(registerForm);
    if (!result.ok) return setMessage({ type: 'error', text: result.message });
    setMessage({ type: 'success', text: 'Account created successfully. Redirecting to your account...' });
    navigate('account');
  }

  async function submitReset(e) {
    e.preventDefault();
    const result = await requestPasswordReset(resetEmail);
    setMessage({ type: result.ok ? 'success' : 'error', text: result.message });
  }

  const noticeClass = message.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-rose/20 bg-rose/10 text-rose-light';

  return (
    <>
      <PageHero eyebrow="Account Access" title={pageTitle}>Manage shopping, order history, saved addresses, returns and admin access from one account area.</PageHero>
      <section className="pb-16">
        <div className="container-lux grid gap-8 lg:grid-cols-[1fr_460px] lg:items-start">
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="font-display text-2xl font-bold text-gold">Your Account</h3>
                <p className="mt-3 leading-7 text-[#8A7A98]">Register to save delivery details, track orders, manage returns and keep favourite products in your wishlist.</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-display text-2xl font-bold text-gold">Shop with Confidence</h3>
                <p className="mt-3 leading-7 text-[#8A7A98]">Your details are kept secure, and your order history is always available from your account area.</p>
              </Card>
            </div>
          </div>

          <Card className="p-7">
            {currentUser ? (
              <div>
                <Badge>{currentUser.role}</Badge>
                <h3 className="mt-4 font-display text-3xl font-bold">You are logged in</h3>
                <p className="mt-2 text-[#8A7A98]">{currentUser.name} · {currentUser.email}</p>
                <div className="mt-6 grid gap-3">
                  <Button onClick={() => navigate(currentUser.type === 'admin' ? 'admin.dashboard' : 'account')}>Continue</Button>
                  <Button variant="ghost" onClick={logout}>Logout</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-1">
                  {[['login', 'Login'], ['register', 'Register'], ['forgot', 'Forgot']].map(([id, label]) => (
                    <button key={id} onClick={() => { setActiveMode(id); setMessage({ type: '', text: '' }); }} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${activeMode === id ? 'bg-gold text-ink' : 'text-[#C8BAD0] hover:text-gold'}`}>{label}</button>
                  ))}
                </div>

                {activeMode === 'login' && (
                  <form onSubmit={submitLogin}>
                    <h3 className="font-display text-3xl font-bold">Sign in</h3>
                    <p className="mt-2 text-sm leading-6 text-[#8A7A98]">Enter your customer or admin email and password.</p>
                    <div className="mt-6 space-y-4">
                      <Field label="Email Address" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
                      <Field label="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                    </div>
                    {message.text && <p className={`mt-4 rounded-xl border p-3 text-sm ${noticeClass}`}>{message.text}</p>}
                    <Button className="mt-6 w-full" type="submit">Login</Button>
                    <button type="button" onClick={() => setActiveMode('forgot')} className="mt-4 block w-full text-center text-sm text-gold">Forgot password?</button>
                    <GoogleSignInButton onCredential={handleGoogleCredential} onError={(text) => setMessage({ type: 'error', text })} />
                  </form>
                )}

                {activeMode === 'register' && (
                  <form onSubmit={submitRegister}>
                    <h3 className="font-display text-3xl font-bold">Create account</h3>
                    <p className="mt-2 text-sm leading-6 text-[#8A7A98]">Register as a customer. Admin users should be created from Team & Access.</p>
                    <div className="mt-6 space-y-4">
                      <Field label="Full Name" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required />
                      <Field label="Email Address" type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Phone" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                        <Field label="City" value={registerForm.city} onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required />
                        <Field label="Confirm Password" type="password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required />
                      </div>
                    </div>
                    {message.text && <p className={`mt-4 rounded-xl border p-3 text-sm ${noticeClass}`}>{message.text}</p>}
                    <Button className="mt-6 w-full" type="submit">Create Account</Button>
                  </form>
                )}

                {activeMode === 'forgot' && (
                  <form onSubmit={submitReset}>
                    <h3 className="font-display text-3xl font-bold">Forgot password</h3>
                    <p className="mt-2 text-sm leading-6 text-[#8A7A98]">Enter the email on your account and we will send you a password reset link.</p>
                    <div className="mt-6 space-y-4">
                      <Field label="Email Address" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                    </div>
                    {message.text && <p className={`mt-4 rounded-xl border p-3 text-sm ${noticeClass}`}>{message.text}</p>}
                    <Button className="mt-6 w-full" type="submit">Request Reset</Button>
                    <button type="button" onClick={() => setActiveMode('login')} className="mt-4 block w-full text-center text-sm text-gold">Back to login</button>
                  </form>
                )}
              </>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
