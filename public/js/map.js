// 1. Khởi tạo bản đồ Leaflet
const map = L.map('map').setView([12.24507, 109.19432], 13);

// 2. Load gạch bản đồ từ OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Hàm gọi API lấy danh sách điểm ngập/kẹt xe real-time
function loadReports() {
    fetch('api/get_reports.php')
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                res.data.forEach(report => {
                    const lat = parseFloat(report.latitude);
                    const lng = parseFloat(report.longitude);
                    
                    // Xác định màu sắc/loại cảnh báo
                    const isNgap = report.type === 'ngap_nuoc';
                    const typeText = isNgap ? 'Điểm Ngập Nước' : 'Điểm Kẹt Xe';
                    const badgeClass = isNgap ? 'bg-ngap' : 'bg-ketxe';

                    // Tạo Marker trên bản đồ
                    const marker = L.marker([lat, lng]).addTo(map);

                    // Nội dung khi bấm vào Marker
                    const popupHtml = `
                        <div class="popup-content">
                            <h4><span class="badge ${badgeClass}">${typeText}</span></h4>
                            <p><b>Địa chỉ:</b> ${report.address_text || 'Chưa cập nhật'}</p>
                            <p><b>Mức độ:</b> ${report.severity.toUpperCase()}</p>
                            <p><b>Mô tả:</b> ${report.description || 'Không có mô tả'}</p>
                            <p><b>Người báo:</b> ${report.username} (Uy tín: ${report.reputation_score})</p>
                            <hr>
                            <p>👍 Xác nhận: <b>${report.confirm_count}</b> | 👎 Báo sai: <b>${report.reject_count}</b></p>
                        </div>
                    `;
                    marker.bindPopup(popupHtml);
                });
            }
        })
        .catch(err => console.error('Lỗi nạp dữ liệu bản đồ:', err));
}

// Chạy hàm nạp dữ liệu ngay khi mở trang
loadReports();