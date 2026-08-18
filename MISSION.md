# Mission: เขียน Go ระดับ production ได้จริง

> ⚠️ **ฉบับร่าง — รอยืนยันจากผู้เรียน**
> ผมอนุมานจากบริบท (คอร์ส PEA DevPool "Enterprise Go Engineering with AI
> Integration" Day 3 + สไลด์ Docker / GitLab CI / GitOps / DevSecOps
> ในโฟลเดอร์เดียวกัน) ถ้าเป้าหมายจริงต่างจากนี้ บอกได้เลย แล้วผมจะแก้ไฟล์นี้
> พร้อมบันทึก learning record ไว้

## Why

กำลังเข้าอบรม Go แบบเข้มข้นเพื่อไปเขียน/ดูแล backend service ขององค์กร
เป้าหมายไม่ใช่ "รู้จัก syntax Go" แต่คือ **ส่งโค้ดที่ผ่าน code review และไม่พังบน
production** โดยเฉพาะบั๊กประเภทที่ compiler จับไม่ได้ — slice แชร์ memory กัน,
ลืมปิด resource, แก้ค่าแล้วไม่เปลี่ยนเพราะได้ copy มา

## Success looks like

- อ่านโค้ด Go ที่มี slice/map/pointer แล้ว **ทำนายผลลัพธ์ได้ถูกก่อนกดรัน**
- ชี้จุดที่ `append` จะไปทับข้อมูลของ slice ตัวอื่นได้ ในโค้ดที่ไม่เคยเห็นมาก่อน
- เลือกได้ว่าเมื่อไหร่ใช้ value receiver เมื่อไหร่ใช้ pointer receiver พร้อมเหตุผล
- เขียนฟังก์ชันที่เปิด resource แล้วปิดครบทุกทางออก โดยไม่ต้องนั่งไล่ `return`
- ทำ workshop ท้ายสไลด์แต่ละวันได้เองโดยไม่ต้องเปิดเฉลย

## Constraints

- **พึ่งเริ่มเรียน Go** — ยังไม่ต้องแตะ goroutine / channel / generics
- เรียนตามจังหวะคอร์ส (มีสไลด์ Day 1–3 แล้ว น่าจะมีต่อ)
- ภาษาไทยเป็นหลัก แต่ศัพท์เทคนิคคงไว้เป็นอังกฤษ (ต้องอ่าน doc อังกฤษได้ด้วย)
- แต่ละบทเรียนต้องจบได้ใน ~15 นาที

## Out of scope (ตอนนี้)

- Concurrency (goroutine, channel, `sync`, context) — รอคอร์สสอนถึง
- Generics / type parameter
- Docker / GitLab CI / GitOps — คนละ workspace ถึงจะอยู่โฟลเดอร์เดียวกัน
- ส่วน "AI Integration" ของคอร์ส — รอให้พื้นฐาน Go แน่นก่อน
