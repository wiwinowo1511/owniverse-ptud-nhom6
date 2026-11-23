document.querySelector("#passwordForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const oldPassword = document.querySelector("#oldPassword").value;
    const newPassword = document.querySelector("#newPassword").value;
    const confirmNewPassword = document.querySelector("#confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
        return showAppMessage("Mật khẩu xác nhận không khớp.", { type: "warning" });
    }

    try {
        await changePassword(oldPassword, newPassword);
        this.reset();
        await showAppMessage("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.", { type: "success" });
        window.location.replace("login.html");
    } catch (error) {
        await showAppMessage(error.message, { type: "error", title: "Không thể đổi mật khẩu" });
    }
});
