/* ==========================================================
   OWNIVERSE - Trang chi tiết: gắn chức năng giỏ hàng
   - "Mua ngay": thêm vào giỏ rồi chuyển tới phần thanh toán của cart.html
   - "Thêm vào giỏ hàng": chỉ thêm vào giỏ, ở lại trang (hiện thông báo)
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".buy-form");
  if (!form) return;

  const defaultId = form.dataset.productId;                  // sản phẩm của nội dung tĩnh (id = 2)
  const urlId = new URLSearchParams(window.location.search).get("id");
  const productId = urlId && getProductById(urlId) ? urlId : defaultId;
  const product = getProductById(productId);
  if (!product) return;

  // Id khác nội dung tĩnh -> cập nhật các thông tin chính theo PRODUCTS
  if (String(productId) !== String(defaultId)) fillProductInfo(product);

  const qtyInput = form.querySelector("#qty");
  const addBtn = form.querySelector('[data-detail-action="add"]');

  // Đọc số lượng hợp lệ (>= 1, không vượt max của ô nhập)
  function readQuantity() {
    const max = Number(qtyInput && qtyInput.max) || CART_MAX_QTY;
    const qty = Math.floor(Number(qtyInput && qtyInput.value));
    const valid = Number.isFinite(qty) && qty >= 1 ? Math.min(qty, max) : 1;
    if (qtyInput) qtyInput.value = valid;
    return valid;
  }

  // "Mua ngay" (nút submit, cũng là phím Enter trong ô số lượng): thêm rồi nhảy tới thanh toán
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    buyNow(productId, readQuantity());
  });

  // "Thêm vào giỏ hàng": chỉ thêm, không chuyển trang
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      const qty = readQuantity();
      if (addToCart(productId, qty)) {
        showToast("Đã thêm " + qty + " “" + product.name + "” vào giỏ hàng");
      }
    });
  }
});

// Cập nhật nội dung chính của trang tĩnh theo sản phẩm được chọn
function fillProductInfo(product) {
  function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  }
  document.title = product.name + " | Owniverse";
  setText(".product-title", product.name);
  setText(".product-price", formatPrice(product.price));
  setText(".product-summary", product.description);
  setText(".product-artist a", product.artist);
  setText('.breadcrumb [aria-current="page"]', product.name);

  // Trang tĩnh có 4 ảnh album; dùng tạm ảnh của sản phẩm cho toàn bộ
  document.querySelectorAll(".gallery-slide, .gallery-thumb img").forEach(function (img) {
    img.src = encodeURI(product.image);
    img.alt = product.name;
  });
}