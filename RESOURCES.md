# Go (Enterprise Backend) Resources

แหล่งอ้างอิงที่ผ่านการตรวจแล้วสำหรับ workspace นี้ ทุก lesson ต้องอ้างจากที่นี่
ไม่ใช่จากความจำของ agent

## Knowledge

### เริ่มต้น (Day 1–2)

- [A Tour of Go](https://go.dev/tour/) — ทางการ แก้โค้ดแล้วกดรันได้ในหน้าเว็บเลย
  ใช้กับ: พื้นฐานทุกอย่างตั้งแต่ตัวแปรถึง type conversion
  **เหมาะที่สุดสำหรับคนพึ่งเริ่ม** ทำครบใช้เวลาไม่กี่ชั่วโมง

- [Get started with Go](https://go.dev/doc/tutorial/getting-started) — tutorial ทางการ
  ใช้กับ: `go mod init`, โปรแกรมแรก, โครงสร้าง module

- [Error handling and Go](https://go.dev/blog/error-handling-and-go) +
  [Working with Errors in Go 1.13](https://go.dev/blog/go1.13-errors)
  ใช้กับ: บทเรียน 05 — ทำไม Go คืน error เป็นค่า และ `%w` / `errors.Is` / `errors.As`

- [Strings, bytes, runes and characters in Go](https://go.dev/blog/strings)
  ใช้กับ: ทำไม `len("สวัสดี")` ได้ 18 ไม่ใช่ 6 — เรื่องที่คนไทยต้องเจอแน่นอน

- [The Go Blog — Constants](https://go.dev/blog/constants)
  ใช้กับ: `iota`, untyped constant, ทำไม `int(3.9)` ตรง ๆ ถึง compile ไม่ผ่าน

### Interface, Error, JSON (Day 4)

- [A Tour of Go — Interfaces](https://go.dev/tour/methods/9) ถึงหน้า 18
  ใช้กับ: บทเรียน 10–11 — interface, type assertion, type switch, Stringer
  **แก้โค้ดแล้วกดรันได้ในหน้าเว็บ** ประมาณ 25 นาทีจบทั้งชุด

- [Working with Errors in Go 1.13](https://go.dev/blog/go1.13-errors)
  ใช้กับ: บทเรียน 12 — เขียนโดยทีม Go ตอนที่เพิ่ม `%w`/`errors.Is`/`errors.As`
  จึงอธิบายว่า**แต่ละอันเกิดมาแก้ปัญหาอะไร** ไม่ใช่แค่ syntax
  **ควรอ่านก่อนออกแบบ error ของโปรเจกต์จริง**

- [The Go Blog — JSON and Go](https://go.dev/blog/json)
  ใช้กับ: บทเรียน 13 — Marshal/Unmarshal/Decoder และเคสที่ไม่รู้โครงสร้างล่วงหน้า

- [pkg.go.dev — encoding/json](https://pkg.go.dev/encoding/json#Marshal)
  ใช้กับ: เปิดไว้ข้าง ๆ ตอนเขียนโค้ดจริง — กฎการแปลงทุกข้อรวม `omitempty`, `-`,
  `,string` อยู่ในหน้านั้นครบ

- [Go Code Review Comments — Interfaces](https://go.dev/wiki/CodeReviewComments#interfaces)
  ใช้กับ: บทเรียน 10 — เกณฑ์ที่ reviewer ใช้จริง โดยเฉพาะเรื่อง
  interface ควรอยู่ package ฝั่งไหน

- [Russ Cox — Go Data Structures: Interfaces](https://research.swtch.com/interfaces)
  ใช้กับ: ตอนสงสัยว่า interface เก็บ type+value ยังไงในหน่วยความจำ
  **ยากกว่าที่ต้องรู้ตอนนี้** เก็บไว้อ่านทีหลัง

- [Google JSON Style Guide](https://google.github.io/styleguide/jsoncstyleguide.xml)
  ใช้กับ: ที่มาของกฎ `camelCase` ที่สไลด์อ้างถึง — อ้างอิงเชิงธรรมเนียม
  ไม่ใช่มาตรฐานบังคับ

### Testing &amp; TDD (Day 5)

- [Learn Go with Tests](https://quii.gitbook.io/learn-go-with-tests) — Chris James
  **สอน Go ทั้งภาษาผ่าน TDD** ตั้งแต่ hello world ถึง concurrency
  ทุกบทเป็นวงจร red-green-refactor จริง ๆ ฟรี อ่านออนไลน์ได้
  ใช้กับ: บทเรียน 18 — **ถ้าจะอ่านต่อจาก Day 5 แค่ที่เดียว ให้อ่านที่นี่**

- [Add a test](https://go.dev/doc/tutorial/add-a-test) — tutorial ทางการ
  ใช้กับ: บทเรียน 14 — เขียนเทสตัวแรกจนรันได้ (10 นาที)

- [pkg.go.dev — testing](https://pkg.go.dev/testing) และ
  [testing.T](https://pkg.go.dev/testing#T)
  ใช้กับ: บทเรียน 15 — รายการ method ครบทุกตัว **อ่านผ่านทั้งหน้าครั้งเดียว
  จะรู้ว่ามีอะไรให้ใช้บ้าง**

- [Go Wiki — Table Driven Tests](https://go.dev/wiki/TableDrivenTests) +
  [strings_test.go](https://cs.opensource.google/go/go/+/master:src/strings/strings_test.go)
  ใช้กับ: บทเรียน 16 — สำนวนมาตรฐาน พร้อมตัวอย่างจริงใน standard library

- [The Go Blog — Using Subtests and Sub-benchmarks](https://go.dev/blog/subtests)
  ใช้กับ: ที่มาของ `t.Run` และ `t.Parallel`

- [testify](https://pkg.go.dev/github.com/stretchr/testify) —
  [assert](https://pkg.go.dev/github.com/stretchr/testify/assert) ·
  [mock](https://pkg.go.dev/github.com/stretchr/testify/mock) ·
  [suite](https://pkg.go.dev/github.com/stretchr/testify/suite)
  ใช้กับ: บทเรียน 17 · **หมายเหตุ: เป็น library ของบุคคลที่สาม ไม่ใช่ของทีม Go**
  บางทีมเลือกไม่ใช้เลย — รู้ทั้งสองแบบไว้ดีที่สุด

- [Data Race Detector](https://go.dev/doc/articles/race_detector) — คู่มือ `-race`
  ใช้กับ: ตรวจ `t.Parallel()` ว่าไม่แชร์ state

- [Go Code Review Comments — Useful Test Failures](https://go.dev/wiki/CodeReviewComments#useful-test-failures)
  ใช้กับ: รูปแบบข้อความ error `f(input) = got; want X`

### Generics (Day 6)

- [When To Use Generics](https://go.dev/blog/when-generics) — Ian Lance Taylor
  **เขียนโดยคนออกแบบ generics เอง** ตอบคำถามที่สำคัญกว่า syntax คือ
  *เมื่อไหร่ควรใช้ เมื่อไหร่ไม่ควร*
  ใช้กับ: บทเรียน 20 ครึ่งหลัง — **อ่านก่อนตัดสินใจทำอะไรเป็น generic**

- [Tutorial: Getting started with generics](https://go.dev/doc/tutorial/generics)
  ใช้กับ: บทเรียน 19 — เริ่มจาก `Sum` ตัวเดียวกับที่สไลด์ใช้ ทำตามได้ใน 20 นาที

- [An Introduction To Generics](https://go.dev/blog/intro-generics) — Go Blog ตอนปล่อย Go 1.18
  ใช้กับ: ภาพรวมว่า type parameter กับ constraint ต่างกันยังไง

- [Go Spec — Type parameter declarations](https://go.dev/ref/spec#Type_parameter_declarations)
  ใช้กับ: คำตอบชี้ขาดเรื่อง `~` และ type set · [pkg.go.dev — cmp.Ordered](https://pkg.go.dev/cmp#Ordered)

### Concurrency (Day 6)

- [A Tour of Go — Concurrency](https://go.dev/tour/concurrency/1) ถึงหน้า 11
  ใช้กับ: บทเรียน 21–23 · **แก้โค้ดแล้วกดรันได้ในหน้าเว็บ** ประมาณ 30 นาทีจบชุด

- [Concurrency is not Parallelism](https://go.dev/blog/waza-talk) — Rob Pike
  ใช้กับ: บทเรียน 21 หัวข้อ 1 — มีวิดีโอด้วย **ดูครั้งเดียวจำไปตลอด**

- [Go Concurrency Patterns: Context](https://go.dev/blog/context) +
  [Pipelines and cancellation](https://go.dev/blog/pipelines)
  ใช้กับ: บทเรียน 25–26 — **สองหน้านี้คือแหล่งหลักของ pattern ที่ใช้จริงในงาน**

- [Data Race Detector](https://go.dev/doc/articles/race_detector) +
  [Introducing the Go Race Detector](https://go.dev/blog/race-detector)
  ใช้กับ: บทเรียน 24 — วิธีใช้ `-race` และข้อจำกัดของมัน

- [The Go Memory Model](https://go.dev/ref/mem)
  ใช้กับ: นิยามทางการว่า data race คืออะไร · **ยากกว่าที่ต้องรู้ตอนนี้** เก็บไว้อ่านทีหลัง

- [pkg.go.dev — sync](https://pkg.go.dev/sync) ·
  [context](https://pkg.go.dev/context) ·
  [Go by Example — Worker Pools](https://gobyexample.com/worker-pools)
  ใช้กับ: เปิดไว้ข้าง ๆ ตอนเขียนโค้ดจริง

### Project Layout &amp; Database (Day 6)

- [Organizing a Go module](https://go.dev/doc/modules/layout) — **ทางการ**
  ใช้กับ: บทเรียน 27 — `cmd/`, `internal/`, และเหตุผลเบื้องหลัง
  **หมายเหตุ:** repo ยอดนิยม `golang-standards/project-layout` **ไม่ใช่ของทางการ**
  และทีม Go เคยออกมาบอกว่าไม่แนะนำสำหรับโปรเจกต์เล็ก — ให้ยึดหน้านี้แทน

- [GORM Guides](https://gorm.io/docs/) โดยเฉพาะ
  [Error Handling](https://gorm.io/docs/error_handling.html) ·
  [Soft Delete](https://gorm.io/docs/delete.html#Soft-Delete) ·
  [Transactions](https://gorm.io/docs/transactions.html)
  ใช้กับ: บทเรียน 27 · **เป็น library ของบุคคลที่สาม ไม่ใช่ของทีม Go**

- [pkg.go.dev — database/sql](https://pkg.go.dev/database/sql)
  ใช้กับ: ทางเลือกที่ไม่ใช้ ORM ซึ่งหลายทีมใน Go เลือกใช้ —
  **ควรรู้ว่ามีอีกทาง** เพราะเวลา query ช้าต้องอ่าน SQL ออกอยู่ดี

### ระดับปฐมภูมิ (เชื่อถือได้สูงสุด — ทีม Go เขียนเอง)

- [The Go Programming Language Specification](https://go.dev/ref/spec)
  ตัวบทกฎหมายของภาษา ใช้ตอนต้องการคำตอบชี้ขาด เช่น
  [Slice expressions](https://go.dev/ref/spec#Slice_expressions) บอก `len`/`cap`
  ของ `a[low:high]` และ `a[low:high:max]` ตรง ๆ, [Appending and
  copying](https://go.dev/ref/spec#Appending_and_copying_slices)

- [Go Slices: usage and internals](https://go.dev/blog/slices-intro) — Andrew Gerrand
  ที่มาของ slice header (pointer/len/cap) และประโยคสำคัญ *"Slicing does not copy
  the slice's data."* ใช้กับ: บทเรียน 0001 ทุกเรื่องที่เกี่ยวกับ aliasing

- [Arrays, slices (and strings): The mechanics of 'append'](https://go.dev/blog/slices) — Rob Pike
  อธิบายว่า slice header เป็น **value** ไม่ใช่ pointer to struct → ฟังก์ชันแก้
  len/cap ของตัวแปรข้างนอกไม่ได้ ใช้กับ: บทเรียน 0002

- [Defer, Panic, and Recover](https://go.dev/blog/defer-panic-and-recover) — Andrew Gerrand
  กฎ 3 ข้อของ `defer` แบบทางการ (argument ประเมินทันที / LIFO / แก้ named return
  ได้) ใช้กับ: บทเรียน 0003

- [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
  เกณฑ์ที่ reviewer ในโลกจริงใช้ตัดสิน มีหัวข้อ **Receiver Type** ที่ให้กฎเลือก
  value vs pointer receiver ครบ 9 ข้อ ใช้กับ: บทเรียน 0002

- [Effective Go](https://go.dev/doc/effective_go)
  สำนวนการเขียน Go ที่ถือเป็นมาตรฐาน อ่านเมื่ออยากรู้ว่า "โค้ดแบบ Go" หน้าตายังไง

- [Go by Example](https://gobyexample.com/)
  ตัวอย่างสั้น ๆ รันได้จริงเรียงตามหัวข้อ ใช้ตอนอยากดู syntax เร็ว ๆ

### เครื่องมือ

- [Go Playground](https://go.dev/play/) — รันโค้ดในเบราว์เซอร์ ไม่ต้องลงอะไร
  ใช้ทำ predict-the-output ในบทเรียนทุกครั้ง
- `go build -gcflags="-m"` — ให้ compiler บอกว่าตัวแปรไหน escape ไป heap
- `go vet` / `go test -race` — จับบั๊กที่ compiler ไม่จับ

## Wisdom (Communities)

- [r/golang](https://www.reddit.com/r/golang/)
  ชุมชนหลักของ Go มี moderation ดี เหมาะกับ: ถามว่า "โค้ดผมเป็นสำนวน Go ไหม",
  ขอ review design
- [Gophers Slack](https://invite.slack.golangbridge.org/)
  ห้อง `#newbies` ตอบเร็วและใจดีมาก เหมาะกับ: ติดปัญหาเฉพาะหน้า
- [Golang Thailand (Facebook)](https://www.facebook.com/groups/golangthailand/)
  คุยไทยได้ เหมาะกับ: ถามบริบทตลาดงาน/องค์กรไทย
- **ในคอร์สเอง** — เพื่อนร่วมอบรม PEA DevPool คือชุมชนที่ใกล้ตัวที่สุด
  เอา workshop ไปเทียบเฉลยกันจะเห็นวิธีคิดที่ต่างกัน

> ยังไม่ได้ถามผู้เรียนว่าอยากเข้าชุมชนไหม — ถ้าไม่สนใจ บอกได้ จะเลิกเสนอ

## Gaps

- ยังไม่มีแหล่งอ้างอิงภาษาไทยที่คุณภาพสูงพอสำหรับเรื่อง memory model
- ยังไม่ได้หาแหล่งสำหรับส่วน "AI Integration" ของคอร์ส (อยู่นอก scope ตอนนี้)
- ยังไม่มีหนังสือ — ถ้าเรียนต่อเนื่อง แนะนำหา *Learning Go* (Jon Bodner,
  O'Reilly) มาประกอบ แต่ยังไม่ได้ตรวจสอบเนื้อหาเอง จึงยังไม่ใส่ในลิสต์หลัก
