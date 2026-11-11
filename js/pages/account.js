document.addEventListener("DOMContentLoaded", function () {
  const profileDialog = document.getElementById("profile-dialog");
  const logoutDialog = document.getElementById("logout-dialog");
  const profileForm = document.getElementById("profile-form");
  const saveStatus = document.getElementById("profile-save-status");
  const passwordInfoButton = document.getElementById("password-info-button");
  const passwordInfo = document.getElementById("password-info");
  const navigationLinks = Array.from(
    document.querySelectorAll(".account-navigation-link[href^='#']")
  );

  if (
    !(profileDialog instanceof HTMLDialogElement) ||
    !(logoutDialog instanceof HTMLDialogElement) ||
    !(profileForm instanceof HTMLFormElement) ||
    !(saveStatus instanceof HTMLElement)
  ) {
    console.error("Account page initialization failed: required account elements are missing.");
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
    avatar: document.getElementById("account-avatar")
  };
  const storageKey = "owniverse.account.profile";
  const defaultProfile = {
    name: "Nguyễn Văn A",
    email: "email@example.com",
    phone: "09xx xxx xxx"
  };
  let profile = { ...defaultProfile };

  function showSaveStatus(message) {
    saveStatus.textContent = message;
    saveStatus.hidden = false;
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

  function readStoredProfile() {
    try {
      const savedProfile = localStorage.getItem(storageKey);
      if (!savedProfile) return;

      const parsedProfile = JSON.parse(savedProfile);
      if (
        !parsedProfile ||
        typeof parsedProfile.name !== "string" ||
        typeof parsedProfile.email !== "string" ||
        typeof parsedProfile.phone !== "string" ||
        !parsedProfile.name.trim() ||
        !parsedProfile.email.trim()
      ) {
        throw new TypeError("Saved account profile has an invalid shape.");
      }

      profile = {
        name: parsedProfile.name.trim(),
        email: parsedProfile.email.trim(),
        phone: parsedProfile.phone.trim()
      };
    } catch (error) {
      console.error("Unable to load the saved account profile.", error);
      showSaveStatus("Không thể đọc hồ sơ đã lưu. Bạn có thể nhập và lưu lại thông tin.");
    }
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

    profile = nextProfile;
    renderProfile();

    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
      profileDialog.close();
    } catch (error) {
      console.error("Unable to save the account profile to local storage.", error);
      showSaveStatus("Không thể lưu vào trình duyệt. Thông tin chỉ được cập nhật tạm thời trên trang này.");
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

  if (passwordInfoButton && passwordInfo) {
    passwordInfoButton.addEventListener("click", function () {
      const isExpanded = passwordInfoButton.getAttribute("aria-expanded") === "true";
      passwordInfoButton.setAttribute("aria-expanded", String(!isExpanded));
      passwordInfo.hidden = isExpanded;
    });
  }

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

  readStoredProfile();
  renderProfile();
});
