function requireRole(role) {
    const currentUser = getCurrentUser();

    if (!isLoggedIn() || !currentUser) {
        const page = window.location.pathname.split("/").pop() || "index.html";
        goToLogin(page + window.location.search);
        return false;
    }

    if (currentUser.role !== role) {
        alert("Bạn không có quyền truy cập");
        window.location.href = "index.html";
        return false;
    }

    return true;
}