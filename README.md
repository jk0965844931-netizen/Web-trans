# Web-trans

A browser-based one-device live translation demo styled after the Babelfish Live reference screen.

## Run locally

```bash
npm install
npm run start
```

Open <http://localhost:5173>, allow microphone access, choose the speaking and target languages, then press **Start**.

## What works

- Captures microphone audio with the browser MediaDevices API.
- Shows a live input level meter.
- Uses Web Speech Recognition when supported by the browser.
- Translates finalized speech with the MyMemory public translation API.
- Reads translations aloud with browser speech synthesis.
- Provides microphone/speaker selectors and a shareable room link.

> Speech recognition support varies by browser. Chrome and Safari provide the best results, and microphone access requires `localhost` or HTTPS.
