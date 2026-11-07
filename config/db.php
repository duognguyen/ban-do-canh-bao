<?php
// define('DB_HOST', 'sql102.infinityfree.com');
// define('DB_USER', 'if0_43369946');
// define('DB_PASS', '3p1Msm3iFm');
// define('DB_NAME', 'if0_43369946_traffic_map_db');
// define('DB_PORT', 3306);

// $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'traffic_map_db';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Kết nối cơ sở dữ liệu thất bại: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");

// Đồng bộ múi giờ Việt Nam
$conn->query("SET time_zone = '+07:00'");
?>
