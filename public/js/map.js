/**
 * MAP.JS - Xử lý bản đồ số Leaflet.js & Các điểm đánh dấu cảnh báo
 */

let map;
let markersLayer;
let tempMarker = null;
let currentFilter = 'all';

// Tọa độ mặc định: Trung tâm Thành phố Nha Trang (Đại học Nha Trang NTU)
const DEFAULT_CENTER = [12.2500, 109.1900];
const DEFAULT_ZOOM = 14;

// Dữ liệu mẫu ban đầu để giao diện hiển thị ngay lập tức (Mock Data)
let mockReports = [
    {
        id: 1,
        type: 'ngap_nuoc',
        severity: 'nghiem_trong',
        latitude: 12.2485,
        longitude: 109.1950,
        address_text: 'Đường Trần Phú (đoạn đối diện công viên Tuệ Tĩnh)',
        description: 'Mưa lớn triều cường dâng cao, ngập hơn 50cm, nhiều xe máy chết máy.',
        confirm_count: 12,
        reject_count: 1,
        created_at: '10 phút trước'
    },
    {
        id: 2,
        type: 'ket_xe',
        severity: 'vua',
        latitude: 12.2530,
        longitude: 109.1860,
        address_text: 'Vòng xoay Ngã 6 - Nhà thờ Núi',
        description: 'Giờ tan tầm đông đúc, các phương tiện di chuyển rất chậm.',
        confirm_count: 8,
        reject_count: 0,
        created_at: '25 phút trước'
    },
    {
        id: 3,
        type: 'ngap_nuoc',
        severity: 'nhe',
        latitude: 12.2680,
        longitude: 109.1980,
        address_text: 'Đường 2 Tháng 4 (gần ĐH Nha Trang)',
        description: 'Nước ứ đọng nhẹ mép đường khoảng 15cm, xe cộ vẫn đi được.',
        confirm_count: 4,
        reject_count: 0,
        created_at: '40 phút trước'
    },
    {
        id: 4,
        type: 'ket_xe',
        severity: 'nghiem_trong',
        latitude: 12.2390,
        longitude: 109.1820,
        address_text: 'Đường Lê Hồng Phong (ngã tư Vân Đồn)',
        description: 'Ùn tắc nghiêm trọng kéo dài hơn 500m do công trình đào đường.',
        confirm_count: 19,
        reject_count: 2,
        created_at: '1 giờ trước'
    }
];

// Khởi tạo bản đồ khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderReports(mockReports);
    updateStats(mockReports);
});

function initMap() {
    // 1. Tạo bản đồ
    map = L.map('map', {
        zoomControl: false // Ẩn nút zoom mặc định góc trái để giao diện gọn gàng
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    // 2. Tích hợp nguồn bản đồ OpenStreetMap (Mã nguồn mở miễn phí)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // 3. Layer chứa các marker
    markersLayer = L.layerGroup().addTo(map);

    // 4. Lắng nghe sự kiện click trên bản đồ để chọn vị trí báo cáo
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setReportLocation(lat, lng);
    });
}

// Tạo icon đánh dấu tùy chỉnh (Marker Icon)
function createCustomIcon(type, severity) {
    const isFlood = type === 'ngap_nuoc';
    const isDanger = severity === 'nghiem_trong';
    
    const iconClass = isFlood ? 'ph-fill ph-drop' : 'ph-fill ph-car';
    const markerTypeClass = isFlood ? 'marker-flood' : 'marker-traffic';
    const pulseClass = isDanger ? 'pulse-danger' : '';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="custom-marker ${markerTypeClass} ${pulseClass}">
                <i class="${iconClass}"></i>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22]
    });
}

// Vẽ danh sách điểm cảnh báo lên bản đồ
function renderReports(reports) {
    markersLayer.clearLayers();

    reports.forEach(report => {
        if (currentFilter !== 'all') {
            if (currentFilter === 'nghiem_trong' && report.severity !== 'nghiem_trong') return;
            if (currentFilter !== 'nghiem_trong' && report.type !== currentFilter) return;
        }

        const icon = createCustomIcon(report.type, report.severity);
        const marker = L.marker([report.latitude, report.longitude], { icon: icon });

        // Tạo nội dung popup
        const isFlood = report.type === 'ngap_nuoc';
        const typeLabel = isFlood ? '🌊 Điểm Ngập Nước' : '🚗 Điểm Kẹt Xe';
        const sevLabels = {
            'nhe': '<span class="severity-pill sev-nhe">Mức độ: Nhẹ</span>',
            'vua': '<span class="severity-pill sev-vua">Mức độ: Vừa phải</span>',
            'nghiem_trong': '<span class="severity-pill sev-nghiem_trong">Mức độ: Rất nghiêm trọng</span>'
        };

        const popupContent = `
            <div class="popup-container">
                <div class="popup-header">
                    <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 700;">${typeLabel}</span>
                    <span style="font-size: 0.68rem; color: #94a3b8;">${report.created_at}</span>
                </div>
                <div class="popup-title">${report.address_text}</div>
                ${sevLabels[report.severity] || ''}
                <div class="popup-desc" style="margin-top: 6px;">${report.description || 'Không có mô tả chi tiết.'}</div>
                <div class="popup-actions">
                    <button class="btn-vote vote-confirm" onclick="voteReport(${report.id}, 'confirm')">
                        <i class="ph-bold ph-thumbs-up"></i> Đúng (${report.confirm_count})
                    </button>
                    <button class="btn-vote vote-reject" onclick="voteReport(${report.id}, 'reject')">
                        <i class="ph-bold ph-thumbs-down"></i> Sai (${report.reject_count})
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
    });
}

// Định vị người dùng (Geolocation GPS)
function locateUser() {
    if (!navigator.geolocation) {
        alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });
            
            // Đặt icon vị trí hiện tại
            L.circleMarker([latitude, longitude], {
                radius: 9,
                color: '#38bdf8',
                fillColor: '#0284c7',
                fillOpacity: 1,
                weight: 3
            }).addTo(map).bindPopup("📍 Vị trí hiện tại của bạn").openPopup();
        },
        () => {
            alert('Không thể lấy vị trí. Vui lòng cấp quyền vị trí cho trang web.');
        }
    );
}

// Reset góc nhìn bản đồ về mặc định
function resetMapView() {
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1.2 });
}

// Bay tới một điểm bất kỳ trên bản đồ
function flyToReport(lat, lng) {
    map.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
    if (window.innerWidth < 640) {
        toggleSidebar(); // Ẩn sidebar trên mobile khi chọn thẻ
    }
}