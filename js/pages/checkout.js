/* OWNIVERSE Checkout | Frontend-only preview, no real order API call.
   Dependencies: js/auth/auth.js, js/pages/products.js, js/cart/cart-store.js
   Cart schema is owned by cart-store.js: [{ id, quantity }].
   IMPORTANT: Do not treat client totals, client vouchers or this preview as a real order.
*/
(function () {
  "use strict";

  const SHIPPING_FEE = 30000;                     // Demo configuration: 30.000 VND
  const DEMO_VOUCHER = "OWNI10";                  // Demo: 10% off merchandise only
  const DEMO_VOUCHER_RATE = 10;
  const PREVIEW_KEY = "owniverse_checkout_preview";
  const phonePattern = /^(03|05|07|08|09)\d{8}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("checkout-form");
    if (!form) return;

    const message = document.getElementById("checkout-message");
    const orderItemsElement = document.getElementById("checkout-order-items");
    const emptyElement = document.getElementById("checkout-empty-cart");
    const submitButton = document.getElementById("checkout-submit");
    const voucherInput = document.getElementById("checkout-voucher");
    const voucherApplyButton = document.getElementById("checkout-voucher-apply");
    const voucherRemoveButton = document.getElementById("checkout-voucher-remove");
    const voucherFeedback = document.getElementById("checkout-voucher-feedback");

    const fieldNames = ["fullName", "phone", "email", "city", "district", "ward", "addressLine"];
    const fieldMap = Object.fromEntries(fieldNames.map(function (name) {
      return [name, form.elements.namedItem(name)];
    }));
    let voucherApplied = false;
    let isSubmitting = false;
    let currentItems = [];
    let isCartValid = false;

    function money(value) {
      if (typeof formatPrice === "function") return formatPrice(value);
      return new Intl.NumberFormat("vi-VN").format(value) + "đ";
    }

    function showError(text) {
      message.textContent = text;
      message.hidden = false;
      message.scrollIntoView({ block: "nearest", behavior: "auto" });
    }

    function clearError() {
      message.textContent = "";
      message.hidden = true;
    }

    function normalizedPhone(value) {
      let phone = String(value || "").trim().replace(/[.\s\-()]/g, "");
      if (phone.startsWith("+84")) phone = "0" + phone.slice(3);
      if (phone.startsWith("84") && phone.length === 11) phone = "0" + phone.slice(2);
      return phone;
    }

    function valueOf(name) {
      return String(fieldMap[name] && fieldMap[name].value || "").trim();
    }

    function getFieldError(name) {
      const value = valueOf(name);
      if (name === "email") return value && !emailPattern.test(value) ? "Email chưa đúng định dạng." : "";
      if (!value) return "Vui lòng điền thông tin này.";
      if (name === "fullName" && value.length < 2) return "Họ và tên phải có ít nhất 2 ký tự.";
      if (name === "phone" && !phonePattern.test(normalizedPhone(value))) {
        return "Số điện thoại Việt Nam phải gồm 10 chữ số hợp lệ.";
      }
      if (name === "addressLine" && value.length < 5) return "Vui lòng nhập địa chỉ cụ thể (ít nhất 5 ký tự).";
      return "";
    }

    function setFieldError(name, error) {
      const input = fieldMap[name];
      const target = form.querySelector('[data-error-for="' + name + '"]');
      if (target) target.textContent = error;
      if (input) input.setAttribute("aria-invalid", error ? "true" : "false");
    }

    function validateFields() {
      let firstInvalid = null;
      fieldNames.forEach(function (name) {
        const error = getFieldError(name);
        setFieldError(name, error);
        if (error && !firstInvalid) firstInvalid = fieldMap[name];
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    function readItems() {
      if (typeof getCart !== "function" || typeof getProductById !== "function") {
        return { items: [], invalid: true };
      }
      const cart = getCart();
      const items = [];
      let invalid = false;
      cart.forEach(function (row) {
        const product = getProductById(row.id);
        const price = product && Number(product.price);
        if (!product || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(row.quantity) || row.quantity < 1) {
          invalid = true;
          return;
        }
        items.push({ id: product.id, name: product.name, artist: product.artist || "", image: product.image || "", price: price, quantity: row.quantity });
      });
      return { items: items, invalid: invalid };
    }

    function calcTotals(items) {
      const subtotal = items.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
      const shippingFee = items.length ? SHIPPING_FEE : 0;
      const discount = voucherApplied ? Math.round(subtotal * DEMO_VOUCHER_RATE / 100) : 0;
      return { subtotal: subtotal, shippingFee: shippingFee, discount: discount, total: Math.max(0, subtotal + shippingFee - discount) };
    }

    function textElement(tag, className, content) {
      const el = document.createElement(tag);
      if (className) el.className = className;
      el.textContent = content;
      return el;
    }

    function renderOrderItem(item) {
      const wrapper = document.createElement("div");
      wrapper.className = "ow-order-item";
      const image = document.createElement("img");
      image.className = "ow-order-item-img";
      image.loading = "lazy";
      image.alt = "Ảnh " + item.name;
      image.src = item.image || (typeof PLACEHOLDER_IMAGE === "string" ? PLACEHOLDER_IMAGE : "");
      image.addEventListener("error", function () {
        const fallback = typeof PLACEHOLDER_IMAGE === "string" ? PLACEHOLDER_IMAGE : "";
        if (fallback && image.src !== fallback) image.src = fallback;
      });
      const details = textElement("div", "ow-order-item-details", "");
      const link = textElement("a", "", item.name);
      link.href = typeof getProductDetailUrl === "function" ? getProductDetailUrl(item.id) : "products.html";
      details.appendChild(link);
      details.appendChild(textElement("span", "", "Nghệ sĩ: " + item.artist));
      details.appendChild(textElement("span", "", "Số lượng: " + item.quantity));
      const price = textElement("div", "ow-order-item-price", money(item.price * item.quantity));
      price.appendChild(textElement("small", "", money(item.price) + " / SP"));
      wrapper.append(image, details, price);
      return wrapper;
    }

    function renderTotals() {
      const data = readItems();
      currentItems = data.items;
      isCartValid = !data.invalid && currentItems.length > 0;
      orderItemsElement.replaceChildren();
      currentItems.forEach(function (item) { orderItemsElement.appendChild(renderOrderItem(item)); });
      emptyElement.hidden = isCartValid;
      if (data.invalid) {
        emptyElement.querySelector("p").textContent = "Giỏ hàng có sản phẩm không còn khả dụng. Hãy kiểm tra lại giỏ trước khi thanh toán.";
      } else {
        emptyElement.querySelector("p").textContent = "Giỏ hàng của bạn đang trống. Hãy chọn sản phẩm để tiếp tục.";
      }
      const count = currentItems.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      document.getElementById("checkout-item-count").textContent = String(count);
      const totals = calcTotals(currentItems);
      document.getElementById("checkout-subtotal").textContent = money(totals.subtotal);
      document.getElementById("checkout-shipping").textContent = money(totals.shippingFee);
      document.getElementById("checkout-discount").textContent = totals.discount ? "− " + money(totals.discount) : "0đ";
      document.getElementById("checkout-total").textContent = money(totals.total);
      submitButton.disabled = !isCartValid || isSubmitting;
      voucherApplyButton.disabled = !isCartValid || isSubmitting;
      return totals;
    }

    function setVoucherMessage(text, isError) {
      voucherFeedback.textContent = text;
      voucherFeedback.classList.toggle("is-error", !!isError);
    }

    function applyVoucher() {
      if (!isCartValid) return;
      const code = voucherInput.value.trim().toUpperCase();
      if (code !== DEMO_VOUCHER) {
        voucherApplied = false;
        voucherRemoveButton.hidden = true;
        setVoucherMessage(code ? "Mã ưu đãi không hợp lệ. Hãy thử OWNI10." : "Vui lòng nhập mã ưu đãi.", true);
      } else {
        voucherApplied = true;
        voucherRemoveButton.hidden = false;
        voucherInput.value = DEMO_VOUCHER;
        setVoucherMessage("Áp dụng OWNI10: giảm 10% trên tiền sản phẩm.", false);
      }
      renderTotals();
    }

    function prefillProfile() {
      if (typeof getCurrentUser !== "function") return;
      const user = getCurrentUser();
      if (!user) return;
      fieldMap.fullName.value = user.fullName || "";
      fieldMap.phone.value = user.phone || "";
      fieldMap.email.value = user.email || "";
    }

    async function previewOrder() {
      if (isSubmitting) return;
      if (typeof isLoggedIn !== "function" || !isLoggedIn()) {
        if (typeof goToLogin === "function") goToLogin("checkout.html");
        return;
      }
      if (!isCartValid || readItems().invalid || readItems().items.length === 0) {
        showError("Giỏ hàng không hợp lệ hoặc trống. Vui lòng quay lại kiểm tra sản phẩm.");
        renderTotals();
        return;
      }
      if (!validateFields()) {
        showError("Vui lòng kiểm tra các trường có thông báo lỗi trước khi tiếp tục.");
        return;
      }
      clearError();
      isSubmitting = true;
      renderTotals();
      submitButton.textContent = "ĐANG KIỂM TRA...";
      try {
        // Always recalculate immediately before producing a preview. The backend
        // MUST independently validate stock, prices, user identity and promotions.
        const latest = readItems();
        if (latest.invalid || !latest.items.length) throw new Error("Giỏ hàng đã thay đổi hoặc có sản phẩm không hợp lệ.");
        const totals = calcTotals(latest.items);
        const paymentMethod = form.elements.namedItem("paymentMethod").value;
        if (paymentMethod !== "cod" && paymentMethod !== "bank_transfer") throw new Error("Phương thức thanh toán không hợp lệ.");
        const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
        if (!user || !user.id) throw new Error("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.");
        const preview = {
          mode: "preview",
          createdAt: new Date().toISOString(),
          customerId: user.id,
          recipient: {
            fullName: valueOf("fullName"), phone: normalizedPhone(valueOf("phone")),
            email: valueOf("email")
          },
          shippingAddress: {
            city: valueOf("city"), district: valueOf("district"), ward: valueOf("ward"),
            addressLine: valueOf("addressLine"), note: String(form.elements.namedItem("note").value || "").trim()
          },
          items: latest.items.map(function (item) {
            return { id: item.id, name: item.name, artist: item.artist, quantity: item.quantity, unitPrice: item.price };
          }),
          paymentMethod: paymentMethod,
          voucherCode: voucherApplied ? DEMO_VOUCHER : null,
          totals: totals
        };
        // No server request; no cart deletion; no real order number generation.
        sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(preview));
        const isPreviewLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) &&
          new URLSearchParams(location.search).get("demo") === "1";
        window.location.assign("order-confirmation.html" + (isPreviewLocal ? "?demo=1" : ""));
      } catch (error) {
        showError(error.message || "Không thể chuẩn bị bản xem trước đơn hàng.");
        isSubmitting = false;
        submitButton.textContent = "XEM TRƯỚC ĐƠN HÀNG";
        renderTotals();
      }
    }

    prefillProfile();
    renderTotals();

    fieldNames.forEach(function (name) {
      fieldMap[name].addEventListener("blur", function () { setFieldError(name, getFieldError(name)); });
      fieldMap[name].addEventListener("input", function () {
        if (fieldMap[name].getAttribute("aria-invalid") === "true") setFieldError(name, getFieldError(name));
        clearError();
      });
    });

    voucherApplyButton.addEventListener("click", applyVoucher);
    voucherInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); applyVoucher(); }
    });
    voucherRemoveButton.addEventListener("click", function () {
      voucherApplied = false;
      voucherInput.value = "";
      voucherRemoveButton.hidden = true;
      setVoucherMessage("Đã bỏ mã giảm giá.", false);
      renderTotals();
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      previewOrder();
    });
    window.addEventListener("storage", function (event) {
      if (event.key === "owniverse_cart" || event.key === null) renderTotals();
    });
    window.addEventListener("pageshow", function (event) { if (event.persisted) renderTotals(); });
  });
})();
