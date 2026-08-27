/* ============================================================
   demo.js — กล่อง "ผลลัพธ์จริง" สำหรับบทเรียน HTML/CSS
   ใช้กับ: <script src="../../assets/demo.js" defer></script>

   ทำไมต้องมี
   ----------
   บทเรียน CSS ที่เห็นแต่โค้ดแล้วต้องจินตนาการเอาเอง คือบทเรียนที่พิสูจน์อะไรไม่ได้เลย
   กล่องนี้เอาโค้ดชุดเดียวกับที่โชว์ไปเรนเดอร์จริงให้ดูข้าง ๆ

   ทำไมต้องเป็น <iframe>
   ---------------------
   lesson.css ตั้งสไตล์ให้ p / a / ul / button / input ไว้หมดแล้ว
   ถ้าเรนเดอร์ตรง ๆ ในหน้า ตัวอย่างจะโดนสไตล์ของหน้าทับ → สอนผิดทันที
   iframe คือขอบเขตที่ CSS ข้ามไม่ได้จริง ๆ ตัวอย่างจึงเห็นผลของ CSS
   ที่เขียนในกล่องเท่านั้น ไม่มีอะไรอื่นเจือปน

   Markup contract
   ---------------
     <div class="demo" data-h="180">
       <template>
         <style> .box { color: red } </style>
         <div class="box">ข้อความ</div>
       </template>
     </div>

   - เนื้อในต้องอยู่ใน <template> เท่านั้น เบราว์เซอร์จึงไม่เรนเดอร์มันในหน้า
     และ CSS ข้างในไม่รั่วออกมาแม้ตอน JS ปิด
   - data-h = ความสูงเริ่มต้น (px) · ไม่ใส่ = 160 · ถ้าวัดของจริงได้จะปรับตาม
   - ปิด JS แล้วกล่องจะไม่โผล่เลย ซึ่งรับได้ เพราะบทเรียนโชว์โค้ดชุดเดียวกัน
     ไว้ในกล่อง <pre> ข้างบนอยู่แล้ว
   ============================================================ */

(function () {
  'use strict';

  var DEFAULT_H = 160;
  var MAX_H = 640;

  function build(host) {
    var tpl = host.querySelector('template');
    if (!tpl) return;

    var want = parseInt(host.getAttribute('data-h'), 10);
    if (!(want > 0)) want = DEFAULT_H;

    var frame = document.createElement('iframe');
    frame.className = 'demo-frame';
    frame.setAttribute('title', host.getAttribute('data-title') || 'ผลลัพธ์ของโค้ดข้างบน');
    frame.setAttribute('loading', 'lazy');
    /* allow-same-origin อย่างเดียว: อ่านความสูงของเนื้อในได้ แต่สคริปต์ในกล่องรันไม่ได้
       (ไม่ได้ให้ allow-scripts) — กล่องนี้มีไว้โชว์ HTML/CSS ไม่ใช่รันโค้ด */
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.style.height = want + 'px';

    /* srcdoc แทน src=about:blank + document.write เพราะ about:blank
       ใน Safari บางรุ่นได้ document ที่เขียนไม่ทันก่อน load */
    frame.srcdoc =
      '<!doctype html><html lang="th"><head><meta charset="utf-8">' +
      '<style>html,body{margin:0}body{padding:12px;' +
      'font-family:"IBM Plex Sans Thai","Noto Sans Thai",-apple-system,' +
      'BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:16px;line-height:1.6;' +
      'color:#1f2328;background:#ffffff}</style></head><body>' +
      tpl.innerHTML +
      '</body></html>';

    /* ⚠️ ต้องติด is-live ก่อน appendChild เสมอ
       เพราะ .demo:not(.is-live) เป็น display:none — ถ้าใส่ iframe ตอนแม่ยังซ่อนอยู่
       กล่องจะกว้าง 0 ตอน load แล้ววัดความสูงได้เป็นค่ามหาศาล (ข้อความพันบรรทัด) */
    host.classList.add('is-live');

    function fit() {
      /* กว้าง 0 = ยังไม่มี layout จริง (แท็บที่ซ่อนอยู่ · pane กว้าง 0 · print preview
         บางจังหวะ) ถ้าวัดตอนนี้ ข้อความบรรทัดเดียวจะถูกตัดเป็นร้อยบรรทัด
         แล้วกล่องจะยืดออกมาผิดรูปถาวร — รอให้มีความกว้างก่อนค่อยวัด */
      if (!frame.clientWidth) return;

      /* วัดความสูงจริงแล้วปรับตาม — ทำได้เพราะ srcdoc + allow-same-origin
         ถ้าเบราว์เซอร์ไม่ยอมให้อ่าน (throw) ก็ใช้ค่า data-h ที่ตั้งไว้ต่อไป */
      try {
        var doc = frame.contentDocument;
        if (!doc || !doc.body) return;
        /* ต้องวัดจาก <body> ไม่ใช่ <html> — <html> ยืดเต็มความสูง iframe เสมอ
           ค่าที่ได้จึงเท่ากับความสูงเดิมทุกครั้ง แล้วกล่องจะไม่มีวันหดลง */
        var h = Math.ceil(doc.body.scrollHeight) + 2;
        if (h > 0) frame.style.height = Math.min(h, MAX_H) + 'px';
      } catch (e) { /* ใช้ความสูงเริ่มต้นต่อไป */ }
    }

    frame.addEventListener('load', fit);
    host.appendChild(frame);
    fits.push(fit);

    /* ความกว้างของกล่องเปลี่ยนเมื่อไหร่ก็วัดใหม่ — ครอบคลุมทั้งกรณี
       "ตอน load ยังกว้าง 0" และกรณีผู้ใช้หมุนจอ · resize listener ข้างล่าง
       เป็นตาข่ายสำรองสำหรับเบราว์เซอร์ที่ไม่มี ResizeObserver */
    if (window.ResizeObserver) {
      var seen = 0;
      new ResizeObserver(function () {
        var w = frame.clientWidth;
        if (w && w !== seen) { seen = w; fit(); }
      }).observe(host);
    }
  }

  /* หมุนจอ/ย่อขยายหน้าต่างแล้วข้อความตัดบรรทัดใหม่ ความสูงเดิมจึงใช้ไม่ได้อีก */
  var fits = [];
  var timer = null;
  window.addEventListener('resize', function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { fits.forEach(function (f) { f(); }); }, 150);
  });

  Array.prototype.forEach.call(document.querySelectorAll('.demo'), build);
})();
