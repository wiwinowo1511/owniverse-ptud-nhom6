(function (window) {
  "use strict";

  const SESSION_KEY = "owniverse_artist_demo_session";
  const PROFILE_KEY = "owniverse_artist_demo_profile";
  const EMAIL = "kairo@owniverse.vn";

  const DEFAULT_USER = {
    id: "artist-demo-kairo",
    fullName: "KAIRO",
    email: EMAIL,
    phone: "",
    role: "artist",
    isDemo: true
  };

  const DEFAULT_PROFILE = {
    id: 1,
    slug: "kairo",
    name: "KAIRO",
    handle: "@kairo.official",
    genre: "Pop / R&B / Dance-pop",
    status: "active",
    communityLink: "artist-community.html?id=1",
    description: "KAIRO theo đuổi Pop, R&B và Dance-pop hiện đại với hình tượng trẻ trung, tinh nghịch và nguồn năng lượng tích cực.",
    summary: "KAIRO theo đuổi Pop, R&B và Dance-pop hiện đại với hình tượng trẻ trung, tinh nghịch và nguồn năng lượng tích cực.",
    avatar: "images/artists/Kairo-01.png",
    cover: "images/banners/Kairo-banner.png",
    photo: "images/artists/kairo.png",
    social: {
      youtube: "https://www.youtube.com/channel/UCZMYvSPulDSUdx7bdtTFdrg",
      instagram: "https://www.instagram.com/cortis",
      tiktok: "https://www.tiktok.com/@cortis_bighit"
    },
    promotion: {
      title: "Mang năng lượng KAIRO vào bộ sưu tập của bạn.",
      description: "Khám phá những sản phẩm merchandise chính thức mang dấu ấn riêng của KAIRO và cộng đồng KALEO.",
      image: "images/banners/Kairo-banner.png",
      link: "products.html"
    },
    information: [
      { year: "12.2023", title: "Artist Training", description: "Chính thức trở thành thực tập sinh và bắt đầu quá trình đào tạo thanh nhạc, vũ đạo và biểu diễn." },
      { year: "8.2024", title: "Official Debut", description: "Ra mắt với digital single đầu tay First Light." },
      { year: "3.2025", title: "First Mini Album", description: "Phát hành mini album BLUEPRINT, đánh dấu sự trưởng thành trong phong cách âm nhạc." },
      { year: "5.2026", title: "Expanding Horizons", description: "Mở rộng hoạt động biểu diễn, phát triển merchandise cá nhân và tổ chức fan meeting đầu tiên." },
      { year: "8.2026", title: "First Full Album", description: "Phát hành full album đầu tay Shiny Paradise." }
    ],
    activities: [
      {
        title: "KALEO Streaming Party – First Light",
        type: "Hoạt động cộng đồng",
        date: "01.11.2026 – 15.11.2026",
        status: "ongoing",
        description: "Cùng KALEO tham gia chiến dịch nghe nhạc và chia sẻ digital single First Light, lan tỏa những giai điệu đầu tiên trong hành trình âm nhạc của KAIRO.",
        image: "images/event/kairo-streaming-party.png",
        link: "#"
      },
      {
        title: "KAIRO – Shiny Paradise Fan Meeting",
        type: "Fan Meeting",
        date: "28.11.2026",
        status: "upcoming",
        description: "Buổi gặp gỡ đặc biệt dành cho KAIRO và KALEO với những màn trình diễn trực tiếp, giao lưu cùng người hâm mộ và nhiều hoạt động tương tác thú vị.",
        image: "images/event/kairo-shiny-paradise-fan-meeting.png",
        link: "#"
      },
      {
        title: "BLUEPRINT – Mini Album Showcase",
        type: "Showcase",
        date: "20.09.2026",
        status: "ended",
        description: "Sự kiện showcase giới thiệu mini album BLUEPRINT, đánh dấu một cột mốc đáng nhớ trong hành trình trưởng thành về âm nhạc và phong cách biểu diễn của KAIRO.",
        image: "images/event/kairo-blueprint-showcase.png",
        link: "#"
      }
    ],
    musicVideos: [
      { title: "BLUEPRINT", type: "Official Music Video", youtubeId: "a1vHjBy85TU" },
      { title: "SHINY PARADISE", type: "Official Music Video", youtubeId: "WXS-o57VJ5w" }
    ]
  };

  function readJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  window.getArtistDemoEmail = function () {
    return EMAIL;
  };

  window.getArtistDemoUser = function () {
    const user = readJSON(SESSION_KEY);
    return user && user.role === "artist" && user.isDemo === true ? user : null;
  };

  window.isArtistDemoSession = function () {
    return Boolean(window.getArtistDemoUser());
  };

  window.startArtistDemoSession = function () {
    localStorage.setItem(SESSION_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  };

  window.saveArtistDemoUser = function (user) {
    const safeUser = {
      ...DEFAULT_USER,
      fullName: String(user.fullName || DEFAULT_USER.fullName).trim(),
      email: normalizeEmail(user.email || DEFAULT_USER.email),
      phone: String(user.phone || "").trim()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  };

  window.getArtistDemoProfile = function () {
    return { ...DEFAULT_PROFILE, ...(readJSON(PROFILE_KEY) || {}) };
  };

  window.saveArtistDemoProfile = function (profile) {
    const saved = { ...window.getArtistDemoProfile(), ...profile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));
    return saved;
  };

  window.endArtistDemoSession = function () {
    localStorage.removeItem(SESSION_KEY);
  };
})(window);
