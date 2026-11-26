const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  const emailInput = loginForm.querySelector("#email");
  const passwordInput = loginForm.querySelector("#password");
  const emailError = loginForm.querySelector("#email-error");
  const passwordError = loginForm.querySelector("#password-error");
  const submitButton = loginForm.querySelector('[type="submit"]');
  const submitButtonLabel = submitButton?.textContent.trim();
  const requiredRole = (document.body.dataset.loginRole || "").toLowerCase();
  const demoEnterButton = document.querySelector("#artist-demo-enter");

  if (demoEnterButton) {
    document.getElementById("artist-demo-email").textContent = window.getArtistDemoEmail();
    demoEnterButton.addEventListener("click", function () {
      window.startArtistDemoSession();
      window.location.href = "artist-account.html";
    });
  }

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
    if (submitButton) {
      submitButton.dataset.loading = "true";
      submitButton.textContent = "Đang đăng nhập...";
      submitButton.setAttribute("aria-busy", "true");
    }
    loginForm.setAttribute("aria-busy", "true");

    try {
      const user = await login(email, password);
      const role = String(user.role || "").toLowerCase();

      if (requiredRole && role !== requiredRole) {
        logout();
        await showAppMessage("Trang này chỉ dành cho tài khoản nghệ sĩ đã được cấp quyền.", {
          type: "error",
          title: "Tài khoản chưa được phân quyền nghệ sĩ"
        });
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const requestedPage = safeRedirectTarget(redirect);
      if (role === "artist") {
        if (typeof window.startArtistDemoSession === "function") window.startArtistDemoSession();
        if (typeof window.saveArtistDemoUser === "function") window.saveArtistDemoUser(user);
      }
      const defaultPage = role === "admin"
        ? "admin.html"
        : role === "artist"
          ? "artist-account.html"
          : "account.html";
      const destination = requestedPage || defaultPage;
      window.location.href = destination;
    } catch (error) {
      await showAppMessage(error.message, { type: "error", title: "Đăng nhập không thành công" });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        delete submitButton.dataset.loading;
        submitButton.textContent = submitButtonLabel;
        submitButton.removeAttribute("aria-busy");
      }
      loginForm.removeAttribute("aria-busy");
    }
  });
}
