<?php
// index.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$route = $_GET['route'] ?? 'home';

// ==============================================================================
// 1. ĐIỀU HƯỚNG TRANG QUẢN TRỊ (Phần của Thành viên 3 - Admin)
// ==============================================================================
if (strpos($route, 'admin') === 0) {
    require_once __DIR__ . '/controllers/AdminController.php';
    $admin = new AdminController();

<<<<<<< Updated upstream
    switch ($route) {
        case 'admin_login':
            $admin->login();
            break;
        case 'admin_logout':
            $admin->logout();
            break;
        case 'admin_dashboard':
            $admin->dashboard();
            break;
        case 'admin_users':
            $admin->users();
            break;
        case 'admin_reports':
            $admin->reports();
            break;
        default:
            $admin->login();
            break;
    }
    exit;
=======
    // 2. TRANG ĐĂNG KÝ
    case 'register':
        if (isset($_SESSION['user_id'])) {
            header('Location: index.php?route=home');
            exit;
        }
        require_once __DIR__ . '/views/auth/register.php';
        exit;

    // 3. ĐĂNG XUẤT (Đã cấu hình chuyển hướng an toàn tuyệt đối)
    case 'logout':
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION = [];
        session_destroy();
        
        if (file_exists(__DIR__ . '/api/logout.php')) {
            require_once __DIR__ . '/api/logout.php';
        } else {
            header('Location: index.php?route=home');
        }
        exit;

    // 4. TRANG QUẢN TRỊ VIÊN (ADMIN DASHBOARD)
    case 'admin_dashboard':
    case 'admin':
        if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
            header('Location: index.php?route=admin_login');
            exit;
        }
        
        if (file_exists(__DIR__ . '/controllers/AdminController.php')) {
            require_once __DIR__ . '/controllers/AdminController.php';
            $admin = new AdminController();
            if (method_exists($admin, 'dashboard')) {
                $admin->dashboard();
            } else {
                $admin->index();
            }
        } else {
            echo "<h2>Lỗi: Không tìm thấy AdminController.</h2>";
        }
        exit;

    // 5. XỬ LÝ CẬP NHẬT TRẠNG THÁI USER TỪ ADMIN
    case 'admin_update_status':
        if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
            header('Location: index.php?route=admin_login');
            exit;
        }
        if (file_exists(__DIR__ . '/controllers/AdminController.php')) {
            require_once __DIR__ . '/controllers/AdminController.php';
            $admin = new AdminController();
            if (method_exists($admin, 'updateUserStatus')) {
                $admin->updateUserStatus();
            }
        }
        exit;

    // 6. XỬ LÝ THÊM BÁO CÁO SỰ CỐ (PHP CONTROLLER)
    case 'report_add':
        require_once __DIR__ . '/controllers/ReportController.php';
        $reportCtrl = new ReportController();
        $reportCtrl->add();
        exit;

    // 7. MẶC ĐỊNH: HIỂN THỊ BẢN ĐỒ CÔNG CỘNG
    case 'home':
    default:
        break;
>>>>>>> Stashed changes
}

// ==============================================================================
// 2. GIAO DIỆN BẢN ĐỒ NGƯỜI DÙNG (Phần của Thành viên 2)
// ==============================================================================
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bản đồ Cảnh Báo Ngập Nước & Kẹt Xe</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; }
        #map { width: 100vw; height: 100vh; }
        
        .popup-content h4 { color: #d9534f; margin-bottom: 5px; }
        .popup-content p { font-size: 13px; margin: 3px 0; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: white; }
        .bg-ngap { background-color: #0275d8; }
        .bg-ketxe { background-color: #f0ad4e; }

        .admin-link-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            z-index: 1000;
            background: #1e293b;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 13px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            transition: background 0.2s;
        }
        .admin-link-btn:hover {
            background: #334155;
            color: #38bdf8;
        }
    </style>
</head>
<body>
    <!-- Thanh trạng thái phía trên -->
    <div class="top-center-bar">
        <div class="pill">
            <span style="color:#ef4444;">●</span>
            <span id="reportCountBadge">Đang cập nhật...</span>
        </div>
        <?php if (isset($_SESSION['user_id']) && $_SESSION['role'] === 'admin'): ?>
            <a href="views/admin/dashboard.php" class="pill" style="text-decoration:none;">Quản trị Admin</a>
        <?php endif; ?>
    </div>

    <!-- Lối tắt nhanh vào trang Admin -->
    <a href="index.php?route=admin_login" class="admin-link-btn">Đăng nhập Admin &rarr;</a>

    <!-- Khung hiển thị bản đồ toàn màn hình -->
    <div id="map"></div>

    <button class="btn-report-fab" onclick="toggleReportSidebar(true)">+ Báo sự cố</button>

    <!-- Sidebar Báo sự cố -->
    <div class="sidebar-panel" id="reportSidebar">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3>Báo sự cố giao thông</h3>
            <button onclick="toggleReportSidebar(false)" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer;">✕</button>
        </div>

        <form id="reportForm" onsubmit="submitReport(event)" style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
            <label>Loại sự cố:</label>
            <select name="type" style="padding:8px; border-radius:6px; background:#27272a; color:white; border:1px solid #3f3f46;">
                <option value="ngap_nuoc">🌊 Ngập nước</option>
                <option value="ket_xe">🚦 Kẹt xe</option>
            </select>

            <label>Mức độ:</label>
            <select name="severity" style="padding:8px; border-radius:6px; background:#27272a; color:white; border:1px solid #3f3f46;">
                <option value="nhe">Nhẹ</option>
                <option value="vua">Vừa</option>
                <option value="nghiem_trong">Nghiêm trọng</option>
                <option value="cleared">✅ Đã hết / Bình thường trở lại</option>
            </select>

            <label>Địa chỉ:</label>
            <input type="text" name="address_text" placeholder="Nhập địa chỉ hoặc chạm lên bản đồ" style="padding:8px; border-radius:6px; background:#27272a; color:white; border:1px solid #3f3f46;" required>

            <label>Mô tả chi tiết:</label>
            <textarea name="description" rows="3" style="padding:8px; border-radius:6px; background:#27272a; color:white; border:1px solid #3f3f46;"></textarea>

            <input type="hidden" name="latitude" id="latInput">
            <input type="hidden" name="longitude" id="lngInput">

            <button type="submit" style="background:#0284c7; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:10px;">Gửi báo cáo</button>
        </form>
    </div>

    <!-- Scripts -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="public/js/map.js"></script>
    <script src="public/js/app.js"></script>
</body>
</html>