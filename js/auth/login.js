
const loginForm = document.querySelector("#loginForm");

loginForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    try {
        // Chờ Backend xác thực và lưu token thành công
        await login(email, password);

        // Chỉ chuyển trang sau khi đăng nhập thành công
        const redirect = new URLSearchParams(window.location.search)
            .get("redirect");

        window.location.href =
            safeRedirectTarget(redirect) || "account.html";

    } catch (error) {
        // Hiển thị lỗi nếu đăng nhập thất bại
        alert(error.message);
    }
});
