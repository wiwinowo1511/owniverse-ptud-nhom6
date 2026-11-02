# OWNIVERSE - Website thương mại điện tử merchandise nghệ sĩ

## 1. Giới thiệu dự án

**OWNIVERSE** là mô hình thương mại điện tử D2C (Direct-to-Consumer): đơn vị quản lý nghệ sĩ trực tiếp giới thiệu và kinh doanh merchandise đến người hâm mộ, không vận hành theo mô hình sàn nhiều người bán. Trong phạm vi bài tập, website giới thiệu sản phẩm của 3 nghệ sĩ giả định thuộc cùng một công ty quản lý: **KAIRO, MIRA và RHEA**.

- **Khách hàng mục tiêu:** Người hâm mộ tại Việt Nam, chủ yếu là người trẻ/Gen Z, các fan club và người mua quà tặng cho fan. Nhóm tổ chức sự kiện, câu lạc bộ là định hướng mở rộng từ kế hoạch Buổi 1, chưa phải phạm vi triển khai hiện tại.
- **Vấn đề hướng tới:** Thông tin merchandise phân tán, rủi ro hàng nhái và thiếu minh bạch trong các đợt đặt trước (pre-order). Đây là bài toán kinh doanh, không phải những vấn đề đã được giải quyết bằng hệ thống vận hành ở Buổi 2.

### Thành viên nhóm (kế thừa phân công trong README Buổi 1)

| Thành viên | Vai trò được phân công |
|---|---|
| Ánh Hằng | Trưởng nhóm / Business Analyst (BA) |
| Minh Nguyệt | Thiết kế giao diện và trải nghiệm người dùng (UI/UX) |
| Phương Vy | Frontend Developer - phụ trách logic và định hướng API |
| Mỹ Dung | Frontend Developer - UI/CSS và Responsive |
| Muội Nhiên | Backend Developer - định hướng API và cơ sở dữ liệu |
| Bảo Ngọc | Backend Developer - định hướng xác thực và xử lý đơn hàng |
| Phạm Huy | QA/Tester và Technical Writer |

## 2. Cấu trúc thư mục

Cấu trúc dưới đây ghi nhận các đường dẫn đã đối chiếu trên nhánh `main` của repository

```text
owniverse-ptud-nhom6/
├── .gitignore
├── README.md
├── index.html
├── products.html
├── product-detail.html
├── about.html
├── artist.html
├── chuanHeader.html
├── chuanFooter.html
├── css/
│   ├── style.css
│   ├── chuanHeader.css
│   ├── chuanFooter.css
│   └── pages/
│       ├── home.css
│       ├── products.css
│       ├── product-detail.css
│       ├── about.css
│       └── artist.css
├── images/
│   ├── banners/
│   ├── products/
│   ├── artists/
│   └── about/
├── js/
│   └── main.js
└── docs/
    ├── REQUIREMENTS.md
    └── PROJECT_PLAN.md
```

- **Các file HTML ở thư mục gốc:** 5 trang giao diện chính; `chuanHeader.html` và `chuanFooter.html` là các tệp tham khảo cho thành phần giao diện chung, không tính vào 5 trang chính.
- **`css/style.css`:** Biến màu, kiểu chữ, reset và một số thành phần dùng chung. **`css/chuanHeader.css`, `css/chuanFooter.css`:** Kiểu dáng header/footer. **`css/pages/`:** CSS theo từng trang.
- **`images/`:** Hình banner, sản phẩm, nghệ sĩ và phần giới thiệu. **`js/main.js`:** Mã JavaScript điều khiển banner/carousel ở trang chủ.
- **`docs/`:** Tài liệu yêu cầu và kế hoạch từ giai đoạn phân tích.

## 3. Danh sách các trang đã xây dựng

| Trang | Nội dung giao diện hiện có |
|---|---|
| [`index.html`](index.html) | Trang chủ với header, menu, khu vực giới thiệu, banner/carousel nghệ sĩ, sản phẩm nổi bật và bộ sưu tập. |
| [`products.html`](products.html) | Danh sách sản phẩm dạng lưới, bộ lọc checkbox theo nghệ sĩ/danh mục, lựa chọn sắp xếp, các thẻ sản phẩm và liên kết xem chi tiết. Biểu mẫu lọc/sắp xếp chưa được xác nhận xử lý dữ liệu thực. |
| [`product-detail.html`](product-detail.html) | Trang minh họa chi tiết album AFTERDARK Vol.01 của RHEA: thư viện ảnh, giá, mô tả, số lượng, nút mua hàng và sản phẩm liên quan. Thư viện ảnh dùng radio/label và CSS. |
| [`about.html`](about.html) | Giới thiệu OWNIVERSE, câu chuyện thương hiệu, giá trị cốt lõi và ba nghệ sĩ đồng hành. |
| [`artist.html`](artist.html) | Giới thiệu KAIRO, MIRA, RHEA bằng hình ảnh, mô tả và liên kết; có biểu mẫu tìm kiếm ở mức giao diện. |

## 4. Công nghệ sử dụng

| Công nghệ | Vai trò và bằng chứng trong mã nguồn |
|---|---|
| **HTML5** | Cấu trúc nội dung và biểu mẫu; sử dụng các phần tử ngữ nghĩa như `header`, `nav`, `main`, `section`, `article`, `form`. |
| **CSS3** | Màu sắc, font, khoảng cách, card, nút bấm, trạng thái `hover`/`focus` và cách hiển thị hình ảnh. |
| **CSS Grid** | Chia cột và bố trí lưới nghệ sĩ, danh sách sản phẩm, nội dung trang. |
| **Flexbox** | Sắp xếp menu, header, nút bấm và các nhóm thành phần theo hàng/cột. |
| **Media Queries** | Khai báo các quy tắc CSS thay đổi bố cục tại những ngưỡng màn hình khác nhau
| **JavaScript (phạm vi nhỏ)** | File `js/main.js` được `index.html` nạp để chuyển slide, xử lý các nút chỉ báo và tạm dừng carousel theo tương tác/thiết lập giảm chuyển động. |
| **Google Fonts** | Tải các font **Inter** và **Montserrat** trong các tệp giao diện. |

## 5. Hướng dẫn chạy website

**Bước 1 - Tải mã nguồn:** Truy cập [repository OWNIVERSE](https://github.com/wiwinowo1511/owniverse-ptud-nhom6), chọn Code → Download ZIP, rồi giải nén. Nếu đã cài Git, có thể dùng:

```bash
git clone https://github.com/wiwinowo1511/owniverse-ptud-nhom6.git
cd owniverse-ptud-nhom6
```

Bước 2 - Mở trong Visual Studio Code: Chọn **File → Open Folder** và mở thư mục `owniverse-ptud-nhom6` vừa tải về.

**Bước 3 - Chạy bằng Live Server:** Cài tiện ích **Live Server** trong VS Code nếu chưa có; nhấp phải `index.html` → **Open with Live Server**. Trình duyệt sẽ mở địa chỉ localhost do tiện ích cung cấp.

**Bước 4 - Điều hướng:** Bắt đầu ở `index.html`, sau đó dùng menu hoặc truy cập trực tiếp `products.html`, `product-detail.html`, `about.html`, `artist.html`. 

## 6. Hiện trạng, hạn chế và định hướng tiếp theo

### Đã thể hiện trong mã nguồn

- Có cấu trúc và nội dung giao diện cho **5 trang HTML** nêu tại mục 3.
- Có các quy tắc CSS cho Grid, Flexbox, Media Queries và hiệu ứng tương tác giao diện.
- Có JavaScript cho carousel trang chủ; có cơ chế chọn ảnh chi tiết sản phẩm bằng HTML/CSS.

**Các mục trên là kết quả đối chiếu mã nguồn, chưa phải kết luận rằng mọi giao diện đều hiển thị đúng khi chạy trên trình duyệt.**

### Hạn chế đã xác nhận qua kiểm tra tĩnh

- **Trang đích chưa có trong danh sách file ở thư mục gốc nhánh `main`:** Các liên kết tới `community.html`, `cart.html`, `account.html`, `contact.html` và các trang riêng `artist-kairo.html`, `artist-mira.html`, `artist-rhea.html` đang xuất hiện trong HTML. Vì vậy không nên coi những điều hướng này là hoàn thiện.
- **Liên kết tạm/anchor chưa khớp:** Có các liên kết `href="#"` và liên kết `#artist-search` trên những trang không có phần tử mang `id="artist-search"`.
- **Khai báo stylesheet và cấu trúc HTML cần rà soát:** `index.html` nạp lặp `css/style.css`; `products.html` lặp các khai báo CSS, đồng thời có nhiều thẻ `<head>`/`<body>`. Một số stylesheet được đặt trong phần `<body>`. Các vấn đề này **chưa có minh chứng đã sửa**.
- **Tham chiếu CSS chưa tìm thấy trên nhánh `main`:** `about.html` gọi `css/pages/base.css`, `css/pages/layout.css` và `css/pages/components.css`, nhưng chưa thấy các tệp tương ứng tại đường dẫn đó. Cần đối chiếu lại bản mới nhất trước khi nộp.

### Chức năng mới ở mức giao diện hoặc dự kiến

- **Tìm kiếm/lọc:** Có ô nhập, checkbox và form.
- **Mua hàng:** Số lượng và nút mua đã được trình bày; form ở trang chi tiết trỏ tới `cart.html`, chưa phải giỏ hàng hoặc quy trình đặt hàng hoạt động.
- **Tài khoản, thanh toán, đơn hàng, pre-order:** Chưa triển khai/kiểm chứng các luồng đăng nhập, thanh toán trực tuyến, đặt cọc hoặc tra cứu trạng thái đơn.
- **Quản trị và đối tác nghệ sĩ:** Quản lý danh mục, biến thể, tồn kho, đợt mở bán, voucher, dashboard và phân quyền

**Tài liệu tham chiếu của dự án:** [Yêu cầu dự án](docs/REQUIREMENTS.md) · [Kế hoạch dự án](docs/PROJECT_PLAN.md).
