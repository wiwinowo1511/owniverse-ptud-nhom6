// js/auth/register.js
const registerForm = document.querySelector("#registerForm");

function setRegisterError(fieldId, message = "") {
    const input = document.querySelector(`#${fieldId}`);
    const error = document.querySelector(`#${fieldId}-error`);
    if (!input || !error) return;
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
}

registerForm?.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => setRegisterError(input.id));
});

registerForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;

    ["name", "email", "phone", "password", "confirmPassword"].forEach((id) => setRegisterError(id));

    const errors = [
        ["name", name.length < 3 ? "Họ tên cần có ít nhất 3 ký tự." : ""],
        ["email", !email ? "Vui lòng nhập email." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Email chưa đúng định dạng." : ""],
        ["phone", !/^(03|05|07|08|09)\d{8}$/.test(phone) ? "Số điện thoại chưa đúng định dạng." : ""],
        ["password", password.length < 8 ? "Mật khẩu cần có ít nhất 8 ký tự." : ""],
        ["confirmPassword", password !== confirmPassword ? "Mật khẩu xác nhận không khớp." : ""]
    ];
    const firstError = errors.find(([, message]) => message);
    if (firstError) {
        const [fieldId, message] = firstError;
        setRegisterError(fieldId, message);
        document.querySelector(`#${fieldId}`).focus();
        return;
    }

    try {
        await register({ fullName: name, email, phone, password });
        // Giữ lại redirect (nếu khách bị chuyển tới từ trang cần đăng nhập)
        const redirect = new URLSearchParams(window.location.search).get("redirect");
        window.location.href = safeRedirectTarget(redirect)
            ? `login.html?redirect=${encodeURIComponent(redirect)}`
            : "login.html";

    } catch (error) {
        setRegisterError("email", error.message || "Không thể tạo tài khoản. Vui lòng thử lại.");
        document.querySelector("#email").focus();
    }
});
