// =====================================================
// OWNIVERSE - BACKEND API (ASP.NET Minimal API, .NET 10)
// Người A: Tài khoản + Nghệ sĩ
// Đang dùng DỮ LIỆU GIẢ (lưu trong bộ nhớ, tắt server là mất).
//
// Chỗ nào ghi "TODO-DB" là chỗ sau này phải đổi sang
// database thật khi nhóm CSDL có ERD xong.
// Tìm nhanh: Ctrl + Shift + F rồi gõ  TODO-DB
// =====================================================

using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

// Cho phép trang HTML (chạy ở địa chỉ khác) gọi sang API này
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

// =====================================================
// DỮ LIỆU GIẢ
// =====================================================

// TODO-DB: thay bằng bảng Users (đúng tên cột theo ERD)
var users = new List<User>
{
    new() { Id = 1, FullName = "Admin Owniverse", Email = "admin@owniverse.com", Password = "admin123", Role = "admin" },
    new() { Id = 2, FullName = "Fan Mẫu", Email = "fan@gmail.com", Password = "123456", Phone = "0900000000", Address = "TP.HCM", Role = "customer" },
    new() { Id = 3, FullName = "Khách hàng", Email = "customer@owniverse.com", Password = "Customer123", Phone = "0900000000", Role = "customer" },
};
var nextUserId = 4;

// TODO-DB: thay bằng bảng Artists (+ các bảng con: mốc sự nghiệp, hoạt động, MV)
// Dữ liệu mẫu của 3 nghệ sĩ nằm trong file SeedData.cs
var artists = SeedData.CreateArtists();
var nextArtistId = artists.Max(a => a.Id) + 1;

// TODO-DB: thay bằng bảng Follows (userId, artistId)
var follows = new List<Follow>();

// TODO-DB: có thể giữ nguyên, hoặc đổi sang JWT / bảng Sessions
var sessions = new ConcurrentDictionary<string, int>(); // token -> userId

// =====================================================
// HÀM HỖ TRỢ
// =====================================================

IResult Msg(int status, string message) => Results.Json(new { message }, statusCode: status);

// Không bao giờ trả mật khẩu về cho frontend
object PublicUser(User u) => new { u.Id, u.FullName, u.Email, u.Phone, u.Address, u.Role };

// Frontend gửi token qua header:  Authorization: Bearer <token>
string GetToken(HttpContext ctx) =>
    ctx.Request.Headers.Authorization.ToString().Replace("Bearer ", "").Trim();

// Lấy người dùng đang đăng nhập (null nếu chưa đăng nhập)
User? GetCurrentUser(HttpContext ctx)
{
    var token = GetToken(ctx);
    if (sessions.TryGetValue(token, out var userId))
        return users.FirstOrDefault(u => u.Id == userId); // TODO-DB: SELECT * FROM Users WHERE Id = @id
    return null;
}

// "Mira Official" -> "mira-official"
string Slugify(string text) =>
    string.Join("-", text.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));

// Phòng khi frontend gửi thiếu/null các phần con của nghệ sĩ
void FillMissing(Artist a)
{
    a.Social ??= new SocialLinks();
    a.Promotion ??= new Promotion();
    a.Information ??= new List<TimelineItem>();
    a.Activities ??= new List<ArtistActivity>();
    a.MusicVideos ??= new List<MusicVideo>();
}

// =====================================================
// PHẦN CỦA NGƯỜI A - TÀI KHOẢN
// =====================================================

// Đăng ký
app.MapPost("/api/auth/register", IResult (RegisterRequest req) =>
{
    if (string.IsNullOrWhiteSpace(req.FullName) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        return Msg(400, "Vui lòng nhập đầy đủ họ tên, email và mật khẩu");

    // TODO-DB: SELECT * FROM Users WHERE Email = @email
    if (users.Any(u => u.Email.Equals(req.Email, StringComparison.OrdinalIgnoreCase)))
        return Msg(409, "Email đã được sử dụng");

    // TODO-DB: mã hóa mật khẩu (hash) trước khi lưu
    // TODO-DB: INSERT INTO Users (...) VALUES (...)
    var newUser = new User
    {
        Id = nextUserId++,
        FullName = req.FullName,
        Email = req.Email,
        Password = req.Password,
        Phone = req.Phone ?? "",
        Role = "customer",
    };
    users.Add(newUser);

    return Results.Json(new { message = "Đăng ký thành công", user = PublicUser(newUser) }, statusCode: 201);
});

// Đăng nhập
app.MapPost("/api/auth/login", IResult (LoginRequest req) =>
{
    // TODO-DB: SELECT * FROM Users WHERE Email = @email rồi so sánh mật khẩu đã mã hóa
    var user = users.FirstOrDefault(u =>
        u.Email.Equals(req.Email, StringComparison.OrdinalIgnoreCase) && u.Password == req.Password);
    if (user is null)
        return Msg(401, "Sai email hoặc mật khẩu");

    var token = Guid.NewGuid().ToString();
    sessions[token] = user.Id;

    return Results.Ok(new { message = "Đăng nhập thành công", token, user = PublicUser(user) });
});

// Đăng xuất
app.MapPost("/api/auth/logout", IResult (HttpContext ctx) =>
{
    if (GetCurrentUser(ctx) is null) return Msg(401, "Bạn chưa đăng nhập");
    sessions.TryRemove(GetToken(ctx), out _);
    return Msg(200, "Đăng xuất thành công");
});

// Xem thông tin cá nhân
app.MapGet("/api/users/me", IResult (HttpContext ctx) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    return Results.Ok(PublicUser(user));
});

// Cập nhật thông tin cá nhân
app.MapPut("/api/users/me", IResult (HttpContext ctx, UpdateProfileRequest req) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");

    // TODO-DB: UPDATE Users SET FullName = @fullName, Phone = @phone, Address = @address WHERE Id = @id
    if (req.Email is not null && !req.Email.Equals(user.Email, StringComparison.OrdinalIgnoreCase))
    {
        // TODO-DB: kiểm tra email mới chưa ai dùng (SELECT ... WHERE Email = @email AND Id <> @id)
        if (users.Any(u => u.Id != user.Id && u.Email.Equals(req.Email, StringComparison.OrdinalIgnoreCase)))
            return Msg(409, "Email đã được sử dụng");
        user.Email = req.Email;
    }
    if (req.FullName is not null) user.FullName = req.FullName;
    if (req.Phone is not null) user.Phone = req.Phone;
    if (req.Address is not null) user.Address = req.Address;

    return Results.Ok(new { message = "Cập nhật thành công", user = PublicUser(user) });
});

// Đổi mật khẩu
app.MapPut("/api/users/me/password", IResult (HttpContext ctx, ChangePasswordRequest req) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");

    // TODO-DB: so sánh mật khẩu cũ đã mã hóa với dữ liệu trong bảng Users
    if (user.Password != req.OldPassword)
        return Msg(400, "Mật khẩu hiện tại không đúng");
    if (string.IsNullOrEmpty(req.NewPassword) || req.NewPassword.Length < 8)
        return Msg(400, "Mật khẩu mới tối thiểu 8 ký tự");

    // TODO-DB: UPDATE Users SET Password = @hash WHERE Id = @id (nhớ mã hóa)
    user.Password = req.NewPassword;
    return Msg(200, "Đổi mật khẩu thành công");
});

// =====================================================
// PHẦN CỦA NGƯỜI A - NGHỆ SĨ
// =====================================================

// Danh sách nghệ sĩ (trang artist.html dùng)
app.MapGet("/api/artists", () =>
{
    // TODO-DB: SELECT * FROM Artists (+ join các bảng con nếu cần)
    return Results.Ok(artists);
});

// Chi tiết 1 nghệ sĩ (trang artist-detail.html dùng)
// Gọi bằng slug:  /api/artists/kairo   hoặc bằng id:  /api/artists/1
app.MapGet("/api/artists/{key}", IResult (string key) =>
{
    // TODO-DB: SELECT * FROM Artists WHERE Slug = @slug (hoặc WHERE Id = @id)
    var artist = int.TryParse(key, out var id)
        ? artists.FirstOrDefault(a => a.Id == id)
        : artists.FirstOrDefault(a => a.Slug.Equals(key, StringComparison.OrdinalIgnoreCase));

    return artist is null ? Msg(404, "Không tìm thấy nghệ sĩ") : Results.Ok(artist);
});

// Theo dõi nghệ sĩ
app.MapPost("/api/artists/{id:int}/follow", IResult (int id, HttpContext ctx) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (!artists.Any(a => a.Id == id)) return Msg(404, "Không tìm thấy nghệ sĩ");

    // TODO-DB: kiểm tra rồi INSERT INTO Follows (UserId, ArtistId)
    if (!follows.Any(f => f.UserId == user.Id && f.ArtistId == id))
        follows.Add(new Follow(user.Id, id));

    return Msg(200, "Đã theo dõi nghệ sĩ");
});

// Bỏ theo dõi nghệ sĩ
app.MapDelete("/api/artists/{id:int}/follow", IResult (int id, HttpContext ctx) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");

    // TODO-DB: DELETE FROM Follows WHERE UserId = @userId AND ArtistId = @artistId
    follows.RemoveAll(f => f.UserId == user.Id && f.ArtistId == id);
    return Msg(200, "Đã bỏ theo dõi nghệ sĩ");
});

// Danh sách id nghệ sĩ tôi đang theo dõi (để frontend biết nút nào hiện "Đã theo dõi")
app.MapGet("/api/users/me/following", IResult (HttpContext ctx) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");

    // TODO-DB: SELECT ArtistId FROM Follows WHERE UserId = @userId
    var ids = follows.Where(f => f.UserId == user.Id).Select(f => f.ArtistId).ToList();
    return Results.Ok(ids);
});

// ----- Admin quản lý nghệ sĩ (cần đăng nhập bằng tài khoản admin) -----

// Thêm nghệ sĩ (gửi toàn bộ thông tin nghệ sĩ dạng JSON, giống dữ liệu trong GET /api/artists/kairo)
app.MapPost("/api/artists", IResult (HttpContext ctx, Artist req) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (user.Role != "admin") return Msg(403, "Bạn không có quyền thực hiện thao tác này");
    if (string.IsNullOrWhiteSpace(req.Name)) return Msg(400, "Vui lòng nhập tên nghệ sĩ");

    if (string.IsNullOrWhiteSpace(req.Slug)) req.Slug = Slugify(req.Name);

    // TODO-DB: kiểm tra slug chưa tồn tại
    if (artists.Any(a => a.Slug.Equals(req.Slug, StringComparison.OrdinalIgnoreCase)))
        return Msg(409, "Slug đã được sử dụng");

    FillMissing(req);

    // TODO-DB: INSERT INTO Artists (...) VALUES (...) (+ các bảng con)
    req.Id = nextArtistId++;
    artists.Add(req);
    return Results.Json(req, statusCode: 201);
});

// Sửa nghệ sĩ (gửi lại TOÀN BỘ thông tin nghệ sĩ, id lấy theo địa chỉ)
app.MapPut("/api/artists/{id:int}", IResult (int id, HttpContext ctx, Artist req) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (user.Role != "admin") return Msg(403, "Bạn không có quyền thực hiện thao tác này");

    var index = artists.FindIndex(a => a.Id == id);
    if (index == -1) return Msg(404, "Không tìm thấy nghệ sĩ");
    if (string.IsNullOrWhiteSpace(req.Name)) return Msg(400, "Vui lòng nhập tên nghệ sĩ");

    if (string.IsNullOrWhiteSpace(req.Slug)) req.Slug = artists[index].Slug;

    // TODO-DB: kiểm tra slug không trùng nghệ sĩ khác
    if (artists.Any(a => a.Id != id && a.Slug.Equals(req.Slug, StringComparison.OrdinalIgnoreCase)))
        return Msg(409, "Slug đã được sử dụng");

    FillMissing(req);

    // TODO-DB: UPDATE Artists SET ... WHERE Id = @id (+ cập nhật các bảng con)
    req.Id = id;
    artists[index] = req;
    return Results.Ok(req);
});

// Xóa nghệ sĩ
app.MapDelete("/api/artists/{id:int}", IResult (int id, HttpContext ctx) =>
{
    var user = GetCurrentUser(ctx);
    if (user is null) return Msg(401, "Bạn chưa đăng nhập");
    if (user.Role != "admin") return Msg(403, "Bạn không có quyền thực hiện thao tác này");

    // TODO-DB: DELETE FROM Artists WHERE Id = @id (nhớ xóa luôn các dòng Follows liên quan)
    var artist = artists.FirstOrDefault(a => a.Id == id);
    if (artist is null) return Msg(404, "Không tìm thấy nghệ sĩ");

    artists.Remove(artist);
    follows.RemoveAll(f => f.ArtistId == id);
    return Msg(200, "Đã xóa nghệ sĩ");
});

// =====================================================
// PHẦN CỦA NGƯỜI B: Sản phẩm + Giỏ hàng + Đơn hàng
// (Người B thêm các app.MapGet / app.MapPost của mình vào đây.
//  Dùng được GetCurrentUser(ctx), Msg(...) ở trên.)
// =====================================================

// =====================================================
// CHẠY SERVER (giữ cổng 3000 để frontend khỏi phải đổi)
// =====================================================
app.Run("http://localhost:3000");

// =====================================================
// KIỂU DỮ LIỆU (TODO-DB: sau này khớp với các bảng trong ERD)
// Tên thuộc tính tự động chuyển thành chữ thường đầu (FullName -> fullName)
// nên JSON trả về khớp với dữ liệu mà frontend đang dùng.
// =====================================================
class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
    public string Role { get; set; } = "customer"; // "admin" hoặc "customer"
}

class Artist
{
    public int Id { get; set; }
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

class SocialLinks
{
    public string Youtube { get; set; } = "";
    public string Instagram { get; set; } = "";
    public string Tiktok { get; set; } = "";
}

class Promotion
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Image { get; set; } = "";
    public string Link { get; set; } = "";
}

class TimelineItem
{
    public string Year { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
}

class ArtistActivity
{
    public string Title { get; set; } = "";
    public string Type { get; set; } = "";
    public string Date { get; set; } = "";
    public string Status { get; set; } = "upcoming"; // "ongoing" | "upcoming" | "ended"
    public string Description { get; set; } = "";
    public string Image { get; set; } = "";
    public string Link { get; set; } = "";
}

class MusicVideo
{
    public string Title { get; set; } = "";
    public string Type { get; set; } = "";
    public string YoutubeId { get; set; } = "";
}

record Follow(int UserId, int ArtistId);

// Dữ liệu frontend gửi lên
record RegisterRequest(string? FullName, string? Email, string? Phone, string? Password);
record LoginRequest(string? Email, string? Password);
record UpdateProfileRequest(string? FullName, string? Email, string? Phone, string? Address);
record ChangePasswordRequest(string? OldPassword, string? NewPassword);