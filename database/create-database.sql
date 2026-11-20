/* =====================================================================
   01_create_database.sql - Tạo database Owniverse
   Collation Vietnamese_CI_AS: không phân biệt hoa/thường, có phân biệt dấu.
   Nếu báo lỗi collation, xóa mệnh đề COLLATE để dùng collation mặc định.
   ===================================================================== */
USE master;
GO

IF DB_ID(N'Owniverse') IS NULL
    CREATE DATABASE Owniverse COLLATE Vietnamese_CI_AS;
GO

/* =====================================================================
   02_accounts_artists.sql - Tài khoản và nghệ sĩ
   Bảng: Users, PasswordResetTokens, UserAddresses, Artists, ArtistImages
   ===================================================================== */
USE Owniverse;
GO

CREATE TABLE dbo.Users (
    UserId        INT IDENTITY(1,1) NOT NULL,
    Email         NVARCHAR(255)     NOT NULL,
    PasswordHash  NVARCHAR(255)     NOT NULL,
    FullName      NVARCHAR(100)     NOT NULL,
    Phone         VARCHAR(20)       NULL,
    Address       NVARCHAR(500)     NOT NULL CONSTRAINT DF_Users_Address DEFAULT N'',
    AvatarUrl     NVARCHAR(500)     NULL,
    Role          VARCHAR(20)       NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'Customer',
    Status        VARCHAR(20)       NOT NULL CONSTRAINT DF_Users_Status DEFAULT 'Active',
    CreatedAt     DATETIME2         NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    CONSTRAINT PK_Users PRIMARY KEY (UserId),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT CK_Users_Role CHECK (Role IN ('Customer','Artist','Admin')),
    CONSTRAINT CK_Users_Status CHECK (Status IN ('Active','Locked'))
);
GO

CREATE TABLE dbo.PasswordResetTokens (
    TokenId    INT IDENTITY(1,1) NOT NULL,
    UserId     INT               NOT NULL,
    TokenHash  VARCHAR(64)       NOT NULL,   -- SHA-256 của token, không lưu token gốc
    ExpiresAt  DATETIME2         NOT NULL,
    UsedAt     DATETIME2         NULL,       -- NULL = chưa dùng
    CreatedAt  DATETIME2         NOT NULL CONSTRAINT DF_PwdReset_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_PasswordResetTokens PRIMARY KEY (TokenId),
    CONSTRAINT UQ_PasswordResetTokens_Hash UNIQUE (TokenHash),
    CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.UserAddresses (
    AddressId      INT IDENTITY(1,1) NOT NULL,
    UserId         INT               NOT NULL,
    ReceiverName   NVARCHAR(100)     NOT NULL,
    ReceiverPhone  VARCHAR(20)       NOT NULL,
    AddressLine    NVARCHAR(255)     NOT NULL,
    Ward           NVARCHAR(100)     NULL,
    District       NVARCHAR(100)     NULL,
    City           NVARCHAR(100)     NOT NULL,   -- tỉnh/thành, dùng tra phí ship
    IsDefault      BIT               NOT NULL CONSTRAINT DF_UserAddresses_IsDefault DEFAULT 0,
    CONSTRAINT PK_UserAddresses PRIMARY KEY (AddressId),
    CONSTRAINT FK_UserAddresses_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Artists (
    ArtistId   INT IDENTITY(1,1) NOT NULL,
    UserId     INT               NULL,           -- tài khoản đăng nhập của nghệ sĩ (1:1, có thể chưa liên kết)
    Name       NVARCHAR(100)     NOT NULL,       -- KAIRO, MIRA, RHEA
    Slug       VARCHAR(100)      NOT NULL,
    Bio        NVARCHAR(MAX)     NULL,
    Style      NVARCHAR(200)     NULL,           -- phong cách nghệ sĩ
    AvatarUrl  NVARCHAR(500)     NULL,
    CoverUrl   NVARCHAR(500)     NULL,
    Status     VARCHAR(20)       NOT NULL CONSTRAINT DF_Artists_Status DEFAULT 'Active',
    CreatedAt  DATETIME2         NOT NULL CONSTRAINT DF_Artists_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt  DATETIME2         NULL,
    CONSTRAINT PK_Artists PRIMARY KEY (ArtistId),
    CONSTRAINT UQ_Artists_Name UNIQUE (Name),
    CONSTRAINT UQ_Artists_Slug UNIQUE (Slug),
    CONSTRAINT CK_Artists_Status CHECK (Status IN ('Active','Inactive')),
    CONSTRAINT FK_Artists_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);
GO

CREATE TABLE dbo.ArtistApiData (
    ArtistId   INT            NOT NULL,
    DataJson   NVARCHAR(MAX)  NOT NULL,
    CONSTRAINT PK_ArtistApiData PRIMARY KEY (ArtistId),
    CONSTRAINT FK_ArtistApiData_Artists FOREIGN KEY (ArtistId)
        REFERENCES dbo.Artists (ArtistId) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.ArtistImages (
    ImageId    INT IDENTITY(1,1) NOT NULL,
    ArtistId   INT               NOT NULL,
    ImageUrl   NVARCHAR(500)     NOT NULL,
    Caption    NVARCHAR(255)     NULL,
    SortOrder  INT               NOT NULL CONSTRAINT DF_ArtistImages_SortOrder DEFAULT 0,
    CONSTRAINT PK_ArtistImages PRIMARY KEY (ImageId),
    CONSTRAINT FK_ArtistImages_Artists FOREIGN KEY (ArtistId)
        REFERENCES dbo.Artists (ArtistId) ON DELETE CASCADE
);
GO

/* =====================================================================
   03_catalog.sql - Sản phẩm và yêu thích
   Bảng: Categories, Products, ProductVariants, ProductImages, Wishlists
   ===================================================================== */
USE Owniverse;
GO

CREATE TABLE dbo.Categories (
    CategoryId   INT IDENTITY(1,1) NOT NULL,
    Name         NVARCHAR(100)     NOT NULL,
    Slug         VARCHAR(100)      NOT NULL,
    Description  NVARCHAR(500)     NULL,
    IsActive     BIT               NOT NULL CONSTRAINT DF_Categories_IsActive DEFAULT 1,
    CONSTRAINT PK_Categories PRIMARY KEY (CategoryId),
    CONSTRAINT UQ_Categories_Name UNIQUE (Name),
    CONSTRAINT UQ_Categories_Slug UNIQUE (Slug)
);
GO

CREATE TABLE dbo.Products (
    ProductId    INT IDENTITY(1,1) NOT NULL,
    ArtistId     INT               NOT NULL,
    CategoryId   INT               NOT NULL,
    Name         NVARCHAR(200)     NOT NULL,
    Slug         VARCHAR(200)      NOT NULL,
    Description  NVARCHAR(MAX)     NULL,
    BasePrice    DECIMAL(18,2)     NOT NULL,
    IsFeatured   BIT               NOT NULL CONSTRAINT DF_Products_IsFeatured DEFAULT 0,
    Status       VARCHAR(20)       NOT NULL CONSTRAINT DF_Products_Status DEFAULT 'Active',
    CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2         NULL,
    CONSTRAINT PK_Products PRIMARY KEY (ProductId),
    CONSTRAINT UQ_Products_Slug UNIQUE (Slug),
    CONSTRAINT CK_Products_BasePrice CHECK (BasePrice >= 0),
    CONSTRAINT CK_Products_Status CHECK (Status IN ('Draft','Active','Hidden')),
    CONSTRAINT FK_Products_Artists FOREIGN KEY (ArtistId) REFERENCES dbo.Artists (ArtistId),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories (CategoryId)
);
GO

CREATE TABLE dbo.ProductVariants (
    VariantId      INT IDENTITY(1,1) NOT NULL,
    ProductId      INT               NOT NULL,
    Sku            VARCHAR(50)       NOT NULL,
    DisplayName    NVARCHAR(100)     NOT NULL CONSTRAINT DF_ProductVariants_DisplayName DEFAULT N'Mặc định',
    Size           NVARCHAR(30)      NULL,
    Color          NVARCHAR(50)      NULL,
    PriceDelta     DECIMAL(18,2)     NOT NULL CONSTRAINT DF_ProductVariants_PriceDelta DEFAULT 0,
    StockQuantity  INT               NOT NULL CONSTRAINT DF_ProductVariants_Stock DEFAULT 0,
    IsActive       BIT               NOT NULL CONSTRAINT DF_ProductVariants_IsActive DEFAULT 1,
    CONSTRAINT PK_ProductVariants PRIMARY KEY (VariantId),
    CONSTRAINT UQ_ProductVariants_Sku UNIQUE (Sku),
    CONSTRAINT CK_ProductVariants_Stock CHECK (StockQuantity >= 0),
    CONSTRAINT FK_ProductVariants_Products FOREIGN KEY (ProductId)
        REFERENCES dbo.Products (ProductId) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX UX_ProductVariants_Product_Size_Color
    ON dbo.ProductVariants (ProductId, Size, Color)
    WHERE Size IS NOT NULL;
GO

CREATE UNIQUE INDEX UX_ProductVariants_Product_Color
    ON dbo.ProductVariants (ProductId, Color)
    WHERE Size IS NULL AND Color IS NOT NULL;
GO

CREATE TABLE dbo.ProductImages (
    ImageId    INT IDENTITY(1,1) NOT NULL,
    ProductId  INT               NOT NULL,
    ImageUrl   NVARCHAR(500)     NOT NULL,
    IsPrimary  BIT               NOT NULL CONSTRAINT DF_ProductImages_IsPrimary DEFAULT 0,
    SortOrder  INT               NOT NULL CONSTRAINT DF_ProductImages_SortOrder DEFAULT 0,
    CONSTRAINT PK_ProductImages PRIMARY KEY (ImageId),
    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId)
        REFERENCES dbo.Products (ProductId) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Wishlists (
    UserId     INT        NOT NULL,
    ProductId  INT        NOT NULL,
    AddedAt    DATETIME2  NOT NULL CONSTRAINT DF_Wishlists_AddedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Wishlists PRIMARY KEY (UserId, ProductId),
    CONSTRAINT FK_Wishlists_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Wishlists_Products FOREIGN KEY (ProductId)
        REFERENCES dbo.Products (ProductId) ON DELETE CASCADE
);
GO

/* =====================================================================
   04_shipping_payment_coupons.sql - Các bảng tra cứu
   Bảng: ShippingMethods, ShippingRates, PaymentMethods, Coupons
   ===================================================================== */
USE Owniverse;
GO

CREATE TABLE dbo.ShippingMethods (
    ShippingMethodId  INT IDENTITY(1,1) NOT NULL,
    Code              VARCHAR(20)       NOT NULL,   -- STANDARD, EXPRESS
    Name              NVARCHAR(100)     NOT NULL,
    Description       NVARCHAR(255)     NULL,
    IsActive          BIT               NOT NULL CONSTRAINT DF_ShippingMethods_IsActive DEFAULT 1,
    CONSTRAINT PK_ShippingMethods PRIMARY KEY (ShippingMethodId),
    CONSTRAINT UQ_ShippingMethods_Code UNIQUE (Code)
);
GO

CREATE TABLE dbo.ShippingRates (
    RateId            INT IDENTITY(1,1) NOT NULL,
    ShippingMethodId  INT               NOT NULL,
    City              NVARCHAR(100)     NOT NULL,   -- phải khớp UserAddresses.City
    Fee               DECIMAL(18,2)     NOT NULL,
    CONSTRAINT PK_ShippingRates PRIMARY KEY (RateId),
    CONSTRAINT UQ_ShippingRates_Method_City UNIQUE (ShippingMethodId, City),
    CONSTRAINT CK_ShippingRates_Fee CHECK (Fee >= 0),
    CONSTRAINT FK_ShippingRates_ShippingMethods FOREIGN KEY (ShippingMethodId)
        REFERENCES dbo.ShippingMethods (ShippingMethodId)
);
GO

CREATE TABLE dbo.PaymentMethods (
    MethodId  INT IDENTITY(1,1) NOT NULL,
    Code      VARCHAR(30)       NOT NULL,   -- COD, BANK_TRANSFER, MOMO...
    Name      NVARCHAR(100)     NOT NULL,
    IsActive  BIT               NOT NULL CONSTRAINT DF_PaymentMethods_IsActive DEFAULT 1,
    CONSTRAINT PK_PaymentMethods PRIMARY KEY (MethodId),
    CONSTRAINT UQ_PaymentMethods_Code UNIQUE (Code)
);
GO

CREATE TABLE dbo.Coupons (
    CouponId           INT IDENTITY(1,1) NOT NULL,
    Code               VARCHAR(30)       NOT NULL,
    Description        NVARCHAR(255)     NULL,
    DiscountType       VARCHAR(10)       NOT NULL,   -- Percent | Fixed
    DiscountValue      DECIMAL(18,2)     NOT NULL,
    MaxDiscountAmount  DECIMAL(18,2)     NULL,       -- giảm tối đa (cho Percent)
    MinOrderAmount     DECIMAL(18,2)     NOT NULL CONSTRAINT DF_Coupons_MinOrder DEFAULT 0,
    UsageLimit         INT               NULL,       -- NULL = không giới hạn
    PerUserLimit       INT               NOT NULL CONSTRAINT DF_Coupons_PerUser DEFAULT 1,
    StartsAt           DATETIME2         NOT NULL,
    ExpiresAt          DATETIME2         NOT NULL,
    IsActive           BIT               NOT NULL CONSTRAINT DF_Coupons_IsActive DEFAULT 1,
    CreatedAt          DATETIME2         NOT NULL CONSTRAINT DF_Coupons_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Coupons PRIMARY KEY (CouponId),
    CONSTRAINT UQ_Coupons_Code UNIQUE (Code),
    CONSTRAINT CK_Coupons_Type CHECK (DiscountType IN ('Percent','Fixed')),
    CONSTRAINT CK_Coupons_Value CHECK (
        DiscountValue > 0 AND (DiscountType = 'Fixed' OR DiscountValue <= 100)),
    CONSTRAINT CK_Coupons_MaxDiscount CHECK (MaxDiscountAmount IS NULL OR MaxDiscountAmount > 0),
    CONSTRAINT CK_Coupons_MinOrder CHECK (MinOrderAmount >= 0),
    CONSTRAINT CK_Coupons_UsageLimit CHECK (UsageLimit IS NULL OR UsageLimit > 0),
    CONSTRAINT CK_Coupons_PerUser CHECK (PerUserLimit >= 1),
    CONSTRAINT CK_Coupons_Dates CHECK (ExpiresAt > StartsAt)
);
GO

/* =====================================================================
   05_cart_orders.sql - Giỏ hàng, đơn hàng, vận chuyển, thanh toán
   Bảng: Carts, CartItems, Orders, OrderItems, OrderStatusHistory,
         Payments, Shipments, ShipmentEvents
   ===================================================================== */
USE Owniverse;
GO

CREATE TABLE dbo.Carts (
    CartId     INT IDENTITY(1,1) NOT NULL,
    UserId     INT               NOT NULL,
    CreatedAt  DATETIME2         NOT NULL CONSTRAINT DF_Carts_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt  DATETIME2         NULL,
    CONSTRAINT PK_Carts PRIMARY KEY (CartId),
    CONSTRAINT UQ_Carts_UserId UNIQUE (UserId),
    CONSTRAINT FK_Carts_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.CartItems (
    CartItemId  INT IDENTITY(1,1) NOT NULL,
    CartId      INT               NOT NULL,
    VariantId   INT               NOT NULL,
    Quantity    INT               NOT NULL,
    AddedAt     DATETIME2         NOT NULL CONSTRAINT DF_CartItems_AddedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_CartItems PRIMARY KEY (CartItemId),
    CONSTRAINT UQ_CartItems_Cart_Variant UNIQUE (CartId, VariantId),
    CONSTRAINT CK_CartItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartId)
        REFERENCES dbo.Carts (CartId) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_ProductVariants FOREIGN KEY (VariantId)
        REFERENCES dbo.ProductVariants (VariantId)
);
GO

CREATE TABLE dbo.Orders (
    OrderId           INT IDENTITY(1,1) NOT NULL,
    OrderCode         VARCHAR(20)       NOT NULL,
    UserId            INT               NOT NULL,
    ShippingMethodId  INT               NOT NULL,
    CouponId          INT               NULL,
    ReceiverName      NVARCHAR(100)     NOT NULL,   -- snapshot
    ReceiverPhone     VARCHAR(20)       NOT NULL,   -- snapshot
    ShippingAddress   NVARCHAR(500)     NOT NULL,   -- snapshot địa chỉ đầy đủ
    Note              NVARCHAR(500)     NULL,
    DiscountAmount    DECIMAL(18,2)     NOT NULL CONSTRAINT DF_Orders_Discount DEFAULT 0,
    ShippingFee       DECIMAL(18,2)     NOT NULL CONSTRAINT DF_Orders_ShippingFee DEFAULT 0,
    TotalAmount       DECIMAL(18,2)     NOT NULL,   -- = tiền hàng - giảm giá + phí ship
    OrderStatus       VARCHAR(20)       NOT NULL CONSTRAINT DF_Orders_Status DEFAULT 'Pending',
    CancelReason      NVARCHAR(500)     NULL,
    CancelledAt       DATETIME2         NULL,
    CreatedAt         DATETIME2         NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2         NULL,
    CONSTRAINT PK_Orders PRIMARY KEY (OrderId),
    CONSTRAINT UQ_Orders_OrderCode UNIQUE (OrderCode),
    CONSTRAINT CK_Orders_Status CHECK (OrderStatus IN
        ('Pending','Confirmed','Processing','Shipping','Delivered','Cancelled')),
    CONSTRAINT CK_Orders_Amounts CHECK (DiscountAmount >= 0 AND ShippingFee >= 0 AND TotalAmount >= 0),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Orders_ShippingMethods FOREIGN KEY (ShippingMethodId)
        REFERENCES dbo.ShippingMethods (ShippingMethodId),
    CONSTRAINT FK_Orders_Coupons FOREIGN KEY (CouponId) REFERENCES dbo.Coupons (CouponId)
);
GO

CREATE TABLE dbo.OrderItems (
    OrderItemId  INT IDENTITY(1,1) NOT NULL,
    OrderId      INT               NOT NULL,
    VariantId    INT               NOT NULL,   -- để truy vết và thống kê
    ProductName  NVARCHAR(200)     NOT NULL,   -- snapshot
    Sku          VARCHAR(50)       NOT NULL,   -- snapshot
    Size         NVARCHAR(30)      NULL,       -- snapshot
    Color        NVARCHAR(50)      NULL,       -- snapshot
    UnitPrice    DECIMAL(18,2)     NOT NULL,   -- đơn giá lúc mua
    Quantity     INT               NOT NULL,
    CONSTRAINT PK_OrderItems PRIMARY KEY (OrderItemId),
    CONSTRAINT UQ_OrderItems_Order_Variant UNIQUE (OrderId, VariantId),
    CONSTRAINT CK_OrderItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_OrderItems_UnitPrice CHECK (UnitPrice >= 0),
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders (OrderId),
    CONSTRAINT FK_OrderItems_ProductVariants FOREIGN KEY (VariantId)
        REFERENCES dbo.ProductVariants (VariantId)
);
GO

CREATE TABLE dbo.OrderStatusHistory (
    HistoryId  INT IDENTITY(1,1) NOT NULL,
    OrderId    INT               NOT NULL,
    Status     VARCHAR(20)       NOT NULL,
    ChangedBy  INT               NULL,         -- NULL = hệ thống
    Note       NVARCHAR(500)     NULL,
    ChangedAt  DATETIME2         NOT NULL CONSTRAINT DF_OrderStatusHistory_ChangedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_OrderStatusHistory PRIMARY KEY (HistoryId),
    CONSTRAINT CK_OrderStatusHistory_Status CHECK (Status IN
        ('Pending','Confirmed','Processing','Shipping','Delivered','Cancelled')),
    CONSTRAINT FK_OrderStatusHistory_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders (OrderId),
    CONSTRAINT FK_OrderStatusHistory_Users FOREIGN KEY (ChangedBy) REFERENCES dbo.Users (UserId)
);
GO

CREATE TABLE dbo.Payments (
    PaymentId        INT IDENTITY(1,1) NOT NULL,
    OrderId          INT               NOT NULL,
    MethodId         INT               NOT NULL,
    Amount           DECIMAL(18,2)     NOT NULL,
    PaymentStatus    VARCHAR(20)       NOT NULL CONSTRAINT DF_Payments_Status DEFAULT 'Pending',
    TransactionCode  VARCHAR(100)      NULL,       -- unique có lọc ở file 08
    PaidAt           DATETIME2         NULL,
    CreatedAt        DATETIME2         NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2         NULL,
    CONSTRAINT PK_Payments PRIMARY KEY (PaymentId),
    CONSTRAINT CK_Payments_Amount CHECK (Amount > 0),
    CONSTRAINT CK_Payments_Status CHECK (PaymentStatus IN ('Pending','Paid','Failed','Refunded')),
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders (OrderId),
    CONSTRAINT FK_Payments_PaymentMethods FOREIGN KEY (MethodId)
        REFERENCES dbo.PaymentMethods (MethodId)
);
GO

CREATE TABLE dbo.Shipments (
    ShipmentId           INT IDENTITY(1,1) NOT NULL,
    OrderId              INT               NOT NULL,   -- 1:1 với đơn hàng
    Carrier              NVARCHAR(100)     NOT NULL,
    TrackingCode         VARCHAR(50)       NULL,       -- unique có lọc ở file 08
    ShipmentStatus       VARCHAR(20)       NOT NULL CONSTRAINT DF_Shipments_Status DEFAULT 'Preparing',
    EstimatedDeliveryAt  DATETIME2         NULL,
    ShippedAt            DATETIME2         NULL,
    DeliveredAt          DATETIME2         NULL,
    CreatedAt            DATETIME2         NOT NULL CONSTRAINT DF_Shipments_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt            DATETIME2         NULL,
    CONSTRAINT PK_Shipments PRIMARY KEY (ShipmentId),
    CONSTRAINT UQ_Shipments_OrderId UNIQUE (OrderId),
    CONSTRAINT CK_Shipments_Status CHECK (ShipmentStatus IN
        ('Preparing','PickedUp','InTransit','Delivered','Failed','Returned')),
    CONSTRAINT FK_Shipments_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders (OrderId)
);
GO

CREATE TABLE dbo.ShipmentEvents (
    EventId     INT IDENTITY(1,1) NOT NULL,
    ShipmentId  INT               NOT NULL,
    Status      VARCHAR(20)       NOT NULL,
    Location    NVARCHAR(255)     NULL,
    Note        NVARCHAR(500)     NULL,
    EventAt     DATETIME2         NOT NULL CONSTRAINT DF_ShipmentEvents_EventAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_ShipmentEvents PRIMARY KEY (EventId),
    CONSTRAINT CK_ShipmentEvents_Status CHECK (Status IN
        ('Preparing','PickedUp','InTransit','Delivered','Failed','Returned')),
    CONSTRAINT FK_ShipmentEvents_Shipments FOREIGN KEY (ShipmentId)
        REFERENCES dbo.Shipments (ShipmentId) ON DELETE CASCADE
);
GO

/* =====================================================================
   06_reviews.sql - Đánh giá sản phẩm
   Bảng: ProductReviews, ReviewImages
   Quy tắc "chỉ đơn Delivered, đúng người mua mới được đánh giá" kiểm tra ở Service.
   ===================================================================== */
USE Owniverse;
GO

CREATE TABLE dbo.ProductReviews (
    ReviewId     INT IDENTITY(1,1) NOT NULL,
    OrderItemId  INT               NOT NULL,   -- mỗi dòng đơn đánh giá 1 lần
    Rating       TINYINT           NOT NULL,
    Comment      NVARCHAR(2000)    NULL,
    Status       VARCHAR(20)       NOT NULL CONSTRAINT DF_ProductReviews_Status DEFAULT 'Visible',
    CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_ProductReviews_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2         NULL,
    CONSTRAINT PK_ProductReviews PRIMARY KEY (ReviewId),
    CONSTRAINT UQ_ProductReviews_OrderItemId UNIQUE (OrderItemId),
    CONSTRAINT CK_ProductReviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT CK_ProductReviews_Status CHECK (Status IN ('Visible','Hidden')),
    CONSTRAINT FK_ProductReviews_OrderItems FOREIGN KEY (OrderItemId)
        REFERENCES dbo.OrderItems (OrderItemId)
);
GO

CREATE TABLE dbo.ReviewImages (
    ReviewImageId  INT IDENTITY(1,1) NOT NULL,
    ReviewId       INT               NOT NULL,
    ImageUrl       NVARCHAR(500)     NOT NULL,
    SortOrder      INT               NOT NULL CONSTRAINT DF_ReviewImages_SortOrder DEFAULT 0,
    CONSTRAINT PK_ReviewImages PRIMARY KEY (ReviewImageId),
    CONSTRAINT FK_ReviewImages_ProductReviews FOREIGN KEY (ReviewId)
        REFERENCES dbo.ProductReviews (ReviewId) ON DELETE CASCADE
);
GO

/* =====================================================================
   07_community.sql - Cộng đồng và thông báo
   Bảng: Communities, CommunityMembers, Posts, PostMedia, PostLikes,
         PostShares, Comments, Reports, Notifications
   Phải chạy SAU file 05 vì Notifications tham chiếu Orders.
   Các quy tắc phân quyền (ai được đăng/tương tác) kiểm tra ở Service.
   ===================================================================== */
USE Owniverse;
GO

CREATE TABLE dbo.Communities (
    CommunityId  INT IDENTITY(1,1) NOT NULL,
    ArtistId     INT               NOT NULL,   -- mỗi nghệ sĩ 1 cộng đồng
    Name         NVARCHAR(150)     NOT NULL,
    Description  NVARCHAR(1000)    NULL,
    AvatarUrl    NVARCHAR(500)     NULL,
    CoverUrl     NVARCHAR(500)     NULL,
    CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_Communities_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Communities PRIMARY KEY (CommunityId),
    CONSTRAINT UQ_Communities_ArtistId UNIQUE (ArtistId),
    CONSTRAINT FK_Communities_Artists FOREIGN KEY (ArtistId) REFERENCES dbo.Artists (ArtistId)
);
GO

CREATE TABLE dbo.CommunityMembers (
    CommunityId  INT        NOT NULL,
    UserId       INT        NOT NULL,
    JoinedAt     DATETIME2  NOT NULL CONSTRAINT DF_CommunityMembers_JoinedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_CommunityMembers PRIMARY KEY (CommunityId, UserId),
    CONSTRAINT FK_CommunityMembers_Communities FOREIGN KEY (CommunityId)
        REFERENCES dbo.Communities (CommunityId) ON DELETE CASCADE,
    CONSTRAINT FK_CommunityMembers_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);
GO

CREATE TABLE dbo.Posts (
    PostId       INT IDENTITY(1,1) NOT NULL,
    CommunityId  INT               NOT NULL,
    AuthorId     INT               NOT NULL,
    Section      VARCHAR(10)       NOT NULL,   -- Artist | Fan
    Content      NVARCHAR(MAX)     NULL,       -- app kiểm tra phải có chữ hoặc media
    IsPinned     BIT               NOT NULL CONSTRAINT DF_Posts_IsPinned DEFAULT 0,
    PinnedAt     DATETIME2         NULL,
    Status       VARCHAR(20)       NOT NULL CONSTRAINT DF_Posts_Status DEFAULT 'Visible',
    CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_Posts_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2         NULL,
    CONSTRAINT PK_Posts PRIMARY KEY (PostId),
    CONSTRAINT CK_Posts_Section CHECK (Section IN ('Artist','Fan')),
    CONSTRAINT CK_Posts_Status CHECK (Status IN ('Visible','Hidden','Deleted')),
    CONSTRAINT FK_Posts_Communities FOREIGN KEY (CommunityId) REFERENCES dbo.Communities (CommunityId),
    CONSTRAINT FK_Posts_Users FOREIGN KEY (AuthorId) REFERENCES dbo.Users (UserId)
);
GO

CREATE TABLE dbo.PostMedia (
    MediaId    INT IDENTITY(1,1) NOT NULL,
    PostId     INT               NOT NULL,
    MediaType  VARCHAR(10)       NOT NULL,
    MediaUrl   NVARCHAR(500)     NOT NULL,
    SortOrder  INT               NOT NULL CONSTRAINT DF_PostMedia_SortOrder DEFAULT 0,
    CONSTRAINT PK_PostMedia PRIMARY KEY (MediaId),
    CONSTRAINT CK_PostMedia_Type CHECK (MediaType IN ('Image','Video')),
    CONSTRAINT FK_PostMedia_Posts FOREIGN KEY (PostId)
        REFERENCES dbo.Posts (PostId) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.PostLikes (
    PostId     INT        NOT NULL,
    UserId     INT        NOT NULL,
    CreatedAt  DATETIME2  NOT NULL CONSTRAINT DF_PostLikes_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_PostLikes PRIMARY KEY (PostId, UserId),
    CONSTRAINT FK_PostLikes_Posts FOREIGN KEY (PostId)
        REFERENCES dbo.Posts (PostId) ON DELETE CASCADE,
    CONSTRAINT FK_PostLikes_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);
GO

CREATE TABLE dbo.PostShares (
    ShareId    INT IDENTITY(1,1) NOT NULL,
    PostId     INT               NOT NULL,
    UserId     INT               NOT NULL,
    CreatedAt  DATETIME2         NOT NULL CONSTRAINT DF_PostShares_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_PostShares PRIMARY KEY (ShareId),   -- cho phép 1 người chia sẻ nhiều lần
    CONSTRAINT FK_PostShares_Posts FOREIGN KEY (PostId)
        REFERENCES dbo.Posts (PostId) ON DELETE CASCADE,
    CONSTRAINT FK_PostShares_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);
GO

CREATE TABLE dbo.Comments (
    CommentId        INT IDENTITY(1,1) NOT NULL,
    PostId           INT               NOT NULL,
    UserId           INT               NOT NULL,
    ParentCommentId  INT               NULL,       -- NULL = bình luận gốc, có giá trị = phản hồi
    Content          NVARCHAR(2000)    NOT NULL,
    Status           VARCHAR(20)       NOT NULL CONSTRAINT DF_Comments_Status DEFAULT 'Visible',
    CreatedAt        DATETIME2         NOT NULL CONSTRAINT DF_Comments_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2         NULL,
    CONSTRAINT PK_Comments PRIMARY KEY (CommentId),
    CONSTRAINT CK_Comments_Status CHECK (Status IN ('Visible','Hidden','Deleted')),
    CONSTRAINT FK_Comments_Posts FOREIGN KEY (PostId) REFERENCES dbo.Posts (PostId),
    CONSTRAINT FK_Comments_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Comments_Parent FOREIGN KEY (ParentCommentId) REFERENCES dbo.Comments (CommentId)
);
GO

CREATE TABLE dbo.Reports (
    ReportId    INT IDENTITY(1,1) NOT NULL,
    ReporterId  INT               NOT NULL,
    PostId      INT               NULL,
    CommentId   INT               NULL,
    Reason      NVARCHAR(500)     NOT NULL,
    Status      VARCHAR(20)       NOT NULL CONSTRAINT DF_Reports_Status DEFAULT 'Pending',
    HandledBy   INT               NULL,
    HandledAt   DATETIME2         NULL,
    CreatedAt   DATETIME2         NOT NULL CONSTRAINT DF_Reports_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Reports PRIMARY KEY (ReportId),
    CONSTRAINT CK_Reports_Status CHECK (Status IN ('Pending','Resolved','Rejected')),
    -- Đúng một trong hai: báo cáo bài đăng HOẶC báo cáo bình luận
    CONSTRAINT CK_Reports_Target CHECK (
        (PostId IS NOT NULL AND CommentId IS NULL) OR
        (PostId IS NULL AND CommentId IS NOT NULL)),
    CONSTRAINT FK_Reports_Reporter FOREIGN KEY (ReporterId) REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Reports_Posts FOREIGN KEY (PostId) REFERENCES dbo.Posts (PostId),
    CONSTRAINT FK_Reports_Comments FOREIGN KEY (CommentId) REFERENCES dbo.Comments (CommentId),
    CONSTRAINT FK_Reports_HandledBy FOREIGN KEY (HandledBy) REFERENCES dbo.Users (UserId)
);
GO

CREATE TABLE dbo.Notifications (
    NotificationId  INT IDENTITY(1,1) NOT NULL,
    UserId          INT               NOT NULL,   -- người nhận
    ActorId         INT               NULL,       -- người gây ra hành động (NULL = hệ thống)
    Type            VARCHAR(30)       NOT NULL,
    PostId          INT               NULL,
    CommentId       INT               NULL,
    OrderId         INT               NULL,
    IsRead          BIT               NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
    CreatedAt       DATETIME2         NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Notifications PRIMARY KEY (NotificationId),
    CONSTRAINT CK_Notifications_Type CHECK (Type IN
        ('PostLike','PostComment','CommentReply','PostShare','ArtistPost','OrderDelivered')),
    -- Mỗi loại thông báo dùng đúng các cột liên kết của nó
    CONSTRAINT CK_Notifications_Links CHECK (
        (Type IN ('PostLike','PostShare','ArtistPost')
            AND PostId IS NOT NULL AND CommentId IS NULL AND OrderId IS NULL)
     OR (Type IN ('PostComment','CommentReply')
            AND PostId IS NOT NULL AND CommentId IS NOT NULL AND OrderId IS NULL)
     OR (Type = 'OrderDelivered'
            AND OrderId IS NOT NULL AND PostId IS NULL AND CommentId IS NULL)),
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Notifications_Actor FOREIGN KEY (ActorId) REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Notifications_Posts FOREIGN KEY (PostId) REFERENCES dbo.Posts (PostId),
    CONSTRAINT FK_Notifications_Comments FOREIGN KEY (CommentId) REFERENCES dbo.Comments (CommentId),
    CONSTRAINT FK_Notifications_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders (OrderId)
);
GO

/* =====================================================================
   08_indexes.sql - Unique có lọc và index hiệu năng
   ===================================================================== */
USE Owniverse;
GO
SET QUOTED_IDENTIFIER ON;   -- bắt buộc khi tạo filtered index
GO

/* ---- Unique có lọc (filtered unique index) ---- */

-- Mã giao dịch cổng thanh toán không trùng (bỏ qua NULL)
CREATE UNIQUE INDEX UX_Payments_TransactionCode
    ON dbo.Payments (TransactionCode) WHERE TransactionCode IS NOT NULL;

-- Mã vận đơn không trùng (bỏ qua NULL)
CREATE UNIQUE INDEX UX_Shipments_TrackingCode
    ON dbo.Shipments (TrackingCode) WHERE TrackingCode IS NOT NULL;

-- Mỗi người dùng chỉ có 1 địa chỉ mặc định
CREATE UNIQUE INDEX UX_UserAddresses_OneDefaultPerUser
    ON dbo.UserAddresses (UserId) WHERE IsDefault = 1;
CREATE UNIQUE INDEX UX_Artists_UserId
    ON dbo.Artists (UserId) WHERE UserId IS NOT NULL;

-- Một người không báo cáo trùng cùng bài đăng / cùng bình luận
CREATE UNIQUE INDEX UX_Reports_Reporter_Post
    ON dbo.Reports (ReporterId, PostId) WHERE PostId IS NOT NULL;
CREATE UNIQUE INDEX UX_Reports_Reporter_Comment
    ON dbo.Reports (ReporterId, CommentId) WHERE CommentId IS NOT NULL;
GO

/* ---- Index hiệu năng ---- */

-- Sản phẩm: lọc theo nghệ sĩ, danh mục, sắp xếp giá; tìm theo tên
CREATE INDEX IX_Products_Artist_Category_Price ON dbo.Products (ArtistId, CategoryId, BasePrice);
CREATE INDEX IX_Products_Name ON dbo.Products (Name);
CREATE INDEX IX_Products_Featured ON dbo.Products (IsFeatured) WHERE IsFeatured = 1;
CREATE INDEX IX_ProductImages_ProductId ON dbo.ProductImages (ProductId);
CREATE INDEX IX_Wishlists_ProductId ON dbo.Wishlists (ProductId);
CREATE INDEX IX_CartItems_VariantId ON dbo.CartItems (VariantId);

-- Đơn hàng
CREATE INDEX IX_Orders_User_Created ON dbo.Orders (UserId, CreatedAt DESC);
CREATE INDEX IX_Orders_Coupon_User ON dbo.Orders (CouponId, UserId) WHERE CouponId IS NOT NULL;
CREATE INDEX IX_Orders_Status_Created ON dbo.Orders (OrderStatus, CreatedAt DESC);
CREATE INDEX IX_OrderItems_VariantId ON dbo.OrderItems (VariantId);
CREATE INDEX IX_OrderStatusHistory_OrderId ON dbo.OrderStatusHistory (OrderId, ChangedAt);
CREATE INDEX IX_Payments_OrderId ON dbo.Payments (OrderId);
CREATE INDEX IX_ShipmentEvents_ShipmentId ON dbo.ShipmentEvents (ShipmentId, EventAt);

-- Cộng đồng
CREATE INDEX IX_CommunityMembers_UserId ON dbo.CommunityMembers (UserId);
CREATE INDEX IX_Posts_Community_Section_Pinned_Created
    ON dbo.Posts (CommunityId, Section, IsPinned, CreatedAt DESC);
CREATE INDEX IX_Posts_AuthorId ON dbo.Posts (AuthorId);
CREATE INDEX IX_PostMedia_PostId ON dbo.PostMedia (PostId);
CREATE INDEX IX_PostLikes_UserId ON dbo.PostLikes (UserId);
CREATE INDEX IX_PostShares_PostId ON dbo.PostShares (PostId);
CREATE INDEX IX_Comments_PostId ON dbo.Comments (PostId, CreatedAt);
CREATE INDEX IX_Comments_ParentCommentId ON dbo.Comments (ParentCommentId) WHERE ParentCommentId IS NOT NULL;
CREATE INDEX IX_Reports_Status ON dbo.Reports (Status, CreatedAt);

-- Thông báo: tải danh sách và đếm chưa đọc
CREATE INDEX IX_Notifications_User_Read_Created ON dbo.Notifications (UserId, IsRead, CreatedAt DESC);
GO