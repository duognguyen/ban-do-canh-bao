<?php
// File: views/auth/login.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION['user_id'])) {
    header('Location: index.php?route=home');
    exit;
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập - Bản đồ Cảnh báo Giao thông & Ngập lụt</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" />
    <link rel="stylesheet" href="public/css/style.css">
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: radial-gradient(circle at 50% 20%, #1e293b, #0f172a 75%);
            color: #f8fafc;
            padding: 20px;
        }
        .auth-card {
            width: 100%;
            max-width: 440px;
            background: #18181b;
            border: 1px solid #3f3f46;
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .auth-header {
            text-align: center;
            margin-bottom: 24px;
        }
        .auth-logo {
            width: 52px;
            height: 52px;
            background: #0284c7;
            border-radius: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: white;
            margin-bottom: 12px;
        }
        .auth-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: white;
            margin-bottom: 4px;
        }
        .auth-subtitle {
            font-size: 0.88rem;
            color: #94a3b8;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-label {
            display: block;
            font-size: 0.85rem;
            font-weight: 500;
            color: #cbd5e1;
            margin-bottom: 6px;
        }
        .btn-primary {
            width: 100%;
            background: #2563eb;
            color: white;
            border: none;
            padding: 13px;
            border-radius: 12px;
            font-size: 0.98rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            margin-top: 8px;
        }
        .btn-primary:hover {
            background: #1d4ed8;
        }
        .auth-footer {
            text-align: center;
            margin-top: 24px;
            font-size: 0.88rem;
            color: #94a3b8;
        }
        .auth-footer a {
            color: #60a5fa;
            font-weight: 600;
            text-decoration: none;
        }
        .auth-footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="auth-card">
        <div class="auth-header">
            <div class="auth-logo">
                <i class="ph-bold ph-waves"></i>
            </div>
            <h1 class="auth-title">Đăng Nhập Tài Khoản</h1>
            <p class="auth-subtitle">Bản đồ Cảnh báo Điểm ngập & Kẹt xe Cộng đồng</p>
        </div>

        <form id="loginForm" onsubmit="handleLoginPageSubmit(event)">
            <div class="form-group">
                <label class="form-label" for="accountInput">Tên đăng nhập, Email hoặc Số điện thoại</label>
                <input type="text" id="accountInput" class="form-input" placeholder="Nhập tài khoản" required autocomplete="username">
            </div>

            <div class="form-group">
                <label class="form-label" for="passwordInput">Mật khẩu</label>
                <input type="password" id="passwordInput" class="form-input" placeholder="Nhập mật khẩu" required autocomplete="current-password">
            </div>

            <!-- Ghi nhớ đăng nhập 30 ngày & Quên mật khẩu -->
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:16px;">
                <label style="display:flex; align-items:center; gap:8px; color:#cbd5e1; cursor:pointer;">
                    <input type="checkbox" id="rememberMeInput" checked style="width:17px; height:17px; accent-color:#2563eb;">
                    <span>Ghi nhớ đăng nhập (30 ngày)</span>
                </label>
                <a href="index.php?route=forgot_password" style="color:#60a5fa; text-decoration:none;">Quên mật khẩu?</a>
            </div>

            <button type="submit" id="btnLogin" class="btn-primary">
                Đăng nhập
            </button>
        </form>

        <div class="auth-footer">
            Chưa có tài khoản? <a href="index.php?route=register">Đăng ký ngay</a>
            <div style="margin-top: 14px;">
                <a href="index.php?route=home" style="color: #94a3b8; font-weight: normal; font-size: 0.85rem;">&larr; Quay lại xem Bản đồ chính</a>
            </div>
        </div>
    </div>

    <script src="public/js/api.js"></script>
    <script>
        function showPageToast(msg, isSuccess = true) {
            const old = document.getElementById('toast');
            if (old) old.remove();
            const t = document.createElement('div');
            t.id = 'toast';
            t.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:99999; padding:12px 24px; border-radius:10px; font-weight:600; font-size:0.95rem; color:white; background:' + (isSuccess ? '#059669' : '#dc2626') + '; box-shadow:0 4px 16px rgba(0,0,0,0.3);';
            t.innerText = msg;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3500);
        }

        async function handleLoginPageSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('btnLogin');
            const account = document.getElementById('accountInput').value.trim();
            const password = document.getElementById('passwordInput').value;
            const rememberMe = document.getElementById('rememberMeInput').checked;

            btn.disabled = true;
            btn.innerText = 'Đang đăng nhập...';

            try {
                const res = await Api.login(account, password, rememberMe);
                showPageToast('Đăng nhập thành công! Đang chuyển hướng...', true);
                setTimeout(() => {
                    if (res && res.role === 'admin') {
                        window.location.href = 'index.php?route=admin_dashboard';
                    } else {
                        window.location.href = 'index.php?route=home';
                    }
                }, 600);
            } catch (err) {
                showPageToast(err.message || 'Đăng nhập thất bại!', false);
                btn.disabled = false;
                btn.innerText = 'Đăng nhập';
            }
        }
    </script>
</body>
</html>

