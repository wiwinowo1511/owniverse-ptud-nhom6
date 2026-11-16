/* =========================================================
   OWNIVERSE – header-auth.js
   Cập nhật nút "Tài khoản" trên header theo trạng thái đăng nhập.
   ========================================================= */

function validateEmail(email) { 
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}

function validatePhone(phone) {
    return /^(03|05|07|08|09)\d{8}$/
        .test(phone);
}

function validatePassword(password) {

    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        .test(password);
}
