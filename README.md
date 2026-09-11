# C.R. Caretaker website

Static, mobile-first website for a Steamboat Springs lawn mowing and property cleanup business. It can be published on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

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

The planning guide uses exact lawn square footage and clear local-market ranges; update the `marketBands` values near the top of `script.js` once the owner finalizes pricing. The date and arrival-window fields collect a preferred visit time only. To prevent double booking across all visitors, connect a shared booking calendar such as Google Calendar Appointment Schedules, Calendly, or a similar service and replace the confirmation workflow.

Photo selection is local preview only. The current static site does not upload photos or use AI image analysis. A secure form endpoint and an AI/API service would be required before claiming automated photo-based size or slope analysis.
