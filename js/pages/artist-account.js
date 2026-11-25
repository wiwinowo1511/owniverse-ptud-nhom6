document.addEventListener("DOMContentLoaded", async function () {
  const alert = document.getElementById("artist-account-alert");
  const accountForm = document.getElementById("artist-account-form");
  const communityForm = document.getElementById("artist-community-form");
  const detailForm = document.getElementById("artist-detail-form");
  const passwordForm = document.getElementById("artist-password-form");
  const passwordDialog = document.getElementById("artist-password-dialog");
  const logoutDialog = document.getElementById("artist-logout-dialog");
  if (!accountForm || !communityForm || !detailForm || !passwordForm || !passwordDialog || !logoutDialog) return;

  const fields = {
    fullName: document.getElementById("artist-full-name"),
    email: document.getElementById("artist-email"),
    phone: document.getElementById("artist-phone"),
    description: document.getElementById("artist-description"),
    avatar: document.getElementById("artist-avatar-url"),
    cover: document.getElementById("artist-cover-url"),
    handle: document.getElementById("artist-handle"),
    genre: document.getElementById("artist-detail-genre"),
    summary: document.getElementById("artist-summary"),
    photo: document.getElementById("artist-photo-url"),
    youtube: document.getElementById("artist-social-youtube"),
    instagram: document.getElementById("artist-social-instagram"),
    tiktok: document.getElementById("artist-social-tiktok"),
    promotionTitle: document.getElementById("artist-promotion-title"),
    promotionDescription: document.getElementById("artist-promotion-description"),
    promotionImage: document.getElementById("artist-promotion-image"),
    promotionLink: document.getElementById("artist-promotion-link")
  };
  const statuses = {
    account: document.getElementById("artist-account-status"),
    community: document.getElementById("artist-community-status"),
    detail: document.getElementById("artist-detail-status"),
    password: document.getElementById("artist-password-status")
  };
  const repeaterDefinitions = {
    timeline: { container: document.getElementById("artist-timeline-editor"), template: document.getElementById("artist-timeline-entry-template") },
    activity: { container: document.getElementById("artist-activity-editor"), template: document.getElementById("artist-activity-entry-template") },
    video: { container: document.getElementById("artist-video-editor"), template: document.getElementById("artist-video-entry-template") }
  };
  const navigationLinks = Array.from(document.querySelectorAll(".artist-account-page .account-navigation-link[href^='#']"));
  const isDemoSession = window.isArtistDemoSession();
  let currentUser;
  let artist;

  function showStatus(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    element.classList.toggle("artist-form-status--error", Boolean(isError));
  }

  function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "OV";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toLocaleUpperCase("vi");
  }

  function imageReference(value) {
    const reference = String(value || "").trim();
    if (!reference) return "";
    if (/^https:\/\//i.test(reference)) return reference;
    if (/^(\/\/|[a-z][a-z0-9+.-]*:)/i.test(reference)) return null;
    try {
      const url = new URL(reference, window.location.href);
      return url.origin === window.location.origin ? reference : null;
    } catch (error) {
      return null;
    }
  }

  function setImage(preview, value, fallback) {
    const source = imageReference(value);
    preview.src = source || fallback || "images/icons/favicon-32x32.png";
    preview.onerror = function () {
      preview.onerror = null;
      if (fallback) preview.src = fallback;
    };
  }

  function fillRepeater(type, entries) {
    const definition = repeaterDefinitions[type];
    if (!definition || !definition.container || !definition.template) return;
    definition.container.replaceChildren();
    (Array.isArray(entries) ? entries : []).forEach(function (entry) {
      const fragment = definition.template.content.cloneNode(true);
      const item = fragment.querySelector(".artist-repeatable-item");
      item.querySelectorAll("[data-field]").forEach(function (field) {
        field.value = entry[field.dataset.field] || "";
      });
      definition.container.appendChild(fragment);
    });
  }

  function collectRepeater(type) {
    const definition = repeaterDefinitions[type];
    if (!definition || !definition.container) return [];
    return Array.from(definition.container.querySelectorAll(".artist-repeatable-item")).map(function (item) {
      const entry = {};
      item.querySelectorAll("[data-field]").forEach(function (field) {
        entry[field.dataset.field] = field.value.trim();
      });
      return entry;
    }).filter(function (entry) {
      return Object.values(entry).some(Boolean);
    });
  }

  function validateRepeater(type, requiredFields, label) {
    const incomplete = collectRepeater(type).find(function (entry) {
      return requiredFields.some(function (field) { return !entry[field]; });
    });
    if (incomplete) {
      showStatus(statuses.detail, "H?y ði?n ð? " + label + " cho t?ng m?c ho?c xóa m?c c?n tr?ng.", true);
      return false;
    }
    return true;
  }

  function linkReference(value) {
    const reference = String(value || "").trim();
    if (!reference) return "";
    if (/^https:\/\//i.test(reference)) {
      try {
        return new URL(reference).protocol === "https:" ? reference : null;
      } catch (error) {
        return null;
      }
    }
    if (/^(\/\/|[a-z][a-z0-9+.-]*:)/i.test(reference)) return null;
    try {
      const url = new URL(reference, window.location.href);
      return url.origin === window.location.origin ? reference : null;
    } catch (error) {
      return null;
    }
  }

  function validSocialUrl(value) {
    const reference = String(value || "").trim();
    if (!reference) return true;
    try {
      return new URL(reference).protocol === "https:";
    } catch (error) {
      return false;
    }
  }

  function render() {
    document.getElementById("artist-name").textContent = artist.name || currentUser.fullName || "Ngh? s? Owniverse";
    document.getElementById("artist-genre").textContent = artist.genre || "Chýa c?p nh?t phong cách ngh? thu?t";
    document.getElementById("artist-stat-genre").textContent = artist.genre || "Chýa c?p nh?t";
    document.getElementById("artist-profile-status").textContent = artist.status === "active" ? "Ðang ho?t ð?ng" : "Ð? c?p nh?t";
    fields.fullName.value = currentUser.fullName || "";
    fields.email.value = currentUser.email || "";
    fields.phone.value = currentUser.phone || "";
    fields.description.value = artist.description || "";
    fields.avatar.value = artist.avatar || "";
    fields.cover.value = artist.cover || "";
    fields.handle.value = artist.handle || "";
    fields.genre.value = artist.genre || "";
    fields.summary.value = artist.summary || "";
    fields.photo.value = artist.photo || "";

    const social = artist.social || {};
    fields.youtube.value = social.youtube || "";
    fields.instagram.value = social.instagram || "";
    fields.tiktok.value = social.tiktok || "";

    const promotion = artist.promotion || {};
    fields.promotionTitle.value = promotion.title || "";
    fields.promotionDescription.value = promotion.description || "";
    fields.promotionImage.value = promotion.image || "";
    fields.promotionLink.value = promotion.link || "";
    fillRepeater("timeline", artist.information);
    fillRepeater("activity", artist.activities);
    fillRepeater("video", artist.musicVideos);

    const avatar = artist.avatar || "images/icons/favicon-32x32.png";
    const cover = artist.cover || "images/banners/Kairo-banner.png";
    setImage(document.getElementById("artist-avatar-image"), avatar, "images/icons/favicon-32x32.png");
    setImage(document.getElementById("artist-avatar-preview"), avatar, "images/icons/favicon-32x32.png");
    setImage(document.getElementById("artist-cover-image"), cover, "images/banners/Kairo-banner.png");
    setImage(document.getElementById("artist-cover-preview"), cover, "images/banners/Kairo-banner.png");

    const communityLink = document.getElementById("artist-community-link");
    communityLink.href = artist.communityLink || "artist-community.html?id=" + encodeURIComponent(artist.id);
    document.getElementById("artist-detail-preview-link").href = "artist-detail.html?artist=" + encodeURIComponent(artist.slug || "kairo");
  }

  function setBusy(form, busy) {
    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = busy;
    form.setAttribute("aria-busy", String(busy));
  }

  function previewField(field, preview, fallback) {
    const source = imageReference(field.value);
    field.setCustomValidity(source === null ? "Nh?p ðý?ng d?n ?nh trong website ho?c URL b?t ð?u b?ng https://." : "");
    setImage(preview, source, fallback);
  }

  try {
    if (isDemoSession) {
      currentUser = window.getArtistDemoUser();
      artist = window.getArtistDemoProfile();
      document.getElementById("artist-account-mode").textContent = "B?n demo ngo?i tuy?n";
      showStatus(alert, "B?n ðang xem tài kho?n demo. Thay ð?i ðý?c lýu trong tr?nh duy?t này.", false);
    } else {
      if (!isLoggedIn()) {
        goToLogin("artist-account.html", "login.html");
        return;
      }
      currentUser = await refreshCurrentUser();
      if (String(currentUser.role || "").toLowerCase() !== "artist") {
        showStatus(alert, "Tài kho?n này chýa ðý?c c?p quy?n ngh? s?.", true);
        window.setTimeout(function () { window.location.replace("index.html"); }, 900);
        return;
      }
      artist = await apiRequest("/api/artists/me", { auth: true });
    }
    render();
  } catch (error) {
    if (!isLoggedIn()) {
      goToLogin("artist-account.html", "login.html");
      return;
    }
    showStatus(alert, error.message || "Không th? t?i h? sõ ngh? s? lúc này.", true);
    accountForm.hidden = true;
    communityForm.hidden = true;
    detailForm.hidden = true;
  }

  accountForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!accountForm.reportValidity()) return;
    setBusy(accountForm, true);
    statuses.account.hidden = true;
    try {
      const updatedUser = {
        fullName: fields.fullName.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim()
      };
      currentUser = isDemoSession
        ? window.saveArtistDemoUser(updatedUser)
        : await updateProfile(updatedUser);
      document.getElementById("artist-name").textContent = artist.name || currentUser.fullName;
      showStatus(statuses.account, isDemoSession
        ? "Thông tin tài kho?n ð? ðý?c lýu trong tr?nh duy?t."
        : "Thông tin tài kho?n ð? ðý?c c?p nh?t.", false);
    } catch (error) {
      showStatus(statuses.account, error.message || "Không th? lýu thông tin tài kho?n.", true);
    } finally {
      setBusy(accountForm, false);
    }
  });

  fields.avatar.addEventListener("input", function () {
    previewField(fields.avatar, document.getElementById("artist-avatar-preview"), "images/icons/favicon-32x32.png");
  });
  fields.cover.addEventListener("input", function () {
    previewField(fields.cover, document.getElementById("artist-cover-preview"), "images/banners/Kairo-banner.png");
  });

  communityForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!communityForm.reportValidity()) return;
    const avatar = imageReference(fields.avatar.value);
    const cover = imageReference(fields.cover.value);
    if (avatar === null || cover === null) {
      showStatus(statuses.community, "Ðý?ng d?n ?nh chýa h?p l?.", true);
      return;
    }
    setBusy(communityForm, true);
    statuses.community.hidden = true;
    try {
      const updatedProfile = {
        description: fields.description.value.trim(),
        avatar: avatar,
        cover: cover
      };
      artist = isDemoSession
        ? window.saveArtistDemoProfile(updatedProfile)
        : await apiRequest("/api/artists/me", { method: "PUT", auth: true, body: updatedProfile });
      render();
      showStatus(statuses.community, isDemoSession
        ? "H? sõ c?ng ð?ng ð? ðý?c lýu trong tr?nh duy?t."
        : "H? sõ c?ng ð?ng ð? ðý?c c?p nh?t.", false);
    } catch (error) {
      showStatus(statuses.community, error.message || "Không th? c?p nh?t h? sõ c?ng ð?ng.", true);
    } finally {
      setBusy(communityForm, false);
    }
  });

  document.querySelectorAll("[data-add-artist-entry]").forEach(function (button) {
    button.addEventListener("click", function () {
      const definition = repeaterDefinitions[button.dataset.addArtistEntry];
      if (!definition || !definition.container || !definition.template) return;
      definition.container.appendChild(definition.template.content.cloneNode(true));
      definition.container.lastElementChild.querySelector("input, textarea, select").focus();
    });
  });

  Object.values(repeaterDefinitions).forEach(function (definition) {
    definition.container.addEventListener("click", function (event) {
      const removeButton = event.target.closest("[data-remove-artist-entry]");
      if (removeButton) removeButton.closest(".artist-repeatable-item").remove();
    });
  });

  detailForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!detailForm.reportValidity()) return;
    statuses.detail.hidden = true;

    if (!validateRepeater("timeline", ["year", "title"], "th?i gian và tiêu ð?") ||
        !validateRepeater("activity", ["title", "type", "date"], "tên, lo?i và th?i gian ho?t ð?ng") ||
        !validateRepeater("video", ["title", "type", "youtubeId"], "tên, lo?i và m? YouTube")) return;

    const social = {
      youtube: fields.youtube.value.trim(),
      instagram: fields.instagram.value.trim(),
      tiktok: fields.tiktok.value.trim()
    };
    if (!Object.values(social).every(validSocialUrl)) {
      showStatus(statuses.detail, "Liên k?t m?ng x? h?i ph?i là URL HTTPS h?p l?.", true);
      return;
    }

    const activities = collectRepeater("activity");
    const images = [fields.photo.value, fields.promotionImage.value]
      .concat(activities.map(function (activity) { return activity.image; }));
    if (images.some(function (image) { return imageReference(image) === null; })) {
      showStatus(statuses.detail, "?nh c?n dùng ðý?ng d?n trong website ho?c URL b?t ð?u b?ng https://.", true);
      return;
    }

    const links = [fields.promotionLink.value]
      .concat(activities.map(function (activity) { return activity.link; }));
    if (links.some(function (link) { return linkReference(link) === null; })) {
      showStatus(statuses.detail, "Liên k?t c?n là HTTPS ho?c ðý?ng d?n n?i b? c?a website.", true);
      return;
    }

    const videos = collectRepeater("video");
    if (videos.some(function (video) { return !/^[A-Za-z0-9_-]{6,20}$/.test(video.youtubeId); })) {
      showStatus(statuses.detail, "M? video YouTube chýa h?p l?.", true);
      return;
    }

    const payload = {
      handle: fields.handle.value.trim(),
      genre: fields.genre.value.trim(),
      summary: fields.summary.value.trim(),
      photo: imageReference(fields.photo.value),
      social: social,
      promotion: {
        title: fields.promotionTitle.value.trim(),
        description: fields.promotionDescription.value.trim(),
        image: imageReference(fields.promotionImage.value),
        link: linkReference(fields.promotionLink.value)
      },
      information: collectRepeater("timeline"),
      activities: activities.map(function (activity) {
        return { ...activity, image: imageReference(activity.image), link: linkReference(activity.link) };
      }),
      musicVideos: videos
    };

    setBusy(detailForm, true);
    try {
      artist = isDemoSession
        ? window.saveArtistDemoProfile(payload)
        : await apiRequest("/api/artists/me", { method: "PUT", auth: true, body: payload });
      render();
      showStatus(statuses.detail, isDemoSession
        ? "Trang chi ti?t ngh? s? ð? ðý?c lýu trong tr?nh duy?t."
        : "Trang chi ti?t ngh? s? ð? ðý?c c?p nh?t.", false);
    } catch (error) {
      showStatus(statuses.detail, error.message || "Không th? lýu trang chi ti?t ngh? s?.", true);
    } finally {
      setBusy(detailForm, false);
    }
  });

  document.getElementById("artist-password-open").addEventListener("click", function () {
    passwordForm.reset();
    statuses.password.hidden = true;
    passwordDialog.showModal();
    document.getElementById("artist-current-password").focus();
  });
  document.querySelectorAll("[data-close-artist-password]").forEach(function (button) {
    button.addEventListener("click", function () { passwordDialog.close(); });
  });
  passwordDialog.addEventListener("click", function (event) {
    if (event.target === passwordDialog) passwordDialog.close();
  });
  passwordForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!passwordForm.reportValidity()) return;
    const oldPassword = document.getElementById("artist-current-password").value;
    const newPassword = document.getElementById("artist-new-password").value;
    const confirmation = document.getElementById("artist-confirm-password").value;
    if (newPassword !== confirmation) {
      showStatus(statuses.password, "M?t kh?u xác nh?n không kh?p.", true);
      return;
    }
    if (isDemoSession) {
      showStatus(statuses.password, "Ð?i m?t kh?u c?n k?t n?i backend; thao tác này ðang t?t trong b?n demo.", true);
      return;
    }
    setBusy(passwordForm, true);
    try {
      await changePassword(oldPassword, newPassword);
      passwordForm.reset();
      passwordDialog.close();
      goToLogin("artist-account.html", "login.html");
    } catch (error) {
      showStatus(statuses.password, error.message || "Không th? ð?i m?t kh?u.", true);
    } finally {
      setBusy(passwordForm, false);
    }
  });

  document.querySelectorAll("[data-close-artist-logout]").forEach(function (button) {
    button.addEventListener("click", function () { logoutDialog.close(); });
  });
  logoutDialog.addEventListener("click", function (event) {
    if (event.target === logoutDialog) logoutDialog.close();
  });
  document.getElementById("artist-logout-confirm").addEventListener("click", async function (event) {
    event.currentTarget.disabled = true;
    if (isDemoSession) window.endArtistDemoSession();
    else await logoutAndWait();
    window.location.replace("index.html");
  });

  navigationLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (link.getAttribute("href") === "#artist-sign-out") {
        event.preventDefault();
        logoutDialog.showModal();
        return;
      }
      navigationLinks.forEach(function (item) {
        item.classList.toggle("is-active", item === link);
        if (item === link) item.setAttribute("aria-current", "location");
        else item.removeAttribute("aria-current");
      });
    });
  });
});
