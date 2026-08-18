# Go Glossary (workspace นี้)

ภาษากลางของ workspace ทุก lesson และ reference ต้องใช้คำตามนี้ให้ตรงกัน

> **สถานะ:** ยังไม่มีคำไหนถูก "รับรอง" — ตามกฎของ workspace คำจะถูกเพิ่มเข้ามา
> ก็ต่อเมื่อผู้เรียนแสดงให้เห็นว่า **ใช้มันได้ถูกต้อง** แล้วเท่านั้น ไม่ใช่แค่เคยเห็น
> ส่วนด้านล่างคือ *ข้อตกลงเรื่องคำศัพท์* ที่ตั้งไว้ก่อน เพื่อไม่ให้เรียกของสิ่งเดียวกัน
> ด้วยหลายชื่อจนสับสน

## ข้อตกลงเรื่องภาษา

- **ศัพท์เทคนิคคงเป็นอังกฤษเสมอ** — slice, pointer, receiver, closure, panic
  ไม่แปลเป็นไทย เพราะต้องอ่าน doc อังกฤษและคุยกับ reviewer ได้
- **คำอธิบายเป็นไทย** — ประโยครอบ ๆ ศัพท์เป็นภาษาไทยล้วน
- เขียน `cap` / `len` ตัวเล็กเสมอ (ตามชื่อ builtin) ไม่ใช่ Cap / Len
  ยกเว้นตอนอ้างถึงช่องใน slice header จะเขียน `Cap` / `Len` ตัวใหญ่

## คำที่ต้องแยกให้ชัด (มักถูกใช้สลับกันจนงง)

**Slice header** vs **underlying array**:
Slice header คือโครงสร้าง 24 bytes ที่เก็บ `Data`/`Len`/`Cap` — **ไม่ได้เก็บข้อมูล**
underlying array คือ array จริงบน heap ที่เก็บข้อมูล
_อย่าเรียกรวมว่า "ตัว slice"_ เพราะจุดสับสนทั้งหมดอยู่ตรงที่มันเป็นคนละก้อนกัน

**Aliasing** (คำที่ใช้ใน workspace นี้):
อาการที่ slice สองตัวชี้ underlying array ก้อนเดียวกัน ทำให้แก้ตัวหนึ่งแล้วอีกตัวเปลี่ยน
_Avoid_: "slice corruption" (คำในสไลด์คอร์ส) — คำนั้นบรรยายอาการ ไม่ใช่สาเหตุ
เราใช้ aliasing เพราะตรงกับที่โลกภายนอกเรียก

**Addressable**:
คุณสมบัติของนิพจน์ที่เอา `&` ไปวางข้างหน้าได้ ตัวแปร / field ของ struct /
element ของ slice เป็น addressable ส่วน map value / literal / ผลลัพธ์ฟังก์ชัน ไม่ใช่
_Avoid_: "แก้ไม่ได้", "เป็น read-only" — สองคำนี้ผิดความหมาย

**Pass by value**:
Go ส่งค่าแบบก็อปเสมอ **ทุกกรณีไม่มีข้อยกเว้น** การส่ง pointer คือการก็อป *ที่อยู่*
_Avoid_: "pass by reference" — Go ไม่มีสิ่งนี้ การใช้คำนี้ทำให้เข้าใจ slice/map ผิดทั้งหมด

**Receiver**:
parameter พิเศษที่วางไว้หน้าชื่อ method เพื่อผูก method นั้นเข้ากับ type
_Avoid_: "this", "self" — Go ไม่มี keyword พวกนี้ และ receiver ตั้งชื่ออะไรก็ได้

**Exported** / **unexported**:
ชื่อขึ้นต้นตัวใหญ่ = exported (package อื่นเห็น) · ตัวเล็ก = unexported
_Avoid_: "public" / "private" — ใกล้เคียงแต่ไม่ตรง เพราะขอบเขตของ Go คือ **package**
ไม่ใช่ class หรือไฟล์

## คำที่จะถูกเพิ่มเมื่อผู้เรียนพิสูจน์แล้วว่าใช้เป็น

รอหลักฐานจาก quiz / ภารกิจในบทเรียน 0001–0003:
`cap` · `three-index slice` · `nil slice` vs `nil map` · `comma-ok` ·
`escape analysis` · `promotion` · `LIFO` · `named return value`
