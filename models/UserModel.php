<?php
class UserModel {
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

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
        }
        return false;
    }

    // 3. Trừ điểm uy tín
    public function deductReputation($user_id, $points = 1)
    {
        $sql = "UPDATE users SET reputation_score = reputation_score - ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $points, $user_id);
        return $stmt->execute();
    }
}
?>