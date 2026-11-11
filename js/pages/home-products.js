document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector("[data-featured-products]");
  if (!grid) return;

  const featuredIds = [6, 1, 2];
  const featuredProducts = featuredIds
    .map(function (id) {
      return getProductById(id);
    })
    .filter(Boolean);

  grid.innerHTML = featuredProducts.map(function (product) {
    const name = escapeHtml(product.name);
    const detailUrl = getProductDetailUrl(product.id);
    return `
      <article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <a href="${detailUrl}" aria-label="Xem chi tiết ${name}">
          <img class="product-card_image" src="${escapeHtml(encodeURI(product.image))}"
               alt="${name}" loading="lazy">
        </a>
        <div class="product-card_body">
          <h3 class="product-card_title">${name}</h3>
          <p class="product-card_artist">Nghệ sĩ: ${escapeHtml(product.artist)}</p>
          <p class="product-card_price">${formatPrice(product.price)}</p>
          <a href="${detailUrl}" class="btn btn--secondary product-card_button">Xem chi tiết</a>
        </div>
      </article>`;
  }).join("");
});
