# 0015 — เพิ่มกลุ่ม Next.js App (บท 79–85) และ Agentic Workflow (บท 86–89)

**วันที่:** 15 กันยายน 2026
**ที่มา:** ได้สไลด์เพิ่มสองไฟล์ใน `from_teacher/frontend/` —
`[PEA] Build First Application with Nextjs.pdf` (50 หน้า) และ `[PEA] Agentic_Workflow.pdf` (40 หน้า)

---

## สิ่งที่เพิ่ม

| กลุ่ม | โฟลเดอร์ | `d` | บท | เรื่อง |
|---|---|---|---|---|
| Next.js App | `fe-nextjs-app/` | 104 | 79–85 | โครงโฟลเดอร์ components/containers · shadcn/ui · design tokens · CVA · layout/navbar · RecipeCard 4 สถานะ · โจทย์หน้า All Recipes |
| Agentic | `fe-agentic/` | 105 | 86–89 | Claude Code · workflow 5 ขั้น · prompt ที่ดี 6 หลัก (แบ่งสองบท) |

รวมทั้งเว็บเป็น **89 บท · cheat sheet 14 ใบ** · สองไฟล์ไม่ได้กำกับวันมาเหมือนเดิม จึงอยู่ฝั่ง FRONT

**ลำดับกลุ่ม:** เอา Next.js App ไว้ก่อน Agentic เพราะเป็นภาคต่อตรง ๆ ของบท 69–78
และบท Agentic ใช้แอปที่เพิ่งสร้างเป็นตัวอย่างงานจริงได้

---

## การตัดสินใจที่ต่างจากรอบก่อน

### 1 · sandbox คนละชุดต่อ agent (แก้บทเรียนข้อ 2 ของ 0014)

เตรียม `app-base` หนึ่งชุด แล้วให้ agent ทุกตัว `cp -Rc` เป็นของตัวเอง (APFS clone ~5 วินาที ไม่กินที่)
ลอง symlink `node_modules` ก่อนแล้ว Turbopack ปฏิเสธ · รายละเอียดใน NOTES.md

### 2 · ฝังกติกาทั้งหมดลงในสคริปต์ workflow (แก้บทเรียนข้อ 1 ของ 0014)

รอบนี้ไฟล์ใน scratchpad **หายอีกแล้ว** ตั้งแต่ก่อนเริ่ม (BRIEF · verify.py · mksweep.py · sandbox เดิม)
แต่ไม่กระทบ เพราะเกณฑ์ทุกข้อ (องค์ประกอบขั้นต่ำ · ข้อห้าม · กติกา sandbox · ห้าม pkill กว้าง)
อยู่ในตัวสคริปต์เองแล้ว · ผลที่วัดได้: **ทั้ง 11 บทผ่านเกณฑ์ขั้นต่ำครบ** ไม่มีบทไหนขาดอย่างเป็นระบบเหมือนรอบ 0014

### 3 · กลุ่ม Agentic ห้ามแต่งคำตอบของ AI

บทเกี่ยวกับ prompt ล่อให้เขียนกล่อง "AI จะตอบว่า…" มาก · กำหนดไว้ว่าห้าม และห้ามรัน `claude` แบบส่ง prompt
(มีค่าใช้จ่าย ผลไม่ซ้ำ ตรวจซ้ำไม่ได้) · ของที่รันซ้ำได้ (git · tsc · eslint · next build ในขั้น Evaluate/Commit)
รันจริงใน sandbox ทั้งหมด · prompt ในสไลด์ถอดตามจริงเป๊ะแล้ววิเคราะห์

---

## จุดที่สไลด์ผิดหรือไม่ตรงของจริง (auditor รันยืนยันแล้ว)

| สไลด์ | หน้า | สไลด์เขียน | ผลจริง |
|---|---|---|---|
| Build First App | 14 | `npm shadcn@latest add button` | `Unknown command: "shadcn@latest"` · ที่ถูกคือ `npx` (ผมรันเองด้วย) |
| Build First App | 7 | โฟลเดอร์ `[another-routes]/` | วงเล็บเหลี่ยม = dynamic segment จริง ๆ กิน URL `/recipes` `/widgets` ไปหมด |
| Build First App | 15 | `cn` import จาก `@/lib/utils` | shadcn 4.21 import จากแพ็กเกจ `cn` (ต่างเพราะเวอร์ชัน ไม่ใช่ผิด) |
| Build First App | 27 | ใส่ token ใหม่ใน `:root` อย่างเดียว | ไม่ map ใน `@theme inline` → class ไม่มี CSS และ build ไม่ฟ้อง |
| Build First App | 39 | ใช้ `<Container>` · class `wongnok-text-*` | ไม่มีหน้าไหนนิยาม · class ไม่มี CSS ในโปรเจกต์เปล่า · `fixed top-0` บังเนื้อหา |
| Build First App | 48 | `grid-cols-4` · "8 recipes · page 1 of 7" เหนือการ์ด 12 ใบ | ไม่ responsive (ขัดกับ prompt ในหน้า 23 เอง) · ข้อความเป็น mock |
| Build First App | 49 | `"use client"` ใน RecipeList | ไม่จำเป็น (ไม่มี hook/event) — build/tsc/eslint ผ่านทั้งแบบมีและไม่มี |
| Agentic | 17 vs 12 | eval ไม่ผ่าน "loop back to Code" | แผนภาพหน้า 12 ลากลูกศรกลับทั้ง Plan และ Code |
| Agentic | 28 | FINAL ANSWER: Maximum Profit = $1,520 | 6×40 + 4×60 + 8×80 = **1,120** (รันด้วย node) · ตัวเลขในโน้ต "คำตอบผิด" 3 อันก็คำนวณไม่ตรง |
| Agentic | 3 | Agenda มี "04 Recap" | สไลด์จบที่หน้า 40 ไม่มีหน้า Recap |

---

## สิ่งที่ต้องจับตา

- **บท 84 กับ 85 วาง RecipeList ต่างที่กัน** (84 อยู่ `components/` รับ `recipe` ทั้งก้อน ·
  85 อยู่ `containers/` ตามสไลด์หน้า 49 รับ props แยก) — บท 85 อธิบายความต่างไว้ในกล่อง .note แล้ว
  แต่ถ้าผู้เรียนสับสน ควรปรับให้ตรงกัน
- ลิงก์ Medium (Dan Abramov) ในบท 79 ได้ 403 กับ curl เพราะ Cloudflare แต่เปิดในเบราว์เซอร์ได้ปกติ
