// Đăng xuất: xóa owniverse_current_user rồi quay về TRANG CHỦ
document.querySelectorAll(".logout-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        logout();
        window.location.href = HOME_PAGE; // index.html
    });
});