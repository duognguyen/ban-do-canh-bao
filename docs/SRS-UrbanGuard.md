# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Hệ thống Bản đồ Cảnh báo Điểm ngập & Kẹt xe Công cộng (UrbanGuard Nha Trang)

| Thông tin | Nội dung |
|---|---|
| **Mã tài liệu** | **UG-SRS-001** |
| **Dự án** | UrbanGuard – Bản đồ cảnh báo ngập lụt & ùn tắc giao thông đô thị thời gian thực |
| **Phiên bản** | **1.0** (Baseline 1.0 - Chuẩn hóa thực tế hệ thống) |
| **Trạng thái** | Tài liệu chính thức phục vụ lập trình, kiểm thử & nghiệm thu đồ án |
| **Người soạn** | Nhóm Phân tích Nghiệp vụ (BA) & Phát triển Dự án |
| **Ngày ban hành** | 04/11/2026 |
| **Tài liệu liên quan**| Kiến trúc hệ thống (`DOCS_KIEN_TRUC_DU_AN.md`), Hướng dẫn (`README.md`), CSDL (`schema.sql`) |

---

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu này mô tả chi tiết các yêu cầu chức năng (FR), yêu cầu phi chức năng (NFR), các quy tắc nghiệp vụ (BR) và mô hình quy tắc hành vi cho **Hệ thống Bản đồ Cảnh báo Điểm ngập & Kẹt xe Công cộng (UrbanGuard Nha Trang)**. Tài liệu là căn cứ kỹ thuật chính (*Test Basis*) phản ánh chính xác 100% yêu cầu nghiệp vụ thực tế của hệ thống để phục vụ công tác kiểm thử (QC/Tester), xây dựng kịch bản kiểm thử (Test Cases) và nghiệm thu bảo vệ sản phẩm.

### 1.2. Phạm vi hệ thống (Scope)
- **Trong phạm vi (In-Scope):**
  - Bản đồ số trực quan thời gian thực (Leaflet.js / OpenStreetMap), định vị GPS tự động và lưu vị trí gần nhất vào bộ nhớ trình duyệt.
  - Tìm kiếm đường phố & địa danh thông minh: Tích hợp Photon Geocoding API ưu tiên trọng tâm TP. Nha Trang (`[12.2458, 109.1943]`) kết hợp OpenStreetMap Nominatim dự phòng; hiển thị danh sách gợi ý, ghim điểm tìm kiếm, tự động quét bán kính 300m cảnh báo sự cố lân cận và nút "Báo sự cố tại địa điểm này".
  - Hiển thị, phân loại mức độ và bộ lọc sự cố thời gian thực: Điểm Ngập nước (sóng xanh) và Điểm Kẹt xe (sóng đỏ cam); chu kỳ tự động quét làm mới ngầm 25 giây/lần.
  - Hiển thị ảnh hiện trường thực tế: Ảnh được upload và lưu trữ tại `public/images/reports/`, hiển thị trực quan trong Popup sự cố và danh sách "Báo cáo của tôi", hỗ trợ click phóng to ảnh gốc.
  - Thuật toán gom cụm vùng cảnh báo nguy hiểm (Cluster Zone) bán kính cố định **150 mét** khi có từ **6 điểm sự cố trở lên** tập trung gần nhau, hỗ trợ nút "Tách xem từng chấm".
  - Vùng dễ ngập khi có mưa (30 ngày): Tự động kích hoạt khi có mưa thông qua Open-Meteo Weather API hoặc khi người dùng bật lớp Radar mây mưa RainViewer.
  - Vùng ùn tắc giờ cao điểm (30 ngày): Tự động kích hoạt trong các khung giờ cao điểm quy định (06:30–08:30, 11:00–12:30, 16:30–19:00).
  - Đóng góp thông tin từ cộng đồng: Biểu mẫu báo cáo sự cố (Loại sự cố $\rightarrow$ Ước lượng mức độ $\rightarrow$ Tọa độ & Đính kèm ảnh hiện trường).
  - Cơ chế bình chọn cộng đồng (Vote "👍 Đúng" / "👎 Đã hết"): Tự động gia hạn thời gian tồn tại khi có vote Đúng; tự động ẩn tin giả và trừ điểm uy tín khi bị vote Đã hết áp đảo ($\ge 3$ phiếu).
  - Xác thực tài khoản: Đăng ký kèm mã xác thực OTP qua Email (15 phút), Đăng nhập hỗ trợ ghi nhớ 30 ngày (Remember Me token SHA-256), Đăng nhập Google một chạm (GIS / Firebase Auth), Quên & Đặt lại mật khẩu qua Token/OTP.
  - Radar cảnh báo bán kính an toàn GPS 500m quanh vị trí người dùng kèm thanh Banner cảnh báo nổi và Thông báo đẩy trình duyệt (Web Push Notification).
  - Quản trị viên (Admin Dashboard): Bảng số liệu thống kê tổng quan; Quản lý tài khoản người dùng (khóa/mở khóa/phục hồi điểm uy tín/đổi quyền); Kiểm duyệt sự cố (xác thực/ẩn/khôi phục/kết thúc sự cố); Xuất dữ liệu báo cáo ra file Excel/CSV tiếng Việt UTF-8 BOM.
  - Các tiện ích cộng đồng trên Sidebar: Chú giải chuẩn 4 cấp.
- **Ngoài phạm vi (Out of Scope):**
  - Chức năng gọi cứu hộ khẩn cấp SOS trực tiếp (hệ thống tập trung chuyên biệt vào cảnh báo giao thông cộng đồng).
  - Xác thực qua tin nhắn SMS viễn thông (hệ thống chuẩn hóa 100% bằng giải pháp Email OTP miễn phí, bảo mật).
  - Tính năng dẫn đường từng chặng (Turn-by-turn Navigation) hoặc can thiệp điều khiển hệ thống đèn tín hiệu giao thông đô thị.
  - Các giao dịch tài chính, thanh toán trực tuyến hoặc tính phí dịch vụ.

### 1.3. Thuật ngữ và Từ viết tắt

| Thuật ngữ | Định nghĩa |
|---|---|
| **Khách vãng lai** | Người truy cập hệ thống nhưng chưa đăng nhập tài khoản. |
| **Thành viên** | Người dùng đã đăng ký tài khoản và được kích hoạt xác thực qua email OTP (`is_verified = 1`). |
| **Quản trị viên** | Tài khoản có vai trò `admin`, có toàn quyền quản lý thành viên, kiểm duyệt sự cố và xuất báo cáo. |
| **Điểm uy tín** | Điểm đánh giá độ tin cậy của tài khoản (mặc định khởi tạo: **10 điểm**). Bị trừ 1 điểm khi đăng tin bị cộng đồng báo sai. |
| **Vùng cảnh báo**| Vòng tròn cảnh báo bán kính 150m tự động kích hoạt khi có từ 6 điểm sự cố trở lên tập trung gần nhau. |
| **Vùng dễ ngập** | Vùng thường xuyên xảy ra ngập úng trong 30 ngày qua, tự động kích hoạt cảnh báo khi trời có mưa. |
| **Điểm kẹt xe** | Nút giao thông thường xuyên ùn tắc trong 30 ngày qua, tự động kích hoạt cảnh báo vào các khung giờ cao điểm. |
| **Remember Me** | Cơ chế duy trì phiên đăng nhập an toàn 30 ngày bằng token băm SHA-256 lưu trong CSDL và Cookie `HttpOnly`. |
| **OTP** | One-Time Password – Mã xác thực gồm 6 chữ số gửi qua email, có hiệu lực trong vòng 15 phút. |

---

## 2. Mô tả tổng quan

### 2.1. Nhóm người dùng và Ma trận phân quyền

| Nhóm người dùng | Quyền hạn và Phạm vi truy cập |
|---|---|
| **Khách vãng lai (Guest)** | Xem bản đồ, tìm kiếm đường phố/địa danh, xem chú giải, xem tin tức điểm nóng, xem thời tiết & radar mưa, đăng ký tài khoản, đăng nhập. Không được gửi báo cáo sự cố và không được bình chọn. |
| **Thành viên (User)** | Như Khách vãng lai, cộng thêm: Gửi báo cáo điểm ngập/kẹt xe mới (kèm ảnh hiện trường), bình chọn xác minh sự cố (Đúng / Đã hết), nhận thông báo đẩy GPS bán kính 500m, xem danh sách "Báo cáo của tôi", đổi mật khẩu cá nhân. |
| **Quản trị viên (Admin)** | Toàn quyền như Thành viên, cộng thêm quyền truy cập trang Admin Dashboard: Khóa / Mở khóa thành viên, điều chỉnh điểm uy tín (0–100), đổi quyền User $\leftrightarrow$ Admin, ẩn / khôi phục / kết thúc điểm sự cố, xuất dữ liệu Excel/CSV. |

### 2.2. Ràng buộc nghiệp vụ chung (Business Rules - BR)
- **BR-01 (Tính xác thực sự cố):** Mỗi tài khoản chỉ được bình chọn 1 lần trên 1 điểm sự cố (hoặc Đúng, hoặc Đã hết). Không cho phép người tạo sự cố tự bình chọn bài viết của chính mình (HTTP 403).
- **BR-02 (Cơ chế chống tin giả):** Khi một sự cố có hiệu số giữa số lượt báo sai và số lượt xác nhận $\ge 3$ (`reject_count - confirm_count >= 3`), sự cố sẽ tự động bị ẩn (`status = 'bi_an'`) và người đăng tin bị trừ **1 điểm uy tín**.
- **BR-03 (Chế tài tài khoản vi phạm):** Nếu điểm uy tín của thành viên bị tụt về $\le 0$, tài khoản sẽ tự động chuyển sang trạng thái Đã khóa (`status = 'blocked'`) và bị chặn đăng bài/bình chọn ngay lập tức.
- **BR-04 (Thời hạn tồn tại sự cố):** Điểm ngập nước có thời hạn ban đầu mặc định **4 giờ**; điểm kẹt xe có thời hạn ban đầu mặc định **1 giờ**. Mỗi khi có thành viên bình chọn "Đúng", thời hạn sự cố được gia hạn thêm tương ứng (**+4 giờ** với ngập nước, **+2 giờ** với kẹt xe). Khi hết hạn, sự cố tự động chuyển sang trạng thái Đã kết thúc (`status = 'da_ket_thuc'`).
- **BR-05 (Bảo mật phiên làm việc):** Mật khẩu bắt buộc mã hóa băm bằng thuật toán an toàn Bcrypt. Không lưu trữ mật khẩu gốc dạng văn bản rõ.
- **BR-06 (Bảo mật tài khoản Google OAuth):** Theo quy chuẩn an toàn của Google, mật khẩu Gmail cá nhân không được chia sẻ cho ứng dụng. Tài khoản đăng ký qua Google được cấp mật khẩu băm ngẫu nhiên trong CSDL. Người dùng có thể đăng nhập 1 chạm với Google, hoặc sử dụng chức năng "Quên mật khẩu" để tạo mật khẩu đăng nhập trực tiếp bằng Username/Password thông thường.

---

## 3. Yêu cầu chức năng (Functional Requirements - FR)

### FR-01. Bản đồ trực quan, Định vị GPS & Tìm kiếm địa điểm

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-01.1** | Hệ thống khởi tạo bản đồ số tương tác toàn màn hình (Leaflet.js) tại trung tâm thành phố Nha Trang (tọa độ mặc định `[12.2458, 109.1943]`, mức zoom mặc định 14). |
| **FR-01.2** | Tự động kích hoạt tính năng định vị GPS để xác định tọa độ người dùng, lưu tọa độ gần nhất vào bộ nhớ trình duyệt (LocalStorage). |
| **FR-01.3** | Nút "Vị trí GPS của bạn" đưa tầm nhìn bản đồ cận cảnh về vị trí người dùng (mức phóng to zoom 16.5). |
| **FR-01.4** | Người dùng có thể click hoặc chạm vào bất kỳ vị trí nào trên bản đồ để chọn tọa độ gửi báo cáo sự cố (ghim biểu tượng đánh dấu vị trí chọn). |
| **FR-01.5** | Cụm nút điều khiển nổi ở góc phải: Phóng to (+), Thu nhỏ (-), Định vị GPS, Bật/Tắt Radar mưa. |
| **FR-01.6** | **Tìm kiếm địa điểm & đường phố:** Tích hợp thanh tìm kiếm trên đỉnh bản đồ. Sử dụng Photon Geocoding API (hỗ trợ CORS mượt mà, tự động ưu tiên bán kính Nha Trang qua tọa độ trọng tâm) kết hợp OpenStreetMap Nominatim dự phòng. |
| **FR-01.7** | **Gợi ý & Ghim kết quả tìm kiếm:** Hiển thị dropdown danh sách các kết quả gợi ý. Khi chọn một kết quả, bản đồ tự động bay (flyTo) đến vị trí với ghim màu tím nổi bật và mở Popup hiển thị thông tin địa chỉ. |
| **FR-01.8** | **Cảnh báo sự cố lân cận & Báo nhanh:** Popup tìm kiếm tự động kiểm tra bán kính 300m: nếu có sự cố ngập/kẹt xe sẽ hiển thị cảnh báo đỏ; nếu thông thoáng sẽ hiển thị thông báo xanh; cung cấp nút "Báo sự cố tại địa điểm này" tự động điền tọa độ và tên đường vào form báo cáo. |

---

### FR-02. Hiển thị sự cố, Ảnh hiện trường & Lọc dữ liệu thời gian thực

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-02.1** | Điểm cảnh báo ngập nước hiển thị dưới dạng icon sóng màu xanh dương kèm hiệu ứng xung động lan tỏa (`pulse-marker-flood`). |
| **FR-02.2** | Điểm cảnh báo kẹt xe hiển thị dưới dạng icon xe ô tô màu cam đỏ kèm hiệu ứng xung động lan tỏa (`pulse-marker-traffic`). |
| **FR-02.3** | **Popup thông tin sự cố:** Khi click vào một điểm ghim, hệ thống hiển thị Popup chứa: Loại sự cố (Huy hiệu), Địa chỉ, Mức độ, Ảnh hiện trường thực tế (nếu có), Mô tả chi tiết, Người báo, Thời gian và 2 nút bình chọn (👍 Đúng / 👎 Đã hết). Cho phép click vào ảnh để phóng to ảnh gốc trong tab mới. |
| **FR-02.4** | Thanh trạng thái ở giữa trên hiển thị tổng số điểm cảnh báo đang hoạt động kèm số lượng vùng nguy hiểm. |
| **FR-02.5** | Bộ lọc sự cố: Cho phép chuyển đổi giữa "Tất cả sự cố", "Chỉ báo ngập", hoặc "Chỉ kẹt xe". Bản đồ cập nhật marker tức thì. |
| **FR-02.6** | Tự động làm mới dữ liệu ngầm từ máy chủ theo chu kỳ **25 giây/lần** mà không làm gián đoạn tương tác người dùng. |
| **FR-02.7** | Tự động quét và chuyển trạng thái các tin báo đã quá thời hạn `expires_at` sang `da_ket_thuc` trước khi trả dữ liệu về bản đồ. |

---

### FR-03. Gom cụm vùng nguy hiểm & Cảnh báo dự báo thông minh

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-03.1** | **Gom cụm vùng cảnh báo:** Khi một khu vực có từ **6 điểm sự cố trở lên** trong bán kính cố định **150 mét**, hệ thống tự động gộp thành một Vùng cảnh báo nguy hiểm hình tròn. |
| **FR-03.2** | Tâm vùng cảnh báo hiển thị huy hiệu tổng số điểm sự cố kèm emoji đại diện (🌊 nếu phần lớn là ngập, 🚦 nếu phần lớn là kẹt xe). |
| **FR-03.3** | Popup vùng cảnh báo liệt kê danh sách tóm tắt các điểm ngập/kẹt xe bên trong (kèm ảnh hiện trường thu nhỏ nếu có) và cung cấp nút "Tách xem từng chấm". |
| **FR-03.4** | **Thời tiết thời gian thực:** Tự động lấy nhiệt độ và trạng thái thời tiết thời gian thực tại Nha Trang qua Open-Meteo API để hiển thị lên thanh trạng thái. |
| **FR-03.5** | **Radar mây mưa RainViewer:** Cho phép bật/tắt lớp phủ vệ tinh radar mây mưa thời gian thực trực tiếp trên bản đồ số. |
| **FR-03.6** | **Dự báo vùng ngập khi mưa:** Khi phát hiện thời tiết đang mưa (hoặc khi bật radar mưa), hệ thống tự động tải lịch sử dữ liệu 30 ngày và kích hoạt các vùng hay ngập (vòng tròn nét đứt màu xanh) tại các khu vực từng có trên 5 lần báo ngập. Các vùng này sẽ tự động ẩn khi trời tạnh mưa hoặc tự động biến mất nếu điểm ngập gần nhất đã cách đây trên 20 ngày (đã được sửa chữa hạ tầng). |
| **FR-03.7** | **Dự báo vùng kẹt xe giờ cao điểm:** Hệ thống tự động kiểm tra giờ thực tế; nếu rơi vào các khung giờ cao điểm (06:30–08:30, 11:00–12:30, 16:30–19:00), hệ thống tự động hiển thị các vùng hay kẹt xe (nét đứt màu cam) dựa trên dữ liệu lịch sử 30 ngày. Vùng kẹt xe tự động biến mất khi hết giờ cao điểm hoặc nếu điểm kẹt xe gần nhất đã cách đây trên 30 ngày (đã phân luồng ổn định). |

---

### FR-04. Báo cáo sự cố mới từ cộng đồng

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-04.1** | Chỉ thành viên đã đăng nhập mới được mở biểu mẫu gửi báo cáo sự cố. Khách chưa đăng nhập sẽ nhận được thông báo chuyển sang màn hình Đăng nhập. |
| **FR-04.2** | Biểu mẫu gồm quy trình **3 bước chạm trực quan**: |
| | - **Bước 1 (Loại sự cố):** Chọn giữa "Ngập lụt" hoặc "Kẹt xe". |
| | - **Bước 2 (Ước lượng mức độ trực quan):**<br>• *Nếu là ngập lụt:* Mắt cá chân (~10-15cm - Mức nhẹ) / Nửa bánh xe máy (~20-25cm - Nguy hiểm) / Ngập ống xả-yên xe (>40-50cm - Chết máy hoàn toàn).<br>• *Nếu là kẹt xe:* Di chuyển chậm (15-25 km/h) / Ùn ứ nặng (5-15 km/h) / Tắc nghẽn bất động (<5 km/h). |
| | - **Bước 3 (Vị trí & Hiện trường):** Tọa độ GPS (tự động lấy từ điểm chạm trên bản đồ), Địa chỉ/tên đường (tối đa 255 ký tự), Mô tả bổ sung (tùy chọn), Tải ảnh hiện trường thực tế (tùy chọn). |
| **FR-04.3** | Chặn gửi dữ liệu nếu thiếu tọa độ hoặc tọa độ ngoài phạm vi hợp lệ ($lat \notin [-90, 90]$ hoặc $lng \notin [-180, 180]$ hoặc `lat=0, lng=0`). |
| **FR-04.4** | **Xử lý upload ảnh:** Chấp nhận định dạng `jpg`, `png`, `webp`, `gif`, dung lượng tối đa **5MB**. Tự động sinh tên file ngẫu nhiên chống trùng lặp và lưu vào `public/images/reports/`. |
| **FR-04.5** | Gửi form ngầm qua API (Fetch AJAX), không tải lại trang. Khi thành công, hiển thị Toast xanh, đóng form, tự động reset lựa chọn về mặc định và ghim ngay điểm mới lên bản đồ. |

---

### FR-05. Bình chọn xác nhận & Cơ chế chống tin giả

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-05.1** | Trên popup của mỗi điểm sự cố, thành viên có thể nhấn **"👍 Đúng"** (`confirm`) hoặc **"👎 Đã hết"** (`reject`). |
| **FR-05.2** | Yêu cầu đăng nhập tài khoản để thực hiện bình chọn. |
| **FR-05.3** | Chặn tác giả không được tự bình chọn cho báo cáo do chính mình tạo ra (HTTP 403). |
| **FR-05.4** | Hỗ trợ đổi bình chọn: Nếu đã vote "Đúng" mà chuyển sang "Đã hết" (hoặc ngược lại), hệ thống tự động trừ 1 phiếu ở cột cũ và cộng 1 phiếu ở cột mới trong cùng một Transaction CSDL. |
| **FR-05.5** | Khi bình chọn "Đúng", thời hạn hết hạn (`expires_at`) của sự cố được gia hạn thêm tính từ thời điểm bấm (+4 giờ đối với ngập nước, +2 giờ đối với kẹt xe). |
| **FR-05.6** | Áp dụng quy tắc **BR-02**: Khi $(reject\_count - confirm\_count) \ge 3$, sự cố tự động chuyển sang trạng thái `bi_an` và tự động trừ **1 điểm uy tín** của người đăng tin. |
| **FR-05.7** | Áp dụng quy tắc **BR-03**: Khi điểm uy tín của thành viên bị trừ về $\le 0$, tài khoản tự động bị khóa (`status = 'blocked'`). |

---

### FR-06. Đăng ký & Xác thực tài khoản qua Email OTP

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-06.1** | Người dùng đăng ký tài khoản với các trường: Họ và tên, Tên đăng nhập (username: 3-30 ký tự, không dấu cách), Email, Mật khẩu ($\ge 6$ ký tự), Nhập lại mật khẩu, Hộp kiểm đồng ý Điều khoản & Chính sách. |
| **FR-06.2** | Kiểm tra trùng lặp email thời gian thực ngay khi người dùng nhập trên form đăng ký. |
| **FR-06.3** | Mật khẩu xác nhận phải khớp 100% với mật khẩu đã nhập. |
| **FR-06.4** | Khi thông tin hợp lệ, hệ thống tạo mã OTP gồm 6 chữ số ngẫu nhiên, lưu vào bảng `email_otps` với thời hạn **15 phút**. |
| **FR-06.5** | Gửi email chứa mã OTP đến hòm thư người dùng qua giao thức SMTP (hỗ trợ ghi log dự phòng tại `storage/mail_logs.txt`). |
| **FR-06.6** | Chuyển sang màn hình nhập mã OTP. Người dùng nhập đúng 6 chữ số $\rightarrow$ tài khoản được tạo chính thức (`is_verified = 1`), khởi tạo **10 điểm uy tín** và tự động đăng nhập. |
| **FR-06.7** | Hỗ trợ nút "Gửi lại mã OTP" nếu chưa nhận được mã trong hòm thư. |

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
| **FR-08.4** | Nếu email Google chưa tồn tại: Tự động khởi tạo tài khoản mới với họ tên, email, avatar, cấp trạng thái `is_verified = 1`, 10 điểm uy tín và đăng nhập ngay lập tức. |
| **FR-08.5** | Tài khoản tạo qua Google có thể tạo mật khẩu riêng thông qua chức năng "Quên mật khẩu" để sau đó đăng nhập song song bằng cả 2 phương thức. |

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
| **FR-11.2** | Mỗi báo cáo hiển thị: Loại sự cố, Địa chỉ, Trạng thái (Đang diễn ra, Đã kết thúc, Bị ẩn), Số lượt vote 👍/👎, ảnh hiện trường (nếu có) và thời gian gửi. |
| **FR-11.3** | Click vào một báo cáo trong danh sách sẽ tự động đóng sidebar và di chuyển tâm bản đồ tới vị trí đó. |
| **FR-11.4** | Cung cấp chức năng Đổi mật khẩu trong mục "Hồ sơ & Bảo mật": Yêu cầu nhập mật khẩu cũ, mật khẩu mới ($\ge 6$ ký tự) và xác nhận mật khẩu mới. |

---

### FR-12. Quản trị hệ thống (Admin Dashboard)

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-12.1** | Chặn toàn bộ người dùng không có vai trò `admin` truy cập vào trang `index.php?route=admin_dashboard` (tự động chuyển hướng về trang chủ). |
| **FR-12.2** | **Thống kê tổng quan:** Hiển thị 3 thẻ số liệu tổng hợp: Tổng số tài khoản người dùng, Số tài khoản người dùng đang hoạt động, và số sự cố đang diễn ra. |
| **FR-12.3** | **Quản lý tài khoản người dùng:** Hiển thị bảng danh sách thành viên gồm: ID, Tên đăng nhập, Họ tên, Email, Vai trò, Điểm uy tín, Số đóng góp báo cáo, Trạng thái hoạt động, Ngày tham gia. |
| **FR-12.4** | Tìm kiếm thành viên theo từ khóa (username, họ tên, email); lọc theo vai trò (User/Admin) và trạng thái (Hoạt động/Đã khóa). |
| **FR-12.5** | Thao tác trên tài khoản: Khóa tài khoản (`block`), Mở khóa tài khoản (`unblock` - tự động khôi phục 10 điểm uy tín), Đổi quyền (`set_role` User $\leftrightarrow$ Admin), Điều chỉnh điểm uy tín (`set_score`: 0–100), Xóa tài khoản (`delete`). Chặn không cho Admin tự khóa hoặc tự xóa tài khoản của chính mình. |
| **FR-12.6** | **Quản lý sự cố:** Xem bảng danh sách toàn bộ sự cố trong hệ thống. Cung cấp các nút thao tác nhanh: Xác thực báo cáo (+5 vote), Ẩn sự cố vi phạm (`bi_an`), Khôi phục sự cố (`dang_dien_ra`), Đóng sự cố (`da_ket_thuc`). |
| **FR-12.7** | **Xuất báo cáo Excel/CSV:** Xuất toàn bộ dữ liệu sự cố ra tệp CSV kèm mã UTF-8 BOM hiển thị tiếng Việt chuẩn xác trong Microsoft Excel (`api/admin/export_reports.php`). |

---

### FR-13. Các tiện ích thông tin cộng đồng trên Sidebar

| Mã yêu cầu | Chi tiết yêu cầu |
|---|---|
| **FR-13.1** | **Chú giải chuẩn 4 cấp:** Mở sub-panel hiển thị quy chuẩn phân cấp độ ngập lụt (Cấp 1 Mắt cá $\rightarrow$ Cấp 4 Ngập lút xe) và mức độ kẹt xe (Di chuyển chậm $\rightarrow$ Tắc nghẽn tê liệt). |

---

## 4. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)

| Mã yêu cầu | Nhóm ràng buộc | Nội dung yêu cầu chi tiết |
|---|---|---|
| **NFR-01** | **Hiệu năng (Performance)** | Thời gian tải bản đồ và nạp toàn bộ danh sách điểm sự cố ban đầu $\le 2.0$ giây. Thời gian phản hồi của các API kiểm tra email, đăng nhập, vote $\le 500$ms. |
| **NFR-02** | **Bảo mật (Security)** | • Mật khẩu tài khoản phải được mã hóa băm bằng thuật toán Bcrypt.<br>• 100% câu truy vấn CSDL sử dụng Prepared Statements để chống tấn công SQL Injection.<br>• Làm sạch và escape dữ liệu đầu vào chống tấn công XSS.<br>• Cookie phiên Remember Me bắt buộc thiết lập cờ bảo vệ `HttpOnly` và `SameSite=Lax`. |
| **NFR-03** | **Tương thích (Compatibility)** | Giao diện tương thích hoàn hảo và hiển thị tốt trên các trình duyệt phổ biến: Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari. Chiều rộng màn hình hỗ trợ tối thiểu từ **360px** trở lên (thiết bị di động không bị vỡ layout hay xuất hiện thanh cuộn ngang trang). |
| **NFR-04** | **Độ tin cậy (Reliability)** | • Hoạt động ổn định 24/7.<br>• Các thao tác cập nhật dữ liệu quan trọng (bình chọn, đổi trạng thái) phải được bao bọc trong Transaction của MySQL InnoDB để đảm bảo toàn vẹn dữ liệu.<br>• Khi mất kết nối máy chủ gửi mail SMTP, hệ thống tự động ghi nhật ký dự phòng vào `storage/mail_logs.txt` để không làm gián đoạn luồng đăng ký của người dùng. |
| **NFR-05** | **Khả năng sử dụng (Usability)** | Toàn bộ giao diện, thông báo lỗi và hướng dẫn sử dụng bằng tiếng Việt có dấu. Hệ thống icon trực quan (Phosphor Icons) giúp người dùng dễ dàng thao tác bằng 1 tay trên điện thoại. |

---

## 5. Mô hình quy tắc nghiệp vụ (Behavioral Models)

### 5.1. Máy trạng thái vòng đời Sự cố (State Machine ST-01)
Thực thể: `reports` · 3 trạng thái $\times$ 4 sự kiện

| Trạng thái hiện tại | Hết thời gian (`expires_at`) | Bị báo sai $\ge 3$ phiếu | Admin Xác thực / Mở lại | Admin Ẩn / Đóng sự cố |
|---|:---:|:---:|:---:|:---:|
| **Đang diễn ra (`dang_dien_ra`)** | $\rightarrow$ Đã kết thúc | $\rightarrow$ Bị ẩn | — | $\rightarrow$ Bị ẩn / Đã kết thúc |
| **Đã kết thúc (`da_ket_thuc`)** | — | — | $\rightarrow$ Đang diễn ra | — |
| **Bị ẩn (`bi_an`)** | — | — | $\rightarrow$ Đang diễn ra | — |

*Ghi chú: Dấu "—" biểu thị chuyển đổi trạng thái không hợp lệ.*

---

### 5.2. Bảng quyết định kiểm duyệt sự cố & Xử lý điểm uy tín (Decision Table DT-01)
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
| **MSG-013** | Cảnh báo / Hướng dẫn | "Tài khoản này đăng ký qua Google nên chưa có mật khẩu riêng. Vui lòng bấm 'Đăng nhập với Google' hoặc bấm 'Quên mật khẩu?' để tạo mật khẩu đăng nhập trực tiếp!" | Người dùng nhập mật khẩu trực tiếp vào tài khoản tạo qua Google |
| **MSG-014** | Thành công | "Đã đăng xuất thành công!" | Thực hiện đăng xuất tài khoản |
| **MSG-015** | Thành công | "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới." | Hoàn tất quy trình quên và đặt lại mật khẩu |
| **MSG-016** | Cảnh báo | "⚠️ Cảnh báo: Có [loại sự cố] cách bạn [khoảng cách]!" | Sự cố lọt vào bán kính an toàn 500m của GPS |
