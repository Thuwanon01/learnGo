/* ============================================================
   Reusable interactive components for lessons.
   Link with: <script src="../assets/quiz.js" defer></script>

   Markup contracts
   ----------------
   Multiple choice (instant feedback):
     <div class="quiz" data-answer="2">
       <p class="q">question…</p>
       <div class="opts">
         <button class="opt">choice a</button>
         <button class="opt">choice b</button>
       </div>
       <div class="explain">why…</div>
     </div>
   data-answer is the 0-based index of the correct button.

   Predict-the-output (retrieval before reveal):
     <div class="predict">
       <pre>…code…</pre>
       <p class="ask">prompt…</p>
       <button class="reveal">เฉลย</button>
       <div class="answer">…</div>
     </div>

   ปุ่มเฉลยใช้ใน <div class="task"> ได้ด้วย (contract เดียวกัน:
   button.reveal + div.answer เป็นลูกของ card) — หนึ่งปุ่มต่อหนึ่ง card

   Score bar (optional, one per page):
     <div class="scorebar"><span class="count"></span>
       <span class="track"><span class="fill"></span></span>
       <span class="pct"></span></div>
   ============================================================ */

(function () {
  'use strict';

  var quizzes = Array.prototype.slice.call(document.querySelectorAll('.quiz'));
  var answered = 0;
  var correct = 0;

  var bar = document.querySelector('.scorebar');
  var elCount = bar && bar.querySelector('.count');
  var elFill = bar && bar.querySelector('.fill');
  var elPct = bar && bar.querySelector('.pct');

  function paintScore() {
    if (!bar) return;
    elCount.textContent = 'ตอบแล้ว ' + answered + '/' + quizzes.length;
    elFill.style.width = (quizzes.length ? (answered / quizzes.length) * 100 : 0) + '%';
    elPct.textContent = answered ? 'ถูก ' + correct + '/' + answered : 'ยังไม่เริ่ม';
  }

  quizzes.forEach(function (quiz) {
    var want = parseInt(quiz.getAttribute('data-answer'), 10);
    var opts = Array.prototype.slice.call(quiz.querySelectorAll('.opt'));

    opts.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        if (quiz.classList.contains('answered')) return;
        quiz.classList.add('answered');

        opts.forEach(function (b) { b.disabled = true; });
        opts[want].classList.add('correct');
        if (i !== want) btn.classList.add('incorrect');

        answered += 1;
        if (i === want) correct += 1;
        paintScore();
      });
    });
  });

  /* ปุ่มเฉลย — ใช้ได้ทั้งใน .predict และ .task (เฉลยท้ายภารกิจ)
     ผูกจากตัวปุ่มขึ้นไปหา card ที่ใกล้ที่สุด จึงรองรับหลายปุ่มใน card เดียวไม่ได้
     แต่รองรับ card ชนิดใหม่ได้ทันทีโดยไม่ต้องแก้ไฟล์นี้อีก */
  document.querySelectorAll('button.reveal').forEach(function (btn) {
    var card = btn.closest('.predict, .task');
    if (!card || !card.querySelector('.answer')) return;
    btn.addEventListener('click', function () { card.classList.add('open'); });
  });

  /* ============================================================
     ติ๊ก "ทำบทนี้เสร็จแล้ว" ท้ายบทเรียน
     เขียนลง localStorage คีย์เดียวกับ assets/progress.js ที่หน้าแรกใช้
     → ติ๊กที่นี่ แถบความคืบหน้าในหน้าแรกขยับตาม

     ⚠️ คีย์ 'go-course-progress-v1' ถูกใช้สองไฟล์ ถ้าจะเปลี่ยนต้องแก้ทั้งคู่

     ไม่ต้องใส่ markup อะไรในบทเรียน — ตัวนี้อ่านเลขบทจากชื่อไฟล์
     (0019-generics.html → "0019") แล้วแทรกการ์ดไว้เหนือ <nav class="nav">
     หน้าที่ชื่อไฟล์ไม่ได้ขึ้นต้นด้วยเลขสี่หลัก (เช่น cheatsheet) จะข้ามไปเฉย ๆ
     ============================================================ */
  (function markDone() {
    var KEY = 'go-course-progress-v1';
    var file = location.pathname.split('/').pop() || '';
    var id = (/^(\d{4})-/.exec(file) || [])[1];
    var nav = document.querySelector('.nav');
    if (!id || !nav) return;

    function read() {
      try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
      catch (e) { return {}; }
    }

    var home = nav.querySelector('a[href$="index.html"]');
    var card = document.createElement('div');
    card.className = 'done-card';
    card.innerHTML =
      '<label><input type="checkbox"><span>ทำบทเรียน ' + Number(id) + ' เสร็จแล้ว</span></label>' +
      '<a href="' + (home ? home.getAttribute('href') : '../../index.html') + '">' +
      'ความคืบหน้าทั้งหมด →</a>';

    var box = card.querySelector('input');
    box.checked = !!read()[id];
    card.classList.toggle('is-done', box.checked);

    box.addEventListener('change', function () {
      var state = read();
      if (box.checked) { state[id] = true; } else { delete state[id]; }
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { /* private mode — หน้ายังใช้ได้ แค่ไม่จำ */ }
      card.classList.toggle('is-done', box.checked);
    });

    nav.parentNode.insertBefore(card, nav);
  })();

  paintScore();
})();
