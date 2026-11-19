document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const input = document.getElementById(toggle.dataset.passwordToggle);
        if (!input) return;

        const shouldShow = input.type === "password";
        input.type = shouldShow ? "text" : "password";
        toggle.setAttribute("aria-pressed", String(shouldShow));
        toggle.setAttribute("aria-label", shouldShow ? "Ẩn mật khẩu" : "Hiện mật khẩu");
    });
});
