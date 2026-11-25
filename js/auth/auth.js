/* =========================================================
   OWNIVERSE – auth.js (lõi xác thực, GỌI API BACKEND .NET)
   Khóa lưu trữ trong trình duyệt:
   - owniverse_current_user : thông tin người dùng đang đăng nhập
   - owniverse_token        : token do backend cấp khi đăng nhập

   Lưu ý: register / login / updateProfile / changePassword
   giờ là hàm BẤT ĐỒNG BỘ (async) nên khi gọi phải có "await".
   ========================================================= */

const CURRENT_USER_KEY = "owniverse_current_user";
const TOKEN_KEY = "owniverse_token";
const HOME_PAGE = "index.html";
const LOGIN_PAGE = "login.html";

// Frontend deploy and local preview can run on a different origin from .NET API.
// Set window.OWNIVERSE_API_BASE before auth.js to override the API URL.
const API_BASE_URL = (() => {
    if (window.OWNIVERSE_API_BASE) return String(window.OWNIVERSE_API_BASE).replace(/\/$/, "");
    const configured = localStorage.getItem("owniverse_api_base");
    if (configured) return configured.replace(/\/$/, "");
    const meta = document.querySelector('meta[name="owniverse-api-base"]');
    if (meta && meta.content.trim()) return meta.content.trim().replace(/\/$/, "");
    const { hostname, protocol } = window.location;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    return isLocalHost ? `${protocol}//${hostname}:5055` : "";
})();

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

/* ---------- Gọi API (dùng chung cho cả web, kể cả các trang khác) ----------
   apiRequest("/api/products")                          -> GET, không cần đăng nhập
   apiRequest("/api/users/me", { auth: true })          -> GET, có gửi token
   apiRequest("/api/x", { method: "POST", body: {...}, auth: true })
   Lỗi sẽ được throw ra với đúng thông báo từ backend (error.message). */
async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) headers.Authorization = "Bearer " + token;
    }

    let res;
    try {
        res = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch (e) {
        throw new Error("Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.");
    }

    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        /* phản hồi không có nội dung JSON */
    }

    if (!res.ok) {
        // Token hết hạn / server đã khởi động lại -> xóa phiên cũ
        if (res.status === 401 && auth) {
            clearSession();
            throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error((data && data.message) || "Có lỗi xảy ra, vui lòng thử lại");
    }
    return data;
}

/* ---------- Phiên đăng nhập ---------- */
function getCurrentUser() {
    return readJSON(CURRENT_USER_KEY, null);
}

// Backend không bao giờ trả mật khẩu, nhưng vẫn loại bỏ cho chắc
function setCurrentUser(user) {
    const { password, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
}

function clearSession() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
}

// Đã đăng nhập? (có người dùng và có token)
function isLoggedIn() {
    const hasUser = !!getCurrentUser();
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    if (hasUser !== hasToken) {
        clearSession(); // dữ liệu lệch nhau -> dọn sạch
        return false;
    }
    return hasUser;
}

// Giữ nguyên là hàm thường (không async) để các nơi gọi logout() không phải sửa
function logout() {
    const token = localStorage.getItem(TOKEN_KEY);
    clearSession();
    if (token) {
        // Báo cho backend hủy token (không cần chờ kết quả)
        fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        }).catch(() => {});
    }
}

async function logoutAndWait() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                headers: { Authorization: "Bearer " + token }
            });
        } catch (e) {
            // Clear the local session even if the server cannot be reached.
        }
    }
    clearSession();
}

/* ---------- Đăng ký ---------- */
async function register(userData) {
    const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: {
            fullName: userData.fullName,
            email: normalizeEmail(userData.email),
            phone: userData.phone,
            password: userData.password
        }
    });
    return data.user;
}

/* ---------- Đăng nhập ---------- */
async function login(email, password) {
    const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email: normalizeEmail(email), password }
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    setCurrentUser(data.user);
    return data.user;
}

// Confirm the local token against SQL-backed user state before rendering account pages.
async function refreshCurrentUser() {
    const data = await apiRequest("/api/auth/me", { auth: true });
    const user = data && data.user ? data.user : data;
    if (!user || !user.id) throw new Error("Không đọc được thông tin tài khoản");
    setCurrentUser(user);
    return user;
}

/* ---------- Cập nhật hồ sơ ---------- */
async function updateProfile({ fullName, email, phone }) {
    const current = getCurrentUser();
    if (!current) throw new Error("Bạn chưa đăng nhập");

    const normalizedEmail = normalizeEmail(email ?? current.email);
    if (!normalizedEmail) throw new Error("Email không hợp lệ");

    const data = await apiRequest("/api/users/me", {
        method: "PUT",
        auth: true,
        body: {
            fullName: String(fullName || "").trim(),
            email: normalizedEmail,
            phone: String(phone || "").trim()
        }
    });

    setCurrentUser(data.user);
    return data.user;
}

/* ---------- Đổi mật khẩu ---------- */
async function changePassword(oldPassword, newPassword) {
    if (!getCurrentUser()) throw new Error("Bạn chưa đăng nhập");

    if (newPassword.length < 8) {
        throw new Error("Mật khẩu mới tối thiểu 8 ký tự");
    }
    if (newPassword === oldPassword) {
        throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
    }

    await apiRequest("/api/users/me/password", {
        method: "PUT",
        auth: true,
        body: { oldPassword, newPassword }
    });
    // Backend revokes active tokens after a password change.
    clearSession();
}

/* ---------- Chuyển hướng ---------- */
// Chỉ cho phép chuyển về trang nội bộ (tránh open redirect)
function safeRedirectTarget(target) {
    return /^[A-Za-z0-9_\-\/]+\.html(\?[^\s]*)?$/.test(target || "")
        ? target
        : null;
}

function goToLogin(redirectTo, loginPage) {
    const target = safeRedirectTarget(redirectTo);
    const destination = loginPage === "login.html" ? loginPage : LOGIN_PAGE;
    window.location.href = target
        ? `${destination}?redirect=${encodeURIComponent(target)}`
        : destination;
}

// Icon tài khoản dùng hai luồng: đã đăng nhập -> trang tài khoản,
// chưa đăng nhập -> trang đăng nhập. Không hiển thị cảnh báo chuyển hướng.
function initAccountAvatarLink() {
    document.querySelectorAll(".account-circle").forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            if (typeof window.isArtistDemoSession === "function" && window.isArtistDemoSession()) {
                window.location.href = "artist-account.html";
            } else if (isLoggedIn()) {
                const user = getCurrentUser();
                window.location.href = String(user && user.role).toLowerCase() === "admin"
                    ? "admin.html"
                    : String(user && user.role).toLowerCase() === "artist"
                        ? "artist-account.html"
                        : "account.html";
            } else {
                goToLogin("account.html");
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccountAvatarLink, { once: true });
} else {
    initAccountAvatarLink();
}

// Dùng ở đầu các trang cần đăng nhập (account.html, ...)
function requireLogin() {
    if (isLoggedIn()) return true;
    const page = window.location.pathname.split("/").pop() || HOME_PAGE;
    goToLogin(page + window.location.search);
    return false;
}
