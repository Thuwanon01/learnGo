/* ============================================================================
   nav.js — แถบนำทางของคอร์ส Go (site nav)
   ----------------------------------------------------------------------------
   ไฟล์นี้ทำงานคนเดียวจบในตัว 3 อย่าง คือ (1) เก็บข้อมูลว่าเว็บมีวันไหน บทอะไรบ้าง
   (2) ฉีด CSS ของตัวเองเข้า <head> และ (3) สร้าง DOM ของแถบนำทาง
   เหตุผลที่รวมไว้ไฟล์เดียว: ทุกหน้าจะได้เพิ่มแค่บรรทัดเดียว
       <script src=".../assets/nav.js" defer></script>
   แทนที่จะต้องเพิ่มทั้ง <link> และ <script> ในไฟล์ HTML ทั้ง 67 ไฟล์

   กติกาที่ยึดตลอดทั้งไฟล์ (สำคัญมาก อย่าเผลอแก้):
   - ชื่อคลาสทุกตัวขึ้นต้นด้วย "sn-" เพราะ lesson.css จองชื่อสามัญไว้เยอะมาก
     (.nav .lesson .label .meta .track ...) ถ้าชนแล้วสคริปต์เดิมจะทำงานผิด
     โดยเฉพาะ quiz.js ที่ใช้ document.querySelector('.nav') หา "แถบท้ายหน้า"
     ถ้าแถบบนของเราชื่อ .nav ด้วย กล่องติ๊ก "เรียนจบแล้ว" จะไปโผล่บนสุดของหน้า
   - สีทุกจุดใช้ CSS variable ของ lesson.css เท่านั้น จะได้ได้ dark mode
     และโหมดพิมพ์ฟรีโดยไม่ต้องเขียนเพิ่ม
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     ส่วนที่ 1 · DATA — โครงสร้างของคอร์ส
     เขียนตายตัวไว้ในไฟล์ เพราะเว็บนี้เป็น static ล้วน ไม่มี build step
     ที่จะไปไล่อ่านโฟลเดอร์ให้ตอน deploy ได้
     เวลาเพิ่มบทใหม่ ให้มาแก้ที่นี่ที่เดียว
     ====================================================================== */
  var DAYS = [
    { day: 1, sheet: true, lessons: [
      { n: '01', f: 'day-1/lessons/0001-anatomy-of-a-go-program.html', t: 'กายวิภาคของโปรแกรม Go' },
      { n: '02', f: 'day-1/lessons/0002-var-and-types.html', t: 'var, := และ type ที่ Go ไม่ยอมให้ผ่าน' }
    ]},
    { day: 2, sheet: true, lessons: [
      { n: '03', f: 'day-2/lessons/0003-const-and-iota.html', t: 'const และ iota: สร้าง enum แบบ Go' },
      { n: '04', f: 'day-2/lessons/0004-guard-clauses.html', t: 'Guard Clause: ฆ่า if ซ้อน 5 ชั้น' },
      { n: '05', f: 'day-2/lessons/0005-errors-and-shadowing.html', t: 'error pattern และกับดัก := ที่ทำให้ค่าหาย' }
    ]},
    { day: 3, sheet: true, lessons: [
      { n: '06', f: 'day-3/lessons/0006-slice-aliasing.html', t: 'append ไปทับข้อมูลคนอื่นได้ยังไง' },
      { n: '07', f: 'day-3/lessons/0007-value-vs-pointer.html', t: 'คุณกำลังแก้ของจริง หรือแก้ copy?' },
      { n: '08', f: 'day-3/lessons/0008-defer.html', t: 'defer: เปิดแล้วปิดให้ครบทุกทางออก' }
    ]},
    { day: 4, sheet: true, lessons: [
      { n: '09', f: 'day-4/lessons/0009-underlying-type.html', t: 'Underlying Type: สร้าง type ใหม่' },
      { n: '10', f: 'day-4/lessons/0010-interface-and-duck-typing.html', t: 'Interface: สัญญาที่ไม่ต้องเซ็นชื่อ' },
      { n: '11', f: 'day-4/lessons/0011-type-assertion-and-switch.html', t: 'any, Type Assertion และการดึงของจริงออกมา' },
      { n: '12', f: 'day-4/lessons/0012-error-architecture.html', t: 'Error Architecture: error คือข้อมูล' },
      { n: '13', f: 'day-4/lessons/0013-json-and-struct-tags.html', t: 'JSON และ Struct Tags: ทำไม password หลุด' }
    ]},
    { day: 5, sheet: true, lessons: [
      { n: '14', f: 'day-5/lessons/0014-test-in-go.html', t: 'Test in Go: กฎเกมที่ต้องรู้ก่อนเขียน' },
      { n: '15', f: 'day-5/lessons/0015-testing-t.html', t: 'testing.T: เครื่องมือทั้งหมดที่อยู่ใน t' },
      { n: '16', f: 'day-5/lessons/0016-table-driven-test.html', t: 'Table-Driven Test: เพิ่มเคสด้วยบรรทัดเดียว' },
      { n: '17', f: 'day-5/lessons/0017-testify.html', t: 'Testify: assert, require, mock, suite' },
      { n: '18', f: 'day-5/lessons/0018-tdd.html', t: 'TDD: Red, Green, Refactor' }
    ]},
    { day: 6, sheet: true, lessons: [
      { n: '19', f: 'day-6/lessons/0019-generics.html', t: 'Generics: เขียนครั้งเดียว ใช้ได้หลาย type' },
      { n: '20', f: 'day-6/lessons/0020-generic-struct.html', t: 'Generic Struct และเมื่อไหร่ที่ยังไม่ควรใช้' },
      { n: '21', f: 'day-6/lessons/0021-goroutine-waitgroup.html', t: 'Goroutine & WaitGroup: ทำหลายอย่างพร้อมกัน' },
      { n: '22', f: 'day-6/lessons/0022-channel.html', t: 'Channel: ท่อที่ทำให้ goroutine คุยกันได้' },
      { n: '23', f: 'day-6/lessons/0023-select.html', t: 'select: รอหลายทางพร้อมกัน' },
      { n: '24', f: 'day-6/lessons/0024-data-race-mutex.html', t: 'Data Race, Mutex และ Race Detector' },
      { n: '25', f: 'day-6/lessons/0025-context.html', t: 'Context: บอกให้ทุกคนหยุดพร้อมกัน' },
      { n: '26', f: 'day-6/lessons/0026-worker-pool.html', t: 'Worker Pool: จำกัดจำนวนคนทำงาน' },
      { n: '27', f: 'day-6/lessons/0027-project-layout-gorm.html', t: 'Project Layout และ GORM' }
    ]},
    { day: 7, sheet: true, lessons: [
      { n: '28', f: 'day-7/lessons/0028-mockery.html', t: 'Mockery: เลิกเขียน mock ด้วยมือ' },
      { n: '29', f: 'day-7/lessons/0029-integration-test.html', t: 'Integration test: ทำไม unit test ไม่พอ' },
      { n: '30', f: 'day-7/lessons/0030-testcontainers-suite.html', t: 'Testcontainers ใช้จริง: TestMain, suite' },
      { n: '31', f: 'day-7/lessons/0031-goose-migration.html', t: 'Goose: เปลี่ยน schema แบบย้อนกลับได้' },
      { n: '32', f: 'day-7/lessons/0032-redis-cache.html', t: 'Redis: cache ที่ไม่โกหก' }
    ]},
    { day: 8, sheet: true, lessons: [
      { n: '33', f: 'day-8/lessons/0033-rest-resource-method.html', t: 'REST: ทุกอย่างคือ resource' },
      { n: '34', f: 'day-8/lessons/0034-http-status-code.html', t: 'Status code: ตัวเลขที่บอกว่าใครผิด' },
      { n: '35', f: 'day-8/lessons/0035-query-body-header.html', t: 'query · body · header' },
      { n: '36', f: 'day-8/lessons/0036-rest-naming-idempotency.html', t: 'กฎตั้งชื่อ · versioning · idempotency' },
      { n: '37', f: 'day-8/lessons/0037-net-http-server.html', t: 'net/http: เซิร์ฟเวอร์ตัวแรก' },
      { n: '38', f: 'day-8/lessons/0038-gin-routing.html', t: 'Gin: router ที่อ่านออก และ Context' },
      { n: '39', f: 'day-8/lessons/0039-gin-binding-middleware.html', t: 'binding · validation · middleware · CORS' },
      { n: '40', f: 'day-8/lessons/0040-httptest-handler.html', t: 'httptest: ทดสอบ handler' },
      { n: '41', f: 'day-8/lessons/0041-swagger-swaggo.html', t: 'Swagger: เอกสารที่ไม่มีวันเก่ากว่าโค้ด' },
      { n: '42', f: 'day-8/lessons/0042-wongnok-api-spec.html', t: 'Wongnok: ออกแบบ API spec จากโจทย์จริง' },
      { n: '43', f: 'day-8/lessons/0043-api-detective-workshop.html', t: 'API Detective: ทบทวน REST · Code Review' },
      { n: '44', f: 'day-8/lessons/0044-env-config.html', t: 'Configuration & Environment Variables' }
    ]},
    { day: 9, sheet: true, lessons: [
      { n: '45', f: 'day-9/lessons/0045-caarlos0-env.html', t: 'caarlos0/env: ประกาศ config เป็น struct' },
      { n: '46', f: 'day-9/lessons/0046-dotenv-godotenv.html', t: '.env กับ godotenv: คนละหน้าที่' },
      { n: '47', f: 'day-9/lessons/0047-validate-at-start.html', t: 'ทำไมต้อง validate และทำไมต้องทำตอน start' },
      { n: '48', f: 'day-9/lessons/0048-internal-config.html', t: 'internal/config: ประกอบทุกอย่างเข้าด้วยกัน' },
      { n: '49', f: 'day-9/lessons/0049-basic-auth-jwt.html', t: 'จาก Basic Auth ถึง JWT' },
      { n: '50', f: 'day-9/lessons/0050-oauth2-authorization-code.html', t: 'OAuth 2.0 กับ Authorization Code Grant' },
      { n: '51', f: 'day-9/lessons/0051-keycloak.html', t: 'Keycloak: Authorization Server ที่รันเอง' },
      { n: '52', f: 'day-9/lessons/0052-auth-flow-endpoints.html', t: 'flow จริงของ Wongnok: /login /callback' },
      { n: '53', f: 'day-9/lessons/0053-keycloak-in-go.html', t: 'ต่อ Keycloak เข้ากับ Go จริง + migrate' },
      { n: '54', f: 'day-9/lessons/0054-agent-skills.html', t: 'ให้ AI agent เขียนโค้ดแทน' },
      { n: '55', f: 'day-9/lessons/0055-mid-exam-workshop.html', t: 'อ่านโจทย์สอบกลางภาคให้ขาด ก่อนลงมือเขียน' }
    ]}
  ];

  /* ------------------------------------------------------------------------
     ฝั่ง Frontend — สไลด์ของอาจารย์ไม่ได้กำกับวันที่มา จึงจัดกลุ่มตาม "ชื่อไฟล์สไลด์"
     ไม่ใช่ตามวันเหมือนฝั่ง Backend
     ---------------------------------------------------------------------- */
  var FRONT = [
    { key: 'fe-html-css', btn: 'HTML & CSS', where: 'HTML & CSS',
      sheetLabel: 'Cheat sheet HTML & CSS', d: 101, lessons: [
      { n: '56', f: 'fe-html-css/lessons/0056-how-the-web-works.html', t: 'เว็บทำงานยังไง — HTML, CSS, JS แบ่งหน้าที่กัน' },
      { n: '57', f: 'fe-html-css/lessons/0057-html-common-tags.html', t: 'แท็กที่ใช้จริงทุกวัน' },
      { n: '58', f: 'fe-html-css/lessons/0058-html-forms.html', t: 'ฟอร์ม: form, input, label, button' },
      { n: '59', f: 'fe-html-css/lessons/0059-css-selectors.html', t: 'CSS Selector: tag, class, id' },
      { n: '60', f: 'fe-html-css/lessons/0060-css-box-and-spacing.html', t: 'กล่องกับระยะห่าง: padding, margin, border' },
      { n: '61', f: 'fe-html-css/lessons/0061-css-flexbox.html', t: 'Flexbox: จัดของในกล่อง' },
      { n: '62', f: 'fe-html-css/lessons/0062-css-states.html', t: 'State: hover, focus, active, disabled' }
    ]},
    { key: 'fe-ts-fp', btn: 'TypeScript', where: 'TypeScript',
      sheetLabel: 'Cheat sheet TypeScript', d: 102, lessons: [
      { n: '63', f: 'fe-ts-fp/lessons/0063-typescript-core-types.html', t: 'TypeScript คืออะไร และ type พื้นฐาน' },
      { n: '64', f: 'fe-ts-fp/lessons/0064-interface-vs-type.html', t: 'interface กับ type + any ที่ฆ่า type safety' },
      { n: '65', f: 'fe-ts-fp/lessons/0065-typing-functions.html', t: 'ใส่ type ให้ฟังก์ชัน' },
      { n: '66', f: 'fe-ts-fp/lessons/0066-string-array-transform.html', t: 'แปลงข้อมูล: join, split, slice' },
      { n: '67', f: 'fe-ts-fp/lessons/0067-map-filter-reduce.html', t: 'map, filter, reduce' },
      { n: '68', f: 'fe-ts-fp/lessons/0068-fp-workshop.html', t: 'โจทย์ 4 ข้อจากสไลด์' }
    ]}
  ];

  /* ------------------------------------------------------------------------
     รวมสองฝั่งให้เป็นรูปทรงเดียวกัน แล้วโค้ดข้างล่างจะได้ไม่ต้องรู้ว่ามาจากไหน
     "group" = ปุ่มหนึ่งปุ่มบนแถบ (ฝั่ง Backend = หนึ่งวัน · ฝั่ง Frontend = หนึ่งสไลด์)
     ---------------------------------------------------------------------- */
  function group(o) {
    return {
      key: o.key, btn: o.btn, where: o.where, d: o.d,
      sheet: o.key + '/reference/cheatsheet.html',
      sheetLabel: o.sheetLabel,
      lessons: o.lessons,
      track: null            // เติมทีหลังตอนประกอบ TRACKS
    };
  }

  var TRACKS = [
    { id: 'back', label: 'BACK', title: 'ฝั่ง Backend — Go', groups: DAYS.map(function (d) {
        return group({ key: 'day-' + d.day, btn: 'Day ' + d.day, where: 'Day ' + d.day,
                       sheetLabel: 'Cheat sheet Day ' + d.day, d: d.day, lessons: d.lessons });
      }) },
    { id: 'front', label: 'FRONT', title: 'ฝั่ง Frontend — HTML, CSS, TypeScript',
      groups: FRONT.map(group) }
  ];

  TRACKS.forEach(function (t) { t.groups.forEach(function (g) { g.track = t; }); });

  /* ==========================================================================
     ส่วนที่ 2 · CSS — เขียนเป็น template string แล้วยัดเป็น <style> ลง <head>
     ----------------------------------------------------------------------
     ทำไมต้อง inject แทนที่จะแยกเป็นไฟล์ .css: จะได้ไม่ต้องไปเพิ่ม <link>
     ในไฟล์ HTML อีก 67 ไฟล์ และ <style> ที่ฉีดทีหลังจะอยู่ "ล่าง" lesson.css
     ใน <head> เสมอ ทำให้ชนะกฎที่ specificity เท่ากันโดยไม่ต้องพึ่ง !important

     เรื่องสีทั้งหมดอิง token ของ lesson.css: --bg --bg-soft --ink --ink-soft
     --rule --accent --accent-dk --font-text --font-code
     token ตัวเดียวที่เราประกาศเองคือ --sn-h (ความสูงจริงของแถบ) ซึ่งมี fallback
     เขียนไว้ทุกจุดที่ใช้ เผื่อ JS วัดค่าไม่ทัน
     ====================================================================== */
  var CSS = `
/* lesson.css ตั้ง body{padding:3rem 1.25rem 6rem} ทำให้แถบ sticky เริ่มต้นลอย
   ต่ำลงมา 3rem แล้วค่อย "เด้ง" ขึ้นไปติดขอบตอนเลื่อน ดูสะดุดตา
   จึงตัด padding-top ทิ้ง แล้วให้แถบเป็นคนเว้นระยะให้เนื้อหาแทน (margin-bottom) */
body { padding-top: 0; }

/* ตัวแถบเอง: ใช้ sticky ไม่ใช่ fixed เพราะ sticky ยังกินที่ใน layout
   จึงไม่ต้องไปชดเชย padding ให้ body ทุกหน้า (แต่ละหน้าความกว้างไม่เท่ากัน)
   margin ซ้ายขวา -1.25rem คือการ "ถอน" padding ของ body ออก เพื่อให้แถบเต็มจอ
   แล้วเติม padding คืนที่กล่องข้างใน — วิธีนี้ไม่ทำให้หน้าเลื่อนแนวนอน
   เพราะความกว้างสุทธิเท่าเดิม */
.sn-root {
  position: sticky;
  top: 0;
  /* lesson.css ทั้งไฟล์ไม่มี z-index เลยแม้แต่ตัวเดียว เลข 100 จึงชนะทุกอย่าง
     รวมถึง .scorebar ที่ sticky อยู่ "ขอบล่าง" (คนละขอบกัน ไม่ทับกันอยู่แล้ว) */
  z-index: 100;
  margin: 0 -1.25rem 2rem;
  background: var(--bg);
  color: var(--ink);
  border-bottom: 1px solid var(--rule);
  font-family: var(--font-text);
  font-size: 0.9rem;
  line-height: 1.4;
  -webkit-user-select: none;
  user-select: none;
}

/* กล่องข้างใน: จำกัดความกว้างด้วยค่าคงที่ของตัวเอง ไม่ใช้ var(--maxw)
   เพราะแต่ละหน้าตั้งไม่เท่ากัน (บทเรียน 46rem · index 52rem · cheatsheet 54rem) */
.sn-in {
  max-width: 60rem;
  margin-inline: auto;
  padding-inline: 1.25rem;
  position: relative;
}

/* ---------- ลิงก์ข้ามไปเนื้อหา (skip link) ----------
   แถบนี้มี focusable มากถึง ~17 จุดบนหน้าบทเรียน (🏠 · ☰ · 📓 · chip ทุกบท ·
   cheat sheet · ในบทนี้) ทั้งหมดอยู่ "ก่อน" เนื้อหา เพราะแถบถูกแทรกเป็น
   element แรกของ body ถ้าไม่มีทางลัด คนใช้คีย์บอร์ดต้องกด Tab สิบกว่าครั้ง
   ทุกหน้า กว่าจะถึงลิงก์แรกในบทเรียน
   ซ่อนแบบ visually-hidden (ไม่ใช่ display:none) เพื่อให้ยัง focus ได้ */
.sn-skip {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.sn-skip:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  clip-path: none;
  font: inherit;
  font-size: 0.82rem;
  color: var(--bg);
  background: var(--accent);
  text-decoration: none;
  border-radius: 7px;
  padding: 0.35rem 0.6rem;
  outline: 2px solid var(--accent-dk);
  outline-offset: 2px;
}

/* ---------- แถวบน: หน้าแรก | Day 1..9 | บันทึกการเรียนรู้ ---------- */
.sn-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.9rem;
}
.sn-days {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  flex: 1 1 auto;
  justify-content: center;
  min-width: 0;
}
.sn-item { position: relative; }

/* ปุ่มและลิงก์ในแถบ: ต้อง reset เองทั้งหมด เพราะ
   - lesson.css กฎ a{color:var(--accent-dk)} ทำให้ลิงก์เป็นสีม่วง+ขีดเส้นใต้
   - <button> ไม่มี font reset ทั่วไปในเว็บนี้ (มีแค่ button.reveal/.opt)
     ถ้าไม่ใส่ font:inherit จะกลายเป็นฟอนต์ระบบ 13px ไม่เข้ากับหน้าเลย */
.sn-btn,
.sn-home,
.sn-docs {
  font: inherit;
  font-size: 0.84rem;
  color: var(--ink);
  text-decoration: none;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  padding: 0.32rem 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: background .12s, border-color .12s, color .12s;
}
.sn-home { font-size: 1rem; padding: 0.28rem 0.45rem; }
.sn-btn:hover,
.sn-home:hover,
.sn-docs:hover { background: var(--bg-soft); border-color: var(--rule); color: var(--ink); }
.sn-btn:focus-visible,
.sn-home:focus-visible,
.sn-docs:focus-visible,
.sn-link:focus-visible,
.sn-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ปุ่มวันที่เมนูกางอยู่ กับหน้าที่กำลังเปิดอยู่ ให้เห็นชัดคนละแบบ:
   กางอยู่ = พื้นอ่อน · หน้าปัจจุบัน = ตัวหนา + ขีดใต้สี accent */
.sn-btn[aria-expanded="true"] { background: var(--bg-soft); border-color: var(--rule); }
.sn-btn.sn-on,
.sn-home[aria-current="page"],
.sn-docs[aria-current="page"] {
  color: var(--accent-dk);
  font-weight: 700;
  box-shadow: inset 0 -2px 0 var(--accent);
}

/* ---------- แผงเมนูที่กางออกมา ---------- */
.sn-panel {
  position: absolute;
  top: calc(100% + 0.3rem);
  left: 0;
  z-index: 10;
  min-width: 15rem;
  /* กันล้นจอแคบ: 2.5rem คือ padding ซ้ายขวาของ .sn-in รวมกัน */
  max-width: min(26rem, calc(100vw - 2.5rem));
  max-height: min(70vh, 30rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  /* ใช้ --bg (ไม่ใช่ --bg-soft) ให้แผงดูลอยเหนือแถบ และต้องทึบแสง
     ไม่งั้นตัวหนังสือของหน้าจะทะลุขึ้นมา */
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: 10px;
  padding: 0.35rem;
}
.sn-panel[hidden] { display: none; }

/* แต่ละบรรทัดในแผง — ใช้ <a> ตรง ๆ ไม่ใช้ <ul><li> เพราะ lesson.css
   ใส่ bullet + indent 1.4rem + margin ให้ ul/li ทุกตัวในหน้า */
.sn-link {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.32rem 0.45rem;
  border-radius: 6px;
  color: var(--ink);
  text-decoration: none;
  font-size: 0.84rem;
  line-height: 1.35;
}
.sn-link:hover { background: var(--bg-soft); color: var(--ink); }
.sn-link[aria-current="page"] { color: var(--accent-dk); font-weight: 700; }
.sn-num {
  font-family: var(--font-code);
  font-size: 0.72rem;
  color: var(--ink-soft);
  flex: 0 0 auto;
  min-width: 1.4rem;
}
.sn-link[aria-current="page"] .sn-num { color: var(--accent-dk); }
.sn-t { min-width: 0; }

/* cheat sheet เป็นของคนละชนิดกับ "บท" จึงคั่นเส้นและใช้ตัวเอียงกำกับ */
.sn-sheet {
  margin-top: 0.3rem;
  padding-top: 0.45rem;
  border-top: 1px solid var(--rule);
  color: var(--accent-dk);
  font-weight: 600;
}

/* ---------- แถวสอง: เฉพาะหน้าที่อยู่ใน day-N/ ---------- */
.sn-sub {
  background: var(--bg-soft);
  border-top: 1px solid var(--rule);
}
.sn-subin {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.5rem;
}
.sn-where {
  flex: 0 0 auto;
  font-size: 0.74rem;
  color: var(--ink-soft);
  white-space: nowrap;
  letter-spacing: 0.02em;
}
/* แถบ chip เลื่อนแนวนอนได้ "ในกล่องของตัวเอง" — หน้าเว็บจึงไม่เลื่อนตาม
   position:relative มีไว้เพื่อให้ chip ข้างในถือกล่องนี้เป็น offsetParent
   ตอนคำนวณ scrollLeft ท้ายไฟล์จะได้ไม่ไปนับ padding ของ .sn-in กับความกว้าง
   ป้าย "Day N" รวมเข้ามาด้วย (ถ้าไม่ใส่ chip ที่ active จะเยื้องออกจากกลาง) */
.sn-chips {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  gap: 0.3rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.35rem 0;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}
.sn-chip {
  flex: 0 0 auto;
  font: inherit;
  font-size: 0.78rem;
  text-decoration: none;
  color: var(--ink-soft);
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: 99px;
  padding: 0.16rem 0.6rem;
  white-space: nowrap;
  transition: background .12s, color .12s, border-color .12s;
}
.sn-chip:hover { color: var(--ink); border-color: var(--accent); }
/* บทที่กำลังเปิดอยู่: พื้น accent ตัวหนังสือสีพื้นหลังหน้า — คู่นี้ contrast ผ่าน
   ทั้งโหมดสว่าง (ม่วงเข้ม/ขาว) และโหมดมืด (ม่วงอ่อน/ดำ) */
.sn-chip[aria-current="page"] {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
  font-weight: 700;
}
.sn-chip.sn-chip-sheet { border-style: dashed; }

/* ---------- ปุ่มเมนูจอแคบ ---------- */
/* ---------- ตัวสลับฝั่ง BACK / FRONT ----------
   ทำเป็น segmented control (ปุ่มติดกันในกรอบเดียว) เพราะมันสื่อว่า
   "เลือกได้อันเดียว" โดยไม่ต้องเขียนอธิบาย ต่างจากปุ่มกลุ่มที่อยู่ถัดไป
   ซึ่งเป็นเมนูกางลง — ผู้ใช้จะได้ไม่สับสนว่าสองแถวนี้ทำงานคนละแบบ */
.sn-tracks {
  display: inline-flex;
  gap: 0.15rem;
  flex: 0 0 auto;
  padding: 0.12rem;
  border: 1px solid var(--rule);
  border-radius: 9px;
}
.sn-track {
  font-size: 0.73rem;
  font-weight: 650;
  letter-spacing: 0.06em;
  padding: 0.26rem 0.5rem;
}
/* ฝั่งที่เลือกอยู่ต้องดูต่างจากปุ่มกลุ่มที่ "หน้าปัจจุบัน" (.sn-btn.sn-on)
   ไม่งั้นบนแถบเดียวกันจะมีสองอย่างหน้าตาเหมือนกันแต่ความหมายคนละเรื่อง
   → ฝั่งที่เลือก = พื้นทึบ · หน้าปัจจุบัน = ขีดเส้นใต้ */
.sn-track.sn-on {
  background: var(--accent);
  border-color: transparent;
  color: #ffffff;
  box-shadow: none;
}
.sn-track.sn-on:hover { background: var(--accent-dk); color: #ffffff; border-color: transparent; }

/* .sn-daysgrp เป็นแค่ "ถุง" ที่ห่อปุ่มของฝั่งหนึ่งไว้ให้ซ่อนทั้งชุดได้
   display:contents ทำให้ปุ่มข้างในยังเป็นลูกของ .sn-days ในเชิง layout เหมือนเดิม
   ⚠️ ต้องเขียน [hidden] แยกด้วย เพราะ display:contents ทับกฎ display:none ของ UA */
.sn-daysgrp { display: contents; }
.sn-daysgrp[hidden] { display: none; }
.sn-mtrackgrp[hidden] { display: none; }

/* ตัวสลับฝั่งฉบับในเมนู ☰ — เต็มความกว้าง กดง่ายด้วยนิ้ว */
.sn-mtracks {
  display: flex;
  gap: 0.35rem;
  margin: 0 0 0.6rem;
  padding: 0;
  border: 0;
}
.sn-mtracks .sn-track {
  flex: 1 1 0;
  justify-content: center;
  min-height: 2.5rem;
  font-size: 0.8rem;
  border: 1px solid var(--rule);
}

.sn-burger { display: none; }
/* ปุ่ม ☰ ต้องเป็น position:static (ไม่เหมือน .sn-item ตัวอื่น) เพื่อ "สละสิทธิ์"
   การเป็นกล่องอ้างอิงของแผงที่กางออกมา แผงจะได้ไปยึดกับ .sn-in ที่กว้างเต็มแถบแทน
   ถ้าไม่ทำ แผงจะกว้างเท่าปุ่ม ☰ (ราว 54px) แล้วตัวหนังสือจะหักบรรทัดทีละคำ */
.sn-item.sn-burger { position: static; }
.sn-mpanel {
  left: 1.25rem;
  right: 1.25rem;
  min-width: 0;
  max-width: none;
}
.sn-mday {
  width: 100%;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  text-align: left;
  color: var(--ink);
  background: transparent;
  border: 0;
  border-radius: 6px;
  padding: 0.4rem 0.45rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sn-mday:hover { background: var(--bg-soft); }
.sn-mday:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.sn-mday .sn-caret { color: var(--ink-soft); font-size: 0.7rem; }
.sn-mgroup[hidden] { display: none; }
.sn-mgroup { padding-left: 0.6rem; border-left: 2px solid var(--rule); margin: 0 0 0.4rem 0.5rem; }

/* เส้นแบ่งอยู่ที่ 1100px ไม่ใช่ 768px เพราะแถบบนต้องใส่ให้ครบสี่อย่าง:
   🏠 + ตัวสลับฝั่ง (~110px) + ปุ่มกลุ่มของฝั่ง BACK 9 ปุ่ม (~700px) + ช่องค้นหา (12rem)
   รวมแล้วเกิน 960px ที่จอ 1000px มีให้ → ต่ำกว่า 1100px จึงยุบเป็นปุ่ม ☰ ทั้งหมด
   (ค่านี้ต้องตรงกับ MQ_NARROW ในโค้ดช่องค้นหา ไม่งั้น 🔍 กับ ☰ จะโผล่คนละจังหวะ) */
@media (max-width: 1099px) {
  .sn-days { display: none; }
  .sn-tracks { display: none; }
  .sn-burger { display: inline-flex; }
}

@media (max-width: 767px) {
  .sn-bar { gap: 0.3rem; }
  .sn-root { font-size: 0.86rem; }

  /* ป้ายบอกกลุ่ม (เช่น "Day 6" / "HTML & CSS") ห้ามซ่อน — ต่ำกว่า 1100px
     ปุ่มกลุ่มบนแถบถูกยุบเข้าเมนู ☰ ไปแล้ว ถ้าซ่อนป้ายนี้ด้วยจะไม่เหลืออะไร
     บอกเลยว่ากำลังอยู่กลุ่มไหน แค่ย่อขนาดก็พอ
     (flex:0 0 auto + .sn-chips ที่ min-width:0 ทำให้ป้ายไม่ดันหน้าให้ล้นแนวนอน) */
  .sn-where { font-size: 0.68rem; letter-spacing: 0; }

  /* ---- ขยายพื้นที่กดให้พอสำหรับนิ้ว (ค่าฐานบน desktop ยังเท่าเดิม) ----
     เกณฑ์ที่ใช้: chip อย่างน้อย 40px · รายการในเมนูอย่างน้อย 44px
     ใช้ min-height + align-items:center แทนการเพิ่ม padding ล้วน ๆ
     เพราะ padding อย่างเดียวไม่การันตีความสูงเมื่อฟอนต์ถูกย่อ */
  .sn-chips { gap: 0.5rem; }
  .sn-chip {
    display: inline-flex;
    align-items: center;
    min-height: 2.5rem;
    padding: 0.3rem 0.8rem;
  }
  /* แถวสองต้องสูงพอให้ chip 40px + padding บนล่างของแถบ chip ไม่ถูกบีบ */
  .sn-subin { min-height: 3.25rem; }
  .sn-link {
    align-items: center;
    min-height: 2.75rem;
    padding: 0.5rem 0.5rem;
  }
  .sn-mday { min-height: 2.75rem; padding: 0.5rem 0.5rem; }
  .sn-btn, .sn-home, .sn-docs { min-height: 2.75rem; }
}

/* ==========================================================================
   ช่องค้นหา
   --------------------------------------------------------------------------
   โครง DOM ตั้งใจให้เหมือน .sn-burger ทุกประการ เพราะเจอปัญหาเดียวกัน คือ
   "กล่องที่กางออกมาต้องกว้างกว่าปุ่มที่กดมัน" วิธีแก้จึงใช้ท่าเดิม:
   ให้ตัวห่อ (.sn-search) สละสิทธิ์เป็นกล่องอ้างอิงตอนจอแคบ (position:static)
   กล่องข้างในจะได้ไปยึด .sn-in ที่กว้างเต็มแถบแทน

   สองโหมด แบ่งที่ 1000px (ไม่ใช่ 767px เหมือนที่อื่นในไฟล์นี้ — เหตุผลอยู่ที่
   ความกว้างที่เหลือจริง ซึ่งวัดจากเบราว์เซอร์มาแล้วที่จอ 768px:
   ปุ่ม Day 1..9 กิน 576px + 🏠 32 + 📓 69 + ช่องไฟ 19 = 696 จาก 728px ที่ใช้ได้
   เหลือ 32px พอดีกับปุ่ม 🔍 เท่านั้น ถ้ายัด input ที่ใช้งานได้จริง (>=150px) ลงไป
   แถบจะล้นแล้วหน้าเลื่อนแนวนอนได้ ซึ่งเป็นบั๊กที่เว็บนี้เคยแก้ไปแล้ว ห้ามทำให้กลับมา)
     >= 1000px  ช่องค้นหาโผล่เป็น input ในแถวบนเลย ปุ่ม 🔍 ถูกซ่อน
     <  1000px  เหลือปุ่ม 🔍 กดแล้วกล่องกางลงมาเต็มความกว้างแถบ
   ========================================================================== */
.sn-search {
  position: relative;
  /* ตั้ง flex-basis เป็นค่าคงที่ (ไม่ใช่ auto) เพราะถ้าเป็น auto ความกว้างจะเท่ากับ
     ขนาดธรรมชาติของ <input> ซึ่งเบราว์เซอร์คิดจาก attribute size (ราว 158px)
     แคบเกินกว่าจะอ่าน placeholder จบ · วัดที่ 1000px แล้วแถวบนเหลือที่ว่างราว 66px
     ที่ .sn-days กินไปเปล่า ๆ (มันมี flex-grow:1) จึงขอมา 34px พอให้ช่องกว้าง 12rem
     โดยที่ปุ่ม Day 1..9 ยังได้ความกว้างธรรมชาติของมันครบ ไม่ถูกบีบ */
  flex: 0 1 12rem;
  min-width: 0;
  display: flex;
  align-items: center;
}
.sn-sbtn { display: none; }            /* จอกว้างไม่ต้องมีปุ่ม เพราะช่องโผล่อยู่แล้ว */
/* การซ่อน/แสดงกล่องนี้ให้ CSS ตัดสินคนเดียว ไม่ใช้ attribute hidden ที่ JS สั่ง
   เพราะ "จอกว้างต้องเห็นช่องเสมอ" เป็นกฎของ layout ไม่ใช่ของสถานะ ถ้าให้ JS ถือ
   สถานะนี้ไว้ แล้ววันไหน event resize ไม่มา (เจอจริงตอนทดสอบกับ viewport จำลอง)
   ช่องค้นหาจะหายไปทั้งช่องโดยไม่มีอะไรเตือน — ปล่อยให้ media query ชี้ขาดปลอดภัยกว่า */
.sn-sbox { display: block; position: relative; flex: 1 1 auto; min-width: 0; }

.sn-sinput {
  font: inherit;
  font-size: 0.82rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;              /* กัน padding ดันความกว้างจนล้นแถว */
  color: var(--ink);
  background: var(--bg-soft);
  border: 1px solid var(--rule);
  border-radius: 7px;
  padding: 0.34rem 0.3rem 0.34rem 1.4rem;   /* เว้นที่ซ้ายให้ไอคอน 🔍 */
  -webkit-appearance: none;
  appearance: none;
}
/* ย่อ placeholder ลงกว่าตัวที่พิมพ์เล็กน้อย: .sn-in ถูกล็อกที่ 60rem ช่องนี้จึงกว้าง
   192px ตายตัวไม่ว่าจอจะกว้างแค่ไหน เหลือที่ให้ตัวหนังสือ 163px · วัดด้วย canvas
   ด้วยฟอนต์จริงแล้ว "ค้นศัพท์ · หัวข้อ · บทเรียน" กว้าง 135px ที่ 0.82rem
   ย่อเป็น 0.78rem เหลือ 128px = เผื่อไว้ 35px สำหรับเครื่องที่ไม่มีฟอนต์ชุดนี้
   แล้วต้องตกไปใช้ฟอนต์สำรองซึ่งกว้างกว่า */
.sn-sinput::placeholder { color: var(--ink-soft); opacity: 1; font-size: 0.78rem; }
.sn-sinput:focus { outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); }
/* ไอคอนเป็นของตกแต่งล้วน ๆ — pointer-events:none เพื่อให้กดตรงไอคอนแล้วโฟกัสลงช่อง */
.sn-sicon {
  position: absolute;
  left: 0.45rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  color: var(--ink-soft);
  pointer-events: none;
}

/* แผงผลลัพธ์ — absolute ทั้งก้อน จึงไม่ดันเนื้อหาให้ขยับ (ไม่มี layout shift) */
.sn-spanel {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  width: 30rem;
  max-width: calc(100vw - 2.5rem);
  z-index: 12;                          /* สูงกว่า .sn-panel (10) เผื่อซ้อนกัน */
  max-height: min(70vh, 27rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: 10px;
  padding: 0.3rem;
}
.sn-spanel[hidden] { display: none; }

/* หนึ่งผลลัพธ์ = <a> ตรง ๆ เหมือน .sn-link (เหตุผลเดียวกัน: lesson.css ใส่ bullet
   ให้ ul/li ทุกตัวในหน้า) แต่ของเราสูงสามบรรทัด จึงเป็น block ไม่ใช่ flex */
.sn-sres {
  display: block;
  padding: 0.4rem 0.5rem;
  border-radius: 7px;
  color: var(--ink);
  text-decoration: none;
}
.sn-sres:hover { background: var(--bg-soft); color: var(--ink); }
/* รายการที่เลือกด้วย ↑↓ — ต้องต่างจาก :hover ให้เห็นชัด เพราะบนเดสก์ท็อป
   เมาส์อาจค้างอยู่บนอีกรายการหนึ่งพร้อมกัน */
.sn-sres.sn-sel { background: var(--bg-soft); box-shadow: inset 0 0 0 1px var(--accent); }
.sn-shead { display: flex; gap: 0.4rem; align-items: baseline; }
.sn-stext { font-size: 0.86rem; font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
.sn-sres.sn-k-c .sn-stext { font-family: var(--font-code); font-size: 0.8rem; font-weight: 500; }
.sn-skind {
  flex: 0 0 auto;
  font-size: 0.66rem;
  color: var(--ink-soft);
  border: 1px solid var(--rule);
  border-radius: 99px;
  padding: 0 0.35rem;
  white-space: nowrap;
}
/* บรรทัด "อยู่บทไหน" ตัดท้ายด้วย … แทนการขึ้นบรรทัดใหม่ เพื่อให้ทุกแถวสูงเท่ากัน */
.sn-smeta {
  font-size: 0.72rem;
  color: var(--ink-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sn-ssnip {
  font-size: 0.74rem;
  color: var(--ink-soft);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* <mark> ของเบราว์เซอร์เป็นพื้นเหลืองตัวหนังสือดำตายตัว ซึ่งอ่านไม่ออกในโหมดมืด
   จึงล้างพื้นทิ้งแล้วเน้นด้วยสี accent + ตัวหนาแทน */
.sn-sres mark { background: transparent; color: var(--accent-dk); font-weight: 800; }

/* overflow-wrap: anywhere จำเป็นทั้งสามอัน — ข้อความ "ไม่พบ ..." เอาคำที่ผู้ใช้พิมพ์
   มาต่อท้าย ถ้าเขา paste error string ยาว ๆ ที่ไม่มีช่องว่างเลย (เช่น
   dial tcp [::1]:5432: connect: connection refused) บรรทัดนี้จะดันแผงกว้างเกินจอ
   แล้วต้องเลื่อนแผงไปทางขวาเพื่ออ่านข้อความที่บอกว่าหาไม่เจอ */
.sn-snote { font-size: 0.78rem; color: var(--ink-soft); padding: 0.45rem 0.5rem; overflow-wrap: anywhere; }
.sn-shint { font-size: 0.74rem; color: var(--ink-soft); padding: 0 0.5rem 0.45rem; overflow-wrap: anywhere; }
.sn-shint[hidden], .sn-snote[hidden], .sn-smore[hidden], .sn-sretry[hidden] { display: none; }
.sn-smore {
  font-size: 0.72rem;
  color: var(--ink-soft);
  padding: 0.4rem 0.5rem 0.2rem;
  border-top: 1px solid var(--rule);
  margin-top: 0.25rem;
  overflow-wrap: anywhere;
}
/* ที่ประกาศผลให้ screen reader อ่านอย่างเดียว — ไม่กินที่บนจอ
   ต้องไม่ใช้ display:none / visibility:hidden เพราะสองอันนั้น screen reader ข้าม */
.sn-slive {
  position: absolute;
  width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.sn-sretry {
  font: inherit;
  font-size: 0.76rem;
  margin: 0 0.5rem 0.4rem;
  color: var(--ink);
  background: var(--bg-soft);
  border: 1px solid var(--rule);
  border-radius: 7px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}
.sn-sretry:hover { border-color: var(--accent); }
.sn-sretry:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

@media (max-width: 1099px) {
  .sn-sbtn { display: inline-flex; }
  /* สละสิทธิ์การเป็นกล่องอ้างอิง เพื่อให้ .sn-sbox ไปยึด .sn-in แทน (ท่าเดียวกับ ☰)
     และคืน flex-basis เป็น auto ด้วย ไม่งั้นปุ่ม 🔍 จะจองที่ไว้ 12rem ทั้งที่กว้างจริง 32px */
  .sn-search { position: static; flex: 0 0 auto; }
  .sn-sbox {
    display: none;                     /* จอแคบ: ซ่อนจนกว่าจะกด 🔍 (JS เติม .sn-open) */
    position: absolute;
    top: calc(100% + 0.3rem);
    left: 1.25rem;
    right: 1.25rem;                    /* ซ้าย/ขวาเท่ากับ padding ของ .sn-in พอดี */
    flex: none;
    z-index: 12;
    /* กล่องนี้ลอยทับแถวสอง (แถบ chip) จึงต้องมีพื้นทึบของตัวเอง และ padding ล่าง
       ทำหน้าที่เป็น "ช่องไฟ" ระหว่างช่องพิมพ์กับแผงผลลัพธ์ — ถ้าใช้ระยะห่างจริง
       จะเห็น chip ของหน้าโผล่แลบมาเป็นเส้นบาง ๆ ตรงกลาง ดูเหมือนวาดพลาด */
    background: var(--bg);
    padding-bottom: 0.35rem;
  }
  .sn-sbox.sn-open { display: block; }
  .sn-spanel { top: 100%; left: 0; right: 0; width: auto; max-width: none; }
  /* 16px คือเส้นแบ่งที่ iOS Safari ใช้ตัดสินว่าจะ "ซูมหน้าเข้า" ตอนโฟกัส input หรือไม่
     ถ้าปล่อยให้เล็กกว่านี้ หน้าจะถูกซูมแล้วเลื่อนแนวนอนได้ทันที ซึ่งผิดข้อห้ามของเว็บนี้ */
  .sn-sinput { font-size: 16px; padding-top: 0.5rem; padding-bottom: 0.5rem; }
}

@media (max-width: 767px) {
  /* พื้นที่กดขั้นต่ำ 44px เท่ากับที่ตั้งไว้ให้ chip และรายการในเมนู */
  .sn-sres { min-height: 2.75rem; }
  .sn-sbtn { min-height: 2.75rem; }
}

/* ---------- แก้ปัญหาหัวข้อโดนแถบบัง เวลากระโดดด้วย #anchor ----------
   --sn-h คือความสูงจริงของแถบ วัดด้วย JS แล้วเขียนลง :root
   ใช้ scroll-margin-top อย่างเดียว ห้ามใส่ scroll-padding-top ที่ html เพิ่ม
   เพราะสองค่านี้ "บวกกัน" จะเว้นที่ว่างเป็นสองเท่า (ทดสอบแล้วได้ 200px แทน 100px) */
h1[id], h2[id], h3[id], h4[id], [id]:target {
  scroll-margin-top: calc(var(--sn-h, 3.3rem) + 0.75rem);
}

/* ---------- โหมดพิมพ์ ----------
   หน้า cheat sheet ออกแบบมาให้พิมพ์ลงกระดาษ แถบนำทางไม่ควรติดไปด้วย
   ใช้ !important เพราะต้องชนะกฎ display อื่น ๆ ที่อาจมาทีหลัง
   และคืน padding-top ให้ body ตามเดิม (lesson.css โหมดพิมพ์ตั้ง padding:0 อยู่แล้ว) */
@media print {
  .sn-root { display: none !important; }
  body { padding-top: 0; }
}

/* เคารพคนที่ตั้งค่าลดการเคลื่อนไหว */
@media (prefers-reduced-motion: reduce) {
  .sn-btn, .sn-home, .sn-docs, .sn-chip, .sn-link { transition: none; }
}
`;

  /* ==========================================================================
     ส่วนที่ 3 · helper — หา "รากเว็บ" ให้เจอ
     ----------------------------------------------------------------------
     ห้ามเดาความลึกจาก location.pathname เด็ดขาด เพราะ Vercel เสิร์ฟ 404.html
     ให้ทุก URL ที่ไม่มีไฟล์จริง โดยไม่เปลี่ยน address bar
     เข้า /day-6/lessons/พิมพ์ผิด.html จะได้เนื้อหา 404 แต่ pathname ยังลึก 2 ชั้น
     → คำนวณ ../.. ผิดทันที ลิงก์ตายทั้งแถบ

     วิธีที่ถูกทุกกรณีคือถอดจาก URL ของ <script> ตัวเอง เพราะไม่ว่าหน้าไหนจะเขียน
     src เป็น "assets/nav.js" หรือ "../../assets/nav.js" หรือ "/assets/nav.js"
     เบราว์เซอร์ resolve ให้เป็น absolute URL เดียวกันหมดใน property .src
     ====================================================================== */
  function findBase() {
    // document.currentScript ใช้ได้กับ classic script ทุกแบบ รวมทั้งที่มี defer/async
    // (เป็น null เฉพาะ ES module กับตอนถูกเรียกจาก callback เช่น setTimeout/event)
    // ไฟล์นี้อ่านค่าตอนรัน IIFE ระดับบนสุดของ classic script จึงได้ค่าเสมอ
    // ลูปข้างล่างเป็นแค่ตาข่ายกันพลาด เผื่อวันหลังเปลี่ยนไปโหลดแบบ type="module"
    var el = document.currentScript;
    if (!el || !el.src) {
      var list = document.getElementsByTagName('script');
      for (var i = list.length - 1; i >= 0; i--) {
        if (/assets\/nav\.js(\?|#|$)/.test(list[i].src)) { el = list[i]; break; }
      }
    }
    if (el && el.src) return el.src.replace(/assets\/nav\.js(\?|#).*$/, 'assets/nav.js').replace(/assets\/nav\.js$/, '');

    // ทางสำรองสุดท้าย: อิงจาก lesson.css ที่ทุกหน้าต้องมี
    var link = document.querySelector('link[rel="stylesheet"]');
    if (link && link.href && link.href.indexOf('assets/lesson.css') !== -1) {
      return link.href.replace(/assets\/lesson\.css.*$/, '');
    }
    return '/';
  }

  var BASE = findBase();

  function url(rel) { return BASE + rel; }

  /* URL ของหน้าปัจจุบัน ตัด ?query กับ #hash ทิ้ง เพื่อเอาไปเทียบว่าอยู่บทไหน
     เคสพิเศษ: เข้าเว็บด้วย https://host/ เฉย ๆ เบราว์เซอร์เสิร์ฟ index.html
     แต่ URL ไม่มีคำว่า index.html จึงต้องเติมให้เอง ปุ่มหน้าแรกจะได้ขึ้น active */
  function here() {
    var h = location.href.split('#')[0].split('?')[0];
    if (h.charAt(h.length - 1) === '/') h += 'index.html';
    return h;
  }

  var HERE = here();

  function isHere(rel) { return url(rel) === HERE; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ==========================================================================
     ส่วนที่ 4 · สร้าง DOM
     ====================================================================== */

  /* หาว่าตอนนี้อยู่วันไหน บทไหน — โดย "เทียบ URL" ไม่ใช่แกะ path
     เหตุผลเดียวกับ findBase(): หน้า 404 ที่ถูกเสิร์ฟจาก path ปลอมจะได้ไม่หลงคิดว่า
     ตัวเองเป็นบทเรียน (เทียบไม่ตรงสักอัน → ไม่มีแถวสอง ซึ่งถูกต้อง) */
  function locate() {
    for (var t = 0; t < TRACKS.length; t++) {
      var gs = TRACKS[t].groups;
      for (var i = 0; i < gs.length; i++) {
        var g = gs[i];
        for (var j = 0; j < g.lessons.length; j++) {
          if (isHere(g.lessons[j].f)) return { track: TRACKS[t], group: g, lesson: g.lessons[j] };
        }
        if (isHere(g.sheet)) return { track: TRACKS[t], group: g, lesson: null, sheet: true };
      }
    }
    return null;
  }

  var WHERE = locate();

  /* แผงรายการบทของหนึ่งกลุ่ม ใช้ทั้งเมนูจอกว้างและเมนูจอแคบ */
  function dayList(g) {
    var box = document.createDocumentFragment();
    g.lessons.forEach(function (ls) {
      var a = el('a', 'sn-link');
      a.href = url(ls.f);
      a.appendChild(el('span', 'sn-num', ls.n));
      a.appendChild(el('span', 'sn-t', ls.t));
      if (isHere(ls.f)) a.setAttribute('aria-current', 'page');
      box.appendChild(a);
    });
    var sh = el('a', 'sn-link sn-sheet');
    sh.href = url(g.sheet);
    sh.appendChild(el('span', 'sn-num', '📄'));
    sh.appendChild(el('span', 'sn-t', g.sheetLabel));
    if (isHere(g.sheet)) sh.setAttribute('aria-current', 'page');
    box.appendChild(sh);
    return box;
  }

  var toggles = [];   // เก็บคู่ {btn, panel} ไว้เพื่อ "เปิดได้ทีละเมนู"
  var seq = 0;        // ตัวนับไว้แจก id ให้แผง เพื่อผูก aria-controls กลับมาที่ปุ่ม

  /* ผูกปุ่มกับแผงให้ครบตามแพตเทิร์น "disclosure"
     ตั้งใจ "ไม่ใส่" aria-haspopup: ค่า true มีความหมายเท่ากับ "menu" ซึ่งจะทำให้
     screen reader ประกาศว่าเป็นเมนูแล้วผู้ใช้คาดหวังการกดลูกศรเลือกรายการ
     แต่ข้างในเป็นลิงก์ธรรมดาที่ต้องกด Tab ไล่ — aria-expanded อย่างเดียวสื่อได้ตรงกว่า
     ส่วน role="group" ใส่ให้แผงเพราะ <div> เปล่า ๆ มี role เป็น generic ซึ่งตามสเปก
     ARIA ห้ามมีชื่อ (accessible name) — aria-label ที่ใส่ไว้จะถูกทิ้งเงียบ ๆ */
  function makeToggle(btn, panel, groupLabel) {
    btn.type = 'button';
    if (!panel.id) panel.id = 'sn-panel-' + (++seq);
    panel.setAttribute('role', 'group');
    if (groupLabel) panel.setAttribute('aria-label', groupLabel);
    btn.setAttribute('aria-controls', panel.id);
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    var pair = { btn: btn, panel: panel };
    toggles.push(pair);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!open) openOne(pair);
    });
    return pair;
  }

  function openOne(pair) {
    pair.btn.setAttribute('aria-expanded', 'true');
    pair.panel.hidden = false;
    // จัดให้แผงไม่ล้นขอบขวาจอ (ปุ่ม Day 9 อยู่ริมขวาสุด)
    pair.panel.style.left = '';
    pair.panel.style.right = '';
    if (!pair.panel.classList.contains('sn-mpanel')) {
      var r = pair.panel.getBoundingClientRect();
      if (r.right > document.documentElement.clientWidth - 8) {
        pair.panel.style.left = 'auto';
        pair.panel.style.right = '0';
      }
    }
  }

  /* ปิดเฉพาะเมนูแบบ disclosure (ปุ่มวัน · ☰ · ในบทนี้) */
  function closeMenus() {
    toggles.forEach(function (p) {
      p.btn.setAttribute('aria-expanded', 'false');
      p.panel.hidden = true;
    });
  }

  /* ช่องค้นหาไม่ได้อยู่ในระบบ toggles เพราะมันมีสองโหมด (จอกว้างไม่มีปุ่มให้กด
     แปลว่าไม่มี aria-expanded ให้ closeMenus จับ) จึงต้องแขวนฟังก์ชันปิดไว้ตรงนี้
     ค่าเป็น null จนกว่าส่วนที่ 4.5 จะสร้างช่องค้นหาเสร็จ — ระหว่างนั้นเรียกแล้วไม่พัง */
  var closeSearchBox = null;

  function closeAll() {
    closeMenus();
    if (closeSearchBox) closeSearchBox();
  }

  var root = el('nav', 'sn-root');
  root.id = 'sn-root';
  root.setAttribute('aria-label', 'เมนูหลักของคอร์ส');

  var inTop = el('div', 'sn-in');
  var bar = el('div', 'sn-bar');
  inTop.appendChild(bar);
  root.appendChild(inTop);

  /* -- ทางลัดข้ามแถบไปเนื้อหา (โผล่เฉพาะตอนถูก focus ด้วยคีย์บอร์ด) --
     ใส่เป็นตัวแรกสุดของแถบ เพื่อให้เป็น focusable ตัวแรกของทั้งหน้า
     ถ้าหน้าไหนไม่มี <main> ก็ไม่ต้องมีลิงก์นี้ (404/บทเรียน/cheatsheet มีครบ) */
  var mainEl = document.querySelector('main');
  if (mainEl) {
    if (!mainEl.id) mainEl.id = 'sn-main';
    // เบราว์เซอร์บางตัวย้ายแค่ scroll แต่ไม่ย้าย focus เวลากระโดด #anchor
    // ไปยัง element ที่ focus ไม่ได้ — tabindex="-1" แก้เคสนั้นโดยไม่เพิ่มลำดับ Tab
    if (!mainEl.hasAttribute('tabindex')) mainEl.setAttribute('tabindex', '-1');
    var skip = el('a', 'sn-skip', 'ข้ามไปเนื้อหา');
    skip.href = '#' + mainEl.id;
    bar.appendChild(skip);
  }

  /* -- ซ้าย: กลับหน้าแรก -- */
  var home = el('a', 'sn-home', '🏠');
  home.href = url('index.html');
  home.title = 'สารบัญบทเรียนทั้งหมด';
  home.setAttribute('aria-label', 'สารบัญบทเรียนทั้งหมด');
  if (isHere('index.html')) home.setAttribute('aria-current', 'page');
  bar.appendChild(home);

  /* ==========================================================================
     -- กลาง: สลับฝั่ง BACK / FRONT แล้วค่อยเลือกกลุ่ม --

     ทำไมสร้างแถวของ "ทั้งสองฝั่ง" ไว้พร้อมกันแล้วซ่อนอันที่ไม่ได้ใช้
     แทนที่จะสร้างใหม่ทุกครั้งที่กดสลับ: เพราะ makeToggle() ลงทะเบียนคู่
     {btn, panel} ไว้ในอาเรย์ toggles เพื่อบังคับ "เปิดได้ทีละเมนู"
     ถ้ารื้อ DOM ทิ้งแล้วสร้างใหม่ อาเรย์นั้นจะเหลือ node ที่หลุดจากหน้าไปแล้ว
     ค่าใช้จ่ายของการสร้างทิ้งไว้คือปุ่มไม่กี่สิบปุ่ม ซึ่งถูกกว่าบั๊กแบบนั้นมาก
     ====================================================================== */

  var TRACK_KEY = 'go-course-track-v1';

  /* อยู่หน้าไหนก็ใช้ฝั่งนั้น · ถ้าไม่ได้อยู่หน้าบทเรียน (index/docs/404)
     ค่อยใช้ฝั่งที่เลือกไว้ล่าสุด · ถ้ายังไม่เคยเลือกเลย เริ่มที่ BACK */
  function initialTrack() {
    if (WHERE) return WHERE.track;
    try {
      var saved = localStorage.getItem(TRACK_KEY);
      for (var i = 0; i < TRACKS.length; i++) {
        if (TRACKS[i].id === saved) return TRACKS[i];
      }
    } catch (e) { /* private mode — ใช้ค่าเริ่มต้น */ }
    return TRACKS[0];
  }

  var ACTIVE = initialTrack();
  var trackBtns = [];    // {t, btn}
  var trackPanes = [];   // {t, wide, narrow}

  function paintTrack() {
    trackBtns.forEach(function (p) {
      var on = p.t === ACTIVE;
      p.btn.classList.toggle('sn-on', on);
      p.btn.setAttribute('aria-pressed', String(on));
    });
    trackPanes.forEach(function (p) {
      p.wide.hidden = p.t !== ACTIVE;
      p.narrow.hidden = p.t !== ACTIVE;
    });
  }

  function switchTrack(t) {
    ACTIVE = t;
    try { localStorage.setItem(TRACK_KEY, t.id); } catch (e) { /* ไม่จำก็ยังใช้ได้ */ }
    closeMenus();
    paintTrack();
  }

  /* ปุ่มสลับฝั่ง — สร้างสองชุด (แถบบนจอกว้าง / ในเมนู ☰ จอแคบ) ใช้ state เดียวกัน */
  function trackSwitch(cls) {
    var box = el('div', cls);
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'เลือกฝั่งที่จะเรียน');
    TRACKS.forEach(function (t) {
      var b = el('button', 'sn-btn sn-track', t.label);
      b.type = 'button';
      b.title = t.title;
      b.addEventListener('click', function () { switchTrack(t); });
      trackBtns.push({ t: t, btn: b });
      box.appendChild(b);
    });
    return box;
  }

  bar.appendChild(trackSwitch('sn-tracks'));

  /* -- จอกว้าง: ปุ่มของแต่ละกลุ่ม พร้อม dropdown -- */
  var days = el('div', 'sn-days');
  var wideOf = {};
  TRACKS.forEach(function (t) {
    var wrap = el('div', 'sn-daysgrp');
    t.groups.forEach(function (g) {
      var item = el('div', 'sn-item');
      var btn = el('button', 'sn-btn', g.btn);
      var panel = el('div', 'sn-panel');
      panel.appendChild(dayList(g));
      if (WHERE && WHERE.group === g) btn.classList.add('sn-on');
      makeToggle(btn, panel, 'บทเรียน ' + g.where);
      item.appendChild(btn);
      item.appendChild(panel);
      wrap.appendChild(item);
    });
    wideOf[t.id] = wrap;
    days.appendChild(wrap);
  });
  bar.appendChild(days);

  /* -- จอแคบ: ปุ่มเดียว กางออกมาเป็นรายการกลุ่มแบบพับได้ -- */
  var mItem = el('div', 'sn-item sn-burger');
  var mBtn = el('button', 'sn-btn', '☰ เมนู');
  var mPanel = el('div', 'sn-panel sn-mpanel');
  mPanel.appendChild(trackSwitch('sn-mtracks'));
  TRACKS.forEach(function (t) {
    var wrap = el('div', 'sn-mtrackgrp');
    t.groups.forEach(function (g) {
      var head = el('button', 'sn-mday');
      head.type = 'button';
      head.appendChild(el('span', null, g.btn + ' · ' + g.lessons.length + ' บท'));
      var caret = el('span', 'sn-caret', '▾');
      head.appendChild(caret);
      var box = el('div', 'sn-mgroup');
      box.id = 'sn-mgroup-' + g.key;
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', 'บทเรียน ' + g.where);
      box.appendChild(dayList(g));
      // กลุ่มที่กำลังเรียนอยู่ ให้กางไว้ตั้งแต่แรก จะได้ไม่ต้องกดซ้ำ
      var openNow = !!(WHERE && WHERE.group === g);
      box.hidden = !openNow;
      head.setAttribute('aria-controls', box.id);
      head.setAttribute('aria-expanded', String(openNow));
      caret.textContent = openNow ? '▴' : '▾';
      head.addEventListener('click', function () {
        var isOpen = !box.hidden;
        box.hidden = isOpen;
        head.setAttribute('aria-expanded', String(!isOpen));
        caret.textContent = isOpen ? '▾' : '▴';
      });
      wrap.appendChild(head);
      wrap.appendChild(box);
    });
    trackPanes.push({ t: t, wide: wideOf[t.id], narrow: wrap });
    mPanel.appendChild(wrap);
  });
  makeToggle(mBtn, mPanel, 'เลือกฝั่ง กลุ่ม และบทเรียน');
  mItem.appendChild(mBtn);
  mItem.appendChild(mPanel);
  bar.appendChild(mItem);

  paintTrack();

  /* ==========================================================================
     ส่วนที่ 4.5 · ช่องค้นหา — ศัพท์ · หัวข้อ · บทเรียน · โค้ด
     --------------------------------------------------------------------------
     วางไว้ "ท้ายแถวบน ก่อนปุ่ม 📓 บันทึก" ด้วยเหตุผลสามข้อ
     1. แถวบนเป็นแถวเดียวที่มีอยู่ครบทั้ง 67 หน้า (แถวสองโผล่เฉพาะหน้าใน day-N)
        ของที่ต้องใช้ได้ทุกหน้าจึงต้องอยู่แถวนี้
     2. ต่อท้าย .sn-days ทำให้ปุ่ม Day 1..9 ที่คนคุ้นมืออยู่แล้วไม่ต้องขยับที่
        (.sn-days เป็น flex:1 จัดกลาง มันจะเบียดเข้ามาเองพอดี)
     3. แผงผลลัพธ์กว้าง 30rem กางลงมาชิดขวา ซึ่งเป็นฝั่งที่ว่างที่สุดของแถบ
        และเป็นคนละฝั่งกับ dropdown ของปุ่มวัน จึงไม่บังกัน

     ข้อมูลมาจาก assets/search-index.json ที่ tools/build-search-index.py สร้าง
     **โหลดตอนโฟกัสช่องครั้งแรกเท่านั้น** เพราะไฟล์ราว 400 KB แต่ nav.js ถูกโหลด
     ทั้ง 67 หน้าโดยที่คนส่วนใหญ่ไม่ได้ค้นหา — ถ้าโหลดพร้อมหน้าคือจ่ายฟรีทุกครั้ง
     ====================================================================== */

  var KIND_TH    = { t: 'ศัพท์', h: 'หัวข้อ', l: 'บทเรียน', c: 'โค้ด' };

  /* ---- ชั้นคะแนน ----
     ห่างกันชั้นละ 1000 ซึ่งมากกว่าผลรวมของ bonus ทุกตัว (สูงสุด 630) เสมอ
     ผลที่ "ตรงกว่า" จึงมาก่อนเสมอ ไม่มีทางถูก bonus ดันแซงข้ามชั้น
     ชั้น SUB (โผล่กลางคำ) ตัดทิ้งไม่ได้เด็ดขาด เพราะภาษาไทยไม่มีช่องว่างระหว่างคำ
     คำว่า "งาน" ไม่เคยขึ้นต้นคำไหนเลยในคลังนี้ ถ้าเอาออกจะได้ 0 รายการ
     ชั้น SNIP คือ "ไปเจอในคำอธิบาย ไม่ใช่ในชื่อ" — ใส่เข้ามาเพราะชื่อในคลังเป็น
     อังกฤษ 87% แต่คำอธิบายเป็นไทยครบทุกตัว คนไทยที่ยังไม่รู้ศัพท์อังกฤษจึงค้นไม่เจอ
     ของที่ระบบมีอยู่ในมือ (ค้น "ยิงซ้ำ" ควรได้ idempotent) · ไม่เปลืองไฟล์เพิ่มเลย
     เพราะคำอธิบายถูกดาวน์โหลดมาอยู่แล้วแต่เดิมเอาไว้แสดงผลอย่างเดียว */
  var TIER_EXACT = 5000;   // ทั้งชื่อตรงกับที่พิมพ์เป๊ะ
  var TIER_KEY   = 4000;   // ชื่อขึ้นต้นด้วยที่พิมพ์
  var TIER_TOKEN = 3000;   // คำใดคำหนึ่งในชื่อขึ้นต้นด้วยที่พิมพ์
  var TIER_SUB   = 2000;   // ที่พิมพ์โผล่กลางชื่อ
  var TIER_SNIP  = 1000;   // ที่พิมพ์โผล่ในคำอธิบาย (ไม่ได้อยู่ในชื่อเลย)

  /* ศัพท์ใน <dt> คือของที่คัดมาแล้วพร้อมคำอธิบาย จึงมีค่ากับผู้เรียนมากกว่า
     code token ที่ scrape มาจาก <code> — และ "ชื่อบท" คือปลายทางที่ถูกที่สุด
     เมื่อคนพิมพ์ชื่อเรื่องที่อยากเรียน
     ระยะห่างระหว่างชนิดตั้งไว้ 160 ซึ่ง **มากกว่า** ผลรวมของ bonus ที่เหลือ
     (coverage 100 + freq 20 + day 30 = 150) เพื่อให้ภายในชั้นเดียวกัน
     ศัพท์ชนะโค้ดเสมอไม่ว่าชื่อจะยาวแค่ไหน — เดิมห่างกันแค่ 30 ขณะที่ coverage
     สวิงได้ 0-99 ผลคือ token สั้น ๆ อย่าง jwt.io แซงศัพท์ JWT (JSON Web Token) */
  var KIND_BONUS = { t: 480, l: 320, h: 160, c: 0 };
  var MAX_SHOW   = 8;     // เรนเดอร์เกินนี้ไม่ได้ช่วยใคร มีแต่ทำให้แผงยาวจนหาไม่เจอ
  var MIN_QUERY  = 2;     // ต่ำกว่านี้ผลลัพธ์ท่วมจอ (พิมพ์ "e" ตัวเดียวโดน 65% ของคลัง)

  /* ---- normalize: ต้องตรงกับ norm() ใน tools/build-search-index.py เป๊ะ ----
     1. ตัวพิมพ์เล็ก
     2. ทิ้งทุกอักขระที่ไม่ใช่ [0-9a-z] และไม่ใช่อักษรไทย (จุด ขีด วงเล็บ สแลช
        โคลอน ช่องว่าง ...) → "errors.Is" · "errors is" · "errorsis" กลายเป็นก้อนเดียวกัน
     3. ทิ้งวรรณยุกต์ ไม้ไต่คู้ ทัณฑฆาต (U+0E47-U+0E4C) → "เก็บ" กับ "เกบ" หากันเจอ
        **ห้ามเลยไปตัดสระบน/สระล่าง** เพราะจะทำให้ "ขั้น" กับ "ขึ้น" ยุบเป็นคำเดียวกัน */
  var RE_DROP = /[^0-9a-z฀-๿]+/g;
  var RE_TONE = /[็-์]/g;
  function norm(s) {
    return String(s).toLowerCase().replace(RE_DROP, '').replace(RE_TONE, '');
  }

  /* แตกเป็นคำย่อย ไว้ให้คะแนน "ขึ้นต้นคำใดคำหนึ่ง" — คนพิมพ์ waitgroup ต้องเจอ
     sync.WaitGroup ทั้งที่ไม่ได้ขึ้นต้นด้วยคำนั้น */
  var RE_SPLIT = /[^0-9a-zA-Z฀-๿]+/;
  function tokensOf(s) {
    var parts = String(s).split(RE_SPLIT), out = [], i, t;
    for (i = 0; i < parts.length; i++) { t = norm(parts[i]); if (t) out.push(t); }
    return out;
  }

  /* normMap: normalize พร้อมจดว่าอักขระตัวที่ i ของผลลัพธ์ มาจากตัวที่เท่าไรของต้นฉบับ
     ใช้เฉพาะตอนไฮไลต์ (แค่ 8 แถว) เพราะแพงกว่า norm() ปกติ
     ที่ต้องมีแผนที่: ผู้ใช้พิมพ์ "errors is" แต่บนจอต้องขีดเส้นใต้ "errors.Is" ของจริง
     จะรู้ว่าเริ่มตรงไหนจบตรงไหนได้ ต้องแปลงตำแหน่งกลับ
     ทำ toLowerCase ทีละตัว ไม่ใช่ทั้งก้อน เพราะบางภาษาตัวเล็กยาวไม่เท่าตัวใหญ่
     (เช่น 'İ' → 2 ตัว) ซึ่งจะทำให้แผนที่เลื่อนทั้งแถว */
  var RE_KEEP1 = /[0-9a-z฀-ๆํ-๿]/;
  function normMap(s) {
    var out = '', map = [], i, j, lc, ch;
    for (i = 0; i < s.length; i++) {
      lc = s.charAt(i).toLowerCase();
      for (j = 0; j < lc.length; j++) {
        ch = lc.charAt(j);
        if (!RE_KEEP1.test(ch)) continue;
        out += ch;
        map.push(i);
      }
    }
    return { n: out, map: map };
  }

  /* ถอดรหัส anchor ที่ builder บีบให้เป็นตัวเลขเพื่อประหยัดขนาดไฟล์
     บวก = id ของ <h2> · ลบ = id ของ <h3> · 0 = ไม่มี ให้ไปหัวไฟล์ · สตริง = id ตรงตัว */
  function anchorOf(a) {
    if (!a) return '';
    if (typeof a === 'number') return a > 0 ? 'sn-sec-' + a : 'sn-sub-' + (-a);
    return String(a);
  }

  var PAGES = [];
  var ENTRIES = [];
  var HEAD_AT = {};             // "pageIdx#anchor" -> ข้อความหัวข้อที่อยู่ตรงนั้น
  var idxState = 'idle';        // idle → loading → ready | error
  var CUR_DAY = WHERE ? WHERE.group.d : 0;

  /* แปลง index ดิบให้พร้อมค้น: คิด normalized key ไว้ล่วงหน้าครั้งเดียว
     (ไฟล์ไม่ได้เก็บ key มาให้ เพราะเก็บแล้วไฟล์บวมกว่า 100 KB ขณะที่คิดเองใช้ไม่กี่ ms) */
  function buildEntries(data) {
    PAGES = (data && data.p) || [];
    var src = (data && data.e) || [];
    var out = [], i, j, e, loc, pg, key, an, dayHit, o;
    HEAD_AT = {};
    for (i = 0; i < src.length; i++) {
      e = src[i];
      loc = e.l && e.l[0];
      if (!loc) continue;
      pg = PAGES[loc[0]];
      if (!pg) continue;                       // ที่อยู่เพี้ยน = ลิงก์ตาย ทิ้งไปเลย
      key = norm(e.t);
      if (key.length < MIN_QUERY) continue;    // สั้นกว่า gate = ไม่มีวันถูกค้นเจอ
      an = anchorOf(loc[1]);

      /* "อยู่วันเดียวกับหน้าที่กำลังเปิดไหม" ต้องดูที่อยู่ **ทุกแห่ง** ไม่ใช่แห่งหลัก
         ไฟล์เก็บมาให้ถึง 3 แห่ง คำหนึ่งคำอาจถูกสอนคนละวันกับที่มันถูกนิยามครั้งแรก */
      dayHit = false;
      for (j = 0; j < e.l.length; j++) {
        o = PAGES[e.l[j][0]];
        if (o && o.d === CUR_DAY) { dayHit = true; break; }
      }

      o = {
        t: e.t,
        k: KIND_TH[e.k] ? e.k : 'h',
        s: e.s || '',
        /* c = จำนวน "บท" ที่พบคำนี้ (ไฟล์ v2) ไม่ใช่จำนวนครั้ง */
        c: e.c || 1,
        key: key,
        /* normalize คำอธิบายเก็บไว้ล่วงหน้า เพื่อให้ค้นภาษาไทยได้จากคำอธิบายด้วย
           (ทั้งคลังมี 617 ตัวที่มีคำอธิบาย รวมกันไม่ถึง 70 KB ในหน่วยความจำ) */
        sk: e.s ? norm(e.s) : '',
        tk: tokensOf(e.t),
        pi: loc[0],
        an: an,
        pg: pg,
        dayHit: dayHit,
        href: url(pg.f) + (an ? '#' + an : '')
      };
      out.push(o);

      /* แผนที่ "หัวข้อไหนอยู่ที่ anchor ไหน" — ใช้เติมบริบทให้แถวชนิดโค้ด
         ซึ่งมีแต่ชื่อ token เปล่า ๆ ไม่มีคำอธิบาย (แถวโค้ดขึ้นอันดับ 1 บ่อยมาก) */
      if (o.k === 'h') {
        for (j = 0; j < e.l.length; j++) {
          key = e.l[j][0] + '#' + anchorOf(e.l[j][1]);
          if (!HEAD_AT[key]) HEAD_AT[key] = e.t;
        }
      }
    }
    ENTRIES = out;
  }

  /* ---- ให้คะแนน ----
     base คือแกนหลัก ช่วงห่างระหว่างชั้นตั้งไว้กว้าง (200) เพื่อให้ bonus ทุกตัวรวมกัน
     ยังพลิกลำดับข้ามชั้นไม่ได้ — ผลที่ "ตรงกว่า" ต้องมาก่อนเสมอ
     ชั้น 200 (โผล่กลางคำ) ตัดทิ้งไม่ได้เด็ดขาด เพราะภาษาไทยไม่มีช่องว่างระหว่างคำ
     คำว่า "งาน" ไม่เคยขึ้นต้นคำไหนเลยในคลังนี้ ถ้าเอาออกจะได้ 0 รายการ */
  function scoreOf(e, qn) {
    var base = 0, i;
    if (e.key === qn) base = TIER_EXACT;
    else if (e.key.lastIndexOf(qn, 0) === 0) base = TIER_KEY;
    else {
      for (i = 0; i < e.tk.length; i++) {
        if (e.tk[i].lastIndexOf(qn, 0) === 0) { base = TIER_TOKEN; break; }
      }
      if (!base && e.key.indexOf(qn) !== -1) base = TIER_SUB;
      if (!base && e.sk && e.sk.indexOf(qn) !== -1) base = TIER_SNIP;
    }
    if (!base) return 0;
    return base
      + KIND_BONUS[e.k]
      /* coverage: พิมพ์ "nil" แล้วต้องได้ "nil" ก่อน "nil pointer dereference" */
      + Math.floor(100 * qn.length / e.key.length)
      /* คำที่โผล่หลายบท = แนวคิดหลักของคอร์ส ควรมาก่อน (เพดาน 20 กันเฟ้อ) */
      + Math.min(20, (e.c - 1) * 4)
      /* อยู่วันเดียวกับหน้าที่กำลังเปิด = มีโอกาสเป็นสิ่งที่กำลังหาสูงกว่า
         ตั้งไว้ 30 ซึ่งเล็กกว่าช่วงห่างของชั้น จึงแค่ตัดสินตอนคะแนนใกล้กัน */
      + (e.dayHit ? 30 : 0);
  }

  /* คืนชั้นของคะแนน — bonus รวมกันไม่เกิน 630 ชั้นห่างกัน 1000 จึงหารเอาได้ตรง ๆ */
  function tierOf(score) { return Math.floor(score / 1000) * 1000; }

  function runSearch(qn) {
    var hits = [], i, sc;
    for (i = 0; i < ENTRIES.length; i++) {
      sc = scoreOf(ENTRIES[i], qn);
      if (sc) hits.push({ e: ENTRIES[i], sc: sc });
    }
    hits.sort(function (a, b) {
      if (b.sc !== a.sc) return b.sc - a.sc;
      if (a.e.key.length !== b.e.key.length) return a.e.key.length - b.e.key.length;
      return a.e.pi - b.e.pi;            // เท่ากันจริง ๆ ให้เรียงตามลำดับบท
    });
    return hits;
  }

  /* ---- DOM ของช่องค้นหา ---- */
  var searchItem = el('div', 'sn-item sn-search');
  var sBtn = el('button', 'sn-btn sn-sbtn', '🔍');
  sBtn.type = 'button';
  sBtn.title = 'ค้นหาในคอร์ส';
  sBtn.setAttribute('aria-label', 'ค้นหาในคอร์ส');
  sBtn.setAttribute('aria-expanded', 'false');

  var sBox = el('div', 'sn-sbox');
  sBox.id = 'sn-sbox';
  sBtn.setAttribute('aria-controls', sBox.id);

  var sIcon = el('span', 'sn-sicon', '🔍');
  sIcon.setAttribute('aria-hidden', 'true');

  var sInput = document.createElement('input');
  sInput.type = 'search';
  sInput.className = 'sn-sinput';
  sInput.placeholder = 'ค้นศัพท์ · หัวข้อ · บทเรียน';
  sInput.setAttribute('aria-label', 'ค้นหาศัพท์ หัวข้อ บทเรียน และโค้ดในคอร์สนี้');
  sInput.autocomplete = 'off';
  sInput.spellcheck = false;
  sInput.setAttribute('autocorrect', 'off');
  sInput.setAttribute('autocapitalize', 'off');
  sInput.setAttribute('enterkeyhint', 'go');
  /* combobox = "ช่องพิมพ์ที่มีรายการแนะนำผูกอยู่" ซึ่งตรงกับของจริงที่สุด
     รายการแนะนำต้องอยู่ใน element ที่มี role="listbox" แยกจากข้อความสถานะ
     (ลูกของ listbox ต้องเป็น option เท่านั้น ข้อความอื่นแทรกไม่ได้ตามสเปก) */
  sInput.setAttribute('role', 'combobox');
  sInput.setAttribute('aria-autocomplete', 'list');
  sInput.setAttribute('aria-expanded', 'false');

  var sPanel = el('div', 'sn-spanel');
  sPanel.hidden = true;
  var sNote = el('div', 'sn-snote');
  /* ตัวประกาศผลให้ screen reader แยกออกมาต่างหาก ไม่ผูกกับ sNote ที่มองเห็น
     เหตุผล: sNote ถูกซ่อน (hidden) ทุกครั้งที่ "ค้นเจอ" ซึ่งเป็นกรณีที่ผู้ใช้ต้องรู้ที่สุด
     ผลคือเดิมประกาศเฉพาะตอนหาไม่เจอ พอเจอ 8 รายการกลับเงียบสนิท */
  var sLive = el('div', 'sn-slive');
  sLive.setAttribute('role', 'status');
  sLive.setAttribute('aria-live', 'polite');
  var sHint = el('div', 'sn-shint');
  sHint.hidden = true;
  var sRetry = el('button', 'sn-sretry', 'ลองโหลดอีกครั้ง');
  sRetry.type = 'button';
  sRetry.hidden = true;
  var sList = el('div', 'sn-slist');
  sList.id = 'sn-slist';
  sList.setAttribute('role', 'listbox');
  sList.setAttribute('aria-label', 'ผลการค้นหา');
  var sMore = el('div', 'sn-smore');
  sMore.hidden = true;
  sPanel.appendChild(sLive);
  sPanel.appendChild(sNote);
  sPanel.appendChild(sHint);
  sPanel.appendChild(sRetry);
  sPanel.appendChild(sList);
  sPanel.appendChild(sMore);
  sInput.setAttribute('aria-controls', sList.id);

  sBox.appendChild(sIcon);
  sBox.appendChild(sInput);
  sBox.appendChild(sPanel);
  searchItem.appendChild(sBtn);
  searchItem.appendChild(sBox);
  bar.appendChild(searchItem);

  /* ---- โหมดจอแคบ/จอกว้าง ----
     ใช้ matchMedia ให้ตรงกับ breakpoint ใน CSS เป๊ะ ๆ จะได้ไม่มีช่วงที่ CSS บอกว่า
     "ซ่อนปุ่ม" แต่ JS ยังคิดว่าจอแคบอยู่ */
  var MQ_NARROW = window.matchMedia ? window.matchMedia('(max-width: 1099px)') : null;
  function isNarrow() { return MQ_NARROW ? MQ_NARROW.matches : window.innerWidth <= 999; }
  var boxOpen = false;      // จอแคบเท่านั้นที่ใช้ตัวแปรนี้ จอกว้างกล่องโผล่ตลอด

  function syncSearchMode() {
    /* จอกว้างไม่มีสถานะ "เปิด/ปิด" ให้จำ — CSS โชว์ช่องให้เองอยู่แล้ว
       ล้าง boxOpen ทิ้งเพื่อไม่ให้ค้างมาจากตอนที่หน้าต่างยังแคบ */
    if (!isNarrow()) boxOpen = false;
    if (boxOpen) sBox.classList.add('sn-open');
    else sBox.classList.remove('sn-open');
    sBtn.setAttribute('aria-expanded', String(boxOpen));
  }
  syncSearchMode();

  /* ---- เปิด/ปิดแผงผลลัพธ์ ---- */
  var activeIdx = -1;

  function setActive(n) {
    var rows = sList.children, i, row;
    for (i = 0; i < rows.length; i++) {
      row = rows[i];
      if (i === n) {
        row.classList.add('sn-sel');
        row.setAttribute('aria-selected', 'true');
        sInput.setAttribute('aria-activedescendant', row.id);
        /* เลื่อนให้เห็นด้วยการตั้ง scrollTop ของแผงเอง ไม่ใช้ scrollIntoView
           เพราะ scrollIntoView เลื่อน "ทั้งหน้า" ได้ ผู้ใช้จะงงว่าทำไมหน้าขยับ */
        if (row.offsetTop < sPanel.scrollTop) {
          sPanel.scrollTop = row.offsetTop;
        } else if (row.offsetTop + row.offsetHeight > sPanel.scrollTop + sPanel.clientHeight) {
          sPanel.scrollTop = row.offsetTop + row.offsetHeight - sPanel.clientHeight;
        }
      } else {
        row.classList.remove('sn-sel');
        row.setAttribute('aria-selected', 'false');
      }
    }
    if (n < 0) sInput.removeAttribute('aria-activedescendant');
    activeIdx = n;
  }

  /* max-height ใน CSS วัดกับ layout viewport ซึ่ง **คีย์บอร์ดบนมือถือไม่ได้ย่อ**
     ที่ 380x670 แผงสูง 432px ท้ายแผงอยู่ที่ y=529 ส่วนคีย์บอร์ดกินไปราว 260-330px
     แถวที่ 4-8 จึงไปอยู่ใต้คีย์บอร์ด และการกด ↓ ก็เลื่อนแถวลงไปซ่อนใต้นั้นพอดี
     เพราะ setActive() คิดจาก sPanel.clientHeight ที่ยังเป็น 432
     visualViewport คือส่วนที่ "มองเห็นจริง" หลังคีย์บอร์ดเด้ง — ใช้ตัวนี้เป็นเพดานแทน
     เบราว์เซอร์ที่ไม่มี visualViewport ก็ปล่อยให้ CSS ทำงานเหมือนเดิม */
  var VV = window.visualViewport || null;
  var PANEL_CAP = 432;                      // = 27rem เท่าเพดานใน CSS

  function capPanel() {
    if (!VV || sPanel.hidden) return;
    var top = sPanel.getBoundingClientRect().top;
    var avail = VV.offsetTop + VV.height - top - 8;
    if (avail > PANEL_CAP) avail = PANEL_CAP;
    if (avail < 120) avail = 120;           // เหลือน้อยมากก็ยังต้องเห็นอย่างน้อยแถวเดียว
    sPanel.style.maxHeight = avail + 'px';
  }

  /* aria-expanded ต้องบอกว่า "มีรายการให้เลือกไหม" ไม่ใช่ "แผงโผล่ไหม"
     เดิมประกาศ expanded=true ตอนขึ้นข้อความ "กำลังโหลด…" ด้วย ซึ่ง listbox ว่างเปล่า
     screen reader จึงบอกว่ากางแล้วแต่ไม่มีอะไรให้อ่าน แทบทุกครั้งที่กดแป้น */
  function syncExpanded() {
    sInput.setAttribute('aria-expanded',
      String(!sPanel.hidden && sList.children.length > 0));
  }

  function openPanel() {
    sPanel.hidden = false;
    syncExpanded();
    capPanel();
  }

  function closePanel() {
    sPanel.hidden = true;
    sInput.setAttribute('aria-expanded', 'false');
    setActive(-1);
  }

  if (VV) {
    VV.addEventListener('resize', capPanel);
    VV.addEventListener('scroll', capPanel);
  }

  /* ปิดทั้งชุด — ถูกเรียกจาก closeAll() ด้วย (คลิกนอกแถบ · กดปุ่มเมนูอื่น) */
  function closeSearch() {
    closePanel();
    if (isNarrow()) { boxOpen = false; syncSearchMode(); }
  }
  closeSearchBox = closeSearch;

  /* ---- โหลด index ครั้งเดียว ตอนโฟกัสครั้งแรก ---- */
  function loadIndex() {
    if (idxState !== 'idle') return;          // โหลดแล้ว/กำลังโหลด = ไม่ยิงซ้ำ
    if (!window.fetch) {                      // เบราว์เซอร์เก่ามาก — บอกไปตรง ๆ ดีกว่าเงียบ
      idxState = 'error';
      render();
      return;
    }
    idxState = 'loading';
    render();
    fetch(url('assets/search-index.json'), { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        buildEntries(data);
        idxState = ENTRIES.length ? 'ready' : 'error';
        render();
      })
      .catch(function () {
        /* ล้มเหลวต้องเห็นบนจอ ไม่ใช่ปล่อยให้ช่องค้นหาเงียบไปเฉย ๆ
           แล้วคนใช้นั่งพิมพ์รอผลลัพธ์ที่ไม่มีวันมา */
        idxState = 'error';
        render();
      });
  }

  /* ---- ประกอบข้อความ + ไฮไลต์ ----
     ทุกอย่างในนี้สร้างด้วย DOM API และ textContent เท่านั้น ห้ามใช้ innerHTML
     เพราะข้อความมาจากไฟล์ index (ซึ่งดูดมาจาก HTML ของบทเรียนอีกที) และจากสิ่งที่
     ผู้ใช้พิมพ์ — ถ้าเผลอ innerHTML เมื่อไร แค่มีคำว่า <img onerror=...> หลุดเข้า
     คลังคำก็รันได้ทันที */
  function fillHighlight(node, text, qn) {
    var nm = normMap(text);
    var pos = qn ? nm.n.indexOf(qn) : -1;
    if (pos < 0) { node.appendChild(document.createTextNode(text)); return; }
    var from = nm.map[pos];
    var to = nm.map[pos + qn.length - 1] + 1;
    if (from > 0) node.appendChild(document.createTextNode(text.slice(0, from)));
    var mk = document.createElement('mark');
    mk.textContent = text.slice(from, to);
    node.appendChild(mk);
    if (to < text.length) node.appendChild(document.createTextNode(text.slice(to)));
  }

  /* ป้ายกลุ่มจากเลข d ที่ builder ใส่มาให้ (ฝั่ง BACK = เลขวัน · ฝั่ง FRONT = 101, 102)
     ⚠️ ห้ามเขียน 'Day ' + pg.d ตรง ๆ ไม่งั้นผลค้นหาฝั่ง Frontend จะขึ้นว่า "Day 101" */
  var GROUP_BY_D = {};
  TRACKS.forEach(function (t) {
    t.groups.forEach(function (g) { GROUP_BY_D[g.d] = g.where; });
  });

  /* "อยู่บทไหน กลุ่มไหน" — cheat sheet ไม่มีเลขบท (builder ไม่ใส่ n มาให้) */
  function whereText(pg, withTitle) {
    var s = GROUP_BY_D[pg.d] || ('Day ' + pg.d);
    s += pg.n ? ' · บท ' + pg.n : ' · Cheat sheet';
    /* แถวชนิด "บทเรียน" มีชื่อบทเป็นหัวแถวอยู่แล้ว ต่อท้ายอีกก็ซ้ำตัวเองสองบรรทัดติด */
    return withTitle === false ? s : s + ' — ' + pg.t;
  }

  function makeRow(hit, qn, i) {
    var e = hit.e;
    var a = el('a', 'sn-sres sn-k-' + e.k);
    a.href = e.href;
    a.id = 'sn-sres-' + i;
    a.setAttribute('role', 'option');
    a.setAttribute('aria-selected', 'false');
    /* ท่า combobox + aria-activedescendant บังคับว่า option ต้องโฟกัสไม่ได้
       โฟกัสต้องอยู่ที่ช่องพิมพ์ตัวเดียว แล้วเลื่อนเลือกด้วย ↑↓ (ซึ่งทำไว้แล้ว)
       ถ้าปล่อยให้ Tab ลงมาโดนแถวได้ จะกลายเป็นสองระบบโฟกัสที่ขัดกันเอง */
    a.tabIndex = -1;

    var head = el('div', 'sn-shead');
    var t = el('span', 'sn-stext');
    fillHighlight(t, e.t, qn);
    head.appendChild(t);
    head.appendChild(el('span', 'sn-skind', KIND_TH[e.k]));
    a.appendChild(head);

    /* "พบใน N บท" ไม่ใช่ "พบ N ที่" — ไฟล์ v2 เก็บจำนวนบท ไม่ใช่จำนวนครั้ง
       เลขจำนวนครั้ง (nil เคยขึ้นว่า "พบ 136 ที่ในคอร์ส") อ่านแล้วเข้าใจว่ามี 136 จุด
       ให้ไปดู ทั้งที่แถวนี้มีลิงก์เดียว */
    var meta = whereText(e.pg, e.k !== 'l');
    if (e.c > 1) meta += ' · พบใน ' + e.c + ' บท';
    a.appendChild(el('div', 'sn-smeta', meta));

    if (e.k === 't' && e.s) {
      a.appendChild(el('div', 'sn-ssnip', e.s));
    } else if (e.k === 'c') {
      /* แถวโค้ดมีแต่ชื่อ token เปล่า ๆ กดแล้วไม่รู้ว่าจะไปเจออะไร
         เติมชื่อหัวข้อปลายทางให้ (ได้มาฟรีจาก entry ชนิดหัวข้อที่ anchor เดียวกัน) */
      var ctx = HEAD_AT[e.pi + '#' + e.an];
      if (ctx && ctx !== e.t) a.appendChild(el('div', 'sn-ssnip', 'ในหัวข้อ: ' + ctx));
    }

    /* ปิดแผงก่อนพาไป — ถ้าเป็นลิงก์ #anchor ในหน้าเดียวกัน เบราว์เซอร์ไม่โหลดหน้าใหม่
       แผงจะค้างบังหัวข้อที่เพิ่งกระโดดไปพอดี */
    a.addEventListener('click', function () { closeSearch(); });
    return a;
  }

  function clearList() {
    while (sList.firstChild) sList.removeChild(sList.firstChild);
    activeIdx = -1;
    sInput.removeAttribute('aria-activedescendant');
  }

  function say(msg, hint) {
    sNote.textContent = msg;
    sNote.hidden = false;
    sHint.textContent = hint || '';
    sHint.hidden = !hint;
    announce(msg);
  }

  /* เขียนซ้ำข้อความเดิมไม่ทำให้ screen reader อ่านใหม่ จึงเช็คก่อนเพื่อไม่ให้เงียบ
     ในกรณีที่สถานะกลับมาเหมือนเดิม */
  function announce(msg) {
    if (sLive.textContent !== msg) sLive.textContent = msg;
  }

  function render() {
    var raw = sInput.value;
    var qn = norm(raw);
    clearList();
    sMore.hidden = true;
    sRetry.hidden = true;

    if (idxState === 'error') {
      say('โหลดคลังคำไม่สำเร็จ', 'อาจเป็นเพราะเน็ตหลุดหรือไฟล์ค้นหายังไม่ถูก deploy');
      sRetry.hidden = false;
      openPanel();
      return;
    }
    if (idxState !== 'ready') {
      say('กำลังโหลดคลังคำ…', 'โหลดครั้งเดียวต่อการเปิดหน้า ครั้งต่อไปจะขึ้นทันที');
      openPanel();
      return;
    }
    if (qn.length < MIN_QUERY) {
      /* แยกสองข้อความ เพราะสองสถานการณ์นี้ผู้ใช้ต้องทำคนละอย่าง:
         ยังไม่พิมพ์อะไร กับ พิมพ์แล้วแต่เหลือไม่ถึง 2 ตัวหลังตัดวรรณยุกต์/เครื่องหมาย */
      if (!raw) say('พิมพ์อย่างน้อย 2 ตัวอักษร', 'ค้นได้ทั้งศัพท์ · หัวข้อ · ชื่อบท · โค้ด เช่น goroutine · defer · idempotent');
      else say('พิมพ์อีกสักตัวสองตัว', 'คำค้นสั้นเกินไป (เครื่องหมายกับวรรณยุกต์ไม่นับเป็นตัวอักษร)');
      openPanel();
      return;
    }

    var hits = runSearch(qn);
    if (!hits.length) {
      say('ไม่พบ "' + echoQuery(raw) + '" ในคลังคำของคอร์ส',
          'ลองพิมพ์สั้นลง หรือใช้คำอังกฤษ — ศัพท์ในคอร์สส่วนใหญ่เป็นอังกฤษ เช่น pointer · context · migration');
      openPanel();
      return;
    }

    var n = Math.min(MAX_SHOW, hits.length);
    var show = hits.slice(0, n), i;

    /* กันที่ไว้ให้ "ชื่อบท" อย่างน้อยหนึ่งแถว
       เหตุผล: คนพิมพ์ชื่อเรื่องที่อยากเรียน (defer · redis · swagger · keycloak)
       คือพฤติกรรมที่พบบ่อยที่สุดของมือใหม่ แต่ชื่อบทเป็นประโยคไทยยาว ๆ จึงแพ้
       token สั้น ๆ ในหน้าเดียวกันเสมอ วัดแล้ว 26 จาก 62 บทไม่ติด 8 อันดับของตัวเอง
       เงื่อนไข TIER_TOKEN ขึ้นไป = ต้องเป็นการตรงกันระดับ "คำ" ไม่ใช่ตัวอักษรบังเอิญชน */
    var hasLesson = false;
    for (i = 0; i < show.length; i++) if (show[i].e.k === 'l') hasLesson = true;
    if (!hasLesson && hits.length > n) {
      for (i = n; i < hits.length; i++) {
        if (hits[i].e.k === 'l' && tierOf(hits[i].sc) >= TIER_TOKEN) {
          show[show.length - 1] = hits[i];
          break;
        }
      }
    }

    /* ผลชั้นล่างสุดขึ้นเป็นอันดับหนึ่ง = ไม่มีอะไรตรงจริง ๆ เหลือแล้ว ต้องบอกให้รู้
       ไม่งั้นคนอ่านว่าเป็นคำตอบ เช่นค้น <script> แล้วได้ @description ขึ้นมาแถวเดียว
       เพราะคำว่า de-script-ion มีตัวอักษรชุดนี้อยู่ตรงกลาง */
    var top = tierOf(show[0].sc);
    if (top === TIER_SNIP) {
      say('ไม่พบชื่อที่ตรงกับ "' + echoQuery(raw) + '" — นี่คือรายการที่มีคำนี้อยู่ใน "คำอธิบาย"');
    } else if (top === TIER_SUB) {
      say('ไม่พบคำนี้ตรง ๆ — นี่คือชื่อที่มีตัวอักษรชุด "' + echoQuery(raw) + '" อยู่ข้างใน');
    } else {
      sNote.hidden = true;
      sHint.hidden = true;
    }

    for (i = 0; i < show.length; i++) sList.appendChild(makeRow(show[i], qn, i));
    if (hits.length > n) {
      sMore.textContent = 'แสดง ' + n + ' อันดับแรกจาก ' + hits.length + ' รายการ · พิมพ์ให้เจาะจงขึ้นเพื่อกรองต่อ';
      sMore.hidden = false;
    }
    /* ประกาศจำนวนที่เจอ — ของเดิมประกาศเฉพาะตอนหาไม่เจอ พอเจอกลับเงียบ
       คนที่ใช้ screen reader ต้องกด ↓ ไล่ดูเองว่ามีอะไรโผล่มาไหม */
    announce('พบ ' + hits.length + ' รายการ · แสดง ' + show.length + ' อันดับแรก');
    openPanel();
  }

  /* คำที่ผู้ใช้พิมพ์เอามาต่อในข้อความบนจอได้ แต่ต้องตัดให้สั้น — มีเคสจริงที่คน
     paste error string ยาว ๆ มาทั้งก้อน (dial tcp [::1]:5432: connect: ...) */
  function echoQuery(raw) {
    var q = String(raw).trim();
    return q.length > 40 ? q.slice(0, 40) + '…' : q;
  }

  /* ---- event ----
     debounce สั้น ๆ เป็นมารยาทกับเครื่องช้าเท่านั้น การค้นเองเร็วมาก
     (ไล่ทีละรายการทั้ง ~3,400 รายการ วัดได้ต่ำกว่า 1 ms) */
  var sTimer = 0;
  sInput.addEventListener('input', function () {
    /* เรียก loadIndex() ตรงนี้ด้วย ไม่ใช่แค่ตอน focus — มันกันตัวเองไม่ให้ยิงซ้ำอยู่แล้ว
       เหตุผล: บางกรณี event focus ไม่เกิด เช่น หน้าถูกโฟกัสด้วย element.focus()
       ขณะที่ตัวหน้าต่างเบราว์เซอร์เองยังไม่ได้ถูกโฟกัส (เจอจริงตอนทดสอบด้วย
       เบราว์เซอร์ที่รันเบื้องหลัง) ถ้าพึ่ง focus อย่างเดียว คนพิมพ์ได้แต่รอไม่มีวันได้ผล
       ยังถือว่า lazy อยู่ เพราะยังไงก็ต้องมีคนมายุ่งกับช่องค้นหาก่อน */
    loadIndex();
    if (sTimer) clearTimeout(sTimer);
    sTimer = setTimeout(function () { sTimer = 0; render(); }, 70);
  });

  sInput.addEventListener('focus', function () {
    /* ปิดเฉพาะ "เมนู" ไม่ใช่ closeAll() เพราะ closeAll จะสั่งปิดช่องค้นหาด้วย
       ซึ่งบนจอแคบคือปิดกล่องที่เพิ่งกดเปิดมาเมื่อเสี้ยววินาทีก่อน */
    closeMenus();
    loadIndex();
    render();
  });

  sInput.addEventListener('keydown', function (e) {
    var rows = sList.children;
    var k = e.key;
    /* แผงปิดอยู่ = ↑↓ กับ Enter ต้องไม่ทำอะไรเลย
       ที่ต้องเขียนไว้ชัด ๆ: closePanel() แค่ซ่อนแผง ไม่ได้ล้างแถวทิ้ง แถว <a> ทั้ง 8
       ยังอยู่ใน DOM ผลคือกด Esc เพื่อเลิก แล้วเผลอกด Enter ต่อ (สองปุ่มที่คนกด
       ติดกันบ่อยที่สุดในช่องค้นหา) จะเด้งออกจากบทเรียนที่กำลังอ่านอยู่ทันที */
    var navKey = (k === 'ArrowDown' || k === 'Down' || k === 'ArrowUp' || k === 'Up' || k === 'Enter');
    if (navKey && sPanel.hidden) return;
    if (k === 'ArrowDown' || k === 'Down' || k === 'ArrowUp' || k === 'Up') {
      if (!rows.length) return;
      e.preventDefault();                       // กันเคอร์เซอร์วิ่งไปหัว/ท้ายข้อความ
      var down = (k === 'ArrowDown' || k === 'Down');
      var next;
      if (activeIdx < 0) next = down ? 0 : rows.length - 1;
      else next = (activeIdx + (down ? 1 : -1) + rows.length) % rows.length;
      setActive(next);
      return;
    }
    if (k === 'Enter') {
      var pick = rows[activeIdx >= 0 ? activeIdx : 0];
      if (!pick) return;
      e.preventDefault();
      var href = pick.href;
      closeSearch();
      sInput.blur();
      location.href = href;
      return;
    }
    if (k === 'Escape' || k === 'Esc') {
      /* preventDefault ด้วย เพราะ input[type=search] ของ Chrome มีพฤติกรรมของตัวเอง
         คือล้างช่องทันทีที่กด Esc — จะทำให้ "กดครั้งแรกปิด ครั้งที่สองล้าง" เพี้ยน */
      e.preventDefault();
      if (!sPanel.hidden) { closePanel(); return; }
      if (sInput.value) {
        /* ล้างช่องเฉย ๆ ห้ามเรียก render() ตรงนี้ — render() ของช่องว่างจะไป
           เปิดแผงขึ้นมาโชว์ข้อความ "พิมพ์อย่างน้อย 2 ตัวอักษร" ซึ่งคือแผงที่เพิ่งกด
           Esc ปิดไปเมื่อกดก่อนหน้า ทำให้ต้องกด Esc ถึงสี่ครั้งกว่าจะออกได้จริง */
        sInput.value = '';
        clearList();
        sMore.hidden = true;
        closePanel();
        return;
      }
      /* ครั้งสุดท้าย: ปิดทั้งชุด แล้ว **คืนโฟกัส** ไม่ใช่ blur ทิ้ง
         จอแคบ closeSearch() ยุบกล่องเป็น display:none โฟกัสจะตกไปที่ <body>
         แล้ว Tab ครั้งถัดไปเริ่มนับใหม่จากหัวเอกสาร (handler ของเมนู ☰ ข้างล่าง
         คืนโฟกัสให้ปุ่มอยู่แล้ว ตรงนี้ควรทำเหมือนกัน) */
      var narrow = isNarrow();
      closeSearch();
      if (narrow) sBtn.focus();
      return;
    }
  });

  /* Esc ตอนโฟกัสอยู่ในแผง (ไม่ใช่ในช่องพิมพ์) — handler ข้างบนผูกกับ sInput
     อย่างเดียว ส่วน handler รวมที่ท้ายไฟล์ดูแค่ปุ่มเมนูใน toggles ซึ่งช่องค้นหา
     จงใจไม่ได้อยู่ในนั้น ผลคือถ้าโฟกัสหลุดเข้าไปในแผงจะไม่มีปุ่มไหนปิดได้เลย */
  searchItem.addEventListener('keydown', function (e) {
    if (e.target === sInput) return;
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    e.preventDefault();
    closePanel();
    sInput.focus();
  });

  /* กด 🔍 บนจอแคบ: กางกล่องเต็มความกว้างแถบแล้วโฟกัสให้เลย */
  sBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var willOpen = !boxOpen;
    closeAll();                    // ปิดเมนูอื่น ๆ (และปิดกล่องนี้ด้วย ถ้ากางอยู่)
    if (!willOpen) return;
    boxOpen = true;
    syncSearchMode();
    loadIndex();                   // เริ่มโหลดตั้งแต่กดปุ่ม จะได้ไม่ต้องรอตอนพิมพ์เสร็จ
    render();
    sInput.focus();
  });

  sRetry.addEventListener('click', function () {
    idxState = 'idle';
    loadIndex();
    sInput.focus();
  });

  /* โฟกัสหลุดออกนอกช่องค้นหา (กด Tab ต่อ) = ปิด
     เงื่อนไข relatedTarget เป็น null แล้ว "ไม่ปิด" คัดลอกมาจาก handler ของเมนูข้างล่าง
     ด้วยเหตุผลเดียวกัน: Safari ไม่ย้ายโฟกัสตอนคลิก ถ้าปิดตรงนี้ ผลลัพธ์จะหายไป
     ก่อนที่ event click ของลิงก์จะทำงาน แล้วกดผลลัพธ์ไม่ติดทั้งเบราว์เซอร์
     เคสคลิกที่อื่นจริง ๆ มี handler คลิกนอกกล่องรับไว้อยู่แล้ว */
  searchItem.addEventListener('focusout', function (e) {
    var to = e.relatedTarget;
    if (!to || to.nodeType !== 1) return;
    if (!searchItem.contains(to)) closeSearch();
  });

  /* คลิกที่ไหนก็ตามที่ไม่ใช่ช่องค้นหา = ปิด
     ต้องมีของตัวเองแยกจาก handler ปิดเมนูข้างล่าง เพราะ handler นั้นมองว่า
     "คลิกในแถบ" คือปลอดภัยแล้วออกไปเลย ซึ่งจะทำให้กดที่ว่างในแถบแล้วแผงยังค้าง */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.nodeType === 1 && t.closest && t.closest('.sn-search')) return;
    closeSearch();
  });

  /* -- ขวา: บันทึกการเรียนรู้ -- */
  var docs = el('a', 'sn-docs', '📓 บันทึก');
  docs.href = url('docs.html');
  docs.title = 'บันทึกการเรียนรู้และเอกสารประกอบ';
  if (isHere('docs.html')) docs.setAttribute('aria-current', 'page');
  bar.appendChild(docs);

  /* ==========================================================================
     แถวสอง — โผล่เฉพาะหน้าที่อยู่ใน day-N/ (บทเรียน + cheat sheet)
     ====================================================================== */
  if (WHERE) {
    var d = WHERE.group;
    var sub = el('div', 'sn-sub');
    var inSub = el('div', 'sn-in');
    var subin = el('div', 'sn-subin');
    inSub.appendChild(subin);
    sub.appendChild(inSub);

    subin.appendChild(el('span', 'sn-where', d.where));

    var chips = el('div', 'sn-chips');
    chips.setAttribute('aria-label', 'บทเรียนใน ' + d.where);
    var activeChip = null;
    d.lessons.forEach(function (ls) {
      var c = el('a', 'sn-chip', ls.n);
      c.href = url(ls.f);
      c.title = 'บทเรียน ' + ls.n + ' — ' + ls.t;
      if (isHere(ls.f)) { c.setAttribute('aria-current', 'page'); activeChip = c; }
      chips.appendChild(c);
    });
    var cs = el('a', 'sn-chip sn-chip-sheet', '📄 Cheat sheet');
    cs.href = url(d.sheet);
    if (isHere(d.sheet)) { cs.setAttribute('aria-current', 'page'); activeChip = cs; }
    chips.appendChild(cs);
    subin.appendChild(chips);

    /* dropdown "ในบทนี้" — ลิสต์ <h2> ของหน้านั้นเอง
       บทเรียนเดิมไม่มี id ที่หัวข้อเลย จึงต้องแปะ id ให้อัตโนมัติก่อน */
    var heads = [];
    var all = document.querySelectorAll('h2');
    for (var i = 0; i < all.length; i++) {
      var h = all[i];
      if (root.contains(h)) continue;               // กันไม่ให้หัวข้อในแถบเองหลุดเข้ามา
      var txt = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt) continue;
      if (!h.id) h.id = 'sn-sec-' + (heads.length + 1);
      heads.push({ id: h.id, text: txt });
    }
    if (heads.length > 1) {
      var tocItem = el('div', 'sn-item');
      var tocBtn = el('button', 'sn-btn', 'ในบทนี้ ▾');
      var tocPanel = el('div', 'sn-panel');
      /* ไม่ใส่เลขลำดับของเราเองที่นี่ (ต่างจากแผงของ "วัน" ที่เลขบทมีความหมายจริง)
         เพราะ <h2> ในบทเรียนขึ้นต้นด้วยเลขของตัวเองอยู่แล้ว เช่น "2 · slice ไม่ได้เก็บข้อมูล"
         ถ้าเติมเลขเข้าไปอีกจะได้ "2  2 · slice ..." และหัวข้อที่ไม่มีเลขนำ (เช่น "อ้างอิง")
         จะได้เลขที่ไม่ตรงกับอะไรในหน้าเลย */
      heads.forEach(function (hd) {
        var a = el('a', 'sn-link');
        a.href = '#' + hd.id;
        a.appendChild(el('span', 'sn-t', hd.text));
        tocPanel.appendChild(a);
      });
      makeToggle(tocBtn, tocPanel, 'หัวข้อในหน้านี้');
      tocItem.appendChild(tocBtn);
      tocItem.appendChild(tocPanel);
      subin.appendChild(tocItem);
    }

    root.appendChild(sub);
  }

  /* แทรกเป็น element แรกของ <body> — ทั้งสามหน้าราก บทเรียน และ cheat sheet
     มี <header> เป็นตัวแรกเหมือนกันหมด จึงใช้โค้ดชุดเดียวจบ
     และห้ามยัดไว้ใน <main>/<header> เพราะ lesson.css บีบสองอันนั้นไว้ที่ 46rem */
  var style = el('style');
  style.id = 'sn-style';
  style.textContent = CSS;
  document.head.appendChild(style);
  document.body.insertBefore(root, document.body.firstChild);

  /* ==========================================================================
     ส่วนที่ 5 · event และงานหลังวาดเสร็จ
     ====================================================================== */

  /* วัดความสูงจริงของแถบ แล้วเก็บลงตัวแปร CSS
     ใช้ค่านี้เป็น scroll-padding-top ให้การกด #anchor ไม่ไปหยุดใต้แถบ */
  function measure() {
    var h = root.offsetHeight;
    if (h > 0) document.documentElement.style.setProperty('--sn-h', h + 'px');
  }
  measure();

  /* resize: วัดความสูงใหม่ "ทุกครั้ง" แต่ปิดเมนู "เฉพาะตอนความกว้างเปลี่ยนจริง"
     เหตุผล: บนมือถือ แถบ URL ของ Safari/Chrome ยุบและกางเวลาเลื่อนหน้า ซึ่งยิง resize
     ทั้งที่เปลี่ยนแค่ "ความสูง" ถ้าปิดเมนูทุก resize ผู้ใช้ที่เปิด ☰ ค้างไว้แล้วนิ้ว
     ไปโดนพื้นที่ว่างใต้แผงจนหน้าขยับนิดเดียว เมนูจะปิดเองทั้งที่ยังเลือกไม่เสร็จ
     ส่วนเคสที่ตั้งใจจะกันจริง ๆ (หมุนจอ / ลากขอบหน้าต่างข้าม breakpoint 767px)
     ล้วนเปลี่ยนความกว้าง จึงยังทำงานเหมือนเดิม */
  var raf = 0;
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      measure();
      if (window.innerWidth !== lastW) {
        lastW = window.innerWidth;
        closeAll();
        /* ข้าม breakpoint 1000px แล้วต้องสลับโหมดช่องค้นหาให้ตรงกับ CSS ทันที
           ไม่งั้นลากขอบหน้าต่างจากแคบไปกว้าง จะได้ช่องค้นหาที่ยังติด hidden อยู่ */
        syncSearchMode();
      }
    });
  });

  /* คลิกนอกแถบ = ปิดเมนู
     ใช้ bubble phase (ไม่ใช่ capture) และไม่เรียก stopPropagation เลย
     เพราะ quiz.js/progress.js ผูก click ไว้ที่ตัว element ของมันเอง
     ถ้าเราไปหยุด event ที่ระดับ document แบบ capture ปุ่มเฉลย/ข้อสอบจะตายเงียบ ๆ */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.nodeType === 1 && t.closest && t.closest('#sn-root')) {
      // คลิกลิงก์ในเมนู: ปิดเมนูให้ด้วย เพราะลิงก์ #anchor ไม่ได้โหลดหน้าใหม่
      if (t.closest('a')) closeAll();
      return;
    }
    closeAll();
  });

  /* Esc = ปิดเมนูที่กางอยู่ แล้วคืน focus ให้ปุ่มเดิม (มารยาทพื้นฐานของ a11y) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    var opened = null;
    toggles.forEach(function (p) {
      if (p.btn.getAttribute('aria-expanded') === 'true') opened = p;
    });
    if (!opened) return;
    closeAll();
    opened.btn.focus();
  });

  /* โฟกัสหลุดออกนอกกลุ่ม = ปิดแผงนั้น
     เคสจริง: กด Tab ไล่ในแผง "Day 1" จนพ้นลิงก์ตัวสุดท้าย โฟกัสจะเด้งไปปุ่ม "Day 2"
     แต่แผง Day 1 ยังกางค้างบังเนื้อหาอยู่ ทั้งที่ทางออกตามธรรมชาติของ disclosure
     คือปิดเมื่อโฟกัสออกนอกกลุ่ม

     ใช้ e.relatedTarget (ปลายทางของโฟกัส) ไม่ใช่ setTimeout + document.activeElement
     เพราะ Safari บน macOS ไม่ย้ายโฟกัสไปที่ <button> ตอนคลิก — ถ้าอ่าน activeElement
     จะได้ body แล้วเผลอปิดแผงที่ผู้ใช้เพิ่งกดเปิด
     relatedTarget เป็น null เมื่อโฟกัสหลุดออกนอกหน้าไปเลย (คลิกที่ว่าง / สลับแท็บ /
     ไปที่ address bar) กรณีนั้นไม่ปิด ปล่อยให้ handler คลิกนอกแถบจัดการแทน */
  root.addEventListener('focusout', function (e) {
    var to = e.relatedTarget;
    if (!to || to.nodeType !== 1) return;
    toggles.forEach(function (p) {
      if (p.btn.getAttribute('aria-expanded') !== 'true') return;
      var box = p.btn.parentNode;          // .sn-item ที่หุ้มทั้งปุ่มและแผง
      if (box && !box.contains(to)) {
        p.btn.setAttribute('aria-expanded', 'false');
        p.panel.hidden = true;
      }
    });
  });

  /* เลื่อนแถบ chip ให้บทที่กำลังเปิดอยู่มาอยู่กลาง ๆ
     ตั้ง scrollLeft เองแทน scrollIntoView เพราะ scrollIntoView อาจเลื่อน "ทั้งหน้า"
     ทำให้ผู้ใช้เปิดหน้ามาแล้วเจอว่าโดนเลื่อนลงไปเองโดยไม่ได้ขอ */
  if (WHERE) {
    var bandChips = root.querySelector('.sn-chips');
    var cur = bandChips && bandChips.querySelector('[aria-current="page"]');
    if (bandChips && cur) {
      bandChips.scrollLeft = cur.offsetLeft - (bandChips.clientWidth - cur.offsetWidth) / 2;
    }
  }
})();
