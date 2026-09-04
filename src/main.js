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
const DEFAULT_TEMPLATE = "classic";
const state = {
  template: DEFAULT_TEMPLATE,
  profileShape: "circle",
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
const $ = (selector) => document.querySelector(selector);
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function isDarkColor(color) {
  if (!color || typeof color !== "string") return false;
  const str = color.trim().toLowerCase();
  if (str.startsWith("rgb")) {
    const match = str.match(/\d+/g);
    if (match && match.length >= 3) {
      const [r, g, b] = match.map(Number);
      return (r * 299 + g * 587 + b * 114) / 1000 < 140;
    }
  }
  let c = str.replace(/^#/, "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}
const MAX_PAGES = 3;
let pages = [];
let currentPageIndex = 0;
const inputMap = {
  displayName: [".phone-name"],
  username: ["#phoneHandle"],
};
function renderPreviewDetails() {
  const headlineEl = $("#phoneHeadline");
  const headlineVal = $("#headline") ? $("#headline").value.trim() : "";
  if (headlineEl) {
    headlineEl.textContent = headlineVal;
    headlineEl.style.display = headlineVal ? "block" : "none";
  }

  const taglineEl = $("#phoneTagline");
  const taglineVal = $("#tagline") ? $("#tagline").value.trim() : "";
  if (taglineEl) {
    if (taglineVal) {
      taglineEl.innerHTML = `<span class="tagline-pill"><i class="fa-solid fa-sparkles"></i> ${escapeHtml(taglineVal)}</span>`;
      taglineEl.style.display = "block";
    } else {
      taglineEl.innerHTML = "";
      taglineEl.style.display = "none";
    }
  }

  const bioEl = $(".phone-bio");
  const bioVal = $("#bio") ? $("#bio").value.trim() : "";
  if (bioEl) {
    bioEl.textContent = bioVal;
    bioEl.style.display = bioVal ? "block" : "none";
  }

  const occVal = $("#occupation") ? $("#occupation").value.trim() : "";
  const locVal = $("#location") ? $("#location").value.trim() : "";
  const occEl = $("#phoneOccupation");
  const locEl = $("#phoneLocation");
  const chipsEl = $("#phoneChips");

  if (occEl) {
    const chipText = occEl.querySelector(".chip-text");
    if (chipText) chipText.textContent = occVal;
    occEl.style.display = occVal ? "inline-flex" : "none";
  }
  if (locEl) {
    const chipText = locEl.querySelector(".chip-text");
    if (chipText) chipText.textContent = locVal;
    locEl.style.display = locVal ? "inline-flex" : "none";
  }
  if (chipsEl) {
    chipsEl.style.display = occVal || locVal ? "flex" : "none";
  }

  const interestsEl = $("#phoneInterests");
  const interestsVal = $("#interests") ? $("#interests").value.trim() : "";
  if (interestsEl) {
    if (interestsVal) {
      const tags = interestsVal
        .split(/[•,|]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      interestsEl.innerHTML = tags
        .map((t) => `<span class="interest-pill">${escapeHtml(t)}</span>`)
        .join("");
      interestsEl.style.display = tags.length ? "flex" : "none";
    } else {
      interestsEl.innerHTML = "";
      interestsEl.style.display = "none";
    }
  }

  const aboutEl = $("#phoneAbout");
  const aboutVal = $("#aboutMe") ? $("#aboutMe").value.trim() : "";
  if (aboutEl) {
    if (aboutVal) {
      const paragraphs = aboutVal
        .split(/\n\s*\n/)
        .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
        .join("");
      aboutEl.innerHTML = `
        <div class="phone-about-card">
          <div class="phone-about-header"><i class="fa-solid fa-address-card"></i><span>About Me</span></div>
          <div class="phone-about-body">${paragraphs}</div>
        </div>`;
      aboutEl.style.display = "block";
    } else {
      aboutEl.innerHTML = "";
      aboutEl.style.display = "none";
    }
  }

  const ctaEl = $("#phoneCta");
  const ctaEnabled = $("#ctaEnabled") ? $("#ctaEnabled").checked : false;
  const ctaTitle = $("#ctaTitle") ? $("#ctaTitle").value.trim() : "";
  const ctaDesc = $("#ctaDesc") ? $("#ctaDesc").value.trim() : "";
  const ctaBtnText = $("#ctaButtonText") ? $("#ctaButtonText").value.trim() : "Send a message";
  const ctaBtnUrl = $("#ctaButtonUrl") ? $("#ctaButtonUrl").value.trim() : "";
  const ctaLinkColor = state.linkStyle?.color || "#ffffff";
  const ctaTextColor = isDarkColor(ctaLinkColor) ? "#ffffff" : "#172219";

  if (ctaEl) {
    if (ctaEnabled && (ctaTitle || ctaDesc)) {
      ctaEl.innerHTML = `
        <div class="phone-cta-card">
          ${ctaTitle ? `<h4 class="phone-cta-title">${escapeHtml(ctaTitle)}</h4>` : ""}
          ${ctaDesc ? `<p class="phone-cta-desc">${escapeHtml(ctaDesc)}</p>` : ""}
          ${ctaBtnUrl ? `<a class="phone-cta-btn" style="background:${ctaLinkColor};color:${ctaTextColor} !important" href="${ctaBtnUrl}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(ctaBtnText || "Send a message")}</span><i class="fa-solid fa-arrow-right"></i></a>` : ""}
        </div>`;
      ctaEl.style.display = "block";
    } else {
      ctaEl.innerHTML = "";
      ctaEl.style.display = "none";
    }
  }
}
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
    if (link.type === "header") return;
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
  const trackableLinks = state.links.filter((link) => link.type !== "header");
  if (!trackableLinks.length) {
    list.innerHTML =
      '<div class="analytics-empty">Add a link to start tracking clicks.</div>';
    return;
  }
  list.innerHTML = "";
  trackableLinks.forEach((link) => {
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
    displayName: $("#displayName") ? $("#displayName").value : "",
    username: $("#username") ? $("#username").value : "",
    headline: $("#headline") ? $("#headline").value : "",
    occupation: $("#occupation") ? $("#occupation").value : "",
    tagline: $("#tagline") ? $("#tagline").value : "",
    bio: $("#bio") ? $("#bio").value : "",
    aboutMe: $("#aboutMe") ? $("#aboutMe").value : "",
    interests: $("#interests") ? $("#interests").value : "",
    location: $("#location") ? $("#location").value : "",
    pageTitle: $("#pageTitle") ? $("#pageTitle").value : "",
    visibility: $("#visibility") ? $("#visibility").checked : true,
    ctaEnabled: $("#ctaEnabled") ? $("#ctaEnabled").checked : true,
    ctaTitle: $("#ctaTitle") ? $("#ctaTitle").value : "Let's Connect",
    ctaDesc: $("#ctaDesc") ? $("#ctaDesc").value : "",
    ctaButtonText: $("#ctaButtonText") ? $("#ctaButtonText").value : "Send a message",
    ctaButtonUrl: $("#ctaButtonUrl") ? $("#ctaButtonUrl").value : "",
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
    state.template = state.template || DEFAULT_TEMPLATE;
    state.profileShape = state.profileShape || "circle";
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
    if ($("#displayName")) $("#displayName").value = page.displayName || "";
    if ($("#username")) $("#username").value = page.username || "";
    if ($("#headline")) $("#headline").value = page.headline || "";
    if ($("#occupation")) $("#occupation").value = page.occupation || "";
    if ($("#tagline")) $("#tagline").value = page.tagline || "";
    if ($("#bio")) $("#bio").value = page.bio || "";
    if ($("#aboutMe")) $("#aboutMe").value = page.aboutMe || "";
    if ($("#interests")) $("#interests").value = page.interests || "";
    if ($("#location")) $("#location").value = page.location || "";
    if ($("#pageTitle")) $("#pageTitle").value = page.pageTitle || "";
    if ($("#avatarShape")) $("#avatarShape").value = state.profileShape;
    if ($("#visibility")) $("#visibility").checked = page.visibility !== false;
    if ($("#ctaEnabled")) $("#ctaEnabled").checked = page.ctaEnabled !== false;
    if ($("#ctaTitle")) $("#ctaTitle").value = page.ctaTitle || "Let's Connect";
    if ($("#ctaDesc")) $("#ctaDesc").value = page.ctaDesc !== undefined ? page.ctaDesc : "Have an idea, business opportunity, or just want to say hello? Send me a message.";
    if ($("#ctaButtonText")) $("#ctaButtonText").value = page.ctaButtonText || "Send a message";
    if ($("#ctaButtonUrl")) $("#ctaButtonUrl").value = page.ctaButtonUrl || "";
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
let currentSessionUserId = null;
const LOCAL_DRAFT_KEY = "bhio-draft";
function setSaveStatus(text) {
  $("#saveStatus").textContent = text;
}
function getActiveUserId() {
  if (currentSessionUserId) return currentSessionUserId;
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY) ||
      localStorage.getItem("solebio-auth");
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const uid = parsed?.user?.id || parsed?.currentSession?.user?.id;
      if (uid) return uid;
    }
  } catch (e) {}
  return null;
}
function getDraftKey(userId) {
  const uid = userId || getActiveUserId();
  return uid ? `bhio-draft-${uid}` : "bhio-draft-guest";
}
function saveDraftLocally() {
  try {
    saveCurrentPage();
    const uid = getActiveUserId();
    const key = getDraftKey(uid);
    const draftData = {
      userId: uid || "guest",
      pages,
      currentPageIndex,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(draftData));
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draftData));
    setSaveStatus("Saved locally");
  } catch (error) {
    console.error("Could not save local draft:", error);
    setSaveStatus("Local save unavailable");
  }
}
function restoreDraft(userId) {
  try {
    const uid = userId || getActiveUserId();
    const key = getDraftKey(uid);
    let rawDraft = localStorage.getItem(key);
    if (!rawDraft) {
      rawDraft =
        localStorage.getItem("bhio-draft-guest") ||
        localStorage.getItem(LOCAL_DRAFT_KEY) ||
        localStorage.getItem("solebio-draft");
    }
    const draft = JSON.parse(rawDraft || "null");
    if (!draft || !Array.isArray(draft.pages) || !draft.pages.length)
      return false;
    if (uid && draft.userId && draft.userId !== "guest" && draft.userId !== uid) {
      return false;
    }
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
function clearAllLocalDrafts(userId) {
  try {
    const uid = userId || getActiveUserId();
    if (uid) {
      localStorage.removeItem(getDraftKey(uid));
    }
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    localStorage.removeItem("solebio-draft");
    localStorage.removeItem("bhio-draft-guest");
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("bhio-draft") || k.startsWith("solebio-draft"))) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    console.error("Error clearing drafts:", e);
  }
}
function resetEditorToCleanDefault(templateName = DEFAULT_TEMPLATE) {
  clearTimeout(saveTimer);
  currentSessionUserId = getActiveUserId();
  pages = [];
  currentPageIndex = 0;

  // Clear in-memory state
  Object.keys(state).forEach((key) => delete state[key]);
  const preset = TEMPLATE_PRESETS[templateName] || TEMPLATE_PRESETS[DEFAULT_TEMPLATE];
  Object.assign(state, {
    template: preset.template,
    profileShape: preset.profileShape || "circle",
    font: preset.font || "DM Sans",
    background: preset.background || "#e6f1dc",
    radius: Number.isFinite(preset.radius) ? preset.radius : 8,
    profileImage: "",
    linkStyle: {
      color: "#ffffff",
      align: "center",
      iconPosition: "left",
      iconTreatment: "plain",
      ...(preset.linkStyle || {}),
    },
    links: [],
    socials: [],
  });

  const inputIds = [
    "displayName",
    "username",
    "headline",
    "occupation",
    "tagline",
    "bio",
    "aboutMe",
    "interests",
    "location",
    "pageTitle",
    "ctaDesc",
    "ctaButtonUrl",
  ];
  inputIds.forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.value = "";
  });

  if ($("#avatarShape")) $("#avatarShape").value = "circle";
  if ($("#ctaTitle")) $("#ctaTitle").value = "Let's Connect";
  if ($("#ctaButtonText")) $("#ctaButtonText").value = "Send a message";
  if ($("#ctaEnabled")) $("#ctaEnabled").checked = true;
  if ($("#visibility")) $("#visibility").checked = true;

  if ($("#editorAvatar")) {
    $("#editorAvatar").style.backgroundImage = "";
    $("#editorAvatar").dataset.shape = "circle";
  }
  if ($(".phone-avatar")) {
    $(".phone-avatar").style.backgroundImage = "";
    $(".phone-avatar").dataset.shape = "circle";
  }
  if ($("#previewUrl")) $("#previewUrl").textContent = "bhio.link";
  if ($("#urlPreview")) $("#urlPreview").textContent = "bhio.link";

  pages = [
    {
      name: "Page 1",
      displayName: "",
      username: "",
      headline: "",
      occupation: "",
      tagline: "",
      bio: "",
      aboutMe: "",
      interests: "",
      location: "",
      pageTitle: "",
      visibility: true,
      ctaEnabled: true,
      ctaTitle: "Let's Connect",
      ctaDesc: "",
      ctaButtonText: "Send a message",
      ctaButtonUrl: "",
      settings: JSON.parse(JSON.stringify(state)),
    },
  ];
  applyPage(pages[0]);
}
function addPage() {
  if (pages.length >= MAX_PAGES) return;
  saveCurrentPage();
  pages.push({
    name: `Page ${pages.length + 1}`,
    displayName: "",
    username: pages[0]?.username || "",
    headline: "",
    occupation: "",
    tagline: "",
    bio: "",
    aboutMe: "",
    interests: "",
    location: "",
    pageTitle: "",
    visibility: true,
    ctaEnabled: true,
    ctaTitle: "Let's Connect",
    ctaDesc: "",
    ctaButtonText: "Send a message",
    ctaButtonUrl: "",
    settings: {
      template: DEFAULT_TEMPLATE,
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

const TEMPLATE_PRESETS = {
  modern: {
    template: "modern",
    background: "#dfe9ff",
    font: "Space Grotesk",
    radius: 16,
    profileShape: "rounded",
    linkStyle: {
      color: "#172219",
      align: "center",
      iconPosition: "left",
      iconTreatment: "plain",
    },
  },
  minimal: {
    template: "minimal",
    background: "#ffffff",
    font: "DM Sans",
    radius: 0,
    profileShape: "circle",
    linkStyle: {
      color: "#ffffff",
      align: "center",
      iconPosition: "left",
      iconTreatment: "plain",
    },
  },
  retro: {
    template: "retro",
    background: "#f4bd43",
    font: "Playfair Display",
    radius: 0,
    profileShape: "circle",
    linkStyle: {
      color: "#172c53",
      align: "center",
      iconPosition: "left",
      iconTreatment: "plain",
    },
  },
  bold: {
    template: "bold",
    background: "#ee725b",
    font: "Space Grotesk",
    radius: 0,
    profileShape: "square",
    linkStyle: {
      color: "#d9ff6a",
      align: "center",
      iconPosition: "left",
      iconTreatment: "plain",
    },
  },
  classic: {
    template: "classic",
    background: "#e6f1dc",
    font: "DM Sans",
    radius: 8,
    profileShape: "circle",
    linkStyle: {
      color: "#ffffff",
      align: "center",
      iconPosition: "left",
      iconTreatment: "plain",
    },
  },
};

function applyTemplatePreset(templateName) {
  console.log('[applyTemplatePreset] Applying:', templateName);
  const preset = TEMPLATE_PRESETS[templateName];
  if (!preset) return;
  state.template = preset.template;
  state.background = preset.background;
  state.font = preset.font;
  state.radius = preset.radius;
  state.profileShape = preset.profileShape || "circle";
  if (preset.linkStyle) {
    state.linkStyle = { ...(state.linkStyle || {}), ...preset.linkStyle };
  }
  const avatarShapeEl = $("#avatarShape");
  if (avatarShapeEl) avatarShapeEl.value = state.profileShape;
  if (typeof syncAll === "function") {
    syncAll();
  } else {
    renderPreviewDetails();
  }
}

function openEditor() {
  document.documentElement.classList.add("has-session");
  $("#landing").hidden = true;
  $("#authScreen").classList.remove("open");
  $(".app").classList.add("editor-open");

  const pending = sessionStorage.getItem("bhio_pending_template");
  console.log('[openEditor] Found pending template:', pending);
  if (pending && TEMPLATE_PRESETS[pending]) {
    applyTemplatePreset(pending);
    sessionStorage.removeItem("bhio_pending_template");
    saveCurrentPage();
    queueSave();
  }

  requestAnimationFrame(updatePreviewZoom);
}
window.openEditor = openEditor;
window.applyTemplatePreset = applyTemplatePreset;
window.state = state;
window.getPages = () => pages;
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

let landingUsernameCheckTimer;
async function checkLandingUsernameAvailability(rawVal) {
  const clean = (rawVal || "").trim().replace(/^@/, "").toLowerCase();
  const statusEl = $("#landingUsernameStatus");
  const ctaEl = $(".username-cta");
  if (!statusEl) return;

  if (!clean) {
    statusEl.className = "landing-username-status";
    statusEl.innerHTML = "";
    if (ctaEl) ctaEl.classList.remove("is-available", "is-taken", "is-invalid", "is-checking");
    return;
  }

  if (clean.length < 3) {
    statusEl.className = "landing-username-status invalid show";
    statusEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Must be at least 3 characters';
    if (ctaEl) {
      ctaEl.classList.remove("is-available", "is-taken", "is-checking");
      ctaEl.classList.add("is-invalid");
    }
    return;
  }

  if (!/^[a-z0-9_]{3,30}$/.test(clean)) {
    statusEl.className = "landing-username-status invalid show";
    statusEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Only letters, numbers, and underscores';
    if (ctaEl) {
      ctaEl.classList.remove("is-available", "is-taken", "is-checking");
      ctaEl.classList.add("is-invalid");
    }
    return;
  }

  statusEl.className = "landing-username-status checking show";
  statusEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Checking availability...';
  if (ctaEl) {
    ctaEl.classList.remove("is-available", "is-taken", "is-invalid");
    ctaEl.classList.add("is-checking");
  }

  if (!supabaseClient) {
    statusEl.className = "landing-username-status available show";
    statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> bhio.link/${clean} is available`;
    if (ctaEl) {
      ctaEl.classList.remove("is-taken", "is-invalid", "is-checking");
      ctaEl.classList.add("is-available");
    }
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

    const currentInput = ($("#landingUsername")?.value || "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();
    if (currentInput !== clean) return;

    if (error) {
      console.warn("Could not verify landing username:", error);
      statusEl.className = "landing-username-status";
      statusEl.innerHTML = "";
      if (ctaEl) ctaEl.classList.remove("is-available", "is-taken", "is-invalid", "is-checking");
      return;
    }

    const isOwnedByMe =
      data && data.length > 0 && currentUserId && data[0].id === currentUserId;
    const isAvailable = !data || data.length === 0 || isOwnedByMe;

    if (isAvailable) {
      statusEl.className = "landing-username-status available show";
      statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> bhio.link/${clean} is available`;
      if (ctaEl) {
        ctaEl.classList.remove("is-taken", "is-invalid", "is-checking");
        ctaEl.classList.add("is-available");
      }
    } else {
      statusEl.className = "landing-username-status taken show";
      statusEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> bhio.link/${clean} is already taken`;
      if (ctaEl) {
        ctaEl.classList.remove("is-available", "is-invalid", "is-checking");
        ctaEl.classList.add("is-taken");
      }
    }
  } catch (err) {
    console.error("Landing username check error:", err);
  }
}
window.checkLandingUsernameAvailability = checkLandingUsernameAvailability;

const landingUsernameInput = $("#landingUsername");
if (landingUsernameInput) {
  landingUsernameInput.addEventListener("input", () => {
    clearTimeout(landingUsernameCheckTimer);
    landingUsernameCheckTimer = setTimeout(() => {
      checkLandingUsernameAvailability(landingUsernameInput.value);
    }, 280);
  });
  landingUsernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      $("#landingUsernameStart")?.click();
    }
  });
}

$("#landingUsernameStart").addEventListener("click", () => {
  const input = $("#landingUsername");
  const username = input.value.trim().replace(/^@/, "");
  if (!username) {
    input.focus();
    return;
  }
  const statusEl = $("#landingUsernameStatus");
  if (statusEl && (statusEl.classList.contains("taken") || statusEl.classList.contains("invalid"))) {
    const ctaEl = $(".username-cta");
    if (ctaEl) {
      ctaEl.classList.add("shake-error");
      setTimeout(() => ctaEl.classList.remove("shake-error"), 400);
    }
    input.focus();
    return;
  }
  $("#username").value = `@${username}`;
  $("#username").dispatchEvent(new Event("input"));
  openAuth("signup");
});

// Landing page templates showcase interactions
const showcaseTabs = $("#showcaseTabs");
const showcaseCards = document.querySelectorAll(".showcase-card");

if (showcaseTabs) {
  showcaseTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".showcase-tab");
    if (!tab) return;
    showcaseTabs.querySelectorAll(".showcase-tab").forEach((btn) => btn.classList.remove("active"));
    tab.classList.add("active");

    const filter = tab.dataset.filter;
    showcaseCards.forEach((card) => {
      if (filter === "all") {
        card.classList.remove("dimmed", "highlighted");
      } else if (card.dataset.template === filter) {
        card.classList.remove("dimmed");
        card.classList.add("highlighted");
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        card.classList.add("dimmed");
        card.classList.remove("highlighted");
      }
    });
  });
}

document.querySelectorAll(".showcase-select-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const templateName = btn.dataset.template;
    if (templateName && TEMPLATE_PRESETS[templateName]) {
      try {
        sessionStorage.setItem("bhio_pending_template", templateName);
      } catch (err) {
        console.error("Could not save pending template:", err);
      }
      applyTemplatePreset(templateName);
    }
    if (document.documentElement.classList.contains("has-session")) {
      openEditor();
      return;
    }
    const input = $("#landingUsername");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 400);
    }
  });
});

const showcaseClaimBtn = $("#showcaseClaimBtn");
if (showcaseClaimBtn) {
  showcaseClaimBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const input = $("#landingUsername");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 400);
    }
  });
}

const footerClaimBtn = $(".footer-claim");
if (footerClaimBtn) {
  footerClaimBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const input = $("#landingUsername");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 400);
    }
  });
}

// ==========================================================================
// LANDING HERO 3D PARALLAX & TILT INTERACTION
// ==========================================================================
function initLandingHero3DParallax() {
  const heroArt = $("#heroArt");
  const heroTilt = $("#heroMockupTilt");
  const heroGlare = $("#heroScreenGlare");
  if (!heroArt || !heroTilt) return;

  // Respect users who prefer reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let bounds = null;
  let targetPitch = 0; // rotateX
  let targetYaw = 0;   // rotateY
  let currentPitch = 0;
  let currentYaw = 0;
  let isHovered = false;
  let rafId = null;

  function updateBounds() {
    bounds = heroArt.getBoundingClientRect();
  }

  function render() {
    const lerp = 0.085;
    currentPitch += (targetPitch - currentPitch) * lerp;
    currentYaw += (targetYaw - currentYaw) * lerp;

    const pitchStr = currentPitch.toFixed(2);
    const yawStr = currentYaw.toFixed(2);

    heroTilt.style.transform = `perspective(1000px) rotateX(${pitchStr}deg) rotateY(${yawStr}deg) scale3d(1.025, 1.025, 1.025)`;

    if (heroGlare) {
      // Modulate glare reflection based on tilt angle
      const glareFactor = 0.55 + (currentYaw / 16) * 0.35 - (currentPitch / 14) * 0.2;
      const clampedGlare = Math.max(0.15, Math.min(0.9, glareFactor));
      heroGlare.style.opacity = clampedGlare.toFixed(2);
    }

    const diff = Math.abs(targetPitch - currentPitch) + Math.abs(targetYaw - currentYaw);
    if (isHovered || diff > 0.02) {
      rafId = requestAnimationFrame(render);
    } else {
      currentPitch = 0;
      currentYaw = 0;
      heroTilt.style.transform = "";
      if (heroGlare) heroGlare.style.opacity = "";
      rafId = null;
    }
  }

  function ensureLoop() {
    if (!rafId) {
      rafId = requestAnimationFrame(render);
    }
  }

  heroArt.addEventListener("mouseenter", () => {
    isHovered = true;
    updateBounds();
    ensureLoop();
  });

  heroArt.addEventListener("mousemove", (e) => {
    if (!bounds) updateBounds();
    const nx = (e.clientX - bounds.left) / bounds.width - 0.5;  // -0.5 to 0.5
    const ny = (e.clientY - bounds.top) / bounds.height - 0.5;  // -0.5 to 0.5

    const maxPitch = 11; // Up/down tilt
    const maxYaw = 14;   // Left/right tilt

    targetPitch = -ny * maxPitch;
    targetYaw = nx * maxYaw;

    ensureLoop();
  });

  heroArt.addEventListener("mouseleave", () => {
    isHovered = false;
    targetPitch = 0;
    targetYaw = 0;
    ensureLoop();
  });

  window.addEventListener("resize", () => {
    if (isHovered) updateBounds();
  }, { passive: true });
}

initLandingHero3DParallax();

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
  clearTimeout(saveTimer);
  clearAllLocalDrafts();
  resetEditorToCleanDefault();
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
  clearAllLocalDrafts();
  resetEditorToCleanDefault();
  closeDeleteModal();
  openLanding();
  alert("Your account has been deleted.");
});
async function loadProfile(user) {
  currentSessionUserId = user.id;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  const rawUsername = (data?.username || user.user_metadata?.username || "").toLowerCase();
  const isJasonAccount = rawUsername === "jasonpedere" || rawUsername === "jason";

  // Check local draft timestamp vs server updated_at
  const localKey = getDraftKey(user.id);
  let localDraft = null;
  try {
    const raw =
      localStorage.getItem(localKey) ||
      localStorage.getItem(LOCAL_DRAFT_KEY) ||
      localStorage.getItem("solebio-draft");
    localDraft = JSON.parse(raw || "null");
  } catch (e) {}

  const localTimestamp = Number(localDraft?.timestamp) || 0;
  const serverTimestamp = data?.updated_at ? new Date(data.updated_at).getTime() : 0;
  const hasValidLocalPages =
    localDraft &&
    Array.isArray(localDraft.pages) &&
    localDraft.pages.length > 0;

  // Detect accidental cross-account leak
  const firstLocalPage = hasValidLocalPages ? localDraft.pages[0] : null;
  const isLocalLeaked =
    !isJasonAccount &&
    firstLocalPage &&
    (firstLocalPage.displayName === "Jason Pedere" ||
      firstLocalPage.headline?.includes("JDS Delivery") ||
      firstLocalPage.bio?.includes("JDS Delivery") ||
      firstLocalPage.settings?.links?.some((l) => l.title?.includes("JDS Delivery")));

  // If local draft is newer than server record, retain local draft and queue sync to Supabase
  if (hasValidLocalPages && !isLocalLeaked && localTimestamp > serverTimestamp) {
    pages = localDraft.pages.slice(0, MAX_PAGES);
    currentPageIndex = Math.min(
      Number(localDraft.currentPageIndex) || 0,
      pages.length - 1,
    );
    applyPage(pages[currentPageIndex]);
    queueSave();
    return;
  }

  const hasSavedPages =
    data &&
    data.settings &&
    Array.isArray(data.settings.pages) &&
    data.settings.pages.length > 0;
  const firstPage = hasSavedPages ? data.settings.pages[0] : null;

  const isLeakedData =
    !isJasonAccount &&
    firstPage &&
    (firstPage.displayName === "Jason Pedere" ||
      firstPage.headline?.includes("JDS Delivery") ||
      firstPage.bio?.includes("JDS Delivery") ||
      firstPage.settings?.links?.some((l) => l.title?.includes("JDS Delivery")));

  const isCompletelyBlank =
    hasSavedPages &&
    !(data.display_name || firstPage?.displayName) &&
    !(data.bio || firstPage?.bio) &&
    !(data.location || firstPage?.location) &&
    (!firstPage?.settings?.links || firstPage.settings.links.length === 0);

  if (hasSavedPages && !isCompletelyBlank && !isLeakedData) {
    pages = data.settings.pages.slice(0, MAX_PAGES);
    if (pages[0]) {
      if (data.display_name && !pages[0].displayName) pages[0].displayName = data.display_name;
      if (data.username && !pages[0].username) pages[0].username = `@${data.username}`;
      if (data.bio && !pages[0].bio) pages[0].bio = data.bio;
      if (data.location && !pages[0].location) pages[0].location = data.location;
      if (data.page_title && !pages[0].pageTitle) pages[0].pageTitle = data.page_title;
      if (data.headline && !pages[0].headline) pages[0].headline = data.headline;
      if (data.occupation && !pages[0].occupation) pages[0].occupation = data.occupation;
      if (data.tagline && !pages[0].tagline) pages[0].tagline = data.tagline;
      if (data.about_me && !pages[0].aboutMe) pages[0].aboutMe = data.about_me;
      if (data.interests && !pages[0].interests) pages[0].interests = data.interests;
      if (data.cta_title && !pages[0].ctaTitle) pages[0].ctaTitle = data.cta_title;
      if (data.cta_desc && !pages[0].ctaDesc) pages[0].ctaDesc = data.cta_desc;
      if (data.cta_button_text && !pages[0].ctaButtonText) pages[0].ctaButtonText = data.cta_button_text;
      if (data.cta_button_url && !pages[0].ctaButtonUrl) pages[0].ctaButtonUrl = data.cta_button_url;
    }
    currentPageIndex = 0;
    applyPage(pages[0]);
    saveDraftLocally();
    return;
  }

  // Fallback: try restoring local draft
  const draftRestored = !isLocalLeaked && restoreDraft(user.id);
  if (!draftRestored) {
    const pendingTemplate = sessionStorage.getItem("bhio_pending_template") || DEFAULT_TEMPLATE;
    const preset = TEMPLATE_PRESETS[pendingTemplate] || TEMPLATE_PRESETS[DEFAULT_TEMPLATE];
    const initialSettings = {
      template: preset.template,
      profileShape: preset.profileShape || "circle",
      font: preset.font || "DM Sans",
      background: preset.background || "#e6f1dc",
      radius: Number.isFinite(preset.radius) ? preset.radius : 8,
      profileImage: isLeakedData ? "" : data?.settings?.profileImage || "",
      linkStyle: {
        color: "#ffffff",
        align: "center",
        iconPosition: "left",
        iconTreatment: "plain",
        ...(preset.linkStyle || {}),
      },
      links: [],
      socials: [],
    };

    const initialUsername = data?.username
      ? `@${data.username}`
      : user.user_metadata?.username
        ? `@${user.user_metadata.username}`
        : "";
    const initialDisplayName =
      (isLeakedData ? "" : data?.display_name) ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "";

    pages = [
      {
        name: "Page 1",
        displayName: initialDisplayName,
        username: initialUsername,
        headline: isLeakedData ? "" : data?.headline || "",
        occupation: isLeakedData ? "" : data?.occupation || "",
        tagline: isLeakedData ? "" : data?.tagline || "",
        bio: isLeakedData ? "" : data?.bio || "",
        aboutMe: isLeakedData ? "" : data?.about_me || "",
        interests: isLeakedData ? "" : data?.interests || "",
        location: isLeakedData ? "" : data?.location || "",
        pageTitle: data?.page_title || "",
        visibility: data?.visibility !== false,
        ctaEnabled: data?.cta_enabled !== false,
        ctaTitle: "Let's Connect",
        ctaDesc: "",
        ctaButtonText: "Send a message",
        ctaButtonUrl: "",
        settings: initialSettings,
      },
    ];

    if (isLeakedData) {
      queueSave();
    }
  }
  currentPageIndex = 0;
  applyPage(pages[0]);
  saveDraftLocally();
}
function syncAll() {
  Object.keys(inputMap).forEach((id) => {
    const input = $(`#${id}`);
    if (input) input.dispatchEvent(new Event("input"));
  });
  renderPreviewDetails();
  const bg = state.profileImage ? `url('${state.profileImage}')` : "";
  $("#editorAvatar").style.backgroundImage = bg;
  $(".phone-avatar").style.backgroundImage = bg;
  const avatarShape = state.profileShape || "circle";
  $("#editorAvatar").dataset.shape = avatarShape;
  $(".phone-avatar").dataset.shape = avatarShape;
  $("#phonePage").className =
    `phone-page ${state.template === "classic" ? "" : "template-" + state.template}`;
  $("#phonePage").style.fontFamily = `'${state.font || "DM Sans"}', sans-serif`;
  $("#phonePage").dataset.align = state.linkStyle.align || "center";
  const currentBg = state.background || "#e6f1dc";
  $("#phonePage").style.background = currentBg;
  const isDarkBg = isDarkColor(currentBg);
  $("#phonePage").classList.toggle("is-dark-theme", isDarkBg);
  $("#phonePage").style.color = isDarkBg ? "#ffffff" : "#172219";
  const deviceEl = $(".device");
  if (deviceEl) deviceEl.style.background = currentBg;
  const previewAreaEl = $("#previewArea");
  if (previewAreaEl) previewAreaEl.style.setProperty("--current-bg", currentBg);
  $("#radius").value = state.radius || 8;
  document
    .querySelectorAll(".swatch[data-bg]")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.bg === state.background),
    );
  document
    .querySelectorAll("#templateGrid .template")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.template === state.template),
    );
  document
    .querySelectorAll(".link-color")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.linkColor === (state.linkStyle.color || "#ffffff")),
    );
  if ($("#linkAlign")) $("#linkAlign").value = state.linkStyle.align || "center";
  if ($("#iconPosition")) $("#iconPosition").value = state.linkStyle.iconPosition || "left";
  if ($("#iconTreatment")) $("#iconTreatment").value = state.linkStyle.iconTreatment || "plain";
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
  try {
    saveCurrentPage();
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      setSaveStatus("Saved locally; log in to sync");
      return;
    }
    const page = pages[currentPageIndex] || pages[0] || capturePage();
    const rawUsername = (page.username || "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();
    const validUsername = /^[a-z0-9_]{3,30}$/.test(rawUsername)
      ? rawUsername
      : user.user_metadata?.username ||
        `user_${user.id.replace(/-/g, "").slice(0, 8)}`;
    const extendedPayload = {
      id: user.id,
      display_name: (page.displayName || "").trim(),
      username: validUsername,
      headline: (page.headline || "").trim(),
      occupation: (page.occupation || "").trim(),
      tagline: (page.tagline || "").trim(),
      bio: (page.bio || "").trim(),
      about_me: (page.aboutMe || "").trim(),
      interests: (page.interests || "").trim(),
      location: (page.location || "").trim(),
      page_title: (page.pageTitle || "").trim(),
      visibility: page.visibility !== false,
      cta_enabled: page.ctaEnabled !== false,
      cta_title: (page.ctaTitle || "").trim(),
      cta_desc: (page.ctaDesc || "").trim(),
      cta_button_text: (page.ctaButtonText || "").trim(),
      cta_button_url: (page.ctaButtonUrl || "").trim(),
      settings: {
        ...(page.settings || state),
        template: state.template || page.settings?.template || DEFAULT_TEMPLATE,
        pages,
      },
      updated_at: new Date().toISOString(),
    };
    let { error } = await supabaseClient.from("profiles").upsert(extendedPayload);
    if (error) {
      const basePayload = {
        id: user.id,
        display_name: (page.displayName || "").trim(),
        username: validUsername,
        bio: (page.bio || "").trim(),
        location: (page.location || "").trim(),
        page_title: (page.pageTitle || "").trim(),
        visibility: page.visibility !== false,
        settings: {
          ...(page.settings || state),
          template: state.template || page.settings?.template || DEFAULT_TEMPLATE,
          pages,
        },
        updated_at: new Date().toISOString(),
      };
      const fallback = await supabaseClient.from("profiles").upsert(basePayload);
      error = fallback.error;
    }
    if (error) throw error;
    setSaveStatus("Saved");
  } catch (error) {
    console.error("Could not save profile:", error);
    setSaveStatus(`Saved locally; sync failed (${error.message || "check connection"})`);
  }
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
function getLinkDomain(url) {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(normalized).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}
function getIcon(link, linkStyle = state.linkStyle) {
  const currentLinkStyle = linkStyle || state.linkStyle || {};
  const treatment = `icon-${currentLinkStyle.iconTreatment || "plain"}`;
  if (link.iconMode === "none") return "";
  if (link.iconMode === "image" && link.customImage) {
    const escapedUrl = link.customImage.replace(/'/g, "\\'");
    return `<i class="link-symbol ${treatment}" style="background-image:url('${escapedUrl}');background-size:cover;background-position:center;color:transparent">IMG</i>`;
  }
  if (link.iconMode !== "image") {
    const domain = getLinkDomain(link.url || "");
    if (domain) {
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
      const fallbackIcon = services[getService(link.url)] || services.website;
      return `<span class="link-symbol favicon-symbol ${treatment}"><img src="${faviconUrl}" alt="" /><i class="favicon-fallback ${fallbackIcon}"></i></span>`;
    }
  }
  return link.iconMode === "image"
    ? `<i class="link-symbol ${treatment} fa-solid fa-image"></i>`
    : `<i class="link-symbol ${treatment} ${services[getService(link.url)] || services.website}"></i>`;
}
document.addEventListener(
  "error",
  (event) => {
    const image = event.target.closest?.(".favicon-symbol img");
    if (image) image.parentElement.classList.add("favicon-failed");
  },
  true,
);
function renderLinks() {
  $("#linkList").innerHTML = state.links
    .map((link, index) => {
      if (link.type === "header") {
        return `<div class="link-row header-row" data-index="${index}"><span class="grip" title="Drag to reorder" aria-label="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span><div class="link-content header-content"><div class="header-badge"><i class="fa-solid fa-heading"></i><span>Section title</span></div><input class="link-title section-title-input" value="${escapeHtml(link.title)}" data-index="${index}" data-key="title" placeholder="e.g. My Recent Work" aria-label="Section title" /></div><input class="toggle" type="checkbox" ${link.enabled ? "checked" : ""} data-index="${index}" data-key="enabled" aria-label="Enable section title" title="${link.enabled ? "Disable section title" : "Enable section title"}"/><button class="icon-btn danger" data-delete="${index}" aria-label="Delete section title" title="Delete section title"><i class="fa-solid fa-xmark"></i></button></div>`;
      }
      return `<div class="link-row" data-index="${index}"><span class="grip" title="Drag to reorder" aria-label="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span><div class="link-content"><input class="link-title" value="${escapeHtml(link.title)}" data-index="${index}" data-key="title" placeholder="New link" aria-label="Link title" /><input class="link-desc" value="${escapeHtml(link.description || "")}" data-index="${index}" data-key="description" placeholder="Subtitle / description (optional)" aria-label="Link description" /><input class="link-url" value="${escapeHtml(link.url)}" data-index="${index}" data-key="url" placeholder="https://" aria-label="Link URL" /></div><input class="toggle" type="checkbox" ${link.enabled ? "checked" : ""} data-index="${index}" data-key="enabled" aria-label="Enable link"/><button class="icon-btn danger" data-delete="${index}" aria-label="Delete link" title="Delete link"><i class="fa-solid fa-xmark"></i></button><div class="link-options"><select data-index="${index}" data-key="iconMode" aria-label="Link icon style"><option value="auto" ${link.iconMode === "auto" ? "selected" : ""}>Auto icon</option><option value="image" ${link.iconMode === "image" ? "selected" : ""}>Custom image</option><option value="none" ${link.iconMode === "none" ? "selected" : ""}>No icon</option></select>${link.iconMode === "image" ? `<button class="mini-action" type="button" data-upload="${index}">${link.customImage ? "Change image" : "Choose image"}</button>` : ""}</div></div>`;
    })
    .join("");
  $("#phoneLinks").innerHTML = state.links
    .map((link, index) => {
      if (link.type === "header") {
        return `<div class="phone-section-title ${link.enabled ? "" : "off"}" data-focus="link-${index}">${escapeHtml(link.title || "")}</div>`;
      }
      const icon = getIcon(link);
      const titleHtml = `<div class="link-title-text">${escapeHtml(link.title)}</div>`;
      const descHtml = link.description
        ? `<div class="link-desc-text">${escapeHtml(link.description)}</div>`
        : "";
      const textBlock = `<div class="link-text-block">${titleHtml}${descHtml}</div>`;
      const content =
        state.linkStyle.iconPosition === "right"
          ? `${textBlock}${icon}`
          : `${icon}${textBlock}`;
      const isDark = isDarkColor(state.linkStyle.color);
      const linkTextColor = isDark ? "#ffffff" : "#172219";
      const linkBorder = isDark
        ? "border-color:rgba(255,255,255,0.14);"
        : "border-color:rgba(0,0,0,0.08);";
      return `<button class="phone-link content-${state.linkStyle.align} ${link.enabled ? "" : "off"}" style="background:${state.linkStyle.color};color:${linkTextColor};${linkBorder}" data-focus="link-${index}">${content}</button>`;
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
  if (fields) {
    fields.forEach((selector) => {
      const el = $(selector);
      if (el) el.textContent = input.value;
    });
  }
  if (input.matches("textarea")) autoResizeTextarea(input);
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
  renderPreviewDetails();
}
Object.keys(inputMap).forEach((id) => {
  const el = $(`#${id}`);
  if (el) el.addEventListener("input", syncInput);
});
[
  "displayName",
  "username",
  "headline",
  "occupation",
  "tagline",
  "bio",
  "aboutMe",
  "interests",
  "location",
  "pageTitle",
  "ctaTitle",
  "ctaDesc",
  "ctaButtonText",
  "ctaButtonUrl",
].forEach((id) => {
  const el = $(`#${id}`);
  if (el) {
    el.addEventListener("input", syncInput);
    el.addEventListener("input", queueSave);
  }
});
if ($("#ctaEnabled")) {
  $("#ctaEnabled").addEventListener("change", () => {
    renderPreviewDetails();
    queueSave();
  });
}
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
  const templateName = template.dataset.template;
  if (templateName && TEMPLATE_PRESETS[templateName]) {
    applyTemplatePreset(templateName);
  } else {
    state.template = templateName;
    document
      .querySelectorAll(".template")
      .forEach((item) => item.classList.toggle("active", item === template));
    $("#phonePage").className =
      `phone-page ${state.template === "classic" ? "" : "template-" + state.template}`;
  }
  saveCurrentPage();
  saveDraftLocally();
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
$("#avatarShape").addEventListener("change", (event) => {
  state.profileShape = event.target.value;
  syncAll();
  queueSave();
});
$("#radius").addEventListener("input", (event) => {
  state.radius = Number(event.target.value);
  document
    .querySelectorAll(".phone-link")
    .forEach((link) => (link.style.borderRadius = `${event.target.value}px`));
  renderPreviewDetails();
  queueSave();
});
document.querySelectorAll(".link-color").forEach((button) =>
  button.addEventListener("click", () => {
    state.linkStyle.color = button.dataset.linkColor;
    document
      .querySelectorAll(".link-color")
      .forEach((item) => item.classList.toggle("active", item === button));
    renderLinks();
    renderPreviewDetails();
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
    const deviceEl = $(".device");
    if (deviceEl) deviceEl.style.background = state.background;
    const previewAreaEl = $("#previewArea");
    if (previewAreaEl) previewAreaEl.style.setProperty("--current-bg", state.background);
    queueSave();
  }),
);
$("#linkList").addEventListener("input", (event) => {
  const { index, key } = event.target.dataset;
  if (index === undefined) return;
  state.links[index][key] = event.target.value;
  if (state.links[index]?.type === "header") {
    if (key === "title") {
      const sectionEl = document.querySelector(
        `#phoneLinks .phone-section-title[data-focus="link-${index}"]`,
      );
      if (sectionEl) {
        sectionEl.textContent = event.target.value;
      } else {
        renderLinks();
      }
    }
  } else if (key === "title" || key === "description") {
    const card = document.querySelector(
      `#phoneLinks .phone-link[data-focus="link-${index}"]`,
    );
    if (card) {
      const titleSpan = card.querySelector(".link-title-text");
      const descSpan = card.querySelector(".link-desc-text");
      if (key === "title" && titleSpan) titleSpan.textContent = event.target.value;
      if (key === "description") {
        if (descSpan) {
          descSpan.textContent = event.target.value;
          descSpan.style.display = event.target.value ? "block" : "none";
        } else {
          renderLinks();
        }
      }
    } else {
      renderLinks();
    }
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
    title: "",
    url: "",
    enabled: true,
    iconMode: "auto",
  });
  renderLinks();
  queueSave();
  document.querySelector("#linkList .link-row:last-child .link-title").focus();
});
$("#addSectionTitle")?.addEventListener("click", () => {
  state.links.push({
    type: "header",
    title: "",
    enabled: true,
  });
  renderLinks();
  queueSave();
  const input = document.querySelector(
    "#linkList .link-row:last-child .section-title-input",
  );
  if (input) input.focus();
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
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(draggedIndex));
    if (event.dataTransfer.setDragImage) {
      event.dataTransfer.setDragImage(row, event.offsetX, event.offsetY);
    }
    row.classList.add("is-dragging");
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
  if (focus.startsWith("link-")) {
    const idx = focus.replace("link-", "");
    const rowInput = document.querySelector(
      `#linkList .link-row[data-index="${idx}"] input[data-key="title"]`,
    );
    if (rowInput) setTimeout(() => rowInput.focus(), 300);
  } else if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    setTimeout(() => target.focus(), 300);
  }
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
    if (isPreview) {
      updatePreviewZoom();
      const currentBg = state.background || "#e6f1dc";
      const deviceEl = $(".device");
      if (deviceEl) deviceEl.style.background = currentBg;
      const previewAreaEl = $("#previewArea");
      if (previewAreaEl) previewAreaEl.style.setProperty("--current-bg", currentBg);
    }
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
function openPublicShareModal(pageUrl, pageTitle) {
  let modal = document.getElementById("publicShareModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "share-modal";
    modal.id = "publicShareModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    document.body.append(modal);
  }
  const cleanDisplayUrl = pageUrl.replace(/^https?:\/\//, "");
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(pageTitle);

  modal.innerHTML = `
    <div class="share-dialog">
      <button class="share-close" aria-label="Close share dialog">&times;</button>
      <h2>Share this page</h2>
      <p>Let people find this page anywhere.</p>
      <img class="share-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=312x312&data=${encodedUrl}" alt="QR code" />
      <span class="share-url">${escapeHtml(cleanDisplayUrl)}</span>
      <div class="share-actions">
        <button class="share-action public-copy-btn" type="button">
          <i class="fa-solid fa-link"></i><span>Copy</span>
        </button>
        <a class="share-action" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-facebook"></i><span>Facebook</span>
        </a>
        <a class="share-action" href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-x-twitter"></i><span>X</span>
        </a>
        <a class="share-action" href="https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span>
        </a>
        <a class="share-action" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-linkedin"></i><span>LinkedIn</span>
        </a>
        <a class="share-action" href="https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-telegram"></i><span>Telegram</span>
        </a>
      </div>
    </div>
  `;

  modal.classList.add("open");

  const closeBtn = modal.querySelector(".share-close");
  closeBtn?.addEventListener("click", () => modal.classList.remove("open"));

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("open");
  };

  const copyBtn = modal.querySelector(".public-copy-btn");
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      const span = copyBtn.querySelector("span");
      const icon = copyBtn.querySelector("i");
      if (span) span.textContent = "Copied!";
      if (icon) icon.className = "fa-solid fa-check";
      setTimeout(() => {
        if (span) span.textContent = "Copy";
        if (icon) icon.className = "fa-solid fa-link";
      }, 1600);
    } catch (e) {
      prompt("Copy link:", pageUrl);
    }
  });

  const onKeydown = (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      modal.classList.remove("open");
      document.removeEventListener("keydown", onKeydown);
    }
  };
  document.addEventListener("keydown", onKeydown);
}
window.renderPublicProfile = renderPublicProfile;
function renderPublicProfile(profile) {
  const settings = profile.settings || {};
  const page =
    Array.isArray(settings.pages) && settings.pages.length
      ? settings.pages[0]
      : {
          displayName: profile.display_name,
          username: `@${profile.username}`,
          headline: profile.headline || "",
          occupation: profile.occupation || "",
          tagline: profile.tagline || "",
          bio: profile.bio || "",
          aboutMe: profile.about_me || "",
          interests: profile.interests || "",
          location: profile.location || "",
          ctaEnabled: profile.cta_enabled !== false,
          ctaTitle: profile.cta_title || "Let's Connect",
          ctaDesc: profile.cta_desc || "",
          ctaButtonText: profile.cta_button_text || "Send a message",
          ctaButtonUrl: profile.cta_button_url || "",
          settings,
        };
  if (!page.headline && profile.headline) page.headline = profile.headline;
  if (!page.occupation && profile.occupation) page.occupation = profile.occupation;
  if (!page.tagline && profile.tagline) page.tagline = profile.tagline;
  if (!page.aboutMe && profile.about_me) page.aboutMe = profile.about_me;
  if (!page.interests && profile.interests) page.interests = profile.interests;
  if (!page.ctaTitle && profile.cta_title) page.ctaTitle = profile.cta_title;
  if (!page.ctaDesc && profile.cta_desc) page.ctaDesc = profile.cta_desc;
  if (!page.ctaButtonText && profile.cta_button_text) page.ctaButtonText = profile.cta_button_text;
  if (!page.ctaButtonUrl && profile.cta_button_url) page.ctaButtonUrl = profile.cta_button_url;
  const pageSettings =
    page.settings && typeof page.settings === "object"
      ? page.settings
      : settings;
  const template =
    page.template ||
    pageSettings.template ||
    settings.template ||
    profile.template ||
    "classic";
  const preset = TEMPLATE_PRESETS[template] || TEMPLATE_PRESETS.classic || {};
  const background =
    pageSettings.background || settings.background || preset.background || "#e6f1dc";
  const font = pageSettings.font || settings.font || preset.font || "DM Sans";
  const radius =
    pageSettings.radius !== undefined && pageSettings.radius !== null
      ? pageSettings.radius
      : (settings.radius !== undefined && settings.radius !== null ? settings.radius : (preset.radius ?? 8));
  const linkStyle = pageSettings.linkStyle || settings.linkStyle || preset.linkStyle || {
    color: "#ffffff",
    align: "center",
    iconPosition: "left",
    iconTreatment: "plain",
  };
  const align = linkStyle.align || "center";
  const iconPosition = linkStyle.iconPosition || "left";
  const linkColor = linkStyle.color || preset.linkStyle?.color || "#ffffff";
  const isDarkLink = isDarkColor(linkColor);
  const isDarkBg = isDarkColor(background);

  const savedLinks = Array.isArray(pageSettings.links)
    ? pageSettings.links
    : Array.isArray(page.links)
      ? page.links
      : [];
  const links = savedLinks
    .filter((link) => link.enabled !== false);
  const socials = Array.isArray(pageSettings.socials)
    ? pageSettings.socials.filter((social) => social.enabled)
    : [];
  const content = document.createElement("main");
  content.className = `public-profile template-${template}`;
  content.classList.toggle("is-dark-theme", isDarkBg);
  content.style.background = background;
  content.style.color = isDarkBg ? "#ffffff" : "#172219";
  document.documentElement.style.background = background;
  document.body.style.background = background;
  content.style.fontFamily = `'${font}', sans-serif`;
  content.style.setProperty("--public-link-color", linkColor);
  const inner = document.createElement("div");
  inner.className = "public-profile-inner";

  const shareBtn = document.createElement("button");
  shareBtn.className = "public-share";
  shareBtn.setAttribute("aria-label", "Share this page");
  shareBtn.setAttribute("title", "Share this page");
  shareBtn.innerHTML = '<i class="fa-solid fa-arrow-up-from-bracket"></i>';
  shareBtn.addEventListener("click", async () => {
    const pageUrl = window.location.href;
    const pageTitle =
      page.pageTitle ||
      profile.page_title ||
      `${page.displayName || profile.display_name || profile.username} | Bhio`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle,
          url: pageUrl,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    openPublicShareModal(pageUrl, pageTitle);
  });
  inner.append(shareBtn);

  if (pageSettings.profileImage) {
    const avatar = document.createElement("div");
    avatar.className = "public-profile-avatar";
    avatar.dataset.shape = pageSettings.profileShape || preset.profileShape || "circle";
    avatar.style.backgroundImage = `url('${pageSettings.profileImage}')`;
    inner.append(avatar);
  }
  const name = document.createElement("h1");
  name.className = "public-profile-name";
  name.textContent =
    page.displayName || profile.display_name || profile.username;
  inner.append(name);
  const handle = document.createElement("p");
  handle.className = "public-profile-handle";
  handle.textContent = `@${(page.username || profile.username).replace(/^@/, "")}`;
  inner.append(handle);

  if (page.headline) {
    const headline = document.createElement("div");
    headline.className = "public-profile-headline";
    headline.textContent = page.headline;
    inner.append(headline);
  }

  if (page.tagline) {
    const tagline = document.createElement("div");
    tagline.className = "public-profile-tagline";
    tagline.innerHTML = `<span class="tagline-pill"><i class="fa-solid fa-sparkles"></i> ${escapeHtml(page.tagline)}</span>`;
    inner.append(tagline);
  }

  if (page.bio || profile.bio) {
    const bio = document.createElement("p");
    bio.className = "public-profile-bio";
    bio.textContent = page.bio || profile.bio;
    inner.append(bio);
  }

  const hasOcc = Boolean(page.occupation);
  const hasLoc = Boolean(page.location || profile.location);
  if (hasOcc || hasLoc) {
    const chips = document.createElement("div");
    chips.className = "public-profile-chips";
    if (hasOcc) {
      const occChip = document.createElement("span");
      occChip.className = "public-profile-chip";
      occChip.innerHTML = `<i class="fa-solid fa-briefcase"></i><span>${escapeHtml(page.occupation)}</span>`;
      chips.append(occChip);
    }
    if (hasLoc) {
      const locChip = document.createElement("span");
      locChip.className = "public-profile-chip";
      locChip.innerHTML = `<i class="fa-solid fa-location-dot"></i><span>${escapeHtml(page.location || profile.location)}</span>`;
      chips.append(locChip);
    }
    inner.append(chips);
  }

  if (page.interests) {
    const tags = page.interests
      .split(/[•,|]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length) {
      const interests = document.createElement("div");
      interests.className = "public-profile-interests";
      tags.forEach((tag) => {
        const span = document.createElement("span");
        span.className = "interest-pill";
        span.textContent = tag;
        interests.append(span);
      });
      inner.append(interests);
    }
  }

  if (page.aboutMe) {
    const about = document.createElement("div");
    about.className = "public-profile-about";
    const paragraphs = page.aboutMe
      .split(/\n\s*\n/)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
      .join("");
    about.innerHTML = `
      <div class="public-profile-about-card">
        <div class="public-profile-about-header"><i class="fa-solid fa-address-card"></i><span>About Me</span></div>
        <div class="public-profile-about-body">${paragraphs}</div>
      </div>`;
    inner.append(about);
  }

  const linkList = document.createElement("div");
  linkList.className = "public-profile-links";
  links.forEach((link) => {
    if (link.type === "header") {
      if (!link.title || !link.title.trim()) return;
      const heading = document.createElement("div");
      heading.className = "public-profile-section-title";
      heading.textContent = link.title;
      linkList.append(heading);
      return;
    }
    const href = normalizeExternalUrl(link.url || "");
    if (!href) return;
    const anchor = document.createElement("a");
    anchor.className = `public-profile-link content-${align}`;
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.style.borderRadius = `${radius}px`;
    anchor.style.background = linkColor;
    anchor.style.color = isDarkLink ? "#ffffff" : "#172219";
    anchor.style.borderColor = isDarkLink
      ? "rgba(255, 255, 255, 0.14)"
      : "rgba(0, 0, 0, 0.08)";

    const iconHtml = getIcon(link, linkStyle);
    const titleEl = document.createElement("div");
    titleEl.className = "link-title-text";
    titleEl.textContent = link.title || href;

    const textContainer = document.createElement("div");
    textContainer.className = "link-text-block";
    textContainer.append(titleEl);

    if (link.description) {
      const descEl = document.createElement("div");
      descEl.className = "link-desc-text";
      descEl.textContent = link.description;
      textContainer.append(descEl);
    }

    if (iconPosition === "right") {
      anchor.append(textContainer);
      if (iconHtml) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = iconHtml;
        if (wrapper.firstChild) anchor.append(wrapper.firstChild);
      }
    } else {
      if (iconHtml) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = iconHtml;
        if (wrapper.firstChild) anchor.append(wrapper.firstChild);
      }
      anchor.append(textContainer);
    }

    linkList.append(anchor);
  });
  inner.append(linkList);

  const ctaEnabled = page.ctaEnabled !== false;
  if (ctaEnabled && (page.ctaTitle || page.ctaDesc)) {
    const cta = document.createElement("div");
    cta.className = "public-profile-cta";
    const ctaBtnUrl = page.ctaButtonUrl ? normalizeExternalUrl(page.ctaButtonUrl) || page.ctaButtonUrl : "";
    const ctaTextColor = isDarkColor(linkColor) ? "#ffffff" : "#172219";
    cta.innerHTML = `
      <div class="public-profile-cta-card">
        ${page.ctaTitle ? `<h3 class="public-profile-cta-title">${escapeHtml(page.ctaTitle)}</h3>` : ""}
        ${page.ctaDesc ? `<p class="public-profile-cta-desc">${escapeHtml(page.ctaDesc)}</p>` : ""}
        ${ctaBtnUrl ? `<a class="public-profile-cta-btn" style="background:${linkColor};color:${ctaTextColor} !important" href="${ctaBtnUrl}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(page.ctaButtonText || "Send a message")}</span><i class="fa-solid fa-arrow-right"></i></a>` : ""}
      </div>`;
    inner.append(cta);
  }
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
  const footer = document.createElement("footer");
  footer.className = "public-profile-footer";
  const link = document.createElement("a");
  link.href = "/";
  link.textContent = "Bhio";
  link.style.color = "inherit";
  link.style.textDecoration = "none";
  footer.append(link);
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
    .select("*")
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
  const activeUid = getActiveUserId();
  currentSessionUserId = activeUid;
  const hasSession =
    document.documentElement.classList.contains("has-session") ||
    Boolean(activeUid);

  if (hasSession) {
    openEditor();
  }
  ensureLinkAnalytics();

  // Restore local draft immediately on startup/refresh so inputs are preserved with zero loss or flash
  const draftRestored = restoreDraft(activeUid);
  if (!draftRestored) {
    resetEditorToCleanDefault();
  }

  renderPageSwitcher();
  renderLinks();
  renderSocials();
  updateShareLinks();
  renderPreviewDetails();
  ["bio", "aboutMe", "ctaDesc"].forEach((id) => {
    const el = $(`#${id}`);
    if (el) autoResizeTextarea(el);
  });
  renderAnalytics();
  checkUsernameAvailability($("#username").value);
  if ($("#landingUsername")?.value) {
    checkLandingUsernameAvailability($("#landingUsername").value);
  }
  restoreSession();
  updatePreviewZoom();
  initLegalModalAndCookies();
}

window.addEventListener("beforeunload", () => {
  saveDraftLocally();
});

// ==========================================================================
// LEGAL / ABOUT MODAL DIALOGS & COOKIE CONSENT
// ==========================================================================

const LEGAL_DOCS = {
  about: {
    badge: "Our Story & Mission",
    title: "About Bhio",
    updated: "September 2026",
    html: `
      <h3>Welcome to Bhio</h3>
      <p>Bhio is a modern, lightweight, and aesthetic link-in-bio platform designed to give creators, artists, entrepreneurs, developers, and brands an unforgettable home on the web.</p>
      
      <h3>Our Mission</h3>
      <p>We built Bhio because traditional link tools have become overly complex, cluttered with ads, and full of restrictive paywalls on basic creator features. We believe sharing your world should be effortless, fast, and free.</p>
      
      <h3>What Sets Us Apart</h3>
      <ul>
        <li><strong>Unlimited Links & Socials:</strong> Connect all your social profiles, websites, music, videos, shops, and messaging channels with zero artificial caps.</li>
        <li><strong>5 Curated Aesthetics:</strong> Choose from Modern, Minimal, Retro, Bold, and Classic layouts crafted to match your personal identity.</li>
        <li><strong>Real-Time Live Preview:</strong> See your changes instantly on a high-fidelity interactive phone mockup as you type.</li>
        <li><strong>Fast & Edge-Delivered:</strong> Powered by Cloudflare's global edge network, ensuring your bio page loads in milliseconds anywhere in the world.</li>
        <li><strong>Creator-First & Free:</strong> 100% free core experience with no credit card required and no surprise fees.</li>
      </ul>

      <h3>Get In Touch</h3>
      <p>Have questions, feature requests, or partnership ideas? We'd love to hear from you. Contact our team at <a href="mailto:support@bhio.link" style="color: #254b38; font-weight: 600;">support@bhio.link</a>.</p>
    `
  },
  terms: {
    badge: "Terms of Service",
    title: "Terms of Service",
    updated: "September 2026",
    html: `
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using Bhio (bhio.link), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>

      <h3>2. User Accounts & Registration</h3>
      <p>To create a bio page, you must provide a valid email address and choose an available username. You are responsible for maintaining the confidentiality of your password and for all activity conducted through your account.</p>

      <h3>3. Acceptable Use Policy</h3>
      <p>You agree to use Bhio only for lawful purposes. You expressly agree NOT to:</p>
      <ul>
        <li>Publish or link to phishing sites, malware, deceptive schemes, or fraudulent activities.</li>
        <li>Distribute illegal, defamatory, abusive, threatening, or infringing material.</li>
        <li>Impersonate any person, brand, or organization with intent to mislead the public.</li>
        <li>Use automated scripts or bots to bulk-register usernames or scrape data.</li>
      </ul>

      <h3>4. Content Ownership & License</h3>
      <p>You retain full ownership and intellectual property rights to all content, text, links, and media that you upload to your Bhio page. By publishing on Bhio, you grant us a limited, worldwide, royalty-free license solely to host, display, and distribute your profile on the web.</p>

      <h3>5. Platform Rights & Account Termination</h3>
      <p>We reserve the right to modify, suspend, or terminate accounts and reclaim usernames that violate these Terms of Service, compromise system security, or harm our community.</p>

      <h3>6. Disclaimer of Warranties</h3>
      <p>Bhio is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted or error-free service.</p>

      <h3>7. Changes to Terms</h3>
      <p>We may update these terms periodically. Continued use of Bhio following notice of changes constitutes your acceptance of the revised Terms of Service.</p>
    `
  },
  privacy: {
    badge: "Privacy Policy",
    title: "Privacy Policy",
    updated: "September 2026",
    html: `
      <h3>1. Overview</h3>
      <p>At Bhio (bhio.link), your privacy is our top priority. This Privacy Policy outlines what data we collect, how it is used, and your rights regarding your personal information.</p>

      <h3>2. Information We Collect</h3>
      <ul>
        <li><strong>Account Information:</strong> When you register, we collect your email address, chosen handle (@username), and hashed password (securely stored via Supabase Auth).</li>
        <li><strong>Profile Content:</strong> The links, titles, bio text, avatar images, social handles, and theme preferences you choose to display publicly on your page.</li>
        <li><strong>Analytics & Technical Data:</strong> Aggregated, non-personally identifiable technical information such as device type, browser, and user session metrics (via Microsoft Clarity) to diagnose bugs and improve responsiveness.</li>
      </ul>

      <h3>3. How We Use Your Information</h3>
      <p>We use your data solely to deliver and improve our services: to publish your public bio link, authenticate your sessions, prevent spam and abuse, and optimize platform speed. <strong>We never sell, rent, or monetize your personal information to third-party data brokers.</strong></p>

      <h3>4. Cookies & Local Storage</h3>
      <ul>
        <li><strong>Essential Local Storage:</strong> Used to maintain your active login session and remember cookie consent preferences.</li>
        <li><strong>Analytics Cookies:</strong> Microsoft Clarity uses first-party cookies (_clck, _clsk) to analyze user interaction heatmaps and session patterns. You can disable or clear cookies anytime in your browser settings.</li>
      </ul>

      <h3>5. Third-Party Infrastructure</h3>
      <p>Bhio relies on trusted, world-class infrastructure providers:</p>
      <ul>
        <li><strong>Supabase:</strong> Encrypted database and user authentication.</li>
        <li><strong>Cloudflare:</strong> Secure global content delivery network (CDN) and DDoS protection.</li>
        <li><strong>Microsoft Clarity:</strong> Behavioral analytics and performance diagnostics.</li>
      </ul>

      <h3>6. Your Rights & Data Deletion</h3>
      <p>You can edit or delete any link, customize your profile, or completely delete your account and all associated data at any time from your account settings or by contacting <a href="mailto:support@bhio.link" style="color: #254b38; font-weight: 600;">support@bhio.link</a>.</p>
    `
  }
};

function openLegalModal(key) {
  const doc = LEGAL_DOCS[key];
  if (!doc) return;

  const modal = $("#legalModal");
  const badge = $("#legalModalBadge");
  const title = $("#legalModalTitle");
  const body = $("#legalModalBody");
  const updated = $("#legalLastUpdated");

  if (badge) badge.textContent = doc.badge;
  if (title) title.textContent = doc.title;
  if (body) body.innerHTML = doc.html;
  if (updated) updated.textContent = `Last updated: ${doc.updated}`;

  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}

function closeLegalModal() {
  const modal = $("#legalModal");
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (["#about", "#terms", "#privacy"].includes(window.location.hash)) {
    history.replaceState(null, null, " ");
  }
}

function initLegalModalAndCookies() {
  // Modal close buttons
  $("#legalModalClose")?.addEventListener("click", closeLegalModal);
  $("#legalModalDone")?.addEventListener("click", closeLegalModal);

  // Click outside to close
  $("#legalModal")?.addEventListener("click", (e) => {
    if (e.target === $("#legalModal")) {
      closeLegalModal();
    }
  });

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#legalModal")?.classList.contains("open")) {
      closeLegalModal();
    }
  });

  // Open modal links
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".open-legal-btn");
    if (btn) {
      e.preventDefault();
      const legalKey = btn.getAttribute("data-legal");
      if (legalKey) openLegalModal(legalKey);
    }
  });

  // Hash-based direct access (e.g. bhio.link/#terms)
  function checkHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (["about", "terms", "privacy"].includes(hash)) {
      openLegalModal(hash);
    }
  }
  window.addEventListener("hashchange", checkHash);
  checkHash();

  // Cookie Consent Banner
  const cookieBanner = $("#cookieBanner");
  try {
    const consent = localStorage.getItem("bhio-cookie-consent");
    if (!consent && cookieBanner) {
      setTimeout(() => {
        cookieBanner.classList.add("show");
      }, 1000);
    }
  } catch (err) {}

  $("#cookieAcceptBtn")?.addEventListener("click", () => {
    try {
      localStorage.setItem("bhio-cookie-consent", "accepted");
    } catch (err) {}
    cookieBanner?.classList.remove("show");
  });
}
if ("serviceWorker" in navigator) {
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ("caches" in window) {
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name);
      });
    }
  } else {
    window.addEventListener("load", () =>
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch((error) =>
          console.error("Could not register service worker:", error),
        ),
    );
  }
}
