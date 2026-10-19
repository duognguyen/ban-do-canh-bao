<?php
// File: controllers/ReportController.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/ReportModel.php';

class ReportController {
    private $conn;
    private $reportModel;

    public function __construct() {
        global $conn;
        if (!isset($conn) || $conn === null) {
            die("<h3 style='color: red;'>Lỗi kết nối cơ sở dữ liệu!</h3>");
        }
        $this->conn = $conn;
        $this->reportModel = new ReportModel($this->conn);
    }

    public function add() {
        $isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') 
                  || isset($_POST['ajax']) 
                  || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

        // 1. Kiểm tra đăng nhập
        if (!isset($_SESSION['user_id'])) {
            if ($isAjax) {
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['status' => 'error', 'message' => 'Vui lòng đăng nhập để gửi báo cáo sự cố!'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $_SESSION['flash_error'] = "Vui lòng đăng nhập để gửi báo cáo sự cố!";
            header("Location: index.php?route=home");
            exit;
        }

        // 2. Chỉ nhận request POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header("Location: index.php?route=home");
            exit;
        }

        $userId      = (int)$_SESSION['user_id'];
        $type        = $_POST['type'] ?? 'ngap_nuoc';
        $severity    = $_POST['severity'] ?? 'vua';
        $latitude    = (float)($_POST['latitude'] ?? 0);
        $longitude   = (float)($_POST['longitude'] ?? 0);
        $addressText = trim($_POST['address_text'] ?? '');
        $description = trim($_POST['description'] ?? '');

        // Kiểm tra hợp lệ tọa độ
        if ($latitude == 0 || $longitude == 0) {
            if ($isAjax) {
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['status' => 'error', 'message' => 'Vui lòng chọn vị trí trên bản đồ!'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $_SESSION['flash_error'] = "Vui lòng chọn vị trí trên bản đồ!";
            header("Location: index.php?route=home");
            exit;
        }

        // Xử lý upload ảnh nếu có
        $imageUrl = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../public/images/reports/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            if (in_array($extension, $allowedExtensions)) {
                $newFileName = time() . '_' . uniqid() . '.' . $extension;
                $targetFilePath = $uploadDir . $newFileName;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
                    $imageUrl = 'public/images/reports/' . $newFileName;
                }
            }
        }

        // 3. Lưu vào cơ sở dữ liệu
        $success = $this->reportModel->createReport(
            $userId,
            $type,
            $severity,
            $latitude,
            $longitude,
            $addressText,
            $description,
            $imageUrl
        );

        $isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') 
                  || isset($_POST['ajax']) 
                  || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status'  => $success ? 'success' : 'error',
                'message' => $success ? 'Gửi báo cáo sự cố thành công!' : 'Có lỗi xảy ra khi lưu vào cơ sở dữ liệu!'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($success) {
            $_SESSION['flash_success'] = "Gửi báo cáo sự cố thành công!";
        } else {
            $_SESSION['flash_error'] = "Có lỗi xảy ra khi lưu vào cơ sở dữ liệu!";
        }

        header("Location: index.php?route=home");
        exit;
    }
}
