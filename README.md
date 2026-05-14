# Web-trans

A browser-based one-device live translation app styled after the Babelfish Live reference screen and tuned for iPhone use as an installable web app.

## Run locally

```bash
npm install
npm run start
```

Open <http://localhost:5173>, allow microphone access, choose the speaking and target languages, then press **Start**.


## วิธีทำให้เป็นเว็บไซต์จริง

เว็บนี้เป็น static website/PWA จึง deploy ได้กับ hosting ที่รองรับไฟล์ HTML, CSS, JavaScript ธรรมดา โดยไม่ต้องมี backend server.

### 1. สร้างไฟล์สำหรับ deploy

```bash
npm install
npm run build
```

คำสั่งนี้จะสร้างโฟลเดอร์ `dist/` ที่รวมไฟล์เว็บทั้งหมดไว้แล้ว เช่น `index.html`, `src/`, `assets/`, `manifest.webmanifest` และ `sw.js`.

### 2. เลือก hosting

เลือกอย่างใดอย่างหนึ่ง:

- **Netlify**: ลากโฟลเดอร์ `dist/` ไปวางในหน้า Deploy ของ Netlify หรือเชื่อม Git repo แล้วตั้ง publish directory เป็น `dist`.
- **Vercel**: Import Git repo แล้วตั้ง build command เป็น `npm run build` และ output directory เป็น `dist`.
- **GitHub Pages**: รัน `npm run build` แล้วนำไฟล์ใน `dist/` ไป publish ผ่าน GitHub Pages หรือ GitHub Actions.
- **Static hosting อื่นๆ**: อัปโหลดไฟล์ทั้งหมดใน `dist/` ไปยัง public web root ของ hosting.

### 3. ต้องใช้ HTTPS

สำหรับ iPhone และ browser สมัยใหม่ การใช้ไมโครโฟนและ service worker ต้องเปิดผ่าน `https://` เท่านั้น ยกเว้นตอนทดสอบบน `localhost`. Hosting อย่าง Netlify, Vercel และ GitHub Pages จะมี HTTPS ให้อัตโนมัติ.

### 4. ทดสอบหลัง deploy

1. เปิด URL เว็บไซต์ที่เป็น `https://`.
2. ตรวจว่าหน้าเว็บโหลดได้ และไม่มี 404 สำหรับ `manifest.webmanifest`, `sw.js`, `/src/main.js`, `/src/styles.css`, และ `/assets/icon.svg`.
3. เปิดบน iPhone Safari แล้วทำตามขั้นตอน **Share → Add to Home Screen**.
4. เปิดจาก Home Screen, กด **Capture mic** หรือ **Start**, แล้วอนุญาตไมโครโฟน.
5. ถ้าแปลไม่ได้ ให้ตรวจอินเทอร์เน็ตและดูว่า hosting ไม่ได้บล็อก request ไปยัง MyMemory translation API.

## Use on iPhone as an app

1. Deploy or open the site from an HTTPS address. iPhone microphone access requires HTTPS unless you are on `localhost`.
2. In Safari, tap **Share** → **Add to Home Screen** → **Add**.
3. Open **Babelfish** from the Home Screen and use **One iPhone** mode. No second phone, computer, listener device, or room display is required.

## วิธีใช้งานแบบละเอียดบน iPhone

### 1. เตรียมเครื่องก่อนใช้งาน

- ใช้ iPhone ที่เปิด Safari ได้ และต่ออินเทอร์เน็ตไว้ถ้าต้องการแปลด้วยบริการแปลออนไลน์.
- เปิดเว็บจากลิงก์ที่เป็น `https://` เท่านั้น เพราะ iPhone จะอนุญาตให้เว็บใช้ไมโครโฟนได้เมื่อเป็น HTTPS หรือ `localhost`.
- ถ้าต้องการฟังเสียงแปลแบบส่วนตัว ให้เชื่อมต่อ AirPods หรือหูฟัง Bluetooth ก่อนเปิดแอพ.
- ถ้าต้องการให้ iPhone รับเสียงคนพูดรอบห้อง ให้วางเครื่องไว้ใกล้ผู้พูดหรือแหล่งเสียง และหลีกเลี่ยงลำโพงที่ดังมากเกินไปเพื่อลดเสียงสะท้อน.

### 2. ติดตั้งเป็นแอพบน Home Screen

1. เปิดเว็บใน Safari บน iPhone.
2. แตะปุ่ม **Share** ของ Safari.
3. เลือก **Add to Home Screen**.
4. ตั้งชื่อแอพ เช่น **Babelfish** แล้วแตะ **Add**.
5. กลับไปที่ Home Screen แล้วเปิดไอคอน **Babelfish** ที่เพิ่มไว้.
6. เมื่อเปิดจาก Home Screen แอพจะทำงานในโหมด standalone และหน้าเว็บจะแจ้งว่าใช้งานบน iPhone เครื่องนี้ได้โดยไม่ต้องพึ่งอุปกรณ์อื่น.

### 3. เลือกภาษาและอุปกรณ์เสียง

- ช่อง **Speak language** คือภาษาที่ผู้ใช้หรือคนรอบข้างกำลังพูด เช่น `English`.
- ช่อง **Translate to** คือภาษาปลายทางที่ต้องการให้แปล เช่น `Thai`.
- ช่อง **Microphone** เลือกไมโครโฟนที่ต้องการใช้ ถ้าไม่แน่ใจให้ใช้ค่า default.
- ช่อง **Audio output** เลือกลำโพงหรือหูฟังที่ต้องการให้เสียงแปลออก ถ้าใช้ AirPods ให้เชื่อมต่อ AirPods ใน iOS ก่อน แล้วกด **Refresh devices**.
- ปุ่ม **Refresh devices** ใช้รีเฟรชรายการไมค์/ลำโพงหลังจากเสียบหูฟังหรือเชื่อมต่อ Bluetooth.

### 4. เริ่มแปลเสียงสดแบบ One iPhone

1. แตะ **Capture mic** ถ้าต้องการให้แอพขอสิทธิ์ไมโครโฟนก่อน.
2. เมื่อ iPhone ถามสิทธิ์ไมโครโฟน ให้เลือก **Allow**.
3. แตะ **Start** เพื่อเริ่มฟังเสียง.
4. พูดใส่ไมโครโฟน หรือวาง iPhone ใกล้ผู้พูด.
5. ดูแถบ **Room input** เพื่อตรวจว่าแอพรับเสียงได้หรือไม่:
   - `quiet` หมายถึงเสียงเบาหรือไม่มีเสียงเข้า.
   - `listening` หมายถึงระดับเสียงเหมาะสม.
   - `loud` หมายถึงเสียงดังมาก อาจควรถอย iPhone ออกเล็กน้อย.
6. ข้อความที่ได้ยินจะแสดงในกล่องภาษาต้นทาง และคำแปลจะแสดงในกล่องภาษาปลายทาง.
7. ถ้าเปิด **Listen** ไว้ แอพจะอ่านคำแปลออกเสียงผ่านลำโพงหรือหูฟังของ iPhone.
8. แตะ **Stop** เมื่อต้องการหยุดฟังเสียง.

### 5. ใช้งานเมื่อ Speech Recognition ไม่พร้อม

บาง browser หรือบางเวอร์ชันของ iOS อาจไม่รองรับ Web Speech Recognition เต็มรูปแบบ. ถ้าแอพแจ้งว่า speech recognition ไม่พร้อม ให้ใช้วิธีนี้แทน:

1. เลือก **Speak language** และ **Translate to** ตามปกติ.
2. พิมพ์ข้อความที่ต้องการแปลในช่อง **Manual text fallback**.
3. แตะ **Translate typed text**.
4. แอพจะแสดงคำแปลและอ่านออกเสียงถ้าเปิด **Listen** ไว้.

### 6. ใช้งานแบบไม่พึ่งเครื่องอื่น

- โหมดนี้ออกแบบให้ iPhone เครื่องเดียวทำทั้งรับเสียง แปล แสดงข้อความ และเล่นเสียงแปล.
- ไม่จำเป็นต้องมีมือถืออีกเครื่องเข้าห้องเดียวกัน.
- ไม่จำเป็นต้องเปิดคอมพิวเตอร์หรือ server ส่วนตัวหลังจากเว็บถูก deploy แล้ว.
- ปุ่ม **Copy room link** มีไว้คัดลอกลิงก์เพื่อบันทึกหรือแชร์แอพเท่านั้น ไม่ใช่สิ่งจำเป็นสำหรับ One iPhone mode.

### 7. ข้อควรรู้และการแก้ปัญหา

- ถ้าไมค์ไม่ทำงาน ให้ตรวจว่าเปิดจาก HTTPS, อนุญาตไมโครโฟนแล้ว, และไม่ได้ปิด permission ใน Settings ของ Safari.
- ถ้าไม่มีเสียงอ่านคำแปล ให้ตรวจระดับเสียง iPhone, silent mode, AirPods/Bluetooth output และสถานะปุ่ม **Listen**.
- ถ้าแปลไม่ได้ ให้ตรวจอินเทอร์เน็ต เพราะการแปลหลักใช้ MyMemory public translation API.
- ถ้าออฟไลน์ แอพยังเปิดหน้าได้จาก cache และมี phrasebook fallback ขนาดเล็กสำหรับบางประโยคทั่วไป แต่ไม่ได้แปลทุกประโยคแบบออฟไลน์เต็มรูปแบบ.
- ถ้าเสียงสะท้อน ให้ใช้ AirPods สำหรับฟังเสียงแปล หรือวาง iPhone ให้ห่างจากลำโพง.

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
