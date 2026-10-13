<?php
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

