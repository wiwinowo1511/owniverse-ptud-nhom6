document.querySelector("#forgotForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = normalizeEmail(document.querySelector("#email").value);
    try {
        const data = await apiRequest("/api/auth/forgot-password", {
            method: "POST",
            body: { email }
        });
        await showAppMessage(data.message || "Nếu email tồn tại, hướng dẫn khôi phục mật khẩu sẽ được gửi.", {
            type: "success",
            title: "Yêu cầu đã được tiếp nhận"
        });
    } catch (error) {
        await showAppMessage(error.message, { type: "error", title: "Không thể gửi yêu cầu" });
    }
});
