const fs = require('fs');
const files = [
  'src/App.tsx',
  'src/components/AdminCMS.tsx',
  'src/components/AdminPackagesTab.tsx',
  'src/components/AdminProfileTab.tsx',
  'src/components/AdminSEOTab.tsx',
  'src/components/ClientPortal.tsx',
  'src/components/Header.tsx',
  'src/components/InvoiceReceipt.tsx',
  'src/components/Lightbox.tsx',
  'src/data/mockData.ts',
];
// Bytes that were mis-decoded as Windows-1252 then re-encoded as UTF-8.
// Source bytes (in file): C3 AD = í, C3 B3 = ó, C2 A1 = ¡, etc.
// Reverse: take a substring of length N where the previous byte(s) was a control/high bit,
// then check if the resulting bytes form a valid UTF-8 character we want to restore.
// Simpler: scan file, find sequences like 0xC3 0xAD (í) / 0xC3 0xB3 (ó) / 0xC3 0xA1 (á)
// that occur *outside* of originally-valid UTF-8 mojibake (we are decoding wrong-encoding).
// Strategy: re-decode UTF-8 as if it were Latin-1, then re-encode as UTF-8 -- only when
// the resulting character was originally a printable Spanish/Portuguese letter that
// when correctly encoded as UTF-8 equals the bytes 0xC3 0xXX we observed.
const raw = fs.readFileSync(files[0]);
fs.readdirSync('.').forEach(() => {});

for (const f of files) {
  const buf = fs.readFileSync(f);
  const out = Buffer.alloc(buf.length);
  let i = 0, j = 0;
  while (i < buf.length) {
    const b = buf[i];
    // C3 XX pattern that comes from mis-decoded Latin1 (e.g. 0xC3 0xAD -> í)
    if (b === 0xC3 && i + 1 < buf.length) {
      const n = buf[i + 1];
      const map = {
        0xA1: 'á', 0xA9: 'é', 0xAD: 'í', 0xB3: 'ó', 0xBA: 'ú', 0xBC: 'ü',
        0x81: 'Á', 0x89: 'É', 0x8D: 'Í', 0x93: 'Ó', 0x9A: 'Ú',
        0xB1: 'ñ', 0x91: 'Ñ',
      };
      if (map[n]) {
        // output UTF-8 of map[n]
        const ch = map[n];
        const code = ch.codePointAt(0);
        if (code < 0x80) {
          out[j++] = code;
        } else if (code < 0x800) {
          out[j++] = 0xC0 | (code >> 6);
          out[j++] = 0x80 | (code & 0x3F);
        } else {
          out[j++] = 0xE0 | (code >> 12);
          out[j++] = 0x80 | ((code >> 6) & 0x3F);
          out[j++] = 0x80 | (code & 0x3F);
        }
        i += 2;
        continue;
      }
    }
    // C2 XX pattern: 0xC2 0xA1 = ¡, 0xC2 0xBF = ¿
    if (b === 0xC2 && i + 1 < buf.length) {
      const n = buf[i + 1];
      const map = { 0xA1: '¡', 0xBF: '¿', 0xA3: '£', 0xA2: '¢' };
      if (map[n]) {
        const ch = map[n];
        const code = ch.codePointAt(0);
        if (code < 0x80) {
          out[j++] = code;
        } else {
          out[j++] = 0xC0 | (code >> 6);
          out[j++] = 0x80 | (code & 0x3F);
        }
        i += 2;
        continue;
      }
    }
    out[j++] = buf[i++];
  }
  fs.writeFileSync(f, out.slice(0, j));
  console.log('fixed bytes:', f, '->', j, 'bytes');
}
