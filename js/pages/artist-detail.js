/* =====================================================
   ARTIST DETAIL - OWNIVERSE
   Dữ liệu nghệ sĩ giờ được lấy từ API backend:
   GET /api/artists/{slug}   (ví dụ /api/artists/kairo)
   Cần nạp js/auth/auth.js trước file này (để dùng apiRequest).
   ===================================================== */


/* =====================================================
   1. HÀM HỖ TRỢ
   ===================================================== */

/* Cập nhật nội dung văn bản */

function setText(elementId, value) {

    const element = document.getElementById(elementId);

    if (element && value !== undefined && value !== null) {

        element.textContent = value;

    }

}


/* Cập nhật hình ảnh */

function setImage(elementId, imagePath, altText) {

    const element = document.getElementById(elementId);

    if (!element || !imagePath) return;

    element.src = imagePath;

    element.alt = altText || "";

}


/* Cập nhật liên kết */

function setLink(elementId, url) {

    const element = document.getElementById(elementId);

    if (!element) return;

    if (url && url.trim() !== "" && url !== "#") {

        // Có đường dẫn: cho phép bấm
        element.href = url;
        element.removeAttribute("aria-disabled");
        element.style.pointerEvents = "auto";
        element.style.opacity = "1";

    } else {

        // Chưa có đường dẫn: vẫn hiển thị icon
        element.removeAttribute("href");
        element.setAttribute("aria-disabled", "true");
        element.style.pointerEvents = "none";
        element.style.opacity = "0.5";

    }

    // Luôn hiển thị icon
    element.hidden = false;

}


/* Cập nhật liên kết mạng xã hội */

function setSocialLink(elementId, url) {

    const element = document.getElementById(elementId);

    if (!element) return;

    // Luôn hiển thị icon
    element.hidden = false;

    if (url && url.trim() !== "" && url !== "#") {

        // Có đường dẫn chính thức
        element.href = url;
        element.target = "_blank";
        element.rel = "noopener noreferrer";

        element.removeAttribute("aria-disabled");
        element.removeAttribute("tabindex");

    } else {

        // Chưa có đường dẫn: vẫn hiển thị và có thể focus
        element.removeAttribute("href");
        element.removeAttribute("target");

        element.setAttribute("aria-disabled", "true");
        element.setAttribute("tabindex", "0");

    }

}


/* =====================================================
   2. HIỂN THỊ DẤU ẤN NGHỆ THUẬT
   ===================================================== */

function renderArtistTimeline(information) {

    const container = document.getElementById("artist-information");

    if (!container) return;

    container.replaceChildren();

    // Trường hợp dữ liệu là đoạn văn bản
    if (typeof information === "string") {

        const paragraph = document.createElement("p");

        paragraph.className = "artist-timeline-text";
        paragraph.textContent = information;

        container.appendChild(paragraph);

        return;
    }

    // Trường hợp không có dữ liệu
    if (!Array.isArray(information) || information.length === 0) {

        const message = document.createElement("p");

        message.className = "artist-timeline-text";
        message.textContent =
            "Những dấu mốc nghệ thuật của nghệ sĩ sẽ được cập nhật trong thời gian tới.";

        container.appendChild(message);

        return;
    }

    // Tạo timeline
    const timeline = document.createElement("div");

    timeline.className = "artist-timeline-list";

    information.forEach(item => {

        const event = document.createElement("article");

        event.className = "artist-timeline-item";

        const marker = document.createElement("span");

        marker.className = "artist-timeline-marker";
        marker.setAttribute("aria-hidden", "true");

        const content = document.createElement("div");

        content.className = "artist-timeline-content";

        const year = document.createElement("span");

        year.className = "artist-timeline-year";
        year.textContent = item.year || "";

        const title = document.createElement("h3");

        title.className = "artist-timeline-title";
        title.textContent = item.title || "";

        const description = document.createElement("p");

        description.className = "artist-timeline-description";
        description.textContent = item.description || "";

        content.append(year, title, description);

        event.append(marker, content);

        timeline.appendChild(event);

    });

    container.appendChild(timeline);

}


/* =====================================================
   3. HIỂN THỊ HOẠT ĐỘNG ĐANG VÀ SẮP DIỄN RA
   ===================================================== */

function renderActivities(activities) {

    const container = document.getElementById("artist-activities");

    if (!container) return;

    container.replaceChildren();

    // Chưa có dữ liệu hoạt động
    if (!Array.isArray(activities) || activities.length === 0) {

        const message = document.createElement("p");

        message.className = "artist-activities-empty";

        message.textContent =
            "Các hoạt động mới nhất và lịch trình sắp tới của nghệ sĩ sẽ được cập nhật tại đây.";

        container.appendChild(message);

        return;
    }

    // Tạo từng thẻ hoạt động
    activities.forEach(activity => {

        const card = document.createElement("article");

        card.className = "artist-activity-card";

        // Hình ảnh
        const imageWrap = document.createElement("div");

        imageWrap.className = "artist-activity-image-wrap";

        const image = document.createElement("img");

        image.className = "artist-activity-image";
        image.src = activity.image || "";
        image.alt = activity.title || "Hoạt động của nghệ sĩ";
        image.loading = "lazy";

        imageWrap.appendChild(image);

        // Nội dung
        const content = document.createElement("div");

        content.className = "artist-activity-content";

        // Trạng thái
        const status = document.createElement("span");

        status.className = "artist-activity-status";

        const statusConfig = {
            ongoing: {
                label: "ĐANG DIỄN RA",
                className: "is-ongoing"
            },
            upcoming: {
                label: "SẮP DIỄN RA",
                className: "is-upcoming"
            },
            ended: {
                label: "ĐÃ KẾT THÚC",
                className: "is-ended"
            }
        };

        const currentStatus =
            statusConfig[activity.status] || statusConfig.upcoming;

        status.textContent = currentStatus.label;
        status.classList.add(currentStatus.className);

        // Loại hoạt động và thời gian
        const meta = document.createElement("div");

        meta.className = "artist-activity-meta";

        const type = document.createElement("span");

        type.textContent = activity.type || "Hoạt động";

        const separator = document.createElement("span");

        separator.textContent = "•";
        separator.setAttribute("aria-hidden", "true");

        const date = document.createElement("span");

        date.textContent = activity.date || "Thời gian cập nhật sau";

        meta.append(type, separator, date);

        // Tiêu đề
        const title = document.createElement("h3");

        title.className = "artist-activity-title";
        title.textContent = activity.title || "Hoạt động mới";

        // Mô tả
        const description = document.createElement("p");

        description.className = "artist-activity-description";
        description.textContent = activity.description || "";

        content.append(status, meta, title, description);

        // Liên kết xem chi tiết (chỉ tạo khi có URL)
        if (activity.link && activity.link.trim() !== "" && activity.link !== "#") {

            const link = document.createElement("a");

            link.className = "artist-activity-link";
            link.href = activity.link;
            link.textContent = "XEM CHI TIẾT ↗";

            content.appendChild(link);

        }

        card.append(imageWrap, content);

        container.appendChild(card);

    });

}


/* =====================================================
   4. HIỂN THỊ VIDEO ÂM NHẠC
   ===================================================== */

function renderMusicVideos(videos) {

    const container = document.getElementById("artist-music-videos");

    if (!container) return;

    container.replaceChildren();

    if (!videos || videos.length === 0) {

        const message = document.createElement("p");

        message.className = "artist-detail-empty";
        message.textContent = "MV của nghệ sĩ sẽ sớm được cập nhật.";

        container.appendChild(message);

        return;

    }

    videos.forEach(video => {

        const card = document.createElement("a");

        card.className = "artist-music-video-card";
        card.href = `https://www.youtube.com/watch?v=${encodeURIComponent(video.youtubeId)}`;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", `Xem MV ${video.title} trên YouTube`);

        card.innerHTML = `
            <div class="artist-music-video-thumbnail">
                <img
                    src="https://img.youtube.com/vi/${encodeURIComponent(video.youtubeId)}/hqdefault.jpg"
                    alt="${video.title}"
                    loading="lazy"
                >
                <span class="artist-music-video-play">▶</span>
            </div>

            <div class="artist-music-video-info">
                <h3>${video.title}</h3>
                <p>${video.type}</p>
            </div>
        `;

        container.appendChild(card);

    });

}


/* =====================================================
   5. HIỂN THỊ MERCHANDISE
   (vẫn dùng PRODUCTS từ js/pages/products.js - phần sản phẩm)
   ===================================================== */

function getArtistProducts(artistName) {

    return PRODUCTS.filter(product =>
        product.artist.toLowerCase() === artistName.toLowerCase()
    );

}


function renderProducts(products) {

    const container = document.getElementById("artist-product-list");

    const template = document.getElementById("product-card-template");

    if (!container || !template) return;

    container.replaceChildren();

    /* Chưa có sản phẩm */

    if (!products || products.length === 0) {

        const message = document.createElement("p");

        message.className = "artist-detail-empty";

        message.textContent =
            "Bộ sưu tập merchandise chính thức của nghệ sĩ sẽ sớm được cập nhật.";

        container.appendChild(message);

        return;

    }

    /* Tạo thẻ sản phẩm */

    products.forEach(product => {

        const card = template.content.cloneNode(true);

        const image = card.querySelector(".product-card_image");

        const imageLink = card.querySelector(".product-card_image-link");

        const name = card.querySelector(".product-card_title");

        const price = card.querySelector(".product-card_price");

        const detailLink = card.querySelector(".product-card_button");

        /* Hình ảnh */

        if (image) {

            image.src = product.image || "";

            image.alt = product.name || "Sản phẩm merchandise";

        }

        /* Tên sản phẩm */

        if (name) {

            name.textContent = product.name || "";

        }

        /* Giá */

        if (price) {

            price.textContent = formatPrice(product.price);

        }

        const productUrl = getProductDetailUrl(product.id);

        if (imageLink) {

            imageLink.href = productUrl;

        }

        if (detailLink) {

            detailLink.href = productUrl;

        }

        container.appendChild(card);

    });

}


/* =====================================================
   6. HIỂN THỊ THÔNG TIN NGHỆ SĨ
   ===================================================== */

function renderArtist(artist) {

    /* Tiêu đề trình duyệt */

    document.title = `${artist.name} | Owniverse`;

    /* Breadcrumb */

    setText("artist-breadcrumb-name", artist.name);

    /* Thông tin cơ bản */

    setText("artist-name", artist.name);

    setText("artist-handle", artist.handle);

    setText("artist-genre", artist.genre);

    /* Giới thiệu ngắn */

    setText("artist-description", artist.description);

    /* Dấu ấn nghệ thuật */

    renderArtistTimeline(artist.information);

    /* Hoạt động đang diễn ra và sắp diễn ra */

    renderActivities(artist.activities);

    /* Video âm nhạc */

    renderMusicVideos(artist.musicVideos);

    /* Ảnh bìa */

    setImage("artist-cover", artist.cover, `Ảnh bìa nghệ sĩ ${artist.name}`);

    /* Ảnh đại diện */

    setImage("artist-avatar", artist.avatar, `Ảnh đại diện nghệ sĩ ${artist.name}`);

    /* Liên kết cộng đồng */

    setLink("artist-community-link", artist.communityLink);

    /* Mạng xã hội */

    const social = artist.social || {};

    setSocialLink("artist-youtube", social.youtube);

    setSocialLink("artist-instagram", social.instagram);

    setSocialLink("artist-tiktok", social.tiktok);

    /* Banner quảng bá */

    const promotion = artist.promotion || {};

    setText("artist-promotion-title", promotion.title);

    setText("artist-promotion-description", promotion.description);

    setImage(
        "artist-promotion-image",
        promotion.image,
        `Merchandise chính thức của ${artist.name}`
    );

    setLink("artist-promotion-link", promotion.link);

    /* Release và Merchandise */

    renderProducts(getArtistProducts(artist.name));

}


/* =====================================================
   7. BÁO LỖI (không tìm thấy nghệ sĩ / không kết nối được backend)
   ===================================================== */

function showArtistError(message) {

    document.title = "Không tìm thấy nghệ sĩ | Owniverse";

    const main = document.querySelector(".artist-detail-page");

    if (!main) return;

    main.innerHTML = `
        <section class="artist-detail-intro container">
            <h1 class="artist-detail-page-title">
                KHÔNG TÌM THẤY NGHỆ SĨ
            </h1>

            <p class="artist-detail-page-desc" id="artist-error-message"></p>

            <a href="artist.html" class="back-to-artists">
                ← Quay lại danh sách nghệ sĩ
            </a>
        </section>
    `;

    const errorMessage = document.getElementById("artist-error-message");

    if (errorMessage) errorMessage.textContent = message;

}


/* =====================================================
   8. XỬ LÝ THAM SỐ URL VÀ GỌI API
   ===================================================== */

async function initArtistDetail() {

    const params = new URLSearchParams(window.location.search);

    const artistSlug = params.get("artist");

    if (!artistSlug) {

        showArtistError("Đường dẫn không hợp lệ.");

        return;

    }

    let artist;

    try {

        artist = await apiRequest("/api/artists/" + encodeURIComponent(artistSlug));

    } catch (error) {

        // 404 -> "Không tìm thấy nghệ sĩ"; backend chưa chạy -> "Không kết nối được máy chủ..."
        showArtistError(error.message);

        return;

    }

    /* Hiển thị hồ sơ nghệ sĩ */

    renderArtist(artist);

}


/* =====================================================
   9. KHỞI CHẠY
   ===================================================== */

document.addEventListener("DOMContentLoaded", initArtistDetail);