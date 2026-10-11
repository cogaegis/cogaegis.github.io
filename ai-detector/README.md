# CogAegis AI Detector (web page)

Plain HTML/CSS/JavaScript. No build step. It uses the same logo, colours (navy #0a0d14, blue #0070f3, cyan #38bdf8) and Inter font as cogaegis.com.

```
ai-detector/
  index.html        scanner page (upload / link / text, result, brain meter, 3-free-scans pop-up)
  pricing.html      Free / Pro / Team plans + "always learning" section
  css/detector.css  all styles
  js/brain.js       draws the 5-stage brain (Certified Organic → AI Slop)
  js/detector.js    page logic + settings (API_URL, SUBSCRIBE_URL, FREE_SCANS)
  images/logo1.png  CogAegis logo
```

## Option A: add it to your cogaegis.com repo (live at cogaegis.com/ai-detector/)

1. On github.com, open the repository that holds cogaegis.com (the one with `index.html`, `sitemap.xml`, `images/`).
2. Click **Add file → Upload files**.
3. Drag the whole **`ai-detector` folder** from File Explorer into the upload box. Dragging the folder keeps its subfolders.
4. Type a message like "Add AI Detector page" and click **Commit changes**.
5. Wait 1–2 minutes, then open **https://cogaegis.com/ai-detector/**.
6. Optional: link to it from the main site (for example, add `<a href="ai-detector/">AI Detector</a>` to the nav in `index.html`) and add `https://cogaegis.com/ai-detector/` to `sitemap.xml`.

## Option B: its own repo (for example, detector.cogaegis.com)

1. On github.com click **+ → New repository**, name it `cogaegis-ai-detector`, set it to Public, and create it.
2. Click **uploading an existing file**, then drag in the **contents** of the `ai-detector` folder (so `index.html` is at the top level, not inside a folder). Commit.
3. Go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and click Save.
4. In the same Pages screen, enter the custom domain `detector.cogaegis.com` and click Save.
5. At your domain provider, add a DNS record: type **CNAME**, name **detector**, value **YOUR-GITHUB-USERNAME.github.io**.
6. Once the DNS check passes (minutes to a few hours), tick **Enforce HTTPS**.

## Before it goes live for real

- **Preview mode.** Until you set `API_URL` in `js/detector.js`, the page shows a "Preview mode" banner and sample reports. That's so visitors aren't misled by fake results.
- **Detection needs a backend.** GitHub Pages only serves static files, so the calls to Hive, Sightengine, Copyleaks and Claude must run on a small server or serverless function (for example Cloudflare Workers, Vercel or Netlify Functions). That keeps your API keys secret. Point `API_URL` at it. `detector.js` documents the JSON format the page expects.
- **Free-scan limit.** The page counts scans in the visitor's browser, which is easy to reset. The real 3-scan limit and subscription check belong in that backend, tied to a sign-in. When the backend returns HTTP 402, the page shows the subscribe pop-up.
- **Payments.** Set `SUBSCRIBE_URL` to a checkout link (for example a Stripe Payment Link), and replace `[PRICE]`, `[N]`, `[VERSION]` and `[DATE]` in the HTML.
