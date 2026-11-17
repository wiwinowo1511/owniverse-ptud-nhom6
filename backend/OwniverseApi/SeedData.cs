// =====================================================
// DỮ LIỆU MẪU CỦA NGHỆ SĨ (chuyển từ artist-detail.js sang backend)
//
// TODO-DB: khi có database thật, các dữ liệu này sẽ nằm trong
// các bảng (Artists, ArtistTimeline, ArtistActivities, ArtistMusicVideos...)
// và file này có thể xóa đi.
// =====================================================

static class SeedData
{
    public static List<Artist> CreateArtists() => new()
    {
        // ---------------- KAIRO ----------------
        new Artist
        {
            Id = 1,
            Slug = "kairo",
            Name = "KAIRO",
            Handle = "",
            Genre = "Pop / R&B / Dance-pop",
            Description = "KAIRO là nam ca sĩ solo người Việt Nam theo đuổi Pop, R&B và Dance-pop hiện đại. Với hình tượng trẻ trung, tinh nghịch cùng nguồn năng lượng tích cực, anh mang đến những màn trình diễn cuốn hút và gần gũi.",
            Cover = "images/banners/Kairo-banner.png",
            Avatar = "images/artists/Kairo-01.png",
            Photo = "images/artists/kairo.png",
            Summary = "KAIRO là nam ca sĩ solo người Việt Nam theo đuổi phong cách Pop, R&B và Dance-pop hiện đại. Với hình tượng trẻ trung, tinh nghịch và nguồn năng lượng tích cực, KAIRO mang đến những màn trình diễn cuốn hút, kết nối với người hâm mộ KALEO qua âm nhạc.",
            CommunityLink = "artist-community.html?id=1",
            Social = new SocialLinks
            {
                Youtube = "https://www.youtube.com/channel/UCZMYvSPulDSUdx7bdtTFdrg",
                Instagram = "https://www.instagram.com/cortis",
                Tiktok = "https://www.tiktok.com/@cortis_bighit",
            },
            Promotion = new Promotion
            {
                Title = "Mang năng lượng KAIRO vào bộ sưu tập của bạn.",
                Description = "Khám phá những sản phẩm merchandise chính thức mang dấu ấn riêng của KAIRO và cộng đồng KALEO.",
                Image = "images/banners/Kairo-banner.png",
                Link = "products.html",
            },
            Information = new()
            {
                new TimelineItem { Year = "12.2023", Title = "Artist Training", Description = "Chính thức trở thành thực tập sinh và bắt đầu quá trình đào tạo thanh nhạc, vũ đạo và biểu diễn." },
                new TimelineItem { Year = "8.2024", Title = "Official Debut", Description = "Ra mắt với digital single đầu tay \"First Light\"." },
                new TimelineItem { Year = "3.2025", Title = "First Mini Album", Description = "Phát hành mini album \"BLUEPRINT\", đánh dấu sự trưởng thành trong phong cách âm nhạc." },
                new TimelineItem { Year = "5.2026", Title = "Expanding Horizons", Description = "Mở rộng hoạt động biểu diễn, phát triển merchandise cá nhân và tổ chức fan meeting đầu tiên." },
                new TimelineItem { Year = "8.2026", Title = "First Full Album", Description = "Phát hành full album đầu tay \"Shiny Paradise\"." },
            },
            Activities = new()
            {
                new ArtistActivity
                {
                    Title = "KALEO Streaming Party – First Light",
                    Type = "Hoạt động cộng đồng",
                    Date = "01.11.2026 – 15.11.2026",
                    Status = "ongoing",
                    Description = "Cùng KALEO tham gia chiến dịch nghe nhạc và chia sẻ digital single First Light, lan tỏa những giai điệu đầu tiên trong hành trình âm nhạc của KAIRO.",
                    Image = "images/event/kairo-streaming-party.png",
                    Link = "#",
                },
                new ArtistActivity
                {
                    Title = "KAIRO – Shiny Paradise Fan Meeting",
                    Type = "Fan Meeting",
                    Date = "28.11.2026",
                    Status = "upcoming",
                    Description = "Buổi gặp gỡ đặc biệt dành cho KAIRO và KALEO với những màn trình diễn trực tiếp, giao lưu cùng người hâm mộ và nhiều hoạt động tương tác thú vị.",
                    Image = "images/event/kairo-shiny-paradise-fan-meeting.png",
                    Link = "#",
                },
                new ArtistActivity
                {
                    Title = "BLUEPRINT – Mini Album Showcase",
                    Type = "Showcase",
                    Date = "20.09.2026",
                    Status = "ended",
                    Description = "Sự kiện showcase giới thiệu mini album BLUEPRINT, đánh dấu một cột mốc đáng nhớ trong hành trình trưởng thành về âm nhạc và phong cách biểu diễn của KAIRO.",
                    Image = "images/event/kairo-blueprint-showcase.png",
                    Link = "#",
                },
            },
            MusicVideos = new()
            {
                new MusicVideo { Title = "BLUEPRINT", Type = "Official Music Video", YoutubeId = "a1vHjBy85TU" },
                new MusicVideo { Title = "SHINY PARADISE", Type = "Official Music Video", YoutubeId = "WXS-o57VJ5w" },
            },
        },

        // ---------------- MIRA ----------------
        new Artist
        {
            Id = 2,
            Slug = "mira",
            Name = "MIRA",
            Handle = "@mira.official",
            Genre = "V-Pop / Dance-pop",
            Description = "MIRA là nữ ca sĩ solo theo đuổi V-Pop và Dance-pop với hình ảnh trẻ trung, ngọt ngào. Sở hữu chất giọng trong trẻo cùng nguồn năng lượng tích cực, cô luôn mang đến màu sắc tươi sáng trong âm nhạc.",
            Cover = "images/banners/Mira-banner.png",
            Avatar = "images/artists/Mira-01.png",
            Photo = "images/artists/mira.png",
            Summary = "MIRA là nữ ca sĩ solo nổi bật với phong cách V-Pop và Dance-pop trẻ trung, ngọt ngào. Sở hữu chất giọng trong trẻo cùng hình tượng nữ tính, vui tươi, MIRA không ngừng làm mới bản thân và lan tỏa năng lượng tích cực đến cộng đồng người hâm mộ MIEL.",
            CommunityLink = "artist-community.html?id=2",
            Social = new SocialLinks { Youtube = "", Instagram = "", Tiktok = "" },
            Promotion = new Promotion
            {
                Title = "Lưu giữ những khoảnh khắc ngọt ngào cùng MIRA.",
                Description = "Khám phá bộ sưu tập merchandise chính thức dành cho những người hâm mộ MIRA và cộng đồng MIEL.",
                Image = "images/banners/Mira-banner.png",
                Link = "products.html",
            },
            Information = new()
            {
                new TimelineItem { Year = "2.2023", Title = "First Bloom", Description = "Chính thức debut solo với digital single đầu tay \"First Bloom\", đánh dấu sự khởi đầu trong hành trình âm nhạc của MIRA." },
                new TimelineItem { Year = "5.2023", Title = "First Fan Meeting", Description = "Tổ chức buổi gặp gỡ người hâm mộ đầu tiên, tạo nên dấu mốc đặc biệt trong hành trình kết nối cùng cộng đồng MIEL." },
                new TimelineItem { Year = "9.2024", Title = "Summer in My Pocket", Description = "Ra mắt mini album đầu tay với ca khúc chủ đề \"Summer Diary\", mang đến hình ảnh trẻ trung, năng động và đầy màu sắc." },
                new TimelineItem { Year = "12.2025", Title = "Beyond the Stars", Description = "Phát hành mini album thứ hai với ca khúc chủ đề \"Orbit\", đánh dấu sự trưởng thành trong phong cách âm nhạc và hình ảnh nghệ thuật." },
                new TimelineItem { Year = "3.2026", Title = "MIRA: THE NEXT CHAPTER", Description = "Tổ chức concert solo đầu tiên, đánh dấu bước tiến mới trong sự nghiệp và hành trình phát triển nghệ thuật của MIRA." },
            },
            Activities = new()
            {
                new ArtistActivity
                {
                    Title = "MIEL Streaming Party – ORBIT",
                    Type = "STREAMING PROJECT",
                    Date = "05.11.2026 – 15.11.2026",
                    Status = "ongoing",
                    Description = "Dự án streaming do cộng đồng MIEL tổ chức nhằm lan tỏa ca khúc \"Orbit\" và ủng hộ hành trình âm nhạc của MIRA.",
                    Image = "images/event/mira-streaming-party.png",
                    Link = "#",
                },
                new ArtistActivity
                {
                    Title = "MIRA – THE NEXT CHAPTER",
                    Type = "FIRST SOLO CONCERT",
                    Date = "29.11.2026",
                    Status = "upcoming",
                    Description = "Concert solo đầu tiên của MIRA, hứa hẹn mang đến những màn trình diễn đặc biệt cùng các ca khúc nổi bật trong hành trình âm nhạc của cô.",
                    Image = "images/event/mira-the-next-chapter.png",
                    Link = "#",
                },
                new ArtistActivity
                {
                    Title = "BEYOND THE STARS – Listening Party",
                    Type = "ALBUM EVENT",
                    Date = "20.09.2026",
                    Status = "ended",
                    Description = "Sự kiện nghe album \"Beyond the Stars\" dành cho người hâm mộ, cùng khám phá những giai điệu và câu chuyện phía sau ca khúc \"Orbit\".",
                    Image = "images/event/mira-beyond-the-stars.png",
                    Link = "#",
                },
            },
            MusicVideos = new()
            {
                new MusicVideo { Title = "FIRST BLOOM", Type = "Official Music Video", YoutubeId = "eHHQaoEW30Q" },
                new MusicVideo { Title = "BEYOND THE STARS", Type = "Official Music Video", YoutubeId = "vPwaXytZcgI" },
            },
        },

        // ---------------- RHEA ----------------
        new Artist
        {
            Id = 3,
            Slug = "rhea",
            Name = "RHEA",
            Handle = "@rhea.official",
            Genre = "Dark Pop / Hip-hop / Alternative R&B",
            Description = "RHEA là nữ nghệ sĩ solo theo đuổi Dark Pop, Hip-hop và Alternative R&B. Với hình tượng mạnh mẽ, sắc sảo và cá tính độc lập, cô tạo nên dấu ấn riêng thông qua âm nhạc và phong cách nghệ thuật khác biệt.",
            Cover = "images/banners/Rhea-banner.png",
            Avatar = "images/artists/Rhea-01.png",
            Photo = "images/artists/rhea.png",
            Summary = "RHEA là nữ nghệ sĩ solo theo đuổi phong cách Dark Pop, Hip-hop và Alternative R&B. Với hình tượng mạnh mẽ, sắc sảo và cá tính, RHEA tạo dấu ấn qua âm nhạc độc đáo cùng những màn trình diễn đầy cuốn hút, đồng thời thể hiện tinh thần tự do và bản lĩnh nghệ thuật.",
            CommunityLink = "artist-community.html?id=3",
            Social = new SocialLinks
            {
                Youtube = "https://www.youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A",
                Instagram = "https://www.instagram.com/blackpinkofficial",
                Tiktok = "https://www.tiktok.com/@bp_tiktok?_r=1&_t=ZS-9BESqXDVPap",
            },
            Promotion = new Promotion
            {
                Title = "Thể hiện cá tính riêng cùng bộ sưu tập RHEA.",
                Description = "Khám phá merchandise chính thức mang dấu ấn nghệ thuật độc đáo của RHEA.",
                Image = "images/banners/Rhea-banner.png",
                Link = "products.html",
            },
            Information = new()
            {
                new TimelineItem { Year = "11/2021", Title = "Official Debut", Description = "Chính thức debut với digital single đầu tay \"REDLINE\"." },
                new TimelineItem { Year = "03/2023", Title = "First Mini Album", Description = "Ra mắt mini album đầu tay \"AFTER DARK\"." },
                new TimelineItem { Year = "09/2024", Title = "First Solo Showcase", Description = "Tổ chức showcase cá nhân \"RHEA: UNBOUND\"." },
                new TimelineItem { Year = "05/2025", Title = "Second Mini Album", Description = "Phát hành mini album \"OUT OF FRAME\"." },
                new TimelineItem { Year = "08/2026", Title = "ECLIPSE", Description = "Trở lại với dự án âm nhạc mới \"ECLIPSE\"." },
            },
            Activities = new()
            {
                new ArtistActivity
                {
                    Title = "ECLIPSE – Comeback Streaming Project",
                    Type = "Hoạt động cộng đồng",
                    Date = "05.11.2026 – 15.11.2026",
                    Status = "ongoing",
                    Description = "Cùng VANTA tham gia chiến dịch nghe nhạc và chia sẻ dự án ECLIPSE, lan tỏa sản phẩm âm nhạc mới của RHEA trên các nền tảng trực tuyến.",
                    Image = "images/event/rhea-eclipse-comback-streaming-project.png",
                    Link = "#",
                },
                new ArtistActivity
                {
                    Title = "RHEA – ECLIPSE Showcase",
                    Type = "Showcase",
                    Date = "22.11.2026",
                    Status = "upcoming",
                    Description = "Sự kiện giới thiệu dự án ECLIPSE với những màn trình diễn trực tiếp, chia sẻ về quá trình sản xuất âm nhạc và giao lưu cùng người hâm mộ.",
                    Image = "images/event/rhea-eclipse-showcase.png",
                    Link = "#",
                },
                new ArtistActivity
                {
                    Title = "OUT OF FRAME – Special Fan Event",
                    Type = "Fan Event",
                    Date = "20.09.2026",
                    Status = "ended",
                    Description = "Sự kiện đặc biệt dành cho VANTA nhân dịp phát hành mini album OUT OF FRAME, với các hoạt động giao lưu và trải nghiệm merchandise độc quyền.",
                    Image = "images/event/rhea-out-of-frame.png",
                    Link = "#",
                },
            },
            MusicVideos = new()
            {
                new MusicVideo { Title = "ECLIPSE", Type = "Official Music Video", YoutubeId = "2S24-y0Ij3Y" },
                new MusicVideo { Title = "OUT OF FRAME", Type = "Official Music Video", YoutubeId = "IHNzOHi8sJs" },
            },
        },
    };
}