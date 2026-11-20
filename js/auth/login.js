
const loginForm = document.querySelector("#loginForm");

loginForm?.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

        try {

            await login(email, password);

            const redirect = new URLSearchParams(window.location.search).get("redirect");
            window.location.href =
                safeRedirectTarget(redirect) || "account.html";

        } catch (error) {
            alert(error.message);
        }
    }
);
