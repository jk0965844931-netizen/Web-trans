const roomIdElement = document.querySelector('#roomId');
const deviceHint = document.querySelector('#deviceHint');
const connectionState = document.querySelector('#connectionState');
const installHint = document.querySelector('#installHint');
const installButton = document.querySelector('#installButton');
const sourceLanguage = document.querySelector('#sourceLanguage');
const targetLanguage = document.querySelector('#targetLanguage');
const microphoneSelect = document.querySelector('#microphoneSelect');
const speakerSelect = document.querySelector('#speakerSelect');
const refreshDevices = document.querySelector('#refreshDevices');
const manualText = document.querySelector('#manualText');
const translateTypedButton = document.querySelector('#translateTypedButton');
const volumeFill = document.querySelector('#volumeFill');
const volumeLabel = document.querySelector('#volumeLabel');
const startButton = document.querySelector('#startButton');
const copyLinkButton = document.querySelector('#copyLinkButton');
const listenButton = document.querySelector('#listenButton');
const captureButton = document.querySelector('#captureButton');
const sourceTitle = document.querySelector('#sourceTitle');
const targetTitle = document.querySelector('#targetTitle');
const sourceTranscript = document.querySelector('#sourceTranscript');
const translatedTranscript = document.querySelector('#translatedTranscript');
const statusMessage = document.querySelector('#statusMessage');
const modeButtons = document.querySelectorAll('.mode-button[data-mode]');

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let audioContext;
let analyser;
let microphoneStream;
let meterAnimation;
let isRunning = false;
let listenEnabled = true;
let deferredInstallPrompt;

const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

function createRoomId() {
  const fromUrl = new URLSearchParams(window.location.search).get('room');
  if (fromUrl) return fromUrl.slice(0, 12);
  const bytes = new Uint8Array(4);
  window.crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function updateDeviceHint() {
  const supportsSpeech = Boolean(SpeechRecognition);
  if (!window.isSecureContext) {
    deviceHint.textContent = 'Open from HTTPS or localhost so iPhone can allow microphone access';
    return;
  }

  deviceHint.textContent = isIos
    ? 'iPhone detected: standalone one-device flow enabled'
    : supportsSpeech
      ? 'Live browser speech recognition ready'
      : 'Speech recognition unavailable: use the typed-text fallback below';
}

function updateInstallUi() {
  if (isStandalone) {
    installHint.textContent = 'Running as an installed iPhone app. Everything happens on this device.';
    installButton.hidden = true;
    return;
  }

  if (isIos) {
    installHint.textContent = 'On iPhone: tap Share, choose Add to Home Screen, then open Babelfish from the Home Screen.';
    installButton.textContent = 'How to install';
    return;
  }

  installHint.textContent = 'Install this standalone web app and use one-device translation without a second phone.';
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function updateLanguageTitles() {
  sourceTitle.textContent = languageNames.of(sourceLanguage.value) || sourceLanguage.value;
  targetTitle.textContent = languageNames.of(targetLanguage.value) || targetLanguage.value;
}


function fillSelect(select, devices, prefix, fallback) {
  select.replaceChildren();
  if (!devices.length) {
    select.append(new Option(fallback, ''));
    return;
  }

  devices.forEach((device, index) => {
    select.append(new Option(device.label || `${prefix} ${index + 1}`, device.deviceId));
  });
}

async function populateDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    setStatus('This browser cannot list microphones or speakers. Default devices will be used.');
    return;
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const microphones = devices.filter((device) => device.kind === 'audioinput');
  const speakers = devices.filter((device) => device.kind === 'audiooutput');

  fillSelect(microphoneSelect, microphones, 'Microphone', 'Default microphone');
  fillSelect(speakerSelect, speakers, 'Speaker', 'Default speaker');
}

async function ensureMicrophone() {
  if (!window.isSecureContext) {
    throw new Error('Microphone access requires HTTPS or localhost. Install/open the app from an HTTPS address on iPhone.');
  }

  if (microphoneStream) return microphoneStream;
  const selectedDevice = microphoneSelect.value;
  microphoneStream = await navigator.mediaDevices.getUserMedia({
    audio: selectedDevice ? { deviceId: { ideal: selectedDevice }, echoCancellation: true, noiseSuppression: true } : true,
  });
  await populateDevices();
  startMeter(microphoneStream);
  return microphoneStream;
}

function startMeter(stream) {
  audioContext = audioContext || new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  const samples = new Uint8Array(analyser.frequencyBinCount);

  const render = () => {
    analyser.getByteFrequencyData(samples);
    const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const percent = Math.min(100, Math.round((average / 130) * 100));
    volumeFill.style.width = `${percent}%`;
    volumeLabel.textContent = percent < 8 ? 'quiet' : percent < 45 ? 'listening' : 'loud';
    meterAnimation = requestAnimationFrame(render);
  };

  cancelAnimationFrame(meterAnimation);
  render();
}

function stopMicrophone() {
  microphoneStream?.getTracks().forEach((track) => track.stop());
  microphoneStream = undefined;
  cancelAnimationFrame(meterAnimation);
  volumeFill.style.width = '2%';
  volumeLabel.textContent = 'quiet';
}

function buildRecognition() {
  if (!SpeechRecognition) return null;
  const recognizer = new SpeechRecognition();
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = sourceLanguage.value;

  recognizer.onresult = (event) => {
    const result = [...event.results].slice(event.resultIndex).map((item) => item[0].transcript).join(' ').trim();
    if (!result) return;
    sourceTranscript.textContent = result;
    if (event.results[event.results.length - 1].isFinal) {
      translateText(result);
    }
  };

  recognizer.onerror = (event) => {
    setStatus(`Speech recognition error: ${event.error}. You can press Start again.`);
    stopListening(false);
  };

  recognizer.onend = () => {
    if (isRunning) recognizer.start();
  };

  return recognizer;
}

async function translateText(text) {
  updateLanguageTitles();
  translatedTranscript.textContent = 'Translating...';
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${sourceLanguage.value}|${targetLanguage.value}`);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation service unavailable');
    const data = await response.json();
    const translated = data.responseData?.translatedText || 'No translation returned.';
    translatedTranscript.textContent = translated;
    manualText.value = text;
    speak(translated);
    setStatus('Translated successfully. Keep speaking for live updates.');
  } catch (error) {
    const fallback = offlinePhrasebook(text);
    if (fallback) {
      translatedTranscript.textContent = fallback;
      speak(fallback);
      setStatus('Translation service unavailable, so a built-in phrasebook result is shown.');
      return;
    }

    translatedTranscript.textContent = 'Translation failed. Please check your connection and try again.';
    setStatus(navigator.onLine ? error.message : 'Offline: connect to the internet or try a built-in phrasebook sentence.');
  }
}

function offlinePhrasebook(text) {
  const normalized = text.trim().toLowerCase().replace(/[?.!]/g, '');
  const dictionary = {
    'hello': { th: 'สวัสดี', en: 'Hello' },
    'hello how are you': { th: 'สวัสดี คุณเป็นอย่างไรบ้าง', en: 'Hello, how are you?' },
    'thank you': { th: 'ขอบคุณ', en: 'Thank you' },
    'where is the bathroom': { th: 'ห้องน้ำอยู่ที่ไหน', en: 'Where is the bathroom?' },
    'how much is this': { th: 'อันนี้ราคาเท่าไหร่', en: 'How much is this?' },
    'i need help': { th: 'ฉันต้องการความช่วยเหลือ', en: 'I need help' },
  };
  return dictionary[normalized]?.[targetLanguage.value];
}

function speak(text) {
  if (!listenEnabled || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLanguage.value;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

async function startListening() {
  try {
    await ensureMicrophone();
    if (!SpeechRecognition) {
      setStatus('Microphone is active, but speech recognition is not supported in this browser. Try Chrome or Safari.');
      return;
    }
    recognition = buildRecognition();
    recognition.start();
    isRunning = true;
    startButton.textContent = 'Stop';
    startButton.classList.add('danger');
    connectionState.textContent = '1 device connected';
    setStatus('Listening now. Speak into the selected microphone.');
  } catch (error) {
    setStatus(`Could not start microphone: ${error.message}`);
  }
}

function stopListening(updateStatus = true) {
  isRunning = false;
  recognition?.stop();
  stopMicrophone();
  window.speechSynthesis?.cancel();
  startButton.textContent = 'Start';
  startButton.classList.remove('danger');
  if (updateStatus) setStatus('Stopped. Press Start to resume live translation.');
}

async function copyRoomLink() {
  const link = new URL(window.location.href);
  link.searchParams.set('room', roomIdElement.textContent);
  const text = link.toString();

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    setStatus('App link copied. You can save it, but one-iPhone mode does not require another device.');
    return;
  }

  window.prompt('Copy this app link:', text);
  setStatus('Copy the shown app link if you want to save it.');
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.info('Service worker registration skipped:', error);
  }
}

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = undefined;
    updateInstallUi();
    return;
  }

  if (isIos) {
    setStatus('iPhone install: tap Share → Add to Home Screen → Add, then open Babelfish from Home Screen.');
    return;
  }

  setStatus('If your browser supports installation, use its install button in the address bar/menu.');
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    modeButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

listenButton.addEventListener('click', () => {
  listenEnabled = !listenEnabled;
  listenButton.classList.toggle('active', listenEnabled);
  listenButton.textContent = listenEnabled ? 'Listen' : 'Muted';
  setStatus(listenEnabled ? 'Playback enabled.' : 'Playback muted.');
});

captureButton.addEventListener('click', async () => {
  await ensureMicrophone();
  setStatus('Microphone captured. Press Start to begin speech translation.');
});

startButton.addEventListener('click', () => {
  if (isRunning) stopListening();
  else startListening();
});

copyLinkButton.addEventListener('click', copyRoomLink);
installButton.addEventListener('click', installApp);
translateTypedButton.addEventListener('click', () => {
  const text = manualText.value.trim();
  if (!text) {
    setStatus('Type text first, then press Translate typed text.');
    return;
  }
  sourceTranscript.textContent = text;
  translateText(text);
});
refreshDevices.addEventListener('click', populateDevices);
sourceLanguage.addEventListener('change', () => {
  updateLanguageTitles();
  if (isRunning) {
    stopListening(false);
    startListening();
  }
});
targetLanguage.addEventListener('change', updateLanguageTitles);
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
  updateInstallUi();
});

roomIdElement.textContent = createRoomId();
updateDeviceHint();
updateInstallUi();
registerServiceWorker();
updateLanguageTitles();
populateDevices().catch(() => setStatus('Device list will appear after microphone permission is granted.'));
