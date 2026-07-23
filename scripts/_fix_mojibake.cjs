const fs = require('fs');
const path = require('path');
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
const map = {
  'Ã\xad': 'í', 'Ã³': 'ó', 'Ã©': 'é', 'Ã¡': 'á', 'Ã±': 'ñ', 'Ãº': 'ú', 'Ã¼': 'ü',
  'Ã\x8d': 'Í', 'Ã\x93': 'Ó', 'Ã\x9a': 'Ú', 'Ã\x81': 'Á', 'Ã‰': 'É',
  'Â ': ' ', 'Â¡': '¡', 'Â¿': '¿', 'Â£': '£', 'Â¢': '¢',
  'â€œ': '“', 'â€\u009d': '”', 'â€™': '’', 'â€˜': '‘', 'â€”': '—', 'â€“': '–', 'â€¦': '…',
  'â˜…': '?', 'â˜†': '?',
  'âœ“': '?', 'âœ\x8b': '?',
  'ðŸ“\x8d': '??',
  'â‚¬': '€',
};
for (const f of files) {
  let raw = fs.readFileSync(f, 'utf8');
  let out = raw;
  for (const [k, v] of Object.entries(map)) {
    while (out.indexOf(k) !== -1) {
      const next = out.split(k).join(v);
      if (next === out) break;
      out = next;
    }
  }
  fs.writeFileSync(f, out, 'utf8');
  console.log('fixed:', f);
}
