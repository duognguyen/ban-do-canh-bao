<!-- LỚP PHỦ MỜ KHI MỞ SIDEBAR -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

<!-- KHUNG THANH ĐIỀU HƯỚNG BÊN TRÁI -->
<div class="sidebar" id="sidebar">
    <!-- 1. Menu Chính của Sidebar -->
    <div id="sidebar-main" style="display: flex; flex-direction: column; height: 100%;">
        <div class="sidebar-header">
            <div class="sidebar-brand">
                <div class="logo-icon">
                    <i class="ph-bold ph-waves"></i>
                </div>
                <div class="brand-text">
                    <h2>Cảnh Báo</h2>
                    <p>Bản đồ giao thông & ngập lụt</p>
                </div>
            </div>
            <button class="btn-close-sidebar" onclick="toggleSidebar()">
                <i class="ph ph-x"></i>
            </button>
        </div>
        
        <div class="sidebar-menu">
            <a href="#" class="menu-item" onclick="openSubPanel('Chú giải biểu tượng', 'legend')">
                <i class="ph ph-list-dashes"></i>
                <span>Chú giải</span>
            </a>
            <a href="#" class="menu-item" onclick="openSubPanel('Tin mới nhất', 'news')">
                <i class="ph ph-article"></i>
                <span>Tin mới</span>
            </a>
            <a href="#" class="menu-item" onclick="openSubPanel('Theo dõi khu vực', 'follow')">
                <i class="ph ph-bell"></i>
                <span>Theo dõi</span>
            </a>
        </div>
        
        <div class="sidebar-divider"></div>
        
        <div class="sidebar-links">
            <a href="#" onclick="openSubPanel('Góp ý xây dựng', 'feedback')">
                <i class="ph ph-chat-teardrop-dots"></i> Góp ý
            </a>
            <a href="#" onclick="openSubPanel('Hướng dẫn sử dụng', 'guide')">
                <i class="ph ph-question"></i> Hướng dẫn
            </a>
            <a href="#" onclick="openSubPanel('Nhật ký cập nhật', 'changelog')">
                <i class="ph ph-sparkle"></i> Cập nhật mới
            </a>
        </div>
        
        <div class="sidebar-divider"></div>

        <!-- Phần thông tin tài khoản ở chân Sidebar -->
        <div class="sidebar-footer" style="display:flex; flex-direction:column; gap:12px;">
            <?php if (isset($_SESSION['user_id'])): ?>
                <div style="color: #94a3b8; font-size: 0.9rem; padding: 4px 0; border-bottom: 1px solid #3f3f46; padding-bottom: 8px;">
                    <i class="ph-bold ph-user" style="margin-right: 6px; color: #60a5fa;"></i>
                    Tài khoản: <strong style="color: white;"><?= htmlspecialchars($_SESSION['username'] ?? '') ?></strong>
                    <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                        <span style="background: #3b82f6; color: white; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Admin</span>
                    <?php endif; ?>
                </div>
                <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                    <a href="views/admin/dashboard.php" style="color: #60a5fa; font-weight: 600; font-size: 0.95rem; text-decoration: none;">
                        <i class="ph-bold ph-shield-check" style="margin-right: 8px;"></i> Quản trị Admin
                    </a>
                <?php endif; ?>
                <a href="api/logout.php" style="color: #ef4444; font-weight: 600; font-size: 0.95rem; text-decoration: none;">
                    <i class="ph-bold ph-sign-out" style="margin-right: 8px;"></i> Đăng xuất
                </a>
            <?php else: ?>
                <a href="#" onclick="openSubPanel('Đăng nhập tài khoản', 'login')" style="color: #60a5fa; font-weight: 600; font-size: 1rem; text-decoration: none; display: flex; align-items: center; gap: 8px;">
                    <i class="ph-bold ph-user-circle" style="font-size: 1.3rem;"></i> Đăng nhập / Đăng ký
                </a>
            <?php endif; ?>
        </div>
    </div>

    <!-- 2. Khung Sub-Panel Trượt vào (Hiển thị chi tiết theo từng tính năng) -->
    <div id="sidebar-sub" style="display: none; flex-direction: column; height: 100%;">
        <div class="sidebar-header" style="justify-content: flex-start; gap: 12px;">
            <button class="btn-close-sidebar" onclick="closeSubPanel()" title="Quay lại">
                <i class="ph ph-caret-left"></i>
            </button>
            <h3 id="sub-title" style="color: white; font-size: 1.05rem; flex: 1;">Tiêu đề</h3>
            <button class="btn-close-sidebar" onclick="toggleSidebar()" title="Đóng sidebar">
                <i class="ph ph-x"></i>
            </button>
        </div>
        <div class="sidebar-sub-content" id="sub-content">
            <!-- Nội dung động được render bằng JavaScript -->
        </div>
    </div>
</div>
