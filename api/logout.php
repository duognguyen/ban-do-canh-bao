<?php
<<<<<<< HEAD
session_start();
session_unset();
session_destroy();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'success', 'message' => 'Đã đăng xuất thành công!']);
?>
=======
// POST /api/logout.php
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../controllers/AuthController.php';

require_method('POST', 'GET');
respond((new AuthController($conn))->logout());
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
