/* ==========================================================
   OWNIVERSE - Logic giỏ hàng dùng chung (js/cart.js)
   Dữ liệu: [{ id, quantity }] lưu trong localStorage.
   Thông tin hiển thị (tên, giá, ảnh) lấy từ PRODUCTS theo id.
   ========================================================== */
const CART_STORAGE_KEY = "owniverse_cart";
const CART_MAX_QTY = 99;          // Số lượng tối đa mỗi sản phẩm
const CART_PAGE = "cart.html";
const CART_CHECKOUT_HASH = "#cart-summary";               // khu vực tóm tắt + nút THANH TOÁN
const CART_CHECKOUT_URL = CART_PAGE + CART_CHECKOUT_HASH; // đích của nút "Mua ngay"

/* ---------- 1. DỮ LIỆU ---------- */

// Đọc giỏ hàng; dữ liệu hỏng hoặc không có -> []
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data
      .map(function (item) {
        return { id: item && item.id, quantity: Math.floor(Number(item && item.quantity)) };
      })
      .filter(function (item) {
        return item.id !== undefined && item.id !== null && item.quantity >= 1;
      })
      .map(function (item) {
        return { id: item.id, quantity: Math.min(item.quantity, CART_MAX_QTY) };
      });
  } catch (error) {
    return [];
  }
}

// Ghi giỏ hàng và cập nhật số lượng trên header
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("Không thể lưu giỏ hàng:", error);
  }
  notifyCartChange();
}

// Tìm dòng trong giỏ theo id (id số hoặc chuỗi đều được)
function findCartItem(cart, id) {
  return cart.find(function (item) {
    return String(item.id) === String(id);
  }) || null;
}

// Số lượng của một sản phẩm trong giỏ (0 nếu chưa có)
function getCartQuantity(id) {
  const item = findCartItem(getCart(), id);
  return item ? item.quantity : 0;
}

/* ---------- 2. THAO TÁC ---------- */

// Thêm sản phẩm: đã có -> tăng số lượng, chưa có -> thêm dòng mới
function addToCart(id, quantity) {
  const product = typeof getProductById === "function" ? getProductById(id) : null;
  if (!product) {
    console.warn("Không tìm thấy sản phẩm có id =", id);
    return false;
  }
  const qty = Math.max(1, Math.floor(Number(quantity)) || 1);
  const cart = getCart();
  const item = findCartItem(cart, product.id);

  if (item) {
    item.quantity = Math.min(item.quantity + qty, CART_MAX_QTY);
  } else {
    cart.push({ id: product.id, quantity: Math.min(qty, CART_MAX_QTY) });
  }
  saveCart(cart);
  return true;
}

// Đặt số lượng cụ thể (giới hạn 1..CART_MAX_QTY; giá trị không hợp lệ -> giữ nguyên)
function updateQuantity(id, quantity) {
  const cart = getCart();
  const item = findCartItem(cart, id);
  if (!item) return;
  const qty = Math.floor(Number(quantity));
  if (Number.isFinite(qty)) {
    item.quantity = Math.min(Math.max(qty, 1), CART_MAX_QTY);
  }
  saveCart(cart);
}

// Tăng/giảm số lượng theo delta (+1 / -1)
function changeQuantity(id, delta) {
  const item = findCartItem(getCart(), id);
  if (item) updateQuantity(id, item.quantity + delta);
}

function removeFromCart(id) {
  saveCart(getCart().filter(function (item) {
    return String(item.id) !== String(id);
  }));
}

// "Mua ngay": thêm vào giỏ rồi chuyển thẳng tới khu vực thanh toán của giỏ hàng
function buyNow(id, quantity) {
  if (addToCart(id, quantity)) {
    window.location.href = CART_CHECKOUT_URL;
    return true;
  }
  return false;
}

/* ---------- 3. TÍNH TOÁN ---------- */

// Tổng số lượng (cộng số lượng của tất cả dòng)
function getCartCount() {
  return getCart().reduce(function (sum, item) { return sum + item.quantity; }, 0);
}

// Tổng tiền toàn giỏ (cần products.js)
function getCartTotal() {
  if (typeof getProductById !== "function") return 0;
  return getCart().reduce(function (sum, item) {
    const product = getProductById(item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
}

/* ---------- 4. GIAO DIỆN DÙNG CHUNG ---------- */

// Cập nhật huy hiệu số lượng ở header (mọi phần tử có data-cart-count)
function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach(function (el) {
    el.textContent = count > 99 ? "99+" : String(count);
    el.hidden = count === 0;
  });
}

// Giỏ vừa thay đổi: cập nhật huy hiệu và báo cho các trang khác (vd. nút trên thẻ sản phẩm)
function notifyCartChange() {
  updateCartCount();
  document.dispatchEvent(new CustomEvent("cart:change"));
}

// Thông báo ngắn ở cuối màn hình
function showToast(message) {
  let toast = document.querySelector(".cart-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 2200);
}

/* ---------- 5. KHỞI TẠO ---------- */
// Tự gắn huy hiệu vào link "Giỏ hàng" ở header nếu trang chưa có sẵn
// -> trang nào chỉ cần nạp cart-common.css + cart-store.js là có số lượng giỏ hàng.
function ensureCartBadge() {
  document.querySelectorAll('.action-link[href="' + CART_PAGE + '"]').forEach(function (link) {
    link.setAttribute("aria-label", "Giỏ hàng");
    link.title = "Giỏ hàng";
    Array.from(link.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) node.remove();
    });

    let icon = link.querySelector(".cart-icon");
    let svg = link.querySelector("svg");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>' +
        '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>';
    }

    if (!icon) {
      icon = document.createElement("span");
      icon.className = "cart-icon";
      link.insertBefore(icon, link.firstChild);
    }
    if (svg.parentNode !== icon) icon.appendChild(svg);

    let badge = icon.querySelector("[data-cart-count]") || link.querySelector("[data-cart-count]");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      badge.setAttribute("data-cart-count", "");
      badge.hidden = true;
      badge.textContent = "0";
    }
    if (badge.parentNode !== icon) icon.appendChild(badge);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  ensureCartBadge();
  updateCartCount();
});

// Nút "Thêm vào giỏ" / "Bỏ khỏi giỏ" ở trang danh sách (thẻ do JS sinh ra nên dùng event delegation)
// Chỉ thêm/bớt trong giỏ, KHÔNG chuyển trang.
document.addEventListener("click", function (event) {
  const addBtn = event.target.closest("[data-add-to-cart]");
  const removeBtn = event.target.closest("[data-remove-from-cart]");
  if (!addBtn && !removeBtn) return;
  event.preventDefault();

  if (addBtn) {
    const id = addBtn.dataset.addToCart;
    if (addToCart(id, 1)) {
      const product = getProductById(id);
      const qty = getCartQuantity(id);
      showToast("Đã thêm “" + (product ? product.name : "sản phẩm") + "” vào giỏ hàng" + (qty > 1 ? " (x" + qty + ")" : ""));
    }
    return;
  }

  const id = removeBtn.dataset.removeFromCart;
  const product = getProductById(id);
  removeFromCart(id);
  showToast("Đã bỏ “" + (product ? product.name : "sản phẩm") + "” khỏi giỏ hàng");

  // Nút "Bỏ khỏi giỏ" vừa bị ẩn -> chuyển focus sang nút "Thêm vào giỏ" cùng thẻ
  const card = removeBtn.closest(".product-card");
  const addAgain = card && card.querySelector("[data-add-to-cart]");
  if (addAgain) addAgain.focus();
});

// Đồng bộ khi đổi ở tab khác hoặc quay lại bằng nút Back (bfcache)
window.addEventListener("storage", function (event) {
  if (event.key === CART_STORAGE_KEY || event.key === null) notifyCartChange();
});
window.addEventListener("pageshow", function (event) {
  if (event.persisted) notifyCartChange();
});