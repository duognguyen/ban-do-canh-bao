<?php
require_once __DIR__ . '/views/layout/header.php';
?>

<!-- BẢN ĐỒ TOÀN MÀN HÌNH -->
<div id="map"></div>

<!-- THANH ĐIỀU HƯỚNG NỔI TRÊN ĐẦU (TOP NAV) -->
<header class="top-nav">
    <div class="brand-badge" onclick="toggleSidebar()">
        <div class="brand-icon">
            <i class="ph-fill ph-waves"></i>
        </div>
        <div class="brand-info">
            <h1>Cảnh Báo Đô Thị</h1>
            <p>Bản đồ điểm ngập & kẹt xe</p>
        </div>
    </div>

    <div class="nav-actions">
        <button class="btn-icon" title="Danh sách cảnh báo" onclick="toggleSidebar()">
            <i class="ph-bold ph-list-dashes"></i>
        </button>
        <button class="btn-icon" title="Tài khoản / Đăng nhập" onclick="openAuthModal()">
            <i class="ph-bold ph-user"></i>
        </button>
        <button class="btn-report-main" onclick="openReportModal()">
            <i class="ph-bold ph-warning-circle"></i>
            <span>Báo cáo sự cố</span>
        </button>
    </div>
</header>

<!-- THANH BỘ LỌC NỔI (FILTER CHIPS) -->
<nav class="floating-filters" aria-label="Bộ lọc sự cố">
    <div class="filter-chip active" data-filter="all" onclick="filterReports('all', this)">
        <i class="ph-bold ph-squares-four"></i> Tất cả (<span id="count-all">0</span>)
    </div>
    <div class="filter-chip chip-flood" data-filter="ngap_nuoc" onclick="filterReports('ngap_nuoc', this)">
        <i class="ph-fill ph-drop"></i> Điểm ngập (<span id="count-flood">0</span>)
    </div>
    <div class="filter-chip chip-traffic" data-filter="ket_xe" onclick="filterReports('ket_xe', this)">
        <i class="ph-fill ph-car"></i> Kẹt xe (<span id="count-traffic">0</span>)
    </div>
    <div class="filter-chip" data-filter="nghiem_trong" onclick="filterReports('nghiem_trong', this)">
        <i class="ph-fill ph-warning"></i> Nghiêm trọng (<span id="count-danger">0</span>)
    </div>
</nav>

<!-- NÚT ĐIỀU KHIỂN BẢN ĐỒ PHÍA DƯỚI GÓC PHẢI -->
<div class="map-controls-right">
    <button class="map-control-btn" title="Vị trí của tôi" onclick="locateUser()">
        <i class="ph-bold ph-crosshair"></i>
    </button>
    <button class="map-control-btn" title="Thu phóng mặc định" onclick="resetMapView()">
        <i class="ph-bold ph-compass"></i>
    </button>
</div>

<!-- SIDEBAR DRAWER (DANH SÁCH CÁC ĐIỂM CẢNH BÁO) -->
<aside class="sidebar-drawer" id="sidebarDrawer">
    <div class="drawer-header">
        <h2><i class="ph-bold ph-broadcast" style="color: #ef4444;"></i> Cảnh báo gần đây</h2>
        <button class="btn-close-drawer" onclick="toggleSidebar()">
            <i class="ph ph-x"></i>
        </button>
    </div>

    <!-- Thống kê nhanh -->
    <div class="drawer-stats">
        <div class="stat-box">
            <div class="stat-label"><i class="ph-fill ph-drop"></i> Điểm ngập</div>
            <div class="stat-num stat-flood" id="stat-flood-num">0</div>
        </div>
        <div class="stat-box">
            <div class="stat-label"><i class="ph-fill ph-car"></i> Kẹt xe</div>
            <div class="stat-num stat-traffic" id="stat-traffic-num">0</div>
        </div>
    </div>

    <!-- Danh sách thẻ báo cáo -->
    <div class="drawer-content" id="reportsListContainer">
        <!-- Render bằng JavaScript -->
    </div>
</aside>

<!-- MODAL BÁO CÁO SỰ CỐ MỚI -->
<div class="modal-backdrop" id="reportModal">
    <div class="modal-box">
        <div class="modal-header">
            <h3><i class="ph-bold ph-megaphone" style="color: #ef4444;"></i> Báo Cáo Điểm Ngập / Kẹt Xe</h3>
            <button class="btn-close-modal" onclick="closeReportModal()">
                <i class="ph ph-x"></i>
            </button>
        </div>
        <div class="modal-body">
            <!-- Chọn loại sự cố -->
            <div class="form-group">
                <label>Loại sự cố *</label>
                <div class="type-selector">
                    <button type="button" class="type-btn flood active" onclick="selectType('ngap_nuoc', this)">
                        <i class="ph-fill ph-drop"></i>
                        <span>Ngập Nước</span>
                    </button>
                    <button type="button" class="type-btn traffic" onclick="selectType('ket_xe', this)">
                        <i class="ph-fill ph-car"></i>
                        <span>Kẹt Xe</span>
                    </button>
                </div>
            </div>

            <!-- Chọn mức độ nghiêm trọng -->
            <div class="form-group">
                <label>Mức độ nghiêm trọng *</label>
                <div class="severity-selector">
                    <button type="button" class="sev-btn nhe" onclick="selectSeverity('nhe', this)">Nhẹ</button>
                    <button type="button" class="sev-btn vua active" onclick="selectSeverity('vua', this)">Vừa phải</button>
                    <button type="button" class="sev-btn nghiem_trong" onclick="selectSeverity('nghiem_trong', this)">Nghiêm trọng</button>
                </div>
            </div>

            <!-- Tọa độ GPS đã chọn -->
            <div class="gps-info-box">
                <i class="ph-bold ph-map-pin"></i>
                <span id="gpsDisplay">Vui lòng click trên bản đồ hoặc dùng GPS</span>
            </div>

            <!-- Tên tuyến đường / Địa chỉ -->
            <div class="form-group">
                <label for="addressInput">Địa chỉ / Tuyến đường *</label>
                <input type="text" id="addressInput" class="form-control" placeholder="Ví dụ: Ngã tư Trần Phú - Nguyễn Thị Minh Khai">
            </div>

            <!-- Mô tả chi tiết -->
            <div class="form-group">
                <label for="descInput">Mô tả chi tiết</label>
                <textarea id="descInput" class="form-control" rows="3" placeholder="Ví dụ: Nước ngập nửa bánh xe máy, xe chết máy hàng loạt..."></textarea>
            </div>
        </div>

        <div class="modal-footer">
            <button type="button" class="btn-secondary" onclick="closeReportModal()">Hủy</button>
            <button type="button" class="btn-primary" onclick="submitReport()">Gửi Báo Cáo</button>
        </div>
    </div>
</div>

<!-- MODAL ĐĂNG NHẬP / ĐĂNG KÝ -->
<div class="modal-backdrop" id="authModal">
    <div class="modal-box">
        <div class="modal-header">
            <h3><i class="ph-bold ph-user-circle" style="color: #38bdf8;"></i> Tài Khoản Người Dùng</h3>
            <button class="btn-close-modal" onclick="closeAuthModal()">
                <i class="ph ph-x"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label for="authUsername">Tên tài khoản</label>
                <input type="text" id="authUsername" class="form-control" placeholder="Nhập tên đăng nhập">
            </div>
            <div class="form-group">
                <label for="authPassword">Mật khẩu</label>
                <input type="password" id="authPassword" class="form-control" placeholder="••••••••">
            </div>
            <p style="font-size: 0.8rem; color: #94a3b8; text-align: center; margin-top: 4px;">
                Đăng nhập để nhận điểm uy tín khi báo tin và xác nhận tin tức giao thông.
            </p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn-secondary" onclick="closeAuthModal()">Đóng</button>
            <button type="button" class="btn-primary" onclick="handleAuthSubmit()">Đăng Nhập</button>
        </div>
    </div>
</div>

<?php
require_once __DIR__ . '/views/layout/footer.php';
?>
