<?php
// File: views/admin/dashboard.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Chặn truy cập trái phép trực tiếp vào file view
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    header('Location: index.php?route=admin_login');
    exit;
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trang Quản Trị - Hệ Thống Cảnh Báo Ngập Lụt</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background: #f1f5f9; color: #1e293b; display: flex; min-height: 100vh; }
        
        /* Sidebar Admin */
        .admin-sidebar { width: 260px; background: #0f172a; color: #fff; display: flex; flex-direction: column; padding: 20px; }
        .admin-brand { font-size: 1.15rem; font-weight: 700; color: #38bdf8; margin-bottom: 30px; display: flex; align-items: center; gap: 10px; }
        .admin-menu { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .admin-menu a { color: #94a3b8; text-decoration: none; padding: 12px 16px; border-radius: 8px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .admin-menu a:hover, .admin-menu a.active { background: #1e293b; color: #fff; }
        
        /* Content chính */
        .admin-main { flex: 1; display: flex; flex-direction: column; }
        .admin-header { background: #fff; padding: 16px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
        .admin-content { padding: 30px; overflow-y: auto; }
        
        /* Thẻ thống kê */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6; }
        .stat-card h4 { color: #64748b; font-size: 0.875rem; margin-bottom: 8px; }
        .stat-card .number { font-size: 1.75rem; font-weight: 700; color: #0f172a; }
        
        /* Bảng dữ liệu */
        .card-table { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
        .card-table h3 { margin-bottom: 15px; font-size: 1.1rem; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
        th { background: #f8fafc; font-weight: 600; color: #475569; }
        
        .badge-admin { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .badge-user { background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        
        .btn { padding: 6px 12px; border-radius: 6px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
        .btn-danger { background: #ef4444; color: #fff; }
        .btn-success { background: #22c55e; color: #fff; }
        .btn:hover { opacity: 0.9; }
    </style>
</head>
<body>

    <!-- Sidebar Quản trị -->
    <div class="admin-sidebar">
        <div class="admin-brand">
            <i class="ph-bold ph-shield-check" style="font-size: 1.3rem;"></i> Quản Trị Hệ Thống
        </div>
        <div class="admin-menu">
            <a href="index.php?route=admin_dashboard" class="active"><i class="ph ph-users"></i> Quản lý tài khoản</a>
            <a href="index.php?route=home"><i class="ph ph-map-pin"></i> Xem bản đồ chính</a>
            <a href="index.php?route=logout"><i class="ph ph-sign-out"></i> Đăng xuất</a>
        </div>
    </div>

    <!-- Nội dung chính -->
    <div class="admin-main">
        <div class="admin-header">
            <h2>Bảng điều khiển quản trị</h2>
            <span>Xin chào, <strong><?= htmlspecialchars($_SESSION['username'] ?? 'Admin') ?></strong></span>
        </div>

        <div class="admin-content">
            <!-- Thống kê nhanh -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Tổng số thành viên</h4>
                    <div class="number"><?= count($users ?? []) ?></div>
                </div>
            </div>

            <!-- Bảng danh sách người dùng -->
            <div class="card-table">
                <h3>Danh sách thành viên hệ thống</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Điểm uy tín</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($users)): ?>
                            <?php foreach ($users as $u): ?>
                                <tr>
                                    <td><?= $u['id'] ?></td>
                                    <td><strong><?= htmlspecialchars($u['username']) ?></strong></td>
                                    <td><?= htmlspecialchars($u['email']) ?></td>
                                    <td>
                                        <span class="<?= ($u['role'] === 'admin') ? 'badge-admin' : 'badge-user' ?>">
                                            <?= strtoupper($u['role']) ?>
                                        </span>
                                    </td>
                                    <td>⭐ <?= (int)$u['reputation_score'] ?></td>
                                    <td><?= ((int)$u['status'] === 1) ? '🟢 Hoạt động' : '🔴 Đã khóa' ?></td>
                                    <td>
                                        <?php if ((int)$u['id'] !== (int)$_SESSION['user_id']): ?>
                                            <form action="index.php?route=admin_update_status" method="POST" style="display:inline;">
                                                <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                                                <?php if ((int)$u['status'] === 1): ?>
                                                    <input type="hidden" name="action" value="block">
                                                    <button type="submit" class="btn btn-danger" onclick="return confirm('Bạn có chắc muốn khóa tài khoản này?')">Khóa</button>
                                                <?php else: ?>
                                                    <input type="hidden" name="action" value="reset_reputation">
                                                    <button type="submit" class="btn btn-success" onclick="return confirm('Mở khóa và khôi phục tài khoản này?')">Mở khóa</button>
                                                <?php endif; ?>
                                            </form>
                                        <?php else: ?>
                                            <em>(Tài khoản của bạn)</em>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr><td colspan="7" style="text-align: center; color: #64748b;">Chưa có dữ liệu thành viên nào.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</body>
</html>