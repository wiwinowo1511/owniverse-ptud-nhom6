# 4.1. Quy chuẩn giao diện chung

## 4.1.1. Thành phần dùng chung

**Bảng: Các thành phần dùng chung giữa các trang**

| Thành phần | Mô tả | Xuất hiện ở |
|---|---|---|
| **Header** | Logo OWNIVERSE ở bên trái; menu ở giữa gồm: Trang chủ, Về chúng tôi, Sản phẩm, Nghệ sĩ, Cộng đồng; bên phải gồm: Tìm kiếm, Giỏ hàng và nút tròn Tài khoản. Header dính trên đầu khi cuộn. Mục đang xem được in đậm và có gạch chân. | 5 trang |
| **Footer** | Nền tối hoặc xám đậm. Gồm: logo và câu giới thiệu ngắn; cột “Khám phá” (5 trang); cột “Nghệ sĩ” (A, B, C); cột “Hỗ trợ” (chỉ hiển thị thông tin đổi trả, liên hệ); dòng bản quyền. | 5 trang |
| **Nút chính** | Nền đen/đậm, chữ trắng, in hoa, bo góc nhẹ. | Hero, CTA, Áp dụng, Mua hàng |
| **Nút phụ** | Nền trắng, viền đen, chữ đen. | Xem chi tiết, Tìm nghệ sĩ |
| **Card sản phẩm** | Ảnh (tỉ lệ cố định) → tên → nghệ sĩ → giá → nút “Xem chi tiết”. | Trang chủ, Danh sách, Chi tiết, Nghệ sĩ |
| **Card nghệ sĩ** | Ảnh → tên → thể loại → “Xem trang nghệ sĩ →”. | Trang chủ, Giới thiệu |
| **Tiêu đề mục** | Chữ in hoa, đậm, có thể kèm câu dẫn nhỏ bên dưới. | 5 trang |
| **Khối CTA bộ sưu tập** | Khối ngang gồm 2 cột: chữ và ảnh. | Trang chủ, Danh sách, Nghệ sĩ |

*Nguồn: Nhóm tác giả tổng hợp từ Claude.*

## 4.1.2. Bảng màu và kiểu chữ thống nhất

**Bảng: Bảng màu cốt lõi**

| Vai trò | Màu gợi ý | Mã HEX | Dùng cho |
|---|---|---|---|
| Nền chính | Trắng | `#FFFFFF` | Nền trang |
| Nền phụ | Xám rất nhạt | `#F3F4F6` | Header, hero, khối CTA, thẻ |
| Khung ảnh | Xám nhạt | `#E5E7EB` | Placeholder hình |
| Viền | Xám | `#D1D5DB` | Viền card, đường kẻ |
| Chữ chính | Đen than | `#0B0B0F` | Tiêu đề, nội dung |
| Chữ phụ | Xám đậm | `#626273` | Mô tả, nghệ sĩ |
| Nút chính/Footer | Đen xanh | `#252A33` | Nút, footer |
| Màu nhấn thương hiệu | Tím | `#A78BFA` | Một số điểm nhấn nhỏ như số thứ tự hoặc chi tiết nhận diện |
| Màu nhấn phụ | Tím nhạt | `#E9DBFF` | Nền phụ, vùng cần nhấn nhẹ |

*Nguồn: Nhóm tác giả tổng hợp từ Claude.*

**Bảng: Kiểu chữ thống nhất**

| Cấp | Font gợi ý | Cỡ (desktop) |
|---|---|---:|
| H1 (tiêu đề trang) | Montserrat | 36–44px |
| H2 (tiêu đề mục) | Montserrat | 24–28px |
| H3 (tên card, tiêu đề phụ) | Montserrat | 16–18px |
| Nội dung | Inter | 15–16px |
| Chữ phụ | Inter | 13–14px |
| Nút | Inter | 13–14px |
| Giá | Inter | 16–20px |

*Nguồn: Nhóm tác giả tổng hợp từ Claude.*

**Quy tắc khoảng cách và hình khối**

- Hệ khoảng cách sử dụng bội số của 8px.
- Khoảng cách giữa các mục lớn: 48–64px.
- Bo góc: nút 4–6px, card 0–4px.
- Viền mảnh 1px; không dùng đổ bóng nặng.

## 4.1.3. Cách bố trí nội dung và hình ảnh

**Bảng: Tỉ lệ hình ảnh đề xuất**

| Loại hình | Tỉ lệ đề xuất |
|---|---|
| Ảnh sản phẩm trong card | 1:1 hoặc 4:5 |
| Ảnh chính trang chi tiết | 1:1 |
| Ảnh nghệ sĩ trên card | 4:3 hoặc 3:2 |
| Banner hero | 16:9 hoặc 3:2 |
| Ảnh bìa nghệ sĩ | 3:1 |
| Ảnh đại diện nghệ sĩ | 1:1 |
| Ảnh phát hành (album) | 1:1 |

*Nguồn: Nhóm tác giả tổng hợp từ Claude.*

**Nguyên tắc sắp xếp**

- **Hình trước, chữ sau:** Trong mọi card, ảnh nằm trên cùng; thứ tự thông tin cố định: tên → nghệ sĩ → giá → nút.
- **Ảnh sản phẩm là điểm nhấn:** Sử dụng nền ảnh sạch (nền trơn hoặc xám nhạt); sản phẩm chiếm ít nhất 70% khung.
- **Một điểm nhấn thị giác mỗi vùng nhìn:** Mỗi màn hình chỉ có một nút chính nổi bật.
- **Lưới:** Desktop sử dụng lưới 12 cột; sản phẩm 4 cột, nghệ sĩ 3 cột, release 4 cột, sản phẩm nghệ sĩ 5 cột (theo wireframe, có thể giảm còn 4 cột nếu thẻ quá chật).
- **Căn lề:** Căn trái chữ nội dung; căn giữa chỉ dùng cho tiêu đề mục ở Trang chủ (theo wireframe). Đề xuất thống nhất căn trái toàn site để dễ đọc và phù hợp phong cách tối giản.
- **Văn bản ngắn:** Mô tả card tối đa 2 dòng; giá luôn nằm ở cùng một vị trí.

## 4.1.4. Cách điều hướng giữa 5 trang

**Bảng: Bảng liên kết chi tiết giữa các trang**

| Từ trang | Thành phần | Đến trang |
|---|---|---|
| Mọi trang | Logo OWNIVERSE | Trang chủ |
| Mọi trang | Menu: Trang chủ / Về chúng tôi / Sản phẩm / Nghệ sĩ | Trang chủ / Giới thiệu / Danh sách / Trang nghệ sĩ |
| Mọi trang | Menu “Nghệ sĩ” | Trang nghệ sĩ |
| Trang chủ | Nút “Khám phá sản phẩm” | Danh sách sản phẩm |
| Trang chủ | Nút “Tìm nghệ sĩ” | Trang nghệ sĩ |
| Trang chủ | “Xem trang nghệ sĩ →” ở 3 card | Trang nghệ sĩ tương ứng |
| Trang chủ | Nút “Xem chi tiết” ở 4 sản phẩm | Chi tiết sản phẩm |
| Trang chủ | “Khám phá bộ sưu tập” | Danh sách sản phẩm |
| Danh sách | Nút “Xem chi tiết” ở 8 sản phẩm | Chi tiết sản phẩm |
| Danh sách | Nút “Xem ngay” ở khối bộ sưu tập | Danh sách (cuộn lên đầu) hoặc Trang nghệ sĩ |
| Chi tiết | Thanh điều hướng “Sản phẩm” | Danh sách |
| Chi tiết | “Xem chi tiết” ở sản phẩm liên quan | Chi tiết sản phẩm |
| Chi tiết | Chữ “Nghệ sĩ A” | Trang nghệ sĩ A |
| Giới thiệu | Nút “Khám phá cửa hàng” | Danh sách |
| Giới thiệu | “Xem hồ sơ →” | Trang nghệ sĩ |
| Giới thiệu | “Liên hệ chúng tôi” | Thông tin liên hệ |
| Giới thiệu | “Xem chi tiết” ở release và sản phẩm | Chi tiết sản phẩm |
| Nghệ sĩ | “Xem ngay” ở khối CTA | Danh sách |
| Nghệ sĩ | Thanh điều hướng “Nghệ sĩ”, “Trang chủ” | Trang nghệ sĩ, Trang chủ |
