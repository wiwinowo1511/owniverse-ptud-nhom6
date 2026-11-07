/* ==========================================================
   OWNIVERSE - Trang chi tiết: gắn chức năng giỏ hàng
   - "Mua hàng": thêm vào giỏ rồi chuyển sang cart.html
   - "Thêm vào giỏ": thêm vào giỏ, ở lại trang
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

  // Đọc số lượng hợp lệ (>= 1, không vượt max của ô nhập)
  function readQuantity() {
    const max = Number(qtyInput && qtyInput.max) || CART_MAX_QTY;
    const qty = Math.floor(Number(qtyInput && qtyInput.value));
    const valid = Number.isFinite(qty) && qty >= 1 ? Math.min(qty, max) : 1;
    if (qtyInput) qtyInput.value = valid;
    return valid;
  }

    form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (addToCart(productId, readQuantity())) {
      window.location.href = CART_PAGE;   // thêm vào giỏ rồi chuyển sang giỏ hàng
    }
  });
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