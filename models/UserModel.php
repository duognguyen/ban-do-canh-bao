<?php
// File: models/UserModel.php
class UserModel {
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // 0. Kiểm tra username hoặc email đã tồn tại chưa (Tránh lỗi Fatal Error khi trùng)
    public function checkExists($username, $email)
    {
        $sql = "SELECT username, email FROM users WHERE username = ? OR email = ? LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    // 1. Đăng ký tài khoản (Mặc định role là 'user')
    public function register($username, $email, $password)
    {
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
        $sql = "INSERT INTO users(username, email, password) VALUES (?, ?, ?)";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sss", $username, $email, $hashed_password);

        return $stmt->execute();
    }

    // 2. Đăng nhập (Trả về mảng thông tin user bao gồm cả cột role)
    public function login($username_or_email, $password)
    {
        $sql = "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ss", $username_or_email, $username_or_email);
        $stmt->execute();

        $result = $stmt->get_result();
        if ($user = $result->fetch_assoc()) {
            // Hỗ trợ cả mật khẩu mã hóa BCRYPT và mật khẩu nhập trực tiếp trong phpMyAdmin
            if (password_verify($password, $user['password']) || $password === $user['password']) {
                return $user;
            }
        }
        return false;
    }

    // 3. Trừ điểm uy tín (Không cho phép điểm âm dưới 0)
    public function deductReputation($user_id, $points = 1)
    {
        $sql = "UPDATE users SET reputation_score = GREATEST(0, reputation_score - ?) WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $points, $user_id);
        return $stmt->execute();
    }
}
