<?php
// ==========================================================================
// Kiểm tra đăng nhập / phân quyền cho API
// Luôn đối chiếu CSDL để tài khoản bị khóa có hiệu lực ngay lập tức.
// ==========================================================================
require_once __DIR__ . '/../models/UserModel.php';

/** Bắt buộc đăng nhập. Trả về dòng user từ DB, nếu không hợp lệ thì dừng với 401/403. */
function require_login(): array
{
    global $conn;

    if (empty($_SESSION['user_id'])) {
        json_error('Vui lòng đăng nhập', 401);
    }

    $user = (new UserModel($conn))->findById((int)$_SESSION['user_id']);
    if (!$user) {
        $_SESSION = [];
        json_error('Phiên đăng nhập không còn hợp lệ', 401);
    }
    if ($user['status'] !== UserModel::STATUS_ACTIVE) {
        $_SESSION = [];
        json_error('Tài khoản của bạn đã bị khóa', 403);
    }
    return $user;
}

/** Bắt buộc quyền admin. */
function require_admin(): array
{
    $user = require_login();
    if ($user['role'] !== 'admin') {
        json_error('Bạn không có quyền thực hiện thao tác này', 403);
    }
    return $user;
}

