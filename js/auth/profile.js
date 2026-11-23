// Chỉ chạy ở account.html (đã requireLogin trong trang)
(function () {
    const profileForm = document.querySelector("#profileForm");
    if (!profileForm) return;

    const user = getCurrentUser();
    if (!user) return;

    document.querySelector("#fullName").value = user.fullName || "";
    document.querySelector("#email").value = user.email || "";
    document.querySelector("#phone").value = user.phone || "";

    const welcome = document.querySelector("#welcomeName");
    if (welcome) welcome.textContent = user.fullName || user.email;

    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const fullName = document.querySelector("#fullName").value.trim();
        const phone = document.querySelector("#phone").value.trim();

        if (fullName.length < 3) return showAppMessage("Tên cần có ít nhất 3 ký tự.", { type: "warning" });
        if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) {
            return showAppMessage("Số điện thoại cần có 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.", { type: "warning" });
        }

        try {
            const updatedUser = await updateProfile({ fullName, email: document.querySelector("#email").value.trim(), phone });
            if (welcome) welcome.textContent = fullName;
            if (updatedUser) setCurrentUser(updatedUser);
            await showAppMessage("Thông tin tài khoản đã được cập nhật.", { type: "success" });
        } catch (error) {
            await showAppMessage(error.message, { type: "error", title: "Không thể cập nhật thông tin" });
        }
    });
})();
