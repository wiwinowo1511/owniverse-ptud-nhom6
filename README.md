# OWNIVERSE - Website thương mại điện tử merchandise nghệ sĩ

## 1. Giới thiệu và mục tiêu dự án

**OWNIVERSE** là dự án website thương mại điện tử dành cho merchandise gắn với nghệ sĩ, được xây dựng theo định hướng D2C (Direct-to-Consumer): một đơn vị vận hành tập trung giới thiệu sản phẩm và kết nối nghệ sĩ với người hâm mộ, thay vì hoạt động như sàn giao dịch nhiều nhà bán.

Website sử dụng dữ liệu minh họa về ba nghệ sĩ **KAIRO, MIRA và RHEA** cùng các sản phẩm như album, áo, phụ kiện và đồ lưu niệm. Dự án hướng tới trải nghiệm khám phá nghệ sĩ, tìm sản phẩm phù hợp và quản lý giỏ hàng trên một giao diện thống nhất.

**Mục tiêu triển khai:**

- Xây dựng giao diện thương mại điện tử có nhận diện thương hiệu nhất quán, hỗ trợ nhiều kích thước màn hình.
- Tổ chức thông tin về nghệ sĩ và sản phẩm theo cấu trúc rõ ràng, thuận tiện để tra cứu.
- Phát triển các tương tác phía trình duyệt: tìm kiếm, lọc, sắp xếp, xem chi tiết và quản lý giỏ hàng.
- Rèn luyện quy trình làm việc nhóm: phân tích yêu cầu, thiết kế giao diện, lập trình, tích hợp, kiểm thử và quản lý mã nguồn.

**Phạm vi hiện tại:** Website **frontend mô phỏng** được xây dựng bằng HTML, CSS và JavaScript. Dữ liệu sản phẩm đang được quản lý trong mã JavaScript; giỏ hàng lưu bằng `localStorage`. 

## 2. Thành viên và phân công công việc

| Thành viên | Phần việc được phân công trong giai đoạn hiện tại |
|---|---|
| **Ánh Hằng** | Điều phối và chuẩn bị dự án; thống nhất cấu trúc, quy ước phối hợp và quản lý mã nguồn; phụ trách tổng hợp báo cáo sử dụng AI; phối hợp tích hợp trang chi tiết sản phẩm |
| **Mỹ Dung** | Chuẩn hóa dữ liệu, xây dựng danh sách sản phẩm; phối hợp phát triển giao diện và chức năng giỏ hàng. |
| **Muội Nhiên** | Phát triển tìm kiếm, bộ lọc và sắp xếp sản phẩm; phối hợp tích hợp giỏ hàng với `localStorage`. |
| **Bảo Ngọc** | Phát triển và tích hợp trang chi tiết sản phẩm động theo ID; phối hợp xây dựng chức năng giỏ hàng. |
| **Vy Huỳnh** | Phát triển và tích hợp trang chi tiết nghệ sĩ; thực hiện chức năng lưu và khôi phục dữ liệu giỏ hàng. |
| **Quang Huy** | Tích hợp và kiểm thử website; tổng hợp test case, ghi nhận lỗi; phụ trách README, tài liệu và công việc GitHub trong giai đoạn hoàn thiện. |

## 3. Công nghệ và công cụ sử dụng

| Công nghệ / công cụ | Vai trò |
|---|---|
| **HTML5** | Cấu trúc các trang và thành phần nội dung. |
| **CSS3** | Thiết kế giao diện; sử dụng **Flexbox**, **CSS Grid** và **Media Queries** để bố trí, điều chỉnh responsive. |
| **JavaScript (Vanilla JS)** | Quản lý dữ liệu sản phẩm, thao tác DOM, tìm kiếm/lọc/sắp xếp, điều hướng chi tiết và logic giỏ hàng. |
| **Web Storage API (`localStorage`)** | Lưu trạng thái giỏ hàng trong trình duyệt với khóa `owniverse_cart`. |
| **Git và GitHub** | Lưu trữ mã nguồn, theo dõi thay đổi và phối hợp nhóm. |
| **Visual Studio Code, Live Server, Chrome DevTools** | Phát triển, chạy website và kiểm thử giao diện, JavaScript, tài nguyên mạng, dữ liệu lưu trữ. |

## 4. Cấu trúc thư mục dự án

Cấu trúc chính trong bản mã nguồn được cung cấp:

```text
owniverse-ptud-nhom6/
├── index.html                 # Trang chủ
├── about.html                 # Giới thiệu OWNIVERSE
├── products.html              # Danh sách và bộ lọc sản phẩm
├── product-detail.html        # Chi tiết sản phẩm theo ID
├── artist.html                # Danh sách nghệ sĩ
├── artist-detail.html         # Chi tiết nghệ sĩ
├── cart.html                  # Giỏ hàng
├── chuanHeader.html           # Mẫu header dùng chung
├── chuanFooter.html           # Mẫu footer dùng chung
├── css/
│   ├── style.css              # Kiểu dáng chung
│   ├── chuanHeader.css
│   ├── chuanFooter.css
│   └── pages/                 # CSS cho từng trang
├── js/
│   ├── pages/                 # Logic hiển thị, tìm kiếm, lọc, trang chi tiết
│   ├── cart/                  # Giỏ hàng và localStorage
│   ├── common/                # Tiện ích dùng chung
│   └── data/                  # Thư mục dữ liệu trong cấu trúc dự án
├── images/                    # Hình sản phẩm, nghệ sĩ, banner, logo...
├── docs/                      # Yêu cầu, kế hoạch, thiết kế và nhật ký AI
└── README.md
```

## 5. Giao diện và chức năng hiện có

| Khu vực | Nội dung và chức năng |
|---|---|
| **Trang chủ** | Giới thiệu thương hiệu, banner/carousel, nội dung và liên kết khám phá sản phẩm, nghệ sĩ. |
| **Giới thiệu** | Thông tin thương hiệu và định hướng kết nối nghệ sĩ với người hâm mộ. |
| **Danh sách sản phẩm** | Hiển thị **13 sản phẩm** từ dữ liệu JavaScript; tìm kiếm, lọc theo danh mục/nghệ sĩ/giá, sắp xếp theo giá và kết hợp nhiều điều kiện. |
| **Chi tiết sản phẩm** | Hiển thị thông tin sản phẩm theo tham số `id` trên URL, lựa chọn số lượng và thêm vào giỏ; có thông báo khi ID không tồn tại. |
| **Nghệ sĩ** | Danh sách ba nghệ sĩ KAIRO, MIRA, RHEA; tìm kiếm nghệ sĩ và xem trang chi tiết theo tham số URL. |
| **Giỏ hàng** | Thêm sản phẩm, cộng dồn sản phẩm trùng ID, tăng/giảm số lượng, xóa sản phẩm, cập nhật tổng tiền và số lượng trên header. |
| **Lưu trữ giỏ hàng** | Duy trì dữ liệu sau khi tải lại trang và đồng bộ giữa các trang thông qua `localStorage`. |
| **Responsive** | Giao diện đã được quan sát trên Desktop (1366px), Tablet (768px) và Mobile (390px); còn một số điểm cần tối ưu. |

Danh sách trên tổng hợp các phần đã có trong mã nguồn và các luồng chức năng chính được ghi nhận khi kiểm thử. Một số thao tác trên màn hình nhỏ và tình huống biên vẫn cần xác minh bổ sung. Website hiện chưa có chức năng đăng nhập, checkout/thanh toán thực tế hoặc quản trị đơn hàng.

## 6. Hướng dẫn cài đặt và chạy website

**Cách 1 - Tải repository:**

```bash
git clone https://github.com/wiwinowo1511/owniverse-ptud-nhom6.git
cd owniverse-ptud-nhom6
```

Hoặc chọn **Code → Download ZIP** trên GitHub, sau đó giải nén.

**Cách 2 - Chạy bằng Live Server:**

1. Mở thư mục dự án có chứa `index.html` bằng **Visual Studio Code**.
2. Cài tiện ích **Live Server** (nếu chưa có).
3. Nhấp phải `index.html` → **Open with Live Server**.
4. Truy cập địa chỉ localhost do Live Server cung cấp; các trang chính có thể được mở qua menu điều hướng.

Website frontend không yêu cầu cài đặt Node.js hay cơ sở dữ liệu để chạy các chức năng đã nêu. Cổng localhost có thể thay đổi tùy môi trường.

## 7. Vấn đề đã gặp và hướng khắc phục

Trong quá trình tích hợp và kiểm thử, nhóm ghi nhận các vấn đề chính:

| Vấn đề | Nguyên nhân / biểu hiện | Hướng xử lý và hiện trạng |
|---|---|---|
| **CSS không tải được (404)** | Một số trang tham chiếu `css/cart-common.css` nhưng tệp chưa có ở đường dẫn tương ứng. | Bổ sung stylesheet đúng đường dẫn; **chờ xác nhận kết quả kiểm thử lại sau khi áp dụng bản sửa**. |
| **Khai báo trùng JavaScript** | `cart.html` nạp `cart-store.js` hai lần, dẫn tới lỗi `CART_STORAGE_KEY has already been declared`. | Bỏ lần nạp trùng, giữ đúng thứ tự script; **chờ xác nhận kết quả kiểm thử lại**. |
| **Hiển thị khi lọc ít sản phẩm** | Thanh phân trang chưa phản ánh đúng số kết quả đang hiển thị. | Cần tiếp tục điều chỉnh và kiểm tra. |
| **Giao diện Mobile** | Thanh điều hướng có dấu hiệu bị cắt tại viewport 390px. | Cần kiểm tra khả năng cuộn/truy cập menu và tối ưu khi cần. |

## 8. Repository và tài liệu dự án

- **GitHub:** https://github.com/wiwinowo1511/owniverse-ptud-nhom6
- **Tài liệu yêu cầu:** [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)
- **Kế hoạch dự án:** [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md)
- **Nhật ký sử dụng AI:** [`docs/AI_USAGE_LOG.md`](docs/AI_USAGE_LOG.md)

## 9. Sử dụng AI trong quá trình thực hiện

Nhóm sử dụng AI như công cụ **hỗ trợ tham khảo, đề xuất giải pháp và rà soát sản phẩm** trong các giai đoạn:

| Giai đoạn | Nội dung hỗ trợ được ghi nhận |
|---|---|
| **Phân tích và lập kế hoạch** | Hỗ trợ xây dựng, phản biện yêu cầu; gợi ý kế hoạch và phân công công việc. |
| **Thiết kế và phát triển giao diện** | Gợi ý bố cục, HTML/CSS, responsive, kiểm tra các thành phần giao diện và xử lý carousel. |
| **Tích hợp, kiểm thử và tài liệu** | Hỗ trợ xây dựng test case, phân tích thông báo lỗi DevTools, đề xuất cách khắc phục và biên soạn tài liệu dự án. |
