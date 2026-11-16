document.addEventListener("DOMContentLoaded", function () {
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

  const currentUser = getCurrentUser();
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
    avatar: document.getElementById("account-avatar")
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
  }

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

  profileForm.addEventListener("submit", function (event) {
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
      const updatedUser = updateProfile({
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

  passwordForm.addEventListener("submit", function (event) {
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
      changePassword(oldPassword, newPassword);
      passwordForm.reset();
      passwordDialog.close();
      passwordChangeStatus.textContent = "Đổi mật khẩu thành công.";
      passwordChangeStatus.hidden = false;
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

  renderProfile();
});
