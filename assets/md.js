/* ============================================================
   Markdown → HTML แบบเล็กที่สุดที่พอใช้กับเอกสารใน workspace นี้
   ใช้โดย docs.html เท่านั้น · ไม่มี dependency ภายนอก

   รองรับ: heading, GFM table, fenced code, list (ไม่ซ้อนชั้น),
           blockquote, hr, paragraph
           inline: `code`  **bold**  *em*  _em_  ~~del~~  [text](url)

   สิ่งที่จงใจไม่รองรับ (ยังไม่มีใช้ในเอกสารชุดนี้):
     list ซ้อนชั้น · reference link · รูปภาพ · HTML ดิบใน markdown
   ถ้าเอกสารใหม่ต้องใช้ ให้เพิ่มที่นี่ อย่าเขียน HTML ปนลงไฟล์ .md

   หมายเหตุเรื่องภาษาไทย: เอกสารตัดบรรทัดเองที่ ~80 คอลัมน์
   ถ้าเอาบรรทัดมาต่อกันด้วยช่องว่างเสมอ ข้อความไทยจะมีช่องว่างโผล่กลางประโยค
   จึงต่อแบบไม่ใส่ช่องว่างเมื่อตัวอักษรสองฝั่งเป็นไทยทั้งคู่
   ============================================================ */

(function (global) {
  'use strict';

  var MARK = '\u0001';   /* ตัวคั่น placeholder ของ `code` — ไม่มีทางโผล่ในเอกสาร */

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function isThai(ch) {
    return ch >= '฀' && ch <= '๿';
  }

  /* ต่อบรรทัดที่ถูกตัดไว้ให้กลับเป็นย่อหน้าเดียว */
  function joinWrapped(arr) {
    var s = arr[0];
    for (var i = 1; i < arr.length; i++) {
      var a = s.charAt(s.length - 1);
      var b = arr[i].charAt(0);
      s += (isThai(a) && isThai(b)) ? '' : ' ';
      s += arr[i];
    }
    return s;
  }

  function slug(text) {
    return text
      .replace(/[`*_~]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w฀-๿-]/g, '')
      .toLowerCase();
  }

  /* ลิงก์ไป .md ให้เปิดผ่านตัวอ่านเดียวกัน ไม่ใช่ปล่อยให้เบราว์เซอร์ดาวน์โหลด */
  function href(raw) {
    if (/^(https?:)?\/\//.test(raw) || raw.charAt(0) === '#') return raw;
    if (/\.md$/.test(raw)) return 'docs.html?f=' + encodeURIComponent(raw);
    return raw;
  }

  function inline(src) {
    var codes = [];
    var s = esc(src);

    /* กัน `code` ไว้ก่อน กฎอื่นจะได้ไม่เข้าไปยุ่งข้างใน */
    s = s.replace(/`([^`]+)`/g, function (_, c) {
      codes.push(c);
      return MARK + (codes.length - 1) + MARK;
    });

    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, text, target) {
      return '<a href="' + href(target) + '">' + text + '</a>';
    });

    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/(^|[^\w*])\*([^*\n]+)\*(?![\w*])/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^\w_])_([^_\n]+)_(?![\w_])/g, '$1<em>$2</em>');

    return s.replace(new RegExp(MARK + '(\\d+)' + MARK, 'g'), function (_, i) {
      return '<code>' + codes[Number(i)] + '</code>';
    });
  }

  function cells(row) {
    return row.replace(/^\||\|\s*$/g, '').split('|').map(function (c) {
      return c.trim();
    });
  }

  function render(src) {
    var lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (!line.trim()) { i++; continue; }

      /* ---- fenced code ---- */
      if (/^```/.test(line)) {
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
        i++;
        out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
        continue;
      }

      /* ---- heading ---- */
      var h = /^(#{1,6})\s+(.*?)\s*$/.exec(line);
      if (h) {
        var lv = h[1].length;
        out.push('<h' + lv + ' id="' + slug(h[2]) + '">' + inline(h[2]) + '</h' + lv + '>');
        i++;
        continue;
      }

      /* ---- hr ---- */
      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

      /* ---- table (ต้องมีบรรทัดคั่น |---|---| อยู่บรรทัดถัดไป) ---- */
      if (line.charAt(0) === '|' && i + 1 < lines.length &&
          /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        var head = cells(line);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].charAt(0) === '|') {
          rows.push(cells(lines[i]));
          i++;
        }
        var t = ['<div class="table-wrap"><table><thead><tr>'];
        head.forEach(function (c) { t.push('<th>' + inline(c) + '</th>'); });
        t.push('</tr></thead><tbody>');
        rows.forEach(function (r) {
          t.push('<tr>');
          r.forEach(function (c) { t.push('<td>' + inline(c) + '</td>'); });
          t.push('</tr>');
        });
        t.push('</tbody></table></div>');
        out.push(t.join(''));
        continue;
      }

      /* ---- blockquote ---- */
      if (/^>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^>/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + render(quote.join('\n')) + '</blockquote>');
        continue;
      }

      /* ---- list (ไม่ซ้อนชั้น · บรรทัดที่ย่อหน้าถือเป็นส่วนต่อของข้อเดิม) ---- */
      var bullet = /^[-*]\s+(.*)$/.test(line);
      var number = /^\d+\.\s+(.*)$/.test(line);
      if (bullet || number) {
        var tag = bullet ? 'ul' : 'ol';
        var re = bullet ? /^[-*]\s+(.*)$/ : /^\d+\.\s+(.*)$/;
        var items = [];
        while (i < lines.length) {
          var m = re.exec(lines[i]);
          if (m) {
            items.push([m[1].trim()]);
            i++;
          } else if (items.length && /^\s+\S/.test(lines[i])) {
            items[items.length - 1].push(lines[i].trim());
            i++;
          } else {
            break;
          }
        }
        out.push('<' + tag + '>' +
          items.map(function (it) {
            return '<li>' + inline(joinWrapped(it)) + '</li>';
          }).join('') +
          '</' + tag + '>');
        continue;
      }

      /* ---- paragraph ---- */
      var para = [];
      while (i < lines.length && lines[i].trim() &&
             !/^(#{1,6}\s|>|```|\||[-*]\s|\d+\.\s)/.test(lines[i]) &&
             !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
        para.push(lines[i].trim());
        i++;
      }
      if (!para.length) { para.push(lines[i].trim()); i++; }
      out.push('<p>' + inline(joinWrapped(para)) + '</p>');
    }

    return out.join('\n');
  }

  global.renderMarkdown = render;
})(typeof window !== 'undefined' ? window : globalThis);
