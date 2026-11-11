const COMMUNITY_ARTISTS = {
  "1": {
    name: "KAIRO",
    fandom: "KALEO",
    genre: "Pop / R&B / Dance-pop",
    members: 12500,
    cover: "images/banners/Kairo-banner.png",
    avatar: "images/artists/Kairo-01.png",
    description: "Cộng đồng người hâm mộ chính thức của KAIRO",
    artistDescription: "KAIRO theo đuổi Pop, R&B và Dance-pop hiện đại với hình tượng trẻ trung, tinh nghịch và nguồn năng lượng tích cực.",
    fanNotices: ["Lịch hoạt động của nghệ sĩ", "Thông tin sự kiện fan", "Cập nhật mới từ Owniverse"],
    communityRules: "12.500 thành viên đang cùng đồng hành với KALEO.",
    fanPosts: [
      { author: "Thành viên KALEO", time: "2 giờ trước", text: "Mọi người đã nghe ca khúc mới của KAIRO chưa? Cùng chia sẻ cảm nhận và khoảnh khắc yêu thích nhé!", image: "images/event/kairo-streaming-party.png", likes: 24, comments: 6 },
      { author: "Thành viên KALEO", time: "5 giờ trước", text: "Cùng chuẩn bị playlist và tiếp thêm thật nhiều năng lượng cho dự án streaming của KALEO nào!", image: "images/event/kairo-shiny-paradise-fan-meeting.png", likes: 18, comments: 3 }
    ],
    pinnedNotice: "Lịch phát hành, thông tin sự kiện hoặc thông báo quan trọng từ nghệ sĩ.",
    officialNotices: ["Thông báo mới nhất", "Lịch hoạt động", "Sự kiện và phát hành"],
    artistPosts: [
      { time: "2 giờ trước", text: "Chào KALEO! Cảm ơn mọi người đã luôn đồng hành. Hẹn gặp các bạn trong những hoạt động sắp tới nhé!", image: "images/event/kairo-streaming-party.png", likes: 2400, comments: 128 },
      { time: "Hôm qua", text: "BLUEPRINT đã có mặt rồi! Mình rất mong được nghe cảm nhận của mọi người về sản phẩm lần này.", image: "images/event/kairo-blueprint-showcase.png", likes: 1860, comments: 94 },
      { time: "3 ngày trước", text: "Hẹn gặp KALEO tại Shiny Paradise Fan Meeting. Chuẩn bị thật nhiều năng lượng nhé!", image: "images/event/kairo-shiny-paradise-fan-meeting.png", likes: 3120, comments: 206 }
    ],
    artistMedia: ["images/event/kairo-blueprint-showcase.png", "images/event/kairo-shiny-paradise-fan-meeting.png"],
    products: [
      { id: 1, name: "Áo thun Signature - Kairo", price: 450000, image: "images/products/Kairo-ao-thun-01.jpg", categories: ["ao", "bo-suu-tap"] },
      { id: 4, name: "Hoodie Signature - Kairo", price: 900000, image: "images/products/Kairo-Hoodie-01.jpg", categories: ["ao", "bo-suu-tap"] },
      { id: 7, name: "Túi tote Signature - Kairo", price: 250000, image: "images/products/Kairo-tui-tote-01.png", categories: ["phu-kien", "bo-suu-tap"] },
      { id: 9, name: "Single Album First Light - Kairo", price: 350000, image: "images/products/Kairo-debut-album-01.png", categories: ["album"] },
      { id: 16, name: "Lightstick Official Kairo Ver 1", price: 1050000, image: "images/products/Kairo-lightstick-01.png", categories: ["phu-kien"] },
      { id: 21, name: "Dây đeo thẻ Lanyard Kairo Tour", price: 120000, image: "images/products/Kairo-lanyard-01.png", categories: ["phu-kien"] }
    ]
  },
  "2": {
    name: "MIRA",
    fandom: "MIEL",
    genre: "V-Pop / Dance-pop",
    members: 9800,
    cover: "images/banners/Mira-banner.png",
    avatar: "images/artists/Mira-01.png",
    description: "Cộng đồng người hâm mộ chính thức của MIRA",
    artistDescription: "MIRA mang đến màu sắc V-Pop và Dance-pop trẻ trung, ngọt ngào cùng nguồn năng lượng tích cực.",
    fanNotices: ["Lịch hoạt động của MIRA", "Thông tin sự kiện dành cho MIEL", "Tin tức mới từ Owniverse"],
    communityRules: "9.800 thành viên đang cùng lan tỏa năng lượng tích cực.",
    fanPosts: [
      { author: "Thành viên MIEL", time: "1 giờ trước", text: "Giai điệu mới của MIRA nghe thật đáng yêu! Mọi người thích đoạn nào nhất?", image: "images/event/mira-streaming-party.png", likes: 31, comments: 8 },
      { author: "Thành viên MIEL", time: "4 giờ trước", text: "Cùng gửi thật nhiều tình yêu đến MIRA và tham gia dự án streaming của MIEL nhé!", image: "images/event/mira-beyond-the-stars.png", likes: 22, comments: 5 }
    ],
    pinnedNotice: "Cập nhật lịch trình, dự án âm nhạc và những thông báo mới nhất từ MIRA.",
    officialNotices: ["Thông báo từ MIRA", "Lịch hoạt động", "Sự kiện và phát hành"],
    artistPosts: [
      { time: "1 giờ trước", text: "Xin chào MIEL! Cảm ơn mọi người vì đã luôn ở bên MIRA. Gửi mọi người thật nhiều yêu thương!", image: "images/event/mira-streaming-party.png", likes: 2800, comments: 164 },
      { time: "Hôm qua", text: "Beyond the Stars luôn là một hành trình đặc biệt. Mọi người hãy chia sẻ ca khúc yêu thích nhé!", image: "images/event/mira-beyond-the-stars.png", likes: 2140, comments: 112 },
      { time: "3 ngày trước", text: "MIRA rất mong được gặp MIEL trong chương tiếp theo. Hẹn gặp mọi người thật sớm!", image: "images/event/mira-the-next-chapter.png", likes: 3650, comments: 241 }
    ],
    artistMedia: ["images/event/mira-beyond-the-stars.png", "images/event/mira-the-next-chapter.png"],
    products: [
      { id: 3, name: "Sticker họa tiết - Mira", price: 80000, image: "images/products/Mira-Sticker-01.jpg", categories: ["phu-kien"] },
      { id: 6, name: "Móc khóa Acrylic - Mira", price: 100000, image: "images/products/Mira-moc-khoa-01.jpg", categories: ["phu-kien"] },
      { id: 8, name: "Album Beyond the Star - Mira", price: 499000, image: "images/products/mira-album-01.png", categories: ["album"] },
      { id: 12, name: "Debut Single First Bloom - Mira", price: 350000, image: "images/products/Mira-debut-album-01.png", categories: ["album"] },
      { id: 17, name: "Lightstick Official Mira Star Wand", price: 980000, image: "images/products/Mira-lightstick-01.png", categories: ["phu-kien"] },
      { id: 26, name: "Pin cài áo Kim Loại Mira Badge", price: 90000, image: "images/products/Mira-pin-cai-01.png", categories: ["phu-kien"] }
    ]
  },
  "3": {
    name: "RHEA",
    fandom: "VANTA",
    genre: "Dark Pop / Hip-hop / Alternative R&B",
    members: 11200,
    cover: "images/banners/Rhea-banner.png",
    avatar: "images/artists/Rhea-01.png",
    description: "Cộng đồng người hâm mộ chính thức của RHEA",
    artistDescription: "RHEA theo đuổi Dark Pop, Hip-hop và Alternative R&B với hình tượng mạnh mẽ, sắc sảo và cá tính.",
    fanNotices: ["Lịch trình và hoạt động của RHEA", "Thông tin sự kiện dành cho VANTA", "Cập nhật từ Owniverse"],
    communityRules: "11.200 thành viên đang cùng đồng hành với VANTA.",
    fanPosts: [
      { author: "Thành viên VANTA", time: "2 giờ trước", text: "ECLIPSE đang được bật liên tục! Mọi người cùng chia sẻ khoảnh khắc yêu thích nhé.", image: "images/event/rhea-eclipse-comback-streaming-project.png", likes: 42, comments: 11 },
      { author: "Thành viên VANTA", time: "6 giờ trước", text: "Concept mới của RHEA quá cuốn. VANTA đã sẵn sàng cho showcase chưa?", image: "images/event/rhea-eclipse-showcase.png", likes: 35, comments: 9 }
    ],
    pinnedNotice: "Theo dõi các lịch trình, dự án âm nhạc và thông báo chính thức của RHEA.",
    officialNotices: ["Thông báo chính thức", "Lịch hoạt động", "Sự kiện và phát hành"],
    artistPosts: [
      { time: "2 giờ trước", text: "Chào VANTA! ECLIPSE là một dự án rất đặc biệt với mình. Cảm ơn mọi người đã luôn lắng nghe.", image: "images/event/rhea-eclipse-comback-streaming-project.png", likes: 4200, comments: 318 },
      { time: "Hôm qua", text: "Hẹn gặp VANTA tại showcase sắp tới. Cùng khám phá thế giới của ECLIPSE nhé.", image: "images/event/rhea-eclipse-showcase.png", likes: 3380, comments: 225 },
      { time: "3 ngày trước", text: "Cảm ơn vì đã cùng mình bước ra OUT OF FRAME. Mình luôn trân trọng từng khoảnh khắc bên VANTA.", image: "images/event/rhea-out-of-frame.png", likes: 3970, comments: 284 }
    ],
    artistMedia: ["images/event/rhea-eclipse-showcase.png", "images/event/rhea-out-of-frame.png"],
    products: [
      { id: 2, name: "Album After Dark - Rhea", price: 549000, image: "images/products/rhea-album-01.png", categories: ["album"] },
      { id: 5, name: "Áo thun Vanta Club", price: 600000, image: "images/products/rhea-ao-thun-01.png", categories: ["ao", "bo-suu-tap"] },
      { id: 14, name: "1st Mini Album OUT OF FRAME - Rhea", price: 520000, image: "images/products/Rhea-mini-album-01.png", categories: ["album"] },
      { id: 15, name: "Special Album ECLIPSE - Rhea", price: 520000, image: "images/products/Rhea-special-album-01.png", categories: ["album"] },
      { id: 18, name: "Lightstick Official Rhea Eclipse Torch", price: 1020000, image: "images/products/Rhea-lightstick-01.png", categories: ["phu-kien"] },
      { id: 27, name: "Túi đeo chéo Mini Crossbody Rhea", price: 380000, image: "images/products/Rhea-tui-deo-cheo-01.png", categories: ["phu-kien", "bo-suu-tap"] }
    ]
  }
};

function normalizeCommunityText(value) {
  return String(value || "")
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function formatCommunityPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "community-product-card";

  const imageLink = document.createElement("a");
  imageLink.className = "community-product-image-link";
  imageLink.href = "product-detail.html?id=" + encodeURIComponent(product.id);
  imageLink.setAttribute("aria-label", "Xem chi tiết " + product.name);

  const image = document.createElement("img");
  image.className = "community-product-image";
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";
  imageLink.appendChild(image);

  const title = document.createElement("h3");
  title.className = "community-product-title";
  title.textContent = product.name;

  const price = document.createElement("p");
  price.className = "community-product-price";
  price.textContent = formatCommunityPrice(product.price);

  const meta = document.createElement("div");
  meta.className = "community-product-meta";
  const stock = document.createElement("span");
  stock.className = "community-product-stock";
  stock.textContent = "Còn hàng";

  const details = document.createElement("a");
  details.className = "community-product-details";
  details.href = imageLink.href;
  details.textContent = "Xem chi tiết";
  details.setAttribute("aria-label", "Xem chi tiết sản phẩm " + product.name);
  meta.append(stock, details);

  article.append(imageLink, title, price, meta);
  return article;
}

function initCommunityTabs() {
  const tabs = Array.from(document.querySelectorAll(".community-tab"));
  const panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  });

  function activateTab(tab, moveFocus) {
    tabs.forEach(function (item) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      item.classList.toggle("is-active", selected);
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
    if (moveFocus) tab.focus();
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

  const activeTab = tabs.find(function (tab) {
    return tab.getAttribute("aria-selected") === "true";
  });
  if (activeTab) activateTab(activeTab, false);
}

function initCommunityJoin(artist) {
  const button = document.getElementById("community-join");
  const count = document.getElementById("community-member-count");
  if (!button || !count) return;

  let joined = true;
  function render() {
    button.setAttribute("aria-pressed", String(joined));
    button.classList.toggle("is-joined", joined);
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = joined ? "✓" : "+";
    button.replaceChildren(icon, document.createTextNode(joined ? " Đã tham gia" : " Tham gia cộng đồng"));
    count.textContent = "♟ " + new Intl.NumberFormat("vi-VN").format(artist.members + (joined ? 0 : -1)) + " thành viên";
  }

  button.addEventListener("click", function () {
    joined = !joined;
    render();
  });
  render();
}

function initCommunityShop(artist) {
  const grid = document.getElementById("shop-product-grid");
  const input = document.getElementById("product-search");
  const form = document.getElementById("shop-search-form");
  const sort = document.getElementById("shop-sort");
  const count = document.getElementById("shop-results-count");
  const empty = document.getElementById("shop-empty-state");
  const chips = Array.from(document.querySelectorAll(".category-chip"));
  if (!grid || !input || !form || !sort || !count || !empty) return;

  let activeCategory = "all";

  function render() {
    const query = normalizeCommunityText(input.value);
    let products = artist.products.filter(function (product) {
      const matchesQuery = normalizeCommunityText(product.name).includes(query);
      const matchesCategory = activeCategory === "all" || product.categories.includes(activeCategory);
      return matchesQuery && matchesCategory;
    });

    if (sort.value === "price-low") products.sort(function (a, b) { return a.price - b.price; });
    else if (sort.value === "price-high") products.sort(function (a, b) { return b.price - a.price; });
    else if (sort.value === "name") products.sort(function (a, b) { return a.name.localeCompare(b.name, "vi"); });

    grid.replaceChildren.apply(grid, products.map(createProductCard));
    count.textContent = "Hiển thị " + products.length + " sản phẩm";
    empty.hidden = products.length > 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeCategory = chip.dataset.category || "all";
      chips.forEach(function (item) {
        const selected = item === chip;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      render();
    });
  });

  input.addEventListener("input", render);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });
  sort.addEventListener("change", render);
  render();
}

function createCommunityPost(post, artist, isOfficial) {
  const article = document.createElement("article");
  article.className = "community-post" + (isOfficial ? " community-post--official" : "");

  const header = document.createElement("div");
  header.className = "community-post-header";
  const avatar = document.createElement("img");
  avatar.className = "feed-avatar";
  avatar.src = isOfficial ? artist.avatar : "images/artists/" + artist.name.toLocaleLowerCase("vi") + ".png";
  avatar.alt = "";

  const authorBlock = document.createElement("div");
  authorBlock.className = "community-post-author";
  const authorLine = document.createElement("div");
  authorLine.className = "community-post-author-line";
  const author = document.createElement("strong");
  author.textContent = isOfficial ? artist.name : post.author;
  authorLine.appendChild(author);
  if (isOfficial) {
    const verified = document.createElement("span");
    verified.className = "verified-badge";
    verified.textContent = "✓ Tài khoản nghệ sĩ";
    authorLine.appendChild(verified);
  }
  const timestamp = document.createElement("span");
  timestamp.className = "community-post-time";
  timestamp.textContent = "· " + post.time;
  authorLine.appendChild(timestamp);
  authorBlock.appendChild(authorLine);
  header.append(avatar, authorBlock);

  const body = document.createElement("p");
  body.className = "community-post-text";
  body.textContent = post.text;
  article.append(header, body);

  if (post.image) {
    const isVideo = post.mediaType === "video";
    const media = document.createElement(isVideo ? "video" : "img");
    media.className = "community-post-media";
    media.src = post.image;
    if (isVideo) {
      media.controls = true;
      media.preload = "metadata";
      media.setAttribute("aria-label", "Video bài đăng của " + (isOfficial ? artist.name : post.author));
    } else {
      media.alt = "Hình ảnh bài đăng của " + (isOfficial ? artist.name : post.author);
      media.loading = "lazy";
    }
    article.appendChild(media);
  }

  const actions = document.createElement("div");
  actions.className = "community-post-actions";
  const likeButton = document.createElement("button");
  likeButton.className = "post-action post-like-button";
  likeButton.type = "button";
  likeButton.setAttribute("aria-pressed", "false");
  let likes = Number(post.likes) || 0;
  likeButton.textContent = "♡ Thích" + (likes ? " (" + new Intl.NumberFormat("vi-VN").format(likes) + ")" : "");
  likeButton.addEventListener("click", function () {
    const liked = likeButton.getAttribute("aria-pressed") !== "true";
    likeButton.setAttribute("aria-pressed", String(liked));
    likeButton.classList.toggle("is-liked", liked);
    likes += liked ? 1 : -1;
    likeButton.textContent = (liked ? "♥ Đã thích" : "♡ Thích") + (likes ? " (" + new Intl.NumberFormat("vi-VN").format(likes) + ")" : "");
  });

  const commentButton = document.createElement("button");
  commentButton.className = "post-action";
  commentButton.type = "button";
  commentButton.textContent = "♧ Bình luận" + (post.comments ? " (" + new Intl.NumberFormat("vi-VN").format(post.comments) + ")" : "");

  const shareButton = document.createElement("button");
  shareButton.className = "post-action";
  shareButton.type = "button";
  shareButton.textContent = "↗ Chia sẻ";
  actions.append(likeButton, commentButton, shareButton);
  article.appendChild(actions);

  const commentsArea = document.createElement("div");
  commentsArea.className = "community-post-comments";
  commentsArea.hidden = true;
  const commentForm = document.createElement("form");
  commentForm.className = "post-comment-form";
  const commentInput = document.createElement("label");
  commentInput.className = "visually-hidden";
  const inputId = "post-comment-" + Math.random().toString(36).slice(2, 10);
  commentInput.htmlFor = inputId;
  commentInput.textContent = "Viết bình luận";
  const commentField = document.createElement("input");
  commentField.id = inputId;
  commentField.type = "text";
  commentField.maxLength = 240;
  commentField.placeholder = "Viết bình luận...";
  commentField.required = true;
  const commentSubmit = document.createElement("button");
  commentSubmit.type = "submit";
  commentSubmit.textContent = "Gửi";
  commentForm.append(commentInput, commentField, commentSubmit);
  const commentsList = document.createElement("ul");
  commentsList.className = "post-comments-list";
  commentForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const value = commentField.value.trim();
    if (!value) return;
    const item = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = "Bạn";
    item.append(name, document.createTextNode(" " + value));
    commentsList.appendChild(item);
    post.comments = (Number(post.comments) || 0) + 1;
    commentButton.textContent = "♧ Bình luận (" + new Intl.NumberFormat("vi-VN").format(post.comments) + ")";
    commentField.value = "";
    commentField.focus();
  });
  commentsArea.append(commentForm, commentsList);
  article.appendChild(commentsArea);

  commentButton.addEventListener("click", function () {
    commentsArea.hidden = !commentsArea.hidden;
    if (!commentsArea.hidden) commentField.focus();
  });

  shareButton.addEventListener("click", async function () {
    const shareData = { title: artist.fandom + " Community", text: post.text, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        shareButton.textContent = "✓ Đã sao chép liên kết";
      } else {
        shareButton.textContent = "Hãy sao chép liên kết trên thanh địa chỉ";
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        shareButton.textContent = "Không thể chia sẻ lúc này";
      }
    }
  });

  return article;
}

function appendCommunityList(list, items) {
  list.replaceChildren();
  items.forEach(function (item) {
    const entry = document.createElement("li");
    entry.textContent = item;
    list.appendChild(entry);
  });
}

function initFanCommunity(artist) {
  const postList = document.getElementById("fan-post-list");
  const composer = document.getElementById("fan-composer");
  const textInput = document.getElementById("fan-post-text");
  const fileInput = document.getElementById("fan-post-image");
  const preview = document.getElementById("fan-image-preview");
  const uploadName = document.getElementById("fan-upload-name");
  if (!postList || !composer || !textInput || !fileInput || !preview || !uploadName) return;

  document.getElementById("fan-composer-avatar").src = artist.avatar;
  document.getElementById("fan-composer-avatar").alt = "Ảnh đại diện cộng đồng " + artist.fandom;
  document.getElementById("fan-post-text").placeholder = "Bạn muốn chia sẻ điều gì với " + artist.fandom + "?";
  document.getElementById("fan-community-about").textContent = artist.communityRules;
  appendCommunityList(document.getElementById("fan-notice-list"), artist.fanNotices);
  artist.fanPosts.forEach(function (post) {
    postList.appendChild(createCommunityPost(post, artist, false));
  });

  let imageUrl = "";
  let mediaType = "";
  function clearPreview() {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = "";
    mediaType = "";
    preview.replaceChildren();
    preview.hidden = true;
    uploadName.textContent = "";
  }

  fileInput.addEventListener("change", function () {
    clearPreview();
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      fileInput.value = "";
      uploadName.textContent = "Vui lòng chọn hình ảnh hoặc video.";
      return;
    }
    const isVideo = file.type.startsWith("video/");
    const maxFileSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      fileInput.value = "";
      uploadName.textContent = isVideo ? "Video cần có dung lượng tối đa 50 MB." : "Ảnh cần có dung lượng tối đa 5 MB.";
      return;
    }
    imageUrl = URL.createObjectURL(file);
    mediaType = isVideo ? "video" : "image";
    const media = document.createElement(isVideo ? "video" : "img");
    media.src = imageUrl;
    if (isVideo) {
      media.controls = true;
      media.preload = "metadata";
      media.setAttribute("aria-label", "Video xem trước bài đăng");
    } else {
      media.alt = "Ảnh xem trước bài đăng";
    }
    preview.appendChild(media);
    preview.hidden = false;
    uploadName.textContent = file.name;
  });

  composer.addEventListener("submit", function (event) {
    event.preventDefault();
    const text = textInput.value.trim();
    if (!text && !imageUrl) {
      uploadName.textContent = "Nhập nội dung hoặc đính kèm ảnh/video trước khi đăng.";
      textInput.focus();
      return;
    }
    const post = {
      author: "Thành viên " + artist.fandom,
      time: "Vừa xong",
      text: text || "Đã chia sẻ một hình ảnh cùng cộng đồng.",
      image: imageUrl,
      mediaType: mediaType,
      likes: 0,
      comments: 0
    };
    postList.prepend(createCommunityPost(post, artist, false));
    artist.fanPosts.unshift(post);
    textInput.value = "";
    fileInput.value = "";
    imageUrl = "";
    mediaType = "";
    preview.replaceChildren();
    preview.hidden = true;
    uploadName.textContent = "";
  });
}

function initArtistCommunityFeed(artist) {
  const postList = document.getElementById("artist-post-list");
  const loadMore = document.getElementById("load-more-artist-posts");
  if (!postList || !loadMore) return;

  document.getElementById("artist-posts-title").textContent = "BÀI ĐĂNG TỪ " + artist.name;
  document.getElementById("artist-posts-description").textContent = "Những cập nhật và nội dung được đăng bởi " + artist.name + " hoặc tài khoản chính thức.";
  document.getElementById("artist-pinned-notice").textContent = artist.pinnedNotice;
  appendCommunityList(document.getElementById("artist-notice-list"), artist.officialNotices);

  artist.artistPosts.forEach(function (post, index) {
    const card = createCommunityPost(post, artist, true);
    if (index >= 2) card.hidden = true;
    postList.appendChild(card);
  });

  loadMore.hidden = artist.artistPosts.length <= 2;
  loadMore.addEventListener("click", function () {
    postList.querySelectorAll(".community-post[hidden]").forEach(function (post) {
      post.hidden = false;
    });
    loadMore.hidden = true;
  });

  const mediaGrid = document.getElementById("artist-media-grid");
  artist.artistMedia.forEach(function (src, index) {
    const link = document.createElement("a");
    link.className = "artist-media-item";
    link.href = src;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Mở hình ảnh " + (index + 1) + " của " + artist.name);
    const image = document.createElement("img");
    image.src = src;
    image.alt = "Khoảnh khắc của " + artist.name;
    image.loading = "lazy";
    link.appendChild(image);
    mediaGrid.appendChild(link);
  });
}

function initArtistCommunity() {
  const requestedId = new URLSearchParams(window.location.search).get("id") || "1";
  const artist = COMMUNITY_ARTISTS[requestedId];
  const main = document.querySelector(".artist-community-page");

  if (!artist) {
    document.title = "Không tìm thấy cộng đồng | OWNIVERSE";
    if (main) {
      main.innerHTML = '<section class="community-not-found" role="alert"><h1>Không tìm thấy cộng đồng</h1><p>Đường dẫn không hợp lệ. Hãy chọn một cộng đồng nghệ sĩ để tiếp tục.</p><a href="community.html">Quay lại cộng đồng</a></section>';
    }
    return;
  }

  const artistSlug = artist.name.toLocaleLowerCase("vi");
  document.title = artist.fandom + " Community | OWNIVERSE";

  document.getElementById("community-cover-image").src = artist.cover;
  document.getElementById("community-cover-image").alt = "Ảnh bìa cộng đồng " + artist.fandom;
  document.getElementById("community-avatar").src = artist.avatar;
  document.getElementById("community-avatar").alt = "Ảnh đại diện " + artist.name;
  document.getElementById("community-name").textContent = artist.fandom + " COMMUNITY";
  document.getElementById("community-description").textContent = artist.description;
  document.getElementById("artist-profile-link").href = "artist-detail.html?artist=" + encodeURIComponent(artistSlug);
  document.getElementById("shop-title").textContent = "SHOP " + artist.name;
  document.getElementById("shop-description").textContent = "Khám phá merchandise chính thức thuộc về " + artist.name + ".";
  document.querySelector(".shop-all-link").href = "products.html?q=" + encodeURIComponent(artist.name);

  initCommunityTabs();
  initCommunityJoin(artist);
  initFanCommunity(artist);
  initArtistCommunityFeed(artist);
  initCommunityShop(artist);
}

document.addEventListener("DOMContentLoaded", initArtistCommunity);