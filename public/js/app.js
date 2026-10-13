/**
 * APP.JS - Điều khiển sự kiện giao diện (UI Events, Modals, Filters, AJAX)
 */

let selectedLocation = null;
let currentReportType = 'ngap_nuoc';
let currentReportSeverity = 'vua';

// 1. Điều khiển Mở/Đóng Sidebar Danh Sách Báo Cáo
function toggleSidebar() {
    const sidebar = document.getElementById('sidebarDrawer');
    sidebar.classList.toggle('open');
}

// 2. Cập nhật số liệu thống kê & Danh sách Thẻ Báo Cáo trong Drawer
function updateStats(reports) {
    const totalAll = reports.length;
    const floodCount = reports.filter(r => r.type === 'ngap_nuoc').length;
    const trafficCount = reports.filter(r => r.type === 'ket_xe').length;
    const dangerCount = reports.filter(r => r.severity === 'nghiem_trong').length;

    // Cập nhật số đếm trên thanh lọc (Pills)
    document.getElementById('count-all').innerText = totalAll;
    document.getElementById('count-flood').innerText = floodCount;
    document.getElementById('count-traffic').innerText = trafficCount;
    document.getElementById('count-danger').innerText = dangerCount;

    // Cập nhật trong Drawer
    document.getElementById('stat-flood-num').innerText = floodCount;
    document.getElementById('stat-traffic-num').innerText = trafficCount;

    // Render danh sách thẻ vào Sidebar
    renderReportCards(reports);
}

// 3. Render các thẻ báo cáo trong Sidebar
function renderReportCards(reports) {
    const container = document.getElementById('reportsListContainer');
    container.innerHTML = '';

    if (reports.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #64748b; padding: 40px 20px;">
                <i class="ph ph-bell-slash" style="font-size: 2.5rem; margin-bottom: 8px;"></i>
                <p>Hiện tại không có cảnh báo nào trong khu vực.</p>
            </div>
        `;
        return;
    }

    reports.forEach(report => {
        const isFlood = report.type === 'ngap_nuoc';
        const badgeClass = isFlood ? 'badge-flood' : 'badge-traffic';
        const typeText = isFlood ? '🌊 Ngập nước' : '🚗 Kẹt xe';
        
        const sevMap = {
            'nhe': '<span class="severity-pill sev-nhe">Mức độ nhẹ</span>',
            'vua': '<span class="severity-pill sev-vua">Mức độ vừa</span>',
            'nghiem_trong': '<span class="severity-pill sev-nghiem_trong">Nghiêm trọng</span>'
        };

        const card = document.createElement('div');
        card.className = 'report-card';
        card.onclick = () => flyToReport(report.latitude, report.longitude);

        card.innerHTML = `
            <div class="card-top">
                <span class="card-badge ${badgeClass}">${typeText}</span>
                <span class="card-time">${report.created_at}</span>
            </div>
            <div class="card-address">${report.address_text}</div>
            <div class="card-desc">${report.description || 'Không có mô tả chi tiết'}</div>
            <div class="card-footer">
                ${sevMap[report.severity] || ''}
                <div class="card-votes">
                    <span><i class="ph-bold ph-thumbs-up" style="color: #4ade80;"></i> ${report.confirm_count}</span>
                    <span><i class="ph-bold ph-thumbs-down" style="color: #f87171;"></i> ${report.reject_count}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// 4. Lọc sự cố theo danh mục (Tất cả / Ngập nước / Kẹt xe / Nghiêm trọng)
function filterReports(type, chipElement) {
    currentFilter = type;

    // Đổi trạng thái active trên các nút chip
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    chipElement.classList.add('active');

    // Vẽ lại bản đồ
    renderReports(mockReports);

    // Lọc danh sách thẻ trong Sidebar
    let filteredList = mockReports;
    if (type !== 'all') {
        if (type === 'nghiem_trong') {
            filteredList = mockReports.filter(r => r.severity === 'nghiem_trong');
        } else {
            filteredList = mockReports.filter(r => r.type === type);
        }
    }
    renderReportCards(filteredList);
}

// 5. Điều khiển Modal Báo Cáo
function openReportModal() {
    document.getElementById('reportModal').classList.add('active');
    
    // Nếu chưa chọn vị trí, gợi ý dùng tâm bản đồ
    if (!selectedLocation) {
        const center = map.getCenter();
        setReportLocation(center.lat, center.lng);
    }
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('active');
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
}

// Chọn loại sự cố trong Form
function selectType(type, button) {
    currentReportType = type;
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// Chọn mức độ nghiêm trọng trong Form
function selectSeverity(sev, button) {
    currentReportSeverity = sev;
    document.querySelectorAll('.sev-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// Đặt vị trí khi người dùng click trên Map
function setReportLocation(lat, lng) {
    selectedLocation = { lat, lng };

    // Cập nhật marker tạm thời
    if (tempMarker) {
        tempMarker.setLatLng([lat, lng]);
    } else {
        tempMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'temp-marker-icon',
                html: `<div style="background: #ef4444; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239,68,68,0.8);"></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            })
        }).addTo(map);
    }

    // Hiển thị tọa độ trên modal
    const gpsEl = document.getElementById('gpsDisplay');
    if (gpsEl) {
        gpsEl.innerHTML = `Tọa độ đã chọn: <b>${lat.toFixed(5)}, ${lng.toFixed(5)}</b>`;
    }

    // Tự động mở modal báo cáo
    openReportModal();
}

// 6. Gửi Báo Cáo Mới (Frontend Handling & Mock Update)
function submitReport() {
    const address = document.getElementById('addressInput').value.trim();
    const desc = document.getElementById('descInput').value.trim();

    if (!address) {
        alert('Vui lòng nhập tên tuyến đường hoặc địa chỉ gặp sự cố!');
        document.getElementById('addressInput').focus();
        return;
    }

    if (!selectedLocation) {
        alert('Vui lòng chọn vị trí trên bản đồ!');
        return;
    }

    // Tạo đối tượng báo cáo mới
    const newReport = {
        id: Date.now(),
        type: currentReportType,
        severity: currentReportSeverity,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address_text: address,
        description: desc,
        confirm_count: 1,
        reject_count: 0,
        created_at: 'Vừa xong'
    };

    // Thêm vào đầu danh sách
    mockReports.unshift(newReport);

    // Cập nhật giao diện
    renderReports(mockReports);
    updateStats(mockReports);

    // Bay tới điểm vừa báo cáo
    map.flyTo([newReport.latitude, newReport.longitude], 16);

    // Reset & Đóng form
    document.getElementById('addressInput').value = '';
    document.getElementById('descInput').value = '';
    closeReportModal();

    alert('🎉 Cảm ơn bạn! Báo cáo sự cố đã được ghi nhận và hiển thị lên bản đồ.');
}

// 7. Bình chọn sự cố (Xác nhận đúng / Báo tin sai)
function voteReport(reportId, voteType) {
    const report = mockReports.find(r => r.id === reportId);
    if (!report) return;

    if (voteType === 'confirm') {
        report.confirm_count += 1;
    } else {
        report.reject_count += 1;
    }

    // Cập nhật lại bản đồ & danh sách
    renderReports(mockReports);
    updateStats(mockReports);
}

// 8. Điều khiển Modal Đăng nhập
function openAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function handleAuthSubmit() {
    const username = document.getElementById('authUsername').value.trim();
    if (!username) {
        alert('Vui lòng nhập tên đăng nhập!');
        return;
    }
    alert(`Chào mừng ${username}! Tính năng đăng nhập đầy đủ kết nối CSDL đang sẵn sàng triển khai tiếp ở Backend.`);
    closeAuthModal();
}
