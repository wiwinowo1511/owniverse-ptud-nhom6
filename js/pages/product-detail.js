/* ==========================================================
   OWNIVERSE - Trang chi tiết sản phẩm
   Luồng dữ liệu: products.html (thẻ sản phẩm) -> product-detail.html?id=N
   -> đọc id bằng URLSearchParams -> getProductById(id) trong PRODUCTS.
   Cần nạp theo thứ tự: products.js -> cart-store.js -> product-detail.js
   - id thiếu / không tồn tại: hiện khối "Không tìm thấy sản phẩm"
   - "Mua ngay": thêm vào giỏ rồi chuyển tới phần thanh toán của cart.html
   - "Thêm vào giỏ hàng": chỉ thêm vào giỏ, ở lại trang (hiện thông báo)
   ========================================================== */


// Tên hiển thị của danh mục (cùng nhãn với bộ lọc trong products.html)
const CATEGORY_LABELS = {
  "ao-thun": "Áo thun",
  "ao-khoac": "Áo hoodie",
  "quan-dai": "Quần dài",
  "quan-short": "Quần short",
  "day-deo": "Dây đeo",
  "moc-khoa": "Móc khóa",
  "card": "Card",
  "phone-case": "Phone case",
  "pin-cai": "Pin cài",
  "sticker": "Sticker",
  "tui-tote": "Túi tote",
  "tui-deo-cheo": "Túi đeo chéo",
  "album": "Album",
  "lightstick": "Lightstick"
};


document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".buy-form");
  if (!form) return;


  // 1) Đọc id từ URL và tìm trong PRODUCTS
  const rawId = new URLSearchParams(window.location.search).get("id");
  const product = rawId === null ? null : getProductById(rawId.trim());


  // 2) Không có / không tìm thấy -> báo lỗi, không hiện nhầm sản phẩm khác
  if (!product) {
    showNotFound(rawId);
    return;
  }


  // 3) Có sản phẩm -> đổ dữ liệu lên trang
  const productId = product.id;
  fillProductInfo(product);
  renderRelatedProducts(product);
  document.addEventListener("error", handleDetailImageError, true);


  // 4) Giỏ hàng
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


// Mã sản phẩm sai: ẩn nội dung, hiện thông báo + nút quay lại danh sách
function showNotFound(rawId) {
  const content = document.getElementById("product-content");
  const notFound = document.getElementById("product-not-found");
  if (content) content.hidden = true;
  if (notFound) notFound.hidden = false;


  const text = document.querySelector("[data-not-found-text]");
  if (text) {
    text.textContent = rawId === null || rawId.trim() === ""
      ? "Đường dẫn chưa có mã sản phẩm. Hãy chọn một sản phẩm trong danh sách."
      : "Không có sản phẩm nào với mã “" + rawId.trim() + "”. Sản phẩm có thể đã bị xóa hoặc đường dẫn bị sai.";
  }


  document.title = "Không tìm thấy sản phẩm | Owniverse";
  const crumb = document.querySelector('.breadcrumb [aria-current="page"]');
  if (crumb) crumb.textContent = "Không tìm thấy sản phẩm";
}


// Đổ dữ liệu từ PRODUCTS vào trang (PRODUCTS là nguồn dữ liệu duy nhất)
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
  setText(".product-badge", "Danh mục: " + (CATEGORY_LABELS[product.category] || product.category));
  setText('.breadcrumb [aria-current="page"]', product.name);


  renderGallery(product);
  renderQuote(product);
  renderDetailBox(product);
}


// Thư viện ảnh: tối đa 4 ảnh (CSS radio chỉ hỗ trợ 4). Thiếu product.images thì dùng product.image
const MAX_GALLERY_IMAGES = 4;


function renderGallery(product) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;


  const images = (Array.isArray(product.images) && product.images.length ? product.images : [product.image])
    .slice(0, MAX_GALLERY_IMAGES);
  const name = escapeHtml(product.name);
  const src = function (path) { return escapeHtml(encodeURI(path)); };


  const slides = images.map(function (path, i) {
    return '<img class="gallery-slide' + (i === 0 ? " is-active" : "") + '" src="' + src(path) +
      '" alt="' + name + " - ảnh " + (i + 1) + '"' + (i === 0 ? "" : " hidden") + '>';
  }).join("");


  // Chỉ 1 ảnh thì không cần thumbnail
  const thumbs = images.length < 2 ? "" :
    '<div class="gallery-thumbs" role="group" aria-label="Ảnh sản phẩm">' + images.map(function (path, i) {
      return '<button class="gallery-thumb' + (i === 0 ? " is-active" : "") +
        '" type="button" data-gallery-index="' + i + '" aria-label="Xem ảnh ' + (i + 1) +
        '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' +
        '<img src="' + src(path) + '" alt="" loading="lazy"></button>';
    }).join("") + "</div>";


  gallery.innerHTML = '<div class="gallery-main">' + slides + "</div>" + thumbs;
  gallery.addEventListener("click", function (event) {
    const thumb = event.target.closest(".gallery-thumb");
    if (!thumb || !gallery.contains(thumb)) return;

    const selectedIndex = Number(thumb.dataset.galleryIndex);
    gallery.querySelectorAll(".gallery-slide").forEach(function (slide, i) {
      slide.hidden = i !== selectedIndex;
      slide.classList.toggle("is-active", i === selectedIndex);
    });
    gallery.querySelectorAll(".gallery-thumb").forEach(function (button, i) {
      const selected = i === selectedIndex;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  });
}


// Câu trích dẫn: chỉ hiện khi sản phẩm có quote
function renderQuote(product) {
  const quote = document.querySelector(".product-quote");
  if (!quote) return;
  quote.textContent = product.quote || "";
  quote.hidden = !product.quote;
}


// Mô tả sản phẩm: bảng "Thông tin sản phẩm" (specs) + "Giới thiệu" (intro, mặc định lấy description)
function renderDetailBox(product) {
  const box = document.querySelector(".detail-box");
  if (!box) return;


  const specs = Array.isArray(product.specs) ? product.specs : [];
  const intro = product.intro || product.description;


  const specsHtml = specs.length === 0 ? "" :
    '<div class="detail-specs"><h3>Thông tin sản phẩm</h3><dl class="spec-list">' +
    specs.map(function (item) {
      return "<div><dt>" + escapeHtml(item.label) + "</dt><dd>" + escapeHtml(item.value) + "</dd></div>";
    }).join("") + "</dl></div>";


  box.classList.toggle("detail-box--single", specs.length === 0);
  box.innerHTML = specsHtml +
    '<div class="detail-intro"><h3>Giới thiệu</h3><p>' + escapeHtml(intro) + "</p></div>";
}


// Sản phẩm liên quan: cùng nghệ sĩ (ưu tiên) hoặc cùng danh mục, bỏ sản phẩm đang xem, tối đa 4
function renderRelatedProducts(current) {
  const grid = document.querySelector(".related-grid");
  if (!grid) return;


  function score(p) {
    return (p.artist === current.artist ? 2 : 0) + (p.category === current.category ? 1 : 0);
  }


  const related = PRODUCTS
    .filter(function (p) { return String(p.id) !== String(current.id); })
    .map(function (p, index) { return { p: p, index: index }; })
    .sort(function (a, b) { return score(b.p) - score(a.p) || a.index - b.index; })
    .slice(0, 4)
    .map(function (item) { return item.p; });


  grid.innerHTML = related.map(function (p) {
    const name = escapeHtml(p.name);
    return `
    <article class="related-card">
      <div class="related-thumb">
        <img src="${escapeHtml(encodeURI(p.image))}" alt="${name}" loading="lazy">
      </div>
      <h3 class="related-name">${name}</h3>
      <p class="related-price">${formatPrice(p.price)}</p>
      <a href="${getProductDetailUrl(p.id)}" class="btn btn-secondary">Xem chi tiết</a>
    </article>`;
  }).join("");
}


// Ảnh lỗi trên trang chi tiết: thay bằng ảnh thay thế (sự kiện "error" không nổi bọt nên dùng capture)
function handleDetailImageError(event) {
  const img = event.target;
  if (img.tagName === "IMG" && img.matches(".gallery-slide, .gallery-thumb img, .related-thumb img") && img.src !== PLACEHOLDER_IMAGE) {
    img.src = PLACEHOLDER_IMAGE;
  }
}
