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
// Fix: Ã (U+00C3) followed by ­ (U+00AD) which together were originally UTF-8 bytes for í.
// Map Ã + 0xAD (U+00AD) -> í
// Ã + ¡ (U+00A1) -> á
// Ã + ¢ (U+00A2) -> â -- nope
// Let's map C3 + XX based on the trailing char.
const map = {
  0xAD: 'í', // Ã­
  0xB3: 'ó', // Ã³
  0xA9: 'é', // Ã©
  0xA1: 'á', // Ã¡
  0xB1: 'ñ', // Ã±
  0xBA: 'ú', // Ãº
  0xBC: 'ü', // Ã¼
  0x81: 'Á', // Ã\x81
  0x89: 'É', // Ã\x89
  0x8D: 'Í', // Ã\x8D
  0x93: 'Ó', // Ã\x93
  0x9A: 'Ú', // Ã\x9a
  0x91: 'Ñ', // Ã\x91
};
for (const f of files) {
  let str = fs.readFileSync(f, 'utf8');
  str = str.replace(/\u00C3([\u0080-\u00BF])/g, (m, c) => {
    const code = c.charCodeAt(0);
    return map[code] || m;
  });
  // C2 + ¡ -> ¡
  str = str.replace(/\u00C2([\u00A0-\u00BF])/g, (m, c) => {
    const code = c.charCodeAt(0);
    if (code === 0xA1) return '¡';
    if (code === 0xBF) return '¿';
    if (code === 0xA0) return ' ';
    if (code === 0xA3) return '£';
    if (code === 0xA2) return '¢';
    return m;
  });
  // Generic residual: â <something> = the literal byte 0xE2 (â) was UTF-8 of U+2014 (—),
  // U+2013 (–), U+2018-201D quotes, U+2026 (…).
  // Common: â€" -> —, â€" -> –, â€œ -> “, â€\u009d -> ”, â€™ -> ', â€˜ -> ', â€¦ -> …
  str = str
    .replace(/â€"/g, '—')
    .replace(/â€"/g, '–')
    .replace(/â€¦/g, '…')
    .replace(/â€œ/g, '“')
    .replace(/â€\u009d/g, '”')
    .replace(/â€™/g, '’')
    .replace(/â€˜/g, '‘')
    .replace(/â€<</g, '«')
    .replace(/â€>>/g, '»')
    .replace(/â˜…/g, '?')
    .replace(/â˜†/g, '?')
    .replace(/âœ“/g, '?')
    .replace(/âœ\x8b/g, '?')
    .replace(/â‚¬/g, '€')
    .replace(/Â /g, ' ')
    .replace(/Â¡/g, '¡')
    .replace(/Â¿/g, '¿')
    .replace(/Â£/g, '£');
  fs.writeFileSync(f, str, 'utf8');
  console.log('cleaned:', f);
}
