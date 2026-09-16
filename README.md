# C.R. Caretaker website

Static, mobile-first website for a Steamboat Springs lawn mowing business with optional trimming, edging, and light yard cleanup. It can be published on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

## Customize

- Replace the business name in `index.html`.
- Update the phone/text links and visible numbers in `index.html`.
- Update `Crcaretaker@gmail.com` if the owner uses a different email.
- Replace the GitHub Pages URL in the JSON-LD, `robots.txt`, and `sitemap.xml` if you later connect a custom domain.
- Replace `hero-steamboat.png` with an approved local photo if desired. Keep the filename or update the image references.
- Edit services directly in the service cards.

## Run locally

Open `index.html` directly for a quick check, or use any static server. No build step or database is required.

## Deploy

Upload this folder to a static host. The included `mailto:` form works without backend configuration by opening the visitor’s email app; connect it to Formspree or Netlify Forms later if a hosted form is preferred.

## Google discovery

After publishing on the real domain, submit `https://your-domain.com/sitemap.xml` in Google Search Console and request indexing for the homepage. Search visibility cannot be guaranteed, but the page includes crawlable HTML, local lawn-care language, metadata, and LocalBusiness structured data.

All phone numbers and contact details are placeholders from the project brief and should be confirmed before publishing.

## Booking and planning guide

The planning guide uses exact lawn square footage and a continuous calculation; update `planningRange()` in `script.js` once the owner finalizes pricing. Customers select a specific date, then an open start time. The current 8:00 AM, 11:00 AM, and 2:00 PM starts are intentionally three hours apart for mowing and local travel.

To mark a date fully booked, add it to `UNAVAILABLE_DATES` near the top of `script.js` in `YYYY-MM-DD` format, for example:

```js
const UNAVAILABLE_DATES = new Set(["2026-09-22", "2026-09-25"]);
```

Publish the change and those dates will appear unavailable and cannot be selected. This static calendar does not automatically reserve or synchronize dates across visitors. Every selection remains a request until the owner confirms it. For automatic shared availability and reservations, connect a booking backend or calendar service later.

To block a particular start time while keeping other times open that day, add it to `UNAVAILABLE_STARTS` near the top of `script.js`, for example:

```js
const UNAVAILABLE_STARTS = new Map([
  ["2026-09-23", new Set(["11:00 AM"])]
]);
```

Publish the change after the owner adds a confirmed booking. The compact picker will label that start time unavailable, and the full calendar will show the date as limited rather than fully booked.

Photo selection is local preview only. The current static site does not upload photos or use AI image analysis. A secure form endpoint and an AI/API service would be required before claiming automated photo-based size or slope analysis.

## Final-quote request delivery

The finished estimate includes a single **Send my request** button. It sends the estimate details and the visitor's chosen reply contact to `Crcaretaker@gmail.com` through FormSubmit's AJAX endpoint, without opening the visitor's email or text app. The page confirms that the request was received by the form service, but it does not claim the appointment is reserved or the owner has sent the final quote. Photos are not uploaded by this flow.

Before live requests can arrive, FormSubmit will email `Crcaretaker@gmail.com` an activation link on the first submission. Open that email and activate the address once. After activation, submit a genuine test request and confirm that it arrives and that replying works. The public endpoint is intentionally configured with the same business email already shown on the site; replace it in `script.js` if the business email changes.
