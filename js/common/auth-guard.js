/* =========================================================
   Chặn khách CHƯA đăng nhập dùng: mua hàng, thêm giỏ, cộng đồng.
   Nạp SAU auth.js. Với trang cần bảo vệ, đặt trong <head> để
   không bị "nháy" nội dung trước khi chuyển hướng.
   ========================================================= */
(function () {
    const PROTECTED_PAGES = [
        "account.html",
        "account-general.html",
        "artist-community.html",
        "cart.html",
        "checkout.html",
        "community.html"
    ];
    const PURCHASE_SELECTOR = [
        "[data-add-to-cart]",
        "[data-buy-now]",
        "[data-detail-action='add']",
        ".buy-form button[type='submit']",
        ".add-to-cart",
        ".btn-add-to-cart",
        ".btn-add-cart",
        ".buy-now",
        ".btn-buy-now",
        ".btn-checkout",
        ".checkout-btn"
    ].join(",");

    function currentPage() {
        return window.location.pathname.split("/").pop() || "index.html";
    }

    function pageOf(href) {
        return (href || "").split("#")[0].split("?")[0].split("/").pop();
    }

    function askLogin(target) {
        if (typeof showAppMessage === "function") {
            showAppMessage("Bạn cần đăng nhập để sử dụng chức năng này.", {
                type: "warning",
                title: "Yêu cầu đăng nhập"
            }).finally(function () {
                goToLogin(target);
            });
            return;
        }
        goToLogin(target);
    }

    if (PROTECTED_PAGES.includes(currentPage()) && !isLoggedIn()) {
        goToLogin(currentPage() + window.location.search);
        return;
    }

    document.addEventListener("click", function (e) {
        if (isLoggedIn()) return;

        const link = e.target.closest("a[href]");
        if (link && PROTECTED_PAGES.includes(pageOf(link.getAttribute("href")))) {
            if (link.classList.contains("account-circle")) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            askLogin(link.getAttribute("href"));
            return;
        }

        const btn = e.target.closest(PURCHASE_SELECTOR);
        if (btn) {
            e.preventDefault();
            e.stopImmediatePropagation();
            askLogin(currentPage() + window.location.search);
        }
    }, true);

    document.addEventListener("submit", function (e) {
        if (isLoggedIn()) return;

        const form = e.target.closest(".buy-form");
        if (!form) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        askLogin(currentPage() + window.location.search);
    }, true);

})();