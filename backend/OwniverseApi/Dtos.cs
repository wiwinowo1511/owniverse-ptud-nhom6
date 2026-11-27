using System.Text.Json.Serialization;

namespace OwniverseApi;

public sealed record UserDto(
    int Id,
    string FullName,
    string Email,
    string Phone,
    string Address,
    string Role,
    string Status,
    DateTime CreatedAt,
    int? ArtistId,
    string? ArtistSlug);

public sealed record ArtistDto(
    int Id,
    int? UserId,
    string Slug,
    string Name,
    string Handle,
    string Genre,
    string Description,
    string Cover,
    string Avatar,
    string Photo,
    string Summary,
    string CommunityLink,
    SocialLinks Social,
    Promotion Promotion,
    List<TimelineItem> Information,
    List<ArtistActivity> Activities,
    List<MusicVideo> MusicVideos,
    string Status,
    string AdminNote);

public sealed record CategoryDto(
    int Id,
    string Slug,
    string Name,
    int ProductCount);

public sealed record ProductVariantDto(
    int Id,
    string Sku,
    string Name,
    int Stock);

public sealed record ProductDto(
    int Id,
    string Name,
    string Description,
    int Price,
    int ArtistId,
    string ArtistName,
    int CategoryId,
    string CategoryName,
    string Image,
    List<string> Images,
    string Status,
    int TotalStock,
    List<ProductVariantDto> Variants);

public sealed record PublicProductDto(
    int Id,
    string Name,
    string Description,
    int Price,
    int ArtistId,
    string Artist,
    int CategoryId,
    string Category,
    string Image,
    List<string> Images,
    int Stock,
    List<ProductVariantDto> Variants);

public sealed record CartItemDto(
    int ProductId,
    int VariantId,
    string ProductName,
    string Artist,
    string Category,
    string Image,
    string Sku,
    string VariantName,
    int UnitPrice,
    int Quantity,
    int Stock,
    int LineTotal);

public sealed record CartDto(
    List<CartItemDto> Items,
    int TotalQuantity,
    int Subtotal);

public sealed record OrderItemDto(
    int VariantId,
    string ProductName,
    string Sku,
    int UnitPrice,
    int Quantity,
    int LineTotal);

public sealed record OrderDto(
    int Id,
    string Code,
    string ReceiverName,
    string ReceiverPhone,
    string ShippingAddress,
    string Note,
    decimal ShippingFee,
    decimal TotalAmount,
    string Status,
    string StatusLabel,
    DateTime CreatedAt,
    List<OrderItemDto> Items);

public sealed record CommunityDto(
    int Id,
    int ArtistId,
    string Name,
    string Description,
    string Avatar,
    string Cover,
    int MemberCount,
    bool IsMember);

public sealed record CommunityPostView(
    int PostId,
    int CommunityId,
    int AuthorId,
    string AuthorName,
    string Section,
    string? Content,
    bool IsPinned,
    string Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    int LikeCount,
    int CommentCount,
    bool LikedByMe,
    List<CommunityMediaView> Media);

public sealed record CommunityMediaView(
    int MediaId,
    string MediaType,
    string MediaUrl,
    int SortOrder);

public sealed record CommunityCommentView(
    int CommentId,
    int PostId,
    int UserId,
    string AuthorName,
    int? ParentCommentId,
    string Content,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record ErrorResponse(
    bool Success,
    string Message,
    string? ErrorCode = null,
    object? Data = null);

public sealed record SuccessResponse<T>(
    bool Success,
    string Message,
    T Data);

public sealed record ValidationErrorResponse(
    bool Success,
    string Message,
    string ErrorCode,
    Dictionary<string, string[]> Errors);