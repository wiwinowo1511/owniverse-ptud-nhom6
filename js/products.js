
/* ---------- 1. DỮ LIỆU SẢN PHẨM ----------
   Thêm sản phẩm mới: sao chép một khối { ... } bên dưới,
   đổi id (không được trùng) và chỉnh các thuộc tính.
   category dùng cùng giá trị với bộ lọc trong products.html
   (ví dụ: "ao-thun", "ao-khoac", "tui-tote", "sticker", "moc-khoa", "album"). */
const PRODUCTS = [
  {
    id: 1,
    name: "Áo thun Signature của Kairo",
    price: 650000,
    category: "ao-thun",
    image: "images/products/Kairo-ao-thun-01.jpg",
    artist: "Kairo",
    description: "Áo thun cotton 100% form rộng, in logo Signature của Kairo ở mặt trước. Chất vải dày dặn, thoáng mát, phù hợp mặc hằng ngày hoặc đi concert."
  },
  {
    id: 2,
    name: "Album After Dark - Rhea",
    price: 499000,
    category: "album",
    image: "images/products/rhea-album-01.png",
    artist: "Rhea",
    description: "Album After Dark của Rhea phiên bản vật lý, kèm photobook, poster và photocard ngẫu nhiên. Số lượng có hạn."
  },
  {
    id: 3,
    name: "Sticker họa tiết của Mira",
    price: 80000,
    category: "sticker",
    image: "images/products/Mira-sticker-01.jpg",
    artist: "Mira",
    description: "Bộ sticker họa tiết do Mira thiết kế, chất liệu vinyl chống nước, dán được lên laptop, sổ tay và bình nước."
  },
  {
    id: 4,
    name: "Hoodie Signature của Kairo",
    price: 900000,
    category: "ao-khoac",
    image: "images/products/Kairo-Hoodie-01.jpg",
    artist: "Kairo",
    description: "Hoodie nỉ bông dày, mũ hai lớp, logo Signature thêu ở ngực. Giữ ấm tốt, form oversize dễ phối đồ."
  },
  {
    id: 5,
    name: "Áo thun Vanta Club",
    price: 600000,
    category: "ao-thun",
    image: "images/products/rhea-ao-thun-01.png",
    artist: "Rhea",
    description: "Áo thun Vanta Club của Rhea với họa tiết in kỹ thuật cao, bền màu sau nhiều lần giặt. Chất cotton mềm, thấm hút tốt."
  },
  {
    id: 6,
    name: "Móc khóa Acrylic của Mira",
    price: 100000,
    category: "moc-khoa",
    image: "images/products/Mira-moc-khoa-01.jpg",
    artist: "Mira",
    description: "Móc khóa acrylic trong suốt in hình Mira hai mặt, kèm khoen kim loại chắc chắn. Nhỏ gọn, dễ treo lên túi hoặc chùm chìa khóa."
  },
  {
    id: 7,
    name: "Túi tote Signature của Kairo",
    price: 250000,
    category: "tui-tote",
    image: "images/products/Kairo-tui-tote-01.jpg",
    artist: "Kairo",
    description: "Túi tote canvas dày in logo Signature, có túi nhỏ bên trong và quai đeo vai thoải mái. Phù hợp đi học, đi làm và đi chơi."
  },
  {
    id: 8,
    name: "Album Beyond the Star - Mira",
    price: 499000,
    category: "album",
    image: "images/products/mira-album-01.png",
    artist: "Mira",
    description: "Album Beyond the Star của Mira phiên bản vật lý, gồm đĩa, photobook và thẻ ảnh. Thiết kế bìa độc quyền của Owniverse."
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

// Tạo HTML cho một thẻ sản phẩm (giữ nguyên cấu trúc và class hiện tại)
function createProductCardHtml(product) {
  const name = escapeHtml(product.name);
  return `
    <li class="products-grid_item">
      <article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="product-card_media">
          <img class="product-card_img" src="${escapeHtml(encodeURI(product.image))}" alt="${name}" loading="lazy">
        </div>
        <div class="product-card_body">
          <h3 class="product-card_title">${name}</h3>
          <p class="product-card_artist">Nghệ sĩ: ${escapeHtml(product.artist)}</p>
          <p class="product-card_price">${formatPrice(product.price)}</p>
          <a class="product-card_btn" href="${getProductDetailUrl(product.id)}">Xem chi tiết</a>
        </div>
      </article>
    </li>`;
}

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

/* ---------- 4. KHỞI TẠO ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector(".products-grid");
  if (!grid) return; // Trang khác chỉ dùng dữ liệu thì không render

  grid.addEventListener("error", handleProductImageError, true);
  renderProducts(PRODUCTS);
});