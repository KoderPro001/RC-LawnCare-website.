# R&C LawnCare website

Static, mobile-first website for a Steamboat Springs lawn mowing business with optional trimming, edging, and light yard cleanup. It can be published on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

## Customize

- Replace the business name in `index.html`.
- Update the phone/text links and visible numbers in `index.html`.
- Change the configured business mailbox only after a replacement address is active; update both `index.html` and `script.js`.
- The current public site is https://koderpro001.github.io/RC-LawnCare-website./
- If you connect a custom domain later, update the canonical URL, JSON-LD, `robots.txt`, and `sitemap.xml` together.
- Replace `hero-steamboat.png` with an approved local photo if desired. Keep the filename or update the image references.
- Edit services directly in the service cards.

## Run locally

Open `index.html` directly for a quick check, or use any static server. No build step or database is required.

## Deploy

Upload this folder to a static host. Quote requests are sent through the FormSubmit AJAX endpoint configured in `script.js`; verify the receiving mailbox and complete FormSubmit’s first-use activation before relying on live requests.

## Google discovery

Current live site: https://koderpro001.github.io/RC-LawnCare-website./ Submit `https://koderpro001.github.io/RC-LawnCare-website./sitemap.xml` in Google Search Console, then request indexing for the homepage URL. Google's results update after it recrawls the site; timing is not controlled by this project. Search visibility cannot be guaranteed, but the page includes crawlable HTML, local lawn-care language, metadata, and LocalBusiness structured data.

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

The finished estimate includes a single **Send my request** button. It sends the estimate details and the visitor's chosen reply contact to the configured business mailbox through FormSubmit's AJAX endpoint, without opening the visitor's email or text app. The page confirms that the request was received by the form service, but it does not claim the appointment is reserved or the owner has sent the final quote. Photos are not uploaded by this flow.

Before live requests can arrive, FormSubmit will email the configured business mailbox an activation link on the first submission. Open that email and activate the address once. After activation, submit a genuine test request and confirm that it arrives and that replying works. The public endpoint and visible contact details use the same configured mailbox in `index.html` and `script.js`; change both only after the replacement mailbox is active.

## Property address and travel review

The booking form includes an optional property-address field so the owner can review route distance with the quote request. Addresses that clearly identify the nearby Steamboat Springs area show that travel is included in the normal planning range. Other addresses are flagged for route review without adding an invented fee automatically; if a property is meaningfully out of the normal area, the owner confirms any small travel fee before booking. The static page does not geocode addresses or promise an exact mileage-based fee.
