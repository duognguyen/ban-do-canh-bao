<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'traffic_map_db';

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
<<<<<<< HEAD
=======
    // Nếu đang chạy trong API (đã nạp response.php) thì trả JSON, ngược lại in chuỗi lỗi
    if (function_exists('json_error')) {
        error_log('DB connect error: ' . $conn->connect_error);
        json_error('Không kết nối được cơ sở dữ liệu', 500);
    }
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
    die("Connection failed: " . $conn->connect_error);
}

// Thêm dòng này để sửa lỗi font tiếng Việt trả về dạng \u00...
$conn->set_charset("utf8mb4");
?>
