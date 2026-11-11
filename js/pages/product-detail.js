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
  setupProductTabs(product);
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


function setupProductTabs(product) {
  const tabs = Array.from(document.querySelectorAll(".product-tab[role='tab']"));
  const panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  });

  if (tabs.length !== 2 || panels.some(function (panel) { return !panel; })) {
    console.error("Product tabs could not initialize: tab buttons or panels are missing.");
    return;
  }

  function activateTab(selectedTab, moveFocus) {
    tabs.forEach(function (tab, index) {
      const selected = tab === selectedTab;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });

    if (moveFocus) selectedTab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activateTab(tab, false);
    });

    tab.addEventListener("keydown", function (event) {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  setupProductReviews(product);
}


const DEMO_PRODUCT_REVIEWS = [
  {
    name: "Minh Anh",
    rating: 5,
    text: "Sản phẩm đẹp và chỉn chu, đóng gói cẩn thận. Mình rất hài lòng với trải nghiệm lần này.",
    date: "Đánh giá mẫu"
  },
  {
    name: "Ngọc Hà",
    rating: 5,
    text: "Chất lượng tốt, đúng như phần giới thiệu. Sẽ tiếp tục ủng hộ Owniverse.",
    date: "Đánh giá mẫu"
  },
  {
    name: "Thanh Vy",
    rating: 4,
    text: "Thiết kế rất đẹp, sản phẩm được bảo vệ kỹ khi giao. Trải nghiệm mua hàng khá tốt.",
    date: "Đánh giá mẫu"
  }
];


function setupProductReviews(product) {
  const summary = document.querySelector(".reviews-summary");
  const reviewList = document.getElementById("review-list");
  const filter = document.getElementById("reviews-filter");
  const formWrap = document.getElementById("review-form-wrap");
  const form = document.getElementById("review-form");
  const writeButton = document.getElementById("reviews-write-button");
  const cancelButton = document.getElementById("review-cancel-button");
  const status = document.getElementById("review-form-status");
  const ratingFieldset = document.querySelector(".review-rating-fieldset");

  if (
    !summary || !reviewList || !filter || !formWrap ||
    !(form instanceof HTMLFormElement) || !writeButton || !cancelButton || !status ||
    !(ratingFieldset instanceof HTMLFieldSetElement)
  ) {
    console.error("Product reviews could not initialize: required review elements are missing.");
    return;
  }

  const storageKey = "owniverse.product.reviews." + String(product.id);
  const userReviews = readUserReviews(storageKey);

  function allReviews() {
    return userReviews.concat(DEMO_PRODUCT_REVIEWS);
  }

  function renderSummary(reviews) {
    const total = reviews.length;
    const average = total
      ? reviews.reduce(function (sum, review) { return sum + review.rating; }, 0) / total
      : 0;
    const ratingRows = [5, 4, 3, 2, 1].map(function (rating) {
      const count = reviews.filter(function (review) { return review.rating === rating; }).length;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return `
        <div class="rating-breakdown-row">
          <span>${rating} sao</span>
          <span class="rating-breakdown-track" aria-hidden="true"><span style="width:${percent}%"></span></span>
          <span>${count}</span>
        </div>`;
    }).join("");

    summary.innerHTML = `
      <div class="reviews-score">
        <strong>${average.toFixed(1)}</strong>
        <span class="review-stars" aria-label="Trung bình ${average.toFixed(1)} trên 5 sao">${renderStars(Math.round(average))}</span>
        <span>${total} đánh giá</span>
      </div>
      <div class="rating-breakdown" aria-label="Phân bố số sao">${ratingRows}</div>`;
  }

  function renderList() {
    const reviews = allReviews();
    const selectedRating = filter.value;
    const visibleReviews = selectedRating === "all"
      ? reviews
      : reviews.filter(function (review) {
        return review.rating === Number(selectedRating);
      });

    renderSummary(reviews);

    if (!visibleReviews.length) {
      reviewList.innerHTML = '<p class="reviews-empty">Chưa có đánh giá ở mức sao này.</p>';
      return;
    }

    reviewList.innerHTML = visibleReviews.map(function (review) {
      return `
        <article class="review-card">
          <div class="review-card-heading">
            <div class="review-author">
              <span class="review-avatar" aria-hidden="true">${escapeHtml(getReviewInitials(review.name))}</span>
              <div><h3>${escapeHtml(review.name)}</h3><span>${escapeHtml(review.date)}</span></div>
            </div>
            <span class="review-card-stars" aria-label="${review.rating} trên 5 sao">${renderStars(review.rating)}</span>
          </div>
          <p>${escapeHtml(review.text)}</p>
        </article>`;
    }).join("");
  }

  writeButton.addEventListener("click", function () {
    const opening = formWrap.hidden;
    formWrap.hidden = !opening;
    writeButton.setAttribute("aria-expanded", String(opening));
    if (opening) form.querySelector("#reviewer-name").focus();
    else status.hidden = true;
  });

  cancelButton.addEventListener("click", function () {
    form.reset();
    ratingFieldset.removeAttribute("data-rating");
    formWrap.hidden = true;
    writeButton.setAttribute("aria-expanded", "false");
    status.hidden = true;
    writeButton.focus();
  });

  ratingFieldset.addEventListener("change", function (event) {
    if (event.target instanceof HTMLInputElement && event.target.name === "rating") {
      ratingFieldset.dataset.rating = event.target.value;
    }
  });

  filter.addEventListener("change", renderList);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const text = String(formData.get("review") || "").trim();
    const rating = Number(formData.get("rating"));
    if (!name || !text || rating < 1 || rating > 5) {
      status.textContent = "Vui lòng nhập tên, nội dung và chọn số sao hợp lệ.";
      status.hidden = false;
      return;
    }

    const review = {
      name: name,
      text: text,
      rating: rating,
      date: new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date())
    };

    try {
      userReviews.unshift(review);
      localStorage.setItem(storageKey, JSON.stringify(userReviews));
    } catch (error) {
      userReviews.shift();
      console.error("Unable to save the product review to local storage.", error);
      status.textContent = "Không thể lưu đánh giá trên trình duyệt này. Vui lòng thử lại.";
      status.hidden = false;
      return;
    }

    form.reset();
    ratingFieldset.removeAttribute("data-rating");
    formWrap.hidden = true;
    writeButton.setAttribute("aria-expanded", "false");
    filter.value = "all";
    renderList();
    reviewList.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderList();
}


function readUserReviews(storageKey) {
  try {
    const savedReviews = localStorage.getItem(storageKey);
    if (!savedReviews) return [];

    const parsedReviews = JSON.parse(savedReviews);
    if (!Array.isArray(parsedReviews) || parsedReviews.some(function (review) {
      return !review ||
        typeof review.name !== "string" ||
        typeof review.text !== "string" ||
        typeof review.date !== "string" ||
        !Number.isInteger(review.rating) ||
        review.rating < 1 ||
        review.rating > 5;
    })) {
      throw new TypeError("Saved product reviews have an invalid format.");
    }

    return parsedReviews;
  } catch (error) {
    console.error("Unable to load saved product reviews.", error);
    return [];
  }
}


function getReviewInitials(name) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map(function (part) { return part[0]; }).join("").toLocaleUpperCase("vi");
}


function renderStars(rating) {
  return "★".repeat(Math.max(0, Math.min(5, rating))) +
    "☆".repeat(Math.max(0, 5 - rating));
}


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
