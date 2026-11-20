# Backend API: sản phẩm, giỏ hàng và đơn hàng

Backend dùng ASP.NET Minimal API tại `http://localhost:3000`. Khởi chạy bằng:

```powershell
dotnet run --project .\backend\OwniverseApi
```

Các API giỏ hàng và đơn hàng yêu cầu tài khoản khách hàng đã đăng nhập. Gửi token nhận được từ `POST /api/auth/login` trong header:

```http
Authorization: Bearer <token>
```

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

## Giới hạn bản demo

Dữ liệu tài khoản, sản phẩm, giỏ hàng và đơn hàng hiện lưu trong bộ nhớ; khởi động lại backend sẽ đặt lại dữ liệu. Phí vận chuyển đang bằng 0 và API chưa thực hiện thanh toán trực tuyến. Frontend hiện có vẫn dùng `localStorage` cho giỏ hàng; tài liệu này mô tả hợp đồng API để tích hợp giao diện.
