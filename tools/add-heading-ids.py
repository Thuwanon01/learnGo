#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add-heading-ids.py — แปะ id ให้ <h2> / <h3> ของหน้าบทเรียนและ cheat sheet

ทำไมต้องมีไฟล์นี้
-----------------
assets/nav.js แปะ id ให้ <h2> ตอน runtime (bindไว้ในบล็อก if (WHERE))
ซึ่งใช้ได้แค่กับ dropdown "ในบทนี้" แต่ search index ต้องการ anchor ที่
"เขียนอยู่ในไฟล์ HTML จริง" (D4) และ <h3> ไม่เคยได้ id เลย

กฎการตั้งชื่อ (ต้องตรงกับ nav.js เป๊ะ ไม่งั้น dropdown จะเปลี่ยนพฤติกรรม)
------------------------------------------------------------------------
nav.js:729-737
    all = document.querySelectorAll('h2')
    ข้าม h2 ที่อยู่ในแถบเอง (root.contains) — ในไฟล์ static ไม่มี
    ข้าม h2 ที่ textContent ว่าง
    if (!h.id) h.id = 'sn-sec-' + (heads.length + 1)
    heads.push(...)   // push ทุกอันรวมอันที่มี id อยู่แล้ว
=> N คือ "ตำแหน่ง" ของ h2 ในลำดับ document (นับอันที่มี id ด้วย) ฐาน 1

<h3> ใช้ sn-sub-N นับแยกจาก h2 ด้วยกติกาเดียวกัน (nav.js ไม่ยุ่งกับ h3)

ข้อบังคับ
---------
* ห้ามทับ id ที่มีอยู่แล้ว (cheatsheet มี slug 104 อันที่ <ol class="toc"> ลิงก์อยู่)
* idempotent — รันซ้ำแล้วไฟล์ต้องไม่เปลี่ยน
* แก้เฉพาะ attribute id ของ tag เปิด ห้ามแตะตัวอักษรอื่นแม้แต่ตัวเดียว
* ไม่แตะหน้าราก (index.html / docs.html / 404.html)

การใช้งาน
---------
    python3 tools/add-heading-ids.py             # แก้ไฟล์จริง (แปะเฉพาะอันที่ยังไม่มี id)
    python3 tools/add-heading-ids.py --dry-run   # ดูอย่างเดียว ไม่เขียน
    python3 tools/add-heading-ids.py --renumber  # ลบ sn-sec-N/sn-sub-N เดิมทิ้งแล้วแจกใหม่ทั้งไฟล์

ทำไมต้องมี --renumber
---------------------
sn-sec-N คือ "ตำแหน่ง" ไม่ใช่ "ตัวตน" — ถ้าแทรก <h2> ใหม่กลางบท โหมดปกติจะแปะ
เลขตามตำแหน่งใหม่ให้อันที่เพิ่งแทรก ส่วนอันเดิมยังถือเลขเก่าไว้ ผลคือ **id ซ้ำ**
อยู่ในไฟล์เดียวกันเงียบ ๆ แล้ว #sn-sec-N ทุกลิงก์จะวิ่งไปหาอันแรกในลำดับ document
(ทั้งผลค้นหาและ dropdown "ในบทนี้") — โหมด --renumber ล้างแล้วแจกใหม่ทั้งไฟล์
จึงหายเอง ส่วนโหมดปกติตอนนี้จะ **ตรวจจับแล้ว exit 1** แทนที่จะปล่อยผ่าน

id ที่ไม่ใช่ sn-sec-/sn-sub- (slug ของ cheat sheet ที่ <ol class="toc"> ลิงก์อยู่)
--renumber ไม่แตะเด็ดขาด
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# tag เปิดของ h2/h3 พร้อม attribute (ถ้ามี) + เนื้อหา + tag ปิด
# ใช้ backreference \1 กันจับข้าม level และ re.S เพราะหัวข้อบางอันขึ้นบรรทัดใหม่ได้
HEADING = re.compile(r'<h([23])((?:\s[^>]*)?)>(.*?)</h\1>', re.S)
HAS_ID = re.compile(r'\bid\s*=', re.I)
# เนื้อใน <template> ไม่ได้อยู่ใน document จริง — nav.js มองไม่เห็นด้วย querySelectorAll
# ถ้าแปะ id ให้หัวข้อในนั้น เลขจะเดินไม่ตรงกับที่ nav.js นับจากหน้าจริง
TEMPLATE = re.compile(r'<template\b[^>]*>.*?</template>', re.S | re.I)
TAGS = re.compile(r'<[^>]+>')
# id ที่สคริปต์นี้เป็นคนแจกเอง — ตัวเดียวที่ --renumber มีสิทธิ์ลบทิ้ง
OWN_ID = re.compile(r'\s+id\s*=\s*(["\'])sn-(?:sec|sub)-\d+\1', re.I)
# id ของ tag เปิดจริง ๆ (ไว้ตรวจซ้ำหลังประมวลผล)
ANY_ID = re.compile(r'<[a-zA-Z][^>]*?\sid\s*=\s*["\']([^"\']+)["\'][^>]*>')

PREFIX = {'2': 'sn-sec-', '3': 'sn-sub-'}


# โฟลเดอร์ที่ถือว่าเป็น "กลุ่มบทเรียน"
#   day-N  = ฝั่ง Backend (สไลด์กำกับวันมาให้)
#   fe-*   = ฝั่ง Frontend (สไลด์ไม่ได้กำกับวัน จึงตั้งชื่อตามสไลด์)
GROUP_DIR = re.compile(r'(?:day-\d+|fe-[a-z0-9-]+)$')


def target_files():
    """บทเรียนทุกบท + cheat sheet ทุกใบ เรียงคงที่เพื่อให้รายงานซ้ำได้

    เรียงฝั่ง Backend (day-1..day-N) ก่อน แล้วต่อด้วยฝั่ง Frontend (fe-*)
    เพราะเลขบทเรียนต่อเนื่องกันแบบนั้น
    """
    dirs = [d for d in os.listdir(ROOT) if GROUP_DIR.fullmatch(d)]

    def order(d):
        # day-9 ต้องมาก่อน day-10 → เรียงด้วยเลข ไม่ใช่ตัวอักษร
        if d.startswith('day-'):
            return (0, int(d.split('-')[1]), '')
        return (1, 0, d)

    out = []
    for group in sorted(dirs, key=order):
        les = os.path.join(ROOT, group, 'lessons')
        if os.path.isdir(les):
            for f in sorted(os.listdir(les)):
                if f.endswith('.html'):
                    out.append(os.path.join(les, f))
        sheet = os.path.join(ROOT, group, 'reference', 'cheatsheet.html')
        if os.path.isfile(sheet):
            out.append(sheet)
    return out


def process(src, renumber=False):
    """คืน (ข้อความใหม่, stats) — ไม่แตะอะไรนอกจากแทรก id ใน tag เปิด"""
    counter = {'2': 0, '3': 0}
    stats = {'added2': 0, 'added3': 0, 'kept2': 0, 'kept3': 0, 'skipped_empty': 0,
             'stripped': 0}

    def repl(m):
        lvl, attrs, body = m.group(1), m.group(2), m.group(3)
        if renumber:
            attrs, n = OWN_ID.subn('', attrs)
            stats['stripped'] += n
        text = TAGS.sub('', body)
        text = re.sub(r'\s+', ' ', text).strip()
        if not text:                      # nav.js ก็ข้ามอันนี้และไม่นับ
            stats['skipped_empty'] += 1
            return m.group(0)
        counter[lvl] += 1                 # นับก่อนเสมอ รวมอันที่มี id แล้ว
        if HAS_ID.search(attrs):
            stats['kept' + lvl] += 1
            return m.group(0)
        stats['added' + lvl] += 1
        new_id = PREFIX[lvl] + str(counter[lvl])
        return '<h%s id="%s"%s>%s</h%s>' % (lvl, new_id, attrs, body, lvl)

    # เดินทีละช่วง: ช่วงที่อยู่นอก <template> เท่านั้นที่ถูกแปะ id
    # ตัวนับเดินต่อเนื่องข้ามช่วง จึงได้เลขเดียวกับที่ nav.js นับจาก document จริง
    out, pos = [], 0
    for m in TEMPLATE.finditer(src):
        out.append(HEADING.sub(repl, src[pos:m.start()]))
        out.append(m.group(0))            # เนื้อใน template ปล่อยไว้ทั้งก้อน
        pos = m.end()
    out.append(HEADING.sub(repl, src[pos:]))
    return ''.join(out), stats


def heading_ids(src):
    """คืนรายการ id ของ <h2>/<h3> ตามลำดับ document (ไว้ตรวจว่าซ้ำกันไหม)

    ข้ามเนื้อใน <template> ด้วยเหตุผลเดียวกับใน process()
    """
    out = []
    src = TEMPLATE.sub('', src)
    for m in HEADING.finditer(src):
        mid = ANY_ID.match('<h%s%s>' % (m.group(1), m.group(2)))
        if mid:
            out.append(mid.group(1))
    return out


def main():
    dry = '--dry-run' in sys.argv
    renumber = '--renumber' in sys.argv
    files = target_files()
    tot = {'files': 0, 'changed': 0, 'added2': 0, 'added3': 0, 'kept2': 0, 'kept3': 0,
           'skipped_empty': 0, 'stripped': 0}
    kept_detail = []
    dupes = []

    for path in files:
        with open(path, encoding='utf-8') as fh:
            src = fh.read()
        new, st = process(src, renumber=renumber)
        tot['files'] += 1
        for k in ('added2', 'added3', 'kept2', 'kept3', 'skipped_empty', 'stripped'):
            tot[k] += st[k]
        if st['kept2'] or st['kept3']:
            kept_detail.append((os.path.relpath(path, ROOT), st['kept2'], st['kept3']))

        # ---- ตรวจ id ซ้ำ "หลัง" ประมวลผล ก่อนเขียนลงดิสก์
        # แทรก <h2> ใหม่กลางบทแล้วรันโหมดปกติ = อันใหม่ได้เลขตามตำแหน่ง ส่วนอันเดิม
        # ยังถือเลขเดิมไว้ → id ซ้ำเงียบ ๆ แล้วทุก #sn-sec-N วิ่งไปหาอันแรกเสมอ
        ids = heading_ids(new)
        seen, dup = set(), []
        for i in ids:
            if i in seen and i not in dup:
                dup.append(i)
            seen.add(i)
        if dup:
            dupes.append((os.path.relpath(path, ROOT), dup))
            continue                      # ไฟล์นี้ไม่เขียน จะได้ไม่ฝัง id ซ้ำลงดิสก์

        if new != src:
            tot['changed'] += 1
            if not dry:
                with open(path, 'w', encoding='utf-8') as fh:
                    fh.write(new)

    print('mode               : %s%s' % ('renumber' if renumber else 'fill-in-blanks',
                                         ' + dry-run' if dry else ''))
    print('files scanned      : %d' % tot['files'])
    print('files changed      : %d%s' % (tot['changed'], ' (dry-run, ไม่ได้เขียน)' if dry else ''))
    if renumber:
        print('ids stripped first : %d  (sn-sec-N/sn-sub-N เดิม)' % tot['stripped'])
    print('h2 ids added       : %d  (sn-sec-N)' % tot['added2'])
    print('h3 ids added       : %d  (sn-sub-N)' % tot['added3'])
    print('h2 ids kept as-is  : %d' % tot['kept2'])
    print('h3 ids kept as-is  : %d' % tot['kept3'])
    print('headings skipped (ข้อความว่าง): %d' % tot['skipped_empty'])
    print('files with duplicate heading id : %d' % len(dupes))
    if kept_detail and not renumber:
        print('\nไฟล์ที่มี id เดิมอยู่แล้ว (ไม่ทับ):')
        for rel, k2, k3 in kept_detail:
            print('  %-40s h2=%d h3=%d' % (rel, k2, k3))
    if dupes:
        print('\nid ซ้ำในไฟล์เดียวกัน — ไม่เขียนไฟล์เหล่านี้:', file=sys.stderr)
        for rel, dup in dupes:
            print('  %-50s %s' % (rel, ' '.join(dup)), file=sys.stderr)
        print('\nแก้ด้วย: python3 tools/add-heading-ids.py --renumber'
              '\n(แล้วต้องรัน tools/build-search-index.py ใหม่ เพราะเลข anchor เลื่อน)',
              file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
