import { useCallback, useEffect, useState } from 'react';

// History-based router. Maps real URL paths to the app's { view, params }
// contract so every existing navigate(view, params) call keeps working, while
// URLs become real, shareable and indexable (e.g. /product/<id>, /shop).
const BASE = import.meta.env.BASE_URL || '/';

function stripBase(pathname) {
  if (BASE !== '/' && pathname.startsWith(BASE)) return `/${pathname.slice(BASE.length)}`;
  return pathname;
}

export function parseLocation() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  const segments = stripBase(window.location.pathname).split('/').filter(Boolean);
  if (segments.length === 0) return { view: 'home', params };
  if (segments[0] === 'admin') return { view: `admin.${segments[1] || 'dashboard'}`, params };
  if (segments[0] === 'product' && segments[1]) return { view: 'product', params: { ...params, product: decodeURIComponent(segments[1]) } };
  return { view: segments[0], params };
}

export function routeToPath(view, params = {}) {
  const rest = { ...params };
  let path;
  if (view === 'home') path = '/';
  else if (view.startsWith('admin.')) path = `/admin/${view.slice('admin.'.length)}`;
  else if (view === 'product') { path = `/product/${encodeURIComponent(rest.product || '')}`; delete rest.product; }
  else path = `/${view}`;
  const withBase = BASE !== '/' ? `${BASE.replace(/\/$/, '')}${path}` : path;
  const query = new URLSearchParams(
    Object.entries(rest).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString();
  return `${withBase}${query ? `?${query}` : ''}`;
}

export function useRouter() {
  const [route, setRoute] = useState(parseLocation);

  useEffect(() => {
    const onPop = () => setRoute(parseLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((view, params = {}) => {
    const url = routeToPath(view, params);
    window.history.pushState({}, '', url);
    setRoute(parseLocation());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}
