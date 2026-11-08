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

## 4.1.5. Quy chuẩn mã nguồn giao diện dùng chung

Để bảo đảm tính nhất quán trong quá trình xây dựng giao diện website
**OWNIVERSE**, nhóm thống nhất sử dụng **HTML** để xây dựng cấu trúc nội
dung và **CSS** để định dạng giao diện. Các quy chuẩn về màu sắc, kiểu
chữ, khoảng cách, đường viền và hiệu ứng tương tác được khai báo tập
trung thông qua các biến CSS dùng chung.

Về kiểu chữ, website sử dụng hai font chính: **Montserrat** cho tiêu đề
và **Inter** cho nội dung. Các font được nhúng vào trang bằng Google
Fonts. Đồng thời, mỗi trang có thể liên kết đến tệp CSS riêng để định
dạng những thành phần đặc thù.

### Khai báo font chữ và tệp CSS

``` html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700;800&display=swap"
  rel="stylesheet"
>
<link rel="stylesheet" href="css/pages/artist.css">
```

### Khai báo biến CSS dùng chung

Bảng màu thương hiệu được xác định thông qua các mã HEX. Trong đó, màu
đen được sử dụng cho chữ và các thành phần chính; màu tím lavender
(`#A78BFA`) là màu nhấn thương hiệu; màu trắng là màu nền chủ đạo; các
sắc độ xám được sử dụng cho đường viền và nền phụ. Ngoài ra, nhóm thống
nhất các giá trị bo góc và hiệu ứng chuyển động để tạo sự đồng bộ giữa
các trang.

Các biến được khai báo trong bộ chọn `:root` như sau:

``` css
/* ==========================================================================
   1. BẢNG MÀU CHỦ ĐẠO & KIỂU CHỮ
   CHUẨN BRAND IDENTITY OWNIVERSE
   ========================================================================== */

:root {
  --bg-black: #0B0B0F;          /* Đen chủ đạo: nền, chữ chính */
  --brand-purple: #A78BFA;      /* Tím thương hiệu: điểm nhấn, nút bấm */
  --brand-purple-soft: #E9DBFF; /* Tím nhạt: background phụ */
  --border-gray: #E5E7EB;       /* Xám sáng: bố cục, đường viền */
  --pure-white: #FFFFFF;        /* Trắng: nền, chữ phụ */

  --font-heading: 'Montserrat', sans-serif; /* Tiêu đề, nội dung nhấn mạnh */
  --font-body: 'Inter', sans-serif;         /* Nội dung, văn bản */

  --radius-card: 20px;
  --radius-image: 14px;
  --radius-pill: 9999px;        /* Bo tròn nút chính và nút phụ */

  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==========================================================================
   2. RESET & CÀI ĐẶT CƠ BẢN
   ========================================================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  color: var(--bg-black);
  background-color: var(--pure-white);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
}

ul {
  list-style: none;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hiệu ứng focus rõ ràng bằng màu tím thương hiệu (#A78BFA) */
a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 2.5px solid var(--brand-purple);
  outline-offset: 3px;
}
```

### Quy định tổ chức tệp CSS

Các biến CSS và quy tắc định dạng nền tảng được đặt tập trung trong tệp
`css/style.css` để các thành viên có thể tái sử dụng khi phát triển năm
trang giao diện. Những thành phần có tính đặc thù của từng trang được
định nghĩa trong các tệp CSS riêng, chẳng hạn `css/pages/artist.css`.
Cách tổ chức này giúp hạn chế trùng lặp mã nguồn, giảm nguy cơ xung đột
giữa các thành phần và thuận tiện hơn cho việc bảo trì, điều chỉnh giao
diện trong quá trình phát triển website.
