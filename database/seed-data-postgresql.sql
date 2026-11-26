-- Du lieu mau Owniverse cho PostgreSQL / Neon
-- Chay sau create-database-postgresql.sql
BEGIN;

-- Tai khoan nghe si
INSERT INTO
  public.Users (Email, PasswordHash, FullName, Role, Status)
VALUES
  (
    'kairo@owniverse.vn',
    'LOCKED_IMPORT_KAIRO',
    'KAIRO',
    'Artist',
    'Locked'
  ),
  (
    'mira@owniverse.vn',
    'LOCKED_IMPORT_MIRA',
    'MIRA',
    'Artist',
    'Locked'
  ),
  (
    'rhea@owniverse.vn',
    'LOCKED_IMPORT_RHEA',
    'RHEA',
    'Artist',
    'Locked'
  ) ON CONFLICT (Email) DO NOTHING;

INSERT INTO
  public.Artists (
    UserId,
    Name,
    Slug,
    Bio,
    Style,
    AvatarUrl,
    CoverUrl
  )
SELECT
  u.UserId,
  v.Name,
  v.Slug,
  v.Bio,
  v.Style,
  v.AvatarUrl,
  v.CoverUrl
FROM
  (
    VALUES
      (
        'kairo@owniverse.vn',
        'KAIRO',
        'kairo',
        'KAIRO là nam ca sĩ solo người Việt Nam theo đuổi Pop, R&B và Dance-pop hiện đại. Với hình tượng trẻ trung, tinh nghịch cùng nguồn năng lượng tích cực, anh mang đến những màn trình diễn cuốn hút và gần gũi.',
        'Pop / R&B / Dance-pop',
        'images/artists/Kairo-01.png',
        'images/banners/Kairo-banner.png'
      ),
      (
        'mira@owniverse.vn',
        'MIRA',
        'mira',
        'MIRA là nữ ca sĩ solo theo đuổi V-Pop và Dance-pop với hình ảnh trẻ trung, ngọt ngào. Sở hữu chất giọng trong trẻo cùng nguồn năng lượng tích cực, cô luôn mang đến màu sắc tươi sáng trong âm nhạc.',
        'V-Pop / Dance-pop',
        'images/artists/Mira-01.png',
        'images/banners/Mira-banner.png'
      ),
      (
        'rhea@owniverse.vn',
        'RHEA',
        'rhea',
        'RHEA là nữ nghệ sĩ solo theo đuổi Dark Pop, Hip-hop và Alternative R&B. Với hình tượng mạnh mẽ, sắc sảo và cá tính độc lập, cô tạo nên dấu ấn riêng thông qua âm nhạc và phong cách nghệ thuật khác biệt.',
        'Dark Pop / Hip-hop / Alternative R&B',
        'images/artists/Rhea-01.png',
        'images/banners/Rhea-banner.png'
      )
  ) AS v(
    Email,
    Name,
    Slug,
    Bio,
    Style,
    AvatarUrl,
    CoverUrl
  )
  JOIN public.Users u ON u.Email = v.Email ON CONFLICT (Slug) DO
UPDATE
SET
  Name = EXCLUDED.Name,
  Bio = EXCLUDED.Bio,
  Style = EXCLUDED.Style,
  AvatarUrl = EXCLUDED.AvatarUrl,
  CoverUrl = EXCLUDED.CoverUrl;

-- Tai khoan khach hang demo
INSERT INTO
  public.Users (Email, PasswordHash, FullName, Role, Status)
VALUES
  (
    'customer@owniverse.com',
    'AQAAAAIAAYagAAAAEHKn423aZR+aOefrHKYiX38ifhzsNas4FGS7TWfFnMtLU6yoQyE32ilwbsXjGhQOlw==',
    'Khách hàng demo',
    'Customer',
    'Active'
  ) ON CONFLICT (Email) DO NOTHING;

INSERT INTO
  public.Categories (Name, Slug)
VALUES
  ('Áo thun', 'ao-thun'),
  ('Áo hoodie', 'ao-khoac'),
  ('Quần dài', 'quan-dai'),
  ('Quần short', 'quan-short'),
  ('Dây đeo', 'day-deo'),
  ('Móc khóa', 'moc-khoa'),
  ('Card', 'card'),
  ('Phone case', 'phone-case'),
  ('Pin cài', 'pin-cai'),
  ('Sticker', 'sticker'),
  ('Túi tote', 'tui-tote'),
  ('Túi đeo chéo', 'tui-deo-cheo'),
  ('Album', 'album'),
  ('Lightstick', 'lightstick') ON CONFLICT (Slug) DO NOTHING;

INSERT INTO
  public.Products (
    ArtistId,
    CategoryId,
    Name,
    Slug,
    Description,
    BasePrice
  )
SELECT
  a.ArtistId,
  c.CategoryId,
  v.Name,
  'owniverse-js-' || v.Id,
  v.Description,
  v.Price
FROM
  (
    VALUES
      (
        1,
        'Áo thun Signature - Kairo',
        'Áo thun cotton dày dặn, form oversize, thiết kế logo Signature đường chỉ nổi hiện đại.',
        450000,
        'ao-thun',
        'kairo'
      ),
      (
        2,
        'Album After Dark - Rhea',
        'Album After Dark của Rhea phiên bản vật lý, kèm photobook, poster và photocard ngẫu nhiên. Số lượng có hạn.',
        549000,
        'album',
        'rhea'
      ),
      (
        3,
        'Sticker họa tiết - Mira',
        'Bộ sticker họa tiết do Mira thiết kế, chất liệu vinyl chống nước, dán được lên laptop, sổ tay và bình nước.',
        80000,
        'sticker',
        'mira'
      ),
      (
        4,
        'Hoodie Signature - Kairo',
        'Hoodie nỉ bông dày, mũ hai lớp, logo Signature thêu ở ngực. Giữ ấm tốt, form oversize dễ phối đồ.',
        900000,
        'ao-khoac',
        'kairo'
      ),
      (
        5,
        'Áo thun Vanta Club',
        'Áo thun Vanta Club của Rhea với họa tiết in kỹ thuật cao, bền màu sau nhiều lần giặt. Chất cotton mềm, thấm hút tốt.',
        600000,
        'ao-thun',
        'rhea'
      ),
      (
        6,
        'Móc khóa Acrylic - Mira',
        'Móc khóa acrylic trong suốt in hình Mira hai mặt, kèm khoen kim loại chắc chắn. Nhỏ gọn, dễ treo lên túi hoặc chùm chìa khóa.',
        100000,
        'moc-khoa',
        'mira'
      ),
      (
        7,
        'Túi tote Signature - Kairo',
        'Túi tote canvas dày in logo Signature, có túi nhỏ bên trong và quai đeo vai thoải mái. Phù hợp đi học, đi làm và đi chơi.',
        250000,
        'tui-tote',
        'kairo'
      ),
      (
        8,
        'Album Beyond the Star - Mira',
        'Album Beyond the Star của Mira phiên bản vật lý, gồm đĩa, photobook và thẻ ảnh. Thiết kế bìa độc quyền của Owniverse.',
        499000,
        'album',
        'mira'
      ),
      (
        9,
        'Single Album First Light - Kairo',
        'Single album đầu tay First Light phát hành ngày 21.06.2024 đánh dấu màn debut chính thức của Kairo. Kèm photobook và 2 photocard, 1 sticker, 1 post card, 1 CD, 1 giấy lyrics.',
        350000,
        'album',
        'kairo'
      ),
      (
        10,
        'Mini Album BLUEPRINT - Kairo',
        'First mini album BLUEPRINT phát hành năm 2025. Kèm photobook và 1 card, 1 photostrip, 1 giấy lyrics, 1 CD.',
        480000,
        'album',
        'kairo'
      ),
      (
        11,
        'Full Album Shiny Paradise - Kairo',
        'First Full Album Shiny Paradise phát hành năm 2026. Bản vật lý cao cấp kèm đĩa CD, 2 card, sách ảnh 100 trang, 1 bookmark và 1 giấy lyrics.',
        620000,
        'album',
        'kairo'
      ),
      (
        12,
        'Debut Single First Bloom - Mira',
        'Single ra mắt năm 2023 với title track First Bloom, mang phong cách tươi mới, mộng mơ và tràn đầy năng lượng tuổi trẻ của MIRA. Gồm photobook, 2 card, 1 sticker, 1 giấy lyrics và 1 CD.',
        350000,
        'album',
        'mira'
      ),
      (
        13,
        '1st Mini Album Summer in My Pocket - Mira',
        'Mini album đầu tay phát hành năm 2024 với ca khúc chủ đề Summer Diary. Concept mùa hè đầy màu sắc, rực rỡ và năng động. Gồm photobook, 1 card, 1 bookmark, 1 giấy lyrics và 1 CD.',
        480000,
        'album',
        'mira'
      )
  ) AS v(
    Id,
    Name,
    Description,
    Price,
    CategorySlug,
    ArtistSlug
  )
  JOIN public.Artists a ON a.Slug = v.ArtistSlug
  JOIN public.Categories c ON c.Slug = v.CategorySlug ON CONFLICT (Slug) DO
UPDATE
SET
  Name = EXCLUDED.Name,
  ArtistId = EXCLUDED.ArtistId,
  CategoryId = EXCLUDED.CategoryId,
  Description = EXCLUDED.Description,
  BasePrice = EXCLUDED.BasePrice;

-- Anh san pham: tao 4 duong dan anh cho moi san pham
INSERT INTO
  public.ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder)
SELECT
  p.ProductId,
  'images/products/' || v.Prefix || '-' || lpad(n.Seq :: text, 2, '0') || CASE
    WHEN n.Seq = 1 THEN v.FirstExt
    ELSE '.png'
  END,
  n.Seq = 1,
  n.Seq -1
FROM
  (
    VALUES
      (1, 'Kairo-ao-thun', '.jpg'),
      (2, 'rhea-album', '.png'),
      (3, 'Mira-sticker', '.jpg'),
      (4, 'Kairo-Hoodie', '.jpg'),
      (5, 'rhea-ao-thun', '.png'),
      (6, 'Mira-moc-khoa', '.jpg'),
      (7, 'Kairo-tui-tote', '.png'),
      (8, 'Mira-album', '.png'),
      (9, 'kairo-debut-album', '.png'),
      (10, 'kairo-mini-album', '.png'),
      (11, 'kairo-full-album', '.png'),
      (12, 'mira-debut-album', '.png'),
      (13, 'mira-mini-album', '.png')
  ) v(Id, Prefix, FirstExt)
  JOIN public.Products p ON p.Slug = 'owniverse-js-' || v.Id
  CROSS JOIN generate_series(1, 4) AS n(Seq)
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      public.ProductImages old
    WHERE
      old.ProductId = p.ProductId
      AND old.ImageUrl = 'images/products/' || v.Prefix || '-' || lpad(n.Seq :: text, 2, '0') || CASE
        WHEN n.Seq = 1 THEN v.FirstExt
        ELSE '.png'
      END
  );

INSERT INTO
  public.ProductVariants (ProductId, Sku, StockQuantity)
SELECT
  p.ProductId,
  'OWN-JS-' || v.Id,
  0
FROM
  (
    VALUES
      (1),
      (2),
      (3),
      (4),
      (5),
      (6),
      (7),
      (8),
      (9),
      (10),
      (11),
      (12),
      (13)
  ) v(Id)
  JOIN public.Products p ON p.Slug = 'owniverse-js-' || v.Id
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      public.ProductVariants x
    WHERE
      x.ProductId = p.ProductId
  );

INSERT INTO
  public.Communities (ArtistId, Name, Description)
SELECT
  a.ArtistId,
  a.Name || ' Community',
  'Cộng đồng chính thức của ' || a.Name
FROM
  public.Artists a
WHERE
  a.Slug IN ('kairo', 'mira', 'rhea') ON CONFLICT (ArtistId) DO NOTHING;

INSERT INTO
  public.PaymentMethods (Code, Name)
VALUES
  ('COD', 'Thanh toán khi nhận hàng'),
  ('BANK_TRANSFER', 'Chuyển khoản ngân hàng'),
  ('MOMO', 'Ví MoMo'),
  ('VNPAY', 'VNPay') ON CONFLICT (Code) DO NOTHING;

INSERT INTO
  public.ShippingMethods (Code, Name, Description)
VALUES
  (
    'STANDARD',
    'Giao hàng tiêu chuẩn',
    'Phí và thời gian giao hàng sẽ được cập nhật'
  ),
  (
    'EXPRESS',
    'Giao hàng nhanh',
    'Phí và thời gian giao hàng sẽ được cập nhật'
  ) ON CONFLICT (Code) DO NOTHING;

COMMIT;