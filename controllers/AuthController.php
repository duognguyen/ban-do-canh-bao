<?php
// File: controllers/AuthController.php
// Nghiệp vụ xác thực. Trả về mảng kết quả, KHÔNG echo / redirect (việc đó của api/).
require_once __DIR__ . '/../models/UserModel.php';

class AuthController {
    private $users;

    public function __construct(mysqli $conn)
    {
        $this->users = new UserModel($conn);
    }

    public function register(array $in): array
    {
        $username = trim($in['username'] ?? '');
        $email    = trim($in['email'] ?? '');
        $password = (string)($in['password'] ?? '');
        $confirm  = (string)($in['confirm_password'] ?? '');

        if ($username === '' || $email === '' || $password === '') {
            return $this->fail('Vui lòng điền đầy đủ thông tin!', 422);
        }
        if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username)) {
            return $this->fail('Tên đăng nhập từ 3-30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->fail('Địa chỉ Email không hợp lệ!', 422);
        }
        if (strlen($password) < 6) {
            return $this->fail('Mật khẩu phải có ít nhất 6 ký tự!', 422);
        }
        if ($confirm !== '' && $password !== $confirm) {
            return $this->fail('Mật khẩu xác nhận không khớp!', 422);
        }
        if ($this->users->checkExists($username, $email)) {
            return $this->fail('Tên đăng nhập hoặc email đã tồn tại!', 409);
        }

        try {
            $this->users->register($username, $email, $password);
        } catch (mysqli_sql_exception $e) {
            if ((int)$e->getCode() === 1062) { // trùng do hai request chạy song song
                return $this->fail('Tên đăng nhập hoặc email đã tồn tại!', 409);
            }
            throw $e;
        }
        return ['ok' => true, 'message' => 'Đăng ký tài khoản thành công!', 'data' => null];
    }

    public function login(array $in): array
    {
        $account  = trim($in['username_or_email'] ?? '');
        $password = (string)($in['password'] ?? '');

        if ($account === '' || $password === '') {
            return $this->fail('Vui lòng điền đầy đủ tài khoản và mật khẩu!', 422);
        }

        $user = $this->users->login($account, $password);
        if (!$user) {
            return $this->fail('Tài khoản hoặc mật khẩu không chính xác!', 401);
        }
        if ($user['status'] !== UserModel::STATUS_ACTIVE || (int)$user['reputation_score'] <= 0) {
            return $this->fail('Tài khoản của bạn đã bị khóa do vi phạm điểm uy tín!', 403);
        }

        session_regenerate_id(true); // chống Session Fixation
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        return ['ok' => true, 'message' => 'Đăng nhập thành công!', 'data' => $this->publicUser($user)];
    }

    public function logout(): array
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
        return ['ok' => true, 'message' => 'Đã đăng xuất thành công!', 'data' => null];
    }

    // Trạng thái phiên hiện tại (không báo lỗi nếu chưa đăng nhập)
    public function me(): array
    {
        if (empty($_SESSION['user_id'])) {
            return ['ok' => true, 'data' => ['logged_in' => false, 'user' => null]];
        }
        $user = $this->users->findById((int)$_SESSION['user_id']);
        if (!$user || $user['status'] !== UserModel::STATUS_ACTIVE) {
            $_SESSION = [];
            return ['ok' => true, 'data' => ['logged_in' => false, 'user' => null]];
        }
        return ['ok' => true, 'data' => ['logged_in' => true, 'user' => $this->publicUser($user)]];
    }

    private function publicUser(array $u): array
    {
        return [
            'id'               => (int)$u['id'],
            'username'         => $u['username'],
            'email'            => $u['email'] ?? '',
            'role'             => $u['role'],
            'reputation_score' => (int)$u['reputation_score'],
        ];
    }

    private function fail(string $error, int $code): array
    {
        return ['ok' => false, 'error' => $error, 'code' => $code];
    }
}
