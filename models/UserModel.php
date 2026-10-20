<?php
<<<<<<< HEAD
class UserModel {
=======
// File: models/UserModel.php
// Chỉ làm việc với bảng `users`. Không echo, không redirect.
class UserModel {
    const STATUS_ACTIVE  = 'active';
    const STATUS_BLOCKED = 'blocked';
    const DEFAULT_REPUTATION = 10;

>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

<<<<<<< HEAD
    // 1. Đăng ký tài khoản
    public function register($username, $email, $password)
    {
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
        $sql = "INSERT INTO users(username, email, password) VALUES (?, ?, ?)";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sss", $username, $email, $hashed_password);

        // Sửa lỗi: execute() thay vì excute()
        return $stmt->execute();
    }

    // 2. Đăng nhập
    public function login($username_or_email, $password)
    {
        $sql = "SELECT * FROM users WHERE username = ? OR email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ss", $username_or_email, $username_or_email);
        $stmt->execute();

        $result = $stmt->get_result();
        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password'])) {
                return $user;
            }
=======
    // Kiểm tra username hoặc email đã tồn tại chưa
    public function checkExists($username, $email)
    {
        $sql = "SELECT username, email FROM users WHERE username = ? OR email = ? LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function findById($id)
    {
        $stmt = $this->conn->prepare(
            "SELECT id, username, email, role, status, reputation_score, created_at FROM users WHERE id = ? LIMIT 1"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: null;
    }

    // Đăng ký tài khoản (role mặc định 'user' theo schema)
    public function register($username, $email, $password)
    {
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->conn->prepare("INSERT INTO users(username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $hashed);
        return $stmt->execute();
    }

    // Đăng nhập: trả về mảng user hoặc false.
    // Tài khoản cũ lưu mật khẩu thô trong phpMyAdmin vẫn đăng nhập được và sẽ được băm lại ngay.
    public function login($username_or_email, $password)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1");
        $stmt->bind_param("ss", $username_or_email, $username_or_email);
        $stmt->execute();

        $user = $stmt->get_result()->fetch_assoc();
        if (!$user) {
            return false;
        }

        if (password_verify($password, $user['password'])) {
            return $user;
        }

        if (hash_equals((string)$user['password'], (string)$password)) {
            $this->updatePassword((int)$user['id'], $password);
            return $user;
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
        }
        return false;
    }

<<<<<<< HEAD
    // 3. Trừ điểm uy tín
    public function deductReputation($user_id, $points = 1)
    {
        $sql = "UPDATE users SET reputation_score = reputation_score - ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
=======
    private function updatePassword($id, $plainPassword)
    {
        $hashed = password_hash($plainPassword, PASSWORD_BCRYPT);
        $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param("si", $hashed, $id);
        $stmt->execute();
    }

    public function listAll()
    {
        $result = $this->conn->query(
            "SELECT id, username, email, role, status, reputation_score, created_at FROM users ORDER BY id DESC"
        );
        return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Đổi trạng thái: 'active' | 'blocked'. Khi mở khóa có thể khôi phục điểm uy tín.
    public function setStatus($id, $status, $resetReputation = false)
    {
        if ($status === self::STATUS_ACTIVE && $resetReputation) {
            $score = self::DEFAULT_REPUTATION;
            $stmt = $this->conn->prepare("UPDATE users SET status = ?, reputation_score = ? WHERE id = ?");
            $stmt->bind_param("sii", $status, $score, $id);
        } else {
            $stmt = $this->conn->prepare("UPDATE users SET status = ? WHERE id = ?");
            $stmt->bind_param("si", $status, $id);
        }
        return $stmt->execute();
    }

    // Trừ điểm uy tín (không xuống dưới 0)
    public function deductReputation($user_id, $points = 1)
    {
        $stmt = $this->conn->prepare("UPDATE users SET reputation_score = GREATEST(0, reputation_score - ?) WHERE id = ?");
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
        $stmt->bind_param("ii", $points, $user_id);
        return $stmt->execute();
    }
}
<<<<<<< HEAD
?>
=======
>>>>>>> b529d5532351d06f7155cfae825f76215baafc4a
