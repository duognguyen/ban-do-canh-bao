<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'traffic_map_db';

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Thêm dòng này để sửa lỗi font tiếng Việt trả về dạng \u00...
$conn->set_charset("utf8mb4");
?>
