function requireRole(role) {
    const currentUser = getCurrentUser();

    if (!isLoggedIn() || !currentUser) {
        const page = window.location.pathname.split("/").pop() || "index.html";
        goToLogin(page + window.location.search);
        return false;
    }

    if (currentUser.role !== role) {
        showAppMessage("Tài khoản của bạn không có quyền truy cập trang này.", { type: "error", title: "Không đủ quyền" })
            .then(function () { window.location.href = "index.html"; });
        return false;
    }

    return true;
}
