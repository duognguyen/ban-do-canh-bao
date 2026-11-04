# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Hệ thống Bản đồ Cảnh báo Điểm ngập & Kẹt xe Công cộng (UrbanGuard Nha Trang)

| Thông tin | Nội dung |
|---|---|
| **Mã tài liệu** | **UG-SRS-001** |
| **Dự án** | UrbanGuard – Bản đồ cảnh báo ngập lụt & ùn tắc giao thông đô thị thời gian thực |
| **Phiên bản** | **1.0** (Baseline 1.0) |
| **Trạng thái** | Tài liệu chính thức phục vụ lập trình & nghiệm thu kiểm thử |
| **Người soạn** | Nhóm Phân tích Nghiệp vụ (BA) & Phát triển Dự án |
| **Ngày ban hành** | 04/11/2026 |
| **Tài liệu liên quan**| Kiến trúc hệ thống (`DOCS_KIEN_TRUC_DU_AN.md`), Hướng dẫn (`README.md`), CSDL (`schema.sql`) |

---

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu này mô tả chi tiết các yêu cầu chức năng, yêu cầu phi chức năng, các quy tắc nghiệp vụ, mô hình hành vi và giao diện cho **Hệ thống Bản đồ Cảnh báo Điểm ngập & Kẹt xe Công cộng (UrbanGuard Nha Trang)**. Tài liệu là căn cứ kỹ thuật chính (*Test Basis*) để đội ngũ lập trình viên cài đặt chức năng và đội ngũ kiểm thử (QC/Tester) thiết kế kịch bản kiểm thử, ma trận truy vết (RTM) và đánh giá nghiệm thu sản phẩm.

### 1.2. Phạm vi hệ thống (Scope)
- **Trong phạm vi (In-scope - Phiên bản 1.0):**
  - Bản đồ số trực quan thời gian thực (Leaflet / OpenStreetMap), định vị GPS người dùng.
  - Hiển thị, phân loại mức độ và lọc các điểm sự cố: Ngập nước và Kẹt xe.
  - Thuật toán gom cụm vùng cảnh báo nguy hiểm bán kính cố định 150m khi tập trung đông điểm sự cố.
  - Tự động kích hoạt Vùng Rốn Ngập Lịch Sử (30 ngày) khi trời mưa (Open-Meteo API / Radar RainViewer).
  - Tự động kích hoạt Vùng Điểm Đen Ùn Tắc (90 ngày) trong các khung Giờ Cao Điểm.
  - Đóng góp thông tin từ cộng đồng: Form báo cáo sự cố 3 chạm kèm ảnh hiện trường.
  - Cơ chế bình chọn cộng đồng (Vote Đúng / Đã hết) và thuật toán tự động ẩn tin giả, trừ điểm uy tín.
  - Xác thực tài khoản: Đăng ký kèm mã xác thực OTP qua Email (15 phút), Đăng nhập hỗ trợ ghi nhớ phiên 30 ngày (Remember Me), Đăng nhập Google một chạm (GIS / Firebase Auth), Quên & Đặt lại mật khẩu qua Token/OTP.
  - Radar quét sự cố bán kính an toàn 500m quanh vị trí GPS và thông báo đẩy trình duyệt (Web Push Notification).
  - Quản trị viên (Admin): Bảng điều khiển quản lý thành viên (khóa/mở khóa/phục hồi điểm uy tín), duyệt và xử lý trạng thái sự cố, xuất báo cáo danh sách sự cố ra file Excel/CSV tiếng Việt có dấu.
- **Ngoài phạm vi (Out-of-scope - Dự kiến phiên bản 2.0):**
  - Ứng dụng di động Native (iOS/Android).
  - Thanh toán phí dịch vụ cứu hộ trực tuyến qua ngân hàng thương mại.
  - Tính năng điều phối lộ trình chi tiết tránh ngập (OSRM Routing nâng cao).

### 1.3. Thuật ngữ và Từ viết tắt

| Thuật ngữ | Định nghĩa |
|---|---|
| **Khách vãng lai** | Người truy cập hệ thống nhưng chưa đăng nhập tài khoản. |
| **Thành viên** | Người dùng đã đăng ký tài khoản và được xác thực qua email OTP. |
| **Quản trị viên (Admin)** | Tài khoản có vai trò `admin`, có toàn quyền kiểm duyệt sự cố và quản lý tài khoản. |
| **Điểm uy tín (Reputation Score)** | Điểm đánh giá độ tin cậy của tài khoản (mặc định khởi tạo: **10 điểm**). Bị trừ khi bị cộng đồng báo sai. |
| **Vùng cảnh báo (Cluster Zone)**| Vòng tròn cảnh báo bán kính 150m tự động kích hoạt khi có trên 5 điểm sự cố tập trung gần nhau. |
| **Rốn ngập lịch sử** | Vùng thường xuyên xảy ra ngập úng trong 30 ngày qua, tự động cảnh báo khi có mưa. |
| **Điểm đen kẹt xe** | Nút giao thông thường xuyên ùn ứ trong 90 ngày qua, tự động cảnh báo vào các khung giờ cao điểm. |
| **Remember Me** | Cơ chế duy trì phiên đăng nhập an toàn 30 ngày bằng token băm SHA-256 lưu trong CSDL và Cookie. |
| **OTP** | One-Time Password – Mã xác thực gồm 6 chữ số gửi qua email, có hiệu lực trong vòng 15 phút. |

---

## 2. Mô tả tổng quan

### 2.1. Nhóm người dùng và Ma trận phân quyền

| Nhóm người dùng | Quyền hạn và Phạm vi truy cập |
|---|---|
| **Khách vãng lai (Guest)** | Xem bản đồ, tìm đường, xem chú giải, xem tin tức sự cố, xem thời tiết & radar mưa, đăng ký tài khoản, đăng nhập. Không được gửi báo cáo sự cố và không được bình chọn. |
| **Thành viên (User)** | Như Khách vãng lai, cộng thêm: Gửi báo cáo điểm ngập/kẹt xe mới, bình chọn xác minh sự cố (Đúng / Đã hết), nhận thông báo đẩy GPS bán kính 500m, xem danh sách "Báo cáo của tôi", đổi mật khẩu. |
| **Quản trị viên (Admin)** | Toàn quyền như Thành viên, cộng thêm quyền truy cập trang Admin Dashboard: Khóa / Mở khóa thành viên, điều chỉnh điểm uy tín, thay đổi quyền hạn, ẩn / khôi phục / kết thúc điểm sự cố, xuất dữ liệu Excel/CSV. |

### 2.2. Ràng buộc nghiệp vụ chung (Business Rules - BR)
- **BR-01 (Tính xác thực sự cố):** Mỗi tài khoản chỉ được bình chọn 1 lần trên 1 điểm sự cố (hoặc Đúng, hoặc Đã hết). Không cho phép người tạo sự cố tự bình chọn bài viết của chính mình.
- **BR-02 (Cơ chế chống tin giả):** Khi một sự cố có hiệu số giữa số lượt báo sai và số lượt xác nhận $\ge 3$ (`reject_count - confirm_count >= 3`), sự cố sẽ tự động bị ẩn (`status = 'bi_an'`) và người đăng bị trừ 1 điểm uy tín.
- **BR-03 (Chế tài tài khoản vi phạm):** Nếu điểm uy tín của thành viên bị tụt về $\le 0$, tài khoản sẽ tự động chuyển sang trạng thái Đã khóa (`status = 'blocked'`) và bị thu hồi quyền đăng bài/bình chọn ngay lập tức.
- **BR-04 (Thời hạn tồn tại sự cố):** Điểm ngập nước có thời hạn mặc định 12 giờ; điểm kẹt xe có thời hạn mặc định 6 giờ. Mỗi khi có thành viên bình chọn "Đúng", thời hạn sự cố được gia hạn thêm tương ứng (+4 giờ với ngập nước, +2 giờ với kẹt xe).
- **BR-05 (Bảo mật phiên làm việc):** Mật khẩu bắt buộc mã hóa băm bằng thuật toán an toàn (Bcrypt). Không lưu trữ mật khẩu gốc dạng văn bản rõ.

---

## 3. Yêu cầu chức năng (Functional Requirements - FR)

### FR-01. Bản đồ trực quan & Định vị GPS

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-01.1** | Hệ thống khởi tạo bản đồ số tương tác toàn màn hình (Leaflet.js) tại trung tâm thành phố Nha Trang (tọa độ mặc định `[12.2458, 109.1943]`). |
| **FR-01.2** | Hệ thống tự động kích hoạt tính năng định vị GPS để xác định tọa độ người dùng, lưu tọa độ gần nhất vào bộ nhớ trình duyệt (LocalStorage). |
| **FR-01.3** | Người dùng có thể nhấn nút "Vị trí GPS của bạn" để đưa tầm nhìn bản đồ cận cảnh về vị trí hiện tại (mức phóng to zoom 16.5). |
| **FR-01.4** | Người dùng có thể click hoặc chạm vào bất kỳ vị trí nào trên bản đồ để chọn tọa độ gửi báo cáo sự cố. |
| **FR-01.5** | Cung cấp cụm nút điều khiển nổi ở góc phải dưới: Phóng to (+), Thu nhỏ (-), Định vị GPS, Bật/Tắt Radar mưa. |

---

### FR-02. Hiển thị sự cố & Lọc dữ liệu thời gian thực

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-02.1** | Điểm cảnh báo ngập nước hiển thị dưới dạng icon sóng màu xanh dương kèm hiệu ứng xung động lan tỏa (`pulse-marker-flood`). |
| **FR-02.2** | Điểm cảnh báo kẹt xe hiển thị dưới dạng icon xe ô tô màu cam đỏ kèm hiệu ứng xung động lan tỏa (`pulse-marker-traffic`). |
| **FR-02.3** | Khi người dùng click vào một điểm ghim, hệ thống hiển thị Popup chứa: loại sự cố, địa chỉ, mức độ, mô tả chi tiết, ảnh hiện trường (nếu có), người báo, thời gian và 2 nút bình chọn. |
| **FR-02.4** | Thanh trạng thái ở giữa trên hiển thị tổng số điểm cảnh báo đang hoạt động. |
| **FR-02.5** | Cho phép người dùng chuyển đổi bộ lọc trên thanh trạng thái: "Tất cả sự cố", "Chỉ báo ngập", hoặc "Chỉ kẹt xe". Bản đồ tự động cập nhật marker tương ứng. |
| **FR-02.6** | Hệ thống tự động làm mới dữ liệu sự cố ngầm từ máy chủ theo chu kỳ **25 giây/lần** mà không làm gián đoạn trải nghiệm người dùng. |
| **FR-02.7** | Tự động quét và chuyển trạng thái các tin báo đã quá hạn sang `da_ket_thuc` trước khi trả kết quả về bản đồ. |

---

### FR-03. Gom cụm vùng nguy hiểm & Cảnh báo dự báo thông minh

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-03.1** | **Gom cụm vùng cảnh báo:** Khi một khu vực có từ **6 điểm sự cố trở lên** trong bán kính cố định **150 mét**, hệ thống tự động gộp thành một Vùng cảnh báo nguy hiểm hình tròn. |
| **FR-03.2** | Tâm vùng cảnh báo hiển thị huy hiệu tổng số điểm sự cố kèm emoji đại diện (🌊 nếu phần lớn là ngập, 🚦 nếu phần lớn là kẹt xe). |
| **FR-03.3** | Popup vùng cảnh báo liệt kê danh sách tóm tắt các điểm ngập/kẹt xe bên trong và cung cấp nút "Tách xem từng chấm". |
| **FR-03.4** | Khi người dùng phóng to bản đồ ($\ge 17$) hoặc nhấn "Tách xem từng chấm", các điểm ghim lẻ sẽ bung ra; khi thu nhỏ bản đồ ($\le 15$), các điểm sẽ tự động gộp lại thành vòng tròn. |
| **FR-03.5** | **Tích hợp thời tiết:** Tự động lấy nhiệt độ và trạng thái thời tiết thời gian thực qua Open-Meteo API để hiển thị lên thanh công cụ. |
| **FR-03.6** | **Radar mây mưa RainViewer:** Cho phép bật lớp phủ radar vệ tinh mây mưa thời gian thực trực tiếp lên trên lớp bản đồ số. |
| **FR-03.7** | **Dự báo Rốn ngập khi mưa:** Khi phát hiện thời tiết đang mưa (hoặc khi bật radar mưa), hệ thống tự động tải lịch sử dữ liệu 30 ngày và kích hoạt các Vùng Rốn Ngập (vòng tròn nét đứt màu xanh) tại các khu vực từng có trên 5 lần báo ngập. |
| **FR-03.8** | **Dự báo Điểm đen kẹt xe giờ cao điểm:** Hệ thống tự động kiểm tra giờ hệ thống; nếu rơi vào các khung giờ cao điểm (Sáng: 06:30–08:30, Trưa: 11:00–12:30, Chiều: 16:30–19:00), hệ thống tự động hiển thị các Vùng Điểm Đen Kẹt Xe (nét đứt màu cam) dựa trên dữ liệu 90 ngày. |

---

### FR-04. Báo cáo sự cố mới từ cộng đồng

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-04.1** | Chỉ thành viên đã đăng nhập mới được mở biểu mẫu gửi báo cáo sự cố. Khách chưa đăng nhập sẽ nhận được màn hình yêu cầu đăng nhập. |
| **FR-04.2** | Biểu mẫu gồm quy trình **3 bước chạm trực quan**: |
| | - **Bước 1 (Loại sự cố):** Chọn giữa "Ngập lụt" hoặc "Kẹt xe". |
| | - **Bước 2 (Ước lượng mức độ):**<br>• *Nếu là ngập lụt:* Mắt cá chân (~10-15cm - Mức nhẹ) / Nửa bánh xe máy (~20-25cm - Nguy hiểm) / Ngập ống xả-yên xe (>40-50cm - Chết máy hoàn toàn).<br>• *Nếu là kẹt xe:* Di chuyển chậm (15-25 km/h) / Ùn ứ nặng (5-15 km/h) / Tắc nghẽn bất động (<5 km/h). |
| | - **Bước 3 (Vị trí & Hiện trường):** Tọa độ GPS (lấy tự động từ điểm chạm bản đồ), Địa chỉ/tên đường (tối đa 255 ký tự), Mô tả bổ sung (tùy chọn), Tải ảnh hiện trường (tùy chọn). |
| **FR-04.3** | Chặn gửi dữ liệu nếu thiếu tọa độ hoặc tọa độ không hợp lệ ($lat \notin [-90, 90]$ hoặc $lng \notin [-180, 180]$). |
| **FR-04.4** | Kiểm tra file ảnh tải lên: chỉ chấp nhận định dạng `jpg`, `png`, `webp`, `gif`, dung lượng tối đa **5MB**. Ảnh được lưu vào thư mục `public/images/reports/`. |
| **FR-04.5** | Gửi form ngầm qua API (Fetch AJAX), không tải lại trang. Khi thành công, hiển thị thông báo Toast xanh, đóng form và ghim ngay điểm mới lên bản đồ. |

---

### FR-05. Bình chọn xác nhận & Chống tin giả

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-05.1** | Trên popup của mỗi điểm sự cố, thành viên có thể nhấn **"👍 Đúng"** (`confirm`) hoặc **"👎 Đã hết"** (`reject`). |
| **FR-05.2** | Bắt buộc đăng nhập để thực hiện bình chọn. |
| **FR-05.3** | Không cho phép người dùng tự bình chọn cho báo cáo do chính mình tạo ra (HTTP 403). |
| **FR-05.4** | Hỗ trợ đổi bình chọn: Nếu đã vote "Đúng" mà chuyển sang "Đã hết" (hoặc ngược lại), hệ thống tự động trừ 1 phiếu ở cột cũ và cộng 1 phiếu ở cột mới trong cùng một Transaction CSDL. |
| **FR-05.5** | Khi bình chọn "Đúng", thời hạn hết hạn (`expires_at`) của sự cố tự động được gia hạn thêm (+4 giờ đối với ngập nước, +2 giờ đối với kẹt xe). |
| **FR-05.6** | Áp dụng quy tắc **BR-02**: Khi $(reject\_count - confirm\_count) \ge 3$, sự cố tự động chuyển sang trạng thái `bi_an` và tự động trừ **1 điểm uy tín** của người đăng tin. |
| **FR-05.7** | Áp dụng quy tắc **BR-03**: Khi điểm uy tín của thành viên bị trừ về $\le 0$, tài khoản tự động bị khóa (`status = 'blocked'`). |

---

### FR-06. Đăng ký & Xác thực tài khoản qua Email OTP

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-06.1** | Người dùng đăng ký tài khoản với các trường: Họ và tên, Tên đăng nhập (username: 3-30 ký tự, không dấu cách), Email, Mật khẩu ($\ge 6$ ký tự), Nhập lại mật khẩu, Hộp kiểm đồng ý Điều khoản & Chính sách. |
| **FR-06.2** | Kiểm tra trùng lặp email thời gian thực ngay khi người dùng đang gõ phím trên form đăng ký. |
| **FR-06.3** | Mật khẩu xác nhận phải khớp 100% với mật khẩu đã nhập. |
| **FR-06.4** | Khi thông tin hợp lệ, hệ thống tạo mã OTP gồm 6 chữ số ngẫu nhiên, lưu vào bảng `email_otps` với thời hạn **15 phút**. |
| **FR-06.5** | Hệ thống gửi email chứa mã OTP đến hòm thư người dùng qua giao thức SMTP (hỗ trợ lưu log dự phòng tại `storage/mail_logs.txt`). |
| **FR-06.6** | Chuyển sang màn hình nhập mã OTP. Người dùng nhập đúng 6 chữ số $\rightarrow$ tài khoản được tạo chính thức (`is_verified = 1`), khởi tạo **10 điểm uy tín** và tự động đăng nhập. |
| **FR-06.7** | Cho phép nhấn "Gửi lại mã OTP" nếu chưa nhận được mã trong hòm thư. |

---

### FR-07. Đăng nhập, Duy trì phiên (Remember Me) & Đăng xuất

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-07.1** | Cho phép đăng nhập bằng cặp thông tin: (Email hoặc Tên đăng nhập) + Mật khẩu. |
| **FR-07.2** | Mật khẩu được so khớp an toàn bằng `password_verify` với bản băm Bcrypt trong CSDL. |
| **FR-07.3** | Tùy chọn **"Ghi nhớ 30 ngày" (Remember Me)**: Khi được tích chọn, hệ thống tạo một chuỗi token ngẫu nhiên 64 ký tự an toàn, lưu bản băm SHA-256 vào bảng `user_tokens` với thời hạn 30 ngày, đồng thời đặt Cookie `remember_me` với cờ `HttpOnly` và `SameSite=Lax`. |
| **FR-07.4** | Tự động khôi phục phiên làm việc (`restore_remember_me_session`): Khi phiên PHP Session đã hết hạn nhưng trình duyệt vẫn còn Cookie `remember_me` hợp lệ, hệ thống tự động tái tạo phiên mà không bắt người dùng đăng nhập lại. |
| **FR-07.5** | Chặn đăng nhập đối với tài khoản có trạng thái `blocked` hoặc điểm uy tín $\le 0$, trả về thông báo lỗi vi phạm chính sách. |
| **FR-07.6** | Phân quyền điều hướng: Nếu tài khoản có vai trò `admin`, tự động chuyển hướng vào `index.php?route=admin_dashboard`; nếu là `user`, duy trì tại giao diện bản đồ. |
| **FR-07.7** | Đăng xuất: Xóa sạch dữ liệu `$_SESSION`, hủy cookie phiên, xóa token trong bảng `user_tokens` và chuyển về trang chủ ở trạng thái khách chưa đăng nhập. |

---

### FR-08. Đăng nhập nhanh bằng Google (Google Sign-In)

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-08.1** | Tích hợp nút đăng nhập Google một chạm sử dụng Google Identity Services (GIS SDK) và Firebase Authentication. |
| **FR-08.2** | Backend tiếp nhận và xác thực mã Token trực tiếp qua cổng Google Identity Toolkit API (`accounts:lookup`) hoặc Google OAuth2 TokenInfo API. |
| **FR-08.3** | Nếu email Google đã tồn tại trong CSDL: Tự động liên kết `google_id`, cập nhật avatar và đăng nhập. |
| **FR-08.4** | Nếu email Google chưa tồn tại: Tự động khởi tạo tài khoản mới với tên hiển thị, email, avatar, cấp trạng thái `is_verified = 1`, 10 điểm uy tín và đăng nhập ngay lập tức. |

---

### FR-09. Quên mật khẩu & Đặt lại mật khẩu

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-09.1** | Người dùng nhập Email hoặc Tên đăng nhập để yêu cầu đặt lại mật khẩu. |
| **FR-09.2** | Hệ thống tạo Reset Token ngẫu nhiên (64 ký tự) và mã OTP 6 số (hiệu lực **15 phút**), lưu vào CSDL. |
| **FR-09.3** | Gửi email thông báo cho người dùng chứa cả liên kết đặt lại mật khẩu và mã OTP 6 số. |
| **FR-09.4** | Cho phép đặt lại mật khẩu bằng 1 trong 2 cách: (1) Mở trực tiếp liên kết chứa Reset Token trên URL, hoặc (2) Nhập Email + Mã OTP 6 số trên form. |
| **FR-09.5** | Mật khẩu mới bắt buộc tối thiểu 6 ký tự và phải nhập khớp tại ô xác nhận. |
| **FR-09.6** | Đặt lại mật khẩu thành công: Mật khẩu mới được băm Bcrypt, xóa bỏ token/OTP đã dùng, đồng thời hủy bỏ toàn bộ phiên `remember_me` cũ trên các thiết bị khác để bảo đảm an toàn. |

---

### FR-10. Radar cảnh báo bán kính GPS & Thông báo đẩy (Web Push)

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-10.1** | Áp dụng thuật toán Haversine để liên tục tính khoảng cách đường chim bay (đơn vị: mét) từ vị trí GPS của người dùng đến tất cả các điểm sự cố đang diễn ra. |
| **FR-10.2** | Quét sự cố trong bán kính an toàn cố định **500 mét** quanh vị trí người dùng. |
| **FR-10.3** | Khi phát hiện có sự cố lọt vào bán kính 500m, hệ thống hiển thị **Banner cảnh báo nguy hiểm** nổi trên đỉnh bản đồ (nêu rõ khoảng cách và loại sự cố gần nhất). |
| **FR-10.4** | Bấm vào Banner cảnh báo sẽ tự động di chuyển bản đồ đến điểm sự cố gần nhất (`focusClosestAlert`). |
| **FR-10.5** | Gửi thông báo đẩy qua Web Notification API của trình duyệt (kèm rung điện thoại 2 nhịp) khi có sự cố mới nằm trong bán kính. |
| **FR-10.6** | Cung cấp công tắc Bật/Tắt tính năng radar và nút Cấp quyền thông báo trong sub-panel "Radar cảnh báo GPS". |

---

### FR-11. Quản lý cá nhân & Xem "Báo cáo của tôi"

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-11.1** | Thành viên có thể mở mục "Báo cáo của tôi" trên menu sidebar để xem toàn bộ lịch sử các điểm sự cố mình đã đóng góp. |
| **FR-11.2** | Mỗi báo cáo hiển thị: Loại sự cố, Địa chỉ, Trạng thái (Đang diễn ra, Đã kết thúc, Bị ẩn), Số lượt vote 👍/👎 và thời gian gửi. |
| **FR-11.3** | Click vào một báo cáo trong danh sách sẽ tự động đóng sidebar và di chuyển tâm bản đồ tới vị trí đó. |
| **FR-11.4** | Cung cấp chức năng Đổi mật khẩu trong mục "Hồ sơ & Bảo mật": Yêu cầu nhập mật khẩu cũ, mật khẩu mới ($\ge 6$ ký tự) và xác nhận mật khẩu mới. |

---

### FR-12. Quản trị hệ thống (Admin Dashboard)

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-12.1** | Chặn toàn bộ người dùng không có vai trò `admin` truy cập vào trang `index.php?route=admin_dashboard` (tự động chuyển hướng về trang chủ). |
| **FR-12.2** | **Thống kê tổng quan:** Hiển thị 3 thẻ số liệu tổng hợp: Tổng số tài khoản, Số tài khoản đang hoạt động, và Số sự cố đang diễn ra. |
| **FR-12.3** | **Quản lý tài khoản người dùng:** Hiển thị bảng danh sách thành viên gồm: ID, Tên đăng nhập, Họ tên, Email, Vai trò, Điểm uy tín, Số đóng góp báo cáo, Trạng thái hoạt động, Ngày tham gia. |
| **FR-12.4** | Tìm kiếm thành viên theo từ khóa (username, họ tên, email); lọc theo vai trò (User/Admin) và trạng thái (Hoạt động/Đã khóa). |
| **FR-12.5** | Thao tác trên tài khoản: Khóa tài khoản (`block`), Mở khóa tài khoản (`unblock` - tự động khôi phục 10 điểm uy tín), Đổi quyền (`set_role` User $\leftrightarrow$ Admin), Điều chỉnh điểm uy tín (`set_score`: 0–100), Xóa tài khoản (`delete`). Chặn không cho Admin tự khóa hoặc tự xóa tài khoản của chính mình. |
| **FR-12.6** | **Quản lý sự cố:** Xem bảng danh sách toàn bộ sự cố trong hệ thống. Cung cấp các nút thao tác nhanh: Xác thực báo cáo (+5 vote), Ẩn sự cố vi phạm (`bi_an`), Khôi phục sự cố (`dang_dien_ra`), Đóng sự cố (`da_ket_thuc`). |
| **FR-12.7** | **Xuất báo cáo Excel/CSV:** Xuất toàn bộ dữ liệu sự cố ra tệp CSV kèm mã UTF-8 BOM hiển thị tiếng Việt chuẩn xác trong Microsoft Excel (`api/admin/export_reports.php`). |

---

## 4. Đặc tả Ca sử dụng tiêu biểu (Use Cases - UC)

### UC-01. Báo cáo điểm sự cố mới

- **Tác nhân:** Thành viên đã đăng nhập (`role = 'user'` hoặc `'admin'`).
- **Tiền điều kiện:** Thành viên đã đăng nhập tài khoản hợp lệ, tài khoản không bị khóa (`status = 'active'`).
- **Sự kiện kích hoạt (Trigger):** Người dùng chạm/click vào một vị trí trên bản đồ, hoặc bấm nút "+ Báo sự cố" ở góc phải màn hình.
- **Luồng chính (Basic Flow):**
  1. Bản đồ ghim biểu tượng vị trí đã chọn và mở khung "Báo Cáo Sự Cố" ở thanh bên trái.
  2. Hệ thống tự động điền tọa độ `latitude` và `longitude` vào trường ẩn của form.
  3. Người dùng chọn loại sự cố: "Ngập lụt" hoặc "Kẹt xe" (Bước 1).
  4. Hệ thống hiển thị các mốc ước lượng trực quan tương ứng; người dùng chọn mức độ nước ngập hoặc tình trạng lưu thông (Bước 2).
  5. Người dùng kiểm tra tên địa chỉ đường, nhập thêm mô tả chi tiết và chọn đính kèm ảnh hiện trường (Bước 3).
  6. Người dùng nhấn nút **"Phát Cảnh Báo"**.
  7. Hệ thống kiểm tra tính hợp lệ của dữ liệu, lưu file ảnh vào thư mục `public/images/reports/`.
  8. Hệ thống lưu bản ghi vào bảng `reports` với trạng thái `dang_dien_ra`, thời hạn hết hạn được thiết lập tự động.
  9. Hệ thống đóng form, hiển thị thông báo Toast thành công và tự động ghim điểm cảnh báo mới lên bản đồ.
- **Luồng phụ / Ngoại lệ (Alternative Flows):**
  - *AF-01 (Chưa đăng nhập):* Hệ thống hiển thị thông báo yêu cầu đăng nhập và cung cấp nút mở màn hình Đăng nhập.
  - *AF-02 (Chưa chọn tọa độ):* Hệ thống thông báo lỗi: "Vui lòng chạm lên bản đồ để chọn vị trí sự cố!".
  - *AF-03 (Ảnh quá dung lượng hoặc sai định dạng):* Hệ thống từ chối tải ảnh và báo lỗi "Ảnh không hợp lệ (chỉ nhận jpg, png, webp, gif tối đa 5MB)".
- **Hậu điều kiện:** Bản ghi sự cố mới được lưu vào CSDL; bản đồ hiển thị điểm sự cố kèm hiệu ứng sóng lan tỏa.

---

### UC-02. Bình chọn xác nhận / Báo sai sự cố

- **Tác nhân:** Thành viên đã đăng nhập.
- **Tiền điều kiện:** Tồn tại ít nhất một điểm sự cố đang ở trạng thái `dang_dien_ra`.
- **Sự kiện kích hoạt (Trigger):** Thành viên nhấn nút "👍 Đúng" hoặc "👎 Đã hết" trên popup thông tin sự cố.
- **Luồng chính (Basic Flow):**
  1. Hệ thống tiếp nhận ID sự cố và loại bình chọn (`confirm` hoặc `reject`).
  2. Hệ thống kiểm tra người bình chọn không phải là người đã tạo ra sự cố đó.
  3. Mở Transaction CSDL: Ghi nhận lượt bình chọn vào bảng `report_votes`.
  4. Nếu bình chọn "Đúng": Tăng `confirm_count` thêm 1 và gia hạn thêm thời gian cho sự cố.
  5. Nếu bình chọn "Đã hết": Tăng `reject_count` thêm 1.
  6. Xác nhận Transaction và trả về số lượt bình chọn mới nhất.
  7. Giao diện cập nhật số lượt vote và hiển thị thông báo Toast ghi nhận thành công.
- **Luồng phụ / Ngoại lệ (Alternative Flows):**
  - *AF-01 (Tự bình chọn bài của mình):* Hệ thống từ chối với thông báo "Bạn không thể bình chọn báo cáo của chính mình".
  - *AF-02 (Đổi ý kiến bình chọn):* Nếu trước đó đã vote "Đúng" mà nay bấm "Đã hết", hệ thống tự động giảm `confirm_count` đi 1 và tăng `reject_count` thêm 1.
  - *AF-03 (Bị cộng đồng báo sai $\ge 3$ phiếu):* Khi `reject_count - confirm_count >= 3`, hệ thống tự động đổi trạng thái sự cố sang `bi_an` và gọi hàm trừ 1 điểm uy tín của người đăng tin.
- **Hậu điều kiện:** Điểm sự cố được cập nhật số lượt vote; nếu bị ẩn thì marker biến mất khỏi bản đồ chính.

---

## 5. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)

| Mã yêu cầu | Nhóm ràng buộc | Nội dung yêu cầu chi tiết |
|---|---|---|
| **NFR-01** | **Hiệu năng (Performance)** | Thời gian tải bản đồ và nạp toàn bộ danh sách điểm sự cố ban đầu $\le 2.0$ giây. Thời gian phản hồi của các API kiểm tra email, đăng nhập, vote $\le 500$ms. |
| **NFR-02** | **Bảo mật (Security)** | • Mật khẩu tài khoản phải được mã hóa băm bằng thuật toán Bcrypt.<br>• 100% câu truy vấn CSDL sử dụng Prepared Statements để chống tấn công SQL Injection.<br>• Làm sạch và escape dữ liệu đầu vào chống tấn công XSS.<br>• Cookie phiên Remember Me bắt buộc thiết lập cờ bảo vệ `HttpOnly` và `SameSite=Lax`. |
| **NFR-03** | **Tương thích (Compatibility)** | Giao diện tương thích hoàn hảo và hiển thị tốt trên các trình duyệt phổ biến: Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari. Chiều rộng màn hình hỗ trợ tối thiểu từ **360px** trở lên (thiết bị di động không bị vỡ layout hay xuất hiện thanh cuộn ngang trang). |
| **NFR-04** | **Độ tin cậy (Reliability)** | • Hoạt động ổn định 24/7.<br>• Các thao tác cập nhật dữ liệu quan trọng (bình chọn, đổi trạng thái) phải được bao bọc trong Transaction của MySQL InnoDB để đảm bảo toàn vẹn dữ liệu.<br>• Khi mất kết nối máy chủ gửi mail SMTP, hệ thống tự động ghi nhật ký dự phòng vào `storage/mail_logs.txt` để không làm gián đoạn luồng đăng ký của người dùng. |
| **NFR-05** | **Khả năng sử dụng (Usability)** | Toàn bộ giao diện, thông báo lỗi và hướng dẫn sử dụng bằng tiếng Việt có dấu. Hệ thống icon trực quan (Phosphor Icons) giúp người dùng dễ dàng thao tác bằng 1 tay trên điện thoại. |

---

## 6. Mô hình hành vi (Behavioral Models)

### 6.1. Máy trạng thái vòng đời Sự cố (State Machine ST-01)
Thực thể: `reports` · 3 trạng thái $\times$ 4 sự kiện

| Trạng thái hiện tại | Hết thời gian (`expires_at`) | Bị báo sai $\ge 3$ phiếu | Admin Xác thực / Mở lại | Admin Ẩn / Đóng sự cố |
|---|:---:|:---:|:---:|:---:|
| **Đang diễn ra (`dang_dien_ra`)** | $\rightarrow$ Đã kết thúc | $\rightarrow$ Bị ẩn | — | $\rightarrow$ Bị ẩn / Đã kết thúc |
| **Đã kết thúc (`da_ket_thuc`)** | — | — | $\rightarrow$ Đang diễn ra | — |
| **Bị ẩn (`bi_an`)** | — | — | $\rightarrow$ Đang diễn ra | — |

*Ghi chú: Dấu "—" biểu thị chuyển đổi trạng thái không hợp lệ.*

---

### 6.2. Bảng quyết định kiểm duyệt sự cố & Xử lý điểm uy tín (Decision Table DT-01)
Áp dụng khi người dùng thực hiện bình chọn sự cố tại FR-05:

| Điều kiện / Hành động | R1 | R2 | R3 | R4 |
|---|:---:|:---:|:---:|:---:|
| **C1. Loại bình chọn là "Đúng" (`confirm`)?** | Y | N | N | N |
| **C2. Hiệu số $(Reject - Confirm) \ge 3$?** | — | N | Y | Y |
| **C3. Điểm uy tín của người đăng sau khi trừ $\le 0$?** | — | — | N | Y |
| **A1. Tăng `confirm_count` +1 & Gia hạn thời gian sự cố** | ✔ | | | |
| **A2. Tăng `reject_count` +1, giữ nguyên trạng thái** | | ✔ | | |
| **A3. Đổi trạng thái sự cố sang Bị ẩn (`bi_an`)** | | | ✔ | ✔ |
| **A4. Trừ 1 điểm uy tín của người báo cáo** | | | ✔ | ✔ |
| **A5. Khóa tài khoản người báo cáo (`status = 'blocked'`)** | | | | ✔ |

---

## 7. Yêu cầu dữ liệu (Data Dictionary)

Hệ thống sử dụng cơ sở dữ liệu quan hệ MySQL (`traffic_map_db`), gồm 5 bảng dữ liệu cốt lõi:

### 7.1. Bảng `users` (Tài khoản người dùng)

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính định danh tài khoản |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Tên đăng nhập duy nhất |
| `full_name` | VARCHAR(100) | NULL | Họ và tên đầy đủ |
| `avatar` | VARCHAR(255) | NULL | Đường dẫn ảnh đại diện |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | Địa chỉ email đăng ký duy nhất |
| `google_id` | VARCHAR(100) | NULL, INDEX | ID định danh tài khoản Google |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu đã băm Bcrypt |
| `role` | ENUM('user', 'admin') | DEFAULT 'user' | Quyền hạn tài khoản |
| `status` | ENUM('active', 'blocked') | DEFAULT 'active' | Trạng thái hoạt động hoặc bị khóa |
| `is_verified` | TINYINT(1) | DEFAULT 0 | Trạng thái kích hoạt qua OTP (1: Đã kích hoạt) |
| `reputation_score` | INT | DEFAULT 10 | Điểm uy tín người dùng (khởi tạo: 10) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo tài khoản |

### 7.2. Bảng `reports` (Báo cáo sự cố ngập lụt & kẹt xe)

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính điểm sự cố |
| `user_id` | INT | FK $\rightarrow$ users(id) | Người gửi báo cáo sự cố |
| `type` | ENUM('ngap_nuoc', 'ket_xe') | NOT NULL | Phân loại sự cố |
| `severity` | ENUM('nhe', 'vua', 'nghiem_trong') | DEFAULT 'vua' | Mức độ nghiêm trọng của sự cố |
| `latitude` | DECIMAL(10, 8) | NOT NULL | Tọa độ vĩ độ GPS |
| `longitude` | DECIMAL(11, 8) | NOT NULL | Tọa độ kinh độ GPS |
| `address_text` | VARCHAR(255) | NULL | Tên đường hoặc địa chỉ mô tả |
| `description` | TEXT | NULL | Ghi chú, mô tả chi tiết hiện trường |
| `image_url` | VARCHAR(255) | NULL | Đường dẫn file ảnh hiện trường |
| `confirm_count` | INT | DEFAULT 1 | Số lượt xác nhận đúng |
| `reject_count` | INT | DEFAULT 0 | Số lượt báo sai sự thật |
| `status` | ENUM('dang_dien_ra', 'da_ket_thuc', 'bi_an') | DEFAULT 'dang_dien_ra' | Trạng thái hiển thị của sự cố |
| `expires_at` | TIMESTAMP | NULL | Thời điểm sự cố tự động hết hạn |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo báo cáo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Lần cập nhật hoặc vote gần nhất |

### 7.3. Bảng `report_votes` (Lịch sử bình chọn sự cố)

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính bản ghi bình chọn |
| `report_id` | INT | FK $\rightarrow$ reports(id) | Điểm sự cố được bình chọn |
| `user_id` | INT | FK $\rightarrow$ users(id) | Thành viên thực hiện bình chọn |
| `vote_type` | ENUM('confirm', 'reject') | NOT NULL | Loại bình chọn (Đúng / Đã hết) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm thực hiện |
| *Ràng buộc:* | `UNIQUE KEY (report_id, user_id)` | — | Chặn một người vote nhiều lần cho cùng 1 tin |

### 7.4. Bảng `user_tokens` (Token duy trì phiên Remember Me & Đặt lại mật khẩu)

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính |
| `user_id` | INT | FK $\rightarrow$ users(id) | Tài khoản sở hữu |
| `token_hash` | VARCHAR(64) | NOT NULL, INDEX | Bản băm SHA-256 của token |
| `type` | ENUM('remember_me', 'reset_password') | NOT NULL | Mục đích sử dụng token |
| `expires_at` | DATETIME | NOT NULL | Thời điểm token hết hạn |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm sinh token |

### 7.5. Bảng `email_otps` (Mã xác thực OTP qua Email)

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính |
| `email` | VARCHAR(100) | NOT NULL, INDEX | Email nhận mã xác thực |
| `otp_code` | VARCHAR(10) | NOT NULL | Mã số OTP (gồm 6 chữ số) |
| `action` | ENUM('register', 'reset_password') | NOT NULL | Hành động xác thực |
| `data` | TEXT | NULL | Dữ liệu đệm JSON (thông tin đăng ký tạm) |
| `expires_at` | DATETIME | NOT NULL | Thời điểm hết hạn (sau 15 phút) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo mã |

---

## 8. Ma trận truy vết yêu cầu (Requirement Traceability Matrix - RTM)

| Mã FR | Tên yêu cầu chức năng | Use Case | Bảng dữ liệu | API Backend | Mã màn hình |
|---|---|---|---|---|---|
| **FR-01** | Bản đồ tương tác & GPS | — | — | OpenStreetMap / Browser GPS | SC-01 (Bản đồ chính) |
| **FR-02** | Hiển thị sự cố & Tự động quét quá hạn | — | `reports`, `users` | `GET /api/reports.php` | SC-01 (Header pill) |
| **FR-03** | Gom cụm vùng cảnh báo nguy hiểm & Radar | — | `reports` | Open-Meteo, RainViewer API | SC-01 (Leaflet canvas) |
| **FR-04** | Báo cáo sự cố mới từ cộng đồng | UC-01 | `reports` | `POST /api/reports.php` | SC-02 (Sidebar report) |
| **FR-05** | Bình chọn xác nhận & Chống tin giả | UC-02 | `reports`, `report_votes`, `users` | `POST /api/vote.php` | SC-01 (Marker popup) |
| **FR-06** | Đăng ký tài khoản & Xác thực Email OTP | UC-03 | `users`, `email_otps` | `POST /api/register.php`, `register_verify.php` | SC-03 (Subpanel Register/OTP) |
| **FR-07** | Đăng nhập & Duy trì phiên (Remember Me) | — | `users`, `user_tokens` | `POST /api/login.php`, `logout.php`, `me.php` | SC-03 (Subpanel Login) |
| **FR-08** | Đăng nhập nhanh bằng Google | — | `users`, `user_tokens` | `POST /api/google_login.php` | SC-03 (Google button) |
| **FR-09** | Quên & Đặt lại mật khẩu | — | `users`, `user_tokens`, `email_otps` | `POST /api/forgot_password.php`, `reset_password.php` | SC-03 (Subpanel Forgot) |
| **FR-10** | Radar quét sự cố bán kính GPS 500m | — | — | Web Notification API | SC-01 (Proximity banner) |
| **FR-11** | Danh sách "Báo cáo của tôi" & Đổi mật khẩu | — | `reports`, `users` | `GET /api/reports.php?my=1`, `change_password.php`| SC-04 (Subpanel My reports) |
| **FR-12** | Bảng điều khiển Quản trị viên (Admin) | — | `users`, `reports` | `api/admin/users.php`, `user_status.php`, `reports.php` | SC-05 (Admin Dashboard) |

---

## Phụ lục A. Danh mục Thông điệp Hệ thống (Message Catalogue)

| Mã thông điệp | Loại thông điệp | Nội dung hiển thị | Tình huống kích hoạt |
|---|---|---|---|
| **MSG-001** | Lỗi | "Vui lòng chạm lên bản đồ để chọn vị trí sự cố!" | Người dùng nhấn gửi báo cáo khi chưa có tọa độ GPS |
| **MSG-002** | Thành công | "Gửi báo cáo sự cố thành công!" | Tạo bản ghi báo cáo mới thành công |
| **MSG-003** | Lỗi | "Ảnh không hợp lệ (chỉ nhận jpg, png, webp, gif tối đa 5MB)" | File ảnh đính kèm vượt quá 5MB hoặc sai định dạng |
| **MSG-004** | Lỗi | "Vui lòng đăng nhập để bình chọn xác nhận thông tin!" | Khách chưa đăng nhập bấm nút vote trên popup |
| **MSG-005** | Lỗi | "Bạn không thể bình chọn báo cáo của chính mình" | Tác giả tự bình chọn bài viết của mình |
| **MSG-006** | Thành công | "Đã ghi nhận bình chọn của bạn" | Gửi bình chọn xác minh sự cố thành công |
| **MSG-007** | Thành công | "Mã xác thực OTP đã được gửi đến email của bạn!" | Hoàn thành Bước 1 đăng ký tài khoản |
| **MSG-008** | Lỗi | "Mã OTP không chính xác hoặc đã hết hạn (15 phút)!" | Nhập sai OTP hoặc quá 15 phút khi đăng ký |
| **MSG-009** | Thành công | "Xác thực tài khoản thành công! Chào mừng bạn gia nhập hệ thống." | Hoàn thành xác thực OTP đăng ký |
| **MSG-010** | Lỗi | "Tài khoản hoặc mật khẩu không chính xác!" | Đăng nhập sai tên tài khoản hoặc mật khẩu |
| **MSG-011** | Lỗi | "Tài khoản của bạn đã bị khóa do vi phạm điểm uy tín!" | Đăng nhập khi `status = 'blocked'` hoặc điểm uy tín $\le 0$ |
| **MSG-012** | Thành công | "Đăng nhập thành công!" | Xác thực tài khoản thành công |
| **MSG-013** | Thành công | "Đã đăng xuất thành công!" | Thực hiện đăng xuất tài khoản |
| **MSG-014** | Thành công | "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới." | Hoàn tất quy trình quên và đặt lại mật khẩu |
| **MSG-015** | Cảnh báo | "⚠️ Cảnh báo: Có [loại sự cố] cách bạn [khoảng cách]!" | Sự cố lọt vào bán kính an toàn 500m của GPS |
