<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "traffic_map_db";
$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    die("Connectiom failed: " . mysqli_conect_error());
}
if ($conn) {
    echo "<br> <b>Ket noi thanh cong</b> <br>";
}
?>
