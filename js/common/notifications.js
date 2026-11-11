(function () {
  const STORAGE_KEY = "owniverse_notifications";

  function getNotifications() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const notifications = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(notifications)) return [];
      return notifications.filter(function (notification) {
        return notification && typeof notification === "object";
      }).sort(function (a, b) {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } catch (error) {
      console.warn("Không thể đọc danh sách thông báo:", error);
      return [];
    }
  }

  function createNotificationItem(notification) {
    const item = document.createElement("li");
    item.className = "notification-item";

    const title = document.createElement("strong");
    title.className = "notification-item_title";
    title.textContent = notification.title || "Thông báo";
    item.appendChild(title);

    const message = document.createElement("p");
    message.className = "notification-item_message";
    message.textContent = notification.message || notification.body || "";
    item.appendChild(message);

    if (notification.createdAt) {
      const date = new Date(notification.createdAt);
      if (!Number.isNaN(date.getTime())) {
        const time = document.createElement("time");
        time.className = "notification-item_time";
        time.dateTime = date.toISOString();
        time.textContent = date.toLocaleString("vi-VN");
        item.appendChild(time);
      }
    }

    return item;
  }

  function renderList(list, notifications) {
    list.replaceChildren();
    if (notifications.length === 0) {
      const empty = document.createElement("li");
      empty.className = "notification-empty";
      empty.textContent = "Không có thông báo";
      list.appendChild(empty);
      return;
    }

    notifications.forEach(function (notification) {
      list.appendChild(createNotificationItem(notification));
    });
  }

  function renderAllNotifications() {
    const list = document.querySelector("[data-notification-list]");
    if (list) renderList(list, getNotifications());
  }

  function initNotificationMenu() {
    const actions = document.querySelector(".header-actions");
    const cartLink = actions && actions.querySelector('a[href="cart.html"]');
    if (!actions || !cartLink) return;

    let menu = actions.querySelector(".notification-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "notification-menu";
      actions.insertBefore(menu, cartLink);
    }

    let trigger = menu.querySelector(".notification-trigger");
    if (!trigger) {
      trigger = document.createElement("button");
      trigger.className = "notification-trigger";
      trigger.type = "button";
      trigger.setAttribute("aria-label", "Thông báo");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", "notification-dropdown");
      trigger.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>' +
        '<path d="M10 21h4"></path></svg><span class="notification-indicator" hidden></span>';
      menu.appendChild(trigger);
    }

    let dropdown = menu.querySelector(".notification-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("section");
      dropdown.className = "notification-dropdown";
      dropdown.id = "notification-dropdown";
      dropdown.setAttribute("aria-label", "Thông báo gần đây");
      dropdown.hidden = true;
      dropdown.innerHTML =
        '<div class="notification-dropdown_heading"><h2>Thông báo</h2></div>' +
        '<ul class="notification-list" data-recent-notifications></ul>' +
        '<a class="notification-view-all" href="noti.html">Xem tất cả</a>';
      menu.appendChild(dropdown);
    }

    function refreshNotifications() {
      const notifications = getNotifications();
      renderList(dropdown.querySelector("[data-recent-notifications]"), notifications.slice(0, 5));
      trigger.querySelector(".notification-indicator").hidden = notifications.length === 0;
      const label = notifications.length
        ? "Thông báo, " + notifications.length + " thông báo"
        : "Thông báo";
      trigger.setAttribute("aria-label", label);
    }

    function setOpen(open) {
      if (open && window.matchMedia("(max-width: 480px)").matches) {
        dropdown.style.setProperty(
          "--notification-dropdown-top",
          trigger.getBoundingClientRect().bottom + 8 + "px"
        );
      }
      dropdown.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      if (open) refreshNotifications();
    }

    trigger.addEventListener("click", function () {
      setOpen(dropdown.hidden);
    });
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !dropdown.hidden) {
        setOpen(false);
        trigger.focus();
      }
    });
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY || event.key === null) refreshNotifications();
    });

    refreshNotifications();
  }

  function init() {
    initNotificationMenu();
    renderAllNotifications();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  window.addEventListener("storage", renderAllNotifications);
})();
