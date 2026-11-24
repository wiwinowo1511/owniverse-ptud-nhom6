document.addEventListener("DOMContentLoaded", async function () {
  const profileDialog = document.getElementById("profile-dialog");
  const passwordDialog = document.getElementById("password-dialog");
  const logoutDialog = document.getElementById("logout-dialog");
  const profileForm = document.getElementById("profile-form");
  const passwordForm = document.getElementById("change-password-form");
  const saveStatus = document.getElementById("profile-save-status");
  const passwordSaveStatus = document.getElementById("password-save-status");
  const passwordChangeStatus = document.getElementById("password-change-status");
  const passwordChangeButton = document.getElementById("password-change-open");
  const confirmLogoutButton = document.getElementById("confirm-logout");
  const navigationLinks = Array.from(
    document.querySelectorAll(".account-navigation-link[href^='#']")
  );

  if (
    !(profileDialog instanceof HTMLDialogElement) ||
    !(passwordDialog instanceof HTMLDialogElement) ||
    !(logoutDialog instanceof HTMLDialogElement) ||
    !(profileForm instanceof HTMLFormElement) ||
    !(passwordForm instanceof HTMLFormElement) ||
    !(saveStatus instanceof HTMLElement) ||
    !(passwordSaveStatus instanceof HTMLElement) ||
    !(passwordChangeStatus instanceof HTMLElement) ||
    !(passwordChangeButton instanceof HTMLButtonElement) ||
    !(confirmLogoutButton instanceof HTMLButtonElement)
  ) {
    console.error("Account page initialization failed: required account elements are missing.");
    return;
  }

  if (!isLoggedIn()) {
    goToLogin("account.html");
    return;
  }

  let currentUser;
  try {
    currentUser = await refreshCurrentUser();
  } catch (error) {
    goToLogin("account.html");
    return;
  }

  const profileFields = {
    name: document.getElementById("edit-name"),
    email: document.getElementById("edit-email"),
    phone: document.getElementById("edit-phone")
  };
  const profileElements = {
    name: document.getElementById("profile-name"),
    email: document.getElementById("profile-email"),
    personalName: document.getElementById("personal-name"),
    personalEmail: document.getElementById("personal-email"),
    personalPhone: document.getElementById("personal-phone"),
    addressName: document.getElementById("address-name"),
    addressPhone: document.getElementById("address-phone"),
    avatar: document.getElementById("account-avatar"),
    memberSince: document.getElementById("member-since")
  };
  let profile = {
    name: currentUser.fullName || "",
    email: currentUser.email || "",
    phone: currentUser.phone || ""
  };

  function showSaveStatus(message) {
    saveStatus.textContent = message;
    saveStatus.hidden = false;
  }

  function showPasswordSaveStatus(message) {
    passwordSaveStatus.textContent = message;
    passwordSaveStatus.hidden = false;
  }

  function getInitials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "OV";
    return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toLocaleUpperCase("vi");
  }

  function renderProfile() {
    profileElements.name.textContent = profile.name;
    profileElements.email.textContent = profile.email;
    profileElements.personalName.textContent = profile.name;
    profileElements.personalEmail.textContent = profile.email;
    profileElements.personalPhone.textContent = profile.phone || "Chưa cập nhật";
    profileElements.addressName.textContent = profile.name;
    profileElements.addressPhone.textContent = profile.phone || "Chưa cập nhật";
    profileElements.avatar.textContent = getInitials(profile.name);
    profileElements.avatar.setAttribute("aria-label", `Ảnh đại diện chữ cái ${getInitials(profile.name)}`);
    profileElements.memberSince.textContent = formatDate(currentUser.createdAt);
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat("vi-VN").format(date);
  }

  function renderOrders(data) {
    const orderCount = document.getElementById("account-order-count");
    const processingCount = document.getElementById("account-processing-count");
    const ordersBody = document.getElementById("account-orders-body");
    const emptyState = document.getElementById("account-orders-empty");
    orderCount.textContent = String(data.totalOrders || 0);
    processingCount.textContent = String(data.processingOrders || 0);
    ordersBody.replaceChildren();

    const recentOrders = Array.isArray(data.recentOrders) ? data.recentOrders : [];
    emptyState.hidden = recentOrders.length > 0;
    if (!recentOrders.length) return;

    const statusLabels = {
      Pending: "Chờ xác nhận",
      Confirmed: "Đã xác nhận",
      Processing: "Đang xử lý",
      Shipping: "Đang giao",
      Delivered: "Đã giao",
      Cancelled: "Đã hủy"
    };
    const money = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    });

    recentOrders.forEach(function (order) {
      const row = document.createElement("tr");
      const orderCode = document.createElement("td");
      orderCode.dataset.label = "Mã đơn hàng";
      orderCode.textContent = order.orderCode || `#${order.orderId}`;

      const createdAt = document.createElement("td");
      createdAt.dataset.label = "Ngày đặt";
      createdAt.textContent = formatDate(order.createdAt);

      const total = document.createElement("td");
      total.dataset.label = "Tổng tiền";
      total.textContent = money.format(Number(order.totalAmount) || 0);

      const statusCell = document.createElement("td");
      statusCell.dataset.label = "Trạng thái";
      const status = document.createElement("span");
      status.className = "order-status";
      if (["Pending", "Confirmed", "Processing", "Shipping"].includes(order.orderStatus)) {
        status.classList.add("order-status--processing");
      }
      status.textContent = statusLabels[order.orderStatus] || order.orderStatus || "Không rõ";
      statusCell.appendChild(status);

      const detailCell = document.createElement("td");
      detailCell.dataset.label = "Chi tiết";
      const detailLink = document.createElement("a");
      detailLink.href = "cart.html";
      detailLink.textContent = "Chi tiết →";
      detailCell.appendChild(detailLink);

      row.append(orderCode, createdAt, total, statusCell, detailCell);
      ordersBody.appendChild(row);
    });
  }

  function renderOrdersError(error) {
    const ordersBody = document.getElementById("account-orders-body");
    const emptyState = document.getElementById("account-orders-empty");
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "account-load-error";
    cell.textContent = error.message || "Không thể tải đơn hàng.";
    row.appendChild(cell);
    ordersBody.replaceChildren(row);
    emptyState.hidden = true;
  }

  function renderAddresses(items) {
    const list = document.getElementById("account-address-list");
    list.replaceChildren();
    if (!Array.isArray(items) || !items.length) {
      const empty = document.createElement("p");
      empty.className = "account-empty-state";
      empty.textContent = "Bạn chưa lưu địa chỉ giao hàng.";
      list.appendChild(empty);
      return;
    }

    items.forEach(function (item) {
      const entry = document.createElement("div");
      const contact = document.createElement("p");
      contact.className = "account-address-name";
      const receiver = document.createElement("span");
      receiver.textContent = item.receiverName || "";
      const separator = document.createElement("span");
      separator.setAttribute("aria-hidden", "true");
      separator.textContent = "·";
      const phone = document.createElement("span");
      phone.textContent = item.receiverPhone || "";
      contact.append(receiver, separator, phone);

      const address = document.createElement("address");
      address.textContent = [item.addressLine, item.ward, item.district, item.city]
        .filter(Boolean)
        .join(", ");
      entry.append(contact, address);

      if (item.isDefault) {
        const label = document.createElement("small");
        label.textContent = "Địa chỉ mặc định";
        entry.appendChild(label);
      }
      list.appendChild(entry);
    });
  }

  function renderAddressesError(error) {
    const list = document.getElementById("account-address-list");
    const message = document.createElement("p");
    message.className = "account-load-error";
    message.setAttribute("role", "status");
    message.textContent = error.message || "Không thể tải địa chỉ.";
    list.replaceChildren(message);
  }

  function renderCommunities(items) {
    if (!Array.isArray(items)) throw new Error("Dữ liệu cộng đồng trả về không hợp lệ.");
    const communities = items.map(function (community) {
      const artistId = community && (community.artistId !== undefined ? community.artistId : community.ArtistId);
      const artistName = community && (community.artistName || community.ArtistName);
      const communityName = community && (community.name || community.Name);
      if (artistId == null || !Number.isInteger(Number(artistId)) || Number(artistId) < 1) {
        throw new Error("Dữ liệu cộng đồng trả về thiếu mã nghệ sĩ hợp lệ.");
      }
      return { artistId, label: artistName || communityName || "Cộng đồng" };
    });
    const count = document.getElementById("account-community-count");
    const summary = document.getElementById("account-community-summary");
    const list = document.getElementById("account-community-list");
    const emptyState = document.getElementById("account-communities-empty");
    count.textContent = String(communities.length);
    summary.textContent = `Cộng đồng đã tham gia: ${communities.length}.`;
    summary.classList.remove("account-load-error");
    emptyState.hidden = communities.length > 0;
    list.replaceChildren();

    communities.forEach(function (community) {
      const link = document.createElement("a");
      link.href = `artist-community.html?id=${encodeURIComponent(community.artistId)}`;
      link.appendChild(document.createTextNode(community.label));
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = " →";
      link.appendChild(arrow);
      list.appendChild(link);
    });
  }

  function renderCommunitiesError(error) {
    const summary = document.getElementById("account-community-summary");
    const list = document.getElementById("account-community-list");
    const emptyState = document.getElementById("account-communities-empty");
    summary.textContent = error.message || "Không thể tải danh sách cộng đồng.";
    summary.classList.add("account-load-error");
    list.replaceChildren();
    emptyState.hidden = true;
  }

  async function refreshJoinedCommunities() {
    try {
      renderCommunities(await apiRequest("/api/users/me/communities", { auth: true }));
    } catch (error) {
      console.error("Could not refresh joined communities", error);
      if (!isLoggedIn()) {
        goToLogin("account.html");
        return;
      }
      renderCommunitiesError(error);
    }
  }

  window.addEventListener("owniverse:community-membership-updated", refreshJoinedCommunities);
  window.addEventListener("storage", function (event) {
    if (event.key === "owniverse_community_membership_updated") refreshJoinedCommunities();
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) refreshJoinedCommunities();
  });

  function openProfileDialog() {
    profileFields.name.value = profile.name;
    profileFields.email.value = profile.email;
    profileFields.phone.value = profile.phone;
    if (!saveStatus.hidden) saveStatus.hidden = true;
    profileDialog.showModal();
    profileFields.name.focus();
  }

  document.querySelectorAll("#edit-profile-open, [data-open-profile]").forEach(function (button) {
    button.addEventListener("click", openProfileDialog);
  });

  document.querySelectorAll("[data-close-profile]").forEach(function (button) {
    button.addEventListener("click", function () {
      profileDialog.close();
    });
  });

  profileDialog.addEventListener("click", function (event) {
    if (event.target === profileDialog) profileDialog.close();
  });

   profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!profileForm.reportValidity()) return;

    const nextProfile = {
      name: profileFields.name.value.trim(),
      email: profileFields.email.value.trim(),
      phone: profileFields.phone.value.trim()
    };

    if (!nextProfile.name || !nextProfile.email) {
      showSaveStatus("Vui lòng nhập họ tên và email hợp lệ.");
      return;
    }

    try {
      const updatedUser = await updateProfile({
        fullName: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone
      });
      profile = {
        name: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone
      };
      renderProfile();
      profileDialog.close();
      saveStatus.hidden = true;
    } catch (error) {
      showSaveStatus(error.message);
    }
  });

  document.querySelectorAll("[data-close-logout]").forEach(function (button) {
    button.addEventListener("click", function () {
      logoutDialog.close();
    });
  });

  logoutDialog.addEventListener("click", function (event) {
    if (event.target === logoutDialog) logoutDialog.close();
  });

  passwordChangeButton.addEventListener("click", function () {
    passwordForm.reset();
    passwordSaveStatus.hidden = true;
    passwordDialog.showModal();
    document.getElementById("current-password").focus();
  });

  document.querySelectorAll("[data-close-password]").forEach(function (button) {
    button.addEventListener("click", function () {
      passwordDialog.close();
    });
  });

  passwordDialog.addEventListener("click", function (event) {
    if (event.target === passwordDialog) passwordDialog.close();
  });

  passwordForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!passwordForm.reportValidity()) return;

    const oldPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      showPasswordSaveStatus("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
       await changePassword(oldPassword, newPassword);
      passwordForm.reset();
      passwordDialog.close();
      passwordChangeStatus.textContent = "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.";
      passwordChangeStatus.hidden = false;
      window.setTimeout(function () {
        goToLogin();
      }, 1000);
    } catch (error) {
      showPasswordSaveStatus(error.message);
    }
  });

  confirmLogoutButton.addEventListener("click", function () {
    logout();
    window.location.href = HOME_PAGE;
  });

  navigationLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const sectionId = link.getAttribute("href").slice(1);
      if (sectionId === "sign-out") {
        event.preventDefault();
        logoutDialog.showModal();
        return;
      }

      setActiveNavigation(link);
    });
  });

  function setActiveNavigation(activeLink) {
    navigationLinks.forEach(function (link) {
      const isActive = link === activeLink;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const sections = navigationLinks
      .map(function (link) {
        const id = link.getAttribute("href").slice(1);
        return { link, section: document.getElementById(id) };
      })
      .filter(function (item) {
        return item.section && item.section.id !== "sign-out";
      });

    const observer = new IntersectionObserver(
      function (entries) {
        const visibleSections = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (first, second) {
            return second.intersectionRatio - first.intersectionRatio;
          });
        if (!visibleSections.length) return;

        const activeSection = sections.find(function (item) {
          return item.section === visibleSections[0].target;
        });
        if (activeSection) setActiveNavigation(activeSection.link);
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: [0, 0.1, 0.5] }
    );

    sections.forEach(function (item) {
      observer.observe(item.section);
    });
  }

  function loadAccountSection(path, renderSuccess, renderError) {
    apiRequest(path, { auth: true }).then(function (data) {
      if (!isLoggedIn()) {
        goToLogin("account.html");
        return;
      }
      renderSuccess(data);
    }).catch(function (error) {
      if (!isLoggedIn()) {
        goToLogin("account.html");
        return;
      }
      renderError(error);
    });
  }

  renderProfile();
  loadAccountSection("/api/users/me/orders", renderOrders, renderOrdersError);
  loadAccountSection("/api/users/me/addresses", renderAddresses, renderAddressesError);
  loadAccountSection("/api/users/me/communities", renderCommunities, renderCommunitiesError);
});
