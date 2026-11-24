/* OWNIVERSE | Frontend preview only. No backend order is created here. */
(function () {
  "use strict";
  const KEY = "owniverse_checkout_preview";
  document.addEventListener("DOMContentLoaded", function () {
    const panel = document.getElementById("preview-details");
    if (!panel) return;
    let order = null;
    try { order = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (_) { /* no preview */ }
    if (!order || order.mode !== "preview" || !order.recipient || !order.shippingAddress || !order.totals || !Array.isArray(order.items)) {
      document.getElementById("preview-intro").textContent = "Chưa có bản xem trước nào trong phiên truy cập này. Vui lòng trở lại Checkout để kiểm tra đơn hàng.";
      document.getElementById("preview-warning").textContent = "Chưa có đơn hàng nào được gửi đến máy chủ.";
      return;
    }
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (typeof isLoggedIn !== "function" || !isLoggedIn() || !user || String(user.id) !== String(order.customerId)) {
      // Never show private recipient data from a different browser user.
      document.getElementById("preview-intro").textContent = "Bạn cần đăng nhập bằng đúng tài khoản đã chuẩn bị đơn hàng để xem thông tin.";
      return;
    }
    const format = function (value) { return new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + "đ"; };
    const setText = function (id, text) { document.getElementById(id).textContent = String(text || ""); };
    setText("preview-recipient", order.recipient.fullName);
    setText("preview-phone", order.recipient.phone);
    const a = order.shippingAddress;
    setText("preview-address", [a.addressLine, a.ward, a.district, a.city].filter(Boolean).join(", "));
    setText("preview-items", order.items.map(function (item) { return (item.name || "Sản phẩm") + " × " + item.quantity; }).join("; "));
    setText("preview-payment", order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng (chưa thanh toán)");
    setText("preview-voucher", order.voucherCode || "Không áp dụng");
    setText("preview-total", format(order.totals.total));
    panel.hidden = false;
  });
})();
