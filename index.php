<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bản đồ Cảnh báo Điểm Ngập & Kẹt Xe</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; }
        #map { width: 100vw; height: 100vh; }
        
        /* Style cho popup bản đồ */
        .popup-content h4 { color: #d9534f; margin-bottom: 5px; }
        .popup-content p { font-size: 13px; margin: 3px 0; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: white; }
        .bg-ngap { background-color: #0275d8; }
        .bg-ketxe { background-color: #f0ad4e; }
    </style>
</head>
<body>

    <!-- Khung hiển thị bản đồ toàn màn hình -->
    <div id="map"></div>

    <!-- Thư viện Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <!-- Script xử lý bản đồ dự án -->
    <script src="public/js/map.js"></script>
</body>
</html>
