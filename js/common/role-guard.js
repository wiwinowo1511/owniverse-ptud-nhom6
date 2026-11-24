function requireRole(role, loginPage) {
    const currentUser = getCurrentUser();
    const requiredRole = String(role || "").toLowerCase();
    const signInPage = loginPage === "artist-login.html" ? loginPage : "login.html";

    if (requiredRole === "artist" && typeof window.isArtistDemoSession === "function" && window.isArtistDemoSession()) {
        return true;
    }

    if (!isLoggedIn() || !currentUser) {
        const page = window.location.pathname.split("/").pop() || "index.html";
        goToLogin(page + window.location.search, signInPage);
        return false;
    }

    if (String(currentUser.role || "").toLowerCase() !== requiredRole) {
        showAppMessage("Tài khoản của bạn không có quyền truy cập trang này.", { type: "error", title: "Không đủ quyền" })
            .then(function () { window.location.href = "index.html"; });
        return false;
    }

    return true;
}
