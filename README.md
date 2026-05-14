# Web-trans

A browser-based one-device live translation app styled after the Babelfish Live reference screen and tuned for iPhone use as an installable web app.

## Run locally

```bash
npm install
npm run start
```

Open <http://localhost:5173>, allow microphone access, choose the speaking and target languages, then press **Start**.

## Use on iPhone as an app

1. Deploy or open the site from an HTTPS address. iPhone microphone access requires HTTPS unless you are on `localhost`.
2. In Safari, tap **Share** → **Add to Home Screen** → **Add**.
3. Open **Babelfish** from the Home Screen and use **One iPhone** mode. No second phone, computer, listener device, or room display is required.

## What works

- Installable PWA shell with iPhone Home Screen metadata and a service worker cache.
- Captures microphone audio with the browser MediaDevices API.
- Shows a live input level meter.
- Uses Web Speech Recognition when supported by the browser.
- Provides a typed-text fallback when speech recognition is unavailable.
- Translates finalized speech or typed text with the MyMemory public translation API.
- Includes a small offline phrasebook fallback for common travel phrases.
- Reads translations aloud with browser speech synthesis.
- Provides microphone/speaker selectors and a copyable app link.

> Speech recognition support varies by browser. Chrome and Safari provide the best results. Translation requires internet access except for the small built-in phrasebook fallback.
