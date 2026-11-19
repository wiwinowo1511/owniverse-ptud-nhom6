const loginForm = document.querySelector("#loginForm");

loginForm?.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

        try {

            login(email, password);

            const redirect = new URLSearchParams(window.location.search).get("redirect");
            window.location.href =
                safeRedirectTarget(redirect) || "account.html";

        } catch (error) {
            alert(error.message);
        }
    }
);