/* ============================================================
   Progress tracking for the course index.
   Remembers which lessons are done, in localStorage (per browser).

   Markup contract — one per lesson row:
     <li class="lesson" data-id="0001">
       <input type="checkbox" class="done">
       <a href="...">…</a>
     </li>

   Optional summary element:
     <span class="progress-summary"></span>
     <span class="progress-track"><span class="progress-fill"></span></span>

   Optional reset button:
     <button class="progress-reset">…</button>
   ============================================================ */

(function () {
  'use strict';

  var KEY = 'go-course-progress-v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* โหมด private หรือโควตาเต็ม — ปล่อยผ่าน หน้ายังใช้ได้ปกติ */
    }
  }

  var state = load();
  var rows = Array.prototype.slice.call(document.querySelectorAll('.lesson[data-id]'));

  var summary = document.querySelector('.progress-summary');
  var fill = document.querySelector('.progress-fill');

  /* ตัวนับแยกฝั่ง (FRONT / BACK) — ป้ายไหนมี data-progress-track="<ชื่อฝั่ง>"
     จะนับเฉพาะแถวที่ data-track ตรงกัน · ถ้าหน้าไหนไม่มีป้ายนี้ก็ไม่มีอะไรเกิดขึ้น */
  var trackBoxes = Array.prototype.slice.call(
    document.querySelectorAll('[data-progress-track]')
  ).map(function (box) {
    var name = box.getAttribute('data-progress-track');
    return {
      box: box,
      rows: rows.filter(function (r) { return r.getAttribute('data-track') === name; })
    };
  });

  function countDone(list) {
    return list.filter(function (r) { return state[r.getAttribute('data-id')]; }).length;
  }

  function paint() {
    var done = countDone(rows);

    rows.forEach(function (r) {
      r.classList.toggle('is-done', !!state[r.getAttribute('data-id')]);
    });

    if (summary) {
      summary.textContent = done + ' / ' + rows.length + ' บทเรียน';
    }
    if (fill) {
      fill.style.width = (rows.length ? (done / rows.length) * 100 : 0) + '%';
    }

    trackBoxes.forEach(function (t) {
      if (!t.rows.length) return;
      t.box.textContent = 'ทำแล้ว ' + countDone(t.rows) + ' / ' + t.rows.length + ' บท';
    });
  }

  rows.forEach(function (row) {
    var id = row.getAttribute('data-id');
    var box = row.querySelector('.done');
    if (!box) return;

    box.checked = !!state[id];
    box.setAttribute('aria-label', 'ทำเสร็จแล้ว');

    box.addEventListener('change', function () {
      if (box.checked) {
        state[id] = true;
      } else {
        delete state[id];
      }
      save(state);
      paint();
    });
  });

  var reset = document.querySelector('.progress-reset');
  if (reset) {
    reset.addEventListener('click', function () {
      state = {};
      save(state);
      rows.forEach(function (r) {
        var b = r.querySelector('.done');
        if (b) b.checked = false;
      });
      paint();
    });
  }

  paint();
})();
