/* ---------- 1. DỮ LIỆU SẢN PHẨM ----------
   Thêm sản phẩm mới: sao chép một khối { ... } bên dưới,
   đổi id (không được trùng) và chỉnh các thuộc tính.
   category dùng cùng giá trị với bộ lọc trong products.html
   (ví dụ: "ao-thun", "ao-khoac", "tui-tote", "sticker", "moc-khoa", "album").
   Trường tùy chọn cho trang chi tiết (xem sản phẩm id: 2):
     images: [tối đa 4 đường dẫn ảnh], specs: [{ label, value }], intro: "đoạn giới thiệu", quote: "câu trích dẫn".
   Thiếu trường nào thì trang chi tiết tự bỏ qua/dùng image và description. */
const PRODUCTS = [
 {
  id: 1,
  name: "Áo thun Signature của Kairo",
  price: 450000,
  category: "ao-thun",
  image: "images/products/Kairo-ao-thun-01.jpg",
  artist: "Kairo",
  description: "Áo thun cotton dày dặn, form oversize, thiết kế logo Signature đường chỉ nổi hiện đại.",
  images: [                      // tối đa 4 ảnh, ảnh đầu là ảnh lớn mặc định
    "images/products/Kairo-ao-thun-01.jpg",
    "images/products/Kairo-ao-thun-02.png",
    "images/products/Kairo-ao-thun-03.png",
    "images/products/Kairo-ao-thun-04.png"
  ],
  specs: [                       // bảng "Thông tin sản phẩm"
    { label: "Chất liệu", value: "Cotton 100%, dày dặn." },
    { label: "Kích thước", value: "S / M / L / XL, form rộng." }
  ],
  intro: "Chưa cóa, đang làm...",
      quote: "Khồng biết để gì..."
},
  {
    id: 2,
    name: "Album After Dark - Rhea",
    price: 549000,
    category: "album",
    image: "images/products/rhea-album-01.png",
    artist: "Rhea",
    description: "Album After Dark của Rhea phiên bản vật lý, kèm photobook, poster và photocard ngẫu nhiên. Số lượng có hạn.",
    images: [
      "images/products/rhea-album-01.png",
      "images/products/rhea-album-02.png",
      "images/products/rhea-album-03.png",
      "images/products/rhea-album-04.png"
    ],
    quote: "Welcome to my dark side - No rules, just Rhea",
    specs: [
      { label: "Photobook", value: "01 cuốn (104 trang, khổ 210 x 297 mm, in màu trên giấy mỹ thuật cán mờ)." },
      { label: "CD-R", value: "01 đĩa thiết kế họa tiết gai nhọn độc quyền, đi kèm phong bì đen." },
      { label: "Lyric Book", value: "01 cuốn sổ lời bài hát phong cách collage (16 trang, khổ 120 x 165 mm)." },
      { label: "Folded Poster", value: "01 poster khổ lớn gấp sẵn bên trong album (420 x 594 mm)." },
      { label: "Postcard", value: "Ngẫu nhiên 01 trên 04 mẫu (100 x 150 mm)." },
      { label: "Photo Card", value: "Ngẫu nhiên 02 trên 08 mẫu bo góc, mặt sau có chữ ký in của nghệ sĩ (55 x 85 mm)." },
      { label: "Sticker Pack", value: "01 túi gồm 09 hình dán die-cut (hoa hồng đỏ, trái tim gai, đôi môi, chữ ký và logo RHEA)." },
      { label: "Film Strip", value: "01 dải phim nhựa 4 khung hình ghi lại khoảnh khắc biểu diễn trên sân khấu (50 x 150 mm)." }
    ],
    intro: "[AFTERDARK] (Vol.01) là ấn phẩm album chính hãng đầu tay của nghệ sĩ Mira dưới nghệ danh Rhea, đánh dấu màn lột xác táo bạo với concept đỏ - đen ma mị lấy cảm hứng từ hình ảnh đóa hồng có gai cùng tuyên ngôn cá tính “Welcome to my dark side - No rules, just Rhea”. Được chăm chút theo phong cách scrapbook rách bụi đậm chất rock-chic, trọn bộ sản phẩm bao gồm: 01 Photobook, 01 đĩa CD-R, 01 Lyric Book, 01 Folded Poster, 01 Postcard (ngẫu nhiên 1/4 mẫu), 02 Photo Card có chữ ký ở mặt sau (ngẫu nhiên 2/8 mẫu), 01 túi sticker và 01 dải nhựa filmstrip ghi lại những khoảnh khắc biểu diễn cuốn hút nhất của Rhea. Sản phẩm được phân phối chính hãng tại OWNIVERSE với quy trình đóng gói cẩn thận và chính sách hỗ trợ đổi trả nhanh chóng cho người hâm mộ."
  },
  {
    id: 3,
    name: "Sticker họa tiết của Mira",
    price: 80000,
    category: "sticker",
    image: "images/products/Mira-sticker-01.jpg",
    artist: "Mira",
    description: "Bộ sticker họa tiết do Mira thiết kế, chất liệu vinyl chống nước, dán được lên laptop, sổ tay và bình nước.",
    images: [                      // tối đa 4 ảnh, ảnh đầu là ảnh lớn mặc định
      "images/products/Mira-sticker-01.jpg",
      "images/products/Mira-sticker-02.png",
      "images/products/Mira-sticker-03.png",
      "images/products/Mira-sticker-04.png"
    ],
    specs: [                       // bảng "Thông tin sản phẩm"
      { label: "Chất liệu", value: "Giấy vinyl chống nước, bề mặt in sắc nét" },
      { label: "Số lượng", value: "Bộ gồm 5 sticker, mỗi sticker có kích thước 7x7 cm" }
    ],
    intro: "Chưa cóa, đang làm...",
    quote: "Khồng biết để gì..."
  },
  {
    id: 4,
    name: "Hoodie Signature của Kairo",
    price: 900000,
    category: "ao-khoac",
    image: "images/products/Kairo-Hoodie-01.jpg",
    artist: "Kairo",
    description: "Hoodie nỉ bông dày, mũ hai lớp, logo Signature thêu ở ngực. Giữ ấm tốt, form oversize dễ phối đồ.",
    images: [                      // tối đa 4 ảnh, ảnh đầu là ảnh lớn mặc định
      "images/products/Kairo-Hoodie-01.jpg",
      "images/products/Kairo-Hoodie-02.png",
      "images/products/Kairo-Hoodie-03.png",
      "images/products/Kairo-Hoodie-04.png"
    ],
    specs: [                       // bảng "Thông tin sản phẩm"
    { label: "Chất liệu", value: "Cotton 100%, dày dặn." },
    { label: "Kích thước", value: "S / M / L / XL, form rộng." }
    ],
    intro: "Chưa cóa, đang làm...",
    quote: "Khồng biết để gì..."
  },
  {
    id: 5,
    name: "Áo thun Vanta Club",
    price: 600000,
    category: "ao-thun",
    image: "images/products/rhea-ao-thun-01.png",
    artist: "Rhea",
    description: "Áo thun Vanta Club của Rhea với họa tiết in kỹ thuật cao, bền màu sau nhiều lần giặt. Chất cotton mềm, thấm hút tốt.",
    images: [                      // tối đa 4 ảnh, ảnh đầu là ảnh lớn mặc định
      "images/products/rhea-ao-thun-01.png",
      "images/products/rhea-ao-thun-02.png",
      "images/products/rhea-ao-thun-03.png",
      "images/products/rhea-ao-thun-04.png"
    ],
    specs: [                       // bảng "Thông tin sản phẩm"
    { label: "Chất liệu", value: "Cotton 100%, dày dặn." },
    { label: "Kích thước", value: "S / M / L / XL, form rộng." }
    ],
    intro: "Chưa cóa, đang làm...",
    quote: "Khồng biết để gì..."
  },
  {
    id: 6,
    name: "Móc khóa Acrylic của Mira",
    price: 100000,
    category: "moc-khoa",
    image: "images/products/Mira-moc-khoa-01.jpg",
    artist: "Mira",
    description: "Móc khóa acrylic trong suốt in hình Mira hai mặt, kèm khoen kim loại chắc chắn. Nhỏ gọn, dễ treo lên túi hoặc chùm chìa khóa.",
    images: [                      // tối đa 4 ảnh, ảnh đầu là ảnh lớn mặc định
      "images/products/Mira-moc-khoa-01.jpg",
      "images/products/Mira-moc-khoa-02.png",
      "images/products/Mira-moc-khoa-03.png",
      "images/products/Mira-moc-khoa-04.png"
    ],
    specs: [                       // bảng "Thông tin sản phẩm"
      { label: "Chất liệu", value: "Nhựa mica cao cấp, in 2 mặt rõ nét, chống bong tróc." },
      { label: "Kích thước", value: "10cm, bao gồm khoen móc khóa bằng kim loại không gỉ" }
    ],
    intro: "Chưa cóa, đang làm...",
    quote: "Khồng biết để gì..."
  },
  {
    id: 7,
    name: "Túi tote Signature của Kairo",
    price: 250000,
    category: "tui-tote",
    image: "images/products/Kairo-tui-tote-01.png",
    artist: "Kairo",
    description: "Túi tote canvas dày in logo Signature, có túi nhỏ bên trong và quai đeo vai thoải mái. Phù hợp đi học, đi làm và đi chơi.",
    images: [                      // tối đa 4 ảnh, ảnh đầu là ảnh lớn mặc định
      "images/products/Kairo-tui-tote-01.png",
      "images/products/Kairo-tui-tote-02.png",
      "images/products/Kairo-tui-tote-03.png",
      "images/products/Kairo-tui-tote-04.png"
    ],
    specs: [                       // bảng "Thông tin sản phẩm"
      { label: "Chất liệu", value: "Canvas dày, bền màu, dễ giặt." },
      { label: "Kích thước", value: "38 x 42 cm, quai đeo vai 25 cm." }
    ],
    intro: "Chưa cóa, đang làm...",
    quote: "Khồng biết để gì..."
  },
  {
    id: 8,
    name: "Album Beyond the Star - Mira",
    price: 499000,
    category: "album",
    image: "images/products/mira-album-01.png",
    artist: "Mira",
    description: "Album Beyond the Star của Mira phiên bản vật lý, gồm đĩa, photobook và thẻ ảnh. Thiết kế bìa độc quyền của Owniverse.",
    images: [                      // tối đa 4 ảnh, ảnh đầu là ảnh lớn mặc định
      "images/products/mira-album-01.png",
      "images/products/mira-album-02.png",
      "images/products/mira-album-03.png",
      "images/products/mira-album-04.png"
    ],
    specs: [                       // bảng "Thông tin sản phẩm"
      { label: "Chất liệu", value: "Bìa carton cứng, in kỹ thuật số cao cấp, đĩa kèm photobook và thẻ ảnh." },
      { label: "Kích thước", value: "Standard album 12 x 12 cm, gồm 1 đĩa và photobook." }
    ],
    intro: "Chưa cóa, đang làm...",
    quote: "Khồng biết để gì..."
  }
];




/* ---------- 2. HÀM DÙNG CHUNG ---------- */




// Trang chi tiết sản phẩm; id được truyền qua URL: product-detail.html?id=1
const PRODUCT_DETAIL_PAGE = "product-detail.html";




// Ảnh thay thế (SVG nhúng sẵn, không cần thêm file) khi ảnh gốc bị lỗi
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
      '<rect width="400" height="400" fill="#F2F3F5"/>' +
      '<text x="200" y="205" font-family="Arial, sans-serif" font-size="18" fill="#6B7280" text-anchor="middle">Không tải được ảnh</text>' +
    "</svg>"
  );




const priceFormatter = new Intl.NumberFormat("vi-VN");




// Định dạng giá: 650000 -> "650.000đ"
function formatPrice(price) {
  return priceFormatter.format(price) + "đ";
}




// Tìm sản phẩm theo id (chấp nhận id dạng số hoặc chuỗi từ URL)
function getProductById(id) {
  return PRODUCTS.find(function (product) {
    return String(product.id) === String(id);
  }) || null;
}




// Tạo đường dẫn tới trang chi tiết kèm id
function getProductDetailUrl(id) {
  return PRODUCT_DETAIL_PAGE + "?id=" + encodeURIComponent(id);
}




// Chống chèn mã HTML khi đưa dữ liệu vào template
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}




/* ---------- 3. HIỂN THỊ SẢN PHẨM ---------- */
/* ---------- 3.1. TÌM KIẾM, LỌC VÀ SẮP XẾP ---------- */


// Chuẩn hóa chữ để tìm kiếm không phân biệt chữ hoa, chữ thường và dấu tiếng Việt
function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}




// Kiểm tra danh mục cha và danh mục con
function productMatchesCategory(product, selectedCategories) {
  if (selectedCategories.length === 0) return true;


  const categoryGroups = {
    "ao": ["ao-thun", "ao-khoac"],
    "quan": ["quan-dai", "quan-short"],
    "phu-kien": ["day-deo", "moc-khoa", "card", "phone-case", "pin-cai", "sticker"],
    "tui": ["tui-tote", "tui-deo-cheo"]
  };


  return selectedCategories.some(function (category) {
    if (category === product.category) return true;


    return categoryGroups[category]?.includes(product.category) || false;
  });
}




// Kiểm tra khoảng giá
function productMatchesPrice(product, selectedPrices) {
  if (selectedPrices.length === 0) return true;


  return selectedPrices.some(function (range) {
    switch (range) {
      case "duoi-300":
        return product.price < 300000;


      case "300-500":
        return product.price >= 300000 && product.price <= 500000;


      case "500-1000":
        return product.price > 500000 && product.price <= 1000000;


      case "tren-1000":
        return product.price > 1000000;


      default:
        return false;
    }
  });
}




// Lấy danh sách sản phẩm sau khi tìm kiếm, lọc và sắp xếp
function getFilteredProducts() {
  const searchInput = document.querySelector("#product-search");


  const keyword = normalizeText(searchInput?.value || "");


  const selectedArtists = Array.from(
    document.querySelectorAll('input[name="artist"]:checked')
  ).map(input => input.value.toLowerCase());


  const selectedCategories = Array.from(
    document.querySelectorAll('input[name="category"]:checked')
  ).map(input => input.value);


  const selectedPrices = Array.from(
    document.querySelectorAll('input[name="price"]:checked')
  ).map(input => input.value);


  const sortValue = document.querySelector(".products-toolbar_select")?.value || "popular";


  // Tìm kiếm và lọc sản phẩm
  let result = PRODUCTS.filter(function (product) {
    const searchable = normalizeText(product.name + " " + product.artist);
    const matchesKeyword =
      !keyword ||
      keyword.split(/\s+/).every(function (word) {
        return searchable.includes(word);
      });


    const matchesArtist =
      selectedArtists.length === 0 ||
      selectedArtists.includes(product.artist.toLowerCase());


    const matchesCategory =
      productMatchesCategory(product, selectedCategories);


    const matchesPrice =
      productMatchesPrice(product, selectedPrices);


    return (
      matchesKeyword &&
      matchesArtist &&
      matchesCategory &&
      matchesPrice
    );
  });


  // Sắp xếp sản phẩm theo giá
  if (sortValue === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  }


  return result;
}




// Cập nhật danh sách sản phẩm sau mỗi thao tác
function updateProductList() {
  const filteredProducts = getFilteredProducts();
  renderProducts(filteredProducts);
}


// Số lượng sản phẩm này đang có trong giỏ (0 nếu chưa có hoặc chưa nạp cart-store.js)
function getInCartQuantity(id) {
  return typeof getCartQuantity === "function" ? getCartQuantity(id) : 0;
}


// Tạo HTML cho một thẻ sản phẩm (giữ nguyên cấu trúc và class hiện tại)
function createProductCardHtml(product) {
  const name = escapeHtml(product.name);
  const id = escapeHtml(product.id);
  const inCart = getInCartQuantity(product.id);
  return `
    <li class="products-grid_item">
      <article class="product-card${inCart ? " is-in-cart" : ""}" data-product-id="${id}">
        <div class="product-card_media">
          <img class="product-card_img" src="${escapeHtml(encodeURI(product.image))}" alt="${name}" loading="lazy">
        </div>
        <div class="product-card_body">
          <h3 class="product-card_title">${name}</h3>
          <p class="product-card_artist">Nghệ sĩ: ${escapeHtml(product.artist)}</p>
          <p class="product-card_price">${formatPrice(product.price)}</p>
          <div class="product-card_actions">
            <button type="button" class="product-card_btn product-card_btn--add" data-add-to-cart="${id}" aria-label="Thêm ${name} vào giỏ hàng">Thêm vào giỏ</button>
            <button type="button" class="product-card_btn product-card_btn--remove" data-remove-from-cart="${id}" aria-label="Bỏ ${name} khỏi giỏ hàng"${inCart ? "" : " hidden"}>Bỏ khỏi giỏ (${inCart})</button>
            <a class="product-card_btn" href="${getProductDetailUrl(product.id)}">Xem chi tiết</a>
          </div>
        </div>
      </article>
    </li>`;
}


// Cập nhật nút "Bỏ khỏi giỏ" trên các thẻ đang hiển thị (không vẽ lại cả danh sách)
function syncCartButtons() {
  document.querySelectorAll(".product-card[data-product-id]").forEach(function (card) {
    const qty = getInCartQuantity(card.dataset.productId);
    const removeBtn = card.querySelector("[data-remove-from-cart]");
    card.classList.toggle("is-in-cart", qty > 0);
    if (!removeBtn) return;
    removeBtn.hidden = qty === 0;
    removeBtn.textContent = "Bỏ khỏi giỏ (" + qty + ")";
  });
}
document.addEventListener("cart:change", syncCartButtons);




// Hiển thị danh sách sản phẩm vào .products-grid
function renderProducts(list) {
  const grid = document.querySelector(".products-grid");
  if (!grid) return;




  const countElement = document.querySelector(".products-toolbar_count");
  const products = Array.isArray(list) ? list : [];




  if (countElement) {
    countElement.textContent = "Hiển thị " + products.length + " sản phẩm";
  }




  if (products.length === 0) {
    grid.innerHTML = `
      <li class="products-grid_item" style="grid-column: 1 / -1; justify-content: center;">
        <p role="status">Hiện chưa có sản phẩm nào phù hợp.</p>
      </li>`;
    return;
  }




  grid.innerHTML = products.map(createProductCardHtml).join("");
}




// Ảnh lỗi: thay bằng ảnh thay thế (sự kiện "error" không nổi bọt nên dùng capture)
function handleProductImageError(event) {
  const img = event.target;
  if (img.tagName === "IMG" && img.classList.contains("product-card_img") && img.src !== PLACEHOLDER_IMAGE) {
    img.src = PLACEHOLDER_IMAGE;
    img.alt = "Không tải được ảnh sản phẩm";
  }
}


/* ---------- 3.2. TÌM KIẾM TRÊN HEADER VÀ SỰ KIỆN LỌC ---------- */


function initHeaderSearch() {
  const toggle = document.querySelector("#search-toggle");
  const panel = document.querySelector("#search-panel");
  const form = document.querySelector("#search-form");
  const input = document.querySelector("#product-search");
  const closeBtn = document.querySelector(".search-close");
  if (!toggle || !panel || !form || !input) return;


  const onProductsPage = !!document.querySelector(".products-grid");


  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  }


  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }


  toggle.addEventListener("click", function () {
    panel.hidden ? openPanel() : closePanel();
  });


  if (closeBtn) closeBtn.addEventListener("click", closePanel);


  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
      toggle.focus();
    }
  });


  // Đọc từ khóa từ URL (products.html?q=...)
  const query = new URLSearchParams(window.location.search).get("q");
  if (query) {
    input.value = query;
    openPanel();
  }


  // Trang khác: để form tự chuyển sang products.html?q=...
  if (!onProductsPage) return;


  // Trang sản phẩm: lọc ngay khi gõ
  input.addEventListener("input", updateProductList);


  form.addEventListener("submit", function (event) {
    event.preventDefault();
    updateProductList();


    const url = new URL(window.location.href);
    const keyword = input.value.trim();
    if (keyword) {
      url.searchParams.set("q", keyword);
    } else {
      url.searchParams.delete("q");
    }
    history.replaceState(null, "", url);
  });
}


// Bộ lọc chỉ chạy khi bấm "ÁP DỤNG"; sắp xếp thì vẫn đổi ngay khi chọn
function initProductFilters() {
  const filterBox = document.querySelector(".products-filter");
  const filterToggle = document.querySelector(".products-filter_toggle");
  const filterForm = document.querySelector(".products-filter_form");
  const sortSelect = document.querySelector(".products-toolbar_select");


  // Màn hình hẹp: nút bật/tắt bộ lọc (nút này chỉ hiện khi <= 991px, xem products.css)
  function isToggleVisible() {
    return !!filterToggle && getComputedStyle(filterToggle).display !== "none";
  }


  function setFilterOpen(open) {
    if (!filterBox || !filterToggle) return;
    filterBox.classList.toggle("is-open", open);
    filterToggle.setAttribute("aria-expanded", String(open));
  }


  if (filterToggle) {
    filterToggle.addEventListener("click", function () {
      setFilterOpen(!filterBox.classList.contains("is-open"));
    });
  }


  if (filterForm) {
    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      updateProductList();


      // Điện thoại/tablet: áp dụng xong thì thu gọn bộ lọc và đưa người dùng tới kết quả
      if (isToggleVisible()) {
        setFilterOpen(false);
        const toolbar = document.querySelector(".products-toolbar");
        if (toolbar) toolbar.scrollIntoView({ block: "start" });
      }
    });
  }


  if (sortSelect) sortSelect.addEventListener("change", updateProductList);
}
/* ---------- 4. KHỞI TẠO ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initHeaderSearch(); // chạy trước để điền từ khóa từ URL


  const grid = document.querySelector(".products-grid");
  if (!grid) return; // Trang khác chỉ dùng dữ liệu thì không render


  grid.addEventListener("error", handleProductImageError, true);
  initProductFilters();
  updateProductList(); // thay cho renderProducts(PRODUCTS)
});

