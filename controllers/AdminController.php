<?php
// File: controllers/AdminController.php
// Nghiệp vụ quản trị. KHÔNG echo / redirect / render view (view lấy dữ liệu qua API).
require_once __DIR__ . '/../models/UserModel.php';

class AdminController {
    private $users;

    public function __construct(mysqli $conn) {
        $this->users = new UserModel($conn);
    }

    public function listUsers(): array {
        return ['ok' => true, 'data' => $this->users->listAll()];
    }

    // action: 'block' | 'unblock'
    public function updateUserStatus(int $adminId, array $in): array {
        $userId = (int)($in['user_id'] ?? 0);
        $action = $in['action'] ?? '';

        if ($userId <= 0 || !in_array($action, ['block', 'unblock'], true)) {
            return ['ok' => false, 'error' => 'Dữ liệu không hợp lệ', 'code' => 422];
        }
        if ($userId === $adminId) {
            return ['ok' => false, 'error' => 'Bạn không thể thay đổi trạng thái tài khoản của chính mình', 'code' => 403];
        }
        if (!$this->users->findById($userId)) {
            return ['ok' => false, 'error' => 'Người dùng không tồn tại', 'code' => 404];
        }

        if ($action === 'block') {
            $this->users->setStatus($userId, UserModel::STATUS_BLOCKED);
            $message = 'Đã khóa tài khoản';
        } else {
            $this->users->setStatus($userId, UserModel::STATUS_ACTIVE, true); // khôi phục điểm uy tín
            $message = 'Đã mở khóa và khôi phục tài khoản';
        }
        return ['ok' => true, 'message' => $message, 'data' => $this->users->findById($userId)];
    }
}
