/* =====================================================
   ARTIST LIST - OWNIVERSE (trang artist.html)
   Danh sách nghệ sĩ lấy từ API:  GET /api/artists
   Cần nạp js/auth/auth.js trước file này (để dùng apiRequest).
   ===================================================== */
(function () {
  const input = document.querySelector("#artist-search");
  const form = document.querySelector(".search-bar");
  const grid = document.querySelector("#artist-grid");
  const emptyMsg = document.querySelector("#artist-empty");
  if (!input || !form || !grid) return;

  const NO_MATCH_TEXT = "Không tìm thấy nghệ sĩ nào phù hợp.";

  /* ---------- Biểu tượng (SVG) ---------- */
  const ICONS = {
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.6 9.5.6 9.5.6s7.6 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.4 3.6-6.4 3.6z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.6-.1 4.9-.1zm0-2.2C8.7 0 8.3 0 7 .1 5.7.1 4.8.3 4.1.6c-.8.3-1.5.7-2.2 1.4C1.2 2.7.8 3.4.5 4.1c-.3.8-.5 1.6-.5 2.9C0 8.3 0 8.7 0 12s0 3.7.1 5c.1 1.3.3 2.1.6 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.1-.3 2.9-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.6-2.9.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.1-.6-2.9-.3-.8-.7-1.5-1.4-2.2C21.3 1.2 20.6.8 19.9.5c-.8-.3-1.6-.5-2.9-.6C15.7 0 15.3 0 12 0zm0 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2-2.8-6.2-6.2-6.2zm0 10.2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6.4-11.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 6.7c-1.5-.3-2.7-1.4-3.1-2.9-.1-.5-.2-1-.2-1.5h-3.4v13.2c0 1.6-1.3 2.9-2.9 2.9-1.6 0-2.9-1.3-2.9-2.9 0-1.6 1.3-2.9 2.9-2.9.3 0 .6 0 .9.1V9.3c-.3 0-.6-.1-.9-.1-3.5 0-6.3 2.8-6.3 6.3S6.5 21.8 10 21.8s6.3-2.8 6.3-6.3V9.4c1.3.9 2.9 1.5 4.6 1.5V7.5c-.4 0-.9-.1-1.3-.8z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
  };

  const SOCIALS = [
    { key: "youtube", label: "YouTube" },
    { key: "instagram", label: "Instagram" },
    { key: "tiktok", label: "TikTok" }
  ];

  /* ---------- Tạo thẻ nghệ sĩ từ dữ liệu API ---------- */
  function createArtistCard(artist) {
    const card = document.createElement("article");
    card.className = "artist-card";

    // Ảnh
    const photoWrap = document.createElement("div");
    photoWrap.className = "artist-photo";
    const photo = document.createElement("img");
    photo.src = artist.photo || artist.avatar || "";
    photo.alt = "Ảnh nghệ sĩ " + artist.name;
    photoWrap.appendChild(photo);

    // Nội dung
    const body = document.createElement("div");
    body.className = "artist-body";

    const name = document.createElement("h2");
    name.className = "artist-name";
    name.textContent = artist.name;

    const desc = document.createElement("p");
    desc.className = "artist-desc";
    desc.textContent = artist.summary || artist.description || "";

    // Mạng xã hội (chưa có link thì hiện mờ, giống trang chi tiết)
    const socials = document.createElement("div");
    socials.className = "artist-socials";
    socials.setAttribute("aria-label", "Liên kết mạng xã hội của " + artist.name);

    SOCIALS.forEach(function (network) {
      const url = (artist.social && artist.social[network.key]) || "";
      const item = document.createElement("a");
      item.className = "social-item";
      item.innerHTML = ICONS[network.key];
      item.appendChild(document.createTextNode(network.label));

      if (url.trim() !== "" && url !== "#") {
        item.href = url;
        item.target = "_blank";
        item.rel = "noopener noreferrer";
      } else {
        item.setAttribute("aria-disabled", "true");
        item.style.opacity = "0.5";
        item.style.pointerEvents = "none";
      }
      socials.appendChild(item);
    });

    body.append(name, desc, socials);

    // Nút xem chi tiết
    const cta = document.createElement("div");
    cta.className = "artist-cta";
    const link = document.createElement("a");
    link.className = "btn-secondary";
    link.href = "artist-detail.html?artist=" + encodeURIComponent(artist.slug);
    link.setAttribute("aria-label", "Xem chi tiết nghệ sĩ " + artist.name);
    link.appendChild(document.createTextNode("Xem chi tiết "));
    link.insertAdjacentHTML("beforeend", ICONS.arrow);
    cta.appendChild(link);

    card.append(photoWrap, body, cta);
    return card;
  }

  /* ---------- Tìm kiếm (không phân biệt hoa/thường và dấu tiếng Việt) ---------- */
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .trim();
  }

  function filterArtists() {
    const words = normalize(input.value).split(/\s+/).filter(Boolean);
    const cards = grid.querySelectorAll(".artist-card");
    let visible = 0;

    cards.forEach(function (card) {
      const name = card.querySelector(".artist-name").textContent;
      const desc = card.querySelector(".artist-desc").textContent;
      const text = normalize(name + " " + desc);

      const matched = words.every(function (word) {
        return text.includes(word);
      });

      card.hidden = !matched;
      if (matched) visible++;
    });

    if (emptyMsg) {
      emptyMsg.textContent = NO_MATCH_TEXT;
      emptyMsg.hidden = visible !== 0;
    }
  }

  // Gõ tới đâu lọc tới đó
  input.addEventListener("input", filterArtists);

  // Bấm nút "Tìm kiếm" hoặc Enter: lọc tại chỗ, không tải lại trang
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    filterArtists();
  });

  // Hỗ trợ artist.html?keyword=kairo
  const q = new URLSearchParams(window.location.search).get("keyword");
  if (q) input.value = q;

  // Nút "Tìm kiếm" trên header: cuộn xuống ô tìm kiếm và đặt con trỏ vào đó
  const headerSearch = document.querySelector('.site-header__actions a[href="#artist-search"]');
  if (headerSearch) {
    headerSearch.addEventListener("click", function (event) {
      event.preventDefault();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.focus({ preventScroll: true });
    });
  }

  /* ---------- Lấy danh sách nghệ sĩ từ API ---------- */
  async function loadArtists() {
    let artists;
    try {
      artists = await apiRequest("/api/artists");
    } catch (error) {
      // Ví dụ: backend chưa chạy -> "Không kết nối được máy chủ..."
      if (emptyMsg) {
        emptyMsg.textContent = error.message;
        emptyMsg.hidden = false;
      }
      return;
    }

    grid.replaceChildren(...artists.map(createArtistCard));
    filterArtists(); // áp dụng từ khóa đang có (nếu có)
  }

  loadArtists();
})();
