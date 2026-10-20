<?php
<<<<<<< HEAD
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';
require_once '../models/UserModel.php';

$input = json_decode(file_get_contents('php://input'), true);
$username = $_POST['username'] ?? $input['username'] ?? '';
$email = $_POST['email'] ?? $input['email'] ?? '';
$password = $_POST['password'] ?? $input['password'] ?? '';

//Kiem tra dau vao
if(empty($username) || empty($email) || empty($password)){
    echo json_encode(['status' => 'error', 'message' => 'Vui lòng điền đầy đủ thông tin!']);
    exit;
}

/** @var mysqli $conn */ 
$userModel = new UserModel($conn);

if($userModel->register($username, $email, $password)){
    echo json_encode(['status' => 'success', 'message' => 'Đăng kí tài khoản thành công']);
} else{
    echo json_encode(['status' => 'error', 'message' => 'Tên đăng nhập hoặc email đã tồn tại']);
}
?>

=======
// POST /api/register.php  { username, email, password, confirm_password? }
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../controllers/AuthController.php';

require_method('POST');
respond((new AuthController($conn))->register(get_input()), 201);
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
