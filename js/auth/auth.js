/* =========================================================
   OWNIVERSE – auth.js (lõi xác thực, dùng localStorage)
   Khóa lưu trữ:
   - owniverse_users         : danh sách tài khoản đã đăng ký
   - owniverse_current_user  : phiên đăng nhập hiện tại
   ========================================================= */
   
const USER_KEY = "owniverse_users";
const CURRENT_USER_KEY = "owniverse_current_user";
const HOME_PAGE = "index.html";
const LOGIN_PAGE = "login.html";

/* ---------- Tiện ích ---------- */
function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch (e) {
        return fallback;
    }
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

/* ---------- Users ---------- */
function getUsers() {
    const users = readJSON(USER_KEY, []);
    return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
    localStorage.setItem(USER_KEY, JSON.stringify(users));
}

/* ---------- Phiên đăng nhập ---------- */
function getCurrentUser() {
    return readJSON(CURRENT_USER_KEY, null);
}

// Không lưu mật khẩu vào phiên đăng nhập
function setCurrentUser(user) {
    const { password, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
}

// Đã đăng nhập hợp lệ? (tài khoản còn tồn tại và đang active)
function isLoggedIn() {
    const current = getCurrentUser();
    if (!current) return false;

    const stored = getUsers().find(u => u.id === current.id);
    if (!stored || stored.status !== "active") {
        localStorage.removeItem(CURRENT_USER_KEY);
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

/* ---------- Đăng ký ---------- */
function register(userData) {
    const users = getUsers();
    const email = normalizeEmail(userData.email);

    if (users.some(u => normalizeEmail(u.email) === email)) {
        throw new Error("Email đã tồn tại");
    }

    let id = Date.now();
    while (users.some(u => u.id === id)) id += 1;

    const newUser = {
        id,
        role: "customer",
        status: "active",
        createdAt: new Date().toISOString(),
        ...userData,
        email
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
}

/* ---------- Đăng nhập ---------- */
function login(email, password) {
    const users = getUsers();
    const user = users.find(
        u => normalizeEmail(u.email) === normalizeEmail(email) &&
             u.password === password
    );

    if (!user) throw new Error("Sai email hoặc mật khẩu");
    if (user.status !== "active") throw new Error("Tài khoản bị khóa");

    setCurrentUser(user);
    return user;
}

/* ---------- Cập nhật hồ sơ ---------- */
function updateProfile({ fullName, email, phone }) {
    const current = getCurrentUser();
    if (!current) throw new Error("Bạn chưa đăng nhập");

    const users = getUsers();
    const index = users.findIndex(u => u.id === current.id);
    if (index === -1) throw new Error("Không tìm thấy tài khoản");

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Email không hợp lệ");
    if (users.some((user, userIndex) =>
        userIndex !== index && normalizeEmail(user.email) === normalizedEmail
    )) {
        throw new Error("Email đã tồn tại");
    }

    users[index].fullName = String(fullName || "").trim();
    users[index].email = normalizedEmail;
    users[index].phone = String(phone || "").trim();
    saveUsers(users);
    setCurrentUser(users[index]);
    return users[index];
}

/* ---------- Đổi mật khẩu ---------- */
function changePassword(oldPassword, newPassword) {
    const current = getCurrentUser();
    if (!current) throw new Error("Bạn chưa đăng nhập");

    const users = getUsers();
    const index = users.findIndex(u => u.id === current.id);
    if (index === -1) throw new Error("Không tìm thấy tài khoản");

    if (users[index].password !== oldPassword) {
        throw new Error("Mật khẩu hiện tại không đúng");
    }
    if (newPassword.length < 8) {
        throw new Error("Mật khẩu mới tối thiểu 8 ký tự");
    }
    if (newPassword === oldPassword) {
        throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
    }

    users[index].password = newPassword;
    saveUsers(users);
}

/* ---------- Chuyển hướng ---------- */
// Chỉ cho phép chuyển về trang nội bộ (tránh open redirect)
function safeRedirectTarget(target) {
    return /^[A-Za-z0-9_\-\/]+\.html(\?[^\s]*)?$/.test(target || "")
        ? target
        : null;
}

function goToLogin(redirectTo) {
    const target = safeRedirectTarget(redirectTo);
    window.location.href = target
        ? `${LOGIN_PAGE}?redirect=${encodeURIComponent(target)}`
        : LOGIN_PAGE;
}

// Dùng ở đầu các trang cần đăng nhập (account.html, ...)
function requireLogin() {
    if (isLoggedIn()) return true;
    const page = window.location.pathname.split("/").pop() || HOME_PAGE;
    goToLogin(page + window.location.search);
    return false;
}

/* ---------- Tài khoản demo ---------- */
(function initCustomer() {
    const users = getUsers();
    const demoEmail = "customer@owniverse.com";

    if (users.some(u => normalizeEmail(u.email) === demoEmail)) return;

    let demoId = Date.now();
    while (users.some(u => u.id === demoId)) demoId += 1;

    users.push({
        id: demoId,
        fullName: "Khách hàng",
        email: demoEmail,
        phone: "0900000000",
        password: "Customer123",
        role: "customer",
        status: "active",
        createdAt: new Date().toISOString()
    });
    saveUsers(users);
})();



/* =========================================================
   OWNIVERSE – header-auth.js
   Cập nhật nút "Tài khoản" trên header theo trạng thái đăng nhập.
   ========================================================= */

(function () {
    function updateAccountLink() {
        const circle = document.querySelector(".account-circle");
        if (!circle) return;

        if (isLoggedIn()) {
            const user = getCurrentUser();
            const name = (user.fullName || "").trim();
            const lastWord = name.split(/\s+/).pop() || "Tài khoản";

            circle.href = "account.html";
            circle.title = name || user.email;
            circle.setAttribute("aria-label", "Tài khoản của " + (name || user.email));
            circle.textContent = lastWord.length > 6
                ? lastWord.slice(0, 5) + "…"
                : lastWord;
        } else {
            circle.href = "login.html";
            circle.setAttribute("aria-label", "Đăng nhập");
            circle.innerHTML = "Đăng<br>nhập";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateAccountLink);
    } else {
        updateAccountLink();
    }
})();