const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  const emailInput = loginForm.querySelector("#email");
  const passwordInput = loginForm.querySelector("#password");
  const emailError = loginForm.querySelector("#email-error");
  const passwordError = loginForm.querySelector("#password-error");
  const submitButton = loginForm.querySelector('[type="submit"]');

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submitButton && submitButton.disabled) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    emailError.textContent = invalidEmail ? "Vui lòng nhập email hợp lệ." : "";
    passwordError.textContent = password ? "" : "Vui lòng nhập mật khẩu.";
    emailInput.setAttribute("aria-invalid", String(invalidEmail));
    passwordInput.setAttribute("aria-invalid", String(!password));

    if (invalidEmail || !password) {
      (invalidEmail ? emailInput : passwordInput).focus();
      return;
    }

    if (submitButton) submitButton.disabled = true;
    loginForm.setAttribute("aria-busy", "true");

    try {
      const user = await login(email, password);
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const requestedPage = safeRedirectTarget(redirect);
      const destination = String(user.role).toLowerCase() === "admin"
        ? (requestedPage && requestedPage !== "account.html" ? requestedPage : "admin.html")
        : (requestedPage || "account.html");
      window.location.href = destination;
    } catch (error) {
      await showAppMessage(error.message, { type: "error", title: "Đăng nhập không thành công" });
    } finally {
      if (submitButton) submitButton.disabled = false;
      loginForm.removeAttribute("aria-busy");
    }
  });
}
