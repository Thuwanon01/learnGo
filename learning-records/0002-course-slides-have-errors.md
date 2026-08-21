# สไลด์ของคอร์สมีจุดผิด — ต้องรันโค้ดยืนยันก่อนสอนทุกครั้ง

ตรวจสไลด์เทียบกับการรันจริงบน Go 1.26.5 แล้วพบจุดที่สไลด์ผิด 20 จุด
จึงตั้งเป็นกฎของ workspace นี้ว่า **ตัวอย่างโค้ดทุกอันต้องรันจริงก่อนใส่ในบทเรียน**

**Evidence — จุดที่พบ:**

| วัน | หัวข้อในสไลด์ | สไลด์เขียน | ผลรันจริง |
|---|---|---|---|
| 3 | For range in slice | `// [1 3]` | **`[2 3]`** — `iota` ให้ `[0 2 3 4]` และ `range` ใช้ snapshot ของ slice header ตอนเริ่มลูป |
| 3 | Growth strategy | ">256 โต 1.25x" | ใกล้เคียงเท่านั้น: `512 → 848` สูตรจริงคือ `newcap + (newcap+768)/4` แล้วปัดตาม memory size class |
| 3 | Map non-addressable | `Person{Age int}` แต่ init ด้วย `new(int)` | type ไม่ตรง (`*int` vs `int`) — compile ไม่ผ่าน |
| 3 | Defer argument | `i := 1` ซ้ำ 3 ครั้งใน scope เดียว | `no new variables on left side` — เป็น pseudo-code ต้องแยกเป็น 3 ตัวอย่าง |
| 4 | errors.New / fmt.Errorf | `func Withdraw(...) error` แล้วขึ้นบรรทัดใหม่ค่อยเปิด `{` | `syntax error: unexpected semicolon or newline before {` — Go เติม semicolon ท้ายบรรทัดอัตโนมัติ ปีกกาเปิดต้องอยู่บรรทัดเดียวกัน (น่าจะเป็นการตัดบรรทัดตอนทำสไลด์) |
| 5 | Test in Go → options | `-tag=<tagName>` | flag จริงคือ **`-tags`** (พหูพจน์) · ใช้ `-tag` ได้ `flag provided but not defined: -tag` |
| 5 | Testify (เทียบกับ testing ล้วน) | `assert.Equal(t, 90.0, result)` โดยที่ `result` เป็น `int` | **เทสไม่ผ่าน** — `expected: float64(90) / actual: int(90)` เพราะ `assert.Equal` ใช้ `reflect.DeepEqual` ซึ่งเทียบ type ด้วย · ต้องเขียน `assert.Equal(t, 90, result)` |
| 5 | Syntax → Parallel | `t.Logf("แบบ parallel ใช้เวลา: %v", time.Since(start))` โดยวัดในบล็อกเดียวกับที่สร้าง parallel subtest | ได้ **139µs** ซึ่งไม่ใช่เวลารันจริง — `t.Parallel()` จอดเทสไว้แล้วคืนการควบคุมทันที ตอน `Logf` ทำงานยังไม่มีเทสไหนได้รัน · วัดถูกวิธี (นอกบล็อก) ได้ **201ms** เทียบกับ sequential **1.006s** |
| 6 | Problem before Generics → ฝั่ง "ใช้ any" | `func Sum(values []any) any` ที่มี `var total any` แล้ว `total.(int) + v` | **panic ตอนรัน** — `interface conversion: interface {} is nil, not int` · `var total any` ได้ `nil` ไม่ใช่ `0` · สไลด์ยกมาเป็น "ทางเลือกที่ใช้ได้แต่ไม่สวย" ทั้งที่มันใช้ไม่ได้เลย (ทำให้เหตุผลของ generics แข็งแรงกว่าที่สไลด์ตั้งใจ) |
| 6 | Generics Struct → API Response | ประกาศ `type Result[T any] struct { Data T; Success bool }` แต่ใช้งานด้วย `Result[User]{Data: ..., Count: 29301}` | **คอมไพล์ไม่ผ่าน** — `unknown field Count in struct literal of type Result[User]` · `Count` ค้างมาจากสไลด์หน้าก่อนที่ struct ยังมี field นั้น |
| 6 | `time.Sleep()` | `import "fmt"` อย่างเดียว แต่เรียก `time.Sleep(time.Second)` | `undefined: time` — ขาด `import "time"` |
| 7 | Advance Mock With Mockery | `mockery --version` | `Error: unknown flag: --version` — v3.7.3 ใช้ subcommand `mockery version` |
| 7 | Advance Mock With Mockery | `mockery generate mock` | `Error: unknown command "generate" for "mockery"` — v3 สั่ง generate ด้วยการรัน `mockery` เปล่า ๆ |
| 7 | Advance Mock With Mockery | config ชื่อ `mockery.yml` | `getting config: discovering mockery config: file not found` — **ต้องมีจุดนำหน้า** `.mockery.yml` (หรือ `.mockery.yaml`) เท่านั้น · ตัว `mockery init` เองก็สร้างไฟล์ที่มีจุด |
| 7 | Migrate and Seed → Goose | แสดงไฟล์ migration ที่มี `-- +goose StatementBegin` / `StatementEnd` ราวกับเป็นสิ่งที่ `goose create` สร้างให้ | template จริงของ v3.27.3 มีแค่ `-- +goose Up` กับ `-- +goose Down` · `StatementBegin/End` ต้องพิมพ์เพิ่มเอง และจำเป็นเฉพาะตอน statement มี `;` ข้างใน (function / trigger / DO block) |
| 7 | Integration test → TestContainer | `go get github.com/testcontainers/testcontainers-go` บรรทัดเดียว แล้วใช้ `tcpostgres.Run` ได้เลย | `no required module provides package github.com/testcontainers/testcontainers-go/modules/postgres` — **module postgres เป็นคนละ Go module** ต้อง `go get` แยกอีกบรรทัด |
| 8 | RESTful Standard & Rules Practice (หน้า 35) | ติด `// ✅ แนะนำ` ไว้เหนือ `POST /users/create` + `POST /users/123/delete` และ `// ❌ แบบนี้ไม่แนะนำ` เหนือ `POST /users` + `DELETE /users/123` | **ติดเครื่องหมายกลับด้าน** — ขัดกับตัวกฎข้อ 7 ที่เขียนอยู่ข้าง ๆ ("อย่าใส่ Action ใน URI ถ้า HTTP Method สื่อได้แล้ว") และขัดกับสไลด์หน้า 22 ที่บอกเองว่า `POST /users` = สร้าง, `DELETE /users/123` = ลบ · หน้า 36 ที่ต่อจากกันเขียนถูก (`PATCH /users/123/suspend` = ✅ เพราะเป็น action ที่ method สื่อไม่ได้) |
| 8 | ต่อ Swagger UI เข้ากับ Gin (หน้า 55) | "blank import `_ "wongnok/docs"` — ไม่ใส่ = เปิดหน้า Swagger แล้ว **404**" | อาการจริงไม่ใช่ 404 · ทดสอบด้วย `httptest` บน gin-swagger v1.6.1: `GET /swagger/index.html` → **200** (หน้า UI ยังเปิดได้ เพราะไฟล์ static มากับ `swaggo/files`) แต่ `GET /swagger/doc.json` → **500 body ว่าง** → อาการที่เห็นคือ "หน้า Swagger เปิดได้ แต่ไม่มี endpoint สักอัน" · หลักการไม่ผิด (blank import จำเป็นจริง) แต่คนที่ไล่หา 404 จะหาไม่เจอ |
| 8 | CORS Middleware (หน้า 47) | หัวข้อ "CORS Middleware" แต่คำบรรยายใต้หัวข้อคือ "หากมีการเรียก operation เดิมซ้ำหลายครั้ง ผลลัพธ์สุดท้ายควรเหมือนเรียกเพียงครั้งเดียว" | เป็นคำนิยามของ **Idempotency** (หน้า 39) ที่ copy ค้างมา ไม่เกี่ยวกับ CORS เลย · ไม่ใช่ error เชิงเทคนิค แต่ผู้เรียนที่อ่านสไลด์อย่างเดียวจะเข้าใจ CORS ผิดตั้งแต่ประโยคแรก |
| 8 (Post) | แบบฝึกหัดจับคู่ annotation (หน้า 75–76) + Pre หน้า 54, 62 | เฉลยว่า "ให้ swag สแกนโค้ดใน `internal/` ด้วย" คือ **`--parseInternal`** (และหน้า 54/62 บอกว่า swag ข้าม `internal` โดยค่าเริ่มต้น จึง "ต้อง" ใส่ flag นี้) | **เฉลยผิด** — `swag` เดินเข้า `./internal` ของโปรเจกต์เราอยู่แล้ว · ทดสอบแบบเปลี่ยน**ทีละ flag** แล้ว `md5` ของ `swagger.json`: ไม่ใส่ flag = ใส่ `--parseInternal` (`27d4b4c3…` ทั้งคู่) และ `--parseDependency` = `--parseDependency --parseInternal` (`e7c184f8…` ทั้งคู่) — **`--parseInternal` ไม่เคยเปลี่ยนผลลัพธ์เลยสักชุด** · ตัวที่เปลี่ยนชื่อ definition เป็น `internal_user.*` คือ `--parseDependency` ต่างหาก · ดูซอร์ส swag v1.16.6: `ParseInternal` ถูกอ่านแค่ 2 จุด (`golist.go:51` = `pkg.Goroot`, `parser.go:1868` = `pkg.Internal`) ซึ่งอยู่ในฟังก์ชัน `getAllGoFileInfoFromDeps*` คือ**เส้นทางอ่าน dependency** ทั้งคู่ — `internal` ในที่นี้จึงหมายถึงของ *dependency/GOROOT* ไม่ใช่ของเรา · ส่วน `walkWith` (`parser.go:1957`) ที่เดินโปรเจกต์เรา ข้ามแค่ `vendor`, `docs`, โฟลเดอร์ขึ้นต้นด้วยจุด และ `--exclude` — **ไม่มีเงื่อนไขคำว่า `internal` อยู่เลย** |

**จุดที่ยังไม่สรุปว่าผิด:**

- หน้า Workshop สุดท้าย ตัวอย่าง output ของ `findPlayer(101)` แสดง
  `{"playerId":101,...}` แต่บรรทัดถัดมาเป็น `Player: ID=202 ...` —
  น่าจะเป็นการเอา output ของสอง case มาต่อกัน ไม่ใช่ผลของการเรียกเดียว
  ยังเข้าถึง starter pack (`paste.odt.co.th`) ไม่ได้จึงยังยืนยันไม่ได้
- ~~Outline Day 4 มีหัวข้อ `Generics` แต่ไม่มีเนื้อหา~~ — **แก้แล้วใน Day 6**
  ซึ่งเปิดหัวข้อด้วย Generics เต็ม ๆ (บทเรียน 19–20)
- **Day 6 — `Keys(scores)` แสดงคอมเมนต์ `// [Alice Bob]`** ราวกับลำดับแน่นอน
  รันจริง 5 ครั้งได้ลำดับต่างกันทุกครั้ง (`[Alice Bob Carol Dave]`,
  `[Carol Dave Alice Bob]`, …) — Go สุ่มลำดับ `for range` บน map โดยตั้งใจ ·
  ไม่นับเป็น "ผิด" เพราะ map มีแค่ 2 key ในตัวอย่าง แต่คอมเมนต์แบบนี้สอนนิสัยที่อันตราย
- **Day 6 — GOMAXPROCS** สไลด์นิยามว่า "จำนวน goroutine ที่กำลังประมวลผลบน CPU
  จริง ๆ พร้อมกัน" ซึ่งถูกในเชิงผลลัพธ์ แต่ตัวมันคือ**จำนวน P** ใน GMP model
  (เพดานของการ execute) ไม่ใช่ตัวนับ goroutine · ไม่ผิดพอจะเข้าตาราง

- ~~**Day 8 — `--parseInternal` "จำเป็น"**~~ — **ปิดเคสแล้ว เลื่อนขึ้นไปอยู่ในตารางด้านบน (จุดที่ 20)**
  ตอน Day 8 ผมยังไม่ฟันธงเพราะทดสอบด้วยการใส่**สอง flag พร้อมกัน**
  พอ Day 8 (Post) มีแบบฝึกหัดจับคู่ที่เฉลยข้อนี้ตรง ๆ เลยกลับไปทดสอบใหม่แบบ**เปลี่ยนทีละ flag**
  แล้วได้คำตอบชัดเจน — รายละเอียดอยู่ในตาราง

**เรื่องที่ agent รายงานมาแต่ตัดออก (ไม่นับเป็น "สไลด์ผิด"):**

ตอนทำ Day 7 ใช้ subagent ตรวจเครื่องมือแล้วมันรายงานกลับมา **21 จุด**
คัดแล้วเหลือ 5 จุดที่เป็นความผิดจริง ที่เหลือคือ:

- **ข้อสังเกตที่ดีแต่สไลด์ไม่ได้เขียนผิด** — เช่น "Redis เก็บใน RAM" (สไลด์เขียน
  *"เป็นหลัก"* ไว้แล้ว) · "cache invalidation มี TTL กับ purge" (สไลด์ปิดท้ายด้วย *"Etc."*)
  · "KEYS ช้ากว่า SCAN" (สไลด์ไม่ได้อ้างเหตุผลนั้น แค่ลิสต์คำสั่ง)
- **สิ่งที่สไลด์ไม่ได้พูดถึง** — ไม่ใช่ความผิด เป็นช่องว่าง เช่น `GOOSE_DRIVER`/`-dir`,
  การตั้ง `DOCKER_HOST` สำหรับคนใช้ colima/Podman
- **agent อ่านสไลด์คลาดเคลื่อนเอง 2 จุด** — อ้างว่าสไลด์ตั้ง `all` ผิดระดับ
  ทั้งที่สไลด์เขียน `all: false` ข้างบนกับ `all: true` ใต้ `packages` ถูกต้องแล้ว ·
  และอ้างว่าสไลด์บอก config มี 8 ฟิลด์ ทั้งที่สไลด์แสดง 13 บรรทัด

**บทเรียนของเรื่องนี้:** subagent ที่รันของจริงเก่งมากในการหา *กับดัก*
แต่มันตัดสิน *"สไลด์ผิดไหม"* ได้ไม่ดี เพราะมันไม่ได้อ่านสไลด์ทั้งหน้า
→ **ผลตรวจจาก agent ต้องเอามาเทียบกับสไลด์เองทุกครั้งก่อนบันทึก**
ทั้ง 5 จุดข้างบนผมรันซ้ำด้วยมือเองก่อนใส่ตาราง

**Implications:**
- เวลาสอนสไลด์วันอื่น (Day 1, 2 และวันที่จะมาถึง) ต้องตรวจแบบเดียวกัน
  อย่าถ่ายทอดสไลด์ตรง ๆ
- **จุดผิดกระจุกอยู่ที่ "โค้ดตัวอย่างที่ยกมาเพื่อแสดงว่าวิธีเก่าแย่"** —
  Day 6 ทั้งสองจุดแรกเป็นแบบนี้ · น่าจะเพราะผู้สอนเขียนตัวอย่างฝั่ง "ที่ถูก"
  ให้รันได้จริง แต่ฝั่ง "ที่ผิด/เก่า" เขียนคร่าว ๆ เพราะไม่ตั้งใจให้ใครเอาไปรัน
  **→ ตอนแปลงเป็นบทเรียน ให้รันฝั่งที่ผิดด้วยเสมอ มักได้ predict-the-output ที่ดีมาก**
- เป็นบทเรียนแฝงที่มีค่าสำหรับผู้เรียนเอง: **สื่อการสอนผิดได้ Playground ไม่โกหก**
  ควรสอดแทรกนิสัย "สงสัยแล้วรันเลย" เข้าไปในทุกภารกิจ — บทเรียน 0001–0003
  จึงบังคับให้เปิด Go Playground รันเองทุกบท
