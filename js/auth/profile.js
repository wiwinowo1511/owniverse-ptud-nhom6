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

    profileForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullName = document.querySelector("#fullName").value.trim();
        const phone = document.querySelector("#phone").value.trim();

        if (fullName.length < 3) return alert("Tên không hợp lệ");
        if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) {
            return alert("Số điện thoại không hợp lệ");
        }

        try {
            updateProfile({ fullName, phone });
            if (welcome) welcome.textContent = fullName;
            alert("Cập nhật thành công");
        } catch (error) {
            alert(error.message);
        }
    });
})();