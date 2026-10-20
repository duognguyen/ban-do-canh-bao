<?php
// File: controllers/AdminController.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/db.php';

class AdminController {
    private $conn;

    public function __construct() {
        global $conn;
        if (!isset($conn) || $conn === null) {
            die("<h3 style='color: red; font-family: sans-serif;'>Lỗi kết nối cơ sở dữ liệu!</h3>");
        }
        $this->conn = $conn;
        
        // Kiểm tra quyền Admin bảo mật tuyệt đối
        if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
            header('Location: index.php?route=admin_login');
            exit;
        }
    }

    public function index() {
        $this->dashboard();
    }

    public function dashboard() {
        // Lấy danh sách toàn bộ user an toàn
        $users = [];
        $sql = "SELECT id, username, email, role, reputation_score, status FROM users ORDER BY id DESC";
        $result = $this->conn->query($sql);
        
        if ($result && $result->num_rows > 0) {
            $users = $result->fetch_all(MYSQLI_ASSOC);
        }
        
        // --- SỬA THÀNH ĐOẠN NÀY ĐỂ TRÁNH LỆCH ĐƯỜNG DẪN ---
        $viewPath = $_SERVER['DOCUMENT_ROOT'] . '/ban-do-canh-bao/views/admin/dashboard.php';
        if (file_exists($viewPath)) {
            require_once $viewPath;
        } else {
            // Fallback nếu chạy trên hosting hoặc thư mục gốc khác
            require_once __DIR__ . '/../views/admin/dashboard.php';
        }
        exit;
    }

    public function updateUserStatus() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user_id = (int)($_POST['user_id'] ?? 0);
            $action = $_POST['action'] ?? ''; // 'block' hoặc 'reset_reputation'

            if ($action === 'block') {
                $stmt = $this->conn->prepare("UPDATE users SET status = 0 WHERE id = ?");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
            } elseif ($action === 'reset_reputation') {
                $stmt = $this->conn->prepare("UPDATE users SET reputation_score = 100, status = 1 WHERE id = ?");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
            }
            header('Location: index.php?route=admin_dashboard');
            exit;
        }
    }
}