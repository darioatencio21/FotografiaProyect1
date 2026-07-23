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
// Replace EF BF BD (U+FFFD replacement char) sequences that came from decoded invalid
// UTF-8 sequences of C3 XX bytes. Map them back to the correct character.
const map = {
  0xA1: 'á', 0xA9: 'é', 0xAD: 'í', 0xB3: 'ó', 0xBA: 'ú', 0xBC: 'ü',
  0x81: 'Á', 0x89: 'É', 0x8D: 'Í', 0x93: 'Ó', 0x9A: 'Ú',
  0xB1: 'ñ', 0x91: 'Ñ',
};
for (const f of files) {
  let buf = fs.readFileSync(f);
  // Iterate
  let out = Buffer.alloc(buf.length);
  let j = 0;
  for (let i = 0; i < buf.length;) {
    if (i + 2 < buf.length && buf[i] === 0xEF && buf[i+1] === 0xBF && buf[i+2] === 0xBD) {
      // U+FFFD -- look at the surrounding context. Skip it. We'll handle via a different approach.
      // For now: just drop it (3 bytes -> nothing) and let the previous/next char merge via context.
      // Better: use a regex replacement on the whole string to find FFFD and replace with appropriate char.
      i += 3;
    } else {
      out[j++] = buf[i++];
    }
  }
  out = out.slice(0, j);
  // Replace any remaining FFFD with the appropriate char based on what comes next.
  // Use utf-8 string ops:
  let str = out.toString('utf8');
  // We need a smart replacement: where we see U+FFFD, try to figure out which letter it was.
  // Heuristic: most common is í (replacing 'Sesi?n'), 'ó' (Configuraci?n), 'á' (Categor?a), 'é' (Fotograf?a).
  // Just do a second pass per known common word, after which we'll sweep a generic replacement.
  const ctxMap = [
    [/Configuraci\ufffd/g, 'Configuración'],
    [/Sesi\ufffd/g, 'Sesión'],
    [/sesi\ufffd/g, 'sesión'],
    [/Categor\ufffd/g, 'Categoría'],
    [/categor\ufffd/g, 'categoría'],
    [/Fotograf\ufffd/g, 'Fotografía'],
    [/fotograf\ufffd/g, 'fotografía'],
    [/Biograf\ufffd/g, 'Biografía'],
    [/biograf\ufffd/g, 'biografía'],
    [/Gal\ufffder\ufffda/g, 'Galería'],
    [/gal\ufffder\ufffda/g, 'galería'],
    [/recepci\ufffdn/g, 'recepción'],
    [/Recepci\ufffdn/g, 'Recepción'],
    [/tel\ufffdfono/g, 'teléfono'],
    [/Tel\ufffdfono/g, 'Teléfono'],
    [/d\ufffda/g, 'día'],
    [/D\ufffda/g, 'Día'],
    [/m\ufffds/g, 'más'],
    [/pa\ufffds/g, 'país'],
    [/Pa\ufffds/g, 'País'],
    [/Espa\ufffda/g, 'España'],
    [/tradici\ufffdn/g, 'tradición'],
    [/edici\ufffdn/g, 'edición'],
    [/direcci\ufffdn/g, 'dirección'],
    [/resoluci\ufffdn/g, 'resolución'],
    [/Camar\ufffdfgrafa/g, 'Camarógrafa'],
    [/camar\ufffdfgrafa/g, 'camarógrafa'],
    [/fotogr\ufffdfa/g, 'fotógrafa'],
    [/Fotogr\ufffdfa/g, 'Fotógrafa'],
    [/Est\ufffdndar/g, 'Estándar'],
    [/est\ufffddar/g, 'estándar'],
    [/art\ufffdistica/g, 'artística'],
    [/Art\ufffdistica/g, 'Artística'],
    [/imag\ufffden/g, 'imagen'],
    [/Imag\ufffden/g, 'Imagen'],
    [/cl\ufffdnica/g, 'clínica'],
    [/Cl\ufffdinica/g, 'Clínica'],
    [/cr\ufffdnica/g, 'crónica'],
    [/Cr\ufffdnica/g, 'Crónica'],
    [/can\ufffd/g, 'canción'],
    [/Can\ufffd/g, 'Canción'],
    [/gesti\ufffdn/g, 'gestión'],
    [/Gesti\ufffdn/g, 'Gestión'],
    [/mod\ufffds/g, 'modós'],
    [/an\ufffdlisis/g, 'análisis'],
    [/An\ufffdlisis/g, 'Análisis'],
    [/r\ufffdpido/g, 'rápido'],
    [/R\ufffdpido/g, 'Rápido'],
    [/p\ufffdrrafo/g, 'párrafo'],
    [/P\ufffdrrafo/g, 'Párrafo'],
    [/m\ufffds/g, 'más'],
    [/M\ufffds/g, 'Más'],
    [/Galer\ufffda/g, 'Galería'],
    [/galer\ufffda/g, 'galería'],
    [/Protecci\ufffdn/g, 'Protección'],
    [/protecci\ufffdn/g, 'protección'],
    [/m\ufffdgico/g, 'mágico'],
    [/M\ufffdgico/g, 'Mágico'],
    [/tambi\ufffdn/g, 'también'],
    [/Tambi\ufffdn/g, 'También'],
    [/D\ufffada/g, 'Dádiva'],
    [/exploraci\ufffdn/g, 'exploración'],
    [/Exploraci\ufffdn/g, 'Exploración'],
    [/iluminaci\ufffdn/g, 'iluminación'],
    [/Iluminaci\ufffdn/g, 'Iluminación'],
    [/eleg\ufffdncia/g, 'elegancia'],
    [/Eleg\ufffdncia/g, 'Elegancia'],
    [/ult\ufffd/g, 'ulté'],
    [/raz\ufffdn/g, 'razón'],
    [/Raz\ufffdn/g, 'Razón'],
    [/coraz\ufffdn/g, 'corazón'],
    [/Coraz\ufffdn/g, 'Corazón'],
    [/Dise\ufffdo/g, 'Diseño'],
    [/dise\ufffdo/g, 'diseño'],
    [/a\ufffdo/g, 'año'],
    [/A\ufffdo/g, 'Año'],
    [/ma\ufffdotana/g, 'mañana'],
    [/Ma\ufffdotana/g, 'Mañana'],
    [/emoci\ufffdn/g, 'emoción'],
    [/Emoci\ufffdn/g, 'Emoción'],
    [/reuni\ufffdn/g, 'reunión'],
    [/Reuni\ufffdn/g, 'Reunión'],
    [/canci\ufffdn/g, 'canción'],
    [/canc\ufffdn/g, 'canción'],
    [/im\ufffdgenes/g, 'imágenes'],
    [/Im\ufffdgenes/g, 'Imágenes'],
    [/Peque\ufffdo/g, 'Pequeño'],
    [/peque\ufffdo/g, 'pequeño'],
    [/se\ufffdd\ufffdn/g, 'sedeón'],
    [/[a\ue9]rea/g, 'área'],
    [/\ufffd/g, 'o'],
  ];
  for (const [pat, val] of ctxMap) str = str.replace(pat, val);
  // Remaining FFFD: most common = 'ó' or 'í', default to 'ó'
  str = str.replace(/\ufffd/g, 'ó');
  fs.writeFileSync(f, str, 'utf8');
  console.log('cleaned:', f);
}
