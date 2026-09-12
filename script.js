const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  nav.classList.toggle('mobile-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('mobile-open');
}));

const photoInput = document.querySelector('#yard-photos');
const photoPreview = document.querySelector('#photo-preview');

photoInput?.addEventListener('change', () => {
  photoPreview.innerHTML = '';
  [...photoInput.files].slice(0, 4).forEach((file) => {
    const image = document.createElement('img');
    image.alt = `Selected yard photo: ${file.name}`;
    image.src = URL.createObjectURL(file);
    photoPreview.append(image);
  });
  if (photoInput.files.length > 4) {
    const note = document.createElement('small');
    note.textContent = `${photoInput.files.length - 4} more photo(s) selected`;
    photoPreview.append(note);
  }
});

const preferredDate = document.querySelector('#preferred-date');
if (preferredDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  preferredDate.min = tomorrow.toISOString().slice(0, 10);
  preferredDate.value = tomorrow.toISOString().slice(0, 10);
}

// A transparent, continuous planning guide — not a quote. The calculation uses
// the exact mowable square footage so a one-square-foot change never jumps to a
// different price tier. The owner can revise these figures after finalizing rates.
function planningRange(sqft, terrain, extras) {
  let low = Math.max(35, Math.round(30 + (sqft * 0.007)));
  let high = Math.max(low + 10, Math.round(42 + (sqft * 0.0085)));

  if (terrain === 'mixed') {
    low = Math.round(low * 1.1);
    high = Math.round(high * 1.18);
  }
  if (terrain === 'steep') {
    low = Math.round(low * 1.2);
    high = Math.round(high * 1.35);
  }
  if (extras.includes('Trimming & edging')) {
    low += 8;
    high += 12;
  }
  if (extras.includes('Leaf or debris cleanup')) {
    low += 15;
    high += 25;
  }

  return { low, high };
}

const bookingForm = document.querySelector('#booking-form');
const requestResult = document.querySelector('#request-result');
let requestText = '';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(bookingForm);
  const sqft = Number(data.get('sqft'));
  const service = data.get('service');
  const terrain = data.get('terrain');
  const extras = [data.get('trim') ? 'Trimming & edging' : '', data.get('cleanup') ? 'Leaf or debris cleanup' : ''].filter(Boolean);
  const date = data.get('date');
  const time = data.get('time');
  const price = document.querySelector('.result-price');
  const copy = document.querySelector('#result-copy');
  const details = document.querySelector('#result-details');

  const range = planningRange(sqft, terrain, extras);
  price.textContent = `$${range.low}–$${range.high}`;
  copy.textContent = terrain === 'flat' && !extras.length
    ? 'Typical per-visit planning range for routine mowing. It is based on exact lawn size, not a broad yard category, and is not a final quote or confirmed appointment.'
    : 'This bounded planning range includes the slope and services you selected. We’ll confirm the work and a clear per-visit quote before reserving a visit.';

  details.innerHTML = [
    `${sqft.toLocaleString()} sq ft`,
    service === 'one-time' ? 'One-time visit' : service === 'weekly' ? 'Weekly service' : 'Every other week',
    terrain === 'flat' ? 'Mostly flat' : terrain === 'mixed' ? 'Some slope' : 'Steep / uneven',
    `Requested: ${formatDate(date)}, ${time}`,
    ...extras,
  ].map((item) => `<span>${item}</span>`).join('');

  requestText = `C.R. Caretaker visit request\nService: ${service}\nLawn: ${sqft.toLocaleString()} sq ft\nTerrain: ${terrain}\nPreferred time: ${formatDate(date)}, ${time}${extras.length ? `\nExtras: ${extras.join(', ')}` : ''}`;
  requestResult.hidden = false;
  requestResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.querySelector('.result-close')?.addEventListener('click', () => { requestResult.hidden = true; });

document.querySelector('.copy-estimate')?.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(requestText);
    status.textContent = 'Request details copied. Paste them into a text or email so we can confirm availability.';
  } catch {
    status.textContent = 'Copy is unavailable here. Select the request details above and copy them manually.';
  }
});

document.querySelector('.copy-contact')?.addEventListener('click', async () => {
  const status = document.querySelector('.contact-copy-status');
  try {
    await navigator.clipboard.writeText('C.R. Caretaker\nCall or text: 970 846 0980\nAlternate call: 970 457 0542\nEmail: Crcaretaker@gmail.com');
    status.textContent = 'Contact details copied.';
  } catch {
    status.textContent = 'Copy is unavailable here. Please select the contact details above.';
  }
});
