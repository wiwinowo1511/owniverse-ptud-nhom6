(function () {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../css/common/feedback.css", document.currentScript.src).href;
  document.head.appendChild(stylesheet);

  let messageQueue = Promise.resolve();

  function getDialog() {
    let dialog = document.getElementById("app-message-dialog");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "app-message-dialog";
    dialog.className = "app-message-dialog";
    dialog.setAttribute("aria-labelledby", "app-message-title");
    dialog.setAttribute("aria-describedby", "app-message-text");
    dialog.innerHTML = [
      '<div class="app-message-card">',
      '  <div class="app-message-mark" aria-hidden="true"></div>',
      '  <p class="app-message-eyebrow">OWNIVERSE</p>',
      '  <h2 class="app-message-title" id="app-message-title"></h2>',
      '  <p class="app-message-text" id="app-message-text"></p>',
      '  <button class="app-message-close" type="button" autofocus>Đã hiểu</button>',
      '</div>'
    ].join("");
    document.body.appendChild(dialog);

    dialog.querySelector(".app-message-close").addEventListener("click", function () {
      dialog.close();
    });

    return dialog;
  }

  function showAppMessage(message, options = {}) {
    const type = ["success", "error", "warning"].includes(options.type) ? options.type : "info";
    const defaultTitles = {
      success: "Thành công",
      error: "Có lỗi xảy ra",
      warning: "Lưu ý",
      info: "Thông báo"
    };

    const openMessage = function () {
      return new Promise(function (resolve) {
        const dialog = getDialog();
        const mark = dialog.querySelector(".app-message-mark");
        const closeButton = dialog.querySelector(".app-message-close");
        dialog.dataset.type = type;
        mark.textContent = type === "success" ? "✓" : type === "error" ? "!" : type === "warning" ? "!" : "i";
        dialog.querySelector(".app-message-title").textContent = options.title || defaultTitles[type];
        dialog.querySelector(".app-message-text").textContent = String(message ?? "");
        dialog.addEventListener("close", resolve, { once: true });
        dialog.showModal();
        closeButton.focus();
      });
    };

    const result = messageQueue.then(openMessage, openMessage);
    messageQueue = result.then(function () {}, function () {});
    return result;
  }

  window.showAppMessage = showAppMessage;
})();
