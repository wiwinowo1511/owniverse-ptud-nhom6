/* ==========================================================
   OWNIVERSE - Trang chi tiết sản phẩm (product-detail.html)
   MỘT trang dùng chung cho mọi sản phẩm, dữ liệu lấy từ PRODUCTS:
     1. Đọc mã sản phẩm trên URL:  product-detail.html?id=3
     2. Tìm sản phẩm bằng getProductById(id)        (products.js)
     3. Đổ dữ liệu vào trang; id không tồn tại -> thông báo lỗi
     4. Gắn nút "Mua ngay" / "Thêm vào giỏ hàng"    (cart-store.js)
   Thứ tự nạp script trong HTML: products.js -> cart-store.js -> product-detail.js
   ========================================================== */

const ARTIST_PAGE = "artist-detail.html";   // artist-detail.js đọc tham số ?artist=kairo
const PRODUCT_LIST_PAGE = "products.html";
const RELATED_LIMIT = 4;

// Tên hiển thị của category (cùng nhãn với bộ lọc trong products.html)
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

/* ---------- 1. KHỞI TẠO ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".buy-form");
  if (!form || typeof getProductById !== "function") return;

  // Sản phẩm có sẵn nội dung tĩnh trong HTML (hiện là id = 2: thông số, giới thiệu dài, ảnh...)
  const sampleId = form.dataset.productId;

  // Lấy id từ URL. Không có ?id= (link cũ ở trang chủ, trang nghệ sĩ...) -> giữ hành vi cũ: hiện sản phẩm mẫu.
  const rawId = new URLSearchParams(window.location.search).get("id");
  const hasId = rawId !== null && rawId.trim() !== "";
  const product = getProductById(hasId ? rawId.trim() : sampleId);

  if (!product) {
    showProductNotFound(hasId ? rawId.trim() : "");
    return;
  }

  renderProduct(product, form, String(product.id) === String(sampleId));
  bindCartButtons(form, product);
});

/* ---------- 2. HIỂN THỊ SẢN PHẨM ---------- */

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function getCategoryLabel(code) {
  return CATEGORY_LABELS[code] || code;
}

// isSample = true: giữ nguyên phần nội dung tĩnh của sản phẩm mẫu (tóm tắt, trích dẫn, thông số, giới thiệu, ảnh, liên quan)
function renderProduct(product, form, isSample) {
  // Phần luôn lấy từ PRODUCTS (một nguồn dữ liệu duy nhất, giá không bao giờ lệch với giỏ hàng)
  document.title = product.name + " | Owniverse";
  setText(".product-title", product.name);
  setText(".product-price", formatPrice(product.price));
  setText(".product-badge", getCategoryLabel(product.category) + " chính hãng");
  setText('.breadcrumb [aria-current="page"]', product.name);
  form.dataset.productId = product.id;

  const artistLink = document.querySelector(".product-artist a");
  if (artistLink) {
    artistLink.textContent = product.artist;
    artistLink.href = ARTIST_PAGE + "?artist=" + encodeURIComponent(String(product.artist).toLowerCase());
  }

  if (isSample) return;

  // Sản phẩm khác: thay toàn bộ nội dung riêng của sản phẩm mẫu bằng dữ liệu của sản phẩm này
  const parts = splitDescription(product.description);
  setText(".product-summary", parts.summary);
  setText(".detail-intro p", parts.intro);

  const quote = document.querySelector(".product-quote");   // câu trích dẫn chỉ có ở sản phẩm mẫu
  if (quote) quote.hidden = true;

  renderSpecs(product);
  renderGallery(product);
  renderRelated(product);
}

// Tách mô tả: câu đầu -> phần tóm tắt, phần còn lại -> mục "Giới thiệu" (mô tả chỉ 1 câu thì dùng cho cả hai)
function splitDescription(description) {
  const text = String(description || "").trim();
  const match = text.match(/^([\s\S]+?[.!?])(?=\s|$)\s*([\s\S]*)$/);
  if (!match) return { summary: text, intro: text };
  return { summary: match[1], intro: match[2] || text };
}

// Bảng "Thông tin sản phẩm" từ dữ liệu có sẵn
function renderSpecs(product) {
  const list = document.querySelector(".detail-specs .spec-list");
  if (!list) return;
  const rows = [
    ["Danh mục", getCategoryLabel(product.category)],
    ["Nghệ sĩ", product.artist],
    ["Mã sản phẩm", product.id]
  ];
  list.innerHTML = rows.map(function (row) {
    return "<div><dt>" + escapeHtml(row[0]) + "</dt><dd>" + escapeHtml(row[1]) + "</dd></div>";
  }).join("");
}

// Thư viện ảnh: dùng product.images (không có thì dùng product.image); bớt ô thừa nếu ít hơn 4 ảnh
function renderGallery(product) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
  const radios = gallery.querySelectorAll(".gallery-radio");
  const slides = gallery.querySelectorAll(".gallery-slide");
  const thumbs = gallery.querySelectorAll(".gallery-thumb");

  slides.forEach(function (slide, i) {
    if (!images[i]) {
      if (radios[i]) radios[i].remove();
      slide.remove();
      if (thumbs[i]) thumbs[i].remove();
      return;
    }
    slide.src = encodeURI(images[i]);
    slide.alt = product.name + " - ảnh " + (i + 1);
    const thumbImg = thumbs[i] && thumbs[i].querySelector("img");
    if (thumbImg) {
      thumbImg.src = encodeURI(images[i]);
      thumbImg.alt = "Ảnh " + (i + 1);
    }
  });

  // Chỉ có 1 ảnh thì không cần dải ảnh nhỏ
  const thumbsBox = gallery.querySelector(".gallery-thumbs");
  if (thumbsBox && images.length < 2) thumbsBox.hidden = true;

  attachImageFallback(gallery);
}

// Sản phẩm liên quan: cùng nghệ sĩ (ưu tiên) hoặc cùng danh mục, không gồm chính sản phẩm đang xem
function getRelatedProducts(product) {
  return PRODUCTS
    .filter(function (item) { return String(item.id) !== String(product.id); })
    .map(function (item, index) {
      const score = (item.artist === product.artist ? 2 : 0) + (item.category === product.category ? 1 : 0);
      return { item: item, index: index, score: score };
    })
    .sort(function (a, b) { return b.score - a.score || a.index - b.index; })
    .slice(0, RELATED_LIMIT)
    .map(function (entry) { return entry.item; });
}

function renderRelated(product) {
  const grid = document.querySelector(".related-grid");
  if (!grid) return;

  const related = getRelatedProducts(product);
  const section = grid.closest("section");
  if (related.length === 0) {
    if (section) section.hidden = true;
    return;
  }

  // Giữ nguyên cấu trúc và class của thẻ liên quan trong HTML
  grid.innerHTML = related.map(function (item) {
    const name = escapeHtml(item.name);
    return `
    <article class="related-card">
      <div class="related-thumb">
        <img src="${escapeHtml(encodeURI(item.image))}" alt="${name}" loading="lazy">
      </div>
      <h3 class="related-name">${name}</h3>
      <p class="related-price">${formatPrice(item.price)}</p>
      <a href="${getProductDetailUrl(item.id)}" class="btn btn-secondary">Xem chi tiết</a>
    </article>`;
  }).join("");

  attachImageFallback(grid);
}

// Ảnh lỗi -> ảnh thay thế (sự kiện "error" không nổi bọt nên dùng capture)
function attachImageFallback(container) {
  container.addEventListener("error", function (event) {
    const img = event.target;
    if (img.tagName === "IMG" && img.src !== PLACEHOLDER_IMAGE) {
      img.src = PLACEHOLDER_IMAGE;
    }
  }, true);
}

/* ---------- 3. MÃ SẢN PHẨM KHÔNG TỒN TẠI ---------- */

function showProductNotFound(badId) {
  document.title = "Không tìm thấy sản phẩm | Owniverse";
  setText('.breadcrumb [aria-current="page"]', "Không tìm thấy sản phẩm");

  // Ẩn toàn bộ nội dung sản phẩm (breadcrumb + liên kết quay lại ở .page-top vẫn hiện)
  document.querySelectorAll("[data-product-content]").forEach(function (el) {
    el.hidden = true;
  });

  const box = document.createElement("section");
  box.className = "product-not-found";
  box.setAttribute("role", "alert");

  const title = document.createElement("h1");
  title.className = "product-not-found_title";
  title.textContent = "Không tìm thấy sản phẩm";

  const text = document.createElement("p");
  text.className = "product-not-found_text";
  if (badId) {
    text.append("Sản phẩm có mã “");
    const id = document.createElement("span");
    id.className = "product-not-found_id";
    id.textContent = badId;          // textContent: không chèn được mã HTML từ URL
    text.append(id, "” không tồn tại hoặc đã ngừng bán.");
  } else {
    text.textContent = "Sản phẩm bạn tìm không tồn tại hoặc đã ngừng bán.";
  }

  const back = document.createElement("a");
  back.className = "btn btn-primary product-not-found_link";
  back.href = PRODUCT_LIST_PAGE;
  back.textContent = "← Quay lại danh sách sản phẩm";

  box.append(title, text, back);

  const pageTop = document.querySelector(".page-top");
  if (pageTop) {
    pageTop.insertAdjacentElement("afterend", box);
  } else {
    const main = document.querySelector(".product-page");
    if (main) main.appendChild(box);
  }
}

/* ---------- 4. NÚT GIỎ HÀNG (giữ nguyên cách hoạt động cũ) ---------- */
// "Mua ngay": thêm vào giỏ rồi chuyển tới phần thanh toán của cart.html
// "Thêm vào giỏ hàng": chỉ thêm vào giỏ, ở lại trang và hiện thông báo
// Nút này dùng data-detail-action="add" (KHÔNG dùng data-add-to-cart) vì cart-store.js
// đã bắt sự kiện data-add-to-cart ở toàn trang -> dùng chung sẽ thêm hai lần.
function bindCartButtons(form, product) {
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

  // "Mua ngay" (nút submit, cũng là phím Enter trong ô số lượng)
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    buyNow(product.id, readQuantity());
  });

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      const qty = readQuantity();
      if (addToCart(product.id, qty)) {
        showToast("Đã thêm " + qty + " “" + product.name + "” vào giỏ hàng");
      }
    });
  }
}