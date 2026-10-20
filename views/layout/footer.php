    <!-- Cụm nút điều khiển bản đồ & Báo ngập ở góc phải dưới -->
    <div class="bottom-right-actions">
        <div class="map-controls">
            <button class="btn-control" onclick="zoomInMap()" title="Phóng to">
                <i class="ph-bold ph-plus"></i>
            </button>
            <button class="btn-control" onclick="zoomOutMap()" title="Thu nhỏ">
                <i class="ph-bold ph-minus"></i>
            </button>
<<<<<<< HEAD
            <button class="btn-control" onclick="locateUser(true)" title="Vị trí của bạn">
=======
            <button class="btn-control" onclick="locateUser(true, true)" title="Vị trí của bạn">
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
                <i class="ph-bold ph-crosshair"></i>
            </button>
        </div>
        <button class="btn-report" onclick="openReportSheet()">
            <i class="ph-bold ph-warning-circle" style="font-size: 1.25rem;"></i>
            <span>Báo sự cố</span>
        </button>
    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <!-- Trạng thái phiên đăng nhập của người dùng -->
    <script>
        const isLoggedIn = <?= isset($_SESSION['user_id']) ? 'true' : 'false'; ?>;
        const currentUsername = <?= isset($_SESSION['username']) ? json_encode($_SESSION['username']) : 'null'; ?>;
    </script>

<<<<<<< HEAD
    <!-- JS Bản đồ & Tương tác giao diện -->
=======
       <!-- API Client & JS Bản đồ -->
    <script src="public/js/api.js"></script>
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
    <script src="public/js/map.js"></script>
</body>
</html>
