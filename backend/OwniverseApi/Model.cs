// =====================================================
// KIỂU DỮ LIỆU (TODO-DB: sau này khớp với các bảng trong ERD)
//
// Danh sách bảng của nhóm chỉ ghi tên bảng và khóa ngoại, chưa ghi tên cột.
// Vì vậy tên thuộc tính dưới đây do mình đặt, bám theo các khóa ngoại trong tài liệu:
//   Users, Artists (Artists.UserId), Categories, Products (Products.ArtistId, Products.CategoryId),
//   ProductVariants (ProductVariants.ProductId), ProductImages (ProductImages.ProductId).
// Khi ERD có đủ cột thì sửa tên thuộc tính cho khớp.
//
// Tên thuộc tính tự động chuyển thành chữ thường đầu (FullName -> fullName)
// nên JSON trả về khớp với dữ liệu mà frontend đang dùng.
// =====================================================

// Vai trò của tài khoản (bảng Users: Customer / Artist / Admin).
// Đang dùng chữ thường để khớp với frontend; khi lên database nhớ so khớp cho đúng.
public static class Roles
{
    public const string Customer = "customer";
    public const string Artist = "artist";
    public const string Admin = "admin";
}

sealed record SessionEntry(int UserId, DateTime LastActivityUtc);

// ----- Tài khoản (bảng Users) -----
public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";

    // Không bao giờ được trả mật khẩu ra ngoài (thêm JsonIgnore để chắc chắn)
    [System.Text.Json.Serialization.JsonIgnore]
    public string Password { get; set; } = "";

    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";     // TODO-DB: bảng UserAddresses (sổ địa chỉ)
    public string Role { get; set; } = Roles.Customer;
    public string Status { get; set; } = "active"; // "active" | "locked"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ----- Nghệ sĩ (bảng Artists và các bảng con) -----
public class Artist
{

    public string Status { get; set; } = "active";
    [System.Text.Json.Serialization.JsonIgnore]
    public string AdminNote { get; set; } = "";
    public int Id { get; set; }
    public int? UserId { get; set; }                // Artists.UserId (1:1) - tài khoản đăng nhập của nghệ sĩ
    public string Slug { get; set; } = "";          // dùng trên địa chỉ: artist-detail.html?artist=kairo
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public string Genre { get; set; } = "";
    public string Description { get; set; } = "";
    public string Cover { get; set; } = "";
    public string Avatar { get; set; } = "";
    public string Photo { get; set; } = "";         // ảnh trên thẻ ở trang danh sách nghệ sĩ (artist.html)
    public string Summary { get; set; } = "";       // mô tả ngắn trên thẻ ở trang danh sách nghệ sĩ
    public string CommunityLink { get; set; } = "";
    public SocialLinks Social { get; set; } = new();
    public Promotion Promotion { get; set; } = new();
    public List<TimelineItem> Information { get; set; } = new();   // Dấu ấn nghệ thuật
    public List<ArtistActivity> Activities { get; set; } = new();  // Hoạt động
    public List<MusicVideo> MusicVideos { get; set; } = new();     // MV nổi bật
}

public class SocialLinks
{
    public string Youtube { get; set; } = "";
    public string Instagram { get; set; } = "";
    public string Tiktok { get; set; } = "";
}

public class Promotion
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Image { get; set; } = "";
    public string Link { get; set; } = "";
}

public class TimelineItem
{
    public string Year { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
}

public class ArtistActivity
{
    public string Title { get; set; } = "";
    public string Type { get; set; } = "";
    public string Date { get; set; } = "";
    public string Status { get; set; } = "upcoming"; // "ongoing" | "upcoming" | "ended"
    public string Description { get; set; } = "";
    public string Image { get; set; } = "";
    public string Link { get; set; } = "";
}

public class MusicVideo
{
    public string Title { get; set; } = "";
    public string Type { get; set; } = "";
    public string YoutubeId { get; set; } = "";
}

record Follow(int UserId, int ArtistId);

// ----- Sản phẩm (bảng Categories, Products, ProductVariants, ProductImages) -----
public class Category
{
    public int Id { get; set; }
    public string Slug { get; set; } = "";
    public string Name { get; set; } = "";
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int Price { get; set; }                  // đơn vị: đồng (VND)
    public int ArtistId { get; set; }               // Products.ArtistId
    public int CategoryId { get; set; }             // Products.CategoryId
    public string Image { get; set; } = "";         // ảnh đại diện
    public List<string> Images { get; set; } = new();   // TODO-DB: bảng ProductImages
    public string Status { get; set; } = "active";  // "active" (đang bán) | "hidden" (ẩn)
    public List<ProductVariant> Variants { get; set; } = new(); // TODO-DB: bảng ProductVariants
}

public class ProductVariant
{
    public int Id { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";          // ví dụ: "Mặc định", "Size M"
    public int Stock { get; set; }                  // tồn kho
}

public class CartItem
{
    public int VariantId { get; set; }
    public int Quantity { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public int UserId { get; set; }
    public string ReceiverName { get; set; } = "";
    public string ReceiverPhone { get; set; } = "";
    public string ShippingAddress { get; set; } = "";
    public string Note { get; set; } = "";
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int VariantId { get; set; }
    public string ProductName { get; set; } = "";
    public string Sku { get; set; } = "";
    public int UnitPrice { get; set; }
    public int Quantity { get; set; }
}

// =====================================================
// DỮ LIỆU FRONTEND GỬI LÊN
// Trường để trống (null) nghĩa là "không gửi" -> giữ nguyên giá trị cũ khi sửa.
// =====================================================

// ----- Tài khoản -----
record RegisterRequest(string? FullName, string? Email, string? Phone, string? Password);
record LoginRequest(string? Email, string? Password);
record UpdateProfileRequest(string? FullName, string? Email, string? Phone, string? Address);
record ChangePasswordRequest(string? OldPassword, string? NewPassword);

// ----- Nghệ sĩ tự sửa hồ sơ của mình -----
record ArtistSelfUpdateRequest(
    string? Handle, string? Genre, string? Description, string? Summary,
    string? Cover, string? Avatar, string? Photo,
    SocialLinks? Social, Promotion? Promotion,
    List<TimelineItem>? Information, List<ArtistActivity>? Activities, List<MusicVideo>? MusicVideos);

// ----- Quản trị -----
record AdminCreateUserRequest(string? FullName, string? Email, string? Phone, string? Address, string? Password, string? Role);
record AdminUpdateUserRequest(string? FullName, string? Email, string? Phone, string? Address, string? Role);
record AdminSetStatusRequest(string? Status);
record AdminResetPasswordRequest(string? NewPassword);
record LinkArtistAccountRequest(int? UserId);
record CategoryRequest(string? Name, string? Slug);
record ProductRequest(
    string? Name, string? Description, int? Price, int? ArtistId, int? CategoryId,
    string? Image, List<string>? Images, string? Status, List<VariantRequest>? Variants);
record VariantRequest(string? Sku, string? Name, int? Stock);
record AddCartItemRequest(int? ProductId, int? VariantId, int? Quantity);
record UpdateCartItemRequest(int? Quantity);
record CreateOrderRequest(string? ReceiverName, string? ReceiverPhone, string? ShippingAddress, string? Note);
// Thêm các kiểu này vào dự án cùng Models.cs. Không tạo trùng tên class.
record ForgotPasswordRequest(string? Email);
record ResetPasswordRequest(string? Token, string? NewPassword);
record ArtistStatusRequest(string? Status);
record AdminArtistNoteRequest(string? Note);
record AdminOrderStatusRequest(string? Status);
record AdminPromotionRequest(
    string? Code, string? Name, string? Type, decimal? Value, decimal? MinimumOrder,
    int? UsageLimit, string? Start, string? End, string? Release);

public class PasswordResetToken
{
    public Guid Id { get; set; }
    public int UserId { get; set; }
    public string TokenHash { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
}
public class Community
{
    public int Id { get; set; }
    public int ArtistId { get; set; } // UNIQUE theo ERD
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Avatar { get; set; } = "";
    public string Cover { get; set; } = "";
}
public record CommunityMember(int CommunityId, int UserId);

record CommunityPostRequest(string? Section, string? Content, List<CommunityMediaRequest>? Media);
public record CommunityMediaRequest(string? MediaType, string? MediaUrl);
record CommunityCommentRequest(string? Content, int? ParentCommentId);

public class CommunityPostView
{
    public int PostId { get; set; }
    public int CommunityId { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = "";
    public string Section { get; set; } = "";
    public string? Content { get; set; }
    public bool IsPinned { get; set; }
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public bool LikedByMe { get; set; }
    public List<CommunityMediaView> Media { get; set; } = new();
}

public record CommunityMediaView(int MediaId, string MediaType, string MediaUrl, int SortOrder);
public record CommunityCommentView(
    int CommentId, int PostId, int UserId, string AuthorName, int? ParentCommentId,
    string Content, DateTime CreatedAt, DateTime? UpdatedAt);
