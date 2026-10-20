<?php
// File: index.php
ini_set('display_errors', 0);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Lấy tham số điều hướng trên URL (mặc định là 'home' - Trang bản đồ)
$route = $_GET['route'] ?? 'home';

switch ($route) {
    // 1. TRANG ĐĂNG NHẬP (Cả Người dân & Admin)
    case 'login':
    case 'admin_login':
        if (isset($_SESSION['user_id'])) {
            $redirect = (($_SESSION['role'] ?? 'user') === 'admin') 
                ? 'index.php?route=admin_dashboard' 
                : 'index.php?route=home';
            header("Location: $redirect");
            exit;
        }
        if (file_exists(__DIR__ . '/views/auth/login.php')) {
            require_once __DIR__ . '/views/auth/login.php';
        } else {
            header('Location: index.php?route=home');
        }
        exit;

    // 2. TRANG ĐĂNG KÝ
    case 'register':
        if (isset($_SESSION['user_id'])) {
            header('Location: index.php?route=home');
            exit;
        }
        if (file_exists(__DIR__ . '/views/auth/register.php')) {
            require_once __DIR__ . '/views/auth/register.php';
        } else {
            header('Location: index.php?route=home');
        }
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
            } elseif (method_exists($admin, 'index')) {
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
}

// =========================================================================
// GIAO DIỆN BẢN ĐỒ CHÍNH (Chỉ chạy khi $route là 'home')
// =========================================================================
require_once __DIR__ . '/views/layout/header.php';
require_once __DIR__ . '/views/layout/sidebar.php';
?>

<!-- KHUNG HIỂN THỊ BẢN ĐỒ TOÀN MÀN HÌNH -->
<div class="main-content">
    <div id="map"></div>
</div>

<?php
require_once __DIR__ . '/views/layout/footer.php';
?>
