/* ==========================================================
   OWNIVERSE - Logic giỏ hàng dùng chung (js/cart.js)
   Dữ liệu: [{ id, quantity }] lưu trong localStorage.
   Thông tin hiển thị (tên, giá, ảnh) lấy từ PRODUCTS theo id.
   ========================================================== */
const CART_STORAGE_KEY = "owniverse_cart";
const CART_MAX_QTY = 99;          // Số lượng tối đa mỗi sản phẩm
const CART_PAGE = "cart.html";

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
  updateCartCount();
}

// Tìm dòng trong giỏ theo id (id số hoặc chuỗi đều được)
function findCartItem(cart, id) {
  return cart.find(function (item) {
    return String(item.id) === String(id);
  }) || null;
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
document.addEventListener("DOMContentLoaded", updateCartCount);

// Nút "Thêm vào giỏ" ở trang danh sách (thẻ do JS sinh ra nên dùng event delegation)
document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;
  event.preventDefault();

  const id = button.dataset.addToCart;
  if (addToCart(id, 1)) {
    const product = getProductById(id);
    showToast("Đã thêm “" + (product ? product.name : "sản phẩm") + "” vào giỏ hàng");
  }
});

// Đồng bộ khi đổi ở tab khác hoặc quay lại bằng nút Back (bfcache)
window.addEventListener("storage", function (event) {
  if (event.key === CART_STORAGE_KEY || event.key === null) updateCartCount();
});
window.addEventListener("pageshow", function (event) {
  if (event.persisted) updateCartCount();
});