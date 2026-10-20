// ==========================================================================
// BẢN ĐỒ CẢNH BÁO ĐIỂM NGẬP VÀ KẸT XE - LOGIC GIAO DIỆN & BẢN ĐỒ (map.js)
// ==========================================================================

// 1. Khởi tạo bản đồ Leaflet (Ưu tiên vị trí gần nhất của người dùng)
const savedLat = parseFloat(localStorage.getItem('lastKnownLat')) || 12.2458;
const savedLng = parseFloat(localStorage.getItem('lastKnownLng')) || 109.1943;
const defaultZoom = localStorage.getItem('lastKnownLat') ? 16 : 14;

const map = L.map('map', {
    zoomControl: false // Sử dụng bộ nút điều khiển nổi riêng
}).setView([savedLat, savedLng], defaultZoom);

// 2. Tải lớp gạch bản đồ từ OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Lớp chứa các điểm sự cố và lớp người dùng
const markersLayer = L.layerGroup().addTo(map);
let userMarker = null;
window.currentReports = [];
window.currentFilter = 'all'; // 'all', 'ngap_nuoc', 'ket_xe'

// Tự động định vị và zoom sát vào vị trí người dùng ngay khi vào trang
locateUser(true);
loadReports();

// 3. Các hàm điều khiển zoom bản đồ
function zoomInMap() {
    map.zoomIn();
}

function zoomOutMap() {
    map.zoomOut();
}

// 4. Định vị GPS người dùng
function locateUser(zoom = true, showAlert = false) {
    if (!navigator.geolocation) {
        if (showAlert) alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            // Lưu lại vị trí để lần sau mở trang là ở ngay đây
            localStorage.setItem('lastKnownLat', lat);
            localStorage.setItem('lastKnownLng', lng);

            const latInput = document.getElementById('report_lat');
            const lngInput = document.getElementById('report_lng');
            const addressInput = document.getElementById('report_address');

            if (latInput) latInput.value = lat;
            if (lngInput) lngInput.value = lng;
            if (addressInput && !addressInput.value) {
                addressInput.value = "Vị trí hiện tại của bạn";
            }

            if (userMarker) map.removeLayer(userMarker);

            const pinIcon = L.divIcon({
                className: 'custom-pin',
                html: `
                    <div style="width:24px; height:24px; background:#2563eb; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2.5px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35); position:relative;">
                        <div style="width:8px; height:8px; background:white; border-radius:50%; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            });

            userMarker = L.marker([lat, lng], { icon: pinIcon })
                .addTo(map)
                .bindPopup('<b style="color:#2563eb;">📍 Bạn đang ở đây</b>')
                .openPopup();

            // Zoom sát vào vị trí người dùng (mức zoom 16.5 cận cảnh)
            if (zoom) {
                map.flyTo([lat, lng], 16.5, { animate: true, duration: 1.2 });
            }
        },
        err => {
            console.warn("GPS Warning:", err.message);
            if (showAlert) {
                alert("Không thể lấy vị trí GPS! Hãy cấp quyền truy cập Vị trí cho trình duyệt.");
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// 5. Bắt sự kiện chạm/click trên bản đồ để chọn tọa độ báo cáo
map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    const latInput = document.getElementById('report_lat');
    const lngInput = document.getElementById('report_lng');
    const addressInput = document.getElementById('report_address');

    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
    if (addressInput) {
        addressInput.value = `Điểm chọn trên bản đồ [${lat}, ${lng}]`;
    }

    if (userMarker) map.removeLayer(userMarker);

    const pinIcon = L.divIcon({
        className: 'custom-pin',
        html: `
            <div style="width:24px; height:24px; background:#0284c7; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.4); position:relative;">
                <div style="width:8px; height:8px; background:white; border-radius:50%; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    });

    userMarker = L.marker([lat, lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup("📍 Vị trí bạn đã chọn: " + lat + ", " + lng)
        .openPopup();

    // Mở khung form báo cáo (xử lý bằng PHP thuần)
    openReportPanel();
});

// 6. Tải dữ liệu các điểm cảnh báo từ API máy chủ
async function loadReports() {
    try {
        const reports = await Api.reports(window.currentFilter || 'all');
        window.currentReports = Array.isArray(reports) ? reports : [];
        renderMarkers(window.currentReports);
    } catch (e) {
        console.warn("Lỗi tải API reports:", e.message);
        renderMarkers([]);
    }
}
// 7. Render danh sách Markers lên bản đồ
function renderMarkers(reports) {
    markersLayer.clearLayers();

    // Lọc theo bộ lọc hiện tại
    let filteredReports = reports;
    if (window.currentFilter === 'ngap_nuoc') {
        filteredReports = reports.filter(r => (r.type === 'ngap_nuoc' || r.report_type === 'flood'));
    } else if (window.currentFilter === 'ket_xe') {
        filteredReports = reports.filter(r => (r.type === 'ket_xe' || r.report_type === 'traffic'));
    }

    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');

    if (filteredReports.length > 0) {
        if (statusText) statusText.innerText = `Đang có ${filteredReports.length} điểm cảnh báo`;
        if (statusDot) {
            statusDot.className = 'pulse-dot orange';
        }
    } else {
        if (statusText) statusText.innerText = `Hiện tại đường thông thoáng`;
        if (statusDot) {
            statusDot.className = 'pulse-dot green';
        }
    }

    filteredReports.forEach(r => {
        const isFlood = (r.type === 'ngap_nuoc' || r.report_type === 'flood');
        const pulseClass = isFlood ? 'pulse-marker-flood' : 'pulse-marker-traffic';

        const customIcon = L.divIcon({
            className: pulseClass,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const lat = parseFloat(r.latitude);
        const lng = parseFloat(r.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng], { icon: customIcon });

        // Tên hiển thị loại và tiêu đề
        const typeBadge = isFlood
            ? `<span style="background: rgba(2, 132, 199, 0.2); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem;">🌊 NGẬP NƯỚC</span>`
            : `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem;">🚦 KẸT XE</span>`;

        const titleText = r.address_text || r.title || 'Điểm sự cố';
        const descText = r.description || 'Không có mô tả chi tiết.';
        const upCount = r.confirm_count || r.upvotes || 0;
        const downCount = r.reject_count || r.downvotes || 0;
        const timeText = r.created_at || 'Vừa xong';
        const reporter = r.username ? `Người báo: <b>${r.username}</b>` : '';

        const popupHtml = `
            <div style="font-size: 0.9rem; line-height: 1.5; min-width: 200px;">
                <div style="margin-bottom: 6px;">${typeBadge}</div>
                <b style="color: white; font-size: 0.98rem; display: block; margin-bottom: 4px;">${titleText}</b>
                <p style="margin: 4px 0 8px 0; color: #a1a1aa; font-size: 0.85rem;">${descText}</p>
                <div style="font-size: 0.75rem; color: #71717a; margin-bottom: 8px;">
                    ${reporter ? reporter + ' • ' : ''}${timeText}
                </div>
                <div style="display: flex; gap: 8px; border-top: 1px solid #3f3f46; padding-top: 8px;">
                    <button onclick="voteReport(${r.id}, 'confirm')" style="flex: 1; padding: 6px 10px; font-size: 0.78rem; border-radius: 8px; border: 1px solid #3f3f46; background: #27272a; color: #34d399; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        👍 Đúng (${upCount})
                    </button>
                    <button onclick="voteReport(${r.id}, 'reject')" style="flex: 1; padding: 6px 10px; font-size: 0.78rem; border-radius: 8px; border: 1px solid #3f3f46; background: #27272a; color: #f87171; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        👎 Đã hết (${downCount})
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupHtml);
        markersLayer.addLayer(marker);
    });
}

// 8. Quản lý Bộ lọc sự cố
function toggleFilterMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('filterMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

document.addEventListener('click', function() {
    const menu = document.getElementById('filterMenu');
    if (menu) menu.classList.remove('show');
});

function applyFilter(filterType, e) {
    if (e) e.stopPropagation();
    window.currentFilter = filterType;
    const menu = document.getElementById('filterMenu');
    if (menu) menu.classList.remove('show');

    const textEl = document.getElementById('currentFilterText');
    if (filterType === 'all') textEl.innerText = 'Tất cả sự cố';
    else if (filterType === 'ngap_nuoc') textEl.innerText = 'Chỉ báo ngập';
    else if (filterType === 'ket_xe') textEl.innerText = 'Chỉ kẹt xe';

    if (window.currentReports) {
        renderMarkers(window.currentReports);
    }
}

// 9. Quản lý Sidebar & Sub-panel (Không dùng lớp phủ mờ)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isOpen = sidebar.classList.toggle('open');

    if (!isOpen) {
        closeReportPanel();
        closeSubPanel();
    }

    setTimeout(() => map.invalidateSize(), 300);
}

function openSidebarNews() {
    const sidebar = document.getElementById('sidebar');
    const rep = document.getElementById('sidebar-report');
    if (rep) rep.style.display = 'none';

    if (sidebar) sidebar.classList.add('open');
    openSubPanel('Tin mới nhất', 'news');
}

function closeSubPanel() {
    const main = document.getElementById('sidebar-main');
    const sub = document.getElementById('sidebar-sub');
    const rep = document.getElementById('sidebar-report');

    if (sub) sub.style.display = 'none';
    if (rep) rep.style.display = 'none';
    if (main) main.style.display = 'flex';
}

function openReportPanel() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('open');
    // KHÔNG bật lớp mờ overlay để người dùng thoải mái click lên bản đồ chọn/đổi vị trí
    if (overlay) overlay.classList.remove('active');

    const main = document.getElementById('sidebar-main');
    const sub = document.getElementById('sidebar-sub');
    const rep = document.getElementById('sidebar-report');

    if (main) main.style.display = 'none';
    if (sub) sub.style.display = 'none';
    if (rep) rep.style.display = 'flex';
}

function closeReportPanel() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const rep = document.getElementById('sidebar-report');
    const main = document.getElementById('sidebar-main');

    if (rep) rep.style.display = 'none';
    if (main) main.style.display = 'flex';
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

function openReportSheet() {
    openReportPanel();
    // Nếu chưa có tọa độ, tự động định vị GPS gợi ý
    const latInput = document.getElementById('report_lat');
    if (!latInput || !latInput.value) {
        locateUser(false);
    }
}

// Xử lý gửi báo cáo ngầm qua API (Hoàn toàn KHÔNG reload trang)
async function handleReportFormSubmit(e) {
    if (e) e.preventDefault();

    const form = document.getElementById('reportAddForm');
    if (!form) return;

    const lat = document.getElementById('report_lat').value;
    const lng = document.getElementById('report_lng').value;
    if (!lat || !lng) {
        showToast("Vui lòng chạm lên bản đồ để chọn vị trí sự cố!", false);
        return;
    }

    const formData = new FormData(form);

    try {
        await Api.addReport(formData);
        showToast("Gửi báo cáo sự cố thành công!", true);
        closeReportPanel();
        form.reset();
        // Cập nhật ngay điểm mới lên bản đồ
        await loadReports();
    } catch (err) {
        showToast(err.message || "Không thể gửi báo cáo!", false);
    }
}

// Hiển thị thông báo kết quả mượt mà không làm gián đoạn bản đồ
function showToast(message, isSuccess = true) {
    const existing = document.getElementById('app-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
        position: fixed;
        top: 75px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        background: ${isSuccess ? '#059669' : '#dc2626'};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
    `;
    toast.innerHTML = `
        <i class="${isSuccess ? 'ph-bold ph-check-circle' : 'ph-bold ph-warning-circle'}" style="font-size: 1.25rem;"></i>
        <span>${message}</span>
    `;
    toast.onclick = () => toast.remove();
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast && toast.parentNode) toast.remove();
    }, 3500);
}

// 10. Chuyển đổi và Render nội dung Sub-panel
function openSubPanel(title, type, extraData = {}) {
    window.currentSubData = extraData || {};
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('open')) {
        sidebar.classList.add('open');
    }
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay && window.innerWidth < 768) {
        overlay.classList.add('active');
    }
    const main = document.getElementById('sidebar-main');
    const sub = document.getElementById('sidebar-sub');
    const rep = document.getElementById('sidebar-report');

    if (main) main.style.display = 'none';
    if (rep) rep.style.display = 'none'; // Ẩn khung "Yêu cầu đăng nhập / Báo sự cố"
    if (sub) sub.style.display = 'flex';
    document.getElementById('sub-title').innerText = title;

    const contentDiv = document.getElementById('sub-content');

    // PANEL: CHÚ GIẢI
    if (type === 'legend') {
        contentDiv.innerHTML = `
            <div class="panel-card">
                <h4><i class="ph-bold ph-waves" style="color:#60a5fa; margin-right:6px;"></i> Cảnh báo Ngập nước</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#60a5fa; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-waves"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Mắt cá (<20cm)</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#3b82f6; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-waves"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Gối (20-40cm)</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#2563eb; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-waves"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Bánh xe (>40cm)</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#10b981; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-check"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Đã rút nước</span>
                    </div>
                </div>
            </div>

            <div class="panel-card">
                <h4><i class="ph-bold ph-car" style="color:#fb923c; margin-right:6px;"></i> Cảnh báo Kẹt xe & Sự cố</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#f97316; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-car"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Kẹt xe</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#ea580c; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-warning"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Va chạm</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#dc2626; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-minus"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Đóng đường</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:26px; height:26px; background:#eab308; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;"><i class="ph-bold ph-warning-circle"></i></div>
                        <span style="color:#d4d4d8; font-size:0.88rem;">Sự cố khác</span>
                    </div>
                </div>
            </div>
        `;
    }

    // PANEL: TIN MỚI NHẤT
    else if (type === 'news') {
        let newsHtml = `<div style="display:flex; flex-direction:column; gap:12px;">`;
        const reports = window.currentReports || [];

        if (reports.length === 0) {
            newsHtml += `
                <div style="text-align:center; padding:32px 16px; color:#a1a1aa;">
                    <i class="ph-light ph-check-circle" style="font-size:3rem; color:#22c55e; margin-bottom:8px;"></i>
                    <p style="font-size:0.95rem; font-weight:600; color:white;">Tuyến đường đang thông thoáng</p>
                    <p style="font-size:0.82rem; margin-top:4px;">Chưa có báo cáo điểm ngập hay kẹt xe nào gần đây.</p>
                </div>
            `;
        } else {
            const floodCount = reports.filter(r => (r.type === 'ngap_nuoc' || r.report_type === 'flood')).length;
            const trafficCount = reports.filter(r => (r.type === 'ket_xe' || r.report_type === 'traffic')).length;

            // Thẻ thống kê tổng quan các sự cố đang diễn ra
            newsHtml += `
                <div class="panel-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)); border: 1px solid #3b82f6; padding: 14px; margin-bottom: 4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="color:white; font-weight:700; font-size:0.95rem;">
                            <i class="ph-bold ph-warning-circle" style="color:#f59e0b; margin-right:4px;"></i> Tổng sự cố đang diễn ra
                        </span>
                        <span style="background:#2563eb; color:white; font-size:0.85rem; font-weight:700; padding:3px 10px; border-radius:20px;">
                            ${reports.length} điểm
                        </span>
                    </div>
                    <div style="display:flex; gap:12px; font-size:0.85rem;">
                        <span style="background:rgba(59, 130, 246, 0.15); color:#60a5fa; padding:4px 8px; border-radius:6px; font-weight:600;">
                            🌊 ${floodCount} Ngập nước
                        </span>
                        <span style="background:rgba(249, 115, 22, 0.15); color:#fb923c; padding:4px 8px; border-radius:6px; font-weight:600;">
                            🚦 ${trafficCount} Kẹt xe
                        </span>
                    </div>
                </div>
            `;

            reports.forEach(r => {
                const isFlood = (r.type === 'ngap_nuoc' || r.report_type === 'flood');
                const iconHtml = isFlood 
                    ? `<div style="width:38px; height:38px; background:rgba(59, 130, 246, 0.2); border-radius:10px; display:flex; justify-content:center; align-items:center; color:#60a5fa; font-size:1.2rem; flex-shrink:0;"><i class="ph-fill ph-waves"></i></div>` 
                    : `<div style="width:38px; height:38px; background:rgba(249, 115, 22, 0.2); border-radius:10px; display:flex; justify-content:center; align-items:center; color:#fb923c; font-size:1.2rem; flex-shrink:0;"><i class="ph-fill ph-car"></i></div>`;

                const lat = parseFloat(r.latitude);
                const lng = parseFloat(r.longitude);
                const titleText = r.address_text || r.title || 'Điểm sự cố';
                const upCount = r.confirm_count || r.upvotes || 0;

                const sevMap = {
                    'nhe': '<span style="color:#34d399; font-size:0.75rem;">(Mức nhẹ)</span>',
                    'vua': '<span style="color:#f59e0b; font-size:0.75rem;">(Mức vừa)</span>',
                    'nghiem_trong': '<span style="color:#ef4444; font-size:0.75rem; font-weight:700;">(Nghiêm trọng)</span>'
                };
                const sevText = sevMap[r.severity] || '';

                newsHtml += `
                    <div class="panel-card" style="display:flex; gap:12px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#3f3f46'" onclick="focusMarker(${lat}, ${lng})">
                        ${iconHtml}
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
                                <h5 style="color:white; margin:0; font-size:0.92rem; font-weight:600; line-height:1.4;">${titleText}</h5>
                            </div>
                            <div style="margin-bottom:6px;">
                                <span style="font-size:0.78rem; font-weight:600; color:${isFlood ? '#60a5fa' : '#fb923c'};">${isFlood ? 'Điểm ngập' : 'Kẹt xe'}</span>
                                ${sevText}
                            </div>
                            <p style="color:#a1a1aa; font-size:0.82rem; margin:0 0 8px 0; line-height:1.4;">${r.description || 'Không có mô tả chi tiết'}</p>
                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; border-top:1px dashed #3f3f46; padding-top:6px;">
                                <span style="color:#71717a;"><i class="ph ph-clock"></i> ${r.created_at || 'Mới cập nhật'}</span>
                                <span style="color:#38bdf8; font-weight:600;"><i class="ph-bold ph-crosshair"></i> Xem vị trí</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        newsHtml += `</div>`;
        contentDiv.innerHTML = newsHtml;
    }

    // PANEL: BÁO CÁO SỰ CỐ
    else if (type === 'report' || type === 'report_traffic') {
        const isFlood = (type === 'report');
        const floodTabStyle = isFlood ? 'color:white; font-weight:bold; border-bottom:2px solid #3b82f6;' : 'color:#a1a1aa; border-bottom:2px solid transparent;';
        const trafficTabStyle = !isFlood ? 'color:white; font-weight:bold; border-bottom:2px solid #3b82f6;' : 'color:#a1a1aa; border-bottom:2px solid transparent;';

        const floodGrid = `
            <label class="road-pill">
                <input type="checkbox" name="is_whole_street" value="1" style="display:none;" checked>
                <i class="ph-bold ph-check check-icon"></i> Ngập cả đoạn đường
            </label>
            <p style="color:#f59e0b; font-size:0.78rem; margin-bottom:10px;">* Chọn mức độ ngập ước tính:</p>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="nhe" style="display:none;" checked>
                    <i class="ph-fill ph-waves" style="color:#60a5fa; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Mắt cá (<20cm)</span>
                </label>
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="vua" style="display:none;">
                    <i class="ph-fill ph-waves" style="color:#3b82f6; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Gối (20-40cm)</span>
                </label>
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="nghiem_trong" style="display:none;">
                    <i class="ph-fill ph-waves" style="color:#2563eb; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Bánh xe (>40cm)</span>
                </label>
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="da_ket_thuc" style="display:none;">
                    <i class="ph-fill ph-check-circle" style="color:#10b981; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Hết ngập</span>
                </label>
            </div>
        `;

        const trafficGrid = `
            <p style="color:#f59e0b; font-size:0.78rem; margin-bottom:10px;">* Chọn dạng sự cố giao thông:</p>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="vua" style="display:none;" checked>
                    <i class="ph-fill ph-car" style="color:#fb923c; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Kẹt xe</span>
                </label>
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="nghiem_trong" style="display:none;">
                    <i class="ph-fill ph-warning" style="color:#ea580c; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Va chạm</span>
                </label>
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="nghiem_trong" style="display:none;">
                    <i class="ph-fill ph-minus-circle" style="color:#dc2626; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Đóng đường</span>
                </label>
                <label class="sev-label" style="padding:10px 12px; gap:8px;">
                    <input type="radio" name="severity" value="nhe" style="display:none;">
                    <i class="ph-fill ph-warning-circle" style="color:#eab308; font-size:1.2rem;"></i> <span style="color:white; font-size:0.85rem;">Sự cố khác</span>
                </label>
            </div>
        `;

        contentDiv.innerHTML = `
            <form id="reportForm" onsubmit="handleReportSubmit(event)" style="display:flex; flex-direction:column; gap:14px;">
                <div style="display:flex; gap:8px; border-bottom:1px solid #27272a;">
                    <button type="button" onclick="openSubPanel('Báo điểm ngập', 'report')" style="flex:1; background:transparent; border:none; padding-bottom:8px; font-size:0.92rem; cursor:pointer; ${floodTabStyle}">
                        <i class="ph-bold ph-waves"></i> Báo ngập
                    </button>
                    <button type="button" onclick="openSubPanel('Báo kẹt xe', 'report_traffic')" style="flex:1; background:transparent; border:none; padding-bottom:8px; font-size:0.92rem; cursor:pointer; ${trafficTabStyle}">
                        <i class="ph-bold ph-car"></i> Sự cố giao thông
                    </button>
                </div>

                <input type="text" id="report_address" name="address_text" placeholder="Địa chỉ hoặc chạm lên bản đồ..." class="form-input" required>

                <div style="display:flex; gap:8px; align-items:center;">
                    <button type="button" onclick="locateUser(true)" style="background:rgba(59, 130, 246, 0.15); border:1px solid rgba(59, 130, 246, 0.4); color:#60a5fa; padding:8px 14px; border-radius:20px; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <i class="ph-bold ph-crosshair"></i> Vị trí hiện tại
                    </button>
                    <span style="color:#a1a1aa; font-size:0.75rem;">(Hoặc chạm thẳng vào bản đồ)</span>
                </div>

                <div class="panel-card" style="margin-bottom:0;">
                    ${isFlood ? floodGrid : trafficGrid}
                </div>

                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="file" id="reportImage" name="image" accept="image/*" style="display:none;" onchange="document.getElementById('imageLabel').innerText = this.files[0] ? this.files[0].name : 'Thêm ảnh thực tế'">
                    <button type="button" onclick="document.getElementById('reportImage').click()" style="background:#27272a; border:1px solid #3f3f46; border-radius:8px; padding:10px 14px; color:#d4d4d8; display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.85rem;">
                        <i class="ph-bold ph-camera"></i> Thêm ảnh
                    </button>
                    <span id="imageLabel" style="color:#60a5fa; font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">
                        Thêm ảnh để tăng uy tín
                    </span>
                </div>

                <textarea id="report_desc" name="description" placeholder="Ghi chú chi tiết thêm..." class="form-input" style="height:70px; resize:none;"></textarea>

                <div style="display:flex; gap:10px; margin-top:6px;">
                    <button type="button" onclick="closeSubPanel()" style="flex:1; background:#27272a; border:none; padding:12px; color:white; border-radius:10px; font-weight:600; cursor:pointer;">
                        Huỷ
                    </button>
                    <button type="submit" style="flex:2; background:#2563eb; border:none; padding:12px; color:white; border-radius:10px; font-weight:bold; cursor:pointer;">
                        Gửi báo cáo
                    </button>
                </div>

                <input type="hidden" name="type" value="${isFlood ? 'ngap_nuoc' : 'ket_xe'}">
                <input type="hidden" id="report_lat" name="latitude">
                <input type="hidden" id="report_lng" name="longitude">
            </form>
        `;
    }

    // PANEL: ĐĂNG NHẬP (Hỗ trợ Email/Username/SĐT + Remember Me 30 ngày + Quên mật khẩu)
    else if (type === 'login') {
        contentDiv.innerHTML = `
            <div style="padding: 8px 0;">
                <form onsubmit="handleAuthLogin(event)" style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:6px; display:block;">Tên đăng nhập, Email hoặc Số điện thoại</label>
                        <input type="text" id="loginUsername" placeholder="Nhập tài khoản" class="form-input" required autocomplete="username">
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:6px; display:block;">Mật khẩu</label>
                        <input type="password" id="loginPassword" placeholder="Nhập mật khẩu" class="form-input" required autocomplete="current-password">
                    </div>

                    <!-- Ghi nhớ đăng nhập 30 ngày & Quên mật khẩu -->
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
                        <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer;">
                            <input type="checkbox" id="loginRememberMe" checked style="width:16px; height:16px; accent-color:#2563eb;">
                            <span>Ghi nhớ đăng nhập (30 ngày)</span>
                        </label>
                        <a href="#" onclick="openSubPanel('Quên mật khẩu', 'forgot_password'); return false;" style="color:#60a5fa; text-decoration:none;">Quên mật khẩu?</a>
                    </div>

                    <button type="submit" id="btnLoginSubmit" style="width:100%; background:#2563eb; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.95rem; margin-top:6px; transition:0.2s;">
                        Đăng nhập
                    </button>
                </form>
                <div style="text-align:center; margin-top:20px; font-size:0.88rem; color:#a1a1aa;">
                    Chưa có tài khoản? <a href="#" onclick="openSubPanel('Đăng ký tài khoản', 'register'); return false;" style="color:#60a5fa; text-decoration:none; font-weight:600;">Đăng ký ngay</a>
                </div>
            </div>
        `;
    }

    // PANEL: ĐĂNG KÝ (Họ tên, Email/SĐT, Kiểm tra trùng Email realtime, Điều khoản & OTP)
    else if (type === 'register') {
        contentDiv.innerHTML = `
            <div style="padding: 8px 0;">
                <form onsubmit="handleAuthRegister(event)" style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Họ và tên <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="regFullName" placeholder="Ví dụ: Nguyễn Văn A" class="form-input" required>
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Email (nhận mã OTP xác thực) <span style="color:#ef4444;">*</span></label>
                        <input type="email" id="regEmail" placeholder="email@domain.com" class="form-input" required oninput="handleEmailRealtimeCheck(this.value)" onblur="handleEmailRealtimeCheck(this.value)">
                        <div id="emailCheckStatus" style="font-size:0.8rem; margin-top:4px;"></div>
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Số điện thoại (tùy chọn)</label>
                        <input type="tel" id="regPhone" placeholder="Ví dụ: 0912345678" class="form-input">
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Tên đăng nhập (tùy chọn)</label>
                        <input type="text" id="regUsername" placeholder="Để trống hệ thống sẽ tự sinh theo email" class="form-input">
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Mật khẩu <span style="color:#ef4444;">*</span></label>
                        <input type="password" id="regPassword" placeholder="Ít nhất 6 ký tự" class="form-input" required minlength="6" autocomplete="new-password">
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Xác nhận mật khẩu <span style="color:#ef4444;">*</span></label>
                        <input type="password" id="regConfirmPassword" placeholder="Nhập lại mật khẩu" class="form-input" required minlength="6" autocomplete="new-password">
                    </div>

                    <!-- Checkbox Điều khoản & Chính sách -->
                    <div style="display:flex; align-items:flex-start; gap:8px; margin-top:4px; font-size:0.83rem; color:#cbd5e1;">
                        <input type="checkbox" id="regTermsAgree" checked required style="width:18px; height:18px; accent-color:#10b981; margin-top:2px;">
                        <label for="regTermsAgree" style="cursor:pointer; line-height:1.4;">
                            Tôi đã đọc và đồng ý với 
                            <a href="#" onclick="openSubPanel('Điều khoản dịch vụ', 'terms'); return false;" style="color:#60a5fa; text-decoration:none;">Điều khoản dịch vụ</a> 
                            & 
                            <a href="#" onclick="openSubPanel('Chính sách bảo mật', 'privacy'); return false;" style="color:#60a5fa; text-decoration:none;">Chính sách bảo mật</a>.
                        </label>
                    </div>

                    <button type="submit" id="btnRegisterSubmit" style="width:100%; background:#10b981; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.95rem; margin-top:8px;">
                        Tiếp tục (Nhận mã OTP)
                    </button>
                </form>
                <div style="text-align:center; margin-top:16px; font-size:0.88rem; color:#a1a1aa;">
                    Đã có tài khoản? <a href="#" onclick="openSubPanel('Đăng nhập tài khoản', 'login'); return false;" style="color:#60a5fa; text-decoration:none; font-weight:600;">Đăng nhập</a>
                </div>
            </div>
        `;
    }

    // PANEL: XÁC THỰC MÃ OTP ĐĂNG KÝ
    else if (type === 'verify_otp') {
        const targetEmail = extraData.email || '';
        const debugOtp = extraData.debugOtp || '';
        contentDiv.innerHTML = `
            <div style="padding: 8px 0; text-align:center;">
                <div style="width:56px; height:56px; background:#0284c7; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:white; font-size:1.8rem;">
                    <i class="ph-bold ph-envelope-simple"></i>
                </div>
                <h4 style="color:white; font-size:1.1rem; margin-bottom:6px;">Xác thực địa chỉ Email</h4>
                <p style="color:#a1a1aa; font-size:0.85rem; line-height:1.5; margin-bottom:16px;">
                    Mã xác thực gồm 6 chữ số đã được gửi tới email:<br>
                    <strong style="color:#60a5fa;">${targetEmail}</strong>
                </p>

                ${debugOtp ? `
                    <div style="background:#1e3a5f; border:1px dashed #3b82f6; color:#93c5fd; padding:10px 14px; border-radius:8px; font-size:0.83rem; margin-bottom:16px; text-align:left;">
                        💡 <b>Môi trường thử nghiệm:</b> Mã OTP của bạn là: <span style="font-size:1.15rem; font-weight:bold; color:white; letter-spacing:2px;">${debugOtp}</span>
                    </div>
                ` : ''}

                <form onsubmit="handleVerifyRegisterOtp(event)" style="display:flex; flex-direction:column; gap:14px;">
                    <input type="hidden" id="otpTargetEmail" value="${targetEmail}">
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:6px; display:block;">Nhập mã OTP (6 số)</label>
                        <input type="text" id="regOtpInput" maxlength="6" placeholder="000000" class="form-input" style="text-align:center; font-size:1.5rem; letter-spacing:8px; font-weight:bold;" required autocomplete="one-time-code">
                    </div>
                    <button type="submit" id="btnVerifyOtpSubmit" style="width:100%; background:#0284c7; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.95rem;">
                        Xác nhận & Hoàn tất
                    </button>
                </form>

                <div style="margin-top:20px; font-size:0.85rem; color:#a1a1aa;">
                    Chưa nhận được mã? 
                    <a href="#" onclick="handleResendRegisterOtp('${targetEmail}'); return false;" style="color:#60a5fa; text-decoration:none; font-weight:600;">Gửi lại mã OTP</a>
                </div>
                <div style="margin-top:10px; font-size:0.83rem;">
                    <a href="#" onclick="openSubPanel('Đăng ký tài khoản', 'register'); return false;" style="color:#94a3b8; text-decoration:none;">&larr; Quay lại thay đổi thông tin</a>
                </div>
            </div>
        `;
    }

    // PANEL: QUÊN MẬT KHẨU (Gửi token và OTP 15 phút)
    else if (type === 'forgot_password') {
        contentDiv.innerHTML = `
            <div style="padding: 8px 0;">
                <div style="text-align:center; margin-bottom:16px;">
                    <div style="width:52px; height:52px; background:#f59e0b; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; color:white; font-size:1.6rem;">
                        <i class="ph-bold ph-key"></i>
                    </div>
                    <h4 style="color:white; font-size:1.05rem; margin-bottom:6px;">Khôi phục mật khẩu</h4>
                    <p style="color:#a1a1aa; font-size:0.84rem; line-height:1.5;">
                        Nhập địa chỉ email tài khoản của bạn để nhận liên kết và mã OTP đặt lại mật khẩu có thời hạn 15 phút.
                    </p>
                </div>

                <form onsubmit="handleForgotPassword(event)" style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:6px; display:block;">Email tài khoản</label>
                        <input type="email" id="forgotEmail" placeholder="email@domain.com" class="form-input" required>
                    </div>
                    <button type="submit" id="btnForgotSubmit" style="width:100%; background:#f59e0b; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.95rem;">
                        Gửi liên kết & Mã OTP
                    </button>
                </form>

                <div style="text-align:center; margin-top:20px; font-size:0.88rem; color:#a1a1aa;">
                    <a href="#" onclick="openSubPanel('Đăng nhập tài khoản', 'login'); return false;" style="color:#60a5fa; text-decoration:none; font-weight:600;">&larr; Quay lại Đăng nhập</a>
                </div>
            </div>
        `;
    }

    // PANEL: ĐẶT LẠI MẬT KHẨU (Token trên link hoặc OTP)
    else if (type === 'reset_password') {
        const token = extraData.token || '';
        const email = extraData.email || '';
        const debugOtp = extraData.debugOtp || '';
        const hasToken = token.length > 0;

        contentDiv.innerHTML = `
            <div style="padding: 8px 0;">
                <h4 style="color:white; font-size:1.05rem; margin-bottom:8px;">Thiết lập mật khẩu mới</h4>
                <p style="color:#a1a1aa; font-size:0.84rem; line-height:1.5; margin-bottom:16px;">
                    ${hasToken 
                        ? 'Xác thực qua liên kết token hợp lệ (hiệu lực 15 phút).' 
                        : 'Nhập email, mã OTP nhận được và mật khẩu mới để hoàn tất (hiệu lực 15 phút).'}
                </p>

                ${debugOtp ? `
                    <div style="background:#1e3a5f; border:1px dashed #3b82f6; color:#93c5fd; padding:10px 14px; border-radius:8px; font-size:0.83rem; margin-bottom:16px;">
                        💡 <b>Môi trường thử nghiệm:</b> Mã OTP của bạn là: <span style="font-size:1.15rem; font-weight:bold; color:white; letter-spacing:2px;">${debugOtp}</span>
                    </div>
                ` : ''}

                <form onsubmit="handleResetPassword(event)" style="display:flex; flex-direction:column; gap:12px;">
                    <input type="hidden" id="resetToken" value="${token}">

                    ${!hasToken ? `
                        <div>
                            <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Email tài khoản</label>
                            <input type="email" id="resetEmail" value="${email}" placeholder="email@domain.com" class="form-input" required>
                        </div>
                        <div>
                            <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Mã OTP (6 số)</label>
                            <input type="text" id="resetOtpCode" maxlength="6" placeholder="000000" class="form-input" style="text-align:center; font-size:1.3rem; letter-spacing:6px; font-weight:bold;" required>
                        </div>
                    ` : ''}

                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Mật khẩu mới</label>
                        <input type="password" id="resetNewPassword" placeholder="Ít nhất 6 ký tự" class="form-input" required minlength="6">
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Xác nhận mật khẩu mới</label>
                        <input type="password" id="resetConfirmPassword" placeholder="Nhập lại mật khẩu mới" class="form-input" required minlength="6">
                    </div>

                    <button type="submit" id="btnResetSubmit" style="width:100%; background:#10b981; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.95rem; margin-top:6px;">
                        Cập nhật mật khẩu mới
                    </button>
                </form>

                <div style="text-align:center; margin-top:18px; font-size:0.88rem; color:#a1a1aa;">
                    <a href="#" onclick="openSubPanel('Đăng nhập tài khoản', 'login'); return false;" style="color:#60a5fa; text-decoration:none; font-weight:600;">&larr; Quay lại Đăng nhập</a>
                </div>
            </div>
        `;
    }

    // PANEL: ĐIỀU KHOẢN DỊCH VỤ
    else if (type === 'terms') {
        contentDiv.innerHTML = `
            <div style="color:#d4d4d8; font-size:0.88rem; line-height:1.6;">
                <h4 style="color:white; margin-bottom:10px;">Điều khoản sử dụng dịch vụ</h4>
                <div class="panel-card" style="margin-bottom:12px;">
                    <b style="color:white; display:block; margin-bottom:4px;">1. Tính xác thực thông tin</b>
                    <p style="color:#a1a1aa; font-size:0.84rem;">Người dùng cam kết cung cấp thông tin sự cố chính xác, trung thực. Mọi hành vi cố tình đăng tải thông tin sai lệch sẽ bị trừ điểm uy tín và khóa tài khoản vĩnh viễn.</p>
                </div>
                <div class="panel-card" style="margin-bottom:12px;">
                    <b style="color:white; display:block; margin-bottom:4px;">2. Quyền và trách nhiệm cộng đồng</b>
                    <p style="color:#a1a1aa; font-size:0.84rem;">Cộng đồng cùng chung tay kiểm duyệt qua tính năng xác nhận để đảm bảo dữ liệu luôn hữu ích cho người tham gia giao thông.</p>
                </div>
                <button type="button" onclick="openSubPanel('Đăng ký tài khoản', 'register'); return false;" style="width:100%; background:#2563eb; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:8px;">
                    &larr; Quay lại Đăng ký
                </button>
            </div>
        `;
    }

    // PANEL: CHÍNH SÁCH BẢO MẬT
    else if (type === 'privacy') {
        contentDiv.innerHTML = `
            <div style="color:#d4d4d8; font-size:0.88rem; line-height:1.6;">
                <h4 style="color:white; margin-bottom:10px;">Chính sách bảo mật thông tin</h4>
                <div class="panel-card" style="margin-bottom:12px;">
                    <b style="color:white; display:block; margin-bottom:4px;">1. Bảo mật mật khẩu & tài khoản</b>
                    <p style="color:#a1a1aa; font-size:0.84rem;">Mật khẩu của bạn được mã hóa an toàn bằng thuật toán BCRYPT một chiều. Chúng tôi cam kết không chia sẻ dữ liệu cá nhân cho bên thứ ba.</p>
                </div>
                <div class="panel-card" style="margin-bottom:12px;">
                    <b style="color:white; display:block; margin-bottom:4px;">2. Dữ liệu vị trí GPS</b>
                    <p style="color:#a1a1aa; font-size:0.84rem;">Tọa độ GPS chỉ được sử dụng phục vụ mục đích ghim điểm ngập, kẹt xe trên bản đồ và hiển thị thông báo phù hợp khu vực của bạn.</p>
                </div>
                <button type="button" onclick="openSubPanel('Đăng ký tài khoản', 'register'); return false;" style="width:100%; background:#2563eb; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:8px;">
                    &larr; Quay lại Đăng ký
                </button>
            </div>
        `;
    }

    // PANEL: HƯỚNG DẪN
    else if (type === 'guide') {
        contentDiv.innerHTML = `
            <div style="color:#d4d4d8; font-size:0.9rem; line-height:1.6;">
                <div class="panel-card">
                    <b style="color:white; display:block; margin-bottom:6px;">1. Báo sự cố nhanh</b>
                    <p style="color:#a1a1aa; font-size:0.85rem;">Bấm nút "Báo sự cố" màu xanh ở góc phải màn hình, chọn mức độ và chạm vào bản đồ hoặc vị trí GPS của bạn.</p>
                </div>
                <div class="panel-card">
                    <b style="color:white; display:block; margin-bottom:6px;">2. Xem chi tiết điểm ngập</b>
                    <p style="color:#a1a1aa; font-size:0.85rem;">Bấm vào bất kỳ điểm sóng màu xanh (ngập nước) hoặc màu đỏ (kẹt xe) trên bản đồ để xem mô tả và thời gian.</p>
                </div>
                <div class="panel-card">
                    <b style="color:white; display:block; margin-bottom:6px;">3. Chung tay xác nhận</b>
                    <p style="color:#a1a1aa; font-size:0.85rem;">Bấm 👍 Xác nhận để giúp cộng đồng nhận biết tin tức chính xác, hoặc 👎 Đã hết nếu sự cố đã kết thúc.</p>
                </div>
            </div>
        `;
    }

    // PANEL: GÓP Ý
    else if (type === 'feedback') {
        contentDiv.innerHTML = `
            <div style="color:#d4d4d8; font-size:0.9rem;">
                <p style="margin-bottom:12px; color:#a1a1aa; font-size:0.85rem;">Chúng tôi trân trọng mọi ý kiến đóng góp của bạn nhằm hoàn thiện bản đồ cộng đồng tốt hơn.</p>
                <textarea placeholder="Nhập ý kiến góp ý của bạn..." class="form-input" style="height:110px; resize:none; margin-bottom:12px;"></textarea>
                <input type="text" placeholder="Số điện thoại hoặc Email liên hệ (tuỳ chọn)" class="form-input" style="margin-bottom:14px;">
                <button onclick="alert('Cảm ơn bạn đã gửi góp ý quý báu!'); closeSubPanel();" style="width:100%; background:#2563eb; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer;">
                    Gửi Góp Ý
                </button>
            </div>
        `;
    }

    // PANEL: THEO DÕI
    else if (type === 'follow') {
        contentDiv.innerHTML = `
            <div class="panel-card" style="border-color:#f59e0b;">
                <p style="color:#fbbf24; font-size:0.85rem; margin:0;">
                    <i class="ph-bold ph-bell" style="margin-right:4px;"></i> Tính năng thông báo đẩy qua trình duyệt khi có điểm ngập gần vị trí của bạn (bán kính 500m).
                </p>
            </div>
            <div style="color:#d4d4d8; font-size:0.9rem; margin-top:12px; display:flex; flex-direction:column; gap:12px;">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" checked style="width:18px; height:18px;">
                    <span>Cảnh báo quanh vị trí GPS (500m)</span>
                </label>
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" checked style="width:18px; height:18px;">
                    <span>Cảnh báo đoạn đường hay ngập</span>
                </label>
            </div>
        `;
    }

    // PANEL: CHANGELOG
    else if (type === 'changelog') {
        contentDiv.innerHTML = `
            <div class="panel-card">
                <span style="background:#2563eb; color:white; font-size:0.75rem; padding:2px 8px; border-radius:4px; font-weight:600;">Phiên bản 2.0</span>
                <p style="color:#a1a1aa; font-size:0.85rem; margin-top:8px; line-height:1.5;">
                    • Giao diện bản đồ thời gian thực đa nền tảng.<br>
                    • Hỗ trợ phân loại điểm ngập & kẹt xe theo màu sắc sóng xung động.<br>
                    • Bộ lọc nhanh trên thanh trạng thái.<br>
                    • Hệ thống vote xác nhận tin tức cộng đồng.
                </p>
            </div>
        `;
    }
}

// 11. Di chuyển bản đồ đến điểm sự cố khi bấm trong danh sách Tin mới
function focusMarker(lat, lng) {
    if (isNaN(lat) || isNaN(lng)) return;
    map.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
    closeSubPanel();
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');

    setTimeout(() => {
        markersLayer.eachLayer(layer => {
            const pos = layer.getLatLng();
            if (pos && Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
                layer.openPopup();
            }
        });
    }, 600);
}

// 13. Bình chọn / Xác nhận điểm sự cố qua API
async function voteReport(id, type) {
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để bình chọn xác nhận thông tin!");
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('open')) {
            toggleSidebar();
        }
        openSubPanel('Đăng nhập tài khoản', 'login');
        return;
    }

    try {
        const res = await Api.vote(id, type);
        showToast("Đã ghi nhận bình chọn của bạn!", true);
        // Tải lại dữ liệu để cập nhật số vote trên popup bản đồ
        await loadReports();
    } catch (err) {
        showToast(err.message || "Lỗi gửi bình chọn!", false);
    }
}

// =========================================================================
// CÁC HÀM XỬ LÝ XÁC THỰC (ĐĂNG KÝ OTP, REALTIME EMAIL, ĐĂNG NHẬP REMEMBER ME, RESET PASS)
// =========================================================================

// Kiểm tra trùng lặp email realtime khi người dùng nhập trên form Đăng ký
let emailRealtimeTimer = null;
function handleEmailRealtimeCheck(email) {
    const statusDiv = document.getElementById('emailCheckStatus');
    if (!statusDiv) return;
    clearTimeout(emailRealtimeTimer);

    email = (email || '').trim();
    if (!email) {
        statusDiv.innerHTML = '';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        statusDiv.innerHTML = '<span style="color:#f87171;">Email không đúng định dạng</span>';
        return;
    }

    statusDiv.innerHTML = '<span style="color:#94a3b8;">Đang kiểm tra trùng lặp...</span>';
    emailRealtimeTimer = setTimeout(async () => {
        try {
            const res = await Api.checkEmail(email);
            if (res && res.exists) {
                statusDiv.innerHTML = '<span style="color:#f87171;"><i class="ph-bold ph-warning-circle"></i> Email này đã được đăng ký!</span>';
            } else {
                statusDiv.innerHTML = '<span style="color:#34d399;"><i class="ph-bold ph-check-circle"></i> Email hợp lệ có thể sử dụng</span>';
            }
        } catch (e) {
            statusDiv.innerHTML = '';
        }
    }, 400);
}

// 14. Xử lý Đăng nhập tài khoản qua API (Kèm Remember Me 30 ngày)
async function handleAuthLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btnLoginSubmit');
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('loginRememberMe') ? document.getElementById('loginRememberMe').checked : false;

    if (btn) { btn.disabled = true; btn.innerText = 'Đang đăng nhập...'; }

    try {
        const res = await Api.login(u, p, rememberMe);
        showToast("Đăng nhập thành công!", true);
        setTimeout(() => window.location.reload(), 600);
    } catch (err) {
        showToast(err.message || "Đăng nhập thất bại!", false);
        if (btn) { btn.disabled = false; btn.innerText = 'Đăng nhập'; }
    }
}

// 15. Xử lý Đăng ký tài khoản (Bước 1: Kiểm tra thông tin & Gửi mã OTP)
async function handleAuthRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('btnRegisterSubmit');
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone') ? document.getElementById('regPhone').value.trim() : '';
    const username = document.getElementById('regUsername') ? document.getElementById('regUsername').value.trim() : '';
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const terms = document.getElementById('regTermsAgree') ? document.getElementById('regTermsAgree').checked : false;

    if (!terms) {
        showToast("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!", false);
        return;
    }
    if (password.length < 6) {
        showToast("Mật khẩu phải có ít nhất 6 ký tự!", false);
        return;
    }
    if (password !== confirmPassword) {
        showToast("Mật khẩu xác nhận không khớp!", false);
        return;
    }

    if (btn) { btn.disabled = true; btn.innerText = 'Đang gửi mã OTP...'; }

    try {
        const payload = {
            full_name: fullName,
            email: email,
            phone: phone,
            username: username,
            password: password,
            confirm_password: confirmPassword,
            terms_agree: 1
        };
        const res = await Api.register(payload);
        showToast("Mã xác thực OTP đã được gửi đến email của bạn!", true);

        // Chuyển sang bước 2: Nhập OTP
        openSubPanel('Xác thực địa chỉ Email', 'verify_otp', {
            email: email,
            fullName: fullName,
            debugOtp: (res && res.debug_otp) ? res.debug_otp : null,
            regData: payload
        });
    } catch (err) {
        showToast(err.message || "Đăng ký thất bại!", false);
        if (btn) { btn.disabled = false; btn.innerText = 'Tiếp tục (Nhận mã OTP)'; }
    }
}

// Bước 2: Xác thực mã OTP và kích hoạt tài khoản
async function handleVerifyRegisterOtp(e) {
    e.preventDefault();
    const btn = document.getElementById('btnVerifyOtpSubmit');
    const email = document.getElementById('otpTargetEmail').value;
    const otp = document.getElementById('regOtpInput').value.trim();

    if (!otp) {
        showToast("Vui lòng nhập mã OTP gồm 6 số!", false);
        return;
    }

    if (btn) { btn.disabled = true; btn.innerText = 'Đang xác thực...'; }

    try {
        await Api.verifyRegisterOtp(email, otp);
        showToast("Xác thực tài khoản thành công! Đang chuyển hướng...", true);
        setTimeout(() => window.location.reload(), 700);
    } catch (err) {
        showToast(err.message || "Xác thực OTP thất bại!", false);
        if (btn) { btn.disabled = false; btn.innerText = 'Xác nhận & Hoàn tất'; }
    }
}

// Gửi lại mã OTP đăng ký
async function handleResendRegisterOtp(email) {
    try {
        showToast("Đang gửi lại mã OTP mới...", true);
        const data = (window.currentSubData && window.currentSubData.regData) || { email: email };
        const res = await Api.register(data);
        showToast("Đã gửi lại mã OTP mới đến email!", true);
        if (res && res.debug_otp) {
            openSubPanel('Xác thực địa chỉ Email', 'verify_otp', {
                email: email,
                debugOtp: res.debug_otp,
                regData: data
            });
        }
    } catch (err) {
        showToast(err.message || "Gửi lại OTP thất bại!", false);
    }
}

// Xử lý gửi yêu cầu Quên mật khẩu
async function handleForgotPassword(e) {
    e.preventDefault();
    const btn = document.getElementById('btnForgotSubmit');
    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
        showToast("Vui lòng nhập địa chỉ email!", false);
        return;
    }

    if (btn) { btn.disabled = true; btn.innerText = 'Đang xử lý...'; }

    try {
        const res = await Api.forgotPassword(email);
        showToast("Đã gửi liên kết và mã OTP đặt lại mật khẩu!", true);
        openSubPanel('Đặt lại mật khẩu', 'reset_password', {
            email: email,
            token: res ? res.debug_token : '',
            debugOtp: res ? res.debug_otp : ''
        });
    } catch (err) {
        showToast(err.message || "Không thể gửi yêu cầu đặt lại mật khẩu!", false);
        if (btn) { btn.disabled = false; btn.innerText = 'Gửi liên kết & Mã OTP'; }
    }
}

// Xử lý Đặt lại mật khẩu mới
async function handleResetPassword(e) {
    e.preventDefault();
    const btn = document.getElementById('btnResetSubmit');
    const token = document.getElementById('resetToken') ? document.getElementById('resetToken').value.trim() : '';
    const email = document.getElementById('resetEmail') ? document.getElementById('resetEmail').value.trim() : '';
    const otp = document.getElementById('resetOtpCode') ? document.getElementById('resetOtpCode').value.trim() : '';
    const newPassword = document.getElementById('resetNewPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;

    if (newPassword.length < 6) {
        showToast("Mật khẩu mới phải có ít nhất 6 ký tự!", false);
        return;
    }
    if (newPassword !== confirmPassword) {
        showToast("Mật khẩu xác nhận không khớp!", false);
        return;
    }

    if (btn) { btn.disabled = true; btn.innerText = 'Đang cập nhật...'; }

    try {
        await Api.resetPassword({
            token: token,
            email: email,
            otp: otp,
            password: newPassword,
            confirm_password: confirmPassword
        });
        showToast("Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.", true);
        openSubPanel('Đăng nhập tài khoản', 'login');
    } catch (err) {
        showToast(err.message || "Đặt lại mật khẩu thất bại!", false);
        if (btn) { btn.disabled = false; btn.innerText = 'Cập nhật mật khẩu mới'; }
    }
}

// Tự động kiểm tra URL query parameters để mở đúng sub-panel (login, register, reset_password,...)
document.addEventListener('DOMContentLoaded', () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const route = urlParams.get('route');
        const token = urlParams.get('token') || '';

        if (route === 'reset_password') {
            openSubPanel('Đặt lại mật khẩu', 'reset_password', { token: token });
        } else if (route === 'forgot_password') {
            openSubPanel('Quên mật khẩu', 'forgot_password');
        } else if (route === 'login') {
            openSubPanel('Đăng nhập tài khoản', 'login');
        } else if (route === 'register') {
            openSubPanel('Đăng ký tài khoản', 'register');
        }
    } catch (e) {}
});

// Tải dữ liệu lần đầu và tự động làm mới mỗi 25 giây
loadReports();
setInterval(loadReports, 25000);