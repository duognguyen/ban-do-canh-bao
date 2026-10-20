<?php
// Bật session an toàn, tránh lỗi Notice nếu session đã tồn tại
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Tắt hiển thị lỗi HTML thô ra màn hình để không làm hỏng cấu trúc JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Dùng __DIR__ để đường dẫn chính xác tuyệt đối 100% ở mọi nơi
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/UserModel.php';

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Phương thức truy cập không hợp lệ!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Đọc dữ liệu linh hoạt từ cả FormData ($_POST) lẫn Raw JSON (php://input)
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = [];
}

// Lấy dữ liệu và cắt khoảng trắng thừa ở 2 đầu bằng trim()
$username_or_email = trim($_POST['username_or_email'] ?? $input['username_or_email'] ?? $_POST['account'] ?? $input['account'] ?? '');
$password          = trim($_POST['password'] ?? $input['password'] ?? '');
$login_type        = trim($_POST['login_type'] ?? $input['login_type'] ?? ''); // Tùy chọn: 'admin' hoặc 'user'

// 1. Kiểm tra rỗng
if (empty($username_or_email) || empty($password)) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Vui lòng điền đầy đủ tài khoản và mật khẩu!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $userModel = new UserModel($conn);
    $user = $userModel->login($username_or_email, $password);

    if ($user) {
        // Lấy thông tin an toàn (Tránh lỗi Undefined array key nếu DB thiếu cột)
        $status           = $user['status'] ?? 'active';
        $role             = $user['role'] ?? 'user';
        $reputation_score = isset($user['reputation_score']) ? (int)$user['reputation_score'] : 100;

        // 2. Kiểm tra tài khoản có bị khóa hoặc hết điểm uy tín không
        if ($status === 'blocked' || $status === 0 || $status === '0' || $reputation_score <= 0) {
            echo json_encode([
                'status'  => 'error',
                'message' => 'Tài khoản của bạn đã bị khóa do vi phạm điểm uy tín!'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 3. Kiểm tra phân quyền (Nếu đăng nhập từ cổng Admin mà tài khoản chỉ là user thường)
        if ($login_type === 'admin' && $role !== 'admin') {
            echo json_encode([
                'status'  => 'error',
                'message' => 'Truy cập bị từ chối! Tài khoản không có quyền Quản trị viên (Admin).'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 4. Làm mới Session ID để chống tấn công Session Fixation
        session_regenerate_id(true);

        // Lưu thông tin vào SESSION
        $_SESSION['user_id']          = (int)$user['id'];
        $_SESSION['username']         = $user['username'];
        $_SESSION['email']            = $user['email'] ?? '';
        $_SESSION['role']             = $role;
        $_SESSION['reputation_score'] = $reputation_score;

        // 5. Xác định đường dẫn chuyển hướng tự động theo quyền (role)
        $redirect_url = ($role === 'admin') 
            ? 'index.php?route=admin_dashboard' 
            : 'index.php?route=home';

        echo json_encode([
            'status'   => 'success',
            'message'  => 'Đăng nhập thành công!',
            'redirect' => $redirect_url,
            'user'     => [
                'id'               => (int)$user['id'],
                'username'         => $user['username'],
                'email'            => $user['email'] ?? '',
                'role'             => $role,
                'reputation_score' => $reputation_score
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Tài khoản hoặc mật khẩu không chính xác!'
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Lỗi xử lý hệ thống: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
