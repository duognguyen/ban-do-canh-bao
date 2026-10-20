<?php
<<<<<<< HEAD
=======
// File: index.php
ini_set('display_errors', 0);
error_reporting(E_ALL);

>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

<<<<<<< HEAD
// 1. Nhúng phần Header giao diện (thẻ head, css, thanh trạng thái, menu toggle)
require_once __DIR__ . '/views/layout/header.php';

// 2. Nhúng Sidebar điều hướng và Sub-panel tương tác
=======
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

        // 3. ĐĂNG XUẤT (Xóa session sạch sẽ và chuyển hướng về trang chủ)
    case 'logout':
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
        header('Location: index.php?route=home');
        exit;
    // 4. TRANG QUẢN TRỊ VIÊN (ADMIN DASHBOARD)
        // 4. TRANG QUẢN TRỊ VIÊN (ADMIN DASHBOARD)
    case 'admin_dashboard':
    case 'admin':
        if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
            header('Location: index.php?route=home');
            exit;
        }
        
        if (file_exists(__DIR__ . '/views/admin/dashboard.php')) {
            require_once __DIR__ . '/views/admin/dashboard.php';
        } else {
            echo "<h2>Lỗi: Không tìm thấy giao diện Admin Dashboard.</h2>";
        }
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
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
require_once __DIR__ . '/views/layout/sidebar.php';
?>

<!-- KHUNG HIỂN THỊ BẢN ĐỒ TOÀN MÀN HÌNH -->
<div class="main-content">
    <div id="map"></div>
</div>

<?php
<<<<<<< HEAD

=======
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
require_once __DIR__ . '/views/layout/footer.php';
?>
