/* Cart -> Checkout link. Standalone adapter leaves teammate cart-page.js intact. */
(() => {
  'use strict';
  document.addEventListener('click', event => {
    const button = event.target.closest?.('#cart-checkout');
    if (!button || button.disabled) return;
    if (typeof window.getCart === 'function' && window.getCart().length === 0) return;
    // The project's legacy cart-page.js still shows a placeholder toast.
    // Intercept only this single button while retaining its other cart behavior.
    event.preventDefault();
    event.stopImmediatePropagation();
    const p = new URLSearchParams(location.search);
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    const to = new URL('checkout.html', location.href);
    if (local && p.get('demo') === '1') {
      to.searchParams.set('demo','1');
      if (p.get('sample') === '1')to.searchParams.set('sample','1');
    }
    location.assign(to.href);
  }, true);
})();
