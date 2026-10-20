<?php
// File: views/auth/reset_password.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$token = $_GET['token'] ?? '';
$email = $_GET['email'] ?? '';
$otp   = $_GET['otp'] ?? '';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu - Bản đồ Cảnh báo Giao thông & Ngập lụt</title>
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
            background: #10b981;
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
            background: #10b981;
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
            background: #059669;
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
                <i class="ph-bold ph-shield-check"></i>
            </div>
            <h1 class="auth-title">Đặt Lại Mật Khẩu</h1>
            <p class="auth-subtitle">
                <?= !empty($token) 
                    ? 'Xác thực qua liên kết chứa token bảo mật (thời hạn 15 phút).' 
                    : 'Nhập thông tin mã OTP nhận được trong email (thời hạn 15 phút).' ?>
            </p>
        </div>

        <?php if (!empty($otp)): ?>
            <div style="background:#1e3a5f; border:1px dashed #3b82f6; color:#93c5fd; padding:10px 14px; border-radius:10px; font-size:0.83rem; margin-bottom:16px;">
                💡 <b>Môi trường thử nghiệm:</b> Mã OTP của bạn là: <span style="font-size:1.15rem; font-weight:bold; color:white; letter-spacing:2px;"><?= htmlspecialchars($otp) ?></span>
            </div>
        <?php endif; ?>

        <form onsubmit="handleResetSubmit(event)">
            <input type="hidden" id="tokenInput" value="<?= htmlspecialchars($token) ?>">

            <?php if (empty($token)): ?>
                <div class="form-group">
                    <label class="form-label">Email tài khoản</label>
                    <input type="email" id="emailInput" class="form-input" value="<?= htmlspecialchars($email) ?>" placeholder="email@domain.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Mã OTP (6 số)</label>
                    <input type="text" id="otpInput" class="form-input" value="<?= htmlspecialchars($otp) ?>" maxlength="6" placeholder="000000" style="text-align:center; font-size:1.3rem; letter-spacing:6px; font-weight:bold;" required>
                </div>
            <?php endif; ?>

            <div class="form-group">
                <label class="form-label" for="passwordInput">Mật khẩu mới</label>
                <input type="password" id="passwordInput" class="form-input" placeholder="Ít nhất 6 ký tự" required minlength="6" autocomplete="new-password">
            </div>

            <div class="form-group">
                <label class="form-label" for="confirmPasswordInput">Xác nhận mật khẩu mới</label>
                <input type="password" id="confirmPasswordInput" class="form-input" placeholder="Nhập lại mật khẩu mới" required minlength="6" autocomplete="new-password">
            </div>

            <button type="submit" id="btnReset" class="btn-primary">
                Cập nhật mật khẩu mới
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

        async function handleResetSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('btnReset');
            const token = document.getElementById('tokenInput') ? document.getElementById('tokenInput').value.trim() : '';
            const emailEl = document.getElementById('emailInput');
            const otpEl = document.getElementById('otpInput');
            const email = emailEl ? emailEl.value.trim() : '';
            const otp = otpEl ? otpEl.value.trim() : '';
            const password = document.getElementById('passwordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;

            if (password.length < 6) {
                showPageToast('Mật khẩu mới phải có ít nhất 6 ký tự!', false);
                return;
            }
            if (password !== confirmPassword) {
                showPageToast('Mật khẩu xác nhận không khớp!', false);
                return;
            }

            btn.disabled = true;
            btn.innerText = 'Đang cập nhật...';

            try {
                await Api.resetPassword({
                    token: token,
                    email: email,
                    otp: otp,
                    password: password,
                    confirm_password: confirmPassword
                });
                showPageToast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', true);
                setTimeout(() => {
                    window.location.href = 'index.php?route=login';
                }, 900);
            } catch (err) {
                showPageToast(err.message || 'Đặt lại mật khẩu thất bại!', false);
                btn.disabled = false;
                btn.innerText = 'Cập nhật mật khẩu mới';
            }
        }
    </script>
</body>
</html>

