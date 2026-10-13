<?php
$host     = 'localhost';
$username = 'root';
$password = '';
$dbname   = 'traffic_map_db';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Kết nối CSDL thất bại: " . $conn->connect_error);
}else{
    echo "kesfsff";
}

$conn->set_charset("utf8mb4");
?>