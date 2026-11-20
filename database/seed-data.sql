
/* ============================================================
   09_seed_data.sql - OWNIVERSE
   Du lieu tham chieu tu artist.js va products.js
   3 nghe si, 13 san pham, 4 anh / san pham

   - Khong xoa du lieu dang co
   - Chay lai khong tao trung du lieu Owniverse
   - Ton kho mac dinh = 0 vi chua co du lieu kho thuc
   ============================================================ */

USE Owniverse;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @IdentityInsertOn BIT = 0;

BEGIN TRY
    BEGIN TRANSACTION;

    /* ========================================================
       1. NGHE SI VA TAI KHOAN LIEN KET
       ======================================================== */

    DECLARE @Artists TABLE (
        Email NVARCHAR(255),
        Slug VARCHAR(100) PRIMARY KEY,
        Name NVARCHAR(100),
        Bio NVARCHAR(MAX),
        Style NVARCHAR(200),
        AvatarUrl NVARCHAR(500),
        CoverUrl NVARCHAR(500)
    );

    INSERT INTO @Artists VALUES
    (
        N'kairo@owniverse.vn', 'kairo', N'KAIRO',
        N'KAIRO là nam ca sĩ solo người Việt Nam theo đuổi Pop, R&B và Dance-pop hiện đại. Với hình tượng trẻ trung, tinh nghịch cùng nguồn năng lượng tích cực, anh mang đến những màn trình diễn cuốn hút và gần gũi.',
        N'Pop / R&B / Dance-pop',
        N'images/artists/Kairo-01.png',
        N'images/banners/Kairo-banner.png'
    ),
    (
        N'mira@owniverse.vn', 'mira', N'MIRA',
        N'MIRA là nữ ca sĩ solo theo đuổi V-Pop và Dance-pop với hình ảnh trẻ trung, ngọt ngào. Sở hữu chất giọng trong trẻo cùng nguồn năng lượng tích cực, cô luôn mang đến màu sắc tươi sáng trong âm nhạc.',
        N'V-Pop / Dance-pop',
        N'images/artists/Mira-01.png',
        N'images/banners/Mira-banner.png'
    ),
    (
        N'rhea@owniverse.vn', 'rhea', N'RHEA',
        N'RHEA là nữ nghệ sĩ solo theo đuổi Dark Pop, Hip-hop và Alternative R&B. Với hình tượng mạnh mẽ, sắc sảo và cá tính độc lập, cô tạo nên dấu ấn riêng thông qua âm nhạc và phong cách nghệ thuật khác biệt.',
        N'Dark Pop / Hip-hop / Alternative R&B',
        N'images/artists/Rhea-01.png',
        N'images/banners/Rhea-banner.png'
    );

    DECLARE @ArtistProfiles TABLE (
        Slug VARCHAR(100) PRIMARY KEY,
        ProfileDataJson NVARCHAR(MAX) NOT NULL
    );

    INSERT INTO @ArtistProfiles (Slug, ProfileDataJson) VALUES
    ('kairo', N'{"handle":"","photo":"images/artists/kairo.png","summary":"KAIRO là nam ca sĩ solo người Việt Nam theo đuổi phong cách Pop, R&B và Dance-pop hiện đại. Với hình tượng trẻ trung, tinh nghịch và nguồn năng lượng tích cực, KAIRO mang đến những màn trình diễn cuốn hút, kết nối với người hâm mộ KALEO qua âm nhạc.","communityLink":"artist-community.html?id=1","social":{"youtube":"https://www.youtube.com/channel/UCZMYvSPulDSUdx7bdtTFdrg","instagram":"https://www.instagram.com/cortis","tiktok":"https://www.tiktok.com/@cortis_bighit"},"promotion":{"title":"Mang năng lượng KAIRO vào bộ sưu tập của bạn.","description":"Khám phá những sản phẩm merchandise chính thức mang dấu ấn riêng của KAIRO và cộng đồng KALEO.","image":"images/banners/Kairo-banner.png","link":"products.html"},"information":[{"year":"12.2023","title":"Artist Training","description":"Chính thức trở thành thực tập sinh và bắt đầu quá trình đào tạo thanh nhạc, vũ đạo và biểu diễn."},{"year":"8.2024","title":"Official Debut","description":"Ra mắt với digital single đầu tay \"First Light\"."},{"year":"3.2025","title":"First Mini Album","description":"Phát hành mini album \"BLUEPRINT\", đánh dấu sự trưởng thành trong phong cách âm nhạc."},{"year":"5.2026","title":"Expanding Horizons","description":"Mở rộng hoạt động biểu diễn, phát triển merchandise cá nhân và tổ chức fan meeting đầu tiên."},{"year":"8.2026","title":"First Full Album","description":"Phát hành full album đầu tay \"Shiny Paradise\"."}],"activities":[{"title":"KALEO Streaming Party – First Light","type":"Hoạt động cộng đồng","date":"01.11.2026 – 15.11.2026","status":"ongoing","description":"Cùng KALEO tham gia chiến dịch nghe nhạc và chia sẻ digital single First Light, lan tỏa những giai điệu đầu tiên trong hành trình âm nhạc của KAIRO.","image":"images/event/kairo-streaming-party.png","link":"#"},{"title":"KAIRO – Shiny Paradise Fan Meeting","type":"Fan Meeting","date":"28.11.2026","status":"upcoming","description":"Buổi gặp gỡ đặc biệt dành cho KAIRO và KALEO với những màn trình diễn trực tiếp, giao lưu cùng người hâm mộ và nhiều hoạt động tương tác thú vị.","image":"images/event/kairo-shiny-paradise-fan-meeting.png","link":"#"},{"title":"BLUEPRINT – Mini Album Showcase","type":"Showcase","date":"20.09.2026","status":"ended","description":"Sự kiện showcase giới thiệu mini album BLUEPRINT, đánh dấu một cột mốc đáng nhớ trong hành trình trưởng thành về âm nhạc và phong cách biểu diễn của KAIRO.","image":"images/event/kairo-blueprint-showcase.png","link":"#"}],"musicVideos":[{"title":"BLUEPRINT","type":"Official Music Video","youtubeId":"a1vHjBy85TU"},{"title":"SHINY PARADISE","type":"Official Music Video","youtubeId":"WXS-o57VJ5w"}]}'),
    ('mira', N'{"handle":"@mira.official","photo":"images/artists/mira.png","summary":"MIRA là nữ ca sĩ solo nổi bật với phong cách V-Pop và Dance-pop trẻ trung, ngọt ngào. Sở hữu chất giọng trong trẻo cùng hình tượng nữ tính, vui tươi, MIRA không ngừng làm mới bản thân và lan tỏa năng lượng tích cực đến cộng đồng người hâm mộ MIEL.","communityLink":"artist-community.html?id=2","social":{"youtube":"","instagram":"","tiktok":""},"promotion":{"title":"Lưu giữ những khoảnh khắc ngọt ngào cùng MIRA.","description":"Khám phá bộ sưu tập merchandise chính thức dành cho những người hâm mộ MIRA và cộng đồng MIEL.","image":"images/banners/Mira-banner.png","link":"products.html"},"information":[{"year":"2.2023","title":"First Bloom","description":"Chính thức debut solo với digital single đầu tay \"First Bloom\", đánh dấu sự khởi đầu trong hành trình âm nhạc của MIRA."},{"year":"5.2023","title":"First Fan Meeting","description":"Tổ chức buổi gặp gỡ người hâm mộ đầu tiên, tạo nên dấu mốc đặc biệt trong hành trình kết nối cùng cộng đồng MIEL."},{"year":"9.2024","title":"Summer in My Pocket","description":"Ra mắt mini album đầu tay với ca khúc chủ đề \"Summer Diary\", mang đến hình ảnh trẻ trung, năng động và đầy màu sắc."},{"year":"12.2025","title":"Beyond the Stars","description":"Phát hành mini album thứ hai với ca khúc chủ đề \"Orbit\", đánh dấu sự trưởng thành trong phong cách âm nhạc và hình ảnh nghệ thuật."},{"year":"3.2026","title":"MIRA: THE NEXT CHAPTER","description":"Tổ chức concert solo đầu tiên, đánh dấu bước tiến mới trong sự nghiệp và hành trình phát triển nghệ thuật của MIRA."}],"activities":[{"title":"MIEL Streaming Party – ORBIT","type":"STREAMING PROJECT","date":"05.11.2026 – 15.11.2026","status":"ongoing","description":"Dự án streaming do cộng đồng MIEL tổ chức nhằm lan tỏa ca khúc \"Orbit\" và ủng hộ hành trình âm nhạc của MIRA.","image":"images/event/mira-streaming-party.png","link":"#"},{"title":"MIRA – THE NEXT CHAPTER","type":"FIRST SOLO CONCERT","date":"29.11.2026","status":"upcoming","description":"Concert solo đầu tiên của MIRA, hứa hẹn mang đến những màn trình diễn đặc biệt cùng các ca khúc nổi bật trong hành trình âm nhạc của cô.","image":"images/event/mira-the-next-chapter.png","link":"#"},{"title":"BEYOND THE STARS – Listening Party","type":"ALBUM EVENT","date":"20.09.2026","status":"ended","description":"Sự kiện nghe album \"Beyond the Stars\" dành cho người hâm mộ, cùng khám phá những giai điệu và câu chuyện phía sau ca khúc \"Orbit\".","image":"images/event/mira-beyond-the-stars.png","link":"#"}],"musicVideos":[{"title":"FIRST BLOOM","type":"Official Music Video","youtubeId":"eHHQaoEW30Q"},{"title":"BEYOND THE STARS","type":"Official Music Video","youtubeId":"vPwaXytZcgI"}]}'),
    ('rhea', N'{"handle":"@rhea.official","photo":"images/artists/rhea.png","summary":"RHEA là nữ nghệ sĩ solo theo đuổi phong cách Dark Pop, Hip-hop và Alternative R&B. Với hình tượng mạnh mẽ, sắc sảo và cá tính, RHEA tạo dấu ấn qua âm nhạc độc đáo cùng những màn trình diễn đầy cuốn hút, đồng thời thể hiện tinh thần tự do và bản lĩnh nghệ thuật.","communityLink":"artist-community.html?id=3","social":{"youtube":"https://www.youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A","instagram":"https://www.instagram.com/blackpinkofficial","tiktok":"https://www.tiktok.com/@bp_tiktok?_r=1&_t=ZS-9BESqXDVPap"},"promotion":{"title":"Thể hiện cá tính riêng cùng bộ sưu tập RHEA.","description":"Khám phá merchandise chính thức mang dấu ấn nghệ thuật độc đáo của RHEA.","image":"images/banners/Rhea-banner.png","link":"products.html"},"information":[{"year":"11/2021","title":"Official Debut","description":"Chính thức debut với digital single đầu tay \"REDLINE\"."},{"year":"03/2023","title":"First Mini Album","description":"Ra mắt mini album đầu tay \"AFTER DARK\"."},{"year":"09/2024","title":"First Solo Showcase","description":"Tổ chức showcase cá nhân \"RHEA: UNBOUND\"."},{"year":"05/2025","title":"Second Mini Album","description":"Phát hành mini album \"OUT OF FRAME\"."},{"year":"08/2026","title":"ECLIPSE","description":"Trở lại với dự án âm nhạc mới \"ECLIPSE\"."}],"activities":[{"title":"ECLIPSE – Comeback Streaming Project","type":"Hoạt động cộng đồng","date":"05.11.2026 – 15.11.2026","status":"ongoing","description":"Cùng VANTA tham gia chiến dịch nghe nhạc và chia sẻ dự án ECLIPSE, lan tỏa sản phẩm âm nhạc mới của RHEA trên các nền tảng trực tuyến.","image":"images/event/rhea-eclipse-comback-streaming-project.png","link":"#"},{"title":"RHEA – ECLIPSE Showcase","type":"Showcase","date":"22.11.2026","status":"upcoming","description":"Sự kiện giới thiệu dự án ECLIPSE với những màn trình diễn trực tiếp, chia sẻ về quá trình sản xuất âm nhạc và giao lưu cùng người hâm mộ.","image":"images/event/rhea-eclipse-showcase.png","link":"#"},{"title":"OUT OF FRAME – Special Fan Event","type":"Fan Event","date":"20.09.2026","status":"ended","description":"Sự kiện đặc biệt dành cho VANTA nhân dịp phát hành mini album OUT OF FRAME, với các hoạt động giao lưu và trải nghiệm merchandise độc quyền.","image":"images/event/rhea-out-of-frame.png","link":"#"}],"musicVideos":[{"title":"ECLIPSE","type":"Official Music Video","youtubeId":"2S24-y0Ij3Y"},{"title":"OUT OF FRAME","type":"Official Music Video","youtubeId":"IHNzOHi8sJs"}]}');

    IF COL_LENGTH(N'dbo.Artists', N'ProfileDataJson') IS NULL
        THROW 51001, 'Run database/migration-artist-profile-data-json.sql before seed-data.sql.', 1;

    -- Reject an email already owned by a different role; never promote it implicitly.
    IF EXISTS (
        SELECT 1
        FROM @Artists s
        JOIN dbo.Users u ON u.Email = s.Email
        WHERE u.Role <> 'Artist'
    )
        THROW 51002, 'An artist email already exists with a non-Artist role; no account permissions were changed.', 1;

    -- Create only missing artist accounts with a random, non-PasswordHasher marker.
    -- Existing PasswordHash, Role, and Status values are never updated.
    INSERT INTO dbo.Users (Email, PasswordHash, FullName, Role, Status)
    SELECT
        s.Email,
        CONCAT('LOCKED_IMPORT_', CONVERT(VARCHAR(64), CRYPT_GEN_RANDOM(32), 2)),
        s.Name,
        'Artist',
        'Locked'
    FROM @Artists s
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.Users u WITH (UPDLOCK, HOLDLOCK)
        WHERE u.Email = s.Email
    );

    IF EXISTS (
        SELECT 1
        FROM @Artists s
        LEFT JOIN dbo.Users u ON u.Email = s.Email
        WHERE u.UserId IS NULL OR u.Role <> 'Artist'
    )
        THROW 51003, 'An artist account could not be linked to a User with Role=Artist.', 1;

    IF EXISTS (
        SELECT 1
        FROM dbo.Artists a
        JOIN @Artists s ON s.Slug = a.Slug
        JOIN dbo.Users u ON u.Email = s.Email
        WHERE a.UserId <> u.UserId
    )
        THROW 51004, 'An existing artist slug is linked to another user; seed stopped to preserve the link.', 1;

    IF EXISTS (
        SELECT 1
        FROM @Artists s
        JOIN dbo.Users u ON u.Email = s.Email
        JOIN dbo.Artists a ON a.UserId = u.UserId
        WHERE a.Slug <> s.Slug
    )
        THROW 51005, 'An artist user is already linked to a different artist slug; seed stopped to preserve the link.', 1;

    -- Them nghe si neu chua co
    INSERT INTO dbo.Artists
        (UserId, Name, Slug, Bio, Style,
         AvatarUrl, CoverUrl)
    SELECT
        u.UserId, s.Name, s.Slug, s.Bio, s.Style,
        s.AvatarUrl, s.CoverUrl
    FROM @Artists s
    JOIN dbo.Users u ON u.Email = s.Email
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Artists a
        WHERE a.Slug = s.Slug
    );

    -- Restore details from SeedData.cs. Existing non-NULL profile edits are preserved.
    UPDATE a
    SET a.ProfileDataJson = p.ProfileDataJson
    FROM dbo.Artists a
    JOIN @Artists s ON s.Slug = a.Slug
    JOIN @ArtistProfiles p ON p.Slug = a.Slug
    WHERE a.ProfileDataJson IS NULL;

    /* ========================================================
       2. DANH MUC SAN PHAM
       ======================================================== */

    DECLARE @Categories TABLE (
        Slug VARCHAR(100) PRIMARY KEY,
        Name NVARCHAR(100)
    );

    INSERT INTO @Categories VALUES
    ('ao-thun', N'Áo thun'),
    ('ao-khoac', N'Áo hoodie'),
    ('quan-dai', N'Quần dài'),
    ('quan-short', N'Quần short'),
    ('day-deo', N'Dây đeo'),
    ('moc-khoa', N'Móc khóa'),
    ('card', N'Card'),
    ('phone-case', N'Phone case'),
    ('pin-cai', N'Pin cài'),
    ('sticker', N'Sticker'),
    ('tui-tote', N'Túi tote'),
    ('tui-deo-cheo', N'Túi đeo chéo'),
    ('album', N'Album'),
    ('lightstick', N'Lightstick');

    INSERT INTO dbo.Categories (Name, Slug)
    SELECT c.Name, c.Slug
    FROM @Categories c
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Categories x
        WHERE x.Slug = c.Slug
    );

    /* ========================================================
       3. DANH SACH 13 SAN PHAM TU PRODUCTS.JS

       ImagePrefix + so thu tu + duoi file
       Duoc dung de tao 4 anh cho moi san pham.

       Slug SQL = owniverse-js-{id}
       ======================================================== */

    DECLARE @Products TABLE (
        JSId INT PRIMARY KEY,
        Name NVARCHAR(200),
        Price DECIMAL(18,2),
        CategorySlug VARCHAR(100),
        ArtistSlug VARCHAR(100),
        Description NVARCHAR(MAX),
        ImagePrefix NVARCHAR(200),
        FirstExt VARCHAR(5)
    );

    INSERT INTO @Products VALUES

    (1, N'Áo thun Signature - Kairo', 450000,
     'ao-thun', 'kairo',
     N'Áo thun cotton dày dặn, form oversize, thiết kế logo Signature đường chỉ nổi hiện đại.',
     N'Kairo-ao-thun', '.jpg'),

    (2, N'Album After Dark - Rhea', 549000,
     'album', 'rhea',
     N'Album After Dark của Rhea phiên bản vật lý, kèm photobook, poster và photocard ngẫu nhiên. Số lượng có hạn.',
     N'rhea-album', '.png'),

    (3, N'Sticker họa tiết - Mira', 80000,
     'sticker', 'mira',
     N'Bộ sticker họa tiết do Mira thiết kế, chất liệu vinyl chống nước, dán được lên laptop, sổ tay và bình nước.',
     N'Mira-sticker', '.jpg'),

    (4, N'Hoodie Signature - Kairo', 900000,
     'ao-khoac', 'kairo',
     N'Hoodie nỉ bông dày, mũ hai lớp, logo Signature thêu ở ngực. Giữ ấm tốt, form oversize dễ phối đồ.',
     N'Kairo-Hoodie', '.jpg'),

    (5, N'Áo thun Vanta Club', 600000,
     'ao-thun', 'rhea',
     N'Áo thun Vanta Club của Rhea với họa tiết in kỹ thuật cao, bền màu sau nhiều lần giặt. Chất cotton mềm, thấm hút tốt.',
     N'rhea-ao-thun', '.png'),

    (6, N'Móc khóa Acrylic - Mira', 100000,
     'moc-khoa', 'mira',
     N'Móc khóa acrylic trong suốt in hình Mira hai mặt, kèm khoen kim loại chắc chắn. Nhỏ gọn, dễ treo lên túi hoặc chùm chìa khóa.',
     N'Mira-moc-khoa', '.jpg'),

    (7, N'Túi tote Signature - Kairo', 250000,
     'tui-tote', 'kairo',
     N'Túi tote canvas dày in logo Signature, có túi nhỏ bên trong và quai đeo vai thoải mái. Phù hợp đi học, đi làm và đi chơi.',
     N'Kairo-tui-tote', '.png'),

    (8, N'Album Beyond the Star - Mira', 499000,
     'album', 'mira',
     N'Album Beyond the Star của Mira phiên bản vật lý, gồm đĩa, photobook và thẻ ảnh. Thiết kế bìa độc quyền của Owniverse.',
     N'Mira-album', '.png'),

    (9, N'Single Album First Light - Kairo', 350000,
     'album', 'kairo',
     N'Single album đầu tay "First Light" phát hành ngày 21.06.2024 đánh dấu màn debut chính thức của Kairo. Kèm photobook và 2 photocard, 1 sticker, 1 post card, 1 CD, 1 giấy lyrics.',
     N'kairo-debut-album', '.png'),

    (10, N'Mini Album BLUEPRINT - Kairo', 480000,
     'album', 'kairo',
     N'First mini album "BLUEPRINT" phát hành năm 2025. Kèm photobook và 1 card, 1 photostrip, 1 giấy lyrics, 1 CD.',
     N'kairo-mini-album', '.png'),

    (11, N'Full Album Shiny Paradise - Kairo', 620000,
     'album', 'kairo',
     N'First Full Album "Shiny Paradise" phát hành năm 2026. Bản vật lý cao cấp kèm đĩa CD, 2 card, sách ảnh 100 trang, 1 bookmark và 1 giấy lyrics.',
     N'kairo-full-album', '.png'),

    (12, N'Debut Single First Bloom - Mira', 350000,
     'album', 'mira',
     N'Single ra mắt năm 2023 với title track "First Bloom", mang phong cách tươi mới, mộng mơ và tràn đầy năng lượng tuổi trẻ của MIRA. Gồm photobook, 2 card, 1 sticker, 1 giấy lyrics và 1 CD.',
     N'mira-debut-album', '.png'),

    (13, N'1st Mini Album Summer in My Pocket - Mira',
     480000, 'album', 'mira',
     N'Mini album đầu tay phát hành năm 2024 với ca khúc chủ đề "Summer Diary". Concept mùa hè đầy màu sắc, rực rỡ và năng động. Gồm photobook, 1 card, 1 bookmark, 1 giấy lyrics và 1 CD.',
     N'mira-mini-album', '.png');

    /* ========================================================
       4. LUU SAN PHAM VAO DATABASE
       ======================================================== */

    -- Neu chua co san pham nao, giu ProductId = id trong JS.
    -- Neu da co san pham, khong ghi de ID hien co.

    IF NOT EXISTS (SELECT 1 FROM dbo.Products)
    BEGIN
        SET IDENTITY_INSERT dbo.Products ON;
        SET @IdentityInsertOn = 1;

        INSERT INTO dbo.Products
            (ProductId, ArtistId, CategoryId, Name,
             Slug, Description, BasePrice)
        SELECT
            s.JSId,
            a.ArtistId,
            c.CategoryId,
            s.Name,
            CONCAT('owniverse-js-', s.JSId),
            s.Description,
            s.Price
        FROM @Products s
        JOIN dbo.Artists a
            ON a.Slug = s.ArtistSlug
        JOIN dbo.Categories c
            ON c.Slug = s.CategorySlug;

        SET IDENTITY_INSERT dbo.Products OFF;
        SET @IdentityInsertOn = 0;
    END
    ELSE
    BEGIN
        -- Insert missing products only; preserve any edits to existing products.
        INSERT INTO dbo.Products
            (ArtistId, CategoryId, Name, Slug,
             Description, BasePrice)
        SELECT
            a.ArtistId,
            c.CategoryId,
            s.Name,
            CONCAT('owniverse-js-', s.JSId),
            s.Description,
            s.Price
        FROM @Products s
        JOIN dbo.Artists a
            ON a.Slug = s.ArtistSlug
        JOIN dbo.Categories c
            ON c.Slug = s.CategorySlug
        WHERE NOT EXISTS (
            SELECT 1 FROM dbo.Products p
            WHERE p.Slug = CONCAT('owniverse-js-', s.JSId)
        );
    END;

    /* ========================================================
       5. ANH SAN PHAM
       Moi san pham co 4 anh nhu PRODUCTS.JS
       ======================================================== */

    ;WITH ImageSources AS (
        SELECT
            p.ProductId,
            CONCAT(
                N'images/products/',
                s.ImagePrefix,
                '-',
                RIGHT(CONCAT('0', n.Seq), 2),
                CASE
                    WHEN n.Seq = 1 THEN s.FirstExt
                    ELSE '.png'
                END
            ) AS ImageUrl,
            n.Seq
        FROM @Products s
        JOIN dbo.Products p
            ON p.Slug = CONCAT('owniverse-js-', s.JSId)
        CROSS JOIN (VALUES (1), (2), (3), (4)) n(Seq)
    )
    INSERT INTO dbo.ProductImages
        (ProductId, ImageUrl, IsPrimary, SortOrder)
    SELECT
        i.ProductId,
        i.ImageUrl,
        CASE WHEN i.Seq = 1 THEN 1 ELSE 0 END,
        i.Seq - 1
    FROM ImageSources i
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.ProductImages x
        WHERE x.ProductId = i.ProductId
          AND x.ImageUrl = i.ImageUrl
    );

    /* ========================================================
       6. BIEN THE SAN PHAM TAM THOI

       JS chua co du lieu ton kho rieng.
       Chi tao 1 bien the mac dinh cho san pham
       chua co bien the. Ton kho = 0.
       ======================================================== */

    INSERT INTO dbo.ProductVariants
        (ProductId, Sku, StockQuantity)
    SELECT
        p.ProductId,
        CONCAT('OWN-JS-', s.JSId),
        0
    FROM @Products s
    JOIN dbo.Products p
        ON p.Slug = CONCAT('owniverse-js-', s.JSId)
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.ProductVariants v
        WHERE v.ProductId = p.ProductId
    );

    /* ========================================================
       7. CONG DONG NGHE SI
       ======================================================== */

    INSERT INTO dbo.Communities
        (ArtistId, Name, Description)
    SELECT
        a.ArtistId,
        a.Name + N' Community',
        N'Cộng đồng chính thức của ' + a.Name
    FROM dbo.Artists a
    JOIN @Artists s ON s.Slug = a.Slug
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.Communities c
        WHERE c.ArtistId = a.ArtistId
    );

    /* ========================================================
       8. PHUONG THUC THANH TOAN
       ======================================================== */

    INSERT INTO dbo.PaymentMethods (Code, Name)
    SELECT v.Code, v.Name
    FROM (VALUES
        ('COD', N'Thanh toán khi nhận hàng'),
        ('BANK_TRANSFER', N'Chuyển khoản ngân hàng'),
        ('MOMO', N'Ví MoMo'),
        ('VNPAY', N'VNPay')
    ) v(Code, Name)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.PaymentMethods m
        WHERE m.Code = v.Code
    );

    /* ========================================================
       9. PHUONG THUC VAN CHUYEN
       ======================================================== */

    INSERT INTO dbo.ShippingMethods
        (Code, Name, Description)
    SELECT v.Code, v.Name, v.Description
    FROM (VALUES
        ('STANDARD', N'Giao hàng tiêu chuẩn',
         N'Phí và thời gian giao hàng sẽ được cập nhật'),
        ('EXPRESS', N'Giao hàng nhanh',
         N'Phí và thời gian giao hàng sẽ được cập nhật')
    ) v(Code, Name, Description)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.ShippingMethods m
        WHERE m.Code = v.Code
    );

    COMMIT TRANSACTION;
    PRINT N'Import dữ liệu Owniverse hoàn tất.';
END TRY
BEGIN CATCH
    IF @IdentityInsertOn = 1
        SET IDENTITY_INSERT dbo.Products OFF;

    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
