<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';
require_once '../models/UserModel.php';
$input = json_decode(file_get_contents('php://input'), true);
$username_or_email = $_POST['username_or_email'] ?? $input['username_or_email'] ?? '';
$password = $_POST['password'] ?? $input['password'] ?? '';

if (empty($username_or_email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Vui lòng điền tài khoản và mật khẩu!']);
    exit;
}

$userModel = new UserModel($conn);
$user = $userModel->login($username_or_email, $password);

if ($user) {
    // 2. Kiểm tra tài khoản có bị khóa không
    if ($user['status'] === 'blocked') {
        echo json_encode(['status' => 'error', 'message' => 'Tài khoản của bạn đã bị khóa do vi phạm điểm uy tín!']);
        exit;
    }

    // 3. Đăng nhập thành công -> Lưu thông tin vào SESSION
    $_SESSION['user_id']          = $user['id'];
    $_SESSION['username']         = $user['username'];
    $_SESSION['role']             = $user['role'];
    $_SESSION['reputation_score'] = $user['reputation_score'];

    echo json_encode([
        'status'  => 'success',
        'message' => 'Đăng nhập thành công!',
        'user'    => [
            'id'               => $user['id'],
            'username'         => $user['username'],
            'role'             => $user['role'],
            'reputation_score' => $user['reputation_score']
        ]
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Tài khoản hoặc mật khẩu không chính xác!']);
}

?>