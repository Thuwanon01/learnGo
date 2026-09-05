# CLAUDE.md — คู่มือทำงานในรีโปนี้

> ไฟล์นี้ตั้งใจให้**สั้น** เพราะถูกโหลดเข้า context ทุก session
> รายละเอียดอยู่ใน [ARCHITECTURE.md](ARCHITECTURE.md) และ [NOTES.md](NOTES.md) — อ่านเมื่อต้องใช้

## รีโปนี้คืออะไร

เว็บบทเรียนภาษาไทย **static ล้วน ไม่มี build step ไม่มี dependency**
เรียบเรียงจากสไลด์คอร์ส PEA DevPool — Enterprise Go Engineering with AI Integration
ตอนนี้มี **78 บท** แบ่งเป็นสองฝั่ง · deploy จริงบน Vercel ให้เพื่อนร่วมคอร์สใช้

| ฝั่ง | เนื้อหา | โฟลเดอร์ | บท |
|---|---|---|---|
| **BACK** | Go — พื้นฐาน · testing · concurrency · database · Gin · Keycloak | `day-1/` … `day-9/` | 01–55 |
| **FRONT** | HTML/CSS · Functional Programming with TypeScript · Next.js | `fe-html-css/` · `fe-ts-fp/` · `fe-nextjs/` | 56–78 |

**ฝั่ง FRONT แบ่งกลุ่มตามชื่อไฟล์สไลด์ ไม่ใช่ตามวัน** เพราะอาจารย์ไม่ได้กำกับวันมาให้ ·
**เลขบทต่อเนื่องกันทั้งเว็บ ห้ามรีเซ็ตตามฝั่ง** (เลขบทคือคีย์ของ localStorage)
รีโปนี้เป็น **teaching workspace ของ skill `/teach`** (โครง MISSION / RESOURCES /
learning-records / lessons / reference / assets / NOTES)

## กฎที่ห้ามผิด

1. **`from_teacher/` ห้าม commit** — PDF ของ PEA DevPool (~58 MB) · gitignore ไว้แล้ว
   และห้ามลิงก์ถึงจากหน้าเว็บ
2. **ห้ามแต่ง output** — ทุกผลรันที่โชว์ต้องรันจริงก่อน · โค้ดที่อ้างว่าเป็น "ไฟล์"
   ต้องมี `package` + `import` ครบและ `go build` ผ่าน
3. **ห้ามแก้ `data-answer` หรือสลับตัวเลือก quiz เพราะ "คิดว่าเฉลยผิด"** —
   ต้องพิสูจน์ด้วยผลรันจริงก่อน · `data-answer` นับจาก 0 แต่ "ตัวเลือกที่ N"
   ในคำอธิบายนับจาก 1 **ตั้งใจให้ต่างกัน**
4. **ลำดับสอน 3 ขั้นเสมอ** — อธิบายภาษาคน → `.analogy` (ต้องมีท่อน "ที่ไม่เหมือนกัน:")
   → `.jargon` (ศัพท์ที่เอาไปคุยกับ senior/AI ได้)
5. **ของที่ใช้ซ้ำอยู่ใน `assets/` ห้าม inline ในบทเรียน** ·
   ก่อนเอา component เดิมไปใช้ที่ใหม่ ต้องเช็คก่อนว่า CSS + JS รองรับ
6. **ยึดไฟล์จริงเป็นสัญญา ไม่ใช่เอกสาร** — ถ้าเอกสารขัดกับโค้ด ไฟล์ถูก แล้วมาแก้เอกสาร

## สิทธิ์ที่ผู้เรียนให้ไว้ล่วงหน้าแล้ว

- **สไลด์วันใหม่มา = ทำบทเรียนแล้ว `git push` ได้เลย ไม่ต้องถาม** (อนุญาตไว้ 18 ส.ค. 2026)
  รายงานพร้อม commit hash
- ขอบเขตแค่นี้ — **ลบไฟล์ · rewrite history · หรืออะไรนอกเหนือจากการเพิ่มเนื้อหาบทเรียน ยังต้องถามก่อน**

## workspace นี้สร้างด้วย skill `/teach`

โครงทั้งหมด (`MISSION.md` · `RESOURCES.md` · `learning-records/` · `lessons/` ·
`reference/` · `assets/` · `NOTES.md`) มาจากสัญญาของ skill `/teach`
ที่ `~/.claude/skills/teach/SKILL.md` — ปรัชญาเบื้องหลังบทเรียนทุกบทอยู่ในนั้น
(fluency vs storage strength · zone of proximal development · knowledge → skills → wisdom)
**ที่รีโปนี้ทำต่างจาก skill โดยตั้งใจ อ่าน `ARCHITECTURE.md` §6**

`/teach` ตั้ง `disable-model-invocation: true` ไว้เอง และ CLAUDE.md ส่วนตัวของผู้ใช้
กำหนดว่า **skill ทุกตัวเรียกด้วยมือเท่านั้น** → ถ้าผู้ใช้ไม่ได้พิมพ์ `/teach` มา
ให้ทำงานตาม `ARCHITECTURE.md` ได้เลย ไม่ต้องเรียก skill และไม่ต้องแตก subagent

## จะทำอะไร อ่านตรงไหน

| งาน | อ่าน |
|---|---|
| เพิ่มวันใหม่จากสไลด์ | `ARCHITECTURE.md` §8 (pipeline 10 ขั้น) |
| เขียน/แก้บทเรียน | `ARCHITECTURE.md` §3 (สัญญา markup) + §7 (หลักการสอน) |
| แตะ `assets/` หรือ `tools/` | `ARCHITECTURE.md` §4–5 |
| ตรวจงานก่อน push | `ARCHITECTURE.md` §9 |
| จะสอนอะไรต่อ | `MISSION.md` + `NOTES.md` §Backlog |
| เคยพลาดอะไรมาแล้วบ้าง | `NOTES.md` §เรื่องเทคนิค (ยาว แต่คุ้ม) |
| ศัพท์ที่ต้องใช้ให้ตรงกัน | `GLOSSARY.md` |

## เช็คลิสต์เพิ่มวันใหม่ (ฉบับย่อ)

```
1  สไลด์กำกับวันมา → mkdir -p day-N/lessons day-N/reference
   ไม่ได้กำกับวัน  → mkdir -p fe-<slug>/lessons fe-<slug>/reference   (slug จากชื่อสไลด์)
2  เขียนบทต่อจากเลขล่าสุด (ตอนนี้จบที่ 0078) + cheat sheet ของกลุ่ม
3  index.html      → section กลุ่มใหม่ + data-id + data-track + เลขรวม
4  บทสุดท้ายของกลุ่มก่อน → แก้ nav ให้ชี้มาบทแรกของกลุ่มใหม่
5  assets/nav.js   → เพิ่มลง DAYS (ฝั่ง back) หรือ FRONT (ฝั่ง front)
                     ⚠️ ลืมแล้วไม่มีอะไรฟ้อง แค่ไม่โผล่ในเมนู
                     กลุ่มใหม่ฝั่ง front ต้องแจกเลข d แล้วใส่ FE_GROUP_ID ใน
                     tools/build-search-index.py ให้ตรงกันด้วย
6  ทุกหน้าใหม่     → <script src="../../assets/nav.js" defer></script>
                     (บท HTML/CSS เพิ่ม assets/demo.js ด้วยถ้าใช้กล่อง .demo)
7  python3 tools/add-heading-ids.py
   python3 tools/build-search-index.py     # ตามลำดับนี้เท่านั้น
8  ตรวจลิงก์ + layout + git status --porcelain | grep '^??'
9  learning-record + เพิ่มบรรทัดใน DOCS ของ docs.html
10 git add . && git commit && git push
```

**ไม่ต้องทำเอง:** ปุ่ม "ทำบทนี้เสร็จแล้ว" — `quiz.js` อ่านเลขบทจากชื่อไฟล์แล้วแทรกให้เอง

## คำสั่งที่ใช้บ่อย

```bash
python3 tools/build-search-index.py --check   # ตรวจว่าคลังคำตรงกับไฟล์จริง
python3 -m http.server 8000                   # docs.html เปิดด้วย file:// ไม่ได้ (CORS)
pdftotext -layout from_teacher/<file>.pdf -   # อ่านสไลด์เป็นข้อความ
pdftoppm -jpeg -r 100 <file>.pdf <out>/p      # สไลด์ที่เป็นภาพ ต้องแปลงเป็นรูปก่อนอ่าน
tsc --noEmit --strict <file>.ts               # ตรวจตัวอย่าง TypeScript (มี tsc 7 + node 24)
```

## กับดักที่เสียเวลาที่สุด (ย่อจาก NOTES.md)

- **browser cache ทำให้ layout sweep "ผ่าน" แบบปลอม** → เสิร์ฟด้วย `Cache-Control: no-store`
  และ **ทดสอบตัวตรวจด้วยการใส่บั๊กกลับเข้าไปก่อนเชื่อว่า "0 จุด"**
- **`id` หัวข้อนับตามตำแหน่ง** — แทรก `<h2>` กลางบทเก่าแล้วเลขจะเลื่อนทั้งหมด
  สคริปต์จะ `exit 1` ไม่เขียนทับเงียบ ๆ · ต้องสั่ง `--renumber` เอง
- **`404.html` ต้องใช้ `/assets/...` แบบ root-absolute** เพราะ Vercel เสิร์ฟจาก URL ไหนก็ได้
- **คีย์ `localStorage` `go-course-progress-v1`** ใช้ทั้ง `progress.js` และ `quiz.js`
  — แก้ที่ไหนต้องแก้ทั้งสองที่ · (อีกคีย์คือ `go-course-track-v1` ของ `nav.js` ล้วน ๆ)
- **กล่อง `.demo` ต้องติดคลาส `is-live` ก่อน `appendChild`** ไม่งั้น iframe ถูกใส่ตอนแม่
  ยังเป็น `display:none` → กว้าง 0 → วัดความสูงได้เป็นค่ามหาศาล
- **ห้าม `innerHTML` ในส่วนค้นหาของ `nav.js`** ข้อความในคลังมาจาก HTML ของบทเรียน
- **ผลตรวจจาก subagent เชื่อทันทีไม่ได้** — มันผิดได้สองทาง ทั้งรายงานว่าผิดทั้งที่ถูก
  และดัดผลให้ตรงกับคำถามใน brief · **brief ที่เราเขียนเองก็ผิดได้** ต้องเขียนกำกับเสมอว่า
  "ถ้าผลจริงต่างจากที่คำถามคาดไว้ ให้รายงานตามจริง อย่าดัดให้ตรงคำถาม"
