/* ==========================================================
   OWNIVERSE - CSS dùng chung cho giỏ hàng.
   Nạp ở products.html, product-detail.html, cart.html.
   ========================================================== */
(function () {
  if (document.getElementById('cart-common-styles')) return;

  const style = document.createElement('style');
  style.id = 'cart-common-styles';
  style.textContent = `
    /* ---------- Toast "Đã thêm vào giỏ hàng" ---------- */
    .cart-toast {
      position: fixed;
      left: 50%;
      bottom: max(24px, env(safe-area-inset-bottom));
      z-index: 1000;
      width: max-content;
      max-width: min(92vw, 420px);
      padding: 12px 20px;
      border-radius: 8px;
      background-color: #1A1D23;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      text-align: center;
      color: #FFFFFF;
      box-shadow: 0 8px 24px rgba(11, 11, 15, 0.25);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translate(-50%, 16px);
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
    }

    .cart-toast.is-visible {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, 0);
    }

    /* ---------- Huy hiệu số lượng trên icon giỏ hàng ---------- */
    .cart-icon {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
    }

    .cart-badge {
      position: absolute;
      top: -9px;
      left: -9px;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border: 2px solid #FFFFFF;
      border-radius: 11px;
      box-sizing: content-box;
      background-color: #A78BFA;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-size: 11px;
      font-weight: 700;
      line-height: 18px;
      color: #0B0B0F;
      pointer-events: none;
    }

    .cart-badge[hidden] { display: none; }

    @media (max-width: 480px) {
      .cart-toast { bottom: max(16px, env(safe-area-inset-bottom)); }
    }

    @media (prefers-reduced-motion: reduce) {
      .cart-toast { transition-duration: 0.01ms !important; }
    }
  `;
  document.head.appendChild(style);
})();