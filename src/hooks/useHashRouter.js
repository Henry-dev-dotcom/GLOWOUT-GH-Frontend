import { useEffect, useState } from 'react';

export function parseHash() {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return { view: 'home', params: {} };
  const [view, query = ''] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(query));
  return { view: view || 'home', params };
}

export function makeHash(view, params = {}) {
  const query = new URLSearchParams(params).toString();
  return `#${view}${query ? `?${query}` : ''}`;
}

export function useHashRouter() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function navigate(view, params = {}) {
    window.location.hash = makeHash(view, params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return { route, navigate };
}
