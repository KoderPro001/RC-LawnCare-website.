const BUSINESS = {
  phone: "9708460980",
  phoneDisplay: "970 846 0980",
  email: "Crcaretaker@gmail.com"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setStatus(element, message) {
  if (element) element.textContent = message;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Copy unavailable");
}

const toggle = $(".menu-toggle");
const nav = $("#site-navigation");
function closeMenu(returnFocus = false) {
  if (!toggle || !nav) return;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  nav.classList.remove("mobile-open");
  if (returnFocus) toggle.focus();
}
toggle?.addEventListener("click", () => {
  if (toggle.getAttribute("aria-expanded") === "true") return closeMenu(true);
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Close menu");
  nav?.classList.add("mobile-open");
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") closeMenu(true);
});

const preferredDate = $("#preferred-date");
if (preferredDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const localDate = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0")
  ].join("-");
  preferredDate.min = localDate;
  preferredDate.value = localDate;
}

const bookingForm = $("#booking-form");
const requestResult = $("#request-result");
const sqftFields = $("#sqft-fields");
const dimensionFields = $("#dimension-fields");
const sqftInput = bookingForm?.elements.sqft;
const lengthInput = bookingForm?.elements.length;
const widthInput = bookingForm?.elements.width;
let requestText = "";
let lastEstimate = null;

function updateSizeMethod() {
  if (!bookingForm) return;
  const method = new FormData(bookingForm).get("size-method");
  const useDimensions = method === "dimensions";
  if (sqftFields) sqftFields.hidden = useDimensions;
  if (dimensionFields) dimensionFields.hidden = !useDimensions;
  if (sqftInput) sqftInput.required = !useDimensions;
  if (lengthInput) lengthInput.required = useDimensions;
  if (widthInput) widthInput.required = useDimensions;
}
$$('input[name="size-method"]', bookingForm || document).forEach((input) => {
  input.addEventListener("change", updateSizeMethod);
});
updateSizeMethod();

const photoInput = $("#yard-photos");
const photoPreview = $("#photo-preview");
let photoUrls = [];
photoInput?.addEventListener("change", () => {
  photoUrls.forEach((url) => URL.revokeObjectURL(url));
  photoUrls = [];
  if (!photoPreview) return;
  photoPreview.innerHTML = "";
  const files = Array.from(photoInput.files || []).slice(0, 6);
  files.forEach((file) => {
    const image = document.createElement("img");
    const url = URL.createObjectURL(file);
    photoUrls.push(url);
    image.alt = `Selected yard photo: ${file.name}`;
    image.src = url;
    photoPreview.appendChild(image);
  });
  const note = document.createElement("small");
  note.textContent = files.length
    ? `${files.length} photo${files.length === 1 ? "" : "s"} selected for preview. Attach them manually when your message opens.`
    : "No photos selected.";
  photoPreview.appendChild(note);
});

function getSquareFeet(data) {
  if (data.get("size-method") === "dimensions") {
    return Math.round(Number(data.get("length")) * Number(data.get("width")));
  }
  return Math.round(Number(data.get("sqft")));
}

function baseMowingPrice(sqft) {
  let price = 32;
  if (sqft > 2000) price += (Math.min(sqft, 5000) - 2000) * 0.004;
  if (sqft > 5000) price += (Math.min(sqft, 10000) - 5000) * 0.003;
  if (sqft > 10000) price += (sqft - 10000) * 0.0025;
  return price;
}

function planningRange({ sqft, service, terrain, obstacles, condition, trim, cleanup }) {
  const frequencyFactor = { "one-time": 1.05, weekly: 0.9, biweekly: 0.97 }[service] || 1;
  const terrainFactor = { flat: 1, mixed: 1.12, steep: 1.25 }[terrain] || 1;
  const obstacleFactor = { few: 1, some: 1.08, many: 1.16 }[obstacles] || 1;
  const conditionFactor = { maintained: 1, tall: 1.15, overgrown: 1.35 }[condition] || 1;
  let midpoint = baseMowingPrice(sqft) * frequencyFactor * terrainFactor * obstacleFactor * conditionFactor;
  if (trim) midpoint += 8 + Math.min(10, sqft * 0.0007);
  if (cleanup) midpoint += 18 + Math.min(38, sqft * 0.0015);
  const low = Math.max(32, Math.round(midpoint * 0.9));
  const high = Math.max(low + 8, Math.round(midpoint * 1.1));
  return { low, high, midpoint: Math.round(midpoint) };
}

function formatDate(value) {
  if (!value) return "No date selected";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function fieldLabel(value, labels) {
  return labels[value] || value;
}

function showFormError(message, focusTarget) {
  $(".form-error")?.remove();
  const error = document.createElement("p");
  error.className = "form-error";
  error.setAttribute("role", "alert");
  error.textContent = message;
  bookingForm?.prepend(error);
  focusTarget?.focus();
}

function updateHandoffLinks() {
  const subject = "C.R. Caretaker quote request";
  const email = $("#email-request");
  const gmail = $("#gmail-request");
  if (email) {
    email.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText)}`;
  }
  if (gmail) {
    gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(BUSINESS.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText)}`;
  }
}

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  $(".form-error")?.remove();
  const data = new FormData(bookingForm);
  const sqft = getSquareFeet(data);
  if (!Number.isFinite(sqft) || sqft < 250 || sqft > 100000) {
    const useDimensions = data.get("size-method") === "dimensions";
    showFormError(
      "Enter a mowable grass area between 250 and 100,000 square feet, or use realistic lawn dimensions.",
      useDimensions ? lengthInput : sqftInput
    );
    return;
  }

  const details = {
    sqft,
    service: data.get("service"),
    terrain: data.get("terrain"),
    obstacles: data.get("obstacles"),
    condition: data.get("condition"),
    trim: Boolean(data.get("trim")),
    cleanup: Boolean(data.get("cleanup"))
  };
  const range = planningRange(details);
  lastEstimate = { ...details, ...range };
  const serviceLabel = fieldLabel(details.service, {
    "one-time": "One-time mowing",
    weekly: "Weekly mowing",
    biweekly: "Every other week"
  });
  const terrainLabel = fieldLabel(details.terrain, {
    flat: "Mostly flat",
    mixed: "Some slope",
    steep: "Steep / uneven"
  });
  const obstacleLabel = fieldLabel(details.obstacles, {
    few: "Few obstacles",
    some: "Several obstacles",
    many: "Many obstacles / tight access"
  });
  const conditionLabel = fieldLabel(details.condition, {
    maintained: "Maintained grass",
    tall: "Tall grass",
    overgrown: "Overgrown grass"
  });
  const extras = [details.trim ? "Trimming & edging" : "", details.cleanup ? "Optional cleanup" : ""].filter(Boolean);
  const photoCount = Math.min((photoInput?.files || []).length, 6);

  $(".result-price").textContent = `$${range.low}–$${range.high}`;
  $("#result-copy").textContent = "Estimated per visit. The final quote can change after we review access, photos, actual grass area, and the requested scope.";
  $("#result-details").innerHTML = [
    `${sqft.toLocaleString()} sq ft`,
    serviceLabel,
    terrainLabel,
    obstacleLabel,
    conditionLabel,
    `Preferred: ${formatDate(data.get("date"))}, ${data.get("time")}`,
    ...extras,
    photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"} ready to attach` : "No photos selected"
  ].map((item) => `<span>${item}</span>`).join("");

  requestText = [
    "C.R. Caretaker quote request",
    `Planning range: $${range.low}–$${range.high} per visit`,
    `Service: ${serviceLabel}`,
    `Mowable lawn: ${sqft.toLocaleString()} sq ft`,
    `Terrain: ${terrainLabel}`,
    `Obstacles/access: ${obstacleLabel}`,
    `Grass condition: ${conditionLabel}`,
    `Preferred time: ${formatDate(data.get("date"))}, ${data.get("time")}`,
    `Extras: ${extras.length ? extras.join(", ") : "None selected"}`,
    `Photos: ${photoCount ? `${photoCount} selected; I will attach them` : "None selected"}`,
    "",
    "This is a planning request, not a confirmed booking or final quote."
  ].join("\n");

  updateHandoffLinks();
  requestResult.hidden = false;
  requestResult.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "nearest"
  });
  $(".result-title", requestResult)?.focus();
});

if (requestResult) {
  requestResult.setAttribute("aria-live", "polite");
  const title = document.createElement("h3");
  title.className = "result-title";
  title.tabIndex = -1;
  title.textContent = "Your planning range is ready";
  $(".result-top", requestResult)?.after(title);
}

$(".result-close")?.addEventListener("click", () => {
  requestResult.hidden = true;
  bookingForm?.querySelector("button[type='submit']")?.focus();
});

$(".copy-estimate")?.addEventListener("click", async () => {
  const status = $(".copy-status");
  try {
    await copyText(requestText);
    setStatus(status, "Request copied. Paste it into a text or email and attach any selected photos.");
  } catch {
    setStatus(status, "Copy is unavailable in this browser. Use Open Gmail or Open email app.");
  }
});

const assistantAnswer = $("#assistant-answer");
const assistantQuestion = $("#assistant-question");
function answerAssistant() {
  const question = (assistantQuestion?.value || "").trim().toLowerCase();
  if (!question) {
    setStatus(assistantAnswer, "Ask about price, lawn size, slope, photos, service details, or scheduling.");
    assistantQuestion?.focus();
    return;
  }
  let answer;
  if (/photo|image|picture|camera/.test(question)) {
    answer = "Photos help the owner review visible slope, gates, obstacles, edging, and grass condition. They stay on your device until you attach them to a text or email. A single photo cannot reliably measure square footage.";
  } else if (/slope|steep|hill|terrain/.test(question)) {
    answer = "Some slope adds about 12% to the planning calculation; steep or uneven terrain adds about 25% because it usually slows mowing and may require smaller equipment. The owner confirms the real adjustment after review.";
  } else if (/square|size|feet|measure|area/.test(question)) {
    answer = "Use mowable grass area only. Exclude the house, driveway, deck, and large beds. If you do not know the square feet, choose Help me calculate it and enter approximate lawn length and width.";
  } else if (/include|mow|edge|trim/.test(question)) {
    answer = "Routine mowing means mowing the lawn. Trimming and edging are selected separately, so the request clearly matches the work you want.";
  } else if (/cleanup|leaf|leaves|twig|weed/.test(question)) {
    answer = "Optional cleanup means a short-grass trim plus removal of leaves, twigs, and weeds. Because debris volume varies, the final cleanup price is confirmed after photos or an on-site look.";
  } else if (/schedule|date|time|book|available/.test(question)) {
    answer = "The date and arrival window are preferences, not an instant reservation. C.R. Caretaker confirms availability directly so two customers are not promised the same time.";
  } else if (/why|price|cost|expensive|range|accurate|quote/.test(question)) {
    answer = lastEstimate
      ? `Your $${lastEstimate.low}–$${lastEstimate.high} range is based on ${lastEstimate.sqft.toLocaleString()} sq ft plus frequency, terrain, obstacles, grass condition, and selected extras. It stays a range until the property is reviewed.`
      : "The range starts with mowable square footage, then adjusts for frequency, slope, obstacles, grass condition, and selected extras. Complete the form for a property-specific explanation.";
  } else {
    answer = "I can explain the estimate, square footage, slopes, obstacles, photos, cleanup, what mowing includes, and how scheduling works. The owner confirms property-specific questions and the final quote.";
  }
  setStatus(assistantAnswer, answer);
}
$("#ask-assistant")?.addEventListener("click", answerAssistant);
assistantQuestion?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    answerAssistant();
  }
});

$$('.copy-value').forEach((button) => {
  button.addEventListener("click", async () => {
    const status = $(".contact-copy-status");
    try {
      await copyText(button.dataset.copy || "");
      setStatus(status, `${button.dataset.copy} copied.`);
    } catch {
      setStatus(status, "Copy is unavailable. Select the contact information manually.");
    }
  });
});

$(".copy-contact")?.addEventListener("click", async () => {
  const status = $(".contact-copy-status");
  try {
    await copyText(`C.R. Caretaker\nCall or text: ${BUSINESS.phoneDisplay}\nAlternate: 970 457 0542\nEmail: ${BUSINESS.email}`);
    setStatus(status, "All contact details copied.");
  } catch {
    setStatus(status, "Copy is unavailable. Select the contact information manually.");
  }
});
