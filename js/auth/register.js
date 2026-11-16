// js/auth/register.js
const registerForm = document.querySelector("#registerForm");

registerForm?.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;

    if (name.length < 3) return alert("Tên không hợp lệ");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Email không hợp lệ");
    if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) return alert("Số điện thoại không hợp lệ");
    if (password.length < 8) return alert("Mật khẩu tối thiểu 8 ký tự");
    if (password !== confirmPassword) return alert("Mật khẩu xác nhận không khớp");

    try {
        register({ fullName: name, email, phone, password });
        alert("Đăng ký thành công! Vui lòng đăng nhập.");

        // Giữ lại redirect (nếu khách bị chuyển tới từ trang cần đăng nhập)
        const redirect = new URLSearchParams(window.location.search).get("redirect");
        window.location.href = safeRedirectTarget(redirect)
            ? `login.html?redirect=${encodeURIComponent(redirect)}`
            : "login.html";

    } catch (error) {
        alert(error.message);
    }
});