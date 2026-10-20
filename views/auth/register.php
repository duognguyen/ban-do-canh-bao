<?php
// File: views/auth/register.php
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
    <title>Đăng ký - Bản đồ Cảnh báo Giao thông & Ngập lụt</title>
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
            padding: 30px 20px;
        }
        .auth-card {
            width: 100%;
            max-width: 480px;
            background: #18181b;
            border: 1px solid #3f3f46;
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .auth-header {
            text-align: center;
            margin-bottom: 22px;
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
            margin-bottom: 4px;
        }
        .auth-subtitle {
            font-size: 0.88rem;
            color: #94a3b8;
        }
        .form-group {
            margin-bottom: 14px;
        }
        .form-label {
            display: block;
            font-size: 0.84rem;
            font-weight: 500;
            color: #cbd5e1;
            margin-bottom: 5px;
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
            margin-top: 20px;
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
        <!-- Bước 1: Form Đăng ký -->
        <div id="stepRegister">
            <div class="auth-header">
                <div class="auth-logo">
                    <i class="ph-bold ph-user-plus"></i>
                </div>
                <h1 class="auth-title">Đăng Ký Tài Khoản</h1>
                <p class="auth-subtitle">Cùng chung tay xây dựng bản đồ giao thông an toàn</p>
            </div>

            <form onsubmit="handleRegisterSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Họ và tên <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="fullNameInput" class="form-input" placeholder="Ví dụ: Nguyễn Văn A" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Email (nhận mã OTP xác thực) <span style="color:#ef4444;">*</span></label>
                    <input type="email" id="emailInput" class="form-input" placeholder="email@domain.com" required oninput="checkEmailRealtime(this.value)" onblur="checkEmailRealtime(this.value)">
                    <div id="emailFeedback" style="font-size: 0.8rem; margin-top: 4px;"></div>
                </div>

                <div class="form-group">
                    <label class="form-label">Số điện thoại (tùy chọn)</label>
                    <input type="tel" id="phoneInput" class="form-input" placeholder="Ví dụ: 0912345678">
                </div>

                <div class="form-group">
                    <label class="form-label">Tên đăng nhập (tùy chọn)</label>
                    <input type="text" id="usernameInput" class="form-input" placeholder="Để trống hệ thống sẽ tự sinh theo email">
                </div>

                <div class="form-group">
                    <label class="form-label">Mật khẩu <span style="color:#ef4444;">*</span></label>
                    <input type="password" id="passwordInput" class="form-input" placeholder="Ít nhất 6 ký tự" required minlength="6" autocomplete="new-password">
                </div>

                <div class="form-group">
                    <label class="form-label">Xác nhận mật khẩu <span style="color:#ef4444;">*</span></label>
                    <input type="password" id="confirmPasswordInput" class="form-input" placeholder="Nhập lại mật khẩu" required minlength="6" autocomplete="new-password">
                </div>

                <!-- Checkbox đồng ý Điều khoản & Chính sách -->
                <div style="display:flex; align-items:flex-start; gap:10px; margin-top:10px; margin-bottom:14px; font-size:0.84rem; color:#cbd5e1;">
                    <input type="checkbox" id="termsAgreeInput" checked required style="width:18px; height:18px; accent-color:#10b981; margin-top:2px;">
                    <label for="termsAgreeInput" style="cursor:pointer; line-height:1.4;">
                        Tôi đã đọc và đồng ý với 
                        <a href="#" onclick="alert('Điều khoản dịch vụ: Cam kết thông tin trung thực, chung tay chống tin tức sai lệch vì cộng đồng.'); return false;" style="color:#60a5fa; text-decoration:none;">Điều khoản dịch vụ</a> 
                        và 
                        <a href="#" onclick="alert('Chính sách bảo mật: Mật khẩu được mã hóa BCRYPT một chiều an toàn, dữ liệu vị trí chỉ dùng để hiển thị trên bản đồ.'); return false;" style="color:#60a5fa; text-decoration:none;">Chính sách bảo mật</a>.
                    </label>
                </div>

                <button type="submit" id="btnRegister" class="btn-primary">
                    Tiếp tục (Nhận mã OTP)
                </button>
            </form>

            <div class="auth-footer">
                Đã có tài khoản? <a href="index.php?route=login">Đăng nhập</a>
                <div style="margin-top: 14px;">
                    <a href="index.php?route=home" style="color: #94a3b8; font-weight: normal; font-size: 0.85rem;">&larr; Quay lại xem Bản đồ chính</a>
                </div>
            </div>
        </div>

        <!-- Bước 2: Xác thực OTP -->
        <div id="stepOtp" style="display: none; text-align: center;">
            <div class="auth-header">
                <div class="auth-logo" style="background:#0284c7;">
                    <i class="ph-bold ph-envelope-simple"></i>
                </div>
                <h1 class="auth-title">Xác Thực Mã OTP</h1>
                <p class="auth-subtitle">Mã xác thực gồm 6 số đã được gửi tới email:</p>
                <p id="otpDisplayEmail" style="color:#60a5fa; font-weight:600; margin-top:4px; font-size:0.95rem;"></p>
            </div>

            <div id="otpDebugBox" style="display:none; background:#1e3a5f; border:1px dashed #3b82f6; color:#93c5fd; padding:12px; border-radius:10px; font-size:0.85rem; margin-bottom:16px; text-align:left;">
                💡 <b>Môi trường thử nghiệm:</b> Mã OTP của bạn là: <span id="debugOtpCode" style="font-size:1.2rem; font-weight:bold; color:white; letter-spacing:2px;"></span>
            </div>

            <form onsubmit="handleOtpSubmit(event)">
                <div class="form-group">
                    <label class="form-label" style="text-align:center;">Nhập mã OTP gồm 6 chữ số</label>
                    <input type="text" id="otpCodeInput" class="form-input" maxlength="6" placeholder="000000" style="text-align:center; font-size:1.6rem; letter-spacing:8px; font-weight:bold;" required autocomplete="one-time-code">
                </div>

                <button type="submit" id="btnVerifyOtp" class="btn-primary" style="background:#0284c7;">
                    Xác nhận & Hoàn tất
                </button>
            </form>

            <div style="margin-top:20px; font-size:0.88rem; color:#94a3b8;">
                Chưa nhận được mã? 
                <a href="#" onclick="handleResendOtp(); return false;" style="color:#60a5fa; text-decoration:none; font-weight:600;">Gửi lại mã OTP</a>
            </div>

            <div style="margin-top:16px;">
                <a href="#" onclick="backToRegister(); return false;" style="color:#94a3b8; font-size:0.85rem; text-decoration:none;">&larr; Quay lại thay đổi thông tin</a>
            </div>
        </div>
    </div>

    <script src="public/js/api.js"></script>
    <script>
        let currentRegData = {};

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

        // Kiểm tra email realtime
        let checkTimer = null;
        function checkEmailRealtime(email) {
            const fb = document.getElementById('emailFeedback');
            clearTimeout(checkTimer);
            email = (email || '').trim();
            if (!email) {
                fb.innerHTML = '';
                return;
            }
            if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
                fb.innerHTML = '<span style="color:#f87171;">Email không đúng định dạng</span>';
                return;
            }
            fb.innerHTML = '<span style="color:#94a3b8;">Đang kiểm tra trùng lặp...</span>';
            checkTimer = setTimeout(async () => {
                try {
                    const res = await Api.checkEmail(email);
                    if (res && res.exists) {
                        fb.innerHTML = '<span style="color:#f87171;"><i class="ph-bold ph-warning-circle"></i> Email này đã được đăng ký!</span>';
                    } else {
                        fb.innerHTML = '<span style="color:#34d399;"><i class="ph-bold ph-check-circle"></i> Email hợp lệ có thể sử dụng</span>';
                    }
                } catch (e) {
                    fb.innerHTML = '';
                }
            }, 400);
        }

        // Bước 1: Submit Form Đăng ký
        async function handleRegisterSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('btnRegister');
            const fullName = document.getElementById('fullNameInput').value.trim();
            const email = document.getElementById('emailInput').value.trim();
            const phone = document.getElementById('phoneInput').value.trim();
            const username = document.getElementById('usernameInput').value.trim();
            const password = document.getElementById('passwordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;
            const termsAgree = document.getElementById('termsAgreeInput').checked;

            if (!termsAgree) {
                showPageToast('Vui lòng đồng ý với Điều khoản và Chính sách bảo mật!', false);
                return;
            }
            if (password.length < 6) {
                showPageToast('Mật khẩu phải có ít nhất 6 ký tự!', false);
                return;
            }
            if (password !== confirmPassword) {
                showPageToast('Mật khẩu xác nhận không khớp!', false);
                return;
            }

            btn.disabled = true;
            btn.innerText = 'Đang gửi mã OTP...';

            currentRegData = {
                full_name: fullName,
                email: email,
                phone: phone,
                username: username,
                password: password,
                confirm_password: confirmPassword,
                terms_agree: 1
            };

            try {
                const res = await Api.register(currentRegData);
                showPageToast('Mã OTP xác thực đã được gửi đến email!', true);

                // Hiển thị bước 2
                document.getElementById('stepRegister').style.display = 'none';
                document.getElementById('stepOtp').style.display = 'block';
                document.getElementById('otpDisplayEmail').innerText = email;

                if (res && res.debug_otp) {
                    document.getElementById('otpDebugBox').style.display = 'block';
                    document.getElementById('debugOtpCode').innerText = res.debug_otp;
                }
            } catch (err) {
                showPageToast(err.message || 'Đăng ký thất bại!', false);
                btn.disabled = false;
                btn.innerText = 'Tiếp tục (Nhận mã OTP)';
            }
        }

        // Bước 2: Xác thực mã OTP
        async function handleOtpSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('btnVerifyOtp');
            const otp = document.getElementById('otpCodeInput').value.trim();

            if (!otp) {
                showPageToast('Vui lòng nhập mã OTP gồm 6 chữ số!', false);
                return;
            }

            btn.disabled = true;
            btn.innerText = 'Đang xác thực...';

            try {
                await Api.verifyRegisterOtp(currentRegData.email, otp);
                showPageToast('Xác thực tài khoản thành công! Đang chuyển hướng...', true);
                setTimeout(() => {
                    window.location.href = 'index.php?route=home';
                }, 700);
            } catch (err) {
                showPageToast(err.message || 'Xác thực OTP thất bại!', false);
                btn.disabled = false;
                btn.innerText = 'Xác nhận & Hoàn tất';
            }
        }

        // Gửi lại mã OTP
        async function handleResendOtp() {
            try {
                showPageToast('Đang gửi lại mã OTP mới...', true);
                const res = await Api.register(currentRegData);
                showPageToast('Đã gửi lại mã OTP mới đến email!', true);
                if (res && res.debug_otp) {
                    document.getElementById('otpDebugBox').style.display = 'block';
                    document.getElementById('debugOtpCode').innerText = res.debug_otp;
                }
            } catch (err) {
                showPageToast(err.message || 'Gửi lại mã OTP thất bại!', false);
            }
        }

        function backToRegister() {
            document.getElementById('stepOtp').style.display = 'none';
            document.getElementById('stepRegister').style.display = 'block';
            document.getElementById('btnRegister').disabled = false;
            document.getElementById('btnRegister').innerText = 'Tiếp tục (Nhận mã OTP)';
        }
    </script>
</body>
</html>

