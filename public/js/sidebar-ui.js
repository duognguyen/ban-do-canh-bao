// ==========================================================================
// 3. QUẢN LÝ SIDEBAR, FORM BÁO CÁO & SUB-PANEL (public/js/sidebar-ui.js)
// ==========================================================================

// 1. Quản lý đóng/mở Sidebar & Form báo cáo
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

// 1. Hàm đặt lại toàn bộ giao diện form báo cáo về mặc định sạch sẽ
function resetReportFormUI() {
    const form = document.getElementById('reportAddForm');
    if (!form) return;
    form.reset();

    // Reset nút Loại sự cố về "Ngập lụt" duy nhất
    const defaultTypeCard = document.querySelector('.incident-type-selector .incident-radio-card');
    if (typeof selectIncidentType === 'function' && defaultTypeCard) {
        selectIncidentType('ngap_nuoc', defaultTypeCard);
    }

    // Reset mức nước ngập về "Ngang mắt cá chân"
    const defaultDepthCard = document.querySelector('#field-flood-depth .visual-level-card');
    if (typeof selectVisualDepth === 'function' && defaultDepthCard) {
        selectVisualDepth('mat_ca', defaultDepthCard);
    }

    // Reset tình trạng kẹt xe về "Di chuyển chậm"
    const defaultSpeedCard = document.querySelector('#field-traffic-speed .visual-level-card');
    if (typeof selectTrafficSpeed === 'function' && defaultSpeedCard) {
        selectTrafficSpeed('cham', defaultSpeedCard);
    }

    // Xóa tọa độ và mô tả cũ
    const latInp = document.getElementById('report_lat');
    const lngInp = document.getElementById('report_lng');
    const addrInp = document.getElementById('report_address');
    if (latInp) latInp.value = '';
    if (lngInp) lngInp.value = '';
    if (addrInp) addrInp.value = '';
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

    // Xóa điểm ghim đã chọn nếu người dùng hủy đóng form
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
        selectedMarker = null;
    }

    // Tự động làm sạch trạng thái các nút khi đóng form
    resetReportFormUI();
}

function openReportSheet() {
    openReportPanel();
    // Nếu chưa có tọa độ, tự động định vị GPS gợi ý
    const latInput = document.getElementById('report_lat');
    if (!latInput || !latInput.value) {
        locateUser(false);
    }
}

// 2. Xử lý gửi báo cáo ngầm qua API (Hoàn toàn KHÔNG reload trang)
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
        closeReportPanel(); // Tự động đóng và reset sạch sẽ qua resetReportFormUI()
        // Cập nhật ngay điểm mới lên bản đồ
        await loadReports();
    } catch (err) {
        showToast(err.message || "Không thể gửi báo cáo!", false);
    }
}

// 3. Hiển thị thông báo kết quả mượt mà không làm gián đoạn bản đồ
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

// 4. Chuyển đổi và Render nội dung Sub-panel
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
        // PANEL: CHÚ GIẢI CHUẨN 4 CẤP & KÝ HIỆU BẢN ĐỒ
    if (type === 'legend') {
        contentDiv.innerHTML = `
            <!-- 1. THANG ĐO CẤP ĐỘ NGUY HIỂM -->
            <div class="panel-card" style="border-left: 4px solid #38bdf8;">
                <h4 style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                    <span style="color:#ffffff; font-weight:700;"><i class="ph-bold ph-gauge" style="color:#38bdf8; margin-right:6px;"></i> Thang Cảnh Báo Chuẩn 4 Cấp</span>
                    <span style="font-size:0.7rem; background:rgba(56,189,248,0.2); color:#38bdf8; padding:2px 8px; border-radius:10px; font-weight:700;">Tiêu chuẩn</span>
                </h4>
                <div style="display:flex; flex-direction:column; gap:8px;">
            

                    <!-- Cấp 2: Nhẹ -->
                    <div style="display:flex; align-items:center; justify-content:space-between; background:#27272a; padding:8px 10px; border-radius:8px; border-left:3px solid #60a5fa;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.74rem;">🚗 Đi chậm (15-25 km/h)</span>
                        </div>
                        <span style="background:rgba(96,165,250,0.15); color:#60a5fa; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:6px;">Đi chậm</span>
                    </div>

                    <!-- Cấp 3: Trung bình / Ùn ứ -->
                    <div style="display:flex; align-items:center; justify-content:space-between; background:#27272a; padding:8px 10px; border-radius:8px; border-left:3px solid #f59e0b;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5); padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.74rem;">⛔ Tắc nghẽn (<5 km/h)</span>
                        </div>
                        <span style="background:rgba(245,158,11,0.15); color:#fbbf24; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:6px;">Cảnh báo</span>
                    </div>

                    <!-- Cấp 4: Nghiêm trọng -->
                    <div style="display:flex; align-items:center; justify-content:space-between; background:#27272a; padding:8px 10px; border-radius:8px; border-left:3px solid #ef4444;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.74rem;">⚠️ Ùn ứ nặng (5-15 km/h)</span>
                        </div>
                        <span style="background:rgba(239,68,68,0.2); color:#f87171; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:6px;">Nguy hiểm</span>
                    </div>
                </div>
            </div>

            <!-- 2. PHÂN LOẠI CHI TIẾT THEO SỰ CỐ -->
            <div class="panel-card">
                <h4 style="color:#ffffff; font-weight:700; margin-bottom:10px;">
                    <i class="ph-bold ph-waves" style="color:#60a5fa; margin-right:6px;"></i> Chi tiết Điểm Ngập Nước
                </h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.82rem;">
                    <div style="background:#27272a; padding:8px; border-radius:8px;">
                        <span style="color:#93c5fd; font-weight:700;">🌊 Mắt cá chân:</span>
                        <p style="color:#a1a1aa; font-size:0.74rem; margin-top:2px;">Dưới 20cm (Xe máy qua tốt)</p>
                    </div>
                    <div style="background:#27272a; padding:8px; border-radius:8px;">
                        <span style="color:#60a5fa; font-weight:700;">🌊 Nửa bánh xe:</span>
                        <p style="color:#a1a1aa; font-size:0.74rem; margin-top:2px;">20 - 40cm (Khuyên tránh xe ga)</p>
                    </div>
                    <div style="background:#27272a; padding:8px; border-radius:8px;">
                        <span style="color:#f87171; font-weight:700;">🚨 Ngang yên xe:</span>
                        <p style="color:#a1a1aa; font-size:0.74rem; margin-top:2px;">Trên 40cm (Chết máy / Cô lập)</p>
                    </div>
                    
                </div>
            </div>


            <!-- 3. KÝ HIỆU VÙNG CẢNH BÁO TRÊN BẢN ĐỒ -->
            <div class="panel-card">
                <h4 style="color:#ffffff; font-weight:700; margin-bottom:10px;">
                    <i class="ph-bold ph-map-pin" style="color:#a78bfa; margin-right:6px;"></i> Ký Hiệu Trực Quan Bản Đồ
                </h4>
                <div style="display:flex; flex-direction:column; gap:8px; font-size:0.82rem;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:20px; height:20px; border-radius:50%; background:rgba(59,130,246,0.3); border:2px solid #3b82f6; flex-shrink:0;"></div>
                        <span style="color:#cbd5e1;"><b>Vùng ngập lịch sử:</b> Khu vực hay ngập được AI & cộng đồng tổng hợp</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:20px; height:20px; border-radius:50%; background:rgba(249,115,22,0.3); border:2px solid #f97316; flex-shrink:0;"></div>
                        <span style="color:#cbd5e1;"><b>Vùng kẹt xe lịch sử:</b> Nút giao hay ùn ứ vào giờ cao điểm</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:20px; height:20px; border-radius:50%; border:2px dashed #38bdf8; flex-shrink:0;"></div>
                        <span style="color:#cbd5e1;"><b>Vòng Radar 500m:</b> Bán kính cảnh báo nguy hiểm quanh GPS của bạn</span>
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

        // PANEL: ĐĂNG NHẬP / ĐĂNG KÝ / OTP / QUÊN MẬT KHẨU (Đã tách sang auth-handlers.js)
    else if (['login', 'register', 'verify_otp', 'forgot_password', 'reset_password'].includes(type)) {
        renderAuthSubPanel(type, contentDiv, extraData);
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

    // PANEL: THEO DÕI KHU VỰC & CẢNH BÁO BÁN KÍNH GPS
    else if (type === 'follow') {
        const hasNotif = ("Notification" in window);
        const notifGranted = hasNotif && (Notification.permission === "granted");
        const fixedRadiusLabel = alertRadius < 500 ? `${alertRadius}m` : `${alertRadius / 1000}km`;

        let nearbyList = [];
        if (window.userLocation && Array.isArray(window.currentReports)) {
            window.currentReports.forEach(r => {
                const rLat = parseFloat(r.latitude);
                const rLng = parseFloat(r.longitude);
                if (isNaN(rLat) || isNaN(rLng)) return;
                const d = calcDistanceMeters(window.userLocation.lat, window.userLocation.lng, rLat, rLng);
                if (d <= alertRadius) {
                    nearbyList.push({ report: r, distance: d });
                }
            });
            nearbyList.sort((a, b) => a.distance - b.distance);
        }

        let listHtml = '';
        if (nearbyList.length === 0) {
            listHtml = `
                <div style="text-align:center; padding:16px; color:#a1a1aa; font-size:0.85rem;">
                    <i class="ph-bold ph-shield-check" style="color:#10b981; font-size:2rem; display:block; margin-bottom:6px;"></i>
                    Hiện không có sự cố nào trong bán kính <b>${alertRadius < 1000 ? alertRadius + 'm' : (alertRadius/1000) + 'km'}</b> quanh bạn.
                </div>
            `;
        } else {
            listHtml = nearbyList.map(item => {
                const r = item.report;
                const isFlood = (r.type === 'ngap_nuoc' || r.report_type === 'flood');
                const distText = item.distance < 1000 ? `${item.distance}m` : `${(item.distance/1000).toFixed(1)}km`;
                return `
                    <div class="panel-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px; cursor:pointer;" onclick="focusMarker(${parseFloat(r.latitude)}, ${parseFloat(r.longitude)})">
                        <div>
                            <span style="font-size:0.75rem; font-weight:700; color:${isFlood ? '#60a5fa' : '#fb923c'};">
                                ${isFlood ? '🌊 NGẬP NƯỚC' : '🚦 KẸT XE'}
                            </span>
                            <h5 style="color:white; margin:2px 0; font-size:0.88rem;">${r.address_text || 'Điểm sự cố'}</h5>
                            <span style="color:#a1a1aa; font-size:0.78rem;">Cách bạn: <strong style="color:#38bdf8;">${distText}</strong></span>
                        </div>
                        <i class="ph-bold ph-caret-right" style="color:#60a5fa; font-size:1.1rem;"></i>
                    </div>
                `;
            }).join('');
        }

        contentDiv.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:14px;">
                <div class="panel-card" style="border-color:${notifGranted ? '#10b981' : '#f59e0b'};">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="color:white; font-weight:600; font-size:0.9rem;">
                            <i class="ph-bold ph-bell" style="color:#fbbf24; margin-right:4px;"></i> Thông báo đẩy trình duyệt
                        </span>
                        ${notifGranted 
                            ? `<span style="background:rgba(16, 185, 129, 0.2); color:#34d399; font-size:0.75rem; padding:3px 8px; border-radius:12px; font-weight:700;">🟢 ĐÃ BẬT</span>` 
                            : `<span style="background:rgba(239, 68, 68, 0.2); color:#f87171; font-size:0.75rem; padding:3px 8px; border-radius:12px; font-weight:700;">🔴 CHƯA BẬT</span>`
                        }
                    </div>
                    <p style="color:#a1a1aa; font-size:0.8rem; margin-bottom:10px; line-height:1.4;">
                        Khi có điểm ngập mới lọt vào bán kính bạn đang đứng, trình duyệt sẽ tự động rung và gửi thông báo trực tiếp.
                    </p>
                    ${!notifGranted ? `
                        <button type="button" onclick="requestNotificationPermission()" style="width:100%; background:#2563eb; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:6px;">
                            <i class="ph-bold ph-bell-ringing"></i> Cấp Quyền Thông Báo Ngay
                        </button>
                    ` : ''}
                </div>

                <div class="panel-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="color:white; font-weight:600; font-size:0.9rem;">
                            <i class="ph-bold ph-broadcast" style="color:#38bdf8; margin-right:4px;"></i> Quét radar quanh GPS
                        </span>
                        <label style="cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <input type="checkbox" ${enableProximityAlert ? 'checked' : ''} onchange="toggleProximityAlert(this.checked)" style="width:18px; height:18px; cursor:pointer;">
                            <span style="color:#cbd5e1; font-size:0.85rem;">Bật</span>
                        </label>
                    </div>

                    <p style="color:#a1a1aa; font-size:0.82rem; margin:0;">
                        Bán kính quét an toàn cố định: <strong style="color:#38bdf8;">${fixedRadiusLabel}</strong>
                    </p>
                </div>

                <div>
                    <h5 style="color:white; margin:0 0 8px 0; font-size:0.9rem; display:flex; justify-content:space-between; align-items:center;">
                        <span>⚠️ Sự cố trong bán kính</span>
                        <span style="color:#38bdf8; font-size:0.8rem;">${nearbyList.length} điểm</span>
                    </h5>
                    ${listHtml}
                </div>
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

        // PANEL: BÁO CÁO CỦA TÔI
    else if (type === 'my_reports') {
        contentDiv.innerHTML = `<div style="text-align:center; padding:24px; color:#a1a1aa;">Đang tải lịch sử đóng góp của bạn...</div>`;
        Api.myReports().then(list => {
            const items = Array.isArray(list) ? list : (list && list.data ? list.data : []);
            if (items.length === 0) {
                contentDiv.innerHTML = `
                    <div style="text-align:center; padding:32px 16px; color:#a1a1aa;">
                        <i class="ph-light ph-notebook" style="font-size:3rem; color:#60a5fa; margin-bottom:8px; display:block;"></i>
                        <p style="color:white; font-weight:600;">Bạn chưa gửi báo cáo nào</p>
                        <p style="font-size:0.82rem; margin-top:4px;">Hãy chạm lên bản đồ để đóng góp cảnh báo ngập lụt hoặc kẹt xe cho cộng đồng!</p>
                    </div>`;
                return;
            }
            contentDiv.innerHTML = items.map(r => {
                const isFlood = r.type === 'ngap_nuoc';
                const stLabel = r.status === 'dang_dien_ra'
                    ? '<span style="color:#34d399; font-size:0.75rem; font-weight:700;">🟢 Đang diễn ra</span>'
                    : (r.status === 'da_ket_thuc'
                        ? '<span style="color:#94a3b8; font-size:0.75rem;">⚪ Đã kết thúc</span>'
                        : '<span style="color:#f87171; font-size:0.75rem;">🔴 Đã ẩn</span>');
                return `
                    <div class="panel-card" style="margin-bottom:10px; cursor:pointer;" onclick="focusMarker(${parseFloat(r.latitude)}, ${parseFloat(r.longitude)})">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:0.78rem; font-weight:700; color:${isFlood ? '#38bdf8' : '#fb923c'};">
                                ${isFlood ? '🌊 Ngập nước' : '🚦 Kẹt xe'}
                            </span>
                            ${stLabel}
                        </div>
                        <b style="color:white; font-size:0.9rem; display:block; margin-bottom:4px;">${r.address_text || 'Điểm báo cáo'}</b>
                        <p style="color:#a1a1aa; font-size:0.8rem; margin:0 0 6px 0;">${r.description || 'Không có mô tả'}</p>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#71717a; border-top:1px dashed #3f3f46; padding-top:6px;">
                            <span>👍 ${r.confirm_count || 0} • 👎 ${r.reject_count || 0}</span>
                            <span>${r.created_at || ''}</span>
                        </div>
                    </div>`;
            }).join('');
        }).catch(err => {
            contentDiv.innerHTML = `<div style="color:#f87171; padding:16px; text-align:center;">${err.message || 'Không thể tải danh sách báo cáo!'}</div>`;
        });
    }

    // PANEL: HỒ SƠ & ĐỔI MẬT KHẨU
    else if (type === 'profile') {
        contentDiv.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:14px;">
                <form class="panel-card" onsubmit="handleChangePasswordSubmit(event)" style="display:flex; flex-direction:column; gap:10px;">
                    <h4 style="color:white; margin:0 0 4px 0; font-size:0.95rem;">
                        <i class="ph-bold ph-key" style="color:#34d399; margin-right:6px;"></i> Đổi mật khẩu bảo mật
                    </h4>
                    <input type="password" id="cpOldPass" class="form-input" placeholder="Mật khẩu hiện tại" required>
                    <input type="password" id="cpNewPass" class="form-input" placeholder="Mật khẩu mới (ít nhất 6 ký tự)" required minlength="6">
                    <input type="password" id="cpConfirmPass" class="form-input" placeholder="Nhập lại mật khẩu mới" required minlength="6">
                    <button type="submit" style="background:#2563eb; color:white; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer;">
                        Cập nhật mật khẩu
                    </button>
                </form>
            </div>
        `;
    }
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const oldPass = document.getElementById('cpOldPass').value;
    const newPass = document.getElementById('cpNewPass').value;
    const confirmPass = document.getElementById('cpConfirmPass').value;
    try {
        await Api.changePassword(oldPass, newPass, confirmPass);
        showToast('Đổi mật khẩu thành công!', true);
        closeSubPanel();
    } catch (err) {
        showToast(err.message || 'Đổi mật khẩu thất bại!', false);
    }
}

// Hàm bật/tắt hiển thị mật khẩu dùng chung
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    if (btn) {
        btn.setAttribute('aria-label', isPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
        btn.innerHTML = isPassword
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
}
window.togglePasswordVisibility = togglePasswordVisibility;
