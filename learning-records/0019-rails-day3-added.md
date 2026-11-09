# 0019 — เพิ่ม Rails Day 3 (บท 120–135) + cheat sheet

**วันที่:** 7–9 พฤศจิกายน 2026
**ที่มา:** สไลด์ *Ruby on Rails - Day 3* · ผู้เรียนสั่ง "/workflows" = สไตล์มือใหม่เหมือน Day 1–2 ·
สไลด์เป็นแค่ตัวบอกหัวข้อ · ไม่ทำส่วน Architecture & Scaling (ผู้เรียนสั่งข้ามไว้แล้ว)

---

## เนื้อหาที่ได้

| บท | เรื่อง |
|---|---|
| 120–121 | เปิดโปรเจกต์กลางของคอร์ส (`day3-start`) + seed 30 บทความ · `prompts/` · CLAUDE.md / AGENTS.md |
| 122–126 | **View:** ทำไม Rails ไม่ต้องมีชั้น API · ERB · layout / partial / locals · helper · `form_with` · XSS · N+1 ใน view · Lab Vibe 1 |
| 127–129 | **CSS:** asset pipeline (fingerprint · Propshaft · importmap) · Tailwind v4 + daisyUI 5 · Lab Vibe 2 (navbar · card · สลับธีม) |
| 130–135 | **Hotwire:** Turbo Drive · Frames · Streams · broadcast · Stimulus · Lab Vibe 3 |

cheat sheet อยู่ที่ `rails-day-3/reference/cheatsheet.html`

---

## การตัดสินใจ

### 1 · Day 3 เริ่มจาก repo ของคอร์ส ไม่ใช่แอปของ Day 2

สไลด์ให้ clone `wongnok-blog-all-in-one` branch `day3-start` (categories + posts · scaffold ·
Tailwind v4 + daisyUI vendored · bullet · rack-mini-profiler · strong_migrations · `prompts/`)
บท 120 อธิบายว่าทำไม และเพิ่ม `db/seeds.rb` ของเราเอง (5 หมวด × 6 = 30 บทความภาษาไทย ·
`find_or_create_by!` สั่งซ้ำได้ผลเท่าเดิม) เพื่อให้ผลรันในทุกบทตรงกับเครื่องผู้เรียน

### 2 · สร้างโค้ด lab เป็น checkpoint ก่อนเขียน

ก่อนเขียนบท มี agent สร้างโค้ดของแต่ละ lab ทีละช่วงแล้ว tag ไว้
(`our-start` → `our-a` → `our-b` → `our-c1` … `our-c4`) · คนเขียนแต่ละบท clone จาก tag ที่ตรงกับบทของตัวเอง
→ ทุกบทต่อกันได้จริง และผลรันมาจากโค้ดชุดเดียวกัน · ตรวจ Turbo / Stimulus ใน Chrome headless จริง (ไม่ใช่แค่ curl)

### 3 · ไม่ใช้ i18n

branch `day3-*-done` ของอาจารย์ใช้ `t()` + rails-i18n ซึ่งไม่ได้ติดตั้งใน `day3-start` ·
บทของเราใช้ข้อความไทยตรง ๆ แล้วบท 126 บอกให้แก้บรรทัด "ผ่าน i18n" ใน `prompts/00-context.md`

---

## สไลด์ไม่ตรงกับของจริง (รันพิสูจน์แล้ว)

- **`truncate` ไม่ได้แก้ปัญหาตัดภาษาไทย** — ตัดตาม codepoint เหมือน `[0..80]` · ตัดกลางคำและทิ้งวรรณยุกต์ลอย
  (3 ใน 30 บทความ เช่น `นที|่`) · ใช้ `separator: " "` ช่วย
- **`post_counter` ไม่ได้มาฟรีเมื่อใช้ strict locals** — `NameError` ต้องประกาศใน `locals:` เอง
- **N+1 ของสไลด์ 21 → 2 query** · ข้อมูลเรา 12 (5 CACHE) → 3 (pagy เพิ่ม COUNT หนึ่งตัว)
- **pagy 43:** `include Pagy::Method` · helper HTML ของ pagy ต้อง `raw` ซึ่ง prompt ห้าม → เขียน partial เอง
- **error ของ `belongs_to` อยู่ที่ `:category` ไม่ใช่ `:category_id`** (scaffold เช็คผิดช่อง)
- **ไฟล์ Tailwind อยู่ที่ `app/assets/tailwind/application.css`** · daisyUI เป็น `@plugin "./daisyui.mjs"` (vendored)
  ไม่ใช่ `@plugin "daisyui"` ใน `application.tailwind.css`
- **"dev สร้างทุกคลาส สีจึงขึ้นในเครื่อง" ไม่จริง** — คลาสที่ต่อ string หายตั้งแต่ตอน dev
- **บล็อก themes `light --default, dark --prefersdark`** ได้ CSS เหมือนไม่ใส่เลย (เป็นค่า default ของ daisyUI 5)
- **`assets:clobber` ลบ `app/assets/builds/tailwind.css` ด้วย** ต้อง build ใหม่
- **Turbo Frame ครอบฟอร์ม edit ทั้งอัน + "controller ไม่ต้องแก้"** ทำให้เปิด `/posts/N/edit` ตรง ๆ แล้วเซฟพัง ·
  ใช้ `request.variant = :turbo_frame` + `edit.html+turbo_frame.erb`
- **`dom_id(post)` ทั้งสองฝั่ง** ทำ id ซ้ำกับ `<article>` → ใช้ `dom_id(post, :title)`
- **ข้อความ console ของ Turbo** ของจริงยาวกว่าในสไลด์ (`The response (200) did not contain the expected <turbo-frame …>`)
- **`broadcasts_to :post, later: true`** — turbo-rails 2.0.23 ไม่มี `later:` (ถูกเมินเงียบ ๆ · create ใช้ job อยู่แล้ว)
- **Solid Cable ใช้แค่ production** · dev ใช้ adapter `async`
- **ตัวนับคอมเมนต์ในแท็บอื่น** ต้องเพิ่ม `broadcast_update_later_to` อีกบรรทัด `broadcasts_to` อย่างเดียวไม่พอ
- **`grep -n "disconnect" app/javascript/**`** ได้ "Is a directory" → ใช้ `grep -rn`
- **`.size` vs `.count`** ตอน re-render หลังเซฟไม่ผ่าน `size` นับคอมเมนต์ที่ยังไม่เซฟด้วย

---

## pipeline (workflow 55 agent)

1. สร้างโค้ด lab เป็น checkpoint 4 ช่วง (ทีละช่วง เพราะต่อกัน)
2. เขียน 16 บทพร้อมกัน · แต่ละบท sandbox + DB ของตัวเอง (Postgres 18 ชั่วคราว พอร์ต 55432)
3. อ่านแบบมือใหม่ → คนเขียนแก้
4. auditor รันซ้ำทุกบล็อก + พิสูจน์เฉลย quiz
5. agent เดียวอ่าน 120 → 135 ตามลำดับ
6. cheat sheet เขียน + ตรวจ

รอบแรกชน usage limit หลังขั้น 4 ของบท 120–127 · resume workflow แล้วรันเฉพาะ 11 agent ที่ค้าง

---

## ที่เจอระหว่างทาง (เผื่อรอบหน้า)

- **ธีมกะพริบตอนโหลดเต็มหน้า** ถ้าธีมที่เก็บไว้ต่างจากธีมของเครื่อง (Stimulus `connect` รันหลัง paint) ·
  ไม่เกิดตอนเปลี่ยนหน้าผ่าน Turbo · ทางแก้จริงคือ cookie ให้ server อ่าน
- **daisyUI 5.7.50 ใช้ `--color-error` / `--color-success` ค่าเดียวกันทั้ง light และ dark** — ปุ่ม `btn-error` ไม่เปลี่ยนสีตอนสลับธีม ไม่ใช่บั๊ก
- **test ของ scaffold พังอยู่แล้วที่ `day3-start`** (fixture slug ซ้ำ 14 error) — ไม่ได้แก้ แค่บอกไว้
- **rack-mini-profiler ทำให้ HTML โตขึ้นนิดหน่อยทุก request** — ขนาดหน้าที่วัดในบทจะต่างจากเครื่องผู้เรียนเล็กน้อย
