#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-search-index.py — สร้าง assets/search-index.json สำหรับช่องค้นหาบน navbar

รันจากที่ไหนก็ได้ (สคริปต์คำนวณรากโปรเจกต์จากตำแหน่งไฟล์ตัวเอง):

    python3 tools/build-search-index.py            # สร้าง/เขียนทับ assets/search-index.json
    python3 tools/build-search-index.py --check     # ตรวจอย่างเดียว ไม่เขียนไฟล์ (exit 1 ถ้าไม่ผ่าน)

idempotent: ไม่มี timestamp ในไฟล์ผลลัพธ์ รันซ้ำได้ byte เท่าเดิมทุกครั้ง

------------------------------------------------------------------------------
รูปแบบไฟล์ JSON (minified) — ชื่อ key สั้นเพื่อลดขนาดที่ต้องโหลดผ่านเน็ต
------------------------------------------------------------------------------
{
  "v": 1,          // version ของ "รูปแบบไฟล์" — ถ้าเปลี่ยนโครง ให้บวกเลขนี้
  "p": [ page ],   // pages   = ตารางหน้า (บทเรียน 55 + cheat sheet 9)
  "e": [ entry ]   // entries = รายการที่ค้นหาได้
}

page (หนึ่ง object ต่อหนึ่งไฟล์ HTML):
  "f"  file    path ของไฟล์ เทียบจากรากเว็บ  เช่น "day-6/lessons/0019-generics.html"
  "d"  day     เลขกลุ่ม: ฝั่ง Backend = เลขวัน (1-9) · ฝั่ง Frontend = 101, 102 (int)
  "n"  number  เลขบท 1-55 (int) — **ไม่มี key นี้** ถ้าเป็นหน้า cheat sheet
  "t"  title   ชื่อหน้าไว้โชว์เป็น breadcrumb ("อยู่บทไหน") — มาจาก <h1>

entry (หนึ่ง object ต่อหนึ่งคำ/หัวข้อ/บท ที่ค้นเจอได้):
  "t"  text    ข้อความที่เอาไปแสดงบนจอ (strip tag แล้ว, unescape entity แล้ว)
  "k"  kind    ชนิด 1 ตัวอักษร:
                 "t" = term    ศัพท์จาก <dt> ในกล่อง .jargon   (สำคัญสุด)
                 "h" = heading หัวข้อ <h2>/<h3>
                 "l" = lesson  ชื่อบท/ชื่อ cheat sheet
                 "c" = code    inline <code> ที่ปรากฏ >= 2 ครั้ง
  "l"  loc     ที่อยู่ 1-3 แห่ง: [[pageIdx, anchorCode], ...]
                 **ทุกแห่งเป็นที่อยู่ของ "ชนิดเดียวกับ k" เท่านั้น** — entry ชนิด "h"
                 จะไม่มีวันลิงก์ไปจุดที่จริง ๆ แล้วเป็น code token (v1 เคยปนกัน
                 เพราะ dedup ข้ามชนิดยัดที่อยู่ของชนิดที่แพ้เข้ามาด้วย)
                 pageIdx = index ใน "p"  → ได้ทั้ง ไฟล์ปลายทาง + วัน + เลขบท
                 anchorCode = id ที่ **มีอยู่จริงในไฟล์ HTML** (สคริปต์ตรวจให้แล้ว)
                              แต่บีบให้สั้นเพราะ 95% เป็น "sn-sec-N"/"sn-sub-N":
                                จำนวนเต็มบวก N  →  id คือ "sn-sec-N"
                                จำนวนเต็มลบ -N  →  id คือ "sn-sub-N"
                                เลข 0           →  ไม่มี anchor ให้ไปหัวไฟล์เฉย ๆ
                                สตริง           →  id ตรงตัว (slug ของ cheat sheet)
                              ฝั่ง JS ถอดกลับ:
                                a === 0    ? ''
                                : a > 0    ? 'sn-sec-' + a
                                : a < 0    ? 'sn-sub-' + (-a)
                                : a
                 แห่งแรก l[0] คือแห่งหลักที่ควรพาไปเมื่อกด Enter — **ไม่ใช่**
                 "แห่งแรกในลำดับเอกสาร" แต่เป็นแห่งที่ได้คะแนน loc_score() สูงสุด
                 (หน้าที่ชื่อบทมีคำนี้ > หน้าที่หัวข้อมีคำนี้ > หน้าที่พูดถึงบ่อยสุด)
                 v1 ใช้แห่งแรกในลำดับเอกสารซึ่งคือ "บทที่เอ่ยถึงก่อน" ไม่ใช่
                 "บทที่สอนเรื่องนี้" — goroutine เคยพาไปบท testing.T แทนบท goroutine
  "s"  snippet คำอธิบายย่อจาก <dd> ตัดที่ ~110 ตัวอักษร (เฉพาะ kind "t")
                 **ไม่มี key นี้** ถ้าไม่ใช่ term หรือไม่มีคำอธิบาย
  "c"  count   จำนวน **บท** ที่พบคำนี้ (ไม่ใช่จำนวนครั้ง) — ใช้ทำ freqBonus
                 และป้าย "พบใน N บท" ที่ nav.js แสดง
                 **ไม่มี key นี้** ถ้า = 1
                 v1 เก็บจำนวนครั้ง ทำให้ป้ายขึ้นว่า "พบ 136 ที่ในคอร์ส" ซึ่งอ่านแล้ว
                 เข้าใจว่ามี 136 จุดให้ไปดู ทั้งที่กดได้จุดเดียว

หมายเหตุที่จงใจ (อย่าเผลอ "ปรับปรุง" กลับ):
  - ไม่เก็บ normalized key ลงไฟล์ — วัดแล้วบวมกว่า 100 KB ขณะที่ฝั่ง JS
    normalize ทั้ง index ตอน boot ใช้ไม่ถึง 5 ms
  - ไม่เก็บ alias (คำที่แตกจาก "/" · "·" · วงเล็บ) ลงไฟล์ — nav.js แตกเอง
    จาก "t" ได้ด้วยกฎเดียวกัน ไม่ต้องเปลืองเนื้อที่
  - anchor ของ term/code = id ของหัวข้อที่อยู่ "เหนือขึ้นไปใกล้ที่สุด"
    เพราะ <dt> กับ <code> ไม่มี id เป็นของตัวเองในไฟล์ (และเราไม่แปะเพิ่ม)
"""

import argparse
import glob
import json
import os
import re
import sys
from html.parser import HTMLParser

# ---------------------------------------------------------------- ค่าคงที่

FORMAT_VERSION = 2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_REL = os.path.join("assets", "search-index.json")
OUT_ABS = os.path.join(ROOT, OUT_REL)

# หัวข้อ boilerplate ที่โผล่ซ้ำแทบทุกบท — ใส่ไปก็มีแต่ขยะเต็มจอ
BOILERPLATE_HEADINGS = {
    "อ้างอิง",
    "ทดสอบความเข้าใจ",
    "ทดสอบความจำ",
    "ลงมือทำ",
    "อ่านต่อจากต้นทาง",
    "สารบัญ",
    "สรุป",
}

# เลขลำดับนำหน้าหัวข้อ เช่น "4 · ทดสอบ" / "2.1) อะไร" — ตัดทิ้งก่อน index
LEADING_NUM = re.compile(r"^\s*\d+(?:\.\d+)?\s*[·.)–—\-]\s*")

SNIPPET_MAX = 110          # ความยาวคำอธิบายย่อสูงสุด (ตัวอักษร)
SNIPPET_MIN_WORDCUT = 70   # ถ้าหาช่องว่างเพื่อตัดจบคำได้ก่อนตำแหน่งนี้ ให้ hard cut แทน
MAX_LOCS = 3               # เก็บที่อยู่สูงสุดกี่แห่งต่อหนึ่ง entry
CODE_MIN_OCCURRENCES = 2   # inline <code> ต้องปรากฏอย่างน้อยกี่ครั้งถึงจะเข้า index
CODE_MAX_LEN = 60          # code token ที่ยาวกว่านี้ถือเป็นประโยค ไม่ใช่ token

# ลำดับความสำคัญตอน dedup — ตัวเลขมากชนะ
KIND_PRIORITY = {"l": 4, "t": 3, "h": 2, "c": 1}

# id ที่ navbar จองไว้ใช้เอง — ห้ามให้ anchor ไปชน
# tag ที่เนื้อข้างในไม่นับเป็น "เนื้อหาของหน้า"
#   script/style = โค้ด ไม่ใช่ข้อความ
#   template     = เนื้อในไปเรนเดอร์ใน <iframe> ของกล่อง .demo ผู้อ่านหาด้วย Ctrl+F
#                  บนหน้านี้ไม่เจอ จึงไม่ควรพาผลค้นหามาลงที่นี่
SKIP_TAGS = ("script", "style", "template")

RESERVED_ID_PREFIXES = ("sn-root", "sn-style", "sn-main", "sn-panel-", "sn-mgroup-")


# ---------------------------------------------------------------- helper

def squash(s):
    """ยุบช่องว่างทุกชนิดให้เหลือช่องเดียว และตัดหัวท้าย"""
    return " ".join(s.split())


def norm(s):
    """
    normalize สำหรับใช้เป็น key ตอน dedup — ต้องตรงกับสูตรฝั่ง nav.js เป๊ะ
      1. lowercase
      2. ตัดทุกอักขระที่ไม่ใช่ [0-9a-z] และไม่ใช่อักษรไทย (จุด ขีด วงเล็บ สแลช ช่องว่าง ...)
      3. ตัดวรรณยุกต์ไทย + ไม้ไต่คู้ + ทัณฑฆาต  (เก็บสระบน/ล่างไว้ ห้ามตัด)
    ผลคือ errors.Is / errors is / errorsis → "errorsis" เหมือนกันหมด
    """
    s = s.lower()
    s = re.sub(r"[^0-9a-z฀-๿]+", "", s)
    s = re.sub(r"[็-์]", "", s)
    return s


def make_snippet(text):
    """ตัดคำอธิบายจาก <dd> ให้สั้น ~110 ตัวอักษร โดยพยายามตัดให้จบคำ"""
    t = squash(text)
    if len(t) <= SNIPPET_MAX:
        return t
    head = t[:SNIPPET_MAX]
    cut = head.rfind(" ")
    if cut >= SNIPPET_MIN_WORDCUT:
        head = head[:cut]
    return head.rstrip(" ·-—–,") + "…"


def clean_heading(text):
    """ล้างหัวข้อ: ยุบช่องว่าง แล้วตัดเลขลำดับนำหน้าออก"""
    return LEADING_NUM.sub("", squash(text)).strip()


# ---------------------------------------------------------------- parser

class PageParser(HTMLParser):
    """
    เดินไฟล์ HTML หนึ่งไฟล์ครั้งเดียว เก็บทุกอย่างที่ index ต้องใช้

    เก็บอะไรบ้าง
      self.ids       set ของ id ทั้งหมดที่เป็น attribute จริง (ไว้ตรวจ anchor)
      self.dup_ids   id ที่โผล่เกินหนึ่งครั้งในไฟล์เดียวกัน (ลิงก์ #id จะวิ่งไปหาอันแรกเสมอ)
      self.h1        ข้อความใน <h1> ตัวแรก
      self.headings  [(text, id)] จาก <h2>/<h3> ตามลำดับ document
      self.terms     [(dt_text, dd_text, anchor)] จาก <dt>/<dd> ในกล่อง .jargon
      self.codes     [(code_text, anchor)] จาก inline <code> ที่ไม่ได้อยู่ใน <pre>

    anchor = id ของหัวข้อ h2/h3 ที่อยู่เหนือขึ้นไปใกล้ที่สุด ("" ถ้ายังไม่เจอหัวข้อเลย)
    """

    HEADING_TAGS = ("h2", "h3")

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.dup_ids = set()
        self.h1 = None
        self.headings = []
        self.terms = []
        self.codes = []

        self._cur_anchor = ""      # id ของหัวข้อล่าสุด
        self._pre_depth = 0        # อยู่ใน <pre> กี่ชั้น
        self._skip_depth = 0       # อยู่ใน <script>/<style> กี่ชั้น (ข้อความข้างในไม่ใช่เนื้อหา)
        self._jargon_depth = 0     # อยู่ในกล่อง .jargon → นับ <div> ซ้อนเพื่อรู้ว่าออกเมื่อไหร่
        self._buf = {}             # ตัวจับข้อความที่กำลังเปิดอยู่: name -> list[str]
        self._h_tag = None         # h1/h2/h3 ที่กำลังเปิด
        self._h_id = ""            # id ของหัวข้อที่กำลังเปิด
        self._pending_dt = None    # dt ที่อ่านจบแล้ว รอ dd คู่ของมัน
        self._pending_dt_anchor = ""

    # -- ตัวช่วยจัดการ buffer -------------------------------------------

    def _open(self, name):
        self._buf[name] = []

    def _close(self, name):
        return "".join(self._buf.pop(name, []))

    # -- callback ของ HTMLParser ----------------------------------------

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)

        if tag in SKIP_TAGS:
            self._skip_depth += 1
            return
        if self._skip_depth:
            return

        # เก็บ id "หลัง" ด่าน SKIP_TAGS เท่านั้น — id ที่อยู่ใน <template> ไม่ได้อยู่ใน
        # document จริง (มันไปเรนเดอร์ใน <iframe> ของกล่อง .demo) จะลิงก์ #id ไปหาไม่ได้
        # และบทที่มีฟอร์มตัวอย่างสองอันจะใช้ id ซ้ำกันโดยไม่ผิดอะไร
        if "id" in d and d["id"]:
            if d["id"] in self.ids:
                self.dup_ids.add(d["id"])
            self.ids.add(d["id"])

        if tag == "pre":
            self._pre_depth += 1
            return

        if tag == "div":
            if self._jargon_depth:
                self._jargon_depth += 1
            elif "jargon" in (d.get("class") or "").split():
                self._jargon_depth = 1
            return

        if tag == "h1" and self.h1 is None:
            self._h_tag = "h1"
            self._open("h")
            return

        if tag in self.HEADING_TAGS:
            self._h_tag = tag
            self._h_id = d.get("id", "")
            self._open("h")
            return

        if self._jargon_depth and tag == "dt":
            self._open("dt")
            return

        if self._jargon_depth and tag == "dd":
            self._open("dd")
            return

        if tag == "code" and self._pre_depth == 0:
            self._open("code")
            return

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS:
            if self._skip_depth:
                self._skip_depth -= 1
            return
        if self._skip_depth:
            return

        if tag == "pre":
            if self._pre_depth:
                self._pre_depth -= 1
            return

        if tag == "div":
            if self._jargon_depth:
                self._jargon_depth -= 1
            return

        if tag in ("h1",) + self.HEADING_TAGS and self._h_tag == tag:
            text = self._close("h")
            if tag == "h1":
                if self.h1 is None:
                    self.h1 = squash(text)
            else:
                self.headings.append((squash(text), self._h_id))
                # หัวข้อนี้กลายเป็น anchor ของทุกอย่างที่ตามมาข้างล่าง
                self._cur_anchor = self._h_id
            self._h_tag = None
            self._h_id = ""
            return

        if tag == "dt" and "dt" in self._buf:
            self._pending_dt = squash(self._close("dt"))
            self._pending_dt_anchor = self._cur_anchor
            return

        if tag == "dd" and "dd" in self._buf:
            dd = squash(self._close("dd"))
            if self._pending_dt:
                self.terms.append((self._pending_dt, dd, self._pending_dt_anchor))
            self._pending_dt = None
            return

        if tag == "code" and "code" in self._buf:
            code = squash(self._close("code"))
            if code:
                self.codes.append((code, self._cur_anchor))
            return

    def handle_data(self, data):
        if self._skip_depth:
            return
        for name in self._buf:
            self._buf[name].append(data)


# ---------------------------------------------------------------- เก็บข้อมูล

# เลขกลุ่มของฝั่ง Frontend — สไลด์ฝั่งนี้ไม่ได้กำกับวันมาให้ จึงต้องแจกเลขเอง
# ใช้ช่วง 100+ เพื่อไม่ให้ชนกับเลขวันของฝั่ง Backend แม้คอร์สจะยาวถึง Day 99
#
# ⚠️ ค่านี้ต้องตรงกับฟิลด์ `d:` ของ FRONT ใน assets/nav.js
#    (nav.js ใช้มันเทียบว่า "ผลค้นหาอันนี้อยู่กลุ่มเดียวกับหน้าที่เปิดอยู่ไหม")
#    เพิ่มกลุ่มใหม่ต้องแก้ทั้งสองที่ ถ้าลืม สคริปต์นี้จะหยุดพร้อมบอกชื่อกลุ่มที่ขาด
FE_GROUP_ID = {
    "fe-html-css": 101,
    "fe-ts-fp": 102,
    "fe-nextjs": 103,
}


def discover_pages():
    """คืนรายการหน้าเรียงแบบ deterministic: บทเรียนทุกบทตามเลขบท แล้วต่อด้วย cheat sheet

    กวาดสองแบบ: `day-N/` (ฝั่ง Backend) และ `fe-*/` (ฝั่ง Frontend)
    """
    patterns = ("day-*", "fe-*")
    lessons, sheets = [], []
    for pat in patterns:
        lessons += glob.glob(os.path.join(ROOT, pat, "lessons", "*.html"))
        sheets += glob.glob(os.path.join(ROOT, pat, "reference", "cheatsheet.html"))

    def group_of(path):
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        return rel.split("/")[0]

    def day_of(path):
        g = group_of(path)
        m = re.fullmatch(r"day-(\d+)", g)
        if m:
            return int(m.group(1))
        if g not in FE_GROUP_ID:
            sys.exit(
                "กลุ่ม '%s' ยังไม่มีเลขใน FE_GROUP_ID ของ %s\n"
                "เพิ่มเลขใหม่ที่นี่ และเพิ่มฟิลด์ d: เลขเดียวกันใน FRONT ของ assets/nav.js ด้วย"
                % (g, os.path.basename(__file__))
            )
        return FE_GROUP_ID[g]

    def num_of(path):
        m = re.match(r"(\d+)-", os.path.basename(path))
        return int(m.group(1)) if m else None

    lessons.sort(key=lambda p: (num_of(p), p))
    sheets.sort(key=day_of)
    out = []
    for p in lessons:
        out.append({"abs": p, "day": day_of(p), "num": num_of(p)})
    for p in sheets:
        out.append({"abs": p, "day": day_of(p), "num": None})
    return out


def rel_url(abs_path):
    return os.path.relpath(abs_path, ROOT).replace(os.sep, "/")


def collect(pages):
    """
    อ่านทุกหน้า คืน (page_records, raw_items, ids_by_page)
      raw_item = dict(text, kind, page, anchor, snippet)
    ยังไม่ dedup ยังไม่กรอง code ที่โผล่ครั้งเดียว
    """
    page_records = []
    ids_by_page = []
    dups_by_page = []
    page_ctx = []      # ต่อหน้า: {"title_n": normalized <h1>, "head_n": [normalized h2/h3]}
    raw = []

    for idx, pg in enumerate(pages):
        src = open(pg["abs"], encoding="utf-8").read()
        parser = PageParser()
        parser.feed(src)
        parser.close()

        url = rel_url(pg["abs"])
        title = parser.h1 or url
        rec = {"f": url, "d": pg["day"]}
        if pg["num"] is not None:
            rec["n"] = pg["num"]
        rec["t"] = title
        page_records.append(rec)
        ids_by_page.append(parser.ids)
        dups_by_page.append(parser.dup_ids)
        page_ctx.append({
            "title_n": norm(title),
            "head_n": [norm(clean_heading(h)) for h, _ in parser.headings],
        })

        # (3) lesson — ชื่อบท / ชื่อ cheat sheet
        raw.append({"text": title, "kind": "l", "page": idx, "anchor": "", "snippet": None})

        # (2) heading — h2/h3
        for text, hid in parser.headings:
            t = clean_heading(text)
            if not t or t in BOILERPLATE_HEADINGS or not norm(t):
                continue
            raw.append({"text": t, "kind": "h", "page": idx, "anchor": hid, "snippet": None})

        # (1) term — <dt> + คำอธิบายย่อจาก <dd>
        for dt, dd, anchor in parser.terms:
            t = squash(dt)
            if not t or not norm(t):
                continue
            raw.append({
                "text": t, "kind": "t", "page": idx, "anchor": anchor,
                "snippet": make_snippet(dd) if dd else None,
            })

        # (4) code — inline <code> นอก <pre>
        for code, anchor in parser.codes:
            if not code or len(code) > CODE_MAX_LEN:
                continue
            # ทิ้ง token ที่ค้นหาไม่ได้จริง: ชื่อตัวแปรตัวเดียว (i, f, b), ตัวเลขดิบ (0, 42, 99),
            # และ format verb (%v, %T) ที่ normalize แล้วเหลือตัวอักษรเดียว —
            # ฝั่ง nav.js จะ gate query ที่สั้นกว่า 2 ตัวอยู่แล้ว พวกนี้จึงไม่มีวันถูกค้นเจอ
            nc = norm(code)
            if len(nc) < 2 or nc.isdigit():
                continue
            raw.append({"text": code, "kind": "c", "page": idx, "anchor": anchor, "snippet": None})

    return page_records, raw, ids_by_page, dups_by_page, page_ctx


def loc_score(key, page_idx, page_ctx, hits_here):
    """
    "แห่งไหนควรเป็นแห่งหลัก" — ตอบว่า *บทที่สอนเรื่องนี้* ไม่ใช่ *บทที่เอ่ยถึงก่อน*

    v1 ใช้แห่งแรกในลำดับเอกสารเป็นแห่งหลัก ซึ่งผิดกับคำที่ถูกเอ่ยถึงในบทก่อน ๆ
    แล้วค่อยมีบทของตัวเองทีหลัง — วัดได้ 15 คำ เช่น goroutine พาไปบท testing.T,
    context พาไป context window ของ AI agent (คนละเรื่องกับ context.Context)

    สัญญาณที่ใช้ เรียงตามน้ำหนัก:
      1000  ชื่อบท (<h1>) มีคำนี้อยู่ข้างใน  → "บทนี้ชื่อเรื่องนี้เลย"
       500  หัวข้อ (<h2>/<h3>) ในหน้ามีคำนี้ → "บทนี้มีหัวข้อว่าด้วยเรื่องนี้"
       x5   จำนวนครั้งที่พูดถึงในหน้านั้น (เพดาน 100) → ตัดสินเมื่อไม่มีสัญญาณข้างบน
    """
    ctx = page_ctx[page_idx]
    sc = 0
    if key and key in ctx["title_n"]:
        sc += 1000
    if key and any(key in h for h in ctx["head_n"]):
        sc += 500
    return sc + min(hits_here, 20) * 5


def build_entries(raw, page_ctx):
    """กรอง code ที่โผล่ครั้งเดียว แล้ว dedup ข้ามชนิด/ข้ามหน้าด้วย normalized key"""
    # นับ code token ทั้งคอร์สก่อน — เอาไว้ตัดตัวที่ปรากฏครั้งเดียวทิ้ง
    code_hits = {}
    for it in raw:
        if it["kind"] == "c":
            code_hits[norm(it["text"])] = code_hits.get(norm(it["text"]), 0) + 1

    # ---- รอบที่ 1: รวมทุกการปรากฏของแต่ละ key ไว้ก่อน ยังไม่ตัดสินอะไร
    entries = {}
    order = []
    for pos, it in enumerate(raw):
        key = norm(it["text"])
        if it["kind"] == "c" and code_hits.get(key, 0) < CODE_MIN_OCCURRENCES:
            continue
        cur = entries.get(key)
        if cur is None:
            cur = entries[key] = {"key": key, "occ": [], "snippet": None}
            order.append(key)
        cur["occ"].append({"kind": it["kind"], "page": it["page"],
                           "anchor": it["anchor"], "pos": pos, "text": it["text"]})
        if cur["snippet"] is None and it["snippet"]:
            cur["snippet"] = it["snippet"]

    # ---- รอบที่ 2: ตัดสินชนิดที่ชนะ แล้วเลือก "ที่อยู่" ของชนิดนั้นล้วน ๆ
    out = []
    for key in order:
        cur = entries[key]
        occ = cur["occ"]

        # ชนิดที่สำคัญที่สุดชนะ · เสมอกันให้ตัวที่เจอก่อนชนะ (deterministic)
        win = max(occ, key=lambda o: (KIND_PRIORITY[o["kind"]], -o["pos"]))
        kind = win["kind"]

        # ที่อยู่ต้องเป็นของชนิดที่ชนะเท่านั้น — ไม่งั้น entry ชนิด "หัวข้อ" จะลิงก์ไป
        # จุดที่จริง ๆ เป็น code token แล้วผู้ใช้กดไปเจอหัวข้อชื่อไม่ตรงกับที่แสดง
        mine = [o for o in occ if o["kind"] == kind]

        # นับครั้งที่เจอในแต่ละหน้า ไว้ตัดสินว่าหน้าไหนคือ "บทที่สอนเรื่องนี้"
        hits_by_page = {}
        for o in occ:
            hits_by_page[o["page"]] = hits_by_page.get(o["page"], 0) + 1

        seen, cands = set(), []
        for o in mine:
            loc = (o["page"], o["anchor"])
            if loc in seen:
                continue
            seen.add(loc)
            cands.append((-loc_score(key, o["page"], page_ctx, hits_by_page[o["page"]]),
                          o["pos"], loc))
        cands.sort()
        locs = [c[2] for c in cands[:MAX_LOCS]]

        out.append({
            "text": win["text"],
            "kind": kind,
            "locs": locs,
            "snippet": cur["snippet"],
            # "พบใน N บท" — จำนวนหน้า ไม่ใช่จำนวนครั้ง (ดูสเปกหัวไฟล์ key "c")
            "count": len(hits_by_page),
        })
    return out


SEC_ID = re.compile(r"^sn-sec-(\d+)$")
SUB_ID = re.compile(r"^sn-sub-(\d+)$")


def encode_anchor(anchor):
    """"sn-sec-12" -> 12 · "sn-sub-7" -> -7 · "" -> 0 · slug -> slug (ดูสเปกหัวไฟล์)"""
    if not anchor:
        return 0
    m = SEC_ID.match(anchor)
    if m:
        return int(m.group(1))
    m = SUB_ID.match(anchor)
    if m:
        return -int(m.group(1))
    return anchor


def decode_anchor(code):
    """ตรงข้ามกับ encode_anchor — ต้องให้ผลเหมือนโค้ดถอดรหัสฝั่ง nav.js เป๊ะ"""
    if code == 0:
        return ""
    if isinstance(code, int):
        return ("sn-sec-%d" % code) if code > 0 else ("sn-sub-%d" % -code)
    return code


def to_json_entry(e):
    """แปลง entry ภายในเป็น object ที่มี key สั้นตามสเปกหัวไฟล์"""
    out = {"t": e["text"], "k": e["kind"], "l": [[p, encode_anchor(a)] for p, a in e["locs"]]}
    if e["kind"] == "t" and e["snippet"]:
        out["s"] = e["snippet"]
    if e["count"] > 1:
        out["c"] = e["count"]
    return out


# ---------------------------------------------------------------- ตรวจ anchor

def verify_anchors(entries, page_records, ids_by_page, dups_by_page):
    """
    ตรวจว่า anchor ทุกอันมี id นั้นอยู่จริงในไฟล์ปลายทาง **และไม่ซ้ำในไฟล์นั้น**
    คืน (จำนวนที่ตรวจ, จำนวนผ่าน, รายการที่ล้ม)

    ที่ต้องเช็ค id ซ้ำด้วย: การเช็คแค่ "มี id นี้ไหม" ผ่านได้แม้ไฟล์จะมี id ซ้ำสองอัน
    ซึ่งเกิดได้จริงถ้ามีคนแทรก <h2> กลางบทแล้วรัน add-heading-ids.py โหมดปกติ
    ผลคือ #sn-sec-N วิ่งไปหาอันแรกในลำดับ document เสมอ = ผลค้นหาพาไปผิดหัวข้อเงียบ ๆ
    """
    checked = passed = 0
    failures = []

    # id ซ้ำ = ปัญหาของทั้งไฟล์ ไม่ใช่ของ entry ใดเป็นการเฉพาะ รายงานทีเดียวต่อไฟล์
    for pi, dups in enumerate(dups_by_page):
        for bad in sorted(dups):
            failures.append(("(ทั้งไฟล์)", page_records[pi]["f"], bad,
                             "id ซ้ำในไฟล์เดียวกัน — รัน tools/add-heading-ids.py --renumber"))

    for e in entries:
        for pi, anchor in e["locs"]:
            checked += 1
            if anchor == "":
                passed += 1          # ไม่มี anchor = ตั้งใจให้ไปหัวไฟล์ ถือว่าผ่าน
                continue
            if anchor.startswith(RESERVED_ID_PREFIXES[:3]) and anchor in ("sn-root", "sn-style", "sn-main"):
                failures.append((e["text"], page_records[pi]["f"], anchor, "ชนกับ id ที่ navbar จองไว้"))
                continue
            if decode_anchor(encode_anchor(anchor)) != anchor:
                failures.append((e["text"], page_records[pi]["f"], anchor, "encode/decode ไม่ round-trip"))
                continue
            if anchor in ids_by_page[pi]:
                passed += 1
            else:
                failures.append((e["text"], page_records[pi]["f"], anchor, "ไม่พบ id นี้ในไฟล์"))
    return checked, passed, failures


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description="สร้าง assets/search-index.json")
    ap.add_argument("--check", action="store_true",
                    help="ตรวจอย่างเดียว ไม่เขียนไฟล์ (exit 1 ถ้าไม่ผ่าน หรือไฟล์ที่มีอยู่ไม่ตรง)")
    args = ap.parse_args()

    pages = discover_pages()
    page_records, raw, ids_by_page, dups_by_page, page_ctx = collect(pages)
    entries = build_entries(raw, page_ctx)

    checked, passed, failures = verify_anchors(entries, page_records, ids_by_page, dups_by_page)

    doc = {
        "v": FORMAT_VERSION,
        "p": page_records,
        "e": [to_json_entry(e) for e in entries],
    }
    payload = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    blob = payload.encode("utf-8")

    # ---- รายงาน
    counts = {}
    for e in entries:
        counts[e["kind"]] = counts.get(e["kind"], 0) + 1
    label = {"t": "term (ศัพท์)", "h": "heading (หัวข้อ)", "l": "lesson (บท)", "c": "code"}

    print("pages           : %d" % len(page_records))
    print("entries         : %d" % len(entries))
    for k in ("t", "h", "l", "c"):
        print("  %-16s: %d" % (label[k], counts.get(k, 0)))
    print("locations       : %d  (สูงสุด %d ต่อ entry)" % (sum(len(e["locs"]) for e in entries), MAX_LOCS))
    print("anchors checked : %d  passed: %d  FAILED: %d" % (checked, passed, len(failures)))
    for t, f, a, why in failures[:20]:
        print("  FAIL  %-30s %s#%s  (%s)" % (t[:30], f, a, why))
    print("size            : %d bytes (%.1f KB)" % (len(blob), len(blob) / 1024.0))

    if failures:
        print("\nไม่เขียนไฟล์ — anchor ไม่ผ่าน %d รายการ" % len(failures), file=sys.stderr)
        return 1

    if args.check:
        if not os.path.exists(OUT_ABS):
            print("\n--check: ยังไม่มี %s" % OUT_REL, file=sys.stderr)
            return 1
        existing = open(OUT_ABS, "rb").read()
        if existing != blob:
            print("\n--check: %s ไม่ตรงกับที่ generate ได้ (ต่าง %d bytes) — ต้องรันใหม่"
                  % (OUT_REL, len(existing) - len(blob)), file=sys.stderr)
            return 1
        print("\n--check: %s เป็นปัจจุบันแล้ว" % OUT_REL)
        return 0

    os.makedirs(os.path.dirname(OUT_ABS), exist_ok=True)
    with open(OUT_ABS, "wb") as fh:
        fh.write(blob)
    print("\nwrote %s" % OUT_REL)
    return 0


if __name__ == "__main__":
    sys.exit(main())
