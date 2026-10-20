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
function openSubPanel(title, type) {
    const main = document.getElementById('sidebar-main');
    const sub = document.getElementById('sidebar-sub');
    const rep = document.getElementById('sidebar-report');

    if (main) main.style.display = 'none';
    if (rep) rep.style.display = 'none'; // <--- Ẩn khung "Yêu cầu đăng nhập / Báo sự cố"
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

    // PANEL: ĐĂNG NHẬP
    else if (type === 'login') {
        contentDiv.innerHTML = `
            <div style="padding: 8px 0;">
                <form onsubmit="handleAuthLogin(event)" style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:6px; display:block;">Tên đăng nhập hoặc Email</label>
                        <input type="text" id="loginUsername" placeholder="Nhập tên đăng nhập" class="form-input" required>
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:6px; display:block;">Mật khẩu</label>
                        <input type="password" id="loginPassword" placeholder="Nhập mật khẩu" class="form-input" required>
                    </div>
                    <button type="submit" style="width:100%; background:#2563eb; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.95rem; margin-top:6px;">
                        Đăng nhập
                    </button>
                </form>
                <div style="text-align:center; margin-top:20px; font-size:0.88rem; color:#a1a1aa;">
                    Chưa có tài khoản? <a href="#" onclick="openSubPanel('Tạo tài khoản mới', 'register')" style="color:#60a5fa; text-decoration:none; font-weight:600;">Đăng ký ngay</a>
                </div>
            </div>
        `;
    }

    // PANEL: ĐĂNG KÝ
    else if (type === 'register') {
        contentDiv.innerHTML = `
            <div style="padding: 8px 0;">
                <form onsubmit="handleAuthRegister(event)" style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Tên đăng nhập</label>
                        <input type="text" id="regUsername" placeholder="Ví dụ: nguyenvana" class="form-input" required>
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Email</label>
                        <input type="email" id="regEmail" placeholder="email@domain.com" class="form-input" required>
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Mật khẩu</label>
                        <input type="password" id="regPassword" placeholder="Ít nhất 6 ký tự" class="form-input" required>
                    </div>
                    <div>
                        <label style="color:#a1a1aa; font-size:0.82rem; margin-bottom:4px; display:block;">Nhập lại mật khẩu</label>
                        <input type="password" id="regConfirmPassword" placeholder="Xác nhận mật khẩu" class="form-input" required>
                    </div>
                    <button type="submit" style="width:100%; background:#10b981; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.95rem; margin-top:6px;">
                        Tạo tài khoản
                    </button>
                </form>
                <div style="text-align:center; margin-top:18px; font-size:0.88rem; color:#a1a1aa;">
                    Đã có tài khoản? <a href="#" onclick="openSubPanel('Đăng nhập tài khoản', 'login')" style="color:#60a5fa; text-decoration:none; font-weight:600;">Đăng nhập</a>
                </div>
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

// 14. Xử lý Đăng nhập tài khoản
// 14. Xử lý Đăng nhập tài khoản qua API
async function handleAuthLogin(e) {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;

    try {
        const res = await Api.login(u, p);
        showToast("Đăng nhập thành công!", true);
        setTimeout(() => window.location.reload(), 600);
    } catch (err) {
        showToast(err.message || "Đăng nhập thất bại!", false);
    }
}

// 15. Xử lý Đăng ký tài khoản qua API
async function handleAuthRegister(e) {
    e.preventDefault();
    const u = document.getElementById('regUsername').value;
    const em = document.getElementById('regEmail').value;
    const p = document.getElementById('regPassword').value;
    const cp = document.getElementById('regConfirmPassword').value;

    if (p !== cp) {
        showToast("Mật khẩu xác nhận không khớp!", false);
        return;
    }

    try {
        await Api.register({ username: u, email: em, password: p, confirm_password: cp });
        showToast("Đăng ký thành công! Đang chuyển hướng...", true);
        setTimeout(() => window.location.reload(), 800);
    } catch (err) {
        showToast(err.message || "Đăng ký thất bại!", false);
    }
}

// Tải dữ liệu lần đầu và tự động làm mới mỗi 25 giây
loadReports();
setInterval(loadReports, 25000);