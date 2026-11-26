(function () {
  function field(row, name) {
    if (!row) return undefined;
    return row[name] !== undefined ? row[name] : row[name.charAt(0).toUpperCase() + name.slice(1)];
  }

  const page = document.querySelector(".community-page");
  if (!page) return;

  const joinedSection = page.querySelector(".community-section[aria-labelledby='my-communities-title']");
  const discoverGrid = page.querySelector(".discover-grid");
  const joinedTemplate = joinedSection && joinedSection.querySelector(".joined-community");
  const emptyHint = joinedSection && joinedSection.querySelector(".community-empty-hint");
  const search = page.querySelector("#community-search");
  if (!joinedSection || !discoverGrid || !joinedTemplate || !emptyHint || !search) return;

  const originalJoinedCard = joinedTemplate.cloneNode(true);
  const discoverTemplates = new Map();
  Array.from(discoverGrid.querySelectorAll(".discover-card")).forEach(function (card) {
    const link = card.querySelector("a[href*='artist-community.html?id=']");
    const match = link && link.href.match(/[?&]id=(\d+)/);
    if (match) discoverTemplates.set(Number(match[1]), card.cloneNode(true));
  });
  const joinedDetails = {
    1: {
      name: originalJoinedCard.querySelector(".community-name-line h3").textContent,
      fandom: originalJoinedCard.querySelector(".community-name-line span").textContent,
      genre: originalJoinedCard.querySelector(".joined-community_info > p").textContent,
      image: originalJoinedCard.querySelector(".joined-community_avatar img").getAttribute("src")
    }
  };
  discoverTemplates.forEach(function (template, artistId) {
    joinedDetails[artistId] = {
      name: template.querySelector(".discover-card_title h3").textContent,
      fandom: template.querySelector(".discover-card_title span").textContent,
      genre: template.querySelector(".discover-card_details > p").textContent,
      image: template.querySelector(".discover-card_cover img").getAttribute("src")
    };
  });
  if (joinedDetails[3]) joinedDetails[3].fandom = "VANTA";

  let communities = [];
  let joined = [];

  function communityLink(artistId) {
    return "artist-community.html?id=" + encodeURIComponent(artistId);
  }

  function displayInfo(community) {
    const artistId = Number(field(community, "artistId"));
    const known = joinedDetails[artistId] || {};
    return {
      artistId,
      name: known.name || field(community, "artistName") || field(community, "name") || "Cộng đồng",
      fandom: known.fandom || field(community, "name") || "Cộng đồng người hâm mộ",
      genre: known.genre || field(community, "description") || "Cộng đồng người hâm mộ OWNIVERSE",
      image: known.image || field(community, "avatar") || field(community, "cover") || ""
    };
  }

  function renderJoinedCard(community) {
    const info = displayInfo(community);
    const card = originalJoinedCard.cloneNode(true);
    const avatar = card.querySelector(".joined-community_avatar");
    const image = card.querySelector(".joined-community_avatar img");
    const links = card.querySelectorAll("a");
    const title = card.querySelector(".community-name-line h3");
    const label = card.querySelector(".community-name-line span");
    const description = card.querySelector(".joined-community_info > p");
    const badge = card.querySelector(".joined-badge");
    avatar.href = communityLink(info.artistId);
    avatar.setAttribute("aria-label", "Xem cộng đồng " + info.name);
    if (image && info.image) {
      image.src = info.image;
      image.alt = "Ảnh đại diện cộng đồng " + info.name;
    } else if (image) {
      image.alt = "Ảnh đại diện cộng đồng " + info.name;
    }
    title.textContent = info.name;
    label.textContent = info.fandom;
    description.textContent = info.genre;
    badge.hidden = false;
    if (links[1]) links[1].href = communityLink(info.artistId);
    return card;
  }

  function renderKairoDiscover(community) {
    const info = displayInfo(community);
    const card = document.createElement("article");
    card.className = "discover-card";
    const cover = document.createElement("a");
    cover.className = "discover-card_cover";
    cover.href = communityLink(info.artistId);
    cover.setAttribute("aria-label", "Khám phá cộng đồng " + info.name);
    const image = document.createElement("img");
    if (info.image) image.src = info.image;
    image.alt = "";
    image.loading = "lazy";
    image.onerror = function () { this.style.display = "none"; };
    cover.appendChild(image);
    const coverLabel = document.createElement("span");
    coverLabel.className = "discover-card_cover-label";
    coverLabel.textContent = info.fandom + " · " + info.name + " FAN COMMUNITY";
    cover.appendChild(coverLabel);

    const details = document.createElement("div");
    details.className = "discover-card_details";
    const title = document.createElement("div");
    title.className = "discover-card_title";
    const heading = document.createElement("h3");
    heading.textContent = info.name;
    const fandom = document.createElement("span");
    fandom.textContent = info.fandom;
    title.append(heading, fandom);
    const genre = document.createElement("p");
    genre.textContent = info.genre;
    const link = document.createElement("a");
    link.className = "discover-card_join";
    link.href = communityLink(info.artistId);
    link.append(document.createTextNode("Khám phá cộng đồng "));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    link.appendChild(arrow);
    details.append(title, genre, link);
    card.append(cover, details);
    return card;
  }

  function renderDiscoverCard(community) {
    const info = displayInfo(community);
    const template = discoverTemplates.get(info.artistId);
    if (!template) return renderKairoDiscover(community);
    const card = template.cloneNode(true);
    card.querySelectorAll("a").forEach(link => { link.href = communityLink(info.artistId); });
    card.querySelector(".discover-card_title h3").textContent = info.name;
    card.querySelector(".discover-card_title span").textContent = info.fandom;
    card.querySelector(".discover-card_details > p").textContent = info.genre;
    const image = card.querySelector(".discover-card_cover img");
    if (info.image) image.src = info.image;
    return card;
  }

  function render() {
    const keyword = search.value.trim().toLocaleLowerCase("vi");
    const matches = function (community) {
      const info = displayInfo(community);
      return !keyword || [info.name, info.fandom, info.genre, community.name]
        .some(value => String(value || "").toLocaleLowerCase("vi").includes(keyword));
    };
    const joinedIds = new Set(joined.map(item => Number(field(item, "artistId"))));
    const joinedCards = joined.filter(matches).map(renderJoinedCard);
    const discoverCards = communities
      .filter(item => !joinedIds.has(Number(field(item, "artistId"))) && matches(item))
      .map(renderDiscoverCard);
    joinedTemplate.remove();
    joinedSection.querySelectorAll(".joined-community").forEach(card => card.remove());
    joinedSection.insertBefore(joinedCards[0] || document.createDocumentFragment(), emptyHint);
    joinedCards.slice(1).forEach(card => emptyHint.before(card));
    emptyHint.hidden = false;
    emptyHint.textContent = joined.length
      ? "Muốn kết nối thêm? Khám phá các cộng đồng được gợi ý bên dưới."
      : "Bạn chưa tham gia cộng đồng nào. Hãy khám phá các cộng đồng bên dưới.";
    discoverGrid.replaceChildren(...discoverCards);
  }

  async function load() {
    const [communityRows, joinedRows] = await Promise.all([
      apiRequest("/api/communities", { auth: true }),
      apiRequest("/api/users/me/communities", { auth: true })
    ]);
    communities = Array.isArray(communityRows) ? communityRows : [];
    const joinedIds = new Set((Array.isArray(joinedRows) ? joinedRows : []).map(row => Number(field(row, "artistId"))));
    joined = communities.filter(item => joinedIds.has(Number(field(item, "artistId"))));
    render();
  }

  search.addEventListener("input", render);
  const form = page.querySelector(".community-search");
  if (form) form.addEventListener("submit", event => { event.preventDefault(); render(); });
  window.addEventListener("storage", event => {
    if (event.key === "owniverse_community_membership_updated") load().catch(console.error);
  });
  window.addEventListener("owniverse:community-membership-updated", () => load().catch(console.error));
  window.addEventListener("pageshow", event => { if (event.persisted) load().catch(console.error); });
  joinedTemplate.hidden = true;
  emptyHint.textContent = "Đang tải cộng đồng…";
  load().catch(error => {
    joinedTemplate.remove();
    emptyHint.hidden = false;
    emptyHint.textContent = error.message || "Không thể tải danh sách cộng đồng.";
  });
})();
