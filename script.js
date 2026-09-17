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

// Keep the quick picker simple: visitors can use these controls or open the full availability calendar.
const compactDate = $(".selected-date");
if (compactDate) {
  compactDate.innerHTML = '<small>YOUR DATE</small><input id="quick-date" type="date" aria-label="Preferred mowing date" aria-describedby="selected-date-subtitle availability-message"><span id="selected-date-subtitle">Choose here, or open the calendar to browse availability.</span>';
}
const oldResultActions = $(".result-actions");
if (oldResultActions) {
  oldResultActions.outerHTML = '<div class="request-send"><p class="request-send-kicker">READY FOR A FINAL QUOTE?</p><h3>Send your request in one step.</h3><label for="reply-to">How should we reply?<input form="booking-form" name="reply-to" id="reply-to" type="text" placeholder="Email or phone number"></label><button class="send-request" form="booking-form" type="submit" id="send-request">Send my request <span>→</span></button><p id="request-send-status" class="request-send-status" role="status">By sending, your reply contact, request details, estimate, and preferred time go through FormSubmit to R&C LawnCare. Photos are not uploaded. A requested time is not held until confirmed.</p><a id="request-fallback" class="request-fallback" href="#contact" hidden>Use another way to reach us</a></div>';
}
const photoHelper = $(".photo-helper");
if (photoHelper) photoHelper.textContent = "Helpful photos show the full lawn, steep areas, gates, obstacles, and overgrowth. Photos stay on this device and are not uploaded with this request.";
const contactPanel = $(".contact-panel");
if (contactPanel) contactPanel.innerHTML = '<p><strong>Have a question before you request?</strong><br>Call, text, or email us directly. For a finished planning range, use the Send my request button above.</p><a class="mobile-only-link" href="sms:+19708460980">Text a question <span>↗</span></a>';

// Add owner-confirmed unavailable dates or occupied arrival times here, then publish the site.
// This static site does not receive live bookings on its own.
const UNAVAILABLE_DATES = new Set([]);
const UNAVAILABLE_STARTS = new Map([
  // ["2026-09-17", new Set(["11:00 AM"])]
]);
// Three-hour gaps leave room for mowing, loading equipment, and local travel.
const CANDIDATE_STARTS = ["8:00 AM", "11:00 AM", "2:00 PM"];
const preferredDate = $("#preferred-date");
const preferredTime = $("#preferred-time") || $("select[name='time']");
const calendarDays = $("#calendar-days");
const calendarMonth = $("#calendar-month");
const calendarStatus = $("#calendar-status");
const calendarPrev = $("#calendar-prev");
const calendarNext = $("#calendar-next");
const calendarToggle = $("#open-calendar");
const calendarClose = $("#calendar-close");
const availabilityCalendar = $("#availability-calendar");
const selectedDateLabel = $("#selected-date-label");
const selectedDateSubtitle = $("#selected-date-subtitle");
const availabilityMessage = $("#availability-message");
const quickDate = $("#quick-date");
const earliestDate = new Date();
earliestDate.setHours(0, 0, 0, 0);
earliestDate.setDate(earliestDate.getDate() + 1);
const lastCalendarDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth() + 6, 0);
let calendarCursor = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);

function localDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function dateCanBeRequested(key) {
  if (!key) return false;
  const date = new Date(`${key}T12:00:00`);
  return date >= earliestDate && date <= lastCalendarDate && !UNAVAILABLE_DATES.has(key);
}

function updateScheduleSummary() {
  const key = preferredDate?.value || "";
  const occupied = UNAVAILABLE_STARTS.get(key) || new Set();
  const openStarts = dateCanBeRequested(key) ? CANDIDATE_STARTS.filter((time) => !occupied.has(time)) : [];
  if (selectedDateLabel) selectedDateLabel.textContent = key ? formatDate(key) : "Choose a day";
  if (selectedDateSubtitle) selectedDateSubtitle.textContent = key
    ? openStarts.length ? `${openStarts.length} start time${openStarts.length === 1 ? "" : "s"} open` : "No start times open"
    : "Select a specific date to see open times.";
  if (availabilityMessage) availabilityMessage.textContent = key
    ? openStarts.length ? "Choose one of the open start times. Slots are spaced three hours apart for mowing and travel." : "That day is not available. Open the full calendar to choose another date."
    : "Open the full calendar to see date availability.";
}

function updateStartOptions() {
  if (!preferredTime) return;
  const selectedDate = preferredDate?.value || "";
  const occupied = UNAVAILABLE_STARTS.get(selectedDate) || new Set();
  const previous = preferredTime.value;
  preferredTime.innerHTML = "";
  const prompt = document.createElement("option");
  prompt.value = "";
  prompt.selected = true;
  prompt.disabled = true;
  if (!selectedDate) prompt.textContent = "Choose a date first";
  else if (!dateCanBeRequested(selectedDate)) prompt.textContent = "Date not available — open calendar";
  else prompt.textContent = "Choose a specific arrival time";
  preferredTime.appendChild(prompt);
  if (!dateCanBeRequested(selectedDate)) {
    preferredTime.disabled = true;
    updateScheduleSummary();
    return;
  }
  CANDIDATE_STARTS.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = occupied.has(time) ? `${time} — not available` : time;
    option.disabled = occupied.has(time);
    preferredTime.appendChild(option);
  });
  preferredTime.disabled = CANDIDATE_STARTS.every((time) => occupied.has(time));
  if (previous && !occupied.has(previous)) preferredTime.value = previous;
  updateScheduleSummary();
}

function setRequestedDate(key, closeCalendar = false) {
  if (!preferredDate) return;
  preferredDate.value = key;
  if (quickDate) quickDate.value = key;
  if (key) {
    const date = new Date(`${key}T12:00:00`);
    if (!Number.isNaN(date.valueOf())) calendarCursor = new Date(date.getFullYear(), date.getMonth(), 1);
  }
  const occupied = UNAVAILABLE_STARTS.get(key) || new Set();
  if (!dateCanBeRequested(key)) {
    setStatus(calendarStatus, "That date is not available. Open the full calendar to see availability.");
  } else if (CANDIDATE_STARTS.every((time) => occupied.has(time))) {
    setStatus(calendarStatus, "No arrival times are open on that date. Open the full calendar to choose another day.");
  } else {
    setStatus(calendarStatus, `Open arrival times for ${formatDate(key)}. Choose one below.`);
  }
  updateStartOptions();
  updateScheduleSummary();
  renderCalendar();
  if (closeCalendar) setCalendarOpen(false);
}

function setCalendarOpen(open) {
  if (!availabilityCalendar) return;
  availabilityCalendar.hidden = !open;
  document.body.classList.toggle("calendar-open", open);
  calendarToggle?.setAttribute("aria-expanded", String(open));
  if (calendarToggle) calendarToggle.innerHTML = open ? "Close calendar <span>×</span>" : "Open calendar <span>↗</span>";
  if (open) {
    renderCalendar();
    availabilityCalendar.querySelector(".calendar-day:not(:disabled)")?.focus();
  } else {
    calendarToggle?.focus();
  }
}

function renderCalendar() {
  if (!calendarDays || !calendarMonth) return;
  calendarDays.innerHTML = "";
  calendarMonth.textContent = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarCursor);
  const firstDay = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const finalDay = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0);
  for (let blank = 0; blank < firstDay.getDay(); blank += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-spacer";
    calendarDays.appendChild(spacer);
  }
  let fullyBookedCount = 0;
  for (let day = 1; day <= finalDay.getDate(); day += 1) {
    const date = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), day);
    const key = localDateKey(date);
    const isPast = date < earliestDate;
    const isTooFar = date > lastCalendarDate;
    const occupied = UNAVAILABLE_STARTS.get(key) || new Set();
    const isBooked = UNAVAILABLE_DATES.has(key) || CANDIDATE_STARTS.every((time) => occupied.has(time));
    const isPartiallyBooked = !isBooked && occupied.size > 0;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(day);
    button.dataset.date = key;
    button.className = "calendar-day";
    if (isBooked) {
      fullyBookedCount += 1;
      button.classList.add("is-unavailable");
    }
    if (isPartiallyBooked) button.classList.add("is-limited");
    const isSelected = preferredDate?.value === key;
    if (isSelected) button.classList.add("is-selected");
    if (isSelected) button.setAttribute("aria-current", "date");
    else button.removeAttribute("aria-current");
    button.disabled = isPast || isTooFar || isBooked;
    const spokenDate = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date);
    button.setAttribute("aria-label", `${spokenDate}${isSelected ? ", selected" : ""}${isBooked ? ", fully booked" : isPartiallyBooked ? ", limited times available" : isPast || isTooFar ? ", unavailable" : ", available to request"}`);
    button.addEventListener("click", () => {
      setRequestedDate(key, true);
    });
    calendarDays.appendChild(button);
  }
  const firstAllowedMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
  const lastAllowedMonth = new Date(lastCalendarDate.getFullYear(), lastCalendarDate.getMonth(), 1);
  if (calendarPrev) calendarPrev.disabled = calendarCursor <= firstAllowedMonth;
  if (calendarNext) calendarNext.disabled = calendarCursor >= lastAllowedMonth;
  $(".calendar-availability-note")?.remove();
  const note = document.createElement("p");
  note.className = "calendar-availability-note";
  note.textContent = fullyBookedCount
    ? `${fullyBookedCount} fully booked date${fullyBookedCount === 1 ? " is" : "s are"} marked this month.`
    : "No fully booked dates are currently posted for this month.";
  calendarDays.after(note);
}

calendarToggle?.addEventListener("click", () => setCalendarOpen(Boolean(availabilityCalendar?.hidden)));
calendarClose?.addEventListener("click", () => setCalendarOpen(false));
preferredTime?.addEventListener("change", updateScheduleSummary);
if (quickDate) {
  quickDate.min = localDateKey(earliestDate);
  quickDate.max = localDateKey(lastCalendarDate);
  quickDate.addEventListener("change", () => setRequestedDate(quickDate.value));
}

calendarPrev?.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  renderCalendar();
});
calendarNext?.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  renderCalendar();
});
renderCalendar();

const bookingForm = $("#booking-form");
const requestResult = $("#request-result");
const sqftFields = $("#sqft-fields");
const dimensionFields = $("#dimension-fields");
const sqftInput = bookingForm?.elements.sqft;
const lengthInput = bookingForm?.elements.length;
const widthInput = bookingForm?.elements.width;
const photoUpload = $(".photo-upload", bookingForm);
if (bookingForm && photoUpload) {
  const addressBlock = document.createElement("div");
  addressBlock.className = "address-field";
  addressBlock.innerHTML = '<label for="service-address">Property address <span class="field-optional">Recommended</span><input id="service-address" name="address" type="text" autocomplete="street-address" placeholder="Street address, Steamboat Springs, CO"><small>Used only to review route distance and any possible travel fee. It is sent privately with your request and never shown on the site.</small></label><p id="address-review" class="address-review" role="status">Add the property address for the most accurate route review. Nearby properties have travel included in the normal range.</p>';
  photoUpload.before(addressBlock);
}
const addressInput = bookingForm?.elements.address;
const addressReview = $("#address-review");

function reviewServiceAddress(value) {
  const normalized = String(value || "").toLowerCase();
  const nearby = /steamboat\s+springs|\b80477\b|\b80487\b|\b80488\b/.test(normalized);
  if (!String(value || "").trim()) {
    return {
      nearby: false,
      short: "Address not provided; route review needed",
      message: "Add the property address for the most accurate route review. Nearby properties have travel included in the normal range."
    };
  }
  if (nearby) {
    return {
      nearby: true,
      short: "Nearby Steamboat area — travel included",
      message: "Nearby Steamboat area detected — travel is included in the normal planning range."
    };
  }
  return {
    nearby: false,
    short: "Address provided — route review requested",
    message: "Address noted for route review. No travel fee is added automatically; if the property is meaningfully out of the normal area, we’ll explain any small fee before booking."
  };
}

function updateAddressReview() {
  const review = reviewServiceAddress(addressInput?.value);
  setStatus(addressReview, review.message);
  addressReview?.classList.toggle("is-nearby", review.nearby);
  addressReview?.classList.toggle("is-review", Boolean(addressInput?.value.trim()) && !review.nearby);
}
addressInput?.addEventListener("input", updateAddressReview);
updateAddressReview();
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
  const allFiles = Array.from(photoInput.files || []);
  const files = allFiles.slice(0, 6);
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
    ? `${files.length} photo${files.length === 1 ? "" : "s"} selected for preview.${allFiles.length > 6 ? ` ${allFiles.length - 6} extra photo${allFiles.length - 6 === 1 ? " was" : "s were"} not previewed.` : ""} Attach the photos manually when your message opens.`
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
  const terrainFactor = { flat: 1, mixed: 1.15, steep: 1.25 }[terrain] || 1;
  const obstacleFactor = { few: 1, some: 1.08, many: 1.16 }[obstacles] || 1;
  const conditionFactor = { maintained: 1, tall: 1.15, overgrown: 1.35 }[condition] || 1;
  let midpoint = baseMowingPrice(sqft) * frequencyFactor * terrainFactor * obstacleFactor * conditionFactor;
  if (trim) midpoint += 8 + Math.min(10, sqft * 0.0007);
  if (cleanup) midpoint += 18 + Math.min(38, sqft * 0.0015);
  const low = Math.max(32, Math.round(midpoint * 0.9));
  const high = Math.max(low + 5, Math.round(midpoint * 1.1));
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

function replyContactType(value) {
  const candidate = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) return "email";
  const digits = candidate.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? "phone" : "";
}

async function sendQuoteRequest(replyTo) {
  const status = $("#request-send-status");
  const button = $("#send-request");
  const fallback = $("#request-fallback");
  if (!requestText || !lastEstimate) return;
  const contactType = replyContactType(replyTo);
  if (!contactType) {
    setStatus(status, "Add a valid email address or phone number so we can reply with the final quote.");
    status?.classList.add("is-error");
    $("#reply-to")?.focus();
    return;
  }
  status?.classList.remove("is-error");
  setStatus(status, "Sending your request…");
  if (button) {
    button.disabled = true;
    button.textContent = "Sending request…";
  }
  try {
    const payload = {
      _subject: "New R&C LawnCare final-quote request",
      _template: "table",
      reply_contact: replyTo.trim(),
      planning_range: `$${lastEstimate.low}–$${lastEstimate.high} per visit`,
      request: requestText
    };
    if (contactType === "email") payload._replyto = replyTo.trim();
    const response = await fetch(`https://formsubmit.co/ajax/${BUSINESS.email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok || responseData.success === false || responseData.success === "false") throw new Error("Request delivery failed");
    setStatus(status, "Request received by our form service. R&C LawnCare will reply with the final quote after review. Your preferred time is not reserved until confirmed.");
    if (button) button.textContent = "Request received ✓";
  } catch {
    setStatus(status, "We could not send that request just now. Try again, or use another way to reach us.");
    status?.classList.add("is-error");
    if (fallback) fallback.hidden = false;
    if (button) {
      button.disabled = false;
      button.innerHTML = "Send my request <span>→</span>";
    }
  }
}

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const sendingRequest = event.submitter?.id === "send-request" || document.activeElement?.id === "send-request";
  $(".form-error")?.remove();
  const data = new FormData(bookingForm);
  const requestedDate = String(data.get("date") || "");
  const requestedTime = String(data.get("time") || "");
  if (!dateCanBeRequested(requestedDate)) {
    showFormError("That date is not available. Open the full calendar to choose an open day.", calendarToggle);
    return;
  }
  if (!requestedTime || (UNAVAILABLE_STARTS.get(requestedDate) || new Set()).has(requestedTime)) {
    showFormError("That arrival time is not available. Choose another time, or open the full calendar to check a different day.", preferredTime);
    return;
  }
  const sqft = getSquareFeet(data);
  if (!Number.isFinite(sqft) || sqft < 250 || sqft > 100000) {
    const useDimensions = data.get("size-method") === "dimensions";
    showFormError(
      "Enter a mowable grass area between 250 and 100,000 square feet, or use realistic lawn dimensions.",
      useDimensions ? lengthInput : sqftInput
    );
    return;
  }

  const address = String(data.get("address") || "").trim();
  const addressReviewState = reviewServiceAddress(address);
  const details = {
    sqft,
    address,
    addressReview: addressReviewState,
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
  $("#result-copy").textContent = addressReviewState.nearby
    ? "Estimated per visit with nearby travel included. The final quote can change after we review access, photos, actual grass area, and the requested scope."
    : "Estimated per visit. We’ll review the property address and confirm any route adjustment before booking. The final quote can change after we review access, photos, actual grass area, and the requested scope.";
  $("#result-details").innerHTML = [
    `${sqft.toLocaleString()} sq ft`,
    serviceLabel,
    terrainLabel,
    obstacleLabel,
    conditionLabel,
    addressReviewState.short,
    `Preferred: ${formatDate(data.get("date"))}, ${data.get("time")}`,
    ...extras,
    photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"} ready to attach` : "No photos selected"
  ].map((item) => `<span>${item}</span>`).join("");

  requestText = [
    "R&C LawnCare quote request",
    `Planning range: $${range.low}–$${range.high} per visit`,
    `Property address: ${address || "Not provided; owner should confirm route before quoting"}`,
    `Travel review: ${addressReviewState.short}`,
    `Service: ${serviceLabel}`,
    `Mowable lawn: ${sqft.toLocaleString()} sq ft`,
    `Terrain: ${terrainLabel}`,
    `Obstacles/access: ${obstacleLabel}`,
    `Grass condition: ${conditionLabel}`,
    `Preferred time: ${formatDate(data.get("date"))}, ${data.get("time")}`,
    `Extras: ${extras.length ? extras.join(", ") : "None selected"}`,
    `Photos: ${photoCount ? `${photoCount} selected on this device; not uploaded with this request` : "None selected"}`,
    "",
    "This is a planning request, not a confirmed booking or final quote."
  ].join("\n");

  requestResult.hidden = false;
  const sendStatus = $("#request-send-status");
  const sendButton = $("#send-request");
  const requestFallback = $("#request-fallback");
  if (sendStatus) {
    sendStatus.classList.remove("is-error");
    sendStatus.textContent = "By sending, your reply contact, request details, estimate, and preferred time go through FormSubmit to R&C LawnCare. Photos are not uploaded. A requested time is not held until confirmed.";
  }
  if (sendButton) {
    sendButton.disabled = false;
    sendButton.innerHTML = "Send my request <span>→</span>";
  }
  if (requestFallback) requestFallback.hidden = true;
  requestResult.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "nearest"
  });
  $(".result-title", requestResult)?.focus();
  if (sendingRequest) sendQuoteRequest(String(data.get("reply-to") || ""));
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
    answer = "Some slope adds about 15% to the planning calculation; steep or uneven terrain adds about 25% because it usually slows mowing and may require smaller equipment. The owner confirms the real adjustment after review.";
  } else if (/shape|irregular|triangle|circle|section|rectangle/.test(question)) {
    answer = "For an irregular lawn, divide it into a few simple rectangles, calculate each length × width, and add the areas together. The result only needs to be close enough for a planning range.";
  } else if (/travel|far|distance|outside|town|steamboat|service area|location/.test(question)) {
    answer = "R&C LawnCare provides mowing in and near Steamboat Springs. A property farther from town is considered only when the schedule allows and may have a small travel fee, which is disclosed before booking.";
  } else if (/square|size|feet|measure|area/.test(question)) {
    answer = "Use mowable grass area only. Exclude the house, driveway, deck, and large beds. If you do not know the square feet, choose Help me calculate it and enter approximate lawn length and width.";
  } else if (/include|mow|edge|trim/.test(question)) {
    answer = "Routine mowing means mowing the lawn. Trimming and edging are selected separately, so the request clearly matches the work you want.";
  } else if (/cleanup|leaf|leaves|twig|weed/.test(question)) {
    answer = "Optional cleanup means a short-grass trim plus removal of leaves, twigs, and weeds. Because debris volume varies, the final cleanup price is confirmed after photos or an on-site look.";
  } else if (/schedule|date|time|book|available/.test(question)) {
    answer = "Choose a specific day, then one open start time. The 8:00 AM, 11:00 AM, and 2:00 PM options are intentionally three hours apart for mowing and local travel. Fully booked days and occupied starts cannot be selected. Your choice is still a request until R&C LawnCare confirms it directly.";
  } else if (/pay|payment|cash|card|invoice/.test(question)) {
    answer = "Payment details are confirmed directly with the owner before work begins. The website does not collect payment or card information.";
  } else if (/access|gate|fence|dog|pet|lock/.test(question)) {
    answer = "Include gate width, locks, pets, fences, and hard-to-reach sections in your message or photos. Access can change the equipment needed and the final quote.";
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
    await copyText(`R&C LawnCare\nCall or text: ${BUSINESS.phoneDisplay}\nAlternate: 970 457 0542\nEmail: ${BUSINESS.email}`);
    setStatus(status, "All contact details copied.");
  } catch {
    setStatus(status, "Copy is unavailable. Select the contact information manually.");
  }
});
