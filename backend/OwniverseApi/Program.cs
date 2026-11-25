// =====================================================
// OWNIVERSE - BACKEND API (ASP.NET Minimal API, .NET 10)
// SQL Server là nguồn dữ liệu chính; các collection được nạp khi khởi động
// để giữ các handler hiện tại, rồi ghi đồng bộ trong transaction sau request ghi.
//
// Các file của backend:
//   Program.cs   - các API (file này)
//   Model.cs     - kiểu dữ liệu (User, Artist, Product...)
//   SeedData.cs  - dữ liệu mẫu
//   SqlDatabase.cs - nạp và lưu dữ liệu SQL Server
//
// Các phần trong file này (Ctrl + F tìm theo số):
//   1. Dữ liệu nạp từ SQL Server
//   2. Hàm hỗ trợ
//   3. Tài khoản (đăng ký, đăng nhập, hồ sơ, đổi mật khẩu)a
//   4. Nghệ sĩ (xem, theo dõi, nghệ sĩ tự sửa hồ sơ, admin thêm/sửa/xóa)
//   5. Quản trị: tài khoản
//   6. Quản trị: liên kết tài khoản nghệ sĩ
//   7. Quản trị: danh mục
//   8. Quản trị: sản phẩm và biến thể
//   9. Phần của người 2
// =====================================================

using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Npgsql;
using Npgsql.PostgresTypes;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "8080"}");
var connectionString = builder.Configuration.GetConnectionString("Owniverse")
    ?? throw new InvalidOperationException("Thiếu cấu hình ConnectionStrings:Owniverse.");
var database = new SqlDatabase(connectionString);
var adminRepository = new AdminRepository(connectionString);
var communityRepository = new CommunityRepository(connectionString);

var configuredCorsOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options => options.AddPolicy("FrontendPreview", policy =>
    policy.SetIsOriginAllowed(origin =>
        {
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
            if ((uri.Host == "localhost" || uri.Host == "127.0.0.1")
                && uri.Scheme is "http" or "https")
                return true;
            return configuredCorsOrigins.Any(allowed =>
                allowed.Trim().TrimEnd('/').Equals(origin.TrimEnd('/'), StringComparison.OrdinalIgnoreCase));
        })
        .AllowAnyHeader()
        .AllowAnyMethod()));
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
var app = builder.Build();
var passwordHasher = app.Services.GetRequiredService<IPasswordHasher<User>>();
var userRepository = new UserRepository(connectionString);
var communityRepository = new CommunityRepository(connectionString);
app.UseCors("FrontendPreview");

// =====================================================
// 1. DỮ LIỆU NẠP TỪ SQL SERVER
// =====================================================

var users = SeedData.CreateUsers();
var developmentAdmin = await AdminBootstrap.EnsureDevelopmentAdminAsync(
    app.Configuration,
    passwordHasher,
    app.Lifetime.ApplicationStopping);
if (developmentAdmin is not null)
    users.Add(developmentAdmin);

if (app.Environment.IsDevelopment())
{
    var demoCustomer = await DemoCustomerBootstrap.EnsureAsync(
        app.Configuration,
        passwordHasher,
        app.Lifetime.ApplicationStopping);
    if (demoCustomer is not null)
        users.Add(demoCustomer);

    var demoArtist = await DemoArtistBootstrap.EnsureAsync(
        app.Configuration,
        passwordHasher,
        app.Lifetime.ApplicationStopping);
    if (demoArtist is not null)
        users.Add(demoArtist);
}
var nextUserId = await userRepository.GetNextUserIdAsync(app.Lifetime.ApplicationStopping);

var artists = SeedData.CreateArtists();
var nextArtistId = artists.Max(a => a.Id) + 1;

var categories = SeedData.CreateCategories();
var nextCategoryId = categories.Max(c => c.Id) + 1;

var products = SeedData.CreateProducts();
var nextProductId = products.Max(p => p.Id) + 1;
var nextVariantId = products.SelectMany(p => p.Variants).Max(v => v.Id) + 1;

var carts = new Dictionary<int, List<CartItem>>();
var orders = new List<Order>();
var nextOrderId = 1;

// Theo DB: Artists 1:1 Communities; Users N:N Communities qua CommunityMembers.
var communities = artists.Select(a => new Community
{
    Id = a.Id, ArtistId = a.Id, Name = $"Cộng đồng {a.Name}",
    Description = a.Summary, Avatar = a.Avatar, Cover = a.Cover
}).ToList();
var communityMembers = new List<CommunityMember>();
var nextCommunityId = communities.Max(c => c.Id) + 1;

var passwordResetTokens = new List<PasswordResetToken>();

// Dữ liệu SQL là nguồn chuẩn; metadata không có cột tương ứng được giữ trong bảng ArtistApiData.
await database.CheckConnectionAsync();
await database.LoadAsync(
    users, artists, categories, products, communities, communityMembers,
    passwordResetTokens, carts, orders);

nextUserId = users.Select(user => user.Id).DefaultIfEmpty(0).Max() + 1;
nextArtistId = artists.Select(artist => artist.Id).DefaultIfEmpty(0).Max() + 1;
nextCategoryId = categories.Select(category => category.Id).DefaultIfEmpty(0).Max() + 1;
nextProductId = products.Select(product => product.Id).DefaultIfEmpty(0).Max() + 1;
nextVariantId = products.SelectMany(product => product.Variants).Select(variant => variant.Id).DefaultIfEmpty(0).Max() + 1;
nextCommunityId = communities.Select(community => community.Id).DefaultIfEmpty(0).Max() + 1;
nextOrderId = orders.Select(order => order.Id).DefaultIfEmpty(0).Max() + 1;

// Database luôn chứa PasswordHash, không bao giờ trả mật khẩu ra ngoài.
foreach (var u in users)
    if (string.IsNullOrEmpty(u.Password))
        throw new InvalidOperationException($"Tài khoản {u.Email} không có PasswordHash hợp lệ.");

// TODO-DB: có thể giữ nguyên, hoặc đổi sang JWT / bảng Sessions
var sessions = new ConcurrentDictionary<string, SessionEntry>(); // token -> user and last activity
var sessionIdleTimeout = TimeSpan.FromMinutes(30);

// =====================================================
// 2. HÀM HỖ TRỢ
// =====================================================

IResult Msg(int status, string message) => Results.Json(new { message }, statusCode: status);

string NormalizeEmail(string? email) => (email ?? "").Trim().ToLowerInvariant();

bool IsValidEmail(string email) =>
    System.Text.RegularExpressions.Regex.IsMatch(email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$");

bool IsValidRole(string role) =>
    role == Roles.Customer || role == Roles.Artist || role == Roles.Admin;

// Bỏ dấu tiếng Việt, đổi thành chữ thường: "Áo Thun" -> "ao thun" (dùng để tìm kiếm)
string Fold(string? text)
{
    var normalized = (text ?? "").Trim().ToLowerInvariant().Replace('đ', 'd')
        .Normalize(System.Text.NormalizationForm.FormD);
    var builder2 = new System.Text.StringBuilder();
    foreach (var ch in normalized)
    {
        if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch) != System.Globalization.UnicodeCategory.NonSpacingMark)
            builder2.Append(ch);
    }
    return builder2.ToString();
}

// "Mira Official" -> "mira-official", "Áo thun" -> "ao-thun"
string Slugify(string? text) =>
    System.Text.RegularExpressions.Regex.Replace(Fold(text), "[^a-z0-9]+", "-").Trim('-');

bool IsAllowedArtistImageReference(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return true;
    if (System.Text.RegularExpressions.Regex.IsMatch(value, @"^[a-zA-Z][a-zA-Z0-9+.-]*:"))
        return Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    return !value.StartsWith("//", StringComparison.Ordinal)
        && value[0] != '\\'
        && !value.Contains('\0');
}

// Slug không được trùng với đường dẫn đặc biệt (/api/artists/me) hoặc là số (vì số được hiểu là id)
bool IsReservedSlug(string slug) => slug == "me" || int.TryParse(slug, out _);

// Frontend gửi token qua header:  Authorization: Bearer <token>
string GetToken(HttpContext ctx)
{
    var authorization = ctx.Request.Headers.Authorization.ToString();
    return authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
        ? authorization[7..].Trim() : "";
}
string HashResetToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

// Không để reset-token trong response.
void InvalidateResetTokens(int userId)
{
    foreach (var t in passwordResetTokens.Where(t => t.UserId == userId && t.UsedAt is null))
        t.UsedAt = DateTime.UtcNow;
}

Community? CommunityForArtist(int artistId) => communities.FirstOrDefault(c => c.ArtistId == artistId);

// Khóa cùng lúc các thay đổi đối với các collection dùng bởi API handlers.
var dataLock = new object();

void CacheUser(User user)
{
    lock (dataLock)
    {
        var index = users.FindIndex(existing => existing.Id == user.Id);
        if (index < 0) users.Add(user);
        else users[index] = user;
    }
}

// Lấy người dùng đang đăng nhập (null nếu chưa đăng nhập hoặc tài khoản đã bị khóa/xóa)
User? GetCurrentUser(HttpContext ctx)
{
    var token = GetToken(ctx);
    if (!TryGetActiveSession(token, out var userId)) return null;

    var user = users.FirstOrDefault(u => u.Id == userId); // TODO-DB: SELECT * FROM Users WHERE Id = @id
    if (user is null || user.Status != "active")
    {
        sessions.TryRemove(token, out _);
        return null;
    }
    return user;
}

async Task<User?> GetCurrentUserFromDatabaseAsync(HttpContext ctx)
{
    var token = GetToken(ctx);
    if (!TryGetActiveSession(token, out var userId)) return null;

    var user = await userRepository.FindByIdAsync(userId, ctx.RequestAborted);
    if (user is null || user.Status != "active")
    {
        sessions.TryRemove(token, out _);
        return null;
    }

    CacheUser(user);
    return user;
}

bool TryGetActiveSession(string token, out int userId)
{
    userId = 0;
    while (sessions.TryGetValue(token, out var session))
    {
        var now = DateTime.UtcNow;
        if (now - session.LastActivityUtc >= sessionIdleTimeout)
        {
            sessions.TryRemove(token, out _);
            return false;
        }

        var touched = session with { LastActivityUtc = now };
        if (sessions.TryUpdate(token, touched, session))
        {
            userId = session.UserId;
            return true;
        }
    }
    return false;
}

// Kiểm tra quyền. Trả về lỗi (401/403) nếu không đủ quyền, trả về null nếu hợp lệ.
// Cách dùng:  if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
IResult? CheckRole(HttpContext ctx, params string[] allowedRoles)
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (!allowedRoles.Any(r => r == user.Role)) return Msg(403, "Bạn không có quyền thực hiện thao tác này");
    return null;
}

// Hủy tất cả phiên đăng nhập của một tài khoản (khi khóa, xóa, admin đặt lại mật khẩu)
void RemoveSessionsOf(int userId)
{
    foreach (var item in sessions.Where(s => s.Value.UserId == userId).ToList())
        sessions.TryRemove(item.Key, out _);
}

// Hồ sơ nghệ sĩ gắn với tài khoản đang đăng nhập (null nếu không có)
Artist? GetMyArtist(HttpContext ctx)
{
    var user = GetCurrentUser(ctx);
    return user is null ? null : artists.FirstOrDefault(a => a.UserId == user.Id);
}

// Không bao giờ trả mật khẩu về cho frontend
object PublicUser(User u)
{
    // TODO-DB: SELECT Id, Slug FROM Artists WHERE UserId = @userId
    var linked = artists.FirstOrDefault(a => a.UserId == u.Id);
    return new
    {
        u.Id,
        u.FullName,
        u.Email,
        u.Phone,
        u.Address,
        u.Role,
        u.Status,
        u.CreatedAt,
        ArtistId = linked?.Id,       // có giá trị khi tài khoản là nghệ sĩ
        ArtistSlug = linked?.Slug,
    };
}

// Phòng khi frontend gửi thiếu/null các phần con của nghệ sĩ
void FillMissing(Artist a)
{
    a.Social ??= new SocialLinks();
    a.Promotion ??= new Promotion();
    a.Information ??= new List<TimelineItem>();
    a.Activities ??= new List<ArtistActivity>();
    a.MusicVideos ??= new List<MusicVideo>();
}

// Sản phẩm kèm tên nghệ sĩ, tên danh mục và tổng tồn kho (cho trang quản trị)
object ProductView(Product p)
{
    // TODO-DB: JOIN Artists, Categories, ProductVariants
    return new
    {
        p.Id,
        p.Name,
        p.Description,
        p.Price,
        p.ArtistId,
        ArtistName = artists.FirstOrDefault(a => a.Id == p.ArtistId)?.Name,
        p.CategoryId,
        CategoryName = categories.FirstOrDefault(c => c.Id == p.CategoryId)?.Name,
        p.Image,
        p.Images,
        p.Status,
        TotalStock = p.Variants.Sum(v => v.Stock),
        p.Variants,
    };
}

object PublicProductView(Product p) => new
{
    p.Id,
    p.Name,
    p.Description,
    p.Price,
    p.ArtistId,
    Artist = artists.FirstOrDefault(a => a.Id == p.ArtistId)?.Name ?? "",
    p.CategoryId,
    Category = categories.FirstOrDefault(c => c.Id == p.CategoryId)?.Slug ?? "",
    p.Image,
    p.Images,
    Stock = p.Variants.Sum(v => v.Stock),
    Variants = p.Variants.Select(v => new { v.Id, v.Sku, v.Name, v.Stock }),
};

string OrderStatusLabel(string status) => status switch
{
    "Pending" => "Chờ xác nhận",
    "Confirmed" => "Đã xác nhận",
    "Processing" => "Đang chuẩn bị",
    "Shipping" => "Đang giao",
    "Delivered" => "Đã giao",
    "Cancelled" => "Đã hủy",
    _ => status,
};

object CartView(List<CartItem> cart)
{
    var items = cart.Select(item =>
    {
        var product = products.First(p => p.Variants.Any(v => v.Id == item.VariantId));
        var variant = product.Variants.First(v => v.Id == item.VariantId);
        return new
        {
            productId = product.Id,
            variantId = variant.Id,
            productName = product.Name,
            artist = artists.FirstOrDefault(a => a.Id == product.ArtistId)?.Name ?? "",
            category = categories.FirstOrDefault(c => c.Id == product.CategoryId)?.Slug ?? "",
            image = product.Image,
            sku = variant.Sku,
            variantName = variant.Name,
            unitPrice = product.Price,
            quantity = item.Quantity,
            stock = variant.Stock,
            lineTotal = (decimal)product.Price * item.Quantity,
        };
    }).ToList();

    return new
    {
        items,
        totalQuantity = items.Sum(item => item.quantity),
        subtotal = items.Sum(item => item.lineTotal),
    };
}

object OrderView(Order order) => new
{
    order.Id,
    order.Code,
    order.ReceiverName,
    order.ReceiverPhone,
    order.ShippingAddress,
    order.Note,
    order.ShippingFee,
    order.TotalAmount,
    order.Status,
    StatusLabel = OrderStatusLabel(order.Status),
    order.CreatedAt,
    Items = order.Items.Select(item => new
    {
        item.VariantId,
        item.ProductName,
        item.Sku,
        item.UnitPrice,
        item.Quantity,
        LineTotal = (decimal)item.UnitPrice * item.Quantity,
    }),
};

// Kiểm tra rồi áp dụng dữ liệu sản phẩm (dùng cho cả thêm và sửa).
// Khi thêm (isCreate = true): bắt buộc có tên, giá, nghệ sĩ, danh mục.
// Khi sửa: chỉ kiểm tra và sửa những trường có gửi lên. Trả về lỗi hoặc null nếu thành công.
IResult? ApplyProduct(Product p, ProductRequest req, bool isCreate)
{
    // ----- Kiểm tra (chưa sửa gì) -----
    if ((isCreate || req.Name is not null) && string.IsNullOrWhiteSpace(req.Name))
        return Msg(400, "Vui lòng nhập tên sản phẩm");
    if ((isCreate || req.Price is not null) && (req.Price is null || req.Price <= 0))
        return Msg(400, "Giá sản phẩm phải lớn hơn 0");
    if ((isCreate || req.ArtistId is not null) && !artists.Any(a => a.Id == req.ArtistId))
        return Msg(400, "Nghệ sĩ không tồn tại");
    if ((isCreate || req.CategoryId is not null) && !categories.Any(c => c.Id == req.CategoryId))
        return Msg(400, "Danh mục không tồn tại");
    if (req.Status is not null && req.Status != "active" && req.Status != "hidden")
        return Msg(400, "Trạng thái không hợp lệ (active hoặc hidden)");

    // ----- Áp dụng -----
    if (req.Name is not null) p.Name = req.Name.Trim();
    if (req.Description is not null) p.Description = req.Description;
    if (req.Price is not null) p.Price = req.Price.Value;
    if (req.ArtistId is not null) p.ArtistId = req.ArtistId.Value;
    if (req.CategoryId is not null) p.CategoryId = req.CategoryId.Value;
    if (req.Status is not null) p.Status = req.Status;
    if (req.Images is not null)
        p.Images = req.Images.Where(i => !string.IsNullOrWhiteSpace(i)).Select(i => i.Trim()).ToList();
    if (req.Image is not null) p.Image = req.Image.Trim();
    if (string.IsNullOrEmpty(p.Image)) p.Image = p.Images.FirstOrDefault() ?? "";
    return null;
}

// Thêm một biến thể vào sản phẩm. Trả về lỗi hoặc null nếu thành công.
// SKU để trống thì tự đặt; SKU không được trùng với bất kỳ biến thể nào khác.
IResult? AddVariant(Product p, VariantRequest vr)
{
    var stock = vr.Stock ?? 0;
    if (stock < 0) return Msg(400, "Tồn kho không được âm");

    var sku = (vr.Sku ?? "").Trim();
    if (sku == "") sku = "SKU-" + p.Id + "-" + nextVariantId;

    // TODO-DB: SKU nên có ràng buộc UNIQUE trong bảng ProductVariants
    if (products.Any(x => x.Variants.Any(v => v.Sku.Equals(sku, StringComparison.OrdinalIgnoreCase))))
        return Msg(409, "SKU '" + sku + "' đã tồn tại");

    p.Variants.Add(new ProductVariant
    {
        Id = nextVariantId++,
        Sku = sku,
        Name = string.IsNullOrWhiteSpace(vr.Name) ? "Mặc định" : vr.Name.Trim(),
        Stock = stock,
    });
    return null;
}

// =====================================================
// 3. TÀI KHOẢN
// =====================================================

// Đăng ký (luôn tạo tài khoản khách hàng)
app.MapPost("/api/auth/register", async (RegisterRequest req) =>
{
    var email = NormalizeEmail(req.Email);
    var fullName = req.FullName?.Trim() ?? "";
    var phone = req.Phone?.Trim() ?? "";

    if (string.IsNullOrWhiteSpace(fullName) || email == "" || string.IsNullOrEmpty(req.Password))
        return Msg(400, "Vui lòng nhập đầy đủ họ tên, email và mật khẩu");
    if (!IsValidEmail(email))
        return Msg(400, "Email không hợp lệ");
    if (req.Password.Length < 8)
        return Msg(400, "Mật khẩu tối thiểu 8 ký tự");
    if (email.Length > 255 || fullName.Length > 100 || phone.Length > 20)
        return Msg(400, "Email, họ tên hoặc số điện thoại vượt quá độ dài cho phép");

    var newUser = new User
    {
        FullName = fullName,
        Email = email,
        Phone = phone,
        Role = Roles.Customer,
        Status = "active",
    };
    newUser.Password = passwordHasher.HashPassword(newUser, req.Password);

    try
    {
        await userRepository.CreateCustomerAsync(newUser, app.Lifetime.ApplicationStopping);
    }
    catch (PostgresException ex) when (ex.SqlState == "23505")
    {
        return Msg(409, "Email đã được sử dụng");
    }

    nextUserId = Math.Max(nextUserId, newUser.Id + 1);
    CacheUser(newUser);

    return Results.Json(new { message = "Đăng ký thành công", user = PublicUser(newUser) }, statusCode: 201);
});

// Đăng nhập (khách hàng, nghệ sĩ và admin dùng chung API này; xem user.role trong kết quả)
app.MapPost("/api/auth/login", async (LoginRequest req) =>
{
    var email = NormalizeEmail(req.Email);

    var user = await userRepository.FindByEmailAsync(email, app.Lifetime.ApplicationStopping);
    var verified = false;
    if (user is not null && req.Password is not null)
    {
        try
        {
            verified = passwordHasher.VerifyHashedPassword(user, user.Password, req.Password)
                != PasswordVerificationResult.Failed;
        }
        catch (FormatException)
        {
            // Random locked-import markers are not ASP.NET Identity password hashes.
        }
    }
    if (!verified || user is null)
        return Msg(401, "Sai email hoặc mật khẩu");
    if (user.Status != "active")
        return Msg(403, "Tài khoản bị khóa");

    CacheUser(user);
    var token = Guid.NewGuid().ToString();
    sessions[token] = new SessionEntry(user.Id, DateTime.UtcNow);

    return Results.Ok(new { message = "Đăng nhập thành công", token, user = PublicUser(user) });
});

// Quên mật khẩu: cố ý trả cùng thông báo dù email tồn tại hay không (chống dò tài khoản).
// CHỈ DEMO: token được ghi ra console Development. Sản phẩm thật phải gửi email qua dịch vụ tin cậy.
app.MapPost("/api/auth/forgot-password", IResult (ForgotPasswordRequest req) =>
{
    var user = users.FirstOrDefault(u => u.Email == NormalizeEmail(req.Email) && u.Status == "active");
    if (user is not null)
    {
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        lock (dataLock)
        {
            InvalidateResetTokens(user.Id);
            passwordResetTokens.Add(new PasswordResetToken
            {
                Id = Guid.NewGuid(), UserId = user.Id, TokenHash = HashResetToken(rawToken),
                ExpiresAt = DateTime.UtcNow.AddMinutes(15)
            });
        }
        if (app.Environment.IsDevelopment())
            app.Logger.LogWarning("DEMO LOCAL ONLY: Reset token cho {Email}: {Token}", user.Email, rawToken);
    }
    return Results.Ok(new { message = "Nếu email tồn tại, hướng dẫn khôi phục mật khẩu sẽ được gửi." });
});

app.MapPost("/api/auth/reset-password", IResult (ResetPasswordRequest req) =>
{
    if (string.IsNullOrWhiteSpace(req.Token) || string.IsNullOrEmpty(req.NewPassword) || req.NewPassword.Length < 8)
        return Msg(400, "Token không hợp lệ hoặc mật khẩu phải có ít nhất 8 ký tự");
    lock (dataLock)
    {
        var hashed = HashResetToken(req.Token);
        var t = passwordResetTokens.FirstOrDefault(x => x.TokenHash == hashed && x.UsedAt is null && x.ExpiresAt > DateTime.UtcNow);
        if (t is null) return Msg(400, "Token không hợp lệ hoặc đã hết hạn");
        var user = users.FirstOrDefault(u => u.Id == t.UserId && u.Status == "active");
        if (user is null) return Msg(400, "Token không hợp lệ hoặc đã hết hạn");
        user.Password = passwordHasher.HashPassword(user, req.NewPassword);
        InvalidateResetTokens(user.Id);
        RemoveSessionsOf(user.Id);
        return Msg(200, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại");
    }
});

// Đăng xuất
app.MapPost("/api/auth/logout", IResult (HttpContext ctx) =>
{
    if (GetCurrentUser(ctx) is null) return Msg(401, "Bạn chưa đăng nhập");
    sessions.TryRemove(GetToken(ctx), out _);
    return Msg(200, "Đăng xuất thành công");
});

// Xem thông tin cá nhân. Giữ route cũ và thêm alias dưới auth.
async Task<IResult> GetMe(HttpContext ctx)
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    return Results.Ok(PublicUser(user));
}
app.MapGet("/api/auth/me", (Delegate)GetMe);
app.MapGet("/api/users/me", (Delegate)GetMe);

app.MapGet("/api/users/me/orders", async (HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    return Results.Ok(await userRepository.GetAccountOrdersAsync(user.Id, ctx.RequestAborted));
});

app.MapGet("/api/users/me/addresses", async (HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    return Results.Ok(await userRepository.GetAccountAddressesAsync(user.Id, ctx.RequestAborted));
});

// Cập nhật thông tin cá nhân của User trong SQL.
app.MapPut("/api/users/me", async (HttpContext ctx, UpdateProfileRequest req) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");

    var fullName = req.FullName?.Trim() ?? user.FullName;
    var email = req.Email is null ? user.Email : NormalizeEmail(req.Email);
    var phone = req.Phone?.Trim() ?? user.Phone;
    if (string.IsNullOrWhiteSpace(fullName)) return Msg(400, "Họ tên không được để trống");
    if (!IsValidEmail(email)) return Msg(400, "Email không hợp lệ");
    if (email.Length > 255 || fullName.Length > 100 || phone.Length > 20)
        return Msg(400, "Email, họ tên hoặc số điện thoại vượt quá độ dài cho phép");

    try
    {
        var updatedUser = await userRepository.UpdateProfileAsync(
            user.Id, fullName, email, phone, ctx.RequestAborted);
        if (updatedUser is null) return Msg(401, "Bạn chưa đăng nhập");
        CacheUser(updatedUser);
        return Results.Ok(new { message = "Cập nhật thành công", user = PublicUser(updatedUser) });
    }
    catch (PostgresException ex) when (ex.SqlState == "23505")
    {
        return Msg(409, "Email đã được sử dụng");
    }
});

// Đổi mật khẩu và lưu hash mới trong SQL.
app.MapPut("/api/users/me/password", async (HttpContext ctx, ChangePasswordRequest req) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");

    var oldPasswordValid = false;
    if (req.OldPassword is not null)
    {
        try
        {
            oldPasswordValid = passwordHasher.VerifyHashedPassword(user, user.Password, req.OldPassword)
                != PasswordVerificationResult.Failed;
        }
        catch (FormatException)
        {
            // Malformed random import markers can never verify as passwords.
        }
    }
    if (!oldPasswordValid)
        return Msg(400, "Mật khẩu hiện tại không đúng");
    if (string.IsNullOrEmpty(req.NewPassword) || req.NewPassword.Length < 8)
        return Msg(400, "Mật khẩu mới tối thiểu 8 ký tự");

    var newPasswordHash = passwordHasher.HashPassword(user, req.NewPassword);
    if (!await userRepository.UpdatePasswordHashAsync(user.Id, newPasswordHash, ctx.RequestAborted))
        return Msg(401, "Bạn chưa đăng nhập");

    user.Password = newPasswordHash;
    CacheUser(user);
    InvalidateResetTokens(user.Id);
    RemoveSessionsOf(user.Id);
    return Msg(200, "Đổi mật khẩu thành công, vui lòng đăng nhập lại");
});

// =====================================================
// 4. NGHỆ SĨ
// =====================================================

// Danh sách nghệ sĩ (trang artist.html dùng)
app.MapGet("/api/artists", () =>
{
    // TODO-DB: SELECT * FROM Artists (+ join các bảng con nếu cần)
    return Results.Ok(artists.Where(a => a.Status == "active").ToList());
});

// Hồ sơ nghệ sĩ của tài khoản đang đăng nhập (chỉ tài khoản có vai trò artist)
app.MapGet("/api/artists/me", IResult (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Artist) is { } denied) return denied;

    var artist = GetMyArtist(ctx);
    return artist is null
        ? Msg(404, "Tài khoản chưa được liên kết với hồ sơ nghệ sĩ nào")
        : Results.Ok(artist);
});

// Nghệ sĩ tự sửa hồ sơ của mình. Chỉ sửa những trường có gửi lên.
// Không đổi được: id, slug, tên, tài khoản liên kết (chỉ admin đổi được).
app.MapPut("/api/artists/me", IResult (HttpContext ctx, ArtistSelfUpdateRequest req) =>
{
    if (CheckRole(ctx, Roles.Artist) is { } denied) return denied;

    var artist = GetMyArtist(ctx);
    if (artist is null) return Msg(404, "Tài khoản chưa được liên kết với hồ sơ nghệ sĩ nào");

    if (req.Description is { Length: > 4000 } || req.Summary is { Length: > 2000 })
        return Msg(400, "Nội dung giới thiệu vượt quá độ dài cho phép");
    if (req.Avatar is { Length: > 500 } || req.Cover is { Length: > 500 })
        return Msg(400, "Đường dẫn ảnh không được vượt quá 500 ký tự");
    if (!IsAllowedArtistImageReference(req.Avatar) || !IsAllowedArtistImageReference(req.Cover))
        return Msg(400, "Ảnh phải dùng đường dẫn trong website hoặc URL bảo mật HTTPS");

    // TODO-DB: UPDATE Artists SET ... WHERE UserId = @userId (+ cập nhật các bảng con)
    if (req.Handle is not null) artist.Handle = req.Handle;
    if (req.Genre is not null) artist.Genre = req.Genre;
    if (req.Description is not null) artist.Description = req.Description;
    if (req.Summary is not null) artist.Summary = req.Summary;
    if (req.Cover is not null) artist.Cover = req.Cover;
    if (req.Avatar is not null) artist.Avatar = req.Avatar;
    if (req.Photo is not null) artist.Photo = req.Photo;
    if (req.Social is not null) artist.Social = req.Social;
    if (req.Promotion is not null) artist.Promotion = req.Promotion;
    if (req.Information is not null) artist.Information = req.Information;
    if (req.Activities is not null) artist.Activities = req.Activities;
    if (req.MusicVideos is not null) artist.MusicVideos = req.MusicVideos;

    var community = CommunityForArtist(artist.Id);
    if (community is not null)
    {
        community.Description = artist.Description;
        community.Avatar = artist.Avatar;
        community.Cover = artist.Cover;
    }

    return Results.Ok(artist);
});

// Chi tiết 1 nghệ sĩ (trang artist-detail.html dùng)
// Gọi bằng slug:  /api/artists/kairo   hoặc bằng id:  /api/artists/1
app.MapGet("/api/artists/{key}", IResult (string key) =>
{
    // TODO-DB: SELECT * FROM Artists WHERE Slug = @slug (hoặc WHERE Id = @id)
    var artist = int.TryParse(key, out var id)
        ? artists.FirstOrDefault(a => a.Id == id)
        : artists.FirstOrDefault(a => a.Slug.Equals(key, StringComparison.OrdinalIgnoreCase));

    return artist is null || artist.Status != "active"
        ? Msg(404, "Không tìm thấy nghệ sĩ") : Results.Ok(artist);
});

// Tương thích frontend cũ: follow được hiểu là tham gia cộng đồng nghệ sĩ.
app.MapPost("/api/artists/{id:int}/follow", async (int id, HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (user.Role != Roles.Customer) return Msg(403, "Chỉ tài khoản khách hàng được tham gia cộng đồng");
    var communityId = await userRepository.GetCommunityIdForArtistAsync(id, ctx.RequestAborted);
    if (communityId is null) return Msg(404, "Không tìm thấy cộng đồng");
    await userRepository.JoinCommunityAsync(communityId.Value, user.Id, ctx.RequestAborted);
    return Msg(200, "Đã tham gia cộng đồng nghệ sĩ");
});
app.MapDelete("/api/artists/{id:int}/follow", async (int id, HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    var communityId = await userRepository.GetCommunityIdForArtistAsync(id, ctx.RequestAborted);
    if (communityId is null) return Msg(404, "Không tìm thấy cộng đồng");
    await userRepository.LeaveCommunityAsync(communityId.Value, user.Id, ctx.RequestAborted);
    return Msg(200, "Đã rời cộng đồng nghệ sĩ");
});
app.MapGet("/api/users/me/following", async (HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    return Results.Ok(await communityRepository.GetFollowingArtistIdsAsync(user.Id, ctx.RequestAborted));
});

// API cộng đồng đọc/ghi trực tiếp SQL Server.
app.MapGet("/api/communities", async (HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    return Results.Ok(await communityRepository.GetCommunitiesAsync(user?.Id, ctx.RequestAborted));
});
app.MapGet("/api/communities/{id:int}", async (int id, HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    var community = await communityRepository.GetCommunityAsync(id, user?.Id, ctx.RequestAborted);
    return community is null ? Msg(404, "Không tìm thấy cộng đồng") : Results.Ok(community);
});
app.MapPost("/api/communities/{id:int}/join", async (int id, HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (user.Role != Roles.Customer) return Msg(403, "Chỉ tài khoản khách hàng được tham gia cộng đồng");
    if (!await userRepository.JoinCommunityAsync(id, user.Id, ctx.RequestAborted))
        return Msg(404, "Không tìm thấy cộng đồng");
    return Msg(200, "Đã tham gia cộng đồng");
});
app.MapDelete("/api/communities/{id:int}/leave", async (int id, HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (!await userRepository.LeaveCommunityAsync(id, user.Id, ctx.RequestAborted))
        return Msg(404, "Không tìm thấy cộng đồng");
    return Msg(200, "Đã rời cộng đồng");
});
app.MapGet("/api/users/me/communities", async (HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    return Results.Ok(await userRepository.GetAccountCommunitiesAsync(user.Id, ctx.RequestAborted));
});
app.MapGet("/api/communities/{id:int}/members", async (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin, Roles.Artist) is { } denied) return denied;
    if (!await communityRepository.IsCommunityActiveAsync(id, ctx.RequestAborted)) return Msg(404, "Không tìm thấy cộng đồng");
    var me = await GetCurrentUserFromDatabaseAsync(ctx);
    if (me?.Role == Roles.Artist && await communityRepository.GetMemberArtistOwnerAsync(id, ctx.RequestAborted) != me.Id)
        return Msg(403, "Bạn không quản lý cộng đồng này");
    return Results.Ok(await communityRepository.GetMembersAsync(id, ctx.RequestAborted));
});
// ----- Admin quản lý nghệ sĩ (cần đăng nhập bằng tài khoản admin) -----

// Thêm nghệ sĩ (gửi toàn bộ thông tin nghệ sĩ dạng JSON, giống dữ liệu trong GET /api/artists/kairo)
// Tài khoản đăng nhập của nghệ sĩ được gắn riêng ở API: PUT /api/admin/artists/{id}/account
app.MapGet("/api/communities/{id:int}/posts", async (int id, string? section, HttpContext ctx) =>
{
    if (!await communityRepository.IsCommunityActiveAsync(id, ctx.RequestAborted)) return Msg(404, "Không tìm thấy cộng đồng");
    var normalizedSection = string.IsNullOrWhiteSpace(section) ? null : section.Trim();
    if (normalizedSection is not null && normalizedSection is not ("Fan" or "Artist")) return Msg(400, "Section không hợp lệ");
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    return Results.Ok(await communityRepository.GetPostsAsync(id, normalizedSection, user?.Id, ctx.RequestAborted));
});
app.MapPost("/api/communities/{id:int}/posts", async (int id, HttpContext ctx, CommunityPostRequest req) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (!await communityRepository.IsCommunityActiveAsync(id, ctx.RequestAborted)) return Msg(404, "Không tìm thấy cộng đồng");
    var section = user.Role == Roles.Customer ? "Fan"
        : user.Role == Roles.Artist && await communityRepository.GetMemberArtistOwnerAsync(id, ctx.RequestAborted) == user.Id ? "Artist" : "";
    if (section == "") return Msg(403, "Bạn không có quyền đăng bài trong cộng đồng này");
    if (user.Role == Roles.Customer && !await communityRepository.IsMemberAsync(id, user.Id, ctx.RequestAborted))
        return Msg(403, "Bạn cần tham gia cộng đồng trước khi đăng bài");
    if (!string.IsNullOrWhiteSpace(req.Section) && !req.Section.Equals(section, StringComparison.OrdinalIgnoreCase))
        return Msg(403, "Bạn không có quyền đăng vào mục này");
    var content = req.Content?.Trim();
    var mediaError = ValidateCommunityMedia(req.Media);
    if (string.IsNullOrEmpty(content) && (req.Media?.Count ?? 0) == 0) return Msg(400, "Bài viết cần có nội dung hoặc media");
    if (content?.Length > 5000) return Msg(400, "Nội dung bài viết tối đa 5000 ký tự");
    if (mediaError is not null) return Msg(400, mediaError);
    var postId = await communityRepository.CreatePostAsync(id, user.Id, section, content, req.Media ?? [], ctx.RequestAborted);
    return Results.Created($"/api/posts/{postId}", new { postId });
});
app.MapGet("/api/posts/{postId:int}", async (int postId, HttpContext ctx) =>
{
    var permission = await communityRepository.GetPostPermissionAsync(postId, ctx.RequestAborted);
    if (permission.Status != "Visible" || permission.CommunityId is null) return Msg(404, "Không tìm thấy bài viết");
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    var post = (await communityRepository.GetPostsAsync(permission.CommunityId.Value, null, user?.Id, ctx.RequestAborted))
        .FirstOrDefault(item => item.PostId == postId);
    return post is null ? Msg(404, "Không tìm thấy bài viết") : Results.Ok(post);
});
app.MapPut("/api/posts/{postId:int}", async (int postId, HttpContext ctx, CommunityPostRequest req) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    var permission = await communityRepository.GetPostPermissionAsync(postId, ctx.RequestAborted);
    if (permission.Status != "Visible") return Msg(404, "Không tìm thấy bài viết");
    if (user.Role != Roles.Admin && permission.CommunityId is { } updateCommunityId
        && !await communityRepository.IsMemberAsync(updateCommunityId, user.Id, ctx.RequestAborted)
        && !(user.Role == Roles.Artist && await communityRepository.GetMemberArtistOwnerAsync(updateCommunityId, ctx.RequestAborted) == user.Id))
        return Msg(403, "Bạn cần là thành viên cộng đồng để sửa bài viết");
    if (permission.AuthorId != user.Id && user.Role != Roles.Admin) return Msg(403, "Bạn không có quyền sửa bài viết này");
    var content = req.Content?.Trim();
    if (content?.Length > 5000) return Msg(400, "Nội dung bài viết tối đa 5000 ký tự");
    if (string.IsNullOrEmpty(content) && (req.Media?.Count ?? 0) == 0) return Msg(400, "Bài viết cần có nội dung hoặc media");
    var mediaError = ValidateCommunityMedia(req.Media);
    if (mediaError is not null) return Msg(400, mediaError);
    return await communityRepository.UpdatePostAsync(postId, content, req.Media, ctx.RequestAborted)
        ? Msg(200, "Đã cập nhật bài viết") : Msg(404, "Không tìm thấy bài viết");
});
app.MapDelete("/api/posts/{postId:int}", async (int postId, HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    var permission = await communityRepository.GetPostPermissionAsync(postId, ctx.RequestAborted);
    if (permission.Status != "Visible") return Msg(404, "Không tìm thấy bài viết");
    if (user.Role != Roles.Admin && permission.CommunityId is { } deleteCommunityId
        && !await communityRepository.IsMemberAsync(deleteCommunityId, user.Id, ctx.RequestAborted)
        && !(user.Role == Roles.Artist && await communityRepository.GetMemberArtistOwnerAsync(deleteCommunityId, ctx.RequestAborted) == user.Id))
        return Msg(403, "Bạn cần là thành viên cộng đồng để xóa bài viết");
    if (permission.AuthorId != user.Id && user.Role != Roles.Admin) return Msg(403, "Bạn không có quyền xóa bài viết này");
    return await communityRepository.DeletePostAsync(postId, ctx.RequestAborted)
        ? Msg(200, "Đã xóa bài viết") : Msg(404, "Không tìm thấy bài viết");
});
app.MapPost("/api/posts/{postId:int}/like", async (int postId, HttpContext ctx) => await SetCommunityLikeAsync(postId, ctx, true));
app.MapDelete("/api/posts/{postId:int}/like", async (int postId, HttpContext ctx) => await SetCommunityLikeAsync(postId, ctx, false));
app.MapGet("/api/posts/{postId:int}/comments", async (int postId, HttpContext ctx) =>
{
    var permission = await communityRepository.GetPostPermissionAsync(postId, ctx.RequestAborted);
    if (permission.Status != "Visible") return Msg(404, "Không tìm thấy bài viết");
    return Results.Ok(await communityRepository.GetCommentsAsync(postId, ctx.RequestAborted));
});
app.MapPost("/api/posts/{postId:int}/comments", async (int postId, HttpContext ctx, CommunityCommentRequest req) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    var permission = await communityRepository.GetPostPermissionAsync(postId, ctx.RequestAborted);
    if (permission.Status != "Visible" || permission.CommunityId is null) return Msg(404, "Không tìm thấy bài viết");
    if (!await communityRepository.IsMemberAsync(permission.CommunityId.Value, user.Id, ctx.RequestAborted))
        return Msg(403, "Bạn cần tham gia cộng đồng trước khi bình luận");
    var content = req.Content?.Trim() ?? "";
    if (content.Length == 0 || content.Length > 2000) return Msg(400, "Bình luận phải có từ 1 đến 2000 ký tự");
    var commentId = await communityRepository.CreateCommentAsync(postId, user.Id, req.ParentCommentId, content, ctx.RequestAborted);
    if (commentId is null) return Msg(404, "Không tìm thấy bài viết");
    if (commentId == -1) return Msg(400, "Bình luận trả lời không hợp lệ");
    return Results.Created($"/api/comments/{commentId}", new { commentId });
});
app.MapPut("/api/comments/{commentId:int}", async (int commentId, HttpContext ctx, CommunityCommentRequest req) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    var permission = await communityRepository.GetCommentPermissionAsync(commentId, ctx.RequestAborted);
    if (permission.Status != "Visible") return Msg(404, "Không tìm thấy bình luận");
    if (user.Role != Roles.Admin && permission.CommunityId is { } updateCommentCommunityId
        && !await communityRepository.IsMemberAsync(updateCommentCommunityId, user.Id, ctx.RequestAborted))
        return Msg(403, "Bạn cần là thành viên cộng đồng để sửa bình luận");
    if (permission.UserId != user.Id && user.Role != Roles.Admin) return Msg(403, "Bạn không có quyền sửa bình luận này");
    var content = req.Content?.Trim() ?? "";
    if (content.Length == 0 || content.Length > 2000) return Msg(400, "Bình luận phải có từ 1 đến 2000 ký tự");
    return await communityRepository.UpdateCommentAsync(commentId, content, ctx.RequestAborted)
        ? Msg(200, "Đã cập nhật bình luận") : Msg(404, "Không tìm thấy bình luận");
});
app.MapDelete("/api/comments/{commentId:int}", async (int commentId, HttpContext ctx) =>
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    var permission = await communityRepository.GetCommentPermissionAsync(commentId, ctx.RequestAborted);
    if (permission.Status != "Visible") return Msg(404, "Không tìm thấy bình luận");
    if (user.Role != Roles.Admin && permission.CommunityId is { } deleteCommentCommunityId
        && !await communityRepository.IsMemberAsync(deleteCommentCommunityId, user.Id, ctx.RequestAborted))
        return Msg(403, "Bạn cần là thành viên cộng đồng để xóa bình luận");
    if (permission.UserId != user.Id && user.Role != Roles.Admin) return Msg(403, "Bạn không có quyền xóa bình luận này");
    return await communityRepository.DeleteCommentAsync(commentId, ctx.RequestAborted)
        ? Msg(200, "Đã xóa bình luận") : Msg(404, "Không tìm thấy bình luận");
});

string? ValidateCommunityMedia(List<CommunityMediaRequest>? media)
{
    if (media is null) return null;
    if (media.Count > 10) return "Mỗi bài viết tối đa 10 tệp media";
    foreach (var item in media)
    {
        if (item.MediaType is null || !(item.MediaType.Equals("Image", StringComparison.OrdinalIgnoreCase)
            || item.MediaType.Equals("Video", StringComparison.OrdinalIgnoreCase))) return "MediaType chỉ nhận Image hoặc Video";
        var url = item.MediaUrl?.Trim() ?? "";
        if (url.Length == 0 || url.Length > 500 || url.Any(char.IsControl)) return "Đường dẫn media không hợp lệ";
        if (Uri.TryCreate(url, UriKind.Absolute, out var absolute)
            ? absolute.Scheme is not ("http" or "https")
            : url.StartsWith("//", StringComparison.Ordinal) || url.Contains("..", StringComparison.Ordinal))
            return "Media chỉ nhận URL HTTP(S) hoặc đường dẫn tương đối an toàn";
    }
    return null;
}

async Task<IResult> SetCommunityLikeAsync(int postId, HttpContext ctx, bool liked)
{
    var user = await GetCurrentUserFromDatabaseAsync(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    var permission = await communityRepository.GetPostPermissionAsync(postId, ctx.RequestAborted);
    if (permission.Status != "Visible" || permission.CommunityId is null) return Msg(404, "Không tìm thấy bài viết");
    if (!await communityRepository.IsMemberAsync(permission.CommunityId.Value, user.Id, ctx.RequestAborted))
        return Msg(403, "Bạn cần tham gia cộng đồng trước khi thích bài viết");
    return await communityRepository.SetLikeAsync(postId, user.Id, liked, ctx.RequestAborted)
        ? Msg(200, liked ? "Đã thích bài viết" : "Đã bỏ thích bài viết")
        : Msg(404, "Không tìm thấy bài viết");
}

app.MapPost("/api/artists", IResult (HttpContext ctx, Artist req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    if (string.IsNullOrWhiteSpace(req.Name)) return Msg(400, "Vui lòng nhập tên nghệ sĩ");

    req.Slug = Slugify(string.IsNullOrWhiteSpace(req.Slug) ? req.Name : req.Slug);
    if (req.Slug == "" || IsReservedSlug(req.Slug)) return Msg(400, "Slug không hợp lệ");

    // TODO-DB: kiểm tra slug chưa tồn tại
    if (artists.Any(a => a.Slug.Equals(req.Slug, StringComparison.OrdinalIgnoreCase)))
        return Msg(409, "Slug đã được sử dụng");

    FillMissing(req);

    // TODO-DB: INSERT INTO Artists (...) VALUES (...) (+ các bảng con)
    req.Id = nextArtistId++;
    req.UserId = null;
    artists.Add(req);
    communities.Add(new Community { Id = nextCommunityId++, ArtistId = req.Id, Name = $"Cộng đồng {req.Name}",
        Description = req.Summary, Avatar = req.Avatar, Cover = req.Cover });
    return Results.Json(req, statusCode: 201);
});

// Sửa nghệ sĩ (gửi lại TOÀN BỘ thông tin nghệ sĩ, id lấy theo địa chỉ; tài khoản liên kết được giữ nguyên)
app.MapPut("/api/artists/{id:int}", IResult (int id, HttpContext ctx, Artist req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var index = artists.FindIndex(a => a.Id == id);
    if (index == -1) return Msg(404, "Không tìm thấy nghệ sĩ");
    if (string.IsNullOrWhiteSpace(req.Name)) return Msg(400, "Vui lòng nhập tên nghệ sĩ");

    req.Slug = string.IsNullOrWhiteSpace(req.Slug) ? artists[index].Slug : Slugify(req.Slug);
    if (req.Slug == "" || IsReservedSlug(req.Slug)) return Msg(400, "Slug không hợp lệ");

    // TODO-DB: kiểm tra slug không trùng nghệ sĩ khác
    if (artists.Any(a => a.Id != id && a.Slug.Equals(req.Slug, StringComparison.OrdinalIgnoreCase)))
        return Msg(409, "Slug đã được sử dụng");

    FillMissing(req);

    // TODO-DB: UPDATE Artists SET ... WHERE Id = @id (+ cập nhật các bảng con)
    req.Id = id;
    req.UserId = artists[index].UserId;
    req.Status = artists[index].Status; // tránh vô tình bật lại nghệ sĩ bị ẩn
    artists[index] = req;
    return Results.Ok(req);
});

// Admin ẩn/hiện nghệ sĩ. Trạng thái hidden không xuất hiện ở API công khai.
app.MapPut("/api/admin/artists/{id:int}/status", IResult (int id, HttpContext ctx, ArtistStatusRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    var a = artists.FirstOrDefault(a => a.Id == id);
    if (a is null) return Msg(404, "Không tìm thấy nghệ sĩ");
    if (req.Status is not ("active" or "hidden")) return Msg(400, "Status phải là active hoặc hidden");
    a.Status = req.Status;
    return Results.Ok(a);
});
app.MapGet("/api/admin/artists", IResult (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    return Results.Ok(artists.Select(a => new
    {
        a.Id, a.UserId, a.Slug, a.Name, a.Handle, a.Genre, a.Description, a.Cover,
        a.Avatar, a.Photo, a.Summary, a.CommunityLink, a.Social, a.Promotion,
        a.Information, a.Activities, a.MusicVideos, a.Status, a.AdminNote,
        ProductCount = products.Count(p => p.ArtistId == a.Id),
    }).ToList());
});

// Xóa nghệ sĩ (không xóa được nếu nghệ sĩ còn sản phẩm)
app.MapDelete("/api/artists/{id:int}", IResult (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var artist = artists.FirstOrDefault(a => a.Id == id);
    if (artist is null) return Msg(404, "Không tìm thấy nghệ sĩ");

    // TODO-DB: Products.ArtistId là khóa ngoại nên database cũng sẽ chặn xóa
    var productCount = products.Count(p => p.ArtistId == id);
    if (productCount > 0)
        return Msg(409, "Nghệ sĩ còn " + productCount + " sản phẩm. Hãy xóa hoặc chuyển sản phẩm sang nghệ sĩ khác trước.");

    // TODO-DB: DELETE FROM Artists WHERE Id = @id (nhớ xóa luôn các dòng Follows liên quan)
    artists.Remove(artist);
    var community = CommunityForArtist(id);
    if (community is not null)
    {
        communityMembers.RemoveAll(m => m.CommunityId == community.Id);
        communities.Remove(community);
    }
    return Msg(200, "Đã xóa nghệ sĩ");
});

// =====================================================
// QUẢN TRỊ (ADMIN): mọi API bên dưới bắt đầu bằng /api/admin
// và chỉ tài khoản có vai trò admin dùng được.
// =====================================================
var admin = app.MapGroup("/api/admin");
admin.MapGet("/communities", async (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    return Results.Ok(await communityRepository.GetAdminCommunitiesAsync(ctx.RequestAborted));
});
admin.MapDelete("/posts/{postId:int}", async (int postId, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    return await communityRepository.DeletePostAsync(postId, ctx.RequestAborted)
        ? Msg(200, "Đã xóa bài viết") : Msg(404, "Không tìm thấy bài viết");
});

// Ghi chú nội bộ của nghệ sĩ được lưu trong ArtistApiData và không trả về API công khai.
admin.MapPut("/artists/{id:int}/note", IResult (int id, HttpContext ctx, AdminArtistNoteRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    var artist = artists.FirstOrDefault(a => a.Id == id);
    if (artist is null) return Msg(404, "Không tìm thấy nghệ sĩ");
    if ((req.Note ?? "").Length > 4000) return Msg(400, "Ghi chú không được vượt quá 4000 ký tự");
    artist.AdminNote = req.Note?.Trim() ?? "";
    return Results.Ok(new { artist.Id, artist.AdminNote });
});

// Đơn hàng chỉ cho phép xem và cập nhật trạng thái xử lý; không tạo/xóa đơn ở trang quản trị.
admin.MapGet("/orders", async Task<IResult> (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    return Results.Ok(await adminRepository.GetOrdersAsync(ctx.RequestAborted));
});
admin.MapGet("/orders/{id:int}", async Task<IResult> (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    var order = await adminRepository.GetOrderAsync(id, ctx.RequestAborted);
    return order is null ? Msg(404, "Không tìm thấy đơn hàng") : Results.Ok(order);
});
admin.MapPut("/orders/{id:int}/status", async Task<IResult> (int id, HttpContext ctx, AdminOrderStatusRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    var requested = (req.Status ?? "").Trim().ToLowerInvariant();
    var status = requested switch
    {
        "pending" => "Pending",
        "confirmed" => "Confirmed",
        "processing" => "Processing",
        "shipping" => "Shipping",
        "delivered" => "Delivered",
        "cancelled" => "Cancelled",
        _ => null,
    };
    if (status is null) return Msg(400, "Trạng thái đơn hàng không hợp lệ");

    var adminUser = GetCurrentUser(ctx)!;
    if (!await adminRepository.SetOrderStatusAsync(id, status, adminUser.Id, ctx.RequestAborted))
        return Msg(404, "Không tìm thấy đơn hàng");
    lock (dataLock)
    {
        var cachedOrder = orders.FirstOrDefault(o => o.Id == id);
        if (cachedOrder is not null) cachedOrder.Status = status;
    }
    var updatedOrder = await adminRepository.GetOrderAsync(id, ctx.RequestAborted);
    ctx.Items["SkipApiStateSave"] = true;
    return Results.Ok(updatedOrder);
});

// Khuyến mãi được lưu trực tiếp trong dbo.Coupons.
IResult? BuildPromotion(AdminPromotionRequest req, out AdminPromotionWrite? promotion)
{
    promotion = null;
    var code = (req.Code ?? "").Trim().ToUpperInvariant();
    var name = (req.Name ?? "").Trim();
    var type = (req.Type ?? "").Trim().ToLowerInvariant();
    var release = (req.Release ?? "").Trim().ToLowerInvariant();
    if (!System.Text.RegularExpressions.Regex.IsMatch(code, "^[A-Z0-9]{3,20}$"))
        return Msg(400, "Mã voucher phải gồm 3–20 ký tự chữ hoặc số");
    if (name.Length == 0 || name.Length > 255) return Msg(400, "Tên chương trình không hợp lệ");
    if (type is not ("percent" or "fixed")) return Msg(400, "Loại ưu đãi không hợp lệ");
    if (req.Value is null || req.Value <= 0 || (type == "percent" && req.Value > 100))
        return Msg(400, "Giá trị ưu đãi không hợp lệ");
    if (req.MinimumOrder is null || req.MinimumOrder < 0) return Msg(400, "Đơn tối thiểu không hợp lệ");
    if (req.UsageLimit is < 1) return Msg(400, "Lượt sử dụng tối đa phải từ 1 trở lên");
    if (release is not ("publish" or "draft")) return Msg(400, "Trạng thái phát hành không hợp lệ");
    if (!DateOnly.TryParseExact(req.Start, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var startDate) ||
        !DateOnly.TryParseExact(req.End, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var endDate) || endDate < startDate)
        return Msg(400, "Thời gian khuyến mãi không hợp lệ");

    promotion = new AdminPromotionWrite
    {
        Code = code,
        Name = name,
        DiscountType = type == "percent" ? "Percent" : "Fixed",
        Value = req.Value.Value,
        MinimumOrder = req.MinimumOrder.Value,
        UsageLimit = req.UsageLimit,
        StartsAt = startDate.ToDateTime(TimeOnly.MinValue),
        ExpiresAt = endDate.AddDays(1).ToDateTime(TimeOnly.MinValue).AddTicks(-1),
        IsActive = release == "publish",
    };
    return null;
}

admin.MapGet("/promotions", async Task<IResult> (HttpContext ctx, string? q, string? status) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    var allowed = new[] { "running", "upcoming", "expired", "draft" };
    if (!string.IsNullOrWhiteSpace(status) && !allowed.Contains(status.Trim().ToLowerInvariant()))
        return Msg(400, "Trạng thái khuyến mãi không hợp lệ");
    return Results.Ok(await adminRepository.GetPromotionsAsync(q, status, ctx.RequestAborted));
});
admin.MapPost("/promotions", async Task<IResult> (HttpContext ctx, AdminPromotionRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    if (BuildPromotion(req, out var promotion) is { } invalid) return invalid;
    try
    {
        var id = await adminRepository.CreatePromotionAsync(promotion!, ctx.RequestAborted);
        var created = (await adminRepository.GetPromotionsAsync(null, null, ctx.RequestAborted)).First(p => p.Id == id);
        ctx.Items["SkipApiStateSave"] = true;
        return Results.Json(created, statusCode: StatusCodes.Status201Created);
    }
    catch (PostgresException ex) when (ex.SqlState == "23505")
    {
        return Msg(409, "Mã voucher đã tồn tại");
    }
});
admin.MapPut("/promotions/{id:int}", async Task<IResult> (int id, HttpContext ctx, AdminPromotionRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    if (BuildPromotion(req, out var promotion) is { } invalid) return invalid;
    try
    {
        if (!await adminRepository.UpdatePromotionAsync(id, promotion!, ctx.RequestAborted))
            return Msg(404, "Không tìm thấy voucher");
        var updated = (await adminRepository.GetPromotionsAsync(null, null, ctx.RequestAborted)).First(p => p.Id == id);
        ctx.Items["SkipApiStateSave"] = true;
        return Results.Ok(updated);
    }
    catch (PostgresException ex) when (ex.SqlState == "23505")
    {
        return Msg(409, "Mã voucher đã tồn tại");
    }
});
admin.MapDelete("/promotions/{id:int}", async Task<IResult> (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    try
    {
        if (!await adminRepository.DeletePromotionAsync(id, ctx.RequestAborted))
            return Msg(404, "Không tìm thấy voucher");
        ctx.Items["SkipApiStateSave"] = true;
        return Msg(200, "Đã xóa voucher");
    }
    catch (PostgresException ex) when (ex.SqlState == "23503")
    {
        return Msg(409, "Voucher đã được dùng trong đơn hàng nên không thể xóa");
    }
});

// =====================================================
// 5. QUẢN TRỊ: TÀI KHOẢN
// =====================================================

// Danh sách tài khoản. Lọc tùy chọn: ?role=artist  ?status=locked  ?q=tu-khoa (tên, email, số điện thoại)
admin.MapGet("/users", IResult (HttpContext ctx, string? role, string? status, string? q) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var roleFilter = (role ?? "").Trim().ToLowerInvariant();
    var statusFilter = (status ?? "").Trim().ToLowerInvariant();
    var keyword = Fold(q);

    // TODO-DB: SELECT ... FROM Users WHERE ... (lọc và tìm kiếm bằng SQL)
    var result = users
        .Where(u => roleFilter == "" || u.Role == roleFilter)
        .Where(u => statusFilter == "" || u.Status == statusFilter)
        .Where(u => keyword == "" || Fold(u.FullName).Contains(keyword) || u.Email.Contains(keyword) || u.Phone.Contains(keyword))
        .OrderBy(u => u.Id)
        .Select(u => PublicUser(u))
        .ToList();
    return Results.Ok(result);
});

// Xem 1 tài khoản
admin.MapGet("/users/{id:int}", IResult (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var target = users.FirstOrDefault(u => u.Id == id);
    return target is null ? Msg(404, "Không tìm thấy tài khoản") : Results.Ok(PublicUser(target));
});

// Tạo tài khoản (role: customer, artist hoặc admin; mặc định customer)
// Tài khoản artist cần được gắn với hồ sơ nghệ sĩ bằng: PUT /api/admin/artists/{id}/account
admin.MapPost("/users", IResult (HttpContext ctx, AdminCreateUserRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var email = NormalizeEmail(req.Email);
    var role = string.IsNullOrWhiteSpace(req.Role) ? Roles.Customer : req.Role.Trim().ToLowerInvariant();

    if (string.IsNullOrWhiteSpace(req.FullName) || email == "" || string.IsNullOrEmpty(req.Password))
        return Msg(400, "Vui lòng nhập đầy đủ họ tên, email và mật khẩu");
    if (!IsValidEmail(email)) return Msg(400, "Email không hợp lệ");
    if (!IsValidRole(role)) return Msg(400, "Vai trò không hợp lệ (customer, artist hoặc admin)");
    if (req.Password.Length < 8) return Msg(400, "Mật khẩu tối thiểu 8 ký tự");

    // TODO-DB: SELECT * FROM Users WHERE Email = @email
    if (users.Any(u => u.Email == email)) return Msg(409, "Email đã được sử dụng");

    // TODO-DB: mã hóa mật khẩu rồi INSERT INTO Users (...) VALUES (...)
    var newUser = new User
    {
        Id = nextUserId++,
        FullName = req.FullName.Trim(),
        Email = email,
        Password = passwordHasher.HashPassword(new User(), req.Password),
        Phone = req.Phone ?? "",
        Address = req.Address ?? "",
        Role = role,
    };
    users.Add(newUser);
    return Results.Json(PublicUser(newUser), statusCode: 201);
});

// Sửa thông tin tài khoản (họ tên, email, số điện thoại, địa chỉ, vai trò). Chỉ sửa trường có gửi lên.
admin.MapPut("/users/{id:int}", IResult (int id, HttpContext ctx, AdminUpdateUserRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var target = users.FirstOrDefault(u => u.Id == id);
    if (target is null) return Msg(404, "Không tìm thấy tài khoản");
    var me = GetCurrentUser(ctx)!;

    // ----- Kiểm tra (chưa sửa gì) -----
    if (req.FullName is not null && string.IsNullOrWhiteSpace(req.FullName))
        return Msg(400, "Họ tên không được để trống");

    string? newEmail = null;
    if (req.Email is not null)
    {
        newEmail = NormalizeEmail(req.Email);
        if (!IsValidEmail(newEmail)) return Msg(400, "Email không hợp lệ");
        if (users.Any(u => u.Id != id && u.Email == newEmail)) return Msg(409, "Email đã được sử dụng");
    }

    string? newRole = null;
    if (req.Role is not null)
    {
        newRole = req.Role.Trim().ToLowerInvariant();
        if (!IsValidRole(newRole)) return Msg(400, "Vai trò không hợp lệ (customer, artist hoặc admin)");
        if (target.Id == me.Id && newRole != Roles.Admin) return Msg(400, "Không thể tự hạ quyền của chính mình");
        if (target.Role == Roles.Admin && target.Status == "active" && newRole != Roles.Admin &&
            !users.Any(u => u.Id != target.Id && u.Role == Roles.Admin && u.Status == "active"))
            return Msg(409, "Cần giữ ít nhất một quản trị viên đang hoạt động");
    }

    // ----- Áp dụng -----
    // TODO-DB: UPDATE Users SET ... WHERE Id = @id
    if (newEmail is not null) target.Email = newEmail;
    if (req.FullName is not null) target.FullName = req.FullName.Trim();
    if (req.Phone is not null) target.Phone = req.Phone;
    if (req.Address is not null) target.Address = req.Address;
    if (newRole is not null && newRole != target.Role)
    {
        target.Role = newRole;
        RemoveSessionsOf(target.Id); // phiên cũ không còn được phép sử dụng
        // Không còn là nghệ sĩ thì gỡ liên kết với hồ sơ nghệ sĩ (Artists.UserId)
        if (newRole != Roles.Artist)
        {
            foreach (var linked in artists.Where(x => x.UserId == target.Id))
                linked.UserId = null;
        }
    }

    return Results.Ok(PublicUser(target));
});

// Khóa / mở khóa tài khoản. Gửi {"status": "locked"} hoặc {"status": "active"}
// Tài khoản bị khóa không đăng nhập được và các phiên đang đăng nhập bị hủy.
admin.MapPut("/users/{id:int}/status", IResult (int id, HttpContext ctx, AdminSetStatusRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var target = users.FirstOrDefault(u => u.Id == id);
    if (target is null) return Msg(404, "Không tìm thấy tài khoản");

    var newStatus = (req.Status ?? "").Trim().ToLowerInvariant();
    if (newStatus != "active" && newStatus != "locked")
        return Msg(400, "Trạng thái không hợp lệ (active hoặc locked)");
    if (newStatus == "locked" && target.Id == GetCurrentUser(ctx)!.Id)
        return Msg(400, "Không thể tự khóa tài khoản của chính mình");
    if (newStatus == "locked" && target.Role == Roles.Admin && target.Status == "active" &&
        !users.Any(u => u.Id != target.Id && u.Role == Roles.Admin && u.Status == "active"))
        return Msg(409, "Cần giữ ít nhất một quản trị viên đang hoạt động");

    // TODO-DB: UPDATE Users SET Status = @status WHERE Id = @id
    target.Status = newStatus;
    if (newStatus == "locked") RemoveSessionsOf(target.Id);

    return Results.Ok(new
    {
        message = newStatus == "locked" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
        user = PublicUser(target),
    });
});

// Admin đặt lại mật khẩu cho tài khoản. Gửi {"newPassword": "..."}
admin.MapPut("/users/{id:int}/password", IResult (int id, HttpContext ctx, AdminResetPasswordRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var target = users.FirstOrDefault(u => u.Id == id);
    if (target is null) return Msg(404, "Không tìm thấy tài khoản");
    if (string.IsNullOrEmpty(req.NewPassword) || req.NewPassword.Length < 8)
        return Msg(400, "Mật khẩu mới tối thiểu 8 ký tự");

    // TODO-DB: UPDATE Users SET Password = @hash WHERE Id = @id (nhớ mã hóa)
    target.Password = passwordHasher.HashPassword(target, req.NewPassword);
    InvalidateResetTokens(target.Id);
    RemoveSessionsOf(target.Id); // buộc đăng nhập lại
    return Msg(200, "Đã đặt lại mật khẩu");
});

// Xóa tài khoản
admin.MapDelete("/users/{id:int}", async Task<IResult> (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var target = users.FirstOrDefault(u => u.Id == id);
    if (target is null) return Msg(404, "Không tìm thấy tài khoản");
    if (target.Id == GetCurrentUser(ctx)!.Id) return Msg(400, "Không thể tự xóa tài khoản của chính mình");
    if (target.Role == Roles.Admin && target.Status == "active" &&
        !users.Any(u => u.Id != target.Id && u.Role == Roles.Admin && u.Status == "active"))
        return Msg(409, "Cần giữ ít nhất một quản trị viên đang hoạt động");
    var deleteBlock = await adminRepository.GetUserDeleteBlockReasonAsync(id, ctx.RequestAborted);
    if (deleteBlock is not null) return Msg(409, deleteBlock);

    // TODO-DB: DELETE FROM Users WHERE Id = @id
    foreach (var linked in artists.Where(x => x.UserId == id))
        linked.UserId = null;
    communityMembers.RemoveAll(m => m.UserId == id);
    carts.Remove(id);
    RemoveSessionsOf(id);
    passwordResetTokens.RemoveAll(token => token.UserId == id);
    users.Remove(target);
    return Msg(200, "Đã xóa tài khoản");
});

// =====================================================
// 6. QUẢN TRỊ: LIÊN KẾT TÀI KHOẢN NGHỆ SĨ
// (thêm / sửa / xóa nghệ sĩ dùng POST, PUT, DELETE /api/artists ở phần 4)
// =====================================================

// Gắn tài khoản (vai trò artist) vào hồ sơ nghệ sĩ. Gửi {"userId": 7}, hoặc {"userId": null} để gỡ liên kết.
admin.MapPut("/artists/{id:int}/account", IResult (int id, HttpContext ctx, LinkArtistAccountRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var artist = artists.FirstOrDefault(a => a.Id == id);
    if (artist is null) return Msg(404, "Không tìm thấy nghệ sĩ");

    // TODO-DB: UPDATE Artists SET UserId = @userId WHERE Id = @id  (cột UserId là UNIQUE)
    if (req.UserId is null)
    {
        artist.UserId = null;
        return Results.Ok(artist);
    }

    var account = users.FirstOrDefault(u => u.Id == req.UserId);
    if (account is null) return Msg(404, "Không tìm thấy tài khoản");
    if (account.Role != Roles.Artist) return Msg(400, "Tài khoản phải có vai trò artist");
    if (artists.Any(a => a.Id != id && a.UserId == account.Id))
        return Msg(409, "Tài khoản này đã liên kết với nghệ sĩ khác");

    artist.UserId = account.Id;
    return Results.Ok(artist);
});

// =====================================================
// 7. QUẢN TRỊ: DANH MỤC SẢN PHẨM
// =====================================================

// Danh sách danh mục (kèm số sản phẩm)
admin.MapGet("/categories", IResult (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    // TODO-DB: SELECT c.*, COUNT(p.Id) FROM Categories c LEFT JOIN Products p ... GROUP BY c.Id
    var result = categories
        .OrderBy(c => c.Id)
        .Select(c => new { c.Id, c.Slug, c.Name, ProductCount = products.Count(p => p.CategoryId == c.Id) })
        .ToList();
    return Results.Ok(result);
});

// Thêm danh mục. Gửi {"name": "Áo"}; slug để trống thì tự tạo từ tên.
admin.MapPost("/categories", IResult (HttpContext ctx, CategoryRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;
    if (string.IsNullOrWhiteSpace(req.Name)) return Msg(400, "Vui lòng nhập tên danh mục");

    var slug = Slugify(string.IsNullOrWhiteSpace(req.Slug) ? req.Name : req.Slug);
    if (slug == "") return Msg(400, "Slug không hợp lệ");
    if (categories.Any(c => c.Slug == slug)) return Msg(409, "Danh mục đã tồn tại");

    // TODO-DB: INSERT INTO Categories (...) VALUES (...)
    var category = new Category { Id = nextCategoryId++, Slug = slug, Name = req.Name.Trim() };
    categories.Add(category);
    return Results.Json(category, statusCode: 201);
});

// Sửa danh mục (chỉ sửa trường có gửi lên)
admin.MapPut("/categories/{id:int}", IResult (int id, HttpContext ctx, CategoryRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var category = categories.FirstOrDefault(c => c.Id == id);
    if (category is null) return Msg(404, "Không tìm thấy danh mục");

    if (req.Name is not null && string.IsNullOrWhiteSpace(req.Name)) return Msg(400, "Tên danh mục không được để trống");

    string? newSlug = null;
    if (req.Slug is not null)
    {
        newSlug = Slugify(req.Slug);
        if (newSlug == "") return Msg(400, "Slug không hợp lệ");
        if (categories.Any(c => c.Id != id && c.Slug == newSlug)) return Msg(409, "Slug đã được sử dụng");
    }

    // TODO-DB: UPDATE Categories SET ... WHERE Id = @id
    if (req.Name is not null) category.Name = req.Name.Trim();
    if (newSlug is not null) category.Slug = newSlug;
    return Results.Ok(category);
});

// Xóa danh mục (không xóa được nếu còn sản phẩm)
admin.MapDelete("/categories/{id:int}", IResult (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var category = categories.FirstOrDefault(c => c.Id == id);
    if (category is null) return Msg(404, "Không tìm thấy danh mục");

    var productCount = products.Count(p => p.CategoryId == id);
    if (productCount > 0)
        return Msg(409, "Danh mục còn " + productCount + " sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước.");

    // TODO-DB: DELETE FROM Categories WHERE Id = @id
    categories.Remove(category);
    return Msg(200, "Đã xóa danh mục");
});

// =====================================================
// 8. QUẢN TRỊ: SẢN PHẨM VÀ BIẾN THỂ (hàng hóa)
//
// Mỗi sản phẩm có ít nhất 1 biến thể; tồn kho nằm ở biến thể (ví dụ: Size M còn 5 cái).
// Sản phẩm có status "hidden" là đang ẩn: API công khai của Người B (nếu có) nên chỉ lấy "active".
// =====================================================

// Danh sách sản phẩm. Lọc tùy chọn: ?q=tu-khoa  ?artistId=1  ?categoryId=2  ?status=hidden
admin.MapGet("/products", IResult (HttpContext ctx, string? q, int? artistId, int? categoryId, string? status) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var statusFilter = (status ?? "").Trim().ToLowerInvariant();
    var keyword = Fold(q);

    // TODO-DB: SELECT ... FROM Products WHERE ... (lọc và tìm kiếm bằng SQL)
    var result = products
        .Where(p => artistId is null || p.ArtistId == artistId)
        .Where(p => categoryId is null || p.CategoryId == categoryId)
        .Where(p => statusFilter == "" || p.Status == statusFilter)
        .Where(p => keyword == "" || Fold(p.Name).Contains(keyword))
        .OrderBy(p => p.Id)
        .Select(p => ProductView(p))
        .ToList();
    return Results.Ok(result);
});

// Xem 1 sản phẩm
admin.MapGet("/products/{id:int}", IResult (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var product = products.FirstOrDefault(p => p.Id == id);
    return product is null ? Msg(404, "Không tìm thấy sản phẩm") : Results.Ok(ProductView(product));
});

// Thêm sản phẩm. Bắt buộc: name, price (> 0), artistId, categoryId.
// Tùy chọn: description, image, images[], status ("active" hoặc "hidden"), variants[] ({sku, name, stock}).
// Không gửi variants thì tự tạo 1 biến thể "Mặc định" với tồn kho 0.
admin.MapPost("/products", IResult (HttpContext ctx, ProductRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var product = new Product { Id = nextProductId };
    if (ApplyProduct(product, req, true) is { } invalid) return invalid;

    nextProductId++;
    products.Add(product); // thêm trước để AddVariant kiểm tra được SKU trùng ngay trong yêu cầu này

    var variantRequests = req.Variants is { Count: > 0 }
        ? req.Variants
        : new List<VariantRequest> { new VariantRequest(null, null, 0) };

    foreach (var variantRequest in variantRequests)
    {
        if (AddVariant(product, variantRequest) is { } variantError)
        {
            products.Remove(product); // lỗi biến thể thì hủy luôn sản phẩm vừa tạo dở
            return variantError;
        }
    }

    // TODO-DB: INSERT INTO Products, ProductVariants, ProductImages trong cùng 1 giao dịch (transaction)
    return Results.Json(ProductView(product), statusCode: 201);
});

// Sửa sản phẩm (name, description, price, artistId, categoryId, image, images, status).
// Chỉ sửa trường có gửi lên. Biến thể và tồn kho sửa bằng các API /variants bên dưới.
admin.MapPut("/products/{id:int}", IResult (int id, HttpContext ctx, ProductRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Msg(404, "Không tìm thấy sản phẩm");

    // TODO-DB: UPDATE Products SET ... WHERE Id = @id
    if (ApplyProduct(product, req, false) is { } invalid) return invalid;
    return Results.Ok(ProductView(product));
});

// Xóa sản phẩm
admin.MapDelete("/products/{id:int}", IResult (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Msg(404, "Không tìm thấy sản phẩm");

    lock (dataLock)
    {
        var variantIds = product.Variants.Select(v => v.Id).ToHashSet();
        if (carts.Values.Any(cart => cart.Any(item => variantIds.Contains(item.VariantId))) ||
            orders.Any(order => order.Items.Any(item => variantIds.Contains(item.VariantId))))
            return Msg(409, "Sản phẩm đang nằm trong giỏ hàng hoặc đơn hàng; hãy ẩn sản phẩm thay vì xóa");

        products.Remove(product);
    }
    return Msg(200, "Đã xóa sản phẩm");
});

// Thêm biến thể cho sản phẩm. Gửi {"sku": "...", "name": "Size M", "stock": 10}
admin.MapPost("/products/{id:int}/variants", IResult (int id, HttpContext ctx, VariantRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Msg(404, "Không tìm thấy sản phẩm");

    // TODO-DB: INSERT INTO ProductVariants (...) VALUES (...)
    if (AddVariant(product, req) is { } variantError) return variantError;
    return Results.Json(ProductView(product), statusCode: 201);
});

// Sửa biến thể (sku, name, stock). Chỉ sửa trường có gửi lên. Dùng để cập nhật tồn kho.
admin.MapPut("/products/{id:int}/variants/{variantId:int}", IResult (int id, int variantId, HttpContext ctx, VariantRequest req) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Msg(404, "Không tìm thấy sản phẩm");
    var variant = product.Variants.FirstOrDefault(v => v.Id == variantId);
    if (variant is null) return Msg(404, "Không tìm thấy biến thể");

    // ----- Kiểm tra (chưa sửa gì) -----
    if (req.Stock is not null && req.Stock < 0) return Msg(400, "Tồn kho không được âm");

    string? newSku = null;
    if (req.Sku is not null)
    {
        newSku = req.Sku.Trim();
        if (newSku == "") return Msg(400, "SKU không được để trống");
        if (products.Any(x => x.Variants.Any(v => v.Id != variantId && v.Sku.Equals(newSku, StringComparison.OrdinalIgnoreCase))))
            return Msg(409, "SKU '" + newSku + "' đã tồn tại");
    }

    // ----- Áp dụng -----
    // TODO-DB: UPDATE ProductVariants SET ... WHERE Id = @variantId
    lock (dataLock)
    {
        if (newSku is not null) variant.Sku = newSku;
        if (!string.IsNullOrWhiteSpace(req.Name)) variant.Name = req.Name.Trim();
        if (req.Stock is not null) variant.Stock = req.Stock.Value;
    }
    return Results.Ok(ProductView(product));
});

// Xóa biến thể (sản phẩm phải còn ít nhất 1 biến thể)
admin.MapDelete("/products/{id:int}/variants/{variantId:int}", IResult (int id, int variantId, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Admin) is { } denied) return denied;

    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Msg(404, "Không tìm thấy sản phẩm");
    var variant = product.Variants.FirstOrDefault(v => v.Id == variantId);
    if (variant is null) return Msg(404, "Không tìm thấy biến thể");
    if (product.Variants.Count <= 1) return Msg(409, "Sản phẩm phải có ít nhất một biến thể");

    lock (dataLock)
    {
        if (carts.Values.Any(cart => cart.Any(item => item.VariantId == variantId)) ||
            orders.Any(order => order.Items.Any(item => item.VariantId == variantId)))
            return Msg(409, "Biến thể đang nằm trong giỏ hàng hoặc đơn hàng, không thể xóa");

        product.Variants.Remove(variant);
    }
    return Results.Ok(ProductView(product));
});

// =====================================================
// 9. PHẦN CỦA NGƯỜI B: Sản phẩm (công khai) + Giỏ hàng + Đơn hàng
// Các collection được nạp từ SQL Server và lưu trong transaction sau request ghi.
// =====================================================

// Danh sách sản phẩm công khai. Sản phẩm ẩn không được hiển thị hoặc đặt mua.
app.MapGet("/api/products", IResult (
    string? q, int? artistId, int? categoryId, int? minPrice, int? maxPrice, string? sort) =>
{
    if (minPrice < 0 || maxPrice < 0 || (minPrice is not null && maxPrice is not null && minPrice > maxPrice))
        return Msg(400, "Khoảng giá không hợp lệ");

    var keyword = Fold(q);
    var result = products
        .Where(p => p.Status == "active")
        .Where(p => artistId is null || p.ArtistId == artistId)
        .Where(p => categoryId is null || p.CategoryId == categoryId)
        .Where(p => minPrice is null || p.Price >= minPrice)
        .Where(p => maxPrice is null || p.Price <= maxPrice)
        .Where(p => keyword == "" || Fold(p.Name).Contains(keyword) ||
            Fold(artists.FirstOrDefault(a => a.Id == p.ArtistId)?.Name).Contains(keyword))
        .ToList();

    result = (sort ?? "").Trim().ToLowerInvariant() switch
    {
        "price-asc" => result.OrderBy(p => p.Price).ThenBy(p => p.Id).ToList(),
        "price-desc" => result.OrderByDescending(p => p.Price).ThenBy(p => p.Id).ToList(),
        "name-asc" => result.OrderBy(p => p.Name).ThenBy(p => p.Id).ToList(),
        _ => result.OrderBy(p => p.Id).ToList(),
    };

    return Results.Ok(result.Select(PublicProductView));
});

// Chi tiết sản phẩm
app.MapGet("/api/products/{id:int}", IResult (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id && p.Status == "active");
    return product is null ? Msg(404, "Không tìm thấy sản phẩm") : Results.Ok(PublicProductView(product));
});

// Xem giỏ hàng của tài khoản hiện tại
app.MapGet("/api/cart", IResult (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;
    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
        return Results.Ok(CartView(carts.GetValueOrDefault(user.Id) ?? new List<CartItem>()));
});

// Thêm sản phẩm/biến thể vào giỏ
app.MapPost("/api/cart/items", IResult (HttpContext ctx, AddCartItemRequest req) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;
    if (req.ProductId is null || req.Quantity is null || req.Quantity < 1 || req.Quantity > 99)
        return Msg(400, "Sản phẩm và số lượng từ 1 đến 99 là bắt buộc");

    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
    {
        var product = products.FirstOrDefault(p => p.Id == req.ProductId && p.Status == "active");
        if (product is null) return Msg(404, "Không tìm thấy sản phẩm đang bán");

        var variant = req.VariantId is null
            ? product.Variants.Count == 1 ? product.Variants[0] : null
            : product.Variants.FirstOrDefault(v => v.Id == req.VariantId);
        if (variant is null) return Msg(400, "Vui lòng chọn biến thể hợp lệ");

        var cart = carts.GetValueOrDefault(user.Id);
        if (cart is null)
        {
            cart = new List<CartItem>();
            carts[user.Id] = cart;
        }

        var item = cart.FirstOrDefault(i => i.VariantId == variant.Id);
        var nextQuantity = (item?.Quantity ?? 0) + req.Quantity.Value;
        if (nextQuantity > 99) return Msg(400, "Số lượng mỗi biến thể không được vượt quá 99");
        if (nextQuantity > variant.Stock)
            return Msg(409, $"Sản phẩm chỉ còn {variant.Stock} sản phẩm trong kho");

        if (item is null)
            cart.Add(new CartItem { VariantId = variant.Id, Quantity = req.Quantity.Value });
        else
            item.Quantity = nextQuantity;

        return Results.Created("/api/cart", CartView(cart));
    }
});

// Cập nhật số lượng một biến thể trong giỏ
app.MapPut("/api/cart/items/{variantId:int}", IResult (int variantId, HttpContext ctx, UpdateCartItemRequest req) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;
    if (req.Quantity is null || req.Quantity < 1 || req.Quantity > 99)
        return Msg(400, "Số lượng phải từ 1 đến 99");

    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
    {
        var cart = carts.GetValueOrDefault(user.Id);
        var item = cart?.FirstOrDefault(i => i.VariantId == variantId);
        if (item is null) return Msg(404, "Không tìm thấy sản phẩm trong giỏ hàng");

        var product = products.FirstOrDefault(p => p.Variants.Any(v => v.Id == variantId));
        var variant = product?.Variants.FirstOrDefault(v => v.Id == variantId);
        if (product is null || variant is null || product.Status != "active")
            return Msg(409, "Sản phẩm hiện không thể đặt mua");
        if (req.Quantity > variant.Stock)
            return Msg(409, $"Sản phẩm chỉ còn {variant.Stock} sản phẩm trong kho");

        item.Quantity = req.Quantity.Value;
        return Results.Ok(CartView(cart!));
    }
});

// Xóa một sản phẩm khỏi giỏ
app.MapDelete("/api/cart/items/{variantId:int}", IResult (int variantId, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;
    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
    {
        var cart = carts.GetValueOrDefault(user.Id);
        if (cart is null || cart.RemoveAll(i => i.VariantId == variantId) == 0)
            return Msg(404, "Không tìm thấy sản phẩm trong giỏ hàng");
        return Results.Ok(CartView(cart));
    }
});

// Xóa toàn bộ giỏ hàng
app.MapDelete("/api/cart", IResult (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;
    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
    {
        carts.Remove(user.Id);
        return Results.Ok(new { message = "Đã làm trống giỏ hàng" });
    }
});

// Tạo đơn từ giỏ hàng. Giá và tồn kho luôn được máy chủ kiểm tra/tính toán.
app.MapPost("/api/orders", IResult (HttpContext ctx, CreateOrderRequest req) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;

    var receiverName = (req.ReceiverName ?? "").Trim();
    var receiverPhone = (req.ReceiverPhone ?? "").Trim();
    var shippingAddress = (req.ShippingAddress ?? "").Trim();
    var note = (req.Note ?? "").Trim();
    if (receiverName.Length is < 2 or > 100)
        return Msg(400, "Tên người nhận phải từ 2 đến 100 ký tự");
    if (!System.Text.RegularExpressions.Regex.IsMatch(receiverPhone, @"^[0-9+()\-\s]{8,20}$"))
        return Msg(400, "Số điện thoại người nhận không hợp lệ");
    if (shippingAddress.Length is < 5 or > 500)
        return Msg(400, "Địa chỉ nhận hàng phải từ 5 đến 500 ký tự");
    if (note.Length > 500)
        return Msg(400, "Ghi chú không được vượt quá 500 ký tự");

    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
    {
        var cart = carts.GetValueOrDefault(user.Id);
        if (cart is null || cart.Count == 0) return Msg(409, "Giỏ hàng đang trống");

        var orderItems = new List<OrderItem>();
        foreach (var cartItem in cart)
        {
            var product = products.FirstOrDefault(p => p.Variants.Any(v => v.Id == cartItem.VariantId));
            var variant = product?.Variants.FirstOrDefault(v => v.Id == cartItem.VariantId);
            if (product is null || variant is null || product.Status != "active")
                return Msg(409, "Một sản phẩm trong giỏ hiện không thể đặt mua");
            if (cartItem.Quantity > variant.Stock)
                return Msg(409, $"Sản phẩm '{product.Name}' chỉ còn {variant.Stock} sản phẩm trong kho");

            orderItems.Add(new OrderItem
            {
                VariantId = variant.Id,
                ProductName = product.Name,
                Sku = variant.Sku,
                UnitPrice = product.Price,
                Quantity = cartItem.Quantity,
            });
        }

        var subtotal = orderItems.Sum(item => (decimal)item.UnitPrice * item.Quantity);
        var orderId = nextOrderId++;
        var order = new Order
        {
            Id = orderId,
            Code = $"OV{DateTime.UtcNow:yyMMdd}{orderId:D6}",
            UserId = user.Id,
            ReceiverName = receiverName,
            ReceiverPhone = receiverPhone,
            ShippingAddress = shippingAddress,
            Note = note,
            ShippingFee = 0,
            TotalAmount = subtotal,
            Items = orderItems,
        };

        foreach (var cartItem in cart)
        {
            var variant = products.SelectMany(p => p.Variants).First(v => v.Id == cartItem.VariantId);
            variant.Stock -= cartItem.Quantity;
        }
        orders.Add(order);
        carts.Remove(user.Id);

        return Results.Created($"/api/orders/{order.Id}", OrderView(order));
    }
});

// Danh sách đơn của người dùng hiện tại
app.MapGet("/api/orders", IResult (HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;
    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
        return Results.Ok(orders.Where(order => order.UserId == user.Id)
            .OrderByDescending(order => order.CreatedAt).Select(OrderView).ToList());
});

// Chi tiết đơn hàng chỉ chủ đơn mới xem được
app.MapGet("/api/orders/{id:int}", IResult (int id, HttpContext ctx) =>
{
    if (CheckRole(ctx, Roles.Customer) is { } denied) return denied;
    var user = GetCurrentUser(ctx)!;
    lock (dataLock)
    {
        var order = orders.FirstOrDefault(item => item.Id == id && item.UserId == user.Id);
        return order is null ? Msg(404, "Không tìm thấy đơn hàng") : Results.Ok(OrderView(order));
    }
});

// Ghi mọi thay đổi thành công vào SQL trước khi trả phản hồi thành công cho client.
app.Use(async (ctx, next) =>
{
    if (HttpMethods.IsGet(ctx.Request.Method) ||
        HttpMethods.IsHead(ctx.Request.Method) ||
        HttpMethods.IsOptions(ctx.Request.Method))
    {
        await next();
        return;
    }

    var originalBody = ctx.Response.Body;
    await using var bufferedBody = new MemoryStream();
    ctx.Response.Body = bufferedBody;
    try
    {
        await next();
        if (ctx.Response.StatusCode < StatusCodes.Status400BadRequest &&
            ctx.Items["SkipApiStateSave"] is not true)
        {
            try
            {
                await database.SaveAsync(
                    users, artists, categories, products, communities, communityMembers,
                    passwordResetTokens, carts, orders);
            }
            catch (Exception ex)
            {
                app.Logger.LogError(ex, "Failed to commit API state to SQL Server.");
                ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
                ctx.Response.ContentType = "application/json; charset=utf-8";
                ctx.Response.Headers.ContentLength = null;
                bufferedBody.SetLength(0);
                await System.Text.Json.JsonSerializer.SerializeAsync(
                    bufferedBody,
                    new { message = "Không thể lưu dữ liệu vào database. Vui lòng thử lại." });
            }
        }
    }
    finally
    {
        ctx.Response.Body = originalBody;
    }

    bufferedBody.Position = 0;
    await bufferedBody.CopyToAsync(originalBody);
});

// =====================================================
// Địa chỉ/cổng lấy từ profile cấu hình khi chạy dotnet run.
// =====================================================
app.Run();
