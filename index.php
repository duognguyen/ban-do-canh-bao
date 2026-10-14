<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 1. Nhúng phần Header giao diện (thẻ head, css, thanh trạng thái, menu toggle)
require_once __DIR__ . '/views/layout/header.php';

// 2. Nhúng Sidebar điều hướng và Sub-panel tương tác
require_once __DIR__ . '/views/layout/sidebar.php';
?>

<!-- KHUNG HIỂN THỊ BẢN ĐỒ TOÀN MÀN HÌNH -->
<div class="main-content">
    <div id="map"></div>
</div>

<?php

require_once __DIR__ . '/views/layout/footer.php';
?>
