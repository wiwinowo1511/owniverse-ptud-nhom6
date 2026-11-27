# OWNIVERSE – CHUẨN HÓA CODE BACKEND & FRONTEND

Tài liệu này định nghĩa quy ước viết code cho toàn bộ dự án Owniverse. Mọi thành viên trong team phải tuân thủ khi phát triển mới hoặc bảo trì.

---

## 1. NGUYÊN TẮC CHUNG

- **Không che giấu lỗi:** Không được `catch` exception rồi bỏ qua, log rồi trả về thành công. Lỗi database hoặc nghiệp vụ phải truyền tải đúng status code cho client.
- **Không tạo dữ liệu giả:** Không gán ID ngẫu nhiên, không tạo dữ liệu dummy để vượt qua constraint.
- **Giữ nguyên kiến trúc:** Không thêm tầng mới, không đổi database engine, không thay route API, không đổi cấu trúc JSON response.
- **Tính toàn vẹn dữ liệu:** In-memory state và database phải đồng bộ sau mỗi request thành công.

---

## 2. BACKEND (C# / .NET Minimal API)

### 2.1 File & cấu trúc
- Tất cả endpoint nằm trong `backend/OwniverseApi/Program.cs`.
- `Model.cs`: chỉ chứa class dữ liệu (record, class POCO).
- `SqlDatabase.cs`: chỉ chứa logic nạp/lưu DB qua Dapper + Npgsql.
- `UserRepository.cs`, `CommunityRepository.cs`, `AdminRepository.cs`: chứa truy vấn DB riêng lẻ theo chức năng.
- Không được tạo folder/controller/service mới mà không cần thiết.

### 2.2 Tên đặt (Naming)
| Mục tiêu | Quy ước | Ví dụ |
|----------|---------|-------|
| Class | PascalCase | `User`, `ProductVariant`, `SqlDatabase` |
| Method | PascalCase | `SaveAsync`, `FindByEmailAsync` |
| Property | PascalCase | `UserId`, `ArtistName`, `TotalStock` |
| Parameter | camelCase | `userId`, `connectionString` |
| Local variable | camelCase | `saveableArtists`, `newUser` |
| Constant | PascalCase | `Roles.Customer = "customer"` |
| File | PascalCase | `UserRepository.cs`, `SqlDatabase.cs` |

### 2.3 Xử lý lỗi (Error Handling)
- `SqlDatabase.SaveAsync()`: khi transaction thất bại, **phải `RollbackAsync()` rồi `throw`** lại exception. Không được log rồi swallow.
- Middleware lưu trạng thái (`Program.cs:1997-2042`): bắt exception từ `SaveAsync`, trả về HTTP 500, ghi đè response thành công.
- Repository: ném `PostgresException` ra ngoài để handler bắt và chuyển thành status code phù hợp (409 cho unique violation, 400/404 cho business error).
- Handler endpoint: dùng `Msg(status, message)` để trả lỗi JSON chuẩn: `{ "message": "..." }`.

### 2.4 Database (Neon PostgreSQL)
- Dùng Dapper, Npgsql.
- Mỗi thao tác ghi phải chạy trong `NpgsqlTransaction`, commit một lần duy nhất.
- Constraint quan trọng (không được vi phạm):
  - `artists.userid`: NOT NULL + UNIQUE + FK → chỉ lưu artist có `UserId != null`.
  - `communities.artistId`: NOT NULL + FK → chỉ lưu community khi artist đã tồn tại trong DB.
  - `products.artistId` / `products.categoryId`: FK → chỉ lưu product khi cả hai bên đã tồn tại.
- Truy vấn SQL: dùng parameterized query (`@Param`), không nối chuỗi SQL.
- Tên cột trong SQL: viết hoa đầu (`"userid"`, `"artistid"`, `"categoryid"`), alias lowercase cho C#.

### 2.5 In-memory state
- Dùng `List<T>`, `Dictionary<int, List<T>>` lưu trạng thái runtime.
- Khi cập nhật in-memory, phải dùng `lock (dataLock)` cho collection chia sẻ (`users`, `artists`, `products`, `carts`, `orders`...).
- Không được sửa in-memory rồi bỏ qua lưu DB. Middleware sẽ tự gọi `SaveAsync` sau mỗi request ghi (POST/PUT/DELETE) thành công.

### 2.6 Authentication & Session
- Token lưu trong `ConcurrentDictionary<string, SessionEntry>`.
- Session idle timeout: 30 phút.
- Vai trò: `customer`, `artist`, `admin`.
- Dùng `CheckRole(ctx, Roles.Admin)` để kiểm tra quyền, trả về `Msg(401)` hoặc `Msg(403)`.

### 2.7 Response JSON
- Thành công: `Results.Ok(...)`, `Results.Json(data, statusCode: 201)`, `Results.Created(...)`.
- Lỗi: `Results.Json(new { message }, statusCode: 400/401/403/404/409/500)`.
- Không bao giờ trả về `PasswordHash` ra client.

---

## 3. FRONTEND (HTML / CSS / JavaScript)

### 3.1 Thư mục JS
```
js/
  auth/          - login, register, logout, profile, change-password, forgot-password, auth.js (lõi)
  common/        - utils, notifications, role-guard, auth-guard, feedback
  cart/          - cart-store, cart-common
  pages/         - một file JS cho mỗi trang HTML (artist.js, product-detail.js, admin.js...)
```

### 3.2 Gọi API (apiRequest)
- Tất cả gọi backend thông qua hàm `apiRequest(path, options)` trong `js/auth/auth.js`.
- Options: `{ method, body, auth }`.
- `auth: true` sẽ gửi `Authorization: Bearer <token>` từ `localStorage`.
- Lỗi 401 + `auth: true` → xóa session, ném lỗi "Phiên đăng nhập đã hết hạn".
- Không được gọi `fetch` trực tiếp ở các trang riêng lẻ, phải dùng `apiRequest`.

### 3.3 Tên đặt JS
| Mục tiêu | Quy ước | Ví dụ |
|----------|---------|-------|
| Hàm | camelCase | `apiRequest`, `validateEmail`, `readJSON` |
| Hằng số | UPPER_SNAKE_CASE | `API_BASE_URL`, `TOKEN_KEY` |
| Biến | camelCase | `currentUser`, `authToken` |
| File | lowercase | `auth.js`, `utils.js`, `products.js` |
| localStorage key | `owniverse_*` | `owniverse_token`, `owniverse_current_user` |

### 3.4 CSS
- File CSS đặt theo trang: `css/pages/<trang>.css`.
- CSS chung: `css/style.css`, `css/chuanHeader.css`, `css/chuanFooter.css`.
- Không dùng inline style nếu có thể tránh.
- Class tên viết liền kebab-case: `.btn-primary`, `.nav-item`, `.product-card`.

### 3.5 HTML
- Mỗi trang một file `.html` tại root.
- Dùng `meta name="owniverse-api-base"` để override API URL nếu cần.
- Script JS load ở cuối `<body>`, sau các stylesheet.

---

## 4. DATABASE / SQL (Neon PostgreSQL)

- Schema nằm trong `database/create-database-postgresql.sql`.
- Không được đổi schema mà không thông báo team.
- Migrate dữ liệu mẫu: `database/seed-data-postgresql.sql`.
- Tên bảng: `public.users`, `public.artists`, `public.categories`, `public.products`, `public.communities`, `public.communitymembers`, `public.artistapidata`, `public.productvariants`, `public.productimages`, `public.carts`, `public.cartitems`, `public.orders`, `public.orderitems`, `public.passwordresettokens`.
- Tên cột: snake_case, viết hoa đầu trong SQL (`"userid"`, `"artistid"`).
- Không được xóa hoặc reset dữ liệu production khi đang chạy.

---

## 5. API ROUTES (không được thay đổi)

| Method | Route | Mô tả | Quyền |
|--------|-------|-------|-------|
| POST | `/api/auth/register` | Đăng ký | Public |
| POST | `/api/auth/login` | Đăng nhập | Public |
| GET | `/api/users/me` | Hồ sơ cá nhân | Auth |
| PUT | `/api/users/me` | Cập nhật hồ sơ | Auth |
| POST | `/api/artists` | Tạo nghệ sĩ | Admin |
| GET | `/api/artists` | Danh sách nghệ sĩ | Public |
| GET | `/api/artists/{key}` | Chi tiết nghệ sĩ | Public |
| PUT | `/api/artists/me` | Sửa hồ sơ nghệ sĩ | Artist |
| POST | `/api/admin/users` | Tạo tài khoản | Admin |
| POST | `/api/admin/products` | Tạo sản phẩm | Admin |
| POST | `/api/admin/categories` | Tạo danh mục | Admin |
| POST | `/api/cart/items` | Thêm giỏ hàng | Customer |
| POST | `/api/orders` | Tạo đơn hàng | Customer |

---

## 6. GIT & COMMIT

- Commit message tiếng Việt, viết hoa đầu câu, không quá dài.
- Format: `[TAG] Mô tả ngắn gọn`
  - `[FIX]`: sửa lỗi
  - `[FEAT]`: tính năng mới
  - `[REFACTOR]`: tái cấu trúc (tránh nếu không cần)
  - `[DOCS]`: cập nhật tài liệu
- Ví dụ: `[FIX] SqlDatabase ném lại exception khi lưu DB thất bại`
- Không commit secrets, connection string, token.
- Trước khi commit: `git status`, `git diff`, `git log --oneline -5`.
- Không force-push, không amend commit đã push.

---

## 7. KIỂM THỬ (TEST)

- Chạy `dotnet build` trước khi commit. Bắt buộc 0 warning, 0 error.
- Chạy `test-api.ps1` khi backend đã khởi động và kết nối Neon PostgreSQL.
- Port backend mặc định: `3000` (theo `test-api.ps1`).
- Tài khoản demo test:
  - `customer@owniverse.com` / `Customer123`
  - `admin@owniverse.com` / `admin123`
  - `kairo@owniverse.com` / `Artist123`
- Mọi test FAIL phải được ghi lại và xử lý trước khi merge.

---

## 8. KHÔNG ĐƯỢC LÀM

1. Không swallow exception trong `SaveAsync` hay repository.
2. Không tạo dữ liệu giả hoặc gán ID ngẫu nhiên để vượt qua constraint.
3. Không đổi database engine (PostgreSQL → SQL Server).
4. Không thêm tầng kiến trúc mới (service, controller, unit of work...).
5. Không thay đổi route API, HTTP method, cấu trúc JSON response.
6. Không xóa chức năng đang hoạt động.
7. Không thay đổi dữ liệu nghiệp vụ chỉ để test pass.
8. Không call `fetch` trực tiếp bypass `apiRequest` ở frontend.
9. Không commit connection string, password, token vào repo.

---

## 9. CÁCH THÊM TÍNH NĂNG MỚI

1. Thêm model vào `Model.cs` nếu cần.
2. Thêm truy vấn DB vào repository tương ứng (`UserRepository.cs`, ...).
3. Thêm endpoint vào `Program.cs`, tuân theo pattern `app.MapPost/Put/Get/Delete`.
4. Thêm gọi API frontend qua `apiRequest` trong `js/auth/auth.js` hoặc file page tương ứng.
5. Cập nhật `STANDARDIZATION.md` nếu quy ước mới được thêm.

---

Lưu tại: `STANDARDIZATION.md` (root repo). Mọi thành viên phải đọc trước khi viết code đầu tiên.