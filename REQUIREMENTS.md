# Requirements

Dự án: OWNIVERSE - Website thương mại điện tử merchandise của nghệ sĩ và nhà sáng tạo nội dung Việt Nam  
Mô hình: Một cửa hàng do đơn vị vận hành quản lý tập trung, có cổng cộng tác viên nghệ sĩ được phân quyền; không phải sàn nhiều người bán.  

## 1. Mục tiêu dự án

### 1.1. Mục tiêu kinh doanh

- Xây dựng website tập trung giới thiệu và bán merchandise như áo thun, hoodie, mũ, túi tote, photobook và các sản phẩm sưu tầm gắn với nghệ sĩ, KOL, streamer, nhà sáng tạo nội dung tại Việt Nam.
- Hỗ trợ người hâm mộ tìm kiếm theo nghệ sĩ, bộ sưu tập và sản phẩm thay vì phải tìm thông tin qua nhiều kênh rời rạc.
- Minh bạch thông tin đơn vị phát hành, nguồn cung, hồ sơ đối chiếu và trạng thái xác thực, không gắn nhãn chính hãng nếu chưa có căn cứ phù hợp.
- Vận hành được luồng mua hàng cho sản phẩm đang mở bán/có sẵn, từ tìm kiếm đến thanh toán thử nghiệm, giao hàng và theo dõi đơn.
- Cung cấp lịch/đợt mở bán ở mức cơ bản (sắp mở, đang mở, kết thúc), đồng thời quản lý tình trạng hàng giới hạn dựa trên dữ liệu và tồn kho thực tế trong hệ thống.
- Hỗ trợ quản lý nghệ sĩ, danh mục, sản phẩm/biến thể, tồn kho, giao dịch, voucher, đơn hàng và chỉ số bán hàng.
- Triển khai cổng Đối tác nghệ sĩ trong MVP để đối tác được Admin cấp quyền theo nghệ sĩ/bộ sưu tập xem số liệu bán hàng, cập nhật tồn kho được giao và đề xuất thay đổi thông tin mở bán; Admin giữ quyền duyệt và công bố cuối cùng.
- Xây dựng cấu trúc có thể mở rộng sau này cho pre-order đầy đủ và các hoạt động dành cho người hâm mộ.

### 1.2. Giá trị mang lại

| Đối tượng | Giá trị kỳ vọng |
|---|---|
| Người hâm mộ / khách hàng | Xem thông tin nghệ sĩ và merchandise tại một nơi; dễ tìm sản phẩm, đối chiếu thông tin phát hành, giá, tình trạng bán, phí giao và theo dõi đơn của mình. |
| Người mua sản phẩm giới hạn | Biết thời điểm mở bán, tình trạng còn/hết hàng và số lượng khả dụng; tránh hiểu nhầm sản phẩm chưa mở bán là đang nhận đơn. |
| Đơn vị vận hành | Quản lý tập trung dữ liệu sản phẩm, thông tin xác minh nguồn gốc, tồn kho, đơn hàng và thống kê theo quy trình nhất quán. |
| Đơn vị đại diện nghệ sĩ / Đối tác nghệ sĩ | Đăng nhập cổng đối tác; theo dõi số đơn, số lượng bán và doanh thu thử nghiệm theo phạm vi được gán; điều chỉnh tồn kho có lưu vết; gửi đề xuất thay đổi thông tin đợt mở bán để Admin xét duyệt. |

Bài toán trọng tâm của MVP: Tập trung kênh bán merchandise theo nghệ sĩ, làm rõ thông tin/căn cứ nguồn gốc, cung cấp quy trình mua hàng có thể kiểm thử và cộng tác quản lý sản phẩm qua đối tác nghệ sĩ theo phân quyền. Pre-order có đặt cọc, trả phần còn lại và cập nhật tiến độ sản xuất là hướng mở rộng ưu tiên nhưng chưa phải cam kết MVP.

## 2. Phạm vi

### 2.1. Trong phạm vi phiên bản đầu (MVP - 8 tuần)

A. Chức năng thương mại điện tử theo yêu cầu học phần

- Cửa hàng: Trang chủ, danh sách và hồ sơ nghệ sĩ, bộ sưu tập, danh mục, trang chi tiết sản phẩm, biến thể, sản phẩm liên quan, review/rating; tìm kiếm, sắp xếp và ít nhất 05 thuộc tính lọc có ý nghĩa (F01-F04, F12).
- Khách hàng: Đăng ký/đăng nhập, quản lý thông tin, giỏ hàng, checkout, lịch sử và trạng thái đơn của chính mình (F05-F07, F11).
- Giao dịch: Tích hợp ít nhất 01 cổng/phương thức thanh toán hợp lệ ở môi trường sandbox, có kiểm tra phản hồi giao dịch, trạng thái thành công/thất bại/hủy; tính phí giao hàng, thông tin giao hàng và voucher có điều kiện (F08-F10).
- Quản trị: Quản lý nghệ sĩ, bộ sưu tập, danh mục, sản phẩm, biến thể và tồn kho; đơn hàng, khách hàng, chương trình khuyến mãi/voucher; dashboard thống kê cơ bản (F17-F18, F20-F23). Quản lý tài khoản Collaborator và phạm vi nghệ sĩ/bộ sưu tập được cấp (F21).

B. Nghiệp vụ riêng của OWNIVERSE

- Thông tin nguồn gốc: Hiển thị nghệ sĩ, đơn vị phát hành, đối tác/nguồn cung và trạng thái đối chiếu trên trang sản phẩm (F03).
- Thông tin lịch mở bán ở mức cơ bản (F19): Admin nhập thời gian mở bán; website hiển thị "Sắp mở bán / Đang mở bán / Đã kết thúc". Chỉ sản phẩm đang được phép bán và còn khả dụng mới được thêm vào giỏ/đặt hàng.
- Sản phẩm giới hạn ở mức tồn kho: Hiển thị số lượng/trạng thái còn hàng và ngăn bán vượt số lượng khả dụng ở phía server. Hạn mức theo từng tài khoản, chống bot và xử lý flash-sale lưu lượng cao chưa nằm trong MVP mặc định.
- Cổng Đối tác nghệ sĩ (F27-F29): (1) xem dashboard số đơn, số lượng bán, doanh thu thử nghiệm và sản phẩm bán chạy thuộc nghệ sĩ/bộ sưu tập được giao; (2) xem và cập nhật tồn kho theo biến thể, ghi nhận người sửa/thời điểm/số trước-sau/lý do; (3) gửi đề xuất điều chỉnh thông tin hoặc lịch mở bán để Admin duyệt trước khi công bố. Admin gán và thu hồi phạm vi quyền ở F21; quyền được kiểm tra trong backend/API, không chỉ trên giao diện.
- Giới hạn vai trò Collaborator: Không tự đăng bán hoặc xác minh sản phẩm, không tự chỉnh giá/khuyến mãi hoặc duyệt thay đổi lịch mở bán; không truy cập dữ liệu riêng của nghệ sĩ khác hay thông tin cá nhân đầy đủ của khách hàng. Dashboard chưa bao gồm chia hoa hồng hoặc thanh toán/đối soát tiền cho đối tác.

C. Những điều kiện triển khai của MVP

- Mô hình một đơn vị vận hành, Admin có quyền công bố và quản lý sản phẩm; Collaborator có tài khoản/cổng làm việc riêng và quyền giới hạn theo dữ liệu được gán, không tự mở gian hàng hoặc nhận thanh toán riêng.
- Dùng dữ liệu mẫu có quyền sử dụng hoặc dữ liệu tự tạo; sản phẩm/nghệ sĩ minh họa phải có nhãn phù hợp.
- Thanh toán được demo bằng sandbox của phương thức/cổng thanh toán được chọn.
- Phí vận chuyển có thể tính bằng bảng/quy tắc cấu hình và ghi vào đơn; không bắt buộc tích hợp API hãng vận chuyển.

### 2.2. Ngoài phạm vi MVP / cần xác minh trước khi bổ sung

| Nhóm chức năng | Trạng thái dự kiến | Lý do / điều kiện để xem xét triển khai |
|---|---|---|
| Pre-order đầy đủ (F13, F15) | Cần xác minh - không cam kết MVP | Phải thống nhất thời điểm nhận đơn, số lượng được nhận, ngày giao dự kiến, chậm/hủy đơn và phương án hoàn tiền. |
| Đặt cọc và thanh toán phần còn lại (F14) | Giai đoạn sau | Phụ thuộc pre-order và thêm nghiệp vụ nhiều lần thanh toán, đối soát/hoàn tiền. |
| Email thông báo mở bán (F16) | Giai đoạn sau | Cần dịch vụ gửi email, quyền nhận tin và xử lý gửi thất bại; MVP vẫn hiển thị lịch mở bán ngay trên website. |
| Livestream/campaign (F24) | Giai đoạn sau | Không tích hợp phát video hoặc hệ thống chiến dịch riêng; có thể dùng liên kết ngoài như nội dung tĩnh. |
| Tích điểm, hạng thành viên (F25) | Giai đoạn sau | Cần cơ chế tính, đổi và đối soát điểm. |
| Bốc thăm quà có chữ ký (F26) | Giai đoạn sau | Cần thể lệ, xác minh quà tặng và quy tắc công bằng. |
| Marketplace đa nhà bán; chia hoa hồng tự động | Ngoài phạm vi | Trái với lựa chọn một đơn vị quản lý tập trung của MVP. |
| Ứng dụng di động riêng, đấu giá, mua bán lại, cộng đồng fan, AI cá nhân hóa, chống bot nâng cao | Giai đoạn sau / ngoài phạm vi | Vượt mục tiêu quy trình TMĐT khả thi trong 8 tuần. |
| Tích hợp COD, hãng vận chuyển, hoàn tiền tự động ở môi trường thật | Cần xác minh / sau MVP | Cần hợp đồng/tài khoản tích hợp và chính sách xử lý giao dịch thật; demo sandbox không thu tiền thật. |

## 3. Người dùng

| Vai trò | Nhiệm vụ chính | Quyền hạn dự kiến | Trạng thái trong MVP |
|---|---|---|---|
| Khách chưa đăng nhập (Guest) | Xem nghệ sĩ, bộ sưu tập, sản phẩm, nguồn gốc, giá, tồn kho và lịch mở bán. | Truy cập thông tin công khai; tìm kiếm, lọc, sắp xếp; xem nội dung sản phẩm và trang nghệ sĩ; đăng ký/đăng nhập. | Bắt buộc |
| Khách hàng (Customer) | Chọn merchandise, quản lý giỏ, đặt hàng, thanh toán và theo dõi đơn. | Chỉ quản lý tài khoản, giỏ, lịch sử và đơn của mình; xem thông tin thanh toán/giao hàng; đánh giá sản phẩm đã mua khi đủ điều kiện. | Bắt buộc |
| Quản trị viên (Admin) | Quản lý danh mục, nghệ sĩ, sản phẩm, hồ sơ nguồn gốc, tồn kho, đơn hàng và kinh doanh. | Thêm/sửa/ẩn nội dung; đối chiếu và xét duyệt hồ sơ nguồn gốc; quản lý đơn, người dùng, voucher và dashboard; cập nhật lịch mở bán. | Bắt buộc |
| Đối tác nghệ sĩ (Đối tác nghệ sĩ) | Theo dõi hiệu quả bán merchandise, kiểm tra và cập nhật tồn kho, phối hợp chuẩn bị đợt mở bán cho nghệ sĩ/bộ sưu tập được gán. | Đăng nhập cổng đối tác; xem dashboard giới hạn theo quyền; cập nhật tồn kho biến thể được giao có lịch sử; gửi đề xuất sửa thông tin/lịch mở bán và xem kết quả Admin duyệt. Không xem dữ liệu nghệ sĩ khác, dữ liệu khách hàng riêng tư, không duyệt nguồn gốc hoặc thanh toán. | Bắt buộc (MVP) |
| Nhân viên xử lý đơn hàng (Staff) | Xác nhận, đóng gói và cập nhật đơn được giao. | Nếu phát triển sau: chỉ đọc/cập nhật đơn được phân công, không quản trị toàn hệ thống. | Giai đoạn sau |

## 4. Yêu cầu chức năng

Quy ước mức độ ưu tiên

- Bắt buộc (Học phần/MVP): Nghiệp vụ nền tảng hoặc mục có yêu cầu bắt buộc trong quy định đồ án; nhóm phải thực hiện/kiểm thử.
- Bắt buộc (MVP): Chức năng riêng mà nhóm đã quyết định phải triển khai và kiểm thử trong bản đầu.
- Cần xác minh (ngoài cam kết MVP): Chưa chốt điều kiện nghiệp vụ, dữ liệu, thời gian hoặc nguồn lực; chỉ đưa vào MVP sau khi nhóm phê duyệt thay đổi phạm vi.
- Giai đoạn sau: Chưa lập trình và không dùng làm tiêu chí nghiệm thu phiên bản đầu.

### 4.1. Chức năng cửa hàng và khách hàng

| Mã | Tên chức năng | Mô tả | Người sử dụng | Mức độ ưu tiên | Tiêu chí nghiệm thu |
|---|---|---|---|---|---|
| F01 | Xem trang chủ | Hiển thị nghệ sĩ, bộ sưu tập, sản phẩm nổi bật, khuyến mãi và thông tin mở bán từ dữ liệu đã công bố. | Guest, Customer | Bắt buộc | Trang hiển thị đúng dữ liệu công khai; banner/sản phẩm dẫn đến trang liên quan; sản phẩm ẩn không xuất hiện. |
| F02 | Xem danh sách sản phẩm và nghệ sĩ | Duyệt theo nghệ sĩ, danh mục, bộ sưu tập; xem hồ sơ nghệ sĩ và sản phẩm liên quan. | Guest, Customer | Bắt buộc | Truy cập được trang danh sách/nghệ sĩ; chọn bộ lọc nhóm cho kết quả đúng; xử lý danh sách rỗng. |
| F03 | Xem chi tiết sản phẩm và thông tin phát hành | Xem ảnh, mô tả, giá, biến thể, số lượng, sản phẩm liên quan, đánh giá, đơn vị phát hành và trạng thái hồ sơ xác minh. | Guest, Customer | Bắt buộc | Chọn biến thể hiện đúng giá/tồn; sản phẩm không mở bán không thể thêm vào giỏ. |
| F04 | Tìm kiếm, lọc và sắp xếp | Tìm theo từ khóa, nghệ sĩ; lọc theo nghệ sĩ, bộ sưu tập, loại sản phẩm, khoảng giá và trạng thái mở bán/còn hàng (05 thuộc tính); thêm màu/size khi phù hợp. | Guest, Customer | Bắt buộc | Có ít nhất 05 thuộc tính lọc thực sự hoạt động; kết hợp được nhiều bộ lọc, sắp xếp và xử lý kết quả rỗng. |
| F05 | Đăng ký, đăng nhập và hồ sơ | Đăng ký tài khoản, đăng nhập/đăng xuất và cập nhật thông tin cá nhân cơ bản. | Guest, Customer | Bắt buộc | Không đăng ký email trùng; đăng nhập đúng/sai được xử lý; Customer chỉ chỉnh sửa hồ sơ của mình; mật khẩu lưu dạng băm. |
| F06 | Quản lý giỏ hàng | Thêm biến thể còn khả dụng, chỉnh số lượng, xóa sản phẩm; hiển thị tiền hàng tạm tính. | Customer | Bắt buộc | Tổng tiền tính đúng; không thêm hàng chưa mở bán/hết hàng; tồn kho và giá được kiểm tra lại trước đặt đơn. |
| F07 | Checkout và tạo đơn | Nhập thông tin người nhận, chọn cách giao và thanh toán; xác nhận tổng đơn; lưu ảnh chụp giá tại thời điểm đặt. | Customer | Bắt buộc | Đơn có mã duy nhất và chi tiết đúng; từ chối dữ liệu sai/vượt tồn; hiển thị phí giao và giảm giá trước xác nhận; không thay giá đơn cũ khi giá sản phẩm đổi. |
| F08 | Tích hợp thanh toán sandbox | Tạo giao dịch qua ít nhất 01 phương thức/cổng phù hợp yêu cầu thầy; tiếp nhận, xác minh kết quả và cập nhật trạng thái. | Customer, Admin (theo dõi) | Bắt buộc | Trình diễn luồng thành công, thất bại/hủy; server xác thực phản hồi/callback; không đánh dấu thành công chỉ từ thao tác client; không thu tiền thật. |
| F09 | Tính phí vận chuyển và theo dõi giao hàng | Thu địa chỉ, tính/lưu phí giao theo quy tắc; Admin cập nhật trạng thái giao, Customer theo dõi. | Customer, Admin | Bắt buộc | Phí giao được cộng vào tổng và lưu theo đơn; địa chỉ hợp lệ; Customer thấy trạng thái giao; không phải tích hợp API vận chuyển nếu quy tắc phí đã đầy đủ. |
| F10 | Áp dụng voucher | Nhập mã giảm giá hợp lệ tại checkout để tính lại tổng thanh toán. | Customer | Bắt buộc | Kiểm tra mã, thời hạn, điều kiện đơn, mức giảm và giới hạn lượt; mã sai/hết hạn không được áp dụng; số tiền giảm không vượt giới hạn. |
| F11 | Theo dõi đơn hàng | Xem lịch sử, chi tiết, tiền hàng, phí vận chuyển, thanh toán và tiến độ giao hàng. | Customer | Bắt buộc | Customer chỉ xem được đơn của chính mình; trạng thái và số tiền khớp với backend; có thông báo khi chưa có đơn. |
| F12 | Đánh giá / xếp hạng sản phẩm | Cho phép khách đã mua và nhận hàng đánh giá sản phẩm; hiển thị điểm và nhận xét ở trang chi tiết. | Customer, Guest (xem) | Bắt buộc | Chỉ đơn hợp lệ đã hoàn tất mới được đánh giá; điểm/nội dung được kiểm tra; dữ liệu hiển thị đúng sản phẩm, không bị chèn mã độc. |

### 4.2. Lịch mở bán và nghiệp vụ đặt trước

| Mã | Tên chức năng | Mô tả | Người sử dụng | Mức độ ưu tiên | Tiêu chí nghiệm thu |
|---|---|---|---|---|---|
| F13 | Đặt hàng trước (pre-order) | Cho phép gửi đơn mua sản phẩm trước khi có hàng trong khoảng thời gian nhận đặt trước; theo dõi hạn mức riêng. | Customer | Cần xác minh (ngoài cam kết MVP) | Nếu triển khai: chỉ nhận trong khoảng thời gian đã công bố; lưu đợt pre-order, giá, thời gian giao dự kiến; có xử lý hết quota và hủy. Không nhầm với F19 chỉ hiển thị lịch mở bán. |
| F14 | Đặt cọc và thanh toán phần còn lại | Cho phép đặt cọc pre-order và trả phần còn lại qua giao dịch riêng. | Customer, Admin | Giai đoạn sau | Nếu triển khai: lưu mỗi lần thanh toán; số còn lại = tổng hợp lệ trừ khoản đã xác nhận; xử lý thất bại, hủy và hoàn tiền theo quy tắc đã duyệt. |
| F15 | Theo dõi tiến độ pre-order | Cập nhật và hiển thị trạng thái xử lý trước khi giao (nhận đơn, sản xuất, chuẩn bị giao...). | Customer, Admin (cập nhật) | Cần xác minh (ngoài cam kết MVP) | Nếu triển khai: khách chỉ xem đơn của mình; thay đổi do người có quyền; lưu thời điểm cập nhật và ngày giao dự kiến khi thay đổi. |
| F16 | Đăng ký email thông báo mở bán | Đăng ký/hủy nhận tin về bộ sưu tập, lịch mở bán và tiến độ quan trọng. | Customer, Admin | Giai đoạn sau | Nếu triển khai: quản lý đồng ý nhận tin; gửi đúng người đăng ký; ghi nhận trạng thái lỗi/thành công; không hứa gửi email khi chưa tích hợp dịch vụ. |

### 4.3. Chức năng quản trị

| Mã | Tên chức năng | Mô tả | Người sử dụng | Mức độ ưu tiên | Tiêu chí nghiệm thu |
|---|---|---|---|---|---|
| F17 | Quản lý nghệ sĩ, bộ sưu tập, danh mục và sản phẩm | Thêm, sửa, ẩn sản phẩm; gắn nghệ sĩ/bộ sưu tập; quản lý hình ảnh, mô tả, giá, biến thể và trạng thái hiển thị; xét duyệt đề xuất thay đổi thuộc F29. | Admin | Bắt buộc | CRUD/ẩn hoạt động; dữ liệu nghệ sĩ-bộ sưu tập-sản phẩm đúng quan hệ; sản phẩm ẩn không xuất hiện công khai; thay đổi F29 chỉ công bố sau khi Admin duyệt. |
| F18 | Quản lý tồn kho toàn cục theo biến thể | Admin theo dõi số lượng của từng màu/size hoặc phiên bản; cập nhật khi có đơn hợp lệ/hủy. Collaborator chỉnh tồn trong phạm vi được gán thông qua F28. | Admin | Bắt buộc | Tồn kho không âm; ngăn bán vượt khả dụng ở server khi có đặt đồng thời; thống nhất dữ liệu tồn kho giữa Admin và F28; có lịch sử điều chỉnh. |
| F19 | Quản lý lịch mở bán cơ bản | Admin thiết lập ngày/giờ và trạng thái sắp mở/đang mở/đã kết thúc; Collaborator có thể đề xuất thay đổi qua F29, không tự công bố. | Admin; Guest, Customer (xem) | Bắt buộc - MVP đặc thù OWNIVERSE | Trạng thái đúng mốc thời gian; khách xem được lịch; đề xuất từ F29 chỉ cập nhật lịch công khai sau khi Admin duyệt; không checkout sản phẩm chưa mở bán/đã đóng hoặc hết tồn. Chưa bao gồm đặt cọc, bán trước ngày mở, hạn mức theo tài khoản/chống bot. |
| F20 | Quản lý đơn hàng và thanh toán | Admin tra cứu đơn, kiểm tra trạng thái thanh toán và cập nhật các bước xử lý/giao hàng. | Admin | Bắt buộc | Xem/lọc đơn được; chuyển trạng thái theo quy tắc; không tự đổi giao dịch thất bại thành đã thanh toán; lịch sử trạng thái được ghi nhận ở mức cơ bản. |
| F21 | Quản lý tài khoản và phân quyền | Quản lý Guest/Customer/Admin/Đối tác nghệ sĩ; Admin tạo/kích hoạt/khóa tài khoản đối tác, gán/thu hồi phạm vi theo nghệ sĩ/bộ sưu tập. | Admin | Bắt buộc | Tài khoản Collaborator đăng nhập được đúng cổng; chỉ Admin gán/thu hồi quyền; đổi quyền có hiệu lực ở backend/API; Collaborator không xem/sửa nghệ sĩ khác hoặc truy cập chức năng Admin; Customer không đọc/sửa đơn người khác; chỉ Admin phê duyệt xác minh nguồn gốc. |
| F22 | Quản lý voucher/khuyến mãi | Tạo, sửa, vô hiệu voucher với thời gian, mức giảm, số lượt và điều kiện đơn hàng. | Admin | Bắt buộc | Cấu hình được lưu đúng; mã hết hạn/vượt lượt/không đủ điều kiện bị từ chối tại checkout; tránh áp dụng trùng ngoài chính sách. |
| F23 | Dashboard quản trị cơ bản | Thống kê doanh thu từ giao dịch hợp lệ, số đơn, sản phẩm bán chạy, đơn chờ giao và lượng khách trên toàn website; có thể đối chiếu theo nghệ sĩ với F27. | Admin | Bắt buộc | Chỉ số đối chiếu được với bộ đơn thử nghiệm; đơn hủy không được tính vào đơn hoàn tất; tiền sandbox được mô tả là dữ liệu demo, không phải doanh thu thật; số liệu F27 chỉ là phần dữ liệu được phân quyền của toàn hệ thống. |

### 4.4. Cổng Đối tác nghệ sĩ

| Mã | Tên chức năng | Mô tả | Người sử dụng | Mức độ ưu tiên | Tiêu chí nghiệm thu |
|---|---|---|---|---|---|
| F27 | Dashboard Đối tác nghệ sĩ theo phân quyền | Đối tác xem số đơn, số lượng bán, doanh thu thử nghiệm và sản phẩm bán chạy theo nghệ sĩ/bộ sưu tập được Admin gán; có lọc khoảng thời gian và so sánh theo ngày/tuần ở mức cơ bản. Dữ liệu tổng hợp theo dòng sản phẩm được gán, không cộng toàn bộ giá trị đơn chứa hàng của nghệ sĩ khác. | Đối tác nghệ sĩ | Bắt buộc - MVP | Đăng nhập tài khoản A chỉ xem số liệu nghệ sĩ A; không xem qua giao diện/API khi đổi ID sang nghệ sĩ B. Có bộ dữ liệu demo gồm đơn mua sản phẩm của hai nghệ sĩ để đối chiếu số liệu; bộ lọc thời gian cho kết quả đúng. Chỉ tính giá trị hàng của các dòng có thanh toán sandbox thành công và đơn chưa hủy; không gộp phí giao, không tự coi là doanh thu thực nhận/hoa hồng, hiển thị cách tính và phân biệt giá trị đã đặt với đã thanh toán. |
| F28 | Theo dõi, cập nhật tồn kho của Collaborator | Xem và chỉnh số lượng tồn khả dụng theo từng biến thể được giao; hệ thống lưu người sửa, thời điểm, lý do và tồn trước/sau để Admin đối soát. | Đối tác nghệ sĩ; Admin (giám sát) | Bắt buộc - MVP | Đối tác chỉ sửa biến thể thuộc nghệ sĩ/bộ sưu tập đã gán; từ chối số âm, ngoài phạm vi và thay đổi xung đột; Admin xem được nhật ký trước/sau/lý do; tồn kho được cập nhật đồng bộ với F18 và kiểm tra lại khi checkout. |
| F29 | Đề xuất thay đổi thông tin/lịch mở bán | Collaborator gửi đề xuất cập nhật thông tin đợt phát hành, ngày mở/đóng bán hoặc thông báo tiến độ mở bán của nghệ sĩ được gán; Admin duyệt hoặc từ chối trước khi công bố (không bao gồm tiến độ sản xuất pre-order). | Đối tác nghệ sĩ, Admin | Bắt buộc - MVP | Tạo đề xuất cho đúng nghệ sĩ/bộ sưu tập; có trạng thái chờ duyệt/đã duyệt/từ chối, nội dung cũ/mới, người và thời gian xử lý; đề xuất chưa duyệt không làm thay đổi trang công khai; thử truy cập chéo nghệ sĩ bị từ chối. |

### 4.5. Các chức năng phát triển sau

| Mã | Tên chức năng | Mô tả | Người sử dụng | Mức độ ưu tiên | Tiêu chí nghiệm thu khi triển khai |
|---|---|---|---|---|---|
| F24 | Liên kết chiến dịch livestream | Tổ chức trang chiến dịch, gắn nội dung livestream bên ngoài và liên kết mua hàng. | Admin, Guest, Customer | Giai đoạn sau | Trang chiến dịch chuyển đến đúng đợt/sản phẩm; không bắt buộc phát video trực tiếp. |
| F25 | Tích điểm cho người hâm mộ | Tích lũy/đổi điểm theo đơn hợp lệ và quy tắc thành viên. | Customer, Admin | Giai đoạn sau | Không cộng hai lần cho một giao dịch; không đổi vượt số dư hoặc ngoài điều kiện. |
| F26 | Bốc thăm quà có chữ ký | Đăng ký dự thưởng, kiểm tra điều kiện và lưu kết quả theo thể lệ. | Customer, Admin | Giai đoạn sau | Có thể kiểm tra danh sách, điều kiện và kết quả theo quy tắc đã duyệt. |

### 4.6. Quy tắc nghiệp vụ chung và cách kiểm thử trọng tâm

1. Mua hàng: Xem sản phẩm → chọn biến thể → kiểm tra tồn/trạng thái mở bán → giỏ hàng → checkout (voucher + phí giao) → thanh toán sandbox → tạo/cập nhật trạng thái đơn → Admin xử lý → Customer tra cứu.
2. Nguồn gốc: Admin tạo hồ sơ sản phẩm và nguồn phát hành → nhập căn cứ → xét duyệt/từ chối → công bố đúng trạng thái trên website. Hồ sơ dữ liệu mẫu không trở thành bằng chứng cấp quyền thật.
3. Tồn kho: Không bán vượt tồn khả dụng; dữ liệu số lượng do backend kiểm tra/cập nhật nhất quán, không dựa chỉ trên giá trị hiện ở trình duyệt.
4. Đơn hàng: Mỗi đơn có mã duy nhất; lưu đơn giá, số lượng, voucher và phí giao tại thời điểm xác nhận. Giá sản phẩm thay đổi sau đó không sửa đơn đã tạo.
5. Thanh toán: Chỉ ghi nhận thành công khi kết quả hợp lệ được xác thực từ phương thức/cổng thanh toán; kết quả lỗi/hủy không bị tính là đã thu tiền. Giữ tách biệt trạng thái đơn, giao hàng và thanh toán.
6. Mở bán: Mốc thời gian dùng một múi giờ thống nhất; hàng "Sắp mở bán" chỉ được xem, chưa được mua trong MVP; hàng "Đang mở bán" phải còn khả dụng mới checkout được.
7. Quyền truy cập: Guest/Customer/Admin/Đối tác nghệ sĩ dùng quyền đúng phạm vi; mọi truy cập API không hợp lệ bị từ chối, kể cả khi người dùng tự sửa URL/ID. Admin gán và thu hồi quyền nghệ sĩ/bộ sưu tập; Collaborator không được vượt phạm vi hoặc đọc thông tin cá nhân người mua.
8. Voucher: Điều kiện sử dụng (thời gian, số lần, giá trị đơn...) được kiểm tra lại khi checkout, không chỉ khi người dùng nhập mã.
9. Cộng tác theo nghệ sĩ: Dashboard Collaborator tổng hợp theo các dòng sản phẩm thuộc phạm vi được gán, không cộng cả đơn có sản phẩm của nghệ sĩ khác. Cập nhật tồn kho của đối tác và đơn hàng dùng chung dữ liệu F18; mọi điều chỉnh thủ công có lịch sử.
10. Đề xuất nội dung mở bán: Chỉ Admin mới được duyệt/từ chối đề xuất F29; F19 cập nhật ngày mở bán công khai sau khi đề xuất được duyệt. Không mở rộng F29 thành quản lý sản xuất pre-order khi F13-F15 chưa nằm trong MVP.

## 5. Yêu cầu phi chức năng

Các chỉ tiêu sau là mục tiêu thiết kế/kiểm thử, không phải kết quả mà nhóm đã đo được.

| Mã | Nhóm yêu cầu | Yêu cầu / tiêu chí đánh giá dự kiến |
|---|---|---|
| NFR01 | Dễ sử dụng | Khách mới có thể tìm merchandise và đi hết quy trình mua/đặt hàng thử nghiệm; có thông báo phù hợp khi rỗng, lỗi hoặc không hợp lệ. |
| NFR02 | Responsive | Các màn hình chính (home, danh mục, chi tiết, giỏ, checkout, tài khoản, Admin và cổng Collaborator) được kiểm tra trên ít nhất 02 kích thước desktop và mobile, không che các thao tác chính. |
| NFR03 | Hiệu năng | Mục tiêu phản hồi thông thường dưới 3 giây trong môi trường kiểm thử được mô tả; ghi nhận kết quả đo thay vì tự khẳng định đã đạt. |
| NFR04 | Bảo mật tài khoản | Mật khẩu được băm an toàn; phiên đăng nhập có thời hạn; chức năng Admin/Collaborator phải xác thực và phân quyền tại server. |
| NFR05 | An toàn ứng dụng | Kiểm tra đầu vào và giảm rủi ro XSS, SQL Injection, CSRF, IDOR; không lộ secret/API key; có tình huống kiểm thử từ chối truy cập trái quyền và thử truy cập chéo nghệ sĩ/đối tác. |
| NFR06 | Dữ liệu cá nhân | Chỉ thu thập tên, liên hệ, địa chỉ và thông tin cần cho giao dịch; không dùng dữ liệu thật khi chưa được phép; không đưa dữ liệu khách lên repository công khai. |
| NFR07 | Nhất quán giao dịch | Giá tại lúc đặt, tổng tiền, voucher, phí giao và số lượng tồn nhất quán; kiểm tra lỗi cập nhật đồng thời, gồm cập nhật tồn từ Collaborator (F28), và phản hồi thanh toán trùng. |
| NFR08 | Tính ổn định / kiểm thử | Có test case thành công, thất bại và dữ liệu biên cho product, cart, checkout, payment, shipping, voucher, quyền Admin/Customer/Collaborator, F27-F29 và hồ sơ xác thực. |
| NFR09 | Dễ bảo trì / Git | Frontend, backend, CSDL/API được tổ chức rõ; có quy ước code, hướng dẫn chạy, lịch sử commit và đóng góp của từng thành viên. |
| NFR10 | Sao lưu / phục hồi | Có cách sao lưu bộ dữ liệu thử nghiệm và hướng dẫn khôi phục ở môi trường demo; có seed data/tài khoản thử nghiệm phù hợp. |
| NFR11 | Khả năng mở rộng và truy cập | Có thể thêm nghệ sĩ/bộ sưu tập/sản phẩm không phải thiết kế lại toàn bộ CSDL; biểu mẫu có nhãn, dùng được bằng bàn phím ở mức cơ bản. |
| NFR12 | UX và tương tác | Giao diện thống nhất; triển khai tối thiểu 03 hiệu ứng tương tác có mục đích UX, ví dụ phản hồi thêm giỏ, trạng thái bộ lọc, xác nhận thao tác. |
| NFR13 | Tích hợp bên ngoài | Nêu cổng thanh toán sandbox, request/response/callback và xử lý lỗi; phương pháp tính phí giao được cấu hình và giải thích rõ. |
| NFR14 | Nguồn gốc và quyền sử dụng | Hồ sơ xác minh có trạng thái và người phê duyệt; Collaborator không tự đánh dấu hàng là chính hãng; chỉ dùng tài sản sáng tạo có quyền phù hợp hoặc dữ liệu demo được đánh dấu rõ. |
| NFR15 | Phân quyền và kiểm toán hoạt động đối tác | Cấp quyền theo nghệ sĩ/bộ sưu tập; bảo vệ quyền ở backend/API; thử nghiệm tối thiểu 02 tài khoản đối tác khác phạm vi; lưu lịch sử cập nhật tồn kho và duyệt đề xuất, không lộ dữ liệu cá nhân của khách. |

## 6. Giới hạn và giả định

### 6.1. Giới hạn nguồn lực

- Thời gian: Dự kiến 8 tuần
- Nhân sự: Dự kiến 7 sinh viên; phân công theo BA/điều phối, UI/UX-Frontend, Backend-Database, QA/tích hợp/triển khai.
- Công nghệ: Chưa chốt stack. Nhóm sẽ lựa chọn frontend, backend, CSDL và dịch vụ theo năng lực, baseline (nếu sử dụng) và quy định môn học; phải giải thích được kiến trúc, luồng dữ liệu, bảo mật và code đã sửa.
- Nguồn lực dịch vụ: Ưu tiên 01 cổng thanh toán sandbox và bảng phí vận chuyển cấu hình; không tự cam kết tích hợp đầy đủ nhiều cổng, đồng bộ vận chuyển hay dịch vụ email.

### 6.2. Giả định nghiệp vụ đã lựa chọn để thiết kế MVP

- Website do một đơn vị vận hành tập trung; nghệ sĩ/đơn vị đại diện là đối tượng gắn với sản phẩm, không tự mở gian hàng trong MVP.
- Guest, Customer, Admin và Đối tác nghệ sĩ đều là vai trò phải triển khai ngay trong MVP. Admin gán quyền Collaborator theo nghệ sĩ/bộ sưu tập; không tự mở gian hàng, không truy cập danh sách khách hàng đầy đủ, không duyệt hồ sơ xác minh. Khi chưa có đối tác thật, dùng ít nhất hai tài khoản demo thuộc hai nghệ sĩ để kiểm thử phân quyền.
- Sản phẩm có thể chứa nhiều biến thể; biến thể và số lượng khả dụng được lưu tách bạch. "Sắp mở bán" khác "đặt trước"; không có checkout trước giờ mở trong MVP mặc định.
- Trong MVP, sản phẩm được bán theo quy trình có hàng/tồn kho; nếu muốn nhận pre-order thực sự, phải cập nhật trạng thái đơn, chính sách thanh toán, hủy/hoàn và `REQUIREMENTS.md` trước khi lập trình.
- Phí giao theo quy tắc cấu hình phải được hiển thị trước khi khách xác nhận; kết quả thanh toán sandbox là giao dịch thử nghiệm.
- Doanh thu ở dashboard Admin/Collaborator là chỉ số từ giao dịch/đơn hàng mẫu theo quy tắc công bố, không phải doanh thu kinh doanh thật. Với F27, doanh thu sản phẩm thử nghiệm cộng các dòng hàng thuộc nghệ sĩ/bộ sưu tập được gán đã thanh toán sandbox thành công, chưa hủy, không cộng phí giao và không dùng để đối soát hoa hồng; trường hợp voucher áp dụng toàn đơn cần được ghi rõ là chưa phân bổ vào số liệu F27 trong MVP.
- Thông tin xác thực phải gắn với hồ sơ và người kiểm tra. Với hồ sơ demo, giao diện phải giải thích đó là quy trình mô phỏng, không khẳng định có giấy phép/thỏa thuận thật.
- Chính sách hoàn tiền/hủy đơn và đổi trả ở môi trường kinh doanh thật chưa được xác định; demo phải ghi rõ quy tắc xử lý các trạng thái lỗi/hủy của thanh toán thử nghiệm và tác động đến đơn/tồn kho.

### 6.3. Kế hoạch 8 tuần tham khảo

| Giai đoạn | Công việc trọng tâm | Kết quả cần đạt |
|---|---|---|
| Tuần 1 | Khảo sát và thống nhất scope, chức năng, đối tượng người dùng | `REQUIREMENTS.md` được rà soát; backlog và GitHub Issues ban đầu. |
| Tuần 2 | Thiết kế giao diện, cấu trúc dữ liệu, luồng nghiệp vụ và kiến trúc | Wireframe, sơ đồ dữ liệu có gán nghệ sĩ/bộ sưu tập-Collaborator, phân quyền/API, nguyên tắc tính doanh thu, phân công module. |
| Tuần 3-4 | Phát triển chức năng công khai, đăng nhập và quản trị nội dung | Danh mục nghệ sĩ/sản phẩm, tìm kiếm/lọc, CRUD và đăng nhập/gán phạm vi quyền Collaborator (F21) chạy được. |
| Tuần 5-6 | Giỏ hàng, đặt hàng, tồn kho, Payment sandbox, Shipping, Voucher, xác minh nguồn gốc và cổng F27-F29 | Demo luồng mua và cập nhật đơn; dashboard theo nghệ sĩ, tồn kho có lịch sử, đề xuất lịch mở bán được Admin duyệt/từ chối. |
| Tuần 7 | Tích hợp, kiểm thử nghiệp vụ/bảo mật, responsive, sửa lỗi | Bộ test case gồm truy cập chéo Collaborator, cập nhật tồn/đặt hàng đồng thời và duyệt F29, nhật ký lỗi và bản tích hợp ổn định. |
| Tuần 8 | Hoàn thiện dữ liệu demo, triển khai, báo cáo và diễn tập bảo vệ | Website truy cập được, hướng dẫn chạy, 02 tài khoản Collaborator demo khác nghệ sĩ, minh chứng phân quyền, Git và tài liệu. |
