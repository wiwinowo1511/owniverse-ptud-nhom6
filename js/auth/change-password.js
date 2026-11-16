document.querySelector("#passwordForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const oldPassword = document.querySelector("#oldPassword").value;
    const newPassword = document.querySelector("#newPassword").value;
    const confirmNewPassword = document.querySelector("#confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
        return alert("Mật khẩu xác nhận không khớp");
    }

    try {
        changePassword(oldPassword, newPassword);
        this.reset();
        alert("Đổi mật khẩu thành công");
    } catch (error) {
        alert(error.message);
    }
});