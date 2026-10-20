<?php
// File: controllers/AuthController.php
class AuthController {
    public function showLogin() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        // Nếu đã đăng nhập thì tự động chuyển trang theo quyền
        if (isset($_SESSION['user_id'])) {
            if (($_SESSION['role'] ?? 'user') === 'admin') {
                header('Location: index.php?route=admin_dashboard');
            } else {
                header('Location: index.php?route=home');
            }
            exit;
        }
        require_once __DIR__ . '/../views/auth/login.php';
    }

    public function showRegister() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (isset($_SESSION['user_id'])) {
            header('Location: index.php?route=home');
            exit;
        }
        require_once __DIR__ . '/../views/auth/register.php';
    }

    public function logout() {
        require_once __DIR__ . '/../api/logout.php';
    }
}