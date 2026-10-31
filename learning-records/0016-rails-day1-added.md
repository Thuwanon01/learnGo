# 0016 — เพิ่มฝั่งที่ 3: Ruby on Rails Day 1 (บท 90–105)

**วันที่:** 1 พฤศจิกายน 2026
**ที่มา:** สไลด์ `Ruby on Rails - Day 1.pdf` (80 หน้า) · ผู้เรียนสั่งให้เป็น "หมวดใหญ่ที่ 3 ต่อจาก backend, frontend"

---

## สิ่งที่เพิ่ม

| ฝั่ง | โฟลเดอร์ | `d` | บท | เรื่อง |
|---|---|---|---|---|
| RAILS | `rails-day-1/` | 201 | 90–105 | Ruby สำหรับคนมาจาก Go/TS (ตัวแปร · symbol/hash · block · truthiness · class/module · error · 5 เรื่องก่อนเข้า Rails) · rails new · naming · boot/request/MVC · routing · controller · view · debugger/console · Lab 1 |

รวมทั้งเว็บเป็น **105 บท · cheat sheet 15 ใบ** · สไลด์หน้า 73–80 (Architecture / Scaling) **ไม่ทำ** ตามที่ผู้เรียนสั่ง

---

## การตัดสินใจ

### 1 · `rails-day-N/` + `d = 200 + เลขวัน` แทน `day-10`

สไลด์ Rails กำกับวันของตัวเอง (Day 1–4) · ถ้าใช้ `day-10` เลขวันจะชนกับสไลด์ Go ที่อาจมาทีหลัง ·
แยกเป็นฝั่ง (track) ที่ 3 ใน `nav.js` (`RAILS`) · `FE_GROUP_ID` ใน `tools/build-search-index.py`
เปลี่ยนชื่อเป็น `GROUP_ID` เพราะตอนนี้ไม่ได้มีแค่ฝั่ง front

### 2 · รุ่นโปรแกรม: ใช้ของในเครื่อง ไม่ใช่ของสไลด์

สไลด์ใช้ Ruby 4.0.6 / Rails 8.1.3 · เครื่องมี Ruby 4.0.9 (mise) / Rails 8.1.4 · ผู้เรียนเลือกใช้รุ่นในเครื่อง
แล้วเขียนกำกับไว้ในกล่อง `.note` ของทุกบท · `ruby` ใน PATH ปกติคือ 2.6 ของระบบ ต้องตั้ง PATH ไปที่ mise ก่อน

### 3 · Postgres ชั่วคราวของตัวเอง

สร้าง container `slide-sandbox-pg` (พอร์ต 55432) แยกจาก `wongnok_blog-postgres-1` ของผู้เรียน
แล้วลบทิ้งเมื่อเสร็จ · ทุก agent `cp -Rc` แอปฐานเป็นของตัวเอง ใช้ DB และพอร์ตคนละชุด

### 4 · ผลรันที่โชว์พอร์ต 41xx

ผลจาก `curl` หลายบทมาจาก server ที่ agent เปิดบนพอร์ต 4090–4105 (เพื่อไม่ชนกัน) ·
ทุกบทมีกล่อง `.note` บอกว่าของผู้เรียนจะเป็น 3000 · เลือกไม่แก้ตัวเลข เพราะห้ามแต่ง output

---

## จุดที่สไลด์ผิดหรือไม่ตรงของจริง (auditor รันยืนยัน · ✔ = ผมรันซ้ำเองด้วย)

| หน้า | สไลด์เขียน | ผลจริง |
|---|---|---|
| 4 | `3.days.ago` `1.megabyte` อยู่ในกล่อง Ruby ล้วน | Ruby ล้วนได้ `NoMethodError` · ต้องมี Active Support |
| 14 | mise โหลด `.env` ให้เอง | `mise.toml` ในสไลด์มีแค่ `[tools]` → ไม่โหลด · ต้องเพิ่ม `[env] _.file = ".env"` |
| 21 | `nums.min / nums.max  # 1 / 5` | `/` ถูกรันเป็นหาร ได้ `0` · `nums.sort / nums.uniq` ได้ `NoMethodError` (ตั้งใจให้อ่านว่า "และ") |
| 26 | TS มี falsy "6 ตัว" แต่เขียนไว้ 5 | ขาด `false` · JS จริงมี 8 ค่า |
| 27 | `// Go: if x == 0 { x = 0 }` | ไม่ทำอะไรเลย · `||=` ไม่เหมือน `??=` ตรงค่า `false` |
| 29 | `include Sluggable` แล้ว `Post.new.slug  # ใช้ได้เลย` | `NameError` เพราะ Post ในสไลด์ไม่มี `title` |
| 32 | `blogPost.rb` ทำให้ Rails หาไฟล์ไม่เจอ | ✔ Rails 8.1.4 โหลดได้ และ `zeitwerk:check` ผ่าน |
| 36 | แนะนำ gem `annotate` | รุ่นล่าสุด (2022) รองรับแค่ activerecord < 8.0 · ตัวที่ยังดูแลคือ `annotaterb` |
| 39 | Rails มี 10 ชิ้น | `gem dependency rails` มี 12 (ขาด actionmailbox · railties) |
| 40 | `rails new` ได้ git repo ที่ commit แรกให้แล้ว | ✔ แค่ `git init` · `git log` บอกว่ายังไม่มี commit |
| 42 | ต้นไม้มี `db/migrate/` `db/schema.rb` | แอปใหม่ไม่มีทั้งคู่ |
| 44 | Gemfile มี `ruby "4.0.6"` | ไม่มีบรรทัดนี้ · รุ่นอยู่ใน `.ruby-version` |
| 48 | `bin/rails -T` แสดง routes / middleware / stats | ไม่แสดงเลย (อยู่ใน `bin/rails --help`) · RubyGems ในตัวอย่างเป็นรุ่นเก่า |
| 49 | `config.ru` คือจุดเริ่มจริง · ไม่มี `environment.rb` | `bin/rails` → `boot.rb` → `application.rb` ก่อน · dev โหลด routes ตอน request แรก |
| 50 | CSRF อยู่ใน middleware | ไม่อยู่ใน `bin/rails middleware` · เช็คใน controller |
| 56 | `post_url(42)` ได้ `http://localhost:3000/...` | จริงแค่ใน request · ใน runner ได้ `Missing host to link to!` |
| 58 | `resources :posts` 6 แถว | ได้ 8 (ขาด edit กับ PUT) · ชื่อ `new_post`/`post` ไม่ได้มาจากโค้ดหน้า 54 |
| 60 | `class GreetingsController` / `< ApplicationController` แยกสองบรรทัด | ✔ `SyntaxError` (น่าจะตัดให้พอดีกล่อง) |
| 61 | ค่าใน `params` เป็น string เสมอ | JSON body ได้ Integer · `?page[]=2` ได้ Array |
| 62 vs 51 | `:unprocessable_entity` กับ `unprocessable_content` | ได้ 422 ทั้งคู่ · Rack 3.2 ถือว่าชื่อแรกเลิกใช้แล้ว |
| 63 | `before_action only: %i[show edit update]` ทั้งที่ยังเขียน action ไม่ครบ | dev ได้ 404 ทุก action (`raise_on_missing_callback_actions`) |
| 67–68 | ผล rdbg มี `=>` · prompt `irb>` · `app.get "/posts"` ได้ 200 | ไม่มี `=>` · prompt เป็น `ชื่อแอป(dev):001>` · ✔ `app.get` ได้ **403** (Blocked hosts) |
| 72 | สลับ `/about` กับ `/about/:id` แล้วผลต่าง | ทดสอบ 5 URL ผลเหมือนกัน · ลำดับสำคัญเมื่อมี route แบบ static อยู่ใต้ `:id` |

---

## บทเรียนสำหรับรอบหน้า

1. **`rails new --css=tailwind` สั่ง `gem install foreman` เอง** · เครื่องนี้มี foreman 0.90.0 อยู่แล้วเลยไม่มีอะไรเปลี่ยน
   แต่ถ้าห้าม `gem install` จริงจัง ต้องสั่ง agent ให้ใช้ shim
2. **ไฟล์ใน scratchpad หายอีกแล้ว** (รอบนี้ `nocache.py` กลายเป็นไฟล์ว่าง) · เขียนใหม่ได้ใน 10 บรรทัด
   แต่ต้องเช็คก่อนใช้ทุกครั้ง
3. agent ชุดตรวจจับจุดเล็ก ๆ ได้จริง (เช่น `gem dependency rails` เป็น pattern ได้ 9 gem) ·
   ผมสุ่มรันซ้ำ 3 ข้อที่ดูน่าสงสัยที่สุด ตรงกับรายงานทั้งหมด
