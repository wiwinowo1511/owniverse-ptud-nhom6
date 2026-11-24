# Backend API: sản phẩm, giỏ hàng và đơn hàng

Backend dùng ASP.NET Minimal API và SQL Server tại `http://localhost:3000`. Trên máy phát triển, cấu hình mặc định trong `backend/OwniverseApi/appsettings.Development.json` kết nối Windows Authentication tới `.\SQLEXPRESS`, database `Owniverse`. Khởi chạy từ thư mục dự án:

```powershell
Set-Location .\backend\OwniverseApi
dotnet run
```

Database cần được tạo và nạp dữ liệu trước khi khởi chạy API: chạy `database/create-database.sql`, `database/seed-data.sql` và `database/upgrade-api-storage.sql` qua `sqlcmd -S .\SQLEXPRESS -E -C -I -f 65001 -i <file>`. Không chạy lại `create-database.sql` trên database đã tạo. Nếu dùng máy chủ khác, đặt biến môi trường `ConnectionStrings__Owniverse`; không đưa thông tin xác thực production vào file cấu hình. Mỗi request thay đổi dữ liệu được ghi xuống SQL trong transaction trước khi phản hồi thành công.

Các API giỏ hàng và đơn hàng yêu cầu tài khoản khách hàng đã đăng nhập. Gửi token nhận được từ `POST /api/auth/login` trong header:

```http
Authorization: Bearer <token>
```

## Tài khoản demo nghệ sĩ

Để đăng nhập KAIRO trong bản demo, đặt mật khẩu cục bộ bằng User Secrets từ thư mục `backend/OwniverseApi` rồi khởi động backend ở môi trường Development:

```powershell
dotnet user-secrets set "ArtistBootstrap:Password" "<mat-khau-demo-tu-chon>"
```

Backend chỉ mở tài khoản seed `kairo@owniverse.vn` khi có cấu hình này; mật khẩu được lưu dưới dạng hash. Không commit mật khẩu. Sau đó có thể đăng nhập tại `artist-login.html`.

## Sản phẩm

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/products` | Danh sách sản phẩm đang bán |
| `GET` | `/api/products/{id}` | Chi tiết sản phẩm |

`GET /api/products` hỗ trợ các query tùy chọn `q`, `artistId`, `categoryId`, `minPrice`, `maxPrice` và `sort` (`price-asc`, `price-desc`, `name-asc`). Ví dụ: `/api/products?q=hoodie&artistId=1&sort=price-asc`.

Thông tin sản phẩm gồm ID, tên, mô tả, giá VND, nghệ sĩ, danh mục, ảnh, tổng tồn kho và các biến thể (`id`, `sku`, `name`, `stock`). Sản phẩm ẩn không xuất hiện trong API công khai.

## Giỏ hàng

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/cart` | Xem giỏ hàng của tài khoản hiện tại |
| `POST` | `/api/cart/items` | Thêm sản phẩm vào giỏ |
| `PUT` | `/api/cart/items/{variantId}` | Cập nhật số lượng biến thể |
| `DELETE` | `/api/cart/items/{variantId}` | Xóa một biến thể khỏi giỏ |
| `DELETE` | `/api/cart` | Làm trống giỏ |

Thêm sản phẩm:

```json
{
  "productId": 4,
  "variantId": 4,
  "quantity": 1
}
```

`variantId` có thể bỏ qua nếu sản phẩm chỉ có một biến thể. Cập nhật số lượng nhận `{"quantity": 2}`. Số lượng phải từ 1 đến 99 và không vượt tồn kho. Phản hồi giỏ hàng gồm `items`, `totalQuantity` và `subtotal`; mỗi dòng có thông tin sản phẩm, biến thể, đơn giá, tồn kho và thành tiền.

## Đơn hàng

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/orders` | Tạo đơn từ giỏ hàng hiện tại |
| `GET` | `/api/orders` | Xem các đơn của tài khoản hiện tại |
| `GET` | `/api/orders/{id}` | Xem chi tiết đơn do tài khoản hiện tại sở hữu |

Tạo đơn:

```json
{
  "receiverName": "Nguyen Van A",
  "receiverPhone": "0901234567",
  "shippingAddress": "12 Nguyen Hue, Quan 1, TP.HCM",
  "note": "Giao giờ hành chính"
}
```

Backend kiểm tra người nhận, sản phẩm và tồn kho trong cùng một thao tác; giá, tổng tiền và mã đơn do backend xác định. Đơn mới có trạng thái `Pending` (nhãn hiển thị `Chờ xác nhận`), tạo thành công sẽ trừ tồn kho và làm trống giỏ. Đơn không chứa dữ liệu giá do trình duyệt gửi lên.

## Kiểm thử

Khi backend đang chạy, thực thi:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\test-api.ps1
```

## Giới hạn hiện tại

Ở môi trường Development, API tự tạo các tài khoản demo thiếu trong database; mật khẩu được hash. KAIRO chỉ được mở khóa khi đã đặt `ArtistBootstrap:Password` bằng User Secrets như phần tài khoản demo nghệ sĩ. Có thể đăng nhập bằng `admin@owniverse.com` / `admin123` hoặc `customer@owniverse.com` / `Customer123`. Tồn kho seed ban đầu là 0 và cần được cập nhật trước khi đặt hàng. Phí vận chuyển hiện bằng 0 và API chưa thực hiện thanh toán trực tuyến.
