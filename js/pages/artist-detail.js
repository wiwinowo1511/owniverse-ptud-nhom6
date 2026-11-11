
/* =====================================================
   ARTIST DETAIL - OWNIVERSE
   Quản lý dữ liệu chi tiết của 3 nghệ sĩ
   ===================================================== */


/* =====================================================
   1. DỮ LIỆU NGHỆ SĨ
   ===================================================== */

const artists = {

    /* ---------------- KAIRO ---------------- */

    kairo: {

        name: "KAIRO",

        genre: "Pop / R&B / Dance-pop",

        description:
            "KAIRO là nam ca sĩ solo người Việt Nam theo đuổi Pop, R&B và Dance-pop hiện đại. Với hình tượng trẻ trung, tinh nghịch cùng nguồn năng lượng tích cực, anh mang đến những màn trình diễn cuốn hút và gần gũi.",

        information: [
            {
                year: "12.2023",
                title: "Artist Training",
                description:
                    "Chính thức trở thành thực tập sinh và bắt đầu quá trình đào tạo thanh nhạc, vũ đạo và biểu diễn."
            },
            {
                year: "8.2024",
                title: "Official Debut",
                description:
                    'Ra mắt với digital single đầu tay "First Light".'
            },
            {
                year: "3.2025",
                title: "First Mini Album",
                description:
                    'Phát hành mini album "BLUEPRINT", đánh dấu sự trưởng thành trong phong cách âm nhạc.'
            },
            {
                year: "5.2026",
                title: "Expanding Horizons",
                description:
                    "Mở rộng hoạt động biểu diễn, phát triển merchandise cá nhân và tổ chức fan meeting đầu tiên."
            },
            {
                year: "8.2026",
                title: "First Full Album",
                description:
                    'Phát hành full album đầu tay "Shiny Paradise".'
            }
        ],

        activities: [
            {
                title: "KALEO Streaming Party – First Light",
                type: "Hoạt động cộng đồng",
                date: "01.11.2026 – 15.11.2026",
                status: "ongoing",
                description:
                    "Cùng KALEO tham gia chiến dịch nghe nhạc và chia sẻ digital single First Light, lan tỏa những giai điệu đầu tiên trong hành trình âm nhạc của KAIRO.",
                image: "images/event/kairo-streaming-party.png",
                link: "#"
            },
            {
                title: "KAIRO – Shiny Paradise Fan Meeting",
                type: "Fan Meeting",
                date: "28.11.2026",
                status: "upcoming",
                description:
                    "Buổi gặp gỡ đặc biệt dành cho KAIRO và KALEO với những màn trình diễn trực tiếp, giao lưu cùng người hâm mộ và nhiều hoạt động tương tác thú vị.",
                image: "images/event/kairo-shiny-paradise-fan-meeting.png",
                link: "#"
            },
            {
                title: "BLUEPRINT – Mini Album Showcase",
                type: "Showcase",
                date: "20.09.2026",
                status: "ended",
                description:
                    "Sự kiện showcase giới thiệu mini album BLUEPRINT, đánh dấu một cột mốc đáng nhớ trong hành trình trưởng thành về âm nhạc và phong cách biểu diễn của KAIRO.",
                image: "images/event/kairo-blueprint-showcase.png",
                link: "#"
            }
        ],

        cover: "images/banners/Kairo-banner.png",

        avatar: "images/artists/Kairo-01.png",

        communityLink: "artist-community.html?id=1",

        social: {
            youtube: "https://www.youtube.com/channel/UCZMYvSPulDSUdx7bdtTFdrg",
            instagram: "https://www.instagram.com/cortis",
            tiktok: "https://www.tiktok.com/@cortis_bighit?_r=1&_d=secCgYIASAHKAESPgo8H78b95K2wq8eAlxzHVNy4eY%2BNeyfSLwW8XbUoOG8CYifGcgP2reVLXDDU8%2BbKOGp9KTZHVOL8GJranktGgA%3D&_svg=1&checksum=b2fdd511a0d69f34b14ae88995dd0420d7fe86f6e3301c2fb1940be56664c959&item_author_type=2&reflow_sign_scene=7&rgssign=8.1.x9N3E1eabTb2FF0UGOTVIw&sec_uid=MS4wLjABAAAAjmSVzDtF_Z9nY9uWVXQbnwQBd7a2Lek8W5ao9oeZe1WZU8IYKH-Q6Qge7cmAaObq&sec_user_id=MS4wLjABAAAAGu5ZJ-HpdjIMTCZQSP9pmn_TXxlJ3SsVeY84mePtGcWvmiSSUp42zRYeHiQiPxHS&share_app_id=1180&share_author_id=7350593316641375237&share_link_id=51148B01-C8B6-4409-BF46-8C7A66448D2B&share_region=VN&share_scene=1&sharer_language=vi&social_share_type=5&source=h5_t&timestamp=1794135293&tt_from=copy&u_code=d6ek153fdkamd4&ug_btm=b6880%2Cb5836&user_id=6698130523833271297&utm_campaign=client_share&utm_medium=ios&utm_source=copy"
        },

        promotion: {
            title: "Mang năng lượng KAIRO vào bộ sưu tập của bạn.",
            description:
                "Khám phá những sản phẩm merchandise chính thức mang dấu ấn riêng của KAIRO và cộng đồng KALEO.",
            image: "images/banners/Kairo-banner.png",
            link: "products.html"
        },

        musicVideos: [
            {
                title: "BLUEPRINT",
                type: "Official Music Video",
                youtubeId: "a1vHjBy85TU"
            },
            {
                title: "SHINY PARADISE",
                type: "Official Music Video",
                youtubeId: "WXS-o57VJ5w"
            }
        ],

    },


    /* ---------------- MIRA ---------------- */

    mira: {

        name: "MIRA",

        handle: "@mira.official",

        genre: "V-Pop / Dance-pop",

        description:
            "MIRA là nữ ca sĩ solo theo đuổi V-Pop và Dance-pop với hình ảnh trẻ trung, ngọt ngào. Sở hữu chất giọng trong trẻo cùng nguồn năng lượng tích cực, cô luôn mang đến màu sắc tươi sáng trong âm nhạc.",

        information: [
    {
        year: "2.2023",
        title: "First Bloom",
        description:
            'Chính thức debut solo với digital single đầu tay "First Bloom", đánh dấu sự khởi đầu trong hành trình âm nhạc của MIRA.'
    },
    {
        year: "5.2023",
        title: "First Fan Meeting",
        description:
            'Tổ chức buổi gặp gỡ người hâm mộ đầu tiên, tạo nên dấu mốc đặc biệt trong hành trình kết nối cùng cộng đồng MIEL.'
    },
    {
        year: "9.2024",
        title: "Summer in My Pocket",
        description:
            'Ra mắt mini album đầu tay với ca khúc chủ đề "Summer Diary", mang đến hình ảnh trẻ trung, năng động và đầy màu sắc.'
    },
    {
        year: "12.2025",
        title: "Beyond the Stars",
        description:
            'Phát hành mini album thứ hai với ca khúc chủ đề "Orbit", đánh dấu sự trưởng thành trong phong cách âm nhạc và hình ảnh nghệ thuật.'
    },
    {
        year: "3.2026",
        title: "MIRA: THE NEXT CHAPTER",
        description:
            'Tổ chức concert solo đầu tiên, đánh dấu bước tiến mới trong sự nghiệp và hành trình phát triển nghệ thuật của MIRA.'
    }
],
        activities: [
    {
        title: "MIEL Streaming Party – ORBIT",
        type: "STREAMING PROJECT",
        date: "05.11.2026 – 15.11.2026",
        status: "ongoing",
        description:
            'Dự án streaming do cộng đồng MIEL tổ chức nhằm lan tỏa ca khúc "Orbit" và ủng hộ hành trình âm nhạc của MIRA.',
        image: "images/event/mira-streaming-party.png",
        link: "#"
    },
    {
        title: "MIRA – THE NEXT CHAPTER",
        type: "FIRST SOLO CONCERT",
        date: "29.11.2026",
        status: "upcoming",
        description:
            "Concert solo đầu tiên của MIRA, hứa hẹn mang đến những màn trình diễn đặc biệt cùng các ca khúc nổi bật trong hành trình âm nhạc của cô.",
        image: "images/event/mira-the-next-chapter.png",
        link: "#"
    },
    {
        title: "BEYOND THE STARS – Listening Party",
        type: "ALBUM EVENT",
        date: "20.09.2026",
        status: "ended",
        description:
            'Sự kiện nghe album "Beyond the Stars" dành cho người hâm mộ, cùng khám phá những giai điệu và câu chuyện phía sau ca khúc "Orbit".',
        image: "images/event/mira-beyond-the-stars.png",
        link: "#"
    }
],

        cover: "images/banners/Mira-banner.png",

        avatar: "images/artists/Mira-01.png",

        communityLink: "artist-community.html?id=2",

        social: {
            youtube: "",
            instagram: "",
            tiktok: ""
        },

        promotion: {
            title: "Lưu giữ những khoảnh khắc ngọt ngào cùng MIRA.",
            description:
                "Khám phá bộ sưu tập merchandise chính thức dành cho những người hâm mộ MIRA và cộng đồng MIEL.",
            image: "images/banners/Mira-banner.png",
            link: "products.html"
        },

        musicVideos: [
            {
                title: "FIRST BLOOM",
                type: "Official Music Video",
                youtubeId: "eHHQaoEW30Q"
            },
            {
                title: "BEYOND THE STARS",
                type: "Official Music Video",
                youtubeId: "vPwaXytZcgI"
            }
        ],

    },


    /* ---------------- RHEA ---------------- */

    rhea: {

        name: "RHEA",

        handle: "@rhea.official",

        genre: "Dark Pop / Hip-hop / Alternative R&B",

        description:
            "RHEA là nữ nghệ sĩ solo theo đuổi Dark Pop, Hip-hop và Alternative R&B. Với hình tượng mạnh mẽ, sắc sảo và cá tính độc lập, cô tạo nên dấu ấn riêng thông qua âm nhạc và phong cách nghệ thuật khác biệt.",

        activities: [
            {
                title: "ECLIPSE – Comeback Streaming Project",
                type: "Hoạt động cộng đồng",
                date: "05.11.2026 – 15.11.2026",
                status: "ongoing",
                description:
                    "Cùng VANTA tham gia chiến dịch nghe nhạc và chia sẻ dự án ECLIPSE, lan tỏa sản phẩm âm nhạc mới của RHEA trên các nền tảng trực tuyến.",
                image: "images/event/rhea-eclipse-comback-streaming-project.png",
                link: "#"
            },
            {
                title: "RHEA – ECLIPSE Showcase",
                type: "Showcase",
                date: "22.11.2026",
                status: "upcoming",
                description:
                    "Sự kiện giới thiệu dự án ECLIPSE với những màn trình diễn trực tiếp, chia sẻ về quá trình sản xuất âm nhạc và giao lưu cùng người hâm mộ.",
                image: "images/event/rhea-eclipse-showcase.png",
                link: "#"
            },
            {
                title: "OUT OF FRAME – Special Fan Event",
                type: "Fan Event",
                date: "20.09.2026",
                status: "ended",
                description:
                    "Sự kiện đặc biệt dành cho VANTA nhân dịp phát hành mini album OUT OF FRAME, với các hoạt động giao lưu và trải nghiệm merchandise độc quyền.",
                image: "images/event/rhea-out-of-frame.png",
                link: "#"
            }
        ],

        information: [
            {
                year: "11/2021",
                title: "Official Debut",
                description:
                    'Chính thức debut với digital single đầu tay "REDLINE".'
            },
            {
                year: "03/2023",
                title: "First Mini Album",
                description:
                    'Ra mắt mini album đầu tay "AFTER DARK".'
            },
            {
                year: "09/2024",
                title: "First Solo Showcase",
                description:
                    'Tổ chức showcase cá nhân "RHEA: UNBOUND".'
            },
            {
                year: "05/2025",
                title: "Second Mini Album",
                description:
                    'Phát hành mini album "OUT OF FRAME".'
            },
            {
                year: "08/2026",
                title: "ECLIPSE",
                description:
                    'Trở lại với dự án âm nhạc mới "ECLIPSE".'
            }
        ],

        cover: "images/banners/Rhea-banner.png",

        avatar: "images/artists/Rhea-01.png",

        communityLink: "artist-community.html?id=3",

        social: {
            youtube: "https://www.youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A",
            instagram: "https://www.instagram.com/blackpinkofficial",
            tiktok: "https://www.tiktok.com/@bp_tiktok?_r=1&_t=ZS-9BESqXDVPap"
        },

        promotion: {
            title: "Thể hiện cá tính riêng cùng bộ sưu tập RHEA.",
            description:
                "Khám phá merchandise chính thức mang dấu ấn nghệ thuật độc đáo của RHEA.",
            image: "images/banners/Rhea-banner.png",
            link: "products.html"
        },

        musicVideos: [
            {
                title: "ECLIPSE",
                type: "Official Music Video",
                youtubeId: "2S24-y0Ij3Y"
            },
            {
                title: "OUT OF FRAME",
                type: "Official Music Video",
                youtubeId: "IHNzOHi8sJs"
            }
        ],

    }

};


/* =====================================================
   2. HÀM HỖ TRỢ
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
   3. HIỂN THỊ DẤU ẤN NGHỆ THUẬT
   ===================================================== */

function renderArtistTimeline(information) {

    const container = document.getElementById(
        "artist-information"
    );

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
   4. HIỂN THỊ HOẠT ĐỘNG ĐANG VÀ SẮP DIỄN RA
   ===================================================== */

function renderActivities(activities) {

    const container = document.getElementById(
        "artist-activities"
    );

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

        content.append(
            status,
            meta,
            title,
            description
        );

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
   5. HIỂN THỊ VIDEO ÂM NHẠC
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
   6. HIỂN THỊ MERCHANDISE
   ===================================================== */

function getArtistProducts(artistName) {

    return PRODUCTS.filter(product =>
        product.artist.toLowerCase() === artistName.toLowerCase()
    );

}


function renderProducts(products) {

    const container = document.getElementById(
        "artist-product-list"
    );

    const template = document.getElementById(
        "product-card-template"
    );

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

        const image = card.querySelector(
            ".product-card_image"
        );

        const imageLink = card.querySelector(
            ".product-card_image-link"
        );

        const name = card.querySelector(
            ".product-card_title"
        );

        const price = card.querySelector(
            ".product-card_price"
        );

        const detailLink = card.querySelector(
            ".product-card_button"
        );

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
   7. HIỂN THỊ THÔNG TIN NGHỆ SĨ
   ===================================================== */

function renderArtist(artist) {

    /* Tiêu đề trình duyệt */

    document.title = `${artist.name} | Owniverse`;

    /* Breadcrumb */

    setText(
        "artist-breadcrumb-name",
        artist.name
    );

    /* Thông tin cơ bản */

    setText(
        "artist-name",
        artist.name
    );

    setText(
        "artist-handle",
        artist.handle
    );

    setText(
        "artist-genre",
        artist.genre
    );

    /* Giới thiệu ngắn */

    setText(
        "artist-description",
        artist.description
    );

    /* Dấu ấn nghệ thuật */

    renderArtistTimeline(artist.information);

    /* Hoạt động đang diễn ra và sắp diễn ra */

    renderActivities(artist.activities);

    /* Video âm nhạc */

    renderMusicVideos(artist.musicVideos);

    /* Ảnh bìa */

    setImage(
        "artist-cover",
        artist.cover,
        `Ảnh bìa nghệ sĩ ${artist.name}`
    );

    /* Ảnh đại diện */

    setImage(
        "artist-avatar",
        artist.avatar,
        `Ảnh đại diện nghệ sĩ ${artist.name}`
    );

    /* Liên kết cộng đồng */

    setLink(
        "artist-community-link",
        artist.communityLink
    );

    /* Mạng xã hội */

    setSocialLink(
        "artist-youtube",
        artist.social.youtube
    );

    setSocialLink(
        "artist-instagram",
        artist.social.instagram
    );

    setSocialLink(
        "artist-tiktok",
        artist.social.tiktok
    );

    /* Banner quảng bá */

    setText(
        "artist-promotion-title",
        artist.promotion.title
    );

    setText(
        "artist-promotion-description",
        artist.promotion.description
    );

    setImage(
        "artist-promotion-image",
        artist.promotion.image,
        `Merchandise chính thức của ${artist.name}`
    );

    setLink(
        "artist-promotion-link",
        artist.promotion.link
    );

    /* Release và Merchandise */

    renderProducts(getArtistProducts(artist.name));

}


/* =====================================================
   8. XỬ LÝ THAM SỐ URL
   ===================================================== */

function initArtistDetail() {

    const params = new URLSearchParams(
        window.location.search
    );

    const artistId = params.get("artist");

    const artist = artists[artistId];

    /* Không tìm thấy nghệ sĩ */

    if (!artist) {

        document.title = "Không tìm thấy nghệ sĩ | Owniverse";

        const main = document.querySelector(
            ".artist-detail-page"
        );

        if (main) {

            main.innerHTML = `
                <section class="artist-detail-intro container">
                    <h1 class="artist-detail-page-title">
                        KHÔNG TÌM THẤY NGHỆ SĨ
                    </h1>

                    <p class="artist-detail-page-desc">
                        Hồ sơ nghệ sĩ bạn đang tìm kiếm không tồn tại
                        hoặc đường dẫn không hợp lệ.
                    </p>

                    <a href="artist.html" class="back-to-artists">
                        ← Quay lại danh sách nghệ sĩ
                    </a>
                </section>
            `;

        }

        return;

    }

    /* Hiển thị hồ sơ nghệ sĩ */

    renderArtist(artist);

}


/* =====================================================
   9. KHỞI CHẠY
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initArtistDetail
);
