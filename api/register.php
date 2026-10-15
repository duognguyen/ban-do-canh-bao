<?php
// Tắt hiển thị lỗi HTML thô để bảo vệ cấu trúc JSON tuyệt đối
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/UserModel.php';

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Phương thức không hợp lệ!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Đọc dữ liệu từ cả FormData ($_POST) lẫn Raw JSON (php://input)
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = [];
}

// Dùng trim() cắt bỏ khoảng trắng thừa ở 2 đầu
$username         = trim($_POST['username'] ?? $input['username'] ?? '');
$email            = trim($_POST['email'] ?? $input['email'] ?? '');
$password         = trim($_POST['password'] ?? $input['password'] ?? '');
$confirm_password = trim($_POST['confirm_password'] ?? $input['confirm_password'] ?? '');

// 1. Kiểm tra rỗng
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Vui lòng điền đầy đủ thông tin!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Kiểm tra định dạng tên đăng nhập (3-30 ký tự, không dấu cách)
if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username)) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Tên đăng nhập từ 3-30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Kiểm tra định dạng Email chuẩn
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Địa chỉ Email không hợp lệ!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Kiểm tra độ dài mật khẩu & khớp mật khẩu xác nhận (nếu form có gửi confirm_password)
if (strlen($password) < 6) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Mật khẩu phải có ít nhất 6 ký tự!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!empty($confirm_password) && $password !== $confirm_password) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Mật khẩu xác nhận không khớp!'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/** @var mysqli $conn */
$userModel = new UserModel($conn);

// 5. Thực thi đăng ký và bọc try...catch chống lỗi Fatal Error khi trùng tài khoản
try {
    if ($userModel->register($username, $email, $password)) {
        echo json_encode([
            'status'   => 'success',
            'message'  => 'Đăng ký tài khoản thành công!',
            'redirect' => 'index.php?route=login'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Tên đăng nhập hoặc email đã tồn tại!'
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (mysqli_sql_exception $e) {
    // Mã lỗi 1062 của MySQL chính là lỗi Duplicate entry (Trùng username hoặc email)
    if ($e->getCode() === 1062) {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Tên đăng nhập hoặc email đã tồn tại!'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Lỗi cơ sở dữ liệu: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}