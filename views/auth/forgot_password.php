<?php
// File: views/auth/forgot_password.php
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
    <title>Quên mật khẩu - Bản đồ Cảnh báo Giao thông & Ngập lụt</title>
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
            background: #f59e0b;
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
            margin-bottom: 6px;
        }
        .auth-subtitle {
            font-size: 0.88rem;
            color: #94a3b8;
            line-height: 1.5;
        }
        .form-group {
            margin-bottom: 18px;
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
            background: #f59e0b;
            color: white;
            border: none;
            padding: 13px;
            border-radius: 12px;
            font-size: 0.98rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-primary:hover {
            background: #d97706;
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
    </style>
</head>
<body>
    <div class="auth-card">
        <div class="auth-header">
            <div class="auth-logo">
                <i class="ph-bold ph-key"></i>
            </div>
            <h1 class="auth-title">Khôi Phục Mật Khẩu</h1>
            <p class="auth-subtitle">
                Nhập địa chỉ email tài khoản của bạn để nhận liên kết và mã OTP đặt lại mật khẩu có thời hạn 15 phút.
            </p>
        </div>

        <form onsubmit="handleForgotSubmit(event)">
            <div class="form-group">
                <label class="form-label" for="emailInput">Địa chỉ Email tài khoản</label>
                <input type="email" id="emailInput" class="form-input" placeholder="email@domain.com" required>
            </div>

            <button type="submit" id="btnForgot" class="btn-primary">
                Gửi liên kết & Mã OTP
            </button>
        </form>

        <div class="auth-footer">
            <a href="index.php?route=login">&larr; Quay lại Đăng nhập</a>
            <div style="margin-top: 14px;">
                <a href="index.php?route=home" style="color: #94a3b8; font-weight: normal; font-size: 0.85rem;">Quay lại xem Bản đồ chính</a>
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

        async function handleForgotSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('btnForgot');
            const email = document.getElementById('emailInput').value.trim();

            btn.disabled = true;
            btn.innerText = 'Đang xử lý...';

            try {
                const res = await Api.forgotPassword(email);
                showPageToast('Đã gửi mã OTP và liên kết đặt lại mật khẩu!', true);
                setTimeout(() => {
                    // Chuyển hướng sang trang reset password kèm query
                    let url = 'index.php?route=reset_password&email=' + encodeURIComponent(email);
                    if (res && res.debug_token) {
                        url += '&token=' + encodeURIComponent(res.debug_token);
                    }
                    if (res && res.debug_otp) {
                        url += '&otp=' + encodeURIComponent(res.debug_otp);
                    }
                    window.location.href = url;
                }, 800);
            } catch (err) {
                showPageToast(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu!', false);
                btn.disabled = false;
                btn.innerText = 'Gửi liên kết & Mã OTP';
            }
        }
    </script>
</body>
</html>

