/* ==========================================================
   OWNIVERSE - Hiển thị và xử lý trang Giỏ hàng (js/cart-page.js)
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const layout = document.getElementById("cart-layout");
  const list = document.getElementById("cart-list");
  const emptyBox = document.getElementById("cart-empty");
  const summary = document.getElementById("cart-summary");
  const totalQty = document.getElementById("cart-total-qty");
  const totalPrice = document.getElementById("cart-total-price");
  const checkoutBtn = document.getElementById("cart-checkout");
  if (!layout || !list) return;

  // HTML của một dòng sản phẩm
  function createCartItemHtml(item, product) {
    const name = escapeHtml(product.name);
    const detailUrl = getProductDetailUrl(product.id);
    return `
      <li class="cart-item" data-product-id="${escapeHtml(product.id)}">
        <a class="cart-item_media" href="${detailUrl}">
          <img class="cart-item_img" src="${escapeHtml(encodeURI(product.image))}" alt="${name}" loading="lazy">
        </a>
        <div class="cart-item_info">
          <h3 class="cart-item_title"><a href="${detailUrl}">${name}</a></h3>
          <p class="cart-item_artist">Nghệ sĩ: ${escapeHtml(product.artist)}</p>
          <p class="cart-item_price">${formatPrice(product.price)}</p>
        </div>
        <div class="cart-qty" role="group" aria-label="Số lượng ${name}">
          <button type="button" class="cart-qty_btn" data-cart-action="decrease" aria-label="Giảm số lượng"${item.quantity <= 1 ? " disabled" : ""}>−</button>
          <input class="cart-qty_input" type="number" min="1" max="${CART_MAX_QTY}" value="${item.quantity}" inputmode="numeric" aria-label="Số lượng" data-cart-action="set">
          <button type="button" class="cart-qty_btn" data-cart-action="increase" aria-label="Tăng số lượng"${item.quantity >= CART_MAX_QTY ? " disabled" : ""}>+</button>
        </div>
        <p class="cart-item_total" aria-label="Thành tiền">${formatPrice(product.price * item.quantity)}</p>
        <button type="button" class="cart-item_remove" data-cart-action="remove" aria-label="Xóa ${name} khỏi giỏ hàng">Xóa</button>
      </li>`;
  }

  // Vẽ lại toàn bộ trang giỏ hàng từ localStorage
  function renderCart() {
    const cart = getCart();
    const rows = [];
    cart.forEach(function (item) {
      const product = getProductById(item.id);
      if (product) rows.push({ item: item, product: product });
    });

    // Loại các sản phẩm không còn trong PRODUCTS
    if (rows.length !== cart.length) {
      saveCart(rows.map(function (row) { return row.item; }));
    }

    const isEmpty = rows.length === 0;
    layout.classList.toggle("is-empty", isEmpty);
    emptyBox.hidden = !isEmpty;
    list.hidden = isEmpty;
    summary.hidden = isEmpty;

    list.innerHTML = rows.map(function (row) {
      return createCartItemHtml(row.item, row.product);
    }).join("");

    totalQty.textContent = getCartCount();
    totalPrice.textContent = formatPrice(getCartTotal());
  }

  // Giữ vị trí focus cho người dùng bàn phím sau khi vẽ lại
  function restoreFocus(id, action) {
    const row = list.querySelector('.cart-item[data-product-id="' + id + '"]');
    if (!row) return;
    let target = row.querySelector('[data-cart-action="' + action + '"]');
    if (!target || target.disabled) target = row.querySelector('[data-cart-action="increase"]');
    if (target && !target.disabled) target.focus();
  }

  // Nút +, −, Xóa
  list.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-cart-action]");
    const row = button && button.closest(".cart-item");
    if (!row) return;

    const id = row.dataset.productId;
    const action = button.dataset.cartAction;

    if (action === "increase") changeQuantity(id, 1);
    else if (action === "decrease") changeQuantity(id, -1);
    else if (action === "remove") {
      removeFromCart(id);
      showToast("Đã xóa sản phẩm khỏi giỏ hàng");
    } else return;

    renderCart();
    if (action !== "remove") restoreFocus(id, action);
  });

  // Nhập số lượng trực tiếp (giá trị < 1 hoặc không hợp lệ được đưa về hợp lệ)
  list.addEventListener("change", function (event) {
    const input = event.target.closest(".cart-qty_input");
    const row = input && input.closest(".cart-item");
    if (!row) return;
    updateQuantity(row.dataset.productId, input.value);
    renderCart();
  });

  // Ảnh lỗi -> ảnh thay thế
  list.addEventListener("error", function (event) {
    const img = event.target;
    if (img.tagName === "IMG" && img.src !== PLACEHOLDER_IMAGE) {
      img.src = PLACEHOLDER_IMAGE;
      img.alt = "Không tải được ảnh sản phẩm";
    }
  }, true);

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      showToast("Chức năng thanh toán sẽ được hoàn thiện ở buổi tiếp theo.");
    });
  }

  // Đồng bộ khi giỏ đổi ở tab khác hoặc quay lại bằng nút Back
  window.addEventListener("storage", function (event) {
    if (event.key === CART_STORAGE_KEY || event.key === null) renderCart();
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) renderCart();
  });

  // Đến từ nút "Mua ngay" (cart.html#cart-summary): cuộn tới phần thanh toán, làm nổi bật và đặt focus vào nút THANH TOÁN
  function revealCheckoutIfRequested() {
    if (window.location.hash !== CART_CHECKOUT_HASH || summary.hidden) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    summary.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    summary.classList.add("is-highlight");
    setTimeout(function () { summary.classList.remove("is-highlight"); }, 2400);
    if (checkoutBtn) checkoutBtn.focus({ preventScroll: true });
  }

  renderCart();
  revealCheckoutIfRequested();
});