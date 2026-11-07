# 🌊 UrbanGuard - Bản Đồ Cảnh Báo Điểm Ngập & Kẹt Xe Công Cộng Thời Gian Thực
> **Hệ thống giám sát giao thông đô thị và cảnh báo thiên tai thời gian thực dựa trên nền tảng bản đồ số GIS kết hợp dữ liệu đám đông (Crowdsourcing) tại TP. Nha Trang.**

🌐 **Website chính thức (Live Production):** [https://urbanguard-nhatrang.infinityfreeapp.com](https://urbanguard-nhatrang.infinityfreeapp.com)

---

## 📌 1. Giới thiệu tổng quan
**UrbanGuard** là giải pháp công nghệ trực tuyến hỗ trợ người dân và cơ quan quản lý đô thị nắm bắt tức thời tình trạng ngập lụt cục bộ do triều cường/mưa bão và các điểm ùn tắc giao thông giờ cao điểm. Nhờ sự kết hợp giữa bản đồ số mã nguồn mở, dữ liệu khí tượng Open-Meteo và cơ chế xác minh cộng đồng, hệ thống giúp người tham gia giao thông lựa chọn lộ trình an toàn, giảm thiểu thiệt hại về người và phương tiện.

---

## ✨ 2. Các tính năng cốt lõi

### 🗺️ Bản đồ số tương tác (GIS Interactive Map)
* **Trực quan hóa sự cố:** Hiển thị tức thời các điểm ngập nước (xanh dương) và kẹt xe (cam) với 4 cấp độ nghiêm trọng (Nhẹ $\rightarrow$ Nghiêm trọng) cùng ảnh chụp hiện trường.
* **Vùng nguy hiểm lịch sử:** Tự động tổng hợp và vẽ các vùng cảnh báo nguy hiểm tiềm tàng dựa trên mật độ sự cố trong quá khứ.
* **Thời tiết thời gian thực:** Đồng bộ nhiệt độ và icon thời tiết từ Open-Meteo API.
* **Radar định vị GPS 500m:** Quét vị trí thực tế của người dùng và phát cảnh báo rung/âm thanh khi tiến vào vùng nguy hiểm.
* **Tìm kiếm địa điểm thông minh:** Tích hợp Photon / OpenStreetMap API, tự động quét bán kính 300m quanh điểm tìm kiếm để đánh giá độ an toàn trước khi di chuyển.

### 📢 Quy trình Báo cáo 3 chạm & Kiểm duyệt tin giả (Crowdsourcing)
* **Báo cáo nhanh chóng:** Chỉ mất 10 giây để chọn loại sự cố, mức độ, định vị tọa độ và tải ảnh hiện trường.
* **Xác minh cộng đồng (Upvote/Downvote):** Người dân đi ngang qua có thể bấm *"Đúng vậy (+1)"* hoặc *"Đã hết / Báo sai (-1)"*.
* **Tự động lọc tin giả & Chế tài Điểm uy tín (Reputation Score):** Bài đăng nhận nhiều lượt báo sai sẽ tự động bị ẩn. Thành viên đăng tin giả bị trừ điểm uy tín, tin chính xác được thăng hạng thành viên tin cậy.
* **Cơ chế tự động hết hạn (Auto-expiry):** Sự cố tự động đóng sau 4 giờ (ngập nước) hoặc 1 giờ (kẹt xe) nếu không có lượt xác nhận mới.

### 🔐 Xác thực người dùng đa phương thức
* Đăng ký tài khoản với bảo mật 2 bước: Gửi mã xác thực **OTP 6 chữ số** về Gmail qua PHPMailer (SMTP).
* Đăng nhập 1 chạm bằng **Tài khoản Google** qua Google Identity Services & Firebase Auth SDK.
* Duy trì đăng nhập an toàn 30 ngày (*Remember Me*) qua Cookie mã hóa Token.

### 🛡️ Bảng điều khiển Quản trị viên (Admin Dashboard)
* Thống kê tổng quan: Số lượng thành viên, tài khoản đang hoạt động, sự cố đang diễn ra.
* Quản lý phân quyền (User/Admin), can thiệp điểm uy tín, khóa/mở khóa tài khoản spam.
* **Xuất báo cáo dữ liệu:** Hỗ trợ xuất toàn bộ lịch sử điểm ngập và kẹt xe ra tệp tin **Excel (.xls/csv)** phục vụ công tác quy hoạch đô thị.

### 📱 Thiết kế tối ưu Mobile Responsive 100%
* Bố cục 2 hàng thông minh trên di động (Hàng 1: Menu & Tìm kiếm; Hàng 2: Trạng thái, Thời tiết & Bộ lọc) không bao giờ bị đè chữ hay tràn viền màn hình.
* Menu quản trị dạng ngăn kéo trượt (Off-canvas Drawer) mượt mà trên màn hình cảm ứng.

---

## 🛠️ 3. Công nghệ sử dụng (Tech Stack)

* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript thuần (ES6+ Module), Leaflet.js 1.9+, Phosphor Icons.
* **Backend:** PHP 8.1+ xây dựng theo mô hình **MVC** (Model - View - Controller), RESTful API (JSON response).
* **Cơ sở dữ liệu:** MySQL / MariaDB (Prepared Statements chống SQL Injection).
* **Dịch vụ tích hợp bên thứ ba:**
  - *OpenStreetMap & CARTO Basemaps:* Bản đồ nền số hóa.
  - *Photon Komoot Geocoding:* Tìm kiếm đường và địa danh.
  - *Open-Meteo & RainViewer:* Dữ liệu thời tiết và mây mưa.
  - *Google Firebase Auth:* Đăng nhập tài khoản Google.
  - *PHPMailer:* Dịch vụ gửi thư điện tử kích hoạt OTP qua giao thức SMTP.
* **Hạ tầng Web Hosting:** Máy chủ Linux Apache, Cloud MySQL, chứng chỉ bảo mật SSL/HTTPS.

---

## 📁 4. Cấu trúc thư mục dự án

```text
ban-do-canh-bao/
├── api/                      # Các endpoint API RESTful (JSON)
│   ├── reports.php           # Lấy và tạo báo cáo sự cố
│   ├── vote.php              # Xử lý bình chọn xác minh cộng đồng
│   ├── check_email.php       # Kiểm tra trùng lặp email thời gian thực
│   ├── google_login.php      # Xử lý định danh Google Token
├── config/                   # Tệp tin cấu hình hệ thống
│   ├── db.php                # Kết nối CSDL MySQL qua mysqli
│   ├── mail.php              # Cấu hình SMTP Gmail gửi mã OTP
│   └── bootstrap.php         # Khởi tạo session và biến toàn cục
├── controllers/              # Bộ điều hướng nghiệp vụ (Controller)
│   ├── AuthController.php    # Nghiệp vụ tài khoản, OTP, Google Auth
│   ├── ReportController.php  # Nghiệp vụ sự cố, upload ảnh, tính điểm uy tín
│   └── AdminController.php   # Nghiệp vụ quản trị hệ thống
├── database/                 # Cơ sở dữ liệu
│   └── schema.sql            # Mã nguồn tạo bảng và dữ liệu mẫu
├── models/                   # Tương tác CSDL (Model)
│   ├── UserModel.php         # Truy vấn bảng users
│   └── ReportModel.php       # Truy vấn bảng reports, report_votes
├── public/                   # Tài nguyên tĩnh phía Client
│   ├── css/style.css         # Bảng định kiểu CSS & Responsive Mobile
│   ├── js/
│   │   ├── map.js            # Khởi tạo bản đồ, GPS, tìm kiếm, marker
│   │   ├── api.js            # Thư viện gọi AJAX/Fetch API
│   │   ├── firebase-auth.js  # Tích hợp Firebase Google Sign-In
│   │   ├── radar-weather.js  # Widget thời tiết & radar mưa
│   │   └── sidebar-ui.js     # Điều khiển mở/đóng menu trượt
│   └── images/               # Thư mục lưu ảnh hiện trường tải lên
├── views/                    # Giao diện ứng dụng (View)
│   ├── admin/dashboard.php   # Bảng điều khiển quản trị viên
│   ├── layout/header.php     # Thanh điều hướng đỉnh & tìm kiếm
│   ├── layout/sidebar.php    # Thanh danh mục tính năng bên trái
│   └── ...
└── index.php                 # Bộ định tuyến trung tâm (Front Controller)
```

---

## 💻 5. Hướng dẫn cài đặt cục bộ (Local Setup)

### Yêu cầu hệ thống:
* Đã cài đặt gói **XAMPP** (hỗ trợ PHP 8.1 trở lên và MySQL).
* Trình duyệt web hiện đại: Chrome, Edge, Firefox, Safari.

### Các bước thiết lập:
1. **Tải mã nguồn:**
   Đặt toàn bộ thư mục dự án vào thư mục gốc của máy chủ web:  
   `C:\xampp\htdocs\ban-do-canh-bao`

2. **Cấu hình Cơ sở dữ liệu:**
   - Khởi động **Apache** và **MySQL** trên phần mềm XAMPP Control Panel.
   - Mở trình duyệt truy cập: `http://localhost/phpmyadmin/`
   - Tạo mới một CSDL có tên: `ban_do_canh_bao` (bảng mã `utf8mb4_unicode_ci`).
   - Chọn CSDL vừa tạo $\rightarrow$ Bấm tab **Import** (Nhập) $\rightarrow$ Chọn tệp tin `database/schema.sql` $\rightarrow$ Bấm **Execute**.

3. **Kiểm tra thông số kết nối (`config/db.php`):**
   ```php
   $host = 'localhost';
   $user = 'root';
   $pass = '';
   $db   = 'ban_do_canh-bao';
   ```

4. **Khởi chạy ứng dụng:**
   - Mở trình duyệt và truy cập: `http://localhost/ban-do-canh-bao/`

---

## 🔑 6. Tài khoản thử nghiệm mặc định

| Vai trò (Role) | Tên đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin_super` | `123456` | Toàn quyền quản trị, xóa bài, khóa tài khoản, xuất Excel |
| **Người dùng (Member)** | Đăng ký mới hoặc bấm **Đăng nhập bằng Google** | - | Báo cáo sự cố, bình chọn kiểm chứng, theo dõi GPS |

---

## 👥 7. Nhóm tác giả thực hiện
* **Sinh viên thực hiện:**
  - **guyễn Thái Dương** 
  - **Nguyễn Quốc Khánh** 
  - **Lê Quốc Anh**
  - **Ngô Tấn Thiện**
* **Giảng viên hướng dẫn:** Thầy/Cô `Nguyễn Hải Triểu`
* **Đơn vị:** Khoa Công nghệ Thông tin – Trường Đại học Nha Trang

---
*Dự án được xây dựng vì mục tiêu phi thương mại, đóng góp cho cộng đồng giao thông văn minh và an toàn.*

## 📄 Giấy phép (License)
Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Chi tiết xem tại tệp tin [LICENSE](LICENSE).