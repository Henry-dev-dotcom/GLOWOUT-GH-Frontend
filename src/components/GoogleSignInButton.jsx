import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let scriptPromise = null;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }
    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Renders the official Google Sign-In button. On success it calls
 * onCredential(credential) with the Google ID token (JWT), which the caller
 * sends to the backend /auth/google endpoint for verification.
 *
 * If VITE_GOOGLE_CLIENT_ID is not set, the component renders nothing so the
 * rest of the login page still works.
 */
export function GoogleSignInButton({ onCredential, onError }) {
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response?.credential) onCredential?.(response.credential);
            else onError?.('Google sign-in did not return a credential.');
          }
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'pill'
        });
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          onError?.('Could not load Google sign-in. Check your connection and try again.');
        }
      });

    return () => { cancelled = true; };
  }, [onCredential, onError]);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-[rgba(201,169,110,.18)]" />
        <span className="text-xs uppercase tracking-wider text-[#8A7A98]">or</span>
        <span className="h-px flex-1 bg-[rgba(201,169,110,.18)]" />
      </div>
      <div className="flex justify-center" ref={containerRef} />
      {failed && <p className="mt-3 text-center text-sm text-rose-light">Google sign-in is unavailable right now.</p>}
    </div>
  );
}
