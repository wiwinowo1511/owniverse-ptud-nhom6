/**
 * OWNIVERSE Admin navigation compatibility helper.
 * Three completed sections: dashboard, products, categories.
 * Suppresses the old "coming soon" click handler for these three tabs only.
 * Does not change routing/handlers for Artists/Users/Orders/Promotions.
 * Does not change authentication or API behavior.
 */
(() => {
  'use strict';
  const owned = new Set(['dashboard', 'products', 'categories']);
  const labels = new Map([['tong quan','dashboard'], ['san pham','products'], ['danh muc','categories']]);
  const norm = value => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d')
    .toLowerCase().replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
  function routeOf(node) {
    if (!node) return null;
    const dv = (node.getAttribute('data-view') || '').trim().toLowerCase();
    if (owned.has(dv)) return dv;
    const href = node.getAttribute('href') || '';
    const match = href.match(/#(dashboard|products|categories)(?:$|[?&])/i);
    if (match) return match[1].toLowerCase();
    const name = norm(node.textContent || node.getAttribute('aria-label'));
    for (const [label, route] of labels) {
      if (name === label || name.endsWith(' ' + label)) return route;
    }
    return null;
  }
  function sidebar() { return document.querySelector('aside.sidebar, .sidebar'); }
  function cleanNav() {
    const root = sidebar();
    if (!root) return;
    root.querySelectorAll('a, button').forEach(node => {
      const route = routeOf(node);
      if (!route) return;
      node.removeAttribute('data-soon');
      node.setAttribute('data-view', route);
      if (node.matches('a')) node.setAttribute('href','#'+route);
    });
  }
  // Capture before the legacy document click handler handles [data-soon].
  document.addEventListener('click', event => {
    const node = event.target?.closest?.('a, button');
    const root = sidebar();
    if (!node || !root?.contains(node)) return;
    const route = routeOf(node);
    if (!route) return; // Team modules are unaffected.
    event.preventDefault();
    event.stopImmediatePropagation();
    node.removeAttribute('data-soon');
    const dest = '#'+route;
    if (location.hash !== dest) location.hash = dest;
    else window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cleanNav, {once:true});
  else cleanNav();
  window.addEventListener('hashchange', cleanNav);
})();
