// Mô phỏng: đồ án chưa có backend gửi email nên chỉ kiểm tra email tồn tại.
document.querySelector("#forgotForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = normalizeEmail(document.querySelector("#email").value);
    const user = getUsers().find(u => normalizeEmail(u.email) === email);

    if (!user) return alert("Email không tồn tại");

    alert("Link đặt lại mật khẩu đã được gửi");
});