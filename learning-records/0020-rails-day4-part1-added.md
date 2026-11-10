# 0020 — เพิ่ม Rails Day 4 · Part 1 (บท 136–145) แล้วตัดจบ

**วันที่:** 10 พฤศจิกายน 2026
**ที่มา:** สไลด์ Day 4 สองไฟล์ (Part 1 = บล็อก D E F · Part 2 = บล็อก G–K วันสุดท้าย) · สไตล์มือใหม่เหมือน Day 1–3

---

## เนื้อหาที่ได้

| บท | เรื่อง |
|---|---|
| 136–141 | **บล็อก D:** rich text · allowlist · Action Text · object storage (MinIO) · Active Storage · signed URL · direct upload · variant · ตรวจไฟล์จากเนื้อจริง · Lab Vibe 4 |
| 142–145 | **บล็อก E:** background job · exactly-once ไม่มีจริง · idempotency · Solid Queue · retry · งานตามเวลา · อีเมล · Lab Vibe 5 |

## ที่ไม่ได้ทำ (ผู้เรียนสั่งตัดจบ)

- บล็อก F (cache · บท 146–148 ตามแผนเดิม)
- Day 4 Part 2 ทั้งหมด (login ด้วย Keycloak · สิทธิ์ · code quality · test · compose · บท 149–161 ตามแผนเดิม)
- cheat sheet ของ Day 4 → `nav.js` จึงรองรับกลุ่มที่**ไม่มี** `sheetLabel` (ไม่แสดงลิงก์ 📄)

เหตุผล: workflow รอบแรกใช้ ~7.6M token ไปกับ 26 agent แล้วชน usage limit ·
งานที่เหลือ (โค้ด lab ฝั่ง Keycloak + 16 บท) ใหญ่กว่าที่ทำไปแล้ว · ผู้เรียนตัดสินใจว่าถึง Day 3 ก็พอ ได้เท่าไหนเอาเท่านั้น

**ถ้าจะทำต่อ:** สคริปต์ workflow แบบประหยัด (agent ละหลายบท · บทสั้นลงครึ่งหนึ่ง · ตรวจตัวเอง) เคยร่างไว้ใน scratchpad ชั่วคราว (ไม่ได้เก็บในรีโป) ·
เลขบทถัดไปคือ 146 · บท 145 ปิดท้ายด้วย "บทนี้คือบทสุดท้ายของเว็บตอนนี้" ต้องแก้ตอนเพิ่ม

---

## การตัดสินใจ

- **development ใช้ DB เดียว** (ตาราง Solid Queue อยู่ใน DB หลัก) — อาจารย์ใช้ 4 DB · ของเราตั้งค่าน้อยกว่า
- **ไม่ใช้ mailpit** — อีเมลใน dev ดูจากไฟล์/log
- **credentials แยกตาม environment** (`credentials:edit --environment development`) เพราะ `credentials.yml.enc` ใน repo ของคอร์สไม่มี master.key ให้
- โค้ด lab สร้างเป็น checkpoint (tag `our-d1` … `our-e`) ก่อนเขียน เหมือน Day 3

## สไลด์ไม่ตรงกับของจริง (รันพิสูจน์แล้ว)

- `active_storage:install` ไม่สร้างอะไรเลย — `action_text:install` สร้างตารางให้แล้ว
- **เช็ค `content_type` ไม่จับไฟล์ .txt ที่เปลี่ยนชื่อเป็น .png** (Marcel ตกไปใช้ชนิดที่ประกาศมา) → ตรวจ magic bytes จากเนื้อไฟล์เอง
- เกณฑ์ "≤ 6 query" ผ่านได้ก็ต่อเมื่อตั้ง `track_variants = false` (ไม่งั้น 8–10 query)
- URL ใน `<img src>` เป็น URL ของ Rails ที่ไม่หมดอายุ · ที่หมดใน 5 นาทีคือ URL ของ MinIO หลัง redirect
- actiontext.css ไม่อยู่ใน CSS layer → ทับ utility ของ Tailwind v4 ทุกตัว · ต้อง import แบบ `layer(components)`
- `with_rich_text_body` ทำให้ Bullet เตือนผิด ๆ
- MinIO (pgsty/silo) ไม่ต้องตั้ง CORS · AWS S3 จริงต้องตั้ง

## ข้อควรระวัง

- บท 143 ผ่านแค่ขั้นเขียน + ผู้อ่านมือใหม่ · บท 144–145 ผ่านแค่ขั้นเขียน — **ยังไม่มี auditor รันซ้ำ** (ตรวจแค่โครงสร้าง/ลิงก์)
- ลิงก์ในบทที่ชี้ไปบทที่ไม่ได้ทำ (146 · 151 · 153 · 156–159) แก้เป็นข้อความธรรมดาแล้ว
