using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;

namespace OwniverseApi;

public static class EndpointHelpers
{
    private static readonly Regex EmailRegex = new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.Compiled);
    private static readonly Regex SlugCharsRegex = new(@"[^a-z0-9]+", RegexOptions.Compiled);
    private static readonly Regex UriSchemeRegex = new(@"^[a-zA-Z][a-zA-Z0-9+.-]*:", RegexOptions.Compiled);

    public static IResult Msg(int status, string message) =>
        Results.Json(new ErrorResponse(false, message), statusCode: status);

    public static IResult OkResult(string message, object? data = null) =>
        Results.Json(new { success = true, message, data }, statusCode: 200);

    public static IResult CreatedResult(string message, object data, string location) =>
        Results.Created(location, new { success = true, message, data });

    public static IResult Problem(int status, string message, string? errorCode = null) =>
        Results.Json(new ErrorResponse(false, message, errorCode), statusCode: status);

    public static string NormalizeEmail(string? email) =>
        (email ?? "").Trim().ToLowerInvariant();

    public static bool IsValidEmail(string email) =>
        EmailRegex.IsMatch(email);

    public static bool IsValidRole(string role) =>
        role == Roles.Customer || role == Roles.Artist || role == Roles.Admin;

    public static string Fold(string? text)
    {
        var normalized = (text ?? "").Trim().ToLowerInvariant().Replace('đ', 'd')
            .Normalize(System.Text.NormalizationForm.FormD);
        var builder = new System.Text.StringBuilder();
        foreach (var ch in normalized)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch) != System.Globalization.UnicodeCategory.NonSpacingMark)
                builder.Append(ch);
        }
        return builder.ToString();
    }

    public static string Slugify(string? text) =>
        SlugCharsRegex.Replace(Fold(text), "-").Trim('-');

    public static bool IsAllowedArtistImageReference(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return true;
        if (UriSchemeRegex.IsMatch(value))
            return Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
        return !value.StartsWith("//", StringComparison.Ordinal)
            && value[0] != '\\'
            && !value.Contains('\0');
    }

    public static bool IsReservedSlug(string slug) => slug == "me" || int.TryParse(slug, out _);

    public static string GetToken(HttpContext ctx)
    {
        var authorization = ctx.Request.Headers.Authorization.ToString();
        return authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization[7..].Trim() : "";
    }

    public static string HashResetToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    public static string OrderStatusLabel(string status) => status switch
    {
        OrderStatus.Pending => "Chờ xác nhận",
        OrderStatus.Confirmed => "Đã xác nhận",
        OrderStatus.Processing => "Đang chuẩn bị",
        OrderStatus.Shipping => "Đang giao",
        OrderStatus.Delivered => "Đã giao",
        OrderStatus.Cancelled => "Đã hủy",
        _ => status,
    };

    public static string? ValidateCommunityMedia(List<CommunityMediaRequest>? media)
    {
        if (media is null) return null;
        if (media.Count > 10) return "Mỗi bài viết tối đa 10 tệp media";
        foreach (var item in media)
        {
            if (item.MediaType is null || !(item.MediaType.Equals(MediaType.Image, StringComparison.OrdinalIgnoreCase)
                || item.MediaType.Equals(MediaType.Video, StringComparison.OrdinalIgnoreCase)))
                return "MediaType chỉ nhận Image hoặc Video";
            var url = item.MediaUrl?.Trim() ?? "";
            if (url.Length == 0 || url.Length > 500 || url.Any(char.IsControl)) return "Đường dẫn media không hợp lệ";
            if (Uri.TryCreate(url, UriKind.Absolute, out var absolute)
                ? absolute.Scheme is not ("http" or "https")
                : url.StartsWith("//", StringComparison.Ordinal) || url.Contains("..", StringComparison.Ordinal))
                return "Media chỉ nhận URL HTTP(S) hoặc đường dẫn tương đối an toàn";
        }
        return null;
    }
}