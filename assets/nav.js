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

  /* path ของ cheat sheet เดาได้จากเลขวัน จึงไม่ต้องเก็บซ้ำใน DATA */
  function sheetFile(day) { return 'day-' + day + '/reference/cheatsheet.html'; }

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

@media (max-width: 767px) {
  /* จอแคบ: ยุบปุ่ม 9 วันเหลือปุ่มเดียว ไม่งั้นแถวบนจะล้นจอแน่นอน */
  .sn-days { display: none; }
  .sn-burger { display: inline-flex; }
  .sn-bar { gap: 0.3rem; }
  .sn-root { font-size: 0.86rem; }

  /* ป้าย "Day N" ห้ามซ่อน — จอแคบเป็นจอเดียวที่ไม่เห็นปุ่ม Day 1..9 แล้ว
     ถ้าซ่อนป้ายด้วยจะไม่เหลืออะไรบอกเลยว่าอยู่วันไหน แค่ย่อขนาดก็พอ
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
    for (var i = 0; i < DAYS.length; i++) {
      var d = DAYS[i];
      for (var j = 0; j < d.lessons.length; j++) {
        if (isHere(d.lessons[j].f)) return { day: d, lesson: d.lessons[j] };
      }
      if (d.sheet && isHere(sheetFile(d.day))) return { day: d, lesson: null, sheet: true };
    }
    return null;
  }

  var WHERE = locate();

  /* แผงรายการบทของหนึ่งวัน ใช้ทั้งเมนูจอกว้างและเมนูจอแคบ */
  function dayList(d) {
    var box = document.createDocumentFragment();
    d.lessons.forEach(function (ls) {
      var a = el('a', 'sn-link');
      a.href = url(ls.f);
      a.appendChild(el('span', 'sn-num', ls.n));
      a.appendChild(el('span', 'sn-t', ls.t));
      if (isHere(ls.f)) a.setAttribute('aria-current', 'page');
      box.appendChild(a);
    });
    if (d.sheet) {
      var s = el('a', 'sn-link sn-sheet');
      s.href = url(sheetFile(d.day));
      s.appendChild(el('span', 'sn-num', '📄'));
      s.appendChild(el('span', 'sn-t', 'Cheat sheet Day ' + d.day));
      if (isHere(sheetFile(d.day))) s.setAttribute('aria-current', 'page');
      box.appendChild(s);
    }
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

  function closeAll() {
    toggles.forEach(function (p) {
      p.btn.setAttribute('aria-expanded', 'false');
      p.panel.hidden = true;
    });
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

  /* -- กลาง (จอกว้าง): ปุ่ม Day 1..9 พร้อม dropdown -- */
  var days = el('div', 'sn-days');
  DAYS.forEach(function (d) {
    var item = el('div', 'sn-item');
    var btn = el('button', 'sn-btn', 'Day ' + d.day);
    var panel = el('div', 'sn-panel');
    panel.appendChild(dayList(d));
    if (WHERE && WHERE.day === d) btn.classList.add('sn-on');
    makeToggle(btn, panel, 'บทเรียน Day ' + d.day);
    item.appendChild(btn);
    item.appendChild(panel);
    days.appendChild(item);
  });
  bar.appendChild(days);

  /* -- กลาง (จอแคบ): ปุ่มเดียว กางออกมาเป็นรายการวันแบบพับได้ -- */
  var mItem = el('div', 'sn-item sn-burger');
  var mBtn = el('button', 'sn-btn', '☰ เมนู');
  var mPanel = el('div', 'sn-panel sn-mpanel');
  DAYS.forEach(function (d) {
    var head = el('button', 'sn-mday');
    head.type = 'button';
    head.appendChild(el('span', null, 'Day ' + d.day + ' · ' + d.lessons.length + ' บท'));
    var caret = el('span', 'sn-caret', '▾');
    head.appendChild(caret);
    var group = el('div', 'sn-mgroup');
    group.id = 'sn-mgroup-' + d.day;
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'บทเรียน Day ' + d.day);
    group.appendChild(dayList(d));
    // วันที่กำลังเรียนอยู่ ให้กางไว้ตั้งแต่แรก จะได้ไม่ต้องกดซ้ำ
    var openNow = !!(WHERE && WHERE.day === d);
    group.hidden = !openNow;
    head.setAttribute('aria-controls', group.id);
    head.setAttribute('aria-expanded', String(openNow));
    caret.textContent = openNow ? '▴' : '▾';
    head.addEventListener('click', function () {
      var isOpen = !group.hidden;
      group.hidden = isOpen;
      head.setAttribute('aria-expanded', String(!isOpen));
      caret.textContent = isOpen ? '▾' : '▴';
    });
    mPanel.appendChild(head);
    mPanel.appendChild(group);
  });
  makeToggle(mBtn, mPanel, 'เลือกวันและบทเรียน');
  mItem.appendChild(mBtn);
  mItem.appendChild(mPanel);
  bar.appendChild(mItem);

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
    var d = WHERE.day;
    var sub = el('div', 'sn-sub');
    var inSub = el('div', 'sn-in');
    var subin = el('div', 'sn-subin');
    inSub.appendChild(subin);
    sub.appendChild(inSub);

    subin.appendChild(el('span', 'sn-where', 'Day ' + d.day));

    var chips = el('div', 'sn-chips');
    chips.setAttribute('aria-label', 'บทเรียนใน Day ' + d.day);
    var activeChip = null;
    d.lessons.forEach(function (ls) {
      var c = el('a', 'sn-chip', ls.n);
      c.href = url(ls.f);
      c.title = 'บทเรียน ' + ls.n + ' — ' + ls.t;
      if (isHere(ls.f)) { c.setAttribute('aria-current', 'page'); activeChip = c; }
      chips.appendChild(c);
    });
    if (d.sheet) {
      var cs = el('a', 'sn-chip sn-chip-sheet', '📄 Cheat sheet');
      cs.href = url(sheetFile(d.day));
      if (isHere(sheetFile(d.day))) { cs.setAttribute('aria-current', 'page'); activeChip = cs; }
      chips.appendChild(cs);
    }
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
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; closeAll(); }
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
