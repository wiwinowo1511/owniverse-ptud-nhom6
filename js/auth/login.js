const loginForm =
    document.querySelector("#loginForm");

function setLoginError(fieldId, message = "") {
    const input = document.querySelector(`#${fieldId}`);
    const error = document.querySelector(`#${fieldId}-error`);
    if (!input || !error) return;
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
}

loginForm?.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
        setLoginError(input.id);
        if (input.id === "email") setLoginError("password");
    });
});

loginForm?.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();

        const email =
            document.querySelector("#email").value;

        const password =
            document.querySelector("#password").value;

        setLoginError("email");
        setLoginError("password");

        if (!email.trim()) {
            setLoginError("email", "Vui lòng nhập email.");
            document.querySelector("#email").focus();
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setLoginError("email", "Email chưa đúng định dạng.");
            document.querySelector("#email").focus();
            return;
        }
        if (!password) {
            setLoginError("password", "Vui lòng nhập mật khẩu.");
            document.querySelector("#password").focus();
            return;
        }

        try {

            login(email, password);

            const redirect = new URLSearchParams(window.location.search).get("redirect");
            window.location.href =
                safeRedirectTarget(redirect) || "account.html";

        } catch (error) {
            setLoginError("password", error.message || "Không thể đăng nhập. Vui lòng thử lại.");
            document.querySelector("#password").focus();
        }
    }
);
