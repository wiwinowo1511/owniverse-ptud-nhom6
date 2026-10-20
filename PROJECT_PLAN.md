# Project Plan

## 1. Thành viên và vai trò
Dự án gồm 7 thành viên chịu trách nhiệm các vai trò chính:
- **Ánh Hằng** – Trưởng nhóm / BA (Quản lý tiến độ, yêu cầu, GitHub Issues và điều phối nhóm).
- **Minh Nguyệt** – Thiết kế Giao diện & Trải nghiệm (UI/UX Designer).
- **Phương Vy** – Frontend Developer (FE Lead - Logic & API).
- **Mỹ Dung** – Frontend Developer (FE UI/CSS & Responsive).
- **Muội Nhiên** – Backend Developer (BE - API & Database).
- **Bảo Ngọc** – Backend Developer (BE - Auth & Order Logic).
- **Phạm Huy** – Kiểm thử & Quản lý Tài liệu (QA/Tester & Technical Writer).

## 2. Ma trận phân công trách nhiệm (RASCI)
*(R: Thực hiện, A: Chịu trách nhiệm chính, S: Hỗ trợ, C: Tham vấn, I: Nhận thông tin)*

| Đầu việc | Ánh Hằng | Minh Nguyệt | Vy Huỳnh | Mỹ Dung | Muội Nhiên | Bảo Ngọc | Phạm Huy |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1. Lên ý tưởng, quản lý tiến độ, phân công | **R/A** | C | C | C | C | C | C |
| 2. Thiết kế CSDL và API quản lý sản phẩm | C | I | I | I | **R/A** | S | I |
| 3. API Đăng ký/Đăng nhập, phân quyền, xử lý đơn | C | I | I | I | S | **R/A** | I |
| 4. Dựng khung HTML/JS, logic giỏ hàng, bộ lọc | S/C | C | **R/A** | S | I | I | I |
| 5. Code CSS giao diện, tối ưu Responsive | S/C | C | S | **R/A** | I | I | I |
| 6. Dùng Figma kiểm tra, vẽ lại giao diện, góp ý UI/UX | C | **R/A** | C | C | I | I | S |
| 7. Chạy thử nghiệm, lập test case, tổng hợp tài liệu | C | S | S | S | C | C | **R/A** |

## 3. Các giai đoạn thực hiện 
- **Giai đoạn 1 (Tuần 1-2):** Khảo sát, xác định yêu cầu, phân tích đối thủ và chạy Prompt AI.
- **Giai đoạn 2 (Tuần 3):** Xây dựng Frontend (Giao diện, giỏ hàng, bộ lọc).
- **Giai đoạn 3 (Tuần 4-5):** Thiết kế Cơ sở dữ liệu (Database) và Wireframe giao diện (UI/UX), tích hợp Google Analytics
- **Giai đoạn 4 (Tuần 6-7):** Phát triển Backend và tích hợp thanh toán.
- **Giai đoạn 5 (Tuần 8):** Kiểm thử, sửa lỗi và hoàn thiện báo cáo.

## 4. Rủi ro và phương án giảm thiểu
- **Rủi ro 1:** Logic Pre-order (đặt cọc, theo dõi trạng thái) phức tạp, dễ gây lỗi tính toán hoặc lỗi giỏ hàng. 
  -> *Giải pháp:* Bảo Ngọc (BE Auth/Order) và Muội Nhiên (BE Data) cần thống nhất kỹ CSDL trước khi code. Vy Huỳnh (FE) test kỹ luồng giỏ hàng.
- **Rủi ro 2:** Thành viên trễ deadline ảnh hưởng tiến độ chung.
  -> *Giải pháp:* Leader quản lý tiến độ qua GitHub Issues, nhắc nhở chéo trong nhóm chat.
- **Rủi ro 3:** Rủi ro pháp lý về hình ảnh nghệ sĩ và bản quyền merch.
  -> *Giải pháp:* Sử dụng hình ảnh nghệ sĩ giả định (ảnh AI tạo) trong suốt quá trình làm đồ án để tránh vi phạm bản quyền.
- **Rủi ro 4:** Lỗi bảo mật trong quá trình làm.
  -> *Giải pháp:* Tham khảo ý kiến AI, thực hiện validate dữ liệu đầu vào và phân quyền chặt chẽ.
