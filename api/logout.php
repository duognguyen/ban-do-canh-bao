<?php
// File: api/logout.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Xóa sạch session
$_SESSION = [];
session_destroy();

// Ép trình duyệt quay thẳng về trang bản đồ chính (Dùng đường dẫn tuyệt đối theo tên thư mục của bạn)
header('Location: /ban-do-canh-bao/index.php?route=home');
exit;
