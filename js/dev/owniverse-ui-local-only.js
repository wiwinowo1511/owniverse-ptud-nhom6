/* OWNIVERSE LOCAL UI PREVIEW ONLY.
 * No real login and no database operations. Never deploy this file on production.
 * Active on localhost/127.0.0.1 only. Embedded Admin modules require ?embed=1&demo=1.
 * Checkout/cart preview requires ?demo=1 (and optionally &sample=1).
 */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const embedded = window !== window.top && params.get('embed') === '1';
  if (embedded) document.documentElement.classList.add('ow-embedded');
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!local) return;
  const page = location.pathname.split('/').pop().toLowerCase();
  const adminOuter = page === 'admin.html';
  const adminInner = embedded && params.get('demo') === '1' &&
    ['admin-dashboard.html', 'admin-products.html', 'admin-categories.html', 'admin-product-form.html'].includes(page);
  const customerPreview = params.get('demo') === '1' &&
    ['cart.html', 'checkout.html', 'order-confirmation.html'].includes(page);
  if (!(adminOuter || adminInner || customerPreview)) return;

  const admin = { id: 'local-admin', fullName: 'Admin OWNIVERSE', role: 'admin' };
  const customer = { id: 'local-checkout', fullName: 'Khách hàng', role: 'customer', phone: '', email: '' };
  const user = customerPreview ? customer : admin;

  // Admin legacy start() checks presence of a token before rendering any content.
  // A temporary placeholder is used only in the local Admin shell, not for server auth.
  const temporaryToken = 'OWNIVERSE-LOCAL-UI-PREVIEW-NOT-A-REAL-TOKEN';
  if (adminOuter && !localStorage.getItem('owniverse_token')) {
    localStorage.setItem('owniverse_token', temporaryToken);
    addEventListener('pagehide', () => {
      if (localStorage.getItem('owniverse_token') === temporaryToken)
        localStorage.removeItem('owniverse_token');
    }, { once: true });
  }
  window.isLoggedIn = () => true;
  window.getCurrentUser = () => user;
  window.refreshCurrentUser = async () => user;

  if (adminOuter || adminInner) {
    // The teammate's existing views may fetch lists; provide empty arrays so their
    // UI can render. Mutating API requests are NEVER simulated as successful.
    window.apiRequest = async (path, options = {}) => {
      const method = String(options.method || 'GET').toUpperCase();
      if (method !== 'GET') throw new Error('Chưa kết nối máy chủ để lưu thay đổi.');
      const url = String(path || '');
      if (/^\/api\/(?:admin\/(?:artists|users|orders|promotions)|artists|products|categories)(?:\/|\?|$)/i.test(url)) return [];
      throw new Error('Dữ liệu này chưa có sẵn khi xem thử giao diện.');
    };
  }

  // A sample item is optional and IN MEMORY ONLY. It does not alter localStorage,
  // a real cart, or any database; existing cart items always take priority.
  if (customerPreview && params.get('sample') === '1' &&
      ['cart.html', 'checkout.html'].includes(page)) {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof window.getCart !== 'function') return;
      const realGetCart = window.getCart;
      const realSaveCart = window.saveCart;
      let allowSample = true;
      // Once the visitor changes the sample, use the edited cart as the source
      // of truth, including an intentionally emptied cart.
      if (typeof realSaveCart === 'function') {
        window.saveCart = function (...args) {
          allowSample = false;
          return realSaveCart.apply(this, args);
        };
      }
      window.getCart = function () {
        const existing = realGetCart();
        return existing && existing.length ? existing :
          (allowSample ? [{ id: 1, quantity: 1 }] : []);
      };
    }, { once: true });
  }
})();
