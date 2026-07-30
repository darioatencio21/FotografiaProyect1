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
const map = {
  '�\xad': '�', 'ó': '�', 'é': '�', 'á': '�', 'ñ': '�', 'ú': '�', 'ü': '�',
  '�\x8d': '�', '�\x93': '�', '�\x9a': '�', '�\x81': '�', 'É': '�',
  '� ': ' ', '¡': '�', '¿': '�', '£': '�', '¢': '�',
  '“': '�', '�\u009d': '�', '’': '�', '‘': '�', '—': '�', '–': '�', '…': '�',
  '★': '?', '☆': '?',
  '✓': '?', '�\x8b': '?',
  '€': '�',
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
