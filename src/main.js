const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";
const AUTH_STORAGE_KEY = "bhio-auth";
if (SUPABASE_URL) {
  const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
  const legacyAuthStorageKey = `sb-${projectRef}-auth-token`;
  if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
    const previous =
      localStorage.getItem("solebio-auth") ||
      localStorage.getItem(legacyAuthStorageKey);
    if (previous) {
      localStorage.setItem(AUTH_STORAGE_KEY, previous);
    }
  }
}
const supabaseClient =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: AUTH_STORAGE_KEY,
        },
      })
    : null;
const services = {
  website: "fa-solid fa-globe",
  facebook: "fa-brands fa-facebook-f",
  instagram: "fa-brands fa-instagram",
  messenger: "fa-brands fa-facebook-messenger",
  tiktok: "fa-brands fa-tiktok",
  youtube: "fa-brands fa-youtube",
  linkedin: "fa-brands fa-linkedin-in",
  twitter: "fa-brands fa-x-twitter",
  email: "fa-solid fa-envelope",
  phone: "fa-solid fa-phone",
  whatsapp: "fa-brands fa-whatsapp",
  telegram: "fa-brands fa-telegram",
  location: "fa-solid fa-location-dot",
};
const state = {
  template: "classic",
  font: "DM Sans",
  background: "#e6f1dc",
  radius: 8,
  linkStyle: {
    color: "#ffffff",
    align: "center",
    iconPosition: "left",
    iconTreatment: "plain",
  },
  links: [
    {
      title: "My portfolio",
      url: "tessalee.studio",
      enabled: true,
      iconMode: "auto",
    },
    {
      title: "Latest work",
      url: "instagram.com/tessalee",
      enabled: true,
      iconMode: "auto",
    },
    {
      title: "Book a session",
      url: "tessalee.studio/book",
      enabled: true,
      iconMode: "none",
    },
  ],
  socials: [
    { service: "instagram", handle: "@tessalee", enabled: true },
    { service: "linkedin", handle: "tessa-lee", enabled: true },
  ],
};
const MAX_PAGES = 3;
let pages = [];
let currentPageIndex = 0;
const inputMap = {
  displayName: [".phone-name"],
  username: ["#phoneHandle"],
  bio: [".phone-bio"],
  location: ["#phoneLocation"],
};
const $ = (selector) => document.querySelector(selector);
const fontControl = document.createElement("div");
fontControl.className = "control";
fontControl.style.marginBottom = "22px";
fontControl.innerHTML =
  '<label for="font">Choose font</label><select id="font"><option value="DM Sans">DM Sans</option><option value="Manrope">Manrope</option><option value="Outfit">Outfit</option><option value="Sora">Sora</option><option value="Space Grotesk">Space Grotesk</option><option value="Work Sans">Work Sans</option><option value="Playfair Display">Playfair Display</option><option value="Lora">Lora</option><option value="Cormorant Garamond">Cormorant Garamond</option><option value="Bebas Neue">Bebas Neue</option><option value="Anton">Anton</option><option value="Archivo Black">Archivo Black</option><option value="Fredoka">Fredoka</option><option value="DM Mono">DM Mono</option><option value="IBM Plex Mono">IBM Plex Mono</option></select>';
$("#appearance").append(fontControl);
const analyticsSection = document.createElement("section");
analyticsSection.className = "section";
analyticsSection.innerHTML =
  '<div class="section-head"><span class="section-title">Link analytics</span><span class="edit-hint">Clicks from preview</span></div><div class="analytics-grid" id="analyticsList"></div>';
$("#editor").append(analyticsSection);
function ensureLinkAnalytics() {
  state.links.forEach((link) => {
    link.id =
      link.id ||
      (crypto.randomUUID
        ? crypto.randomUUID()
        : `link-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    link.clicks = Number.isFinite(link.clicks) ? link.clicks : 0;
  });
}
function renderAnalytics() {
  ensureLinkAnalytics();
  const list = $("#analyticsList");
  if (!state.links.length) {
    list.innerHTML =
      '<div class="analytics-empty">Add a link to start tracking clicks.</div>';
    return;
  }
  list.innerHTML = "";
  state.links.forEach((link) => {
    const item = document.createElement("div");
    item.className = "analytics-item";
    const title = document.createElement("span");
    title.className = "analytics-link";
    title.textContent = link.title || "Untitled link";
    const count = document.createElement("span");
    count.className = "analytics-count";
    count.textContent = `${link.clicks} ${link.clicks === 1 ? "click" : "clicks"}`;
    item.append(title, count);
    list.append(item);
  });
}
const analyticsObserver = new MutationObserver(renderAnalytics);
analyticsObserver.observe($("#phoneLinks"), { childList: true });
$("#phoneLinks").addEventListener("click", (event) => {
  const card = event.target.closest(".phone-link");
  if (!card) return;
  const index = Number(card.dataset.focus.replace("link-", ""));
  const link = state.links[index];
  if (!link) return;
  ensureLinkAnalytics();
  link.clicks += 1;
  renderAnalytics();
  queueSave();
});
let authMode = "login";
let isApplyingProfile = false;
function capturePage() {
  return {
    displayName: $("#displayName").value,
    username: $("#username").value,
    bio: $("#bio").value,
    location: $("#location").value,
    pageTitle: $("#pageTitle").value,
    visibility: $("#visibility").checked,
    settings: JSON.parse(JSON.stringify(state)),
  };
}
function saveCurrentPage() {
  const current = capturePage();
  if (!pages.length) {
    pages = [{ name: "Page 1", ...current }];
    currentPageIndex = 0;
    return;
  }
  if (!pages[currentPageIndex]) {
    currentPageIndex = Math.max(
      0,
      Math.min(currentPageIndex, pages.length - 1),
    );
  }
  pages[currentPageIndex] = {
    ...pages[currentPageIndex],
    ...current,
    settings: {
      ...(pages[currentPageIndex].settings || {}),
      ...current.settings,
    },
  };
}
function applyPage(page) {
  isApplyingProfile = true;
  try {
    const settings = page.settings || {};
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, JSON.parse(JSON.stringify(settings)));
    state.template = state.template || "classic";
    state.font = state.font || "DM Sans";
    state.background = state.background || "#e6f1dc";
    state.radius = Number.isFinite(state.radius) ? state.radius : 8;
    state.linkStyle = {
      color: "#ffffff",
      align: "center",
      iconPosition: "left",
      iconTreatment: "plain",
      ...(state.linkStyle || {}),
    };
    state.links = Array.isArray(state.links) ? state.links : [];
    state.socials = Array.isArray(state.socials) ? state.socials : [];
    $("#displayName").value = page.displayName || "";
    $("#username").value = page.username || "";
    $("#bio").value = page.bio || "";
    $("#location").value = page.location || "";
    $("#pageTitle").value = page.pageTitle || "";
    $("#visibility").checked = page.visibility !== false;
    syncAll();
    renderPageSwitcher();
    checkUsernameAvailability(page.username || $("#username").value);
  } finally {
    isApplyingProfile = false;
  }
}
function renderPageSwitcher() {
  $("#pageSwitcher").innerHTML =
    pages
      .map(
        (page, index) =>
          `<button class="page-tab ${index === currentPageIndex ? "active" : ""}" type="button" data-page-index="${index}">${page.name || `Page ${index + 1}`}</button>`,
      )
      .join("") +
    `<button class="add-page" type="button" id="addPage" ${pages.length >= MAX_PAGES ? "disabled" : ""} aria-label="Add page">+ Add page</button>`;
  $("#addPage").addEventListener("click", addPage);
}
const LOCAL_DRAFT_KEY = "bhio-draft";
function setSaveStatus(text) {
  $("#saveStatus").textContent = text;
}
function saveDraftLocally() {
  try {
    saveCurrentPage();
    localStorage.setItem(
      LOCAL_DRAFT_KEY,
      JSON.stringify({ pages, currentPageIndex }),
    );
    setSaveStatus("Saved locally");
  } catch (error) {
    console.error("Could not save local draft:", error);
    setSaveStatus("Local save unavailable");
  }
}
function restoreDraft() {
  try {
    const rawDraft =
      localStorage.getItem(LOCAL_DRAFT_KEY) ||
      localStorage.getItem("solebio-draft");
    const draft = JSON.parse(rawDraft || "null");
    if (!draft || !Array.isArray(draft.pages) || !draft.pages.length)
      return false;
    pages = draft.pages.slice(0, MAX_PAGES);
    currentPageIndex = Math.min(
      Number(draft.currentPageIndex) || 0,
      pages.length - 1,
    );
    applyPage(pages[currentPageIndex]);
    return true;
  } catch (error) {
    console.error("Could not restore local draft:", error);
    return false;
  }
}
function addPage() {
  if (pages.length >= MAX_PAGES) return;
  saveCurrentPage();
  pages.push({
    name: `Page ${pages.length + 1}`,
    displayName: "",
    username: pages[0]?.username || "",
    bio: "",
    location: "",
    pageTitle: "",
    visibility: true,
    settings: {
      template: "classic",
      font: "DM Sans",
      background: "#e6f1dc",
      radius: 8,
      linkStyle: {
        color: "#ffffff",
        align: "center",
        iconPosition: "left",
        iconTreatment: "plain",
      },
      links: [],
      socials: [],
    },
  });
  currentPageIndex = pages.length - 1;
  applyPage(pages[currentPageIndex]);
  queueSave();
}
function openEditor() {
  document.documentElement.classList.add("has-session");
  $("#landing").hidden = true;
  $("#authScreen").classList.remove("open");
  $(".app").classList.add("editor-open");
  requestAnimationFrame(updatePreviewZoom);
}
function openLanding() {
  clearTimeout(saveTimer);
  document.documentElement.classList.remove("has-session");
  $(".app").classList.remove("editor-open");
  $("#previewArea").classList.remove("show");
  $("#authScreen").classList.remove("open");
  $("#landing").hidden = false;
  window.scrollTo({ top: 0, behavior: "instant" });
}
function openAuth(mode) {
  authMode = mode;
  $("#landing").hidden = true;
  $("#authScreen").classList.add("open");
  const signup = mode === "signup";
  $("#authScreen").classList.toggle("signup", signup);
  $("#authConfirmPassword").required = signup;
  $("#authKicker").textContent = signup ? "Make it yours" : "Welcome back";
  $("#authTitle").textContent = signup ? "Create your Bhio" : "Log in to Bhio";
  $("#authIntro").textContent = signup
    ? "Start with one beautiful page for everything you share."
    : "Pick up where you left off.";
  $("#authSubmit").textContent = signup ? "Create account" : "Log in";
  $("#authToggle").textContent = signup ? "Log in" : "Create an account";
  $("#authSwitch").childNodes[0].textContent = signup
    ? "Already have an account? "
    : "New to Bhio? ";
  $("#authEmail").focus();
}
$("#landingStart").addEventListener("click", () => openAuth("signup"));
$("#landingOpen").addEventListener("click", () => openAuth("login"));
$("#landingUsernameStart").addEventListener("click", () => {
  const username = $("#landingUsername").value.trim().replace(/^@/, "");
  if (username) {
    $("#username").value = `@${username}`;
    $("#username").dispatchEvent(new Event("input"));
  }
  openAuth("signup");
});
$("#authBack").addEventListener("click", () => {
  $("#authScreen").classList.remove("open");
  $("#landing").hidden = false;
});
$("#authToggle").addEventListener("click", () =>
  openAuth(authMode === "login" ? "signup" : "login"),
);
document.querySelectorAll("[data-password-toggle]").forEach((button) =>
  button.addEventListener("click", () => {
    const input = $(`#${button.dataset.passwordToggle}`);
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    button.setAttribute(
      "aria-label",
      visible
        ? `Show ${input.id === "authPassword" ? "password" : "confirm password"}`
        : `Hide ${input.id === "authPassword" ? "password" : "confirm password"}`,
    );
    button.innerHTML = `<i class="fa-regular fa-eye${visible ? "" : "-slash"}"></i>`;
  }),
);
$("#logoutButton").addEventListener("click", async () => {
  if (!supabaseClient) return;
  const button = $("#logoutButton");
  button.disabled = true;
  const { error } = await supabaseClient.auth.signOut({ scope: "local" });
  button.disabled = false;
  if (error) {
    alert(error.message);
    return;
  }
  openLanding();
});
function closeDeleteModal() {
  $("#deleteModal").classList.remove("open");
  $("#deleteModal").setAttribute("aria-hidden", "true");
  $("#deleteConfirmation").value = "";
  $("#deleteConfirm").disabled = true;
}
$("#deleteAccountButton").addEventListener("click", () => {
  $("#deleteModal").classList.add("open");
  $("#deleteModal").setAttribute("aria-hidden", "false");
  setTimeout(() => $("#deleteConfirmation").focus(), 0);
});
$("#deleteCancel").addEventListener("click", closeDeleteModal);
$("#deleteModal").addEventListener("click", (event) => {
  if (event.target === $("#deleteModal")) closeDeleteModal();
});
$("#deleteConfirmation").addEventListener("input", (event) => {
  $("#deleteConfirm").disabled = event.target.value !== "DELETE";
});
$("#deleteConfirm").addEventListener("click", async () => {
  if (!supabaseClient || $("#deleteConfirmation").value !== "DELETE") return;
  const button = $("#deleteConfirm");
  button.disabled = true;
  button.textContent = "Deleting...";
  const { error } = await supabaseClient.functions.invoke("delete-account", {
    body: { confirmation: "DELETE" },
  });
  button.textContent = "Delete account";
  if (error) {
    button.disabled = false;
    alert(`Could not delete account: ${error.message}`);
    return;
  }
  await supabaseClient.auth.signOut({ scope: "local" });
  closeDeleteModal();
  openLanding();
  alert("Your account has been deleted.");
});
async function loadProfile(user) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("display_name,username,bio,location,page_title,visibility,settings")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return;
  const hasSavedPages =
    data.settings &&
    Array.isArray(data.settings.pages) &&
    data.settings.pages.length > 0;
  const firstPage = hasSavedPages ? data.settings.pages[0] : null;
  const isCompletelyBlank =
    hasSavedPages &&
    !(data.display_name || firstPage?.displayName) &&
    !(data.bio || firstPage?.bio) &&
    !(data.location || firstPage?.location) &&
    (!firstPage?.settings?.links || firstPage.settings.links.length === 0);
  if (hasSavedPages && !isCompletelyBlank) {
    pages = data.settings.pages.slice(0, MAX_PAGES);
  } else {
    const draftRestored = restoreDraft();
    if (!draftRestored) {
      pages = [
        {
          name: "Page 1",
          displayName: data.display_name || "Tessa Lee",
          username: data.username
            ? `@${data.username}`
            : user.user_metadata?.username
              ? `@${user.user_metadata.username}`
              : "@tessalee",
          bio:
            data.bio ||
            "Photographer, creative director, and collector of small beautiful things.",
          location: data.location || "New York, NY",
          pageTitle: data.page_title || "Tessa Lee - Photographer",
          visibility: data.visibility !== false,
          settings: JSON.parse(JSON.stringify(state)),
        },
      ];
    }
  }
  currentPageIndex = 0;
  applyPage(pages[0]);
}
function syncAll() {
  Object.keys(inputMap).forEach((id) => {
    const input = $(`#${id}`);
    input.dispatchEvent(new Event("input"));
  });
  const bg = state.profileImage ? `url('${state.profileImage}')` : "";
  $("#editorAvatar").style.backgroundImage = bg;
  $(".phone-avatar").style.backgroundImage = bg;
  $("#phonePage").className =
    `phone-page ${state.template === "classic" ? "" : "template-" + state.template}`;
  $("#phonePage").style.fontFamily = `'${state.font || "DM Sans"}', sans-serif`;
  $("#phonePage").dataset.align = state.linkStyle.align || "center";
  $("#phonePage").style.background = state.background || "#e6f1dc";
  $("#radius").value = state.radius || 8;
  document
    .querySelectorAll(".swatch[data-bg]")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.bg === state.background),
    );
  $("#font").value = state.font || "DM Sans";
  renderLinks();
  renderSocials();
  document
    .querySelectorAll(".phone-link")
    .forEach((link) => (link.style.borderRadius = `${state.radius || 8}px`));
}
let saveTimer;
async function saveProfile() {
  if (!supabaseClient) {
    setSaveStatus("Saved locally");
    return;
  }
  saveCurrentPage();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    setSaveStatus("Saved locally");
    return;
  }
  const page = pages[0] || capturePage();
  const rawUsername = (page.username || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  const validUsername = /^[a-z0-9_]{3,30}$/.test(rawUsername)
    ? rawUsername
    : user.user_metadata?.username ||
      `user_${user.id.replace(/-/g, "").slice(0, 8)}`;
  const payload = {
    id: user.id,
    display_name: (page.displayName || "").trim(),
    username: validUsername,
    bio: (page.bio || "").trim(),
    location: (page.location || "").trim(),
    page_title: (page.pageTitle || "").trim(),
    visibility: page.visibility !== false,
    settings: { pages },
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseClient.from("profiles").upsert(payload);
  if (error) {
    console.error("Could not save profile:", error);
    setSaveStatus("Saved locally; sync pending");
    return;
  }
  setSaveStatus("Saved");
}
function queueSave() {
  if (isApplyingProfile) return;
  saveDraftLocally();
  clearTimeout(saveTimer);
  setSaveStatus("Saving...");
  saveTimer = setTimeout(saveProfile, 500);
}
$("#authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (
    authMode === "signup" &&
    $("#authPassword").value !== $("#authConfirmPassword").value
  ) {
    $("#authConfirmPassword").setCustomValidity("Passwords do not match");
    $("#authConfirmPassword").reportValidity();
    $("#authForm").classList.remove("error");
    requestAnimationFrame(() => $("#authForm").classList.add("error"));
    return;
  }
  $("#authConfirmPassword").setCustomValidity("");
  $("#authForm").classList.remove("error");
  if (!supabaseClient) {
    alert(
      "Add SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js first.",
    );
    return;
  }
  $("#authSubmit").classList.add("loading");
  $("#authSubmit").textContent =
    authMode === "signup" ? "Creating account..." : "Logging in...";
  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  const requestedUsername = $("#username")
    .value.trim()
    .replace(/^@/, "")
    .toLowerCase();
  const hasChosenUsername =
    requestedUsername && requestedUsername !== "tessalee";
  const result =
    authMode === "signup"
      ? await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: hasChosenUsername ? { username: requestedUsername } : {},
          },
        })
      : await supabaseClient.auth.signInWithPassword({ email, password });
  if (result.error) {
    $("#authSubmit").classList.remove("loading");
    $("#authSubmit").textContent =
      authMode === "signup" ? "Create account" : "Log in";
    alert(result.error.message);
    return;
  }
  if (authMode === "signup" && !result.data.session) {
    $("#authSubmit").classList.remove("loading");
    $("#authSubmit").textContent = "Create account";
    alert(
      "Account created. Check your email to confirm your account, then log in.",
    );
    return;
  }
  if (result.data.user) {
    try {
      await loadProfile(result.data.user);
    } catch (error) {
      console.error("Could not load profile:", error);
    }
  }
  openEditor();
});
function publicUrl() {
  return `${location.origin}/${$("#username").value.replace(/^@/, "").trim().toLowerCase()}`;
}
function updateShareLinks() {
  const url = publicUrl();
  $("#shareUrl").textContent = url.replace(/^https?:\/\//, "");
  $("#shareQr").src =
    `https://api.qrserver.com/v1/create-qr-code/?size=312x312&data=${encodeURIComponent(url)}`;
  $("#shareFacebook").href =
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  $("#shareMessenger").href =
    `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=0`;
  $("#shareEmail").href =
    `mailto:?subject=${encodeURIComponent("My links")}&body=${encodeURIComponent(url)}`;
}
function getService(url) {
  const value = url.toLowerCase();
  return (
    Object.keys(services).find(
      (service) =>
        value.includes(service) ||
        (service === "twitter" && value.includes("x.com")),
    ) || "website"
  );
}
function getIcon(link, linkStyle = state.linkStyle) {
  const currentLinkStyle = linkStyle || state.linkStyle || {};
  const treatment = `icon-${currentLinkStyle.iconTreatment || "plain"}`;
  if (link.iconMode === "none") return "";
  if (link.iconMode === "image" && link.customImage) {
    const escapedUrl = link.customImage.replace(/'/g, "\\'");
    return `<i class="link-symbol ${treatment}" style="background-image:url('${escapedUrl}');background-size:cover;background-position:center;color:transparent">IMG</i>`;
  }
  return link.iconMode === "image"
    ? `<i class="link-symbol ${treatment} fa-solid fa-image"></i>`
    : `<i class="link-symbol ${treatment} ${services[getService(link.url)] || services.website}"></i>`;
}
function renderLinks() {
  $("#linkList").innerHTML = state.links
    .map(
      (link, index) =>
        `<div class="link-row" data-index="${index}"><span class="grip" title="Drag to reorder" aria-label="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span><div class="link-content"><input class="link-title" value="${link.title}" data-index="${index}" data-key="title" aria-label="Link title" /><input class="link-url" value="${link.url}" data-index="${index}" data-key="url" aria-label="Link URL" /></div><input class="toggle" type="checkbox" ${link.enabled ? "checked" : ""} data-index="${index}" data-key="enabled" aria-label="Enable link"/><button class="icon-btn danger" data-delete="${index}" aria-label="Delete link" title="Delete link"><i class="fa-solid fa-xmark"></i></button><div class="link-options"><select data-index="${index}" data-key="iconMode" aria-label="Link icon style"><option value="auto" ${link.iconMode === "auto" ? "selected" : ""}>Auto icon</option><option value="image" ${link.iconMode === "image" ? "selected" : ""}>Custom image</option><option value="none" ${link.iconMode === "none" ? "selected" : ""}>No icon</option></select>${link.iconMode === "image" ? `<button class="mini-action" type="button" data-upload="${index}">${link.customImage ? "Change image" : "Choose image"}</button>` : ""}</div></div>`,
    )
    .join("");
  $("#phoneLinks").innerHTML = state.links
    .map((link, index) => {
      const icon = getIcon(link);
      const content =
        state.linkStyle.iconPosition === "right"
          ? `<span>${link.title}</span>${icon}`
          : `${icon}<span>${link.title}</span>`;
      const isDark = state.linkStyle.color === "#172219";
      return `<button class="phone-link content-${state.linkStyle.align} ${link.enabled ? "" : "off"}" style="background:${state.linkStyle.color};${isDark ? "color:#fff;border-color:rgba(255,255,255,0.14);" : ""}" data-focus="link-${index}">${content}</button>`;
    })
    .join("");
}
function renderSocials() {
  $("#socialList").innerHTML = state.socials
    .map(
      (social, index) =>
        `<div class="link-row" data-social-index="${index}"><span class="grip" title="Drag to reorder" aria-label="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span><div class="link-content"><select class="link-title" data-social-index="${index}" data-social-key="service" aria-label="Social service">${Object.keys(
          services,
        )
          .filter((service) => service !== "website")
          .map(
            (service) =>
              `<option value="${service}" ${social.service === service ? "selected" : ""}>${service[0].toUpperCase() + service.slice(1)}</option>`,
          )
          .join(
            "",
          )}</select><input class="link-url" value="${social.handle}" data-social-index="${index}" data-social-key="handle" aria-label="Social handle" /></div><input class="toggle" type="checkbox" ${social.enabled ? "checked" : ""} data-social-index="${index}" data-social-key="enabled" aria-label="Enable social account"/><button class="icon-btn danger" data-social-delete="${index}" aria-label="Delete social account" title="Delete social account"><i class="fa-solid fa-xmark"></i></button></div>`,
    )
    .join("");
  $("#phoneSocials").innerHTML = state.socials
    .filter((social) => social.enabled)
    .map(
      (social) =>
        `<i class="social-symbol ${services[social.service]}" title="${social.service}" data-focus="socials"></i>`,
    )
    .join("");
}
function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
let usernameCheckTimer;
async function checkUsernameAvailability(rawVal) {
  const clean = (rawVal || "").trim().replace(/^@/, "").toLowerCase();
  const statusEl = $("#usernameStatus");
  const iconEl = $("#usernameIcon");
  if (!statusEl || !iconEl) return;

  if (!clean) {
    statusEl.className = "username-status";
    statusEl.textContent = "";
    iconEl.className = "username-icon";
    iconEl.innerHTML = "";
    return;
  }

  if (!/^[a-z0-9_]{3,30}$/.test(clean)) {
    statusEl.className = "username-status invalid";
    statusEl.textContent =
      clean.length < 3 ? "Min. 3 characters" : "Letters, numbers, _ only";
    iconEl.className = "username-icon invalid";
    iconEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
    return;
  }

  statusEl.className = "username-status checking";
  statusEl.textContent = "Checking...";
  iconEl.className = "username-icon checking";
  iconEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

  if (!supabaseClient) {
    statusEl.className = "username-status available";
    statusEl.textContent = "Available";
    iconEl.className = "username-icon available";
    iconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    return;
  }

  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    const currentUserId = user?.id;

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, username")
      .eq("username", clean);

    const currentInput = ($("#username").value || "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();
    if (currentInput !== clean) return;

    if (error) {
      console.warn("Could not verify username:", error);
      statusEl.className = "username-status";
      statusEl.textContent = "";
      iconEl.className = "username-icon";
      iconEl.innerHTML = "";
      return;
    }

    const isOwnedByMe =
      data && data.length > 0 && currentUserId && data[0].id === currentUserId;
    const isAvailable = !data || data.length === 0 || isOwnedByMe;

    if (isAvailable) {
      statusEl.className = "username-status available";
      statusEl.textContent = "Available";
      iconEl.className = "username-icon available";
      iconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else {
      statusEl.className = "username-status taken";
      statusEl.textContent = "Already taken";
      iconEl.className = "username-icon taken";
      iconEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    }
  } catch (err) {
    console.error("Username check error:", err);
  }
}
function syncInput(event) {
  const input = event.target;
  const fields = inputMap[input.id];
  if (!fields) return;
  if (input.matches("textarea")) autoResizeTextarea(input);
  fields.forEach((selector) => ($(selector).textContent = input.value));
  if (input.id === "username") {
    const clean = input.value.replace(/^@/, "");
    $("#previewUrl").textContent = `bhio.link/${clean}`;
    $("#urlPreview").textContent = `bhio.link/${clean}`;
    updateShareLinks();
    clearTimeout(usernameCheckTimer);
    usernameCheckTimer = setTimeout(() => {
      checkUsernameAvailability(input.value);
    }, 280);
  }
}
Object.keys(inputMap).forEach((id) =>
  $(`#${id}`).addEventListener("input", syncInput),
);
["displayName", "username", "bio", "location", "pageTitle"].forEach((id) =>
  $(`#${id}`).addEventListener("input", queueSave),
);
$("#username").addEventListener("blur", () =>
  checkUsernameAvailability($("#username").value),
);
$("#visibility").addEventListener("change", queueSave);
$("#avatarUploadButton").addEventListener("click", () =>
  $("#avatarUpload").click(),
);
$("#avatarUpload").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const localUrl = URL.createObjectURL(file);
  $("#editorAvatar").style.backgroundImage = `url('${localUrl}')`;
  $(".phone-avatar").style.backgroundImage = `url('${localUrl}')`;
  if (!supabaseClient) {
    state.profileImage = localUrl;
    queueSave();
    return;
  }
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    alert("Please log in before uploading a profile photo.");
    return;
  }
  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${user.id}/profile-${Date.now()}.${extension}`;
  const { error } = await supabaseClient.storage
    .from("profile-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("Could not upload profile image:", error);
    alert(`Could not save profile photo: ${error.message}`);
    return;
  }
  const { data } = supabaseClient.storage
    .from("profile-images")
    .getPublicUrl(path);
  state.profileImage = data.publicUrl;
  $("#editorAvatar").style.backgroundImage = `url('${data.publicUrl}')`;
  $(".phone-avatar").style.backgroundImage = `url('${data.publicUrl}')`;
  await saveProfile();
  event.target.value = "";
});
$("#templateGrid").addEventListener("click", (event) => {
  const template = event.target.closest("[data-template]");
  if (!template) return;
  state.template = template.dataset.template;
  document
    .querySelectorAll(".template")
    .forEach((item) => item.classList.toggle("active", item === template));
  $("#phonePage").className =
    `phone-page ${state.template === "classic" ? "" : "template-" + state.template}`;
  queueSave();
});
$("#align").addEventListener("change", (event) => {
  state.linkStyle.align = event.target.value;
  $("#phonePage").dataset.align = event.target.value;
  queueSave();
});
$("#font").addEventListener("change", (event) => {
  state.font = event.target.value;
  $("#phonePage").style.fontFamily = `'${state.font}', sans-serif`;
  queueSave();
});
$("#radius").addEventListener("input", (event) => {
  state.radius = Number(event.target.value);
  document
    .querySelectorAll(".phone-link")
    .forEach((link) => (link.style.borderRadius = `${event.target.value}px`));
  queueSave();
});
document.querySelectorAll(".link-color").forEach((button) =>
  button.addEventListener("click", () => {
    state.linkStyle.color = button.dataset.linkColor;
    document
      .querySelectorAll(".link-color")
      .forEach((item) => item.classList.toggle("active", item === button));
    renderLinks();
    queueSave();
  }),
);
$("#linkAlign").addEventListener("change", (event) => {
  state.linkStyle.align = event.target.value;
  renderLinks();
  queueSave();
});
$("#iconPosition").addEventListener("change", (event) => {
  state.linkStyle.iconPosition = event.target.value;
  renderLinks();
  queueSave();
});
$("#iconTreatment").addEventListener("change", (event) => {
  state.linkStyle.iconTreatment = event.target.value;
  renderLinks();
  queueSave();
});
document.querySelectorAll(".swatch").forEach((swatch) =>
  swatch.addEventListener("click", () => {
    document
      .querySelectorAll(".swatch")
      .forEach((item) => item.classList.remove("active"));
    swatch.classList.add("active");
    state.background = swatch.dataset.bg;
    $("#phonePage").style.background = state.background;
    queueSave();
  }),
);
$("#linkList").addEventListener("input", (event) => {
  const { index, key } = event.target.dataset;
  if (index === undefined) return;
  state.links[index][key] = event.target.value;
  if (key === "title") {
    const label = document.querySelector(
      `#phoneLinks .phone-link[data-focus="link-${index}"] span`,
    );
    if (label) label.textContent = event.target.value;
  }
  queueSave();
});
$("#linkList").addEventListener("change", (event) => {
  const { index, key } = event.target.dataset;
  if (index === undefined) return;
  state.links[index][key] =
    key === "enabled" ? event.target.checked : event.target.value;
  renderLinks();
  queueSave();
});
let uploadIndex;
$("#linkList").addEventListener("click", (event) => {
  const delBtn = event.target.closest("[data-delete]");
  if (delBtn) {
    const index = Number(delBtn.dataset.delete);
    state.links.splice(index, 1);
    renderLinks();
    queueSave();
    return;
  }
  const upload = event.target.closest("[data-upload]")?.dataset.upload;
  if (upload !== undefined) {
    event.preventDefault();
    uploadIndex = Number(upload);
    $("#logoUpload").click();
  }
});
$("#logoUpload").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file || uploadIndex === undefined || !state.links[uploadIndex]) return;
  const localUrl = await readFileAsDataUrl(file);
  state.links[uploadIndex].customImage = localUrl;
  renderLinks();
  queueSave();
  if (!supabaseClient) {
    event.target.value = "";
    return;
  }
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    event.target.value = "";
    return;
  }
  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${user.id}/links/link-${uploadIndex}-${Date.now()}.${extension}`;
  const { error } = await supabaseClient.storage
    .from("profile-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("Could not upload link image:", error);
    alert(`Could not save link image: ${error.message}`);
    event.target.value = "";
    return;
  }
  const { data } = supabaseClient.storage
    .from("profile-images")
    .getPublicUrl(path);
  state.links[uploadIndex].customImage = data.publicUrl;
  renderLinks();
  queueSave();
  event.target.value = "";
});
$("#addLink").addEventListener("click", () => {
  state.links.push({
    title: "New link",
    url: "https://",
    enabled: true,
    iconMode: "auto",
  });
  renderLinks();
  queueSave();
  document.querySelector("#linkList .link-row:last-child .link-title").focus();
});
$("#socialList").addEventListener("input", (event) => {
  const { socialIndex, socialKey } = event.target.dataset;
  if (socialIndex === undefined) return;
  state.socials[socialIndex][socialKey] = event.target.value;
  queueSave();
});
$("#socialList").addEventListener("change", (event) => {
  const { socialIndex, socialKey } = event.target.dataset;
  if (socialIndex === undefined) return;
  state.socials[socialIndex][socialKey] =
    socialKey === "enabled" ? event.target.checked : event.target.value;
  renderSocials();
  queueSave();
});
$("#socialList").addEventListener("click", (event) => {
  const delBtn = event.target.closest("[data-social-delete]");
  if (delBtn) {
    const index = Number(delBtn.dataset.socialDelete);
    state.socials.splice(index, 1);
    renderSocials();
    queueSave();
  }
});
$("#addSocial").addEventListener("click", () => {
  state.socials.push({ service: "instagram", handle: "@", enabled: true });
  renderSocials();
  queueSave();
});
function setupReorderableList(
  listEl,
  getItems,
  setItems,
  onUpdate,
  isSocial = false,
) {
  let draggedIndex = null;
  let dragGhost = null;
  listEl.addEventListener("pointerdown", (event) => {
    const grip = event.target.closest(".grip");
    if (!grip) return;
    const row = grip.closest(".link-row");
    if (row) row.setAttribute("draggable", "true");
  });
  listEl.addEventListener("dragstart", (event) => {
    const row = event.target.closest(".link-row");
    if (!row || row.getAttribute("draggable") !== "true") {
      event.preventDefault();
      return;
    }
    draggedIndex = Number(
      isSocial ? row.dataset.socialIndex : row.dataset.index,
    );
    const titleEl = row.querySelector(".link-title");
    const titleText = titleEl
      ? titleEl.value ||
        (titleEl.options ? titleEl.options[titleEl.selectedIndex]?.text : "") ||
        "Link"
      : "Link";
    dragGhost = document.createElement("div");
    dragGhost.className = "drag-ghost-preview";
    dragGhost.innerHTML = `<i class="fa-solid fa-grip-vertical"></i><span>${titleText}</span>`;
    document.body.appendChild(dragGhost);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(draggedIndex));
    if (event.dataTransfer.setDragImage) {
      event.dataTransfer.setDragImage(dragGhost, 20, 18);
    }
    setTimeout(() => {
      row.classList.add("is-dragging");
      if (dragGhost && dragGhost.parentNode) dragGhost.remove();
    }, 0);
  });
  listEl.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const row = event.target.closest(".link-row");
    if (!row || row.classList.contains("is-dragging")) return;
    const rect = row.getBoundingClientRect();
    const isTop = event.clientY - rect.top < rect.height / 2;
    listEl.querySelectorAll(".link-row").forEach((r) => {
      if (r !== row)
        r.classList.remove("drop-indicator-top", "drop-indicator-bottom");
    });
    if (isTop) {
      row.classList.add("drop-indicator-top");
      row.classList.remove("drop-indicator-bottom");
    } else {
      row.classList.add("drop-indicator-bottom");
      row.classList.remove("drop-indicator-top");
    }
  });
  listEl.addEventListener("dragleave", (event) => {
    const row = event.target.closest(".link-row");
    if (row && !row.contains(event.relatedTarget)) {
      row.classList.remove("drop-indicator-top", "drop-indicator-bottom");
    }
  });
  listEl.addEventListener("drop", (event) => {
    event.preventDefault();
    const row = event.target.closest(".link-row");
    listEl.querySelectorAll(".link-row").forEach((r) => {
      r.classList.remove(
        "drop-indicator-top",
        "drop-indicator-bottom",
        "is-dragging",
      );
      r.setAttribute("draggable", "false");
    });
    if (!row || draggedIndex === null) return;
    const targetIndex = Number(
      isSocial ? row.dataset.socialIndex : row.dataset.index,
    );
    if (isNaN(targetIndex) || targetIndex === draggedIndex) return;
    const rect = row.getBoundingClientRect();
    const isTop = event.clientY - rect.top < rect.height / 2;
    const items = getItems();
    const [moved] = items.splice(draggedIndex, 1);
    let insertIdx = targetIndex;
    if (draggedIndex < targetIndex) {
      insertIdx = isTop ? targetIndex - 1 : targetIndex;
    } else {
      insertIdx = isTop ? targetIndex : targetIndex + 1;
    }
    insertIdx = Math.max(0, Math.min(insertIdx, items.length));
    items.splice(insertIdx, 0, moved);
    setItems(items);
    onUpdate();
    draggedIndex = null;
  });
  listEl.addEventListener("dragend", () => {
    listEl.querySelectorAll(".link-row").forEach((r) => {
      r.classList.remove(
        "drop-indicator-top",
        "drop-indicator-bottom",
        "is-dragging",
      );
      r.setAttribute("draggable", "false");
    });
    if (dragGhost && dragGhost.parentNode) dragGhost.remove();
    draggedIndex = null;
  });
}
setupReorderableList(
  $("#linkList"),
  () => state.links,
  (items) => {
    state.links = items;
  },
  () => {
    renderLinks();
    queueSave();
  },
  false,
);
setupReorderableList(
  $("#socialList"),
  () => state.socials,
  (items) => {
    state.socials = items;
  },
  () => {
    renderSocials();
    queueSave();
  },
  true,
);
window.addEventListener("pointerup", () => {
  document
    .querySelectorAll('.link-row[draggable="true"]')
    .forEach((r) => r.setAttribute("draggable", "false"));
});
$("#pageSwitcher").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-page-index]");
  if (!tab) return;
  saveCurrentPage();
  currentPageIndex = Number(tab.dataset.pageIndex);
  applyPage(pages[currentPageIndex]);
});
document.addEventListener("click", (event) => {
  const focus = event.target.dataset.focus;
  if (!focus) return;
  const target = focus.startsWith("link-") ? $("#links") : $(`#${focus}`);
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
    setTimeout(() => target.focus(), 300);
});
document.querySelectorAll("[data-section]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-section]")
      .forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $(`#${button.dataset.section}`).scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }),
);
function updatePreviewZoom() {
  const previewArea = document.getElementById("previewArea");
  const device = document.querySelector(".device");
  if (!previewArea || !device) return;
  if (window.innerWidth <= 900) {
    previewArea.style.removeProperty("--preview-zoom");
    return;
  }
  const previewTop = previewArea.querySelector(".preview-top");
  const topHeight =
    previewTop && previewTop.offsetHeight ? previewTop.offsetHeight + 14 : 0;
  const paddingV = 40;
  const availHeight = previewArea.clientHeight - topHeight - paddingV;
  if (availHeight <= 0) return;
  const baseHeight = 868;
  const zoom = Math.max(0.4, Math.min(0.85, availHeight / baseHeight));
  previewArea.style.setProperty("--preview-zoom", zoom.toFixed(2));
}
window.addEventListener("resize", updatePreviewZoom);
if (window.ResizeObserver) {
  const resizeObserver = new ResizeObserver(() => updatePreviewZoom());
  const previewAreaEl = document.getElementById("previewArea");
  if (previewAreaEl) resizeObserver.observe(previewAreaEl);
}
document.querySelectorAll("[data-view]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-view]")
      .forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const isPreview = button.dataset.view === "preview";
    $("#previewArea").classList.toggle("show", isPreview);
    if (isPreview) updatePreviewZoom();
  }),
);
function openShare() {
  updateShareLinks();
  $("#shareModal").classList.add("open");
  $("#shareModal").setAttribute("aria-hidden", "false");
}
$(".share").addEventListener("click", openShare);
$("#publicShare").addEventListener("click", openShare);
$("#shareClose").addEventListener("click", () => {
  $("#shareModal").classList.remove("open");
  $("#shareModal").setAttribute("aria-hidden", "true");
});
$("#copyLink").addEventListener("click", async () => {
  await navigator.clipboard.writeText(publicUrl());
  $("#copyLink span").textContent = "Copied";
  setTimeout(() => {
    $("#copyLink span").textContent = "Copy";
  }, 1600);
});
$("#shareModal").addEventListener("click", (event) => {
  if (event.target === $("#shareModal")) $("#shareClose").click();
});
async function restoreSession() {
  if (!supabaseClient) {
    if (document.documentElement.classList.contains("has-session")) {
      openLanding();
    }
    return;
  }
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();
  if (error || !session?.user) {
    if (error) console.error("Could not restore session:", error);
    if (document.documentElement.classList.contains("has-session")) {
      openLanding();
    }
    return;
  }
  try {
    await loadProfile(session.user);
    openEditor();
  } catch (restoreError) {
    console.error("Could not restore profile:", restoreError);
    openEditor();
  }
}
function publicUsernameFromPath() {
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  return /^[a-z0-9_]{3,30}$/.test(path) ? path : null;
}
function normalizeExternalUrl(value) {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
function socialUrl(social) {
  const handle = (social.handle || "").trim().replace(/^@/, "");
  if (!handle) return null;
  if (social.service === "email") return `mailto:${handle}`;
  if (social.service === "phone") return `tel:${handle}`;
  if (social.service === "website") return normalizeExternalUrl(handle);
  return normalizeExternalUrl(`https://${social.service}.com/${handle}`);
}
function renderPublicProfile(profile) {
  const settings = profile.settings || {};
  const page =
    Array.isArray(settings.pages) && settings.pages.length
      ? settings.pages[0]
      : {
          displayName: profile.display_name,
          username: `@${profile.username}`,
          bio: profile.bio,
          location: profile.location,
          settings,
        };
  const pageSettings = page.settings || settings;
  const background = pageSettings.background || "#e6f1dc";
  const font = pageSettings.font || "DM Sans";
  const template = pageSettings.template || "classic";
  const radius = pageSettings.radius ?? 8;
  const linkStyle = pageSettings.linkStyle || {
    color: "#ffffff",
    align: "center",
    iconPosition: "left",
    iconTreatment: "plain",
  };
  const align = linkStyle.align || "center";
  const iconPosition = linkStyle.iconPosition || "left";
  const linkColor = linkStyle.color || "#ffffff";
  const isDarkLink = linkColor === "#172219";

  const links = Array.isArray(pageSettings.links)
    ? pageSettings.links.filter((link) => link.enabled)
    : [];
  const socials = Array.isArray(pageSettings.socials)
    ? pageSettings.socials.filter((social) => social.enabled)
    : [];
  const content = document.createElement("main");
  content.className = `public-profile ${template === "classic" ? "" : "template-" + template}`;
  content.style.background = background;
  content.style.fontFamily = `'${font}', sans-serif`;
  const inner = document.createElement("div");
  inner.className = "public-profile-inner";
  if (pageSettings.profileImage) {
    const avatar = document.createElement("div");
    avatar.className = "public-profile-avatar";
    avatar.style.backgroundImage = `url('${pageSettings.profileImage}')`;
    inner.append(avatar);
  }
  const name = document.createElement("h1");
  name.textContent =
    page.displayName || profile.display_name || profile.username;
  inner.append(name);
  const handle = document.createElement("p");
  handle.className = "public-profile-handle";
  handle.textContent = `@${(page.username || profile.username).replace(/^@/, "")}`;
  inner.append(handle);
  if (page.bio || profile.bio) {
    const bio = document.createElement("p");
    bio.className = "public-profile-bio";
    bio.textContent = page.bio || profile.bio;
    inner.append(bio);
  }
  if (page.location || profile.location) {
    const location = document.createElement("p");
    location.className = "public-profile-location";
    location.textContent = page.location || profile.location;
    inner.append(location);
  }
  const linkList = document.createElement("div");
  linkList.className = "public-profile-links";
  links.forEach((link) => {
    const href = normalizeExternalUrl(link.url || "");
    if (!href) return;
    const anchor = document.createElement("a");
    anchor.className = `public-profile-link content-${align}`;
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.style.borderRadius = `${radius}px`;
    anchor.style.background = linkColor;
    if (isDarkLink) {
      anchor.style.color = "#fff";
      anchor.style.borderColor = "rgba(255, 255, 255, 0.14)";
    }

    const iconHtml = getIcon(link, linkStyle);
    const titleSpan = document.createElement("span");
    titleSpan.textContent = link.title || href;

    if (iconPosition === "right") {
      anchor.innerHTML = `${titleSpan.outerHTML}${iconHtml}`;
    } else {
      anchor.innerHTML = `${iconHtml}${titleSpan.outerHTML}`;
    }

    linkList.append(anchor);
  });
  inner.append(linkList);
  if (socials.length) {
    const socialList = document.createElement("div");
    socialList.className = "public-profile-socials";
    socials.forEach((social) => {
      const href = socialUrl(social);
      if (!href || !services[social.service]) return;
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.title = social.service;
      anchor.innerHTML = `<i class="${services[social.service]}"></i>`;
      socialList.append(anchor);
    });
    inner.append(socialList);
  }
  const footer = document.createElement("div");
  footer.className = "public-profile-footer";
  footer.textContent = "bhio";
  inner.append(footer);
  content.append(inner);
  document.body.replaceChildren(content);
  document.title =
    page.pageTitle ||
    profile.page_title ||
    `${page.displayName || profile.username} | Bhio`;
}
async function openPublicProfile(username) {
  document.body.replaceChildren();
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("username,display_name,bio,location,page_title,settings")
    .eq("username", username)
    .eq("visibility", true)
    .maybeSingle();
  if (error || !data) {
    document.body.textContent = "Page not found.";
    return;
  }
  renderPublicProfile(data);
}
const publicUsername = publicUsernameFromPath();
if (publicUsername) openPublicProfile(publicUsername);
else {
  if (document.documentElement.classList.contains("has-session")) {
    openEditor();
  }
  ensureLinkAnalytics();
  if (!restoreDraft()) pages = [{ name: "Page 1", ...capturePage() }];
  renderPageSwitcher();
  renderLinks();
  renderSocials();
  updateShareLinks();
  autoResizeTextarea($("#bio"));
  renderAnalytics();
  checkUsernameAvailability($("#username").value);
  restoreSession();
  updatePreviewZoom();
}
if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) =>
        console.error("Could not register service worker:", error),
      ),
  );
