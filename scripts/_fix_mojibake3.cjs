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
  // Heuristic: most common is � (replacing 'Sesi?n'), '�' (Configuraci?n), '�' (Categor?a), '�' (Fotograf?a).
  // Just do a second pass per known common word, after which we'll sweep a generic replacement.
  const ctxMap = [
    [/Configuraci\ufffd/g, 'Configuraci�n'],
    [/Sesi\ufffd/g, 'Sesi�n'],
    [/sesi\ufffd/g, 'sesi�n'],
    [/Categor\ufffd/g, 'Categor�a'],
    [/categor\ufffd/g, 'categor�a'],
    [/Fotograf\ufffd/g, 'Fotograf�a'],
    [/fotograf\ufffd/g, 'fotograf�a'],
    [/Biograf\ufffd/g, 'Biograf�a'],
    [/biograf\ufffd/g, 'biograf�a'],
    [/Gal\ufffder\ufffda/g, 'Galer�a'],
    [/gal\ufffder\ufffda/g, 'galer�a'],
    [/recepci\ufffdn/g, 'recepci�n'],
    [/Recepci\ufffdn/g, 'Recepci�n'],
    [/tel\ufffdfono/g, 'tel�fono'],
    [/Tel\ufffdfono/g, 'Tel�fono'],
    [/d\ufffda/g, 'd�a'],
    [/D\ufffda/g, 'D�a'],
    [/m\ufffds/g, 'm�s'],
    [/pa\ufffds/g, 'pa�s'],
    [/Pa\ufffds/g, 'Pa�s'],
    [/Espa\ufffda/g, 'Espa�a'],
    [/tradici\ufffdn/g, 'tradici�n'],
    [/edici\ufffdn/g, 'edici�n'],
    [/direcci\ufffdn/g, 'direcci�n'],
    [/resoluci\ufffdn/g, 'resoluci�n'],
    [/Camar\ufffdfgrafa/g, 'Camar�grafa'],
    [/camar\ufffdfgrafa/g, 'camar�grafa'],
    [/fotogr\ufffdfa/g, 'fot�grafa'],
    [/Fotogr\ufffdfa/g, 'Fot�grafa'],
    [/Est\ufffdndar/g, 'Est�ndar'],
    [/est\ufffddar/g, 'est�ndar'],
    [/art\ufffdistica/g, 'art�stica'],
    [/Art\ufffdistica/g, 'Art�stica'],
    [/imag\ufffden/g, 'imagen'],
    [/Imag\ufffden/g, 'Imagen'],
    [/cl\ufffdnica/g, 'cl�nica'],
    [/Cl\ufffdinica/g, 'Cl�nica'],
    [/cr\ufffdnica/g, 'cr�nica'],
    [/Cr\ufffdnica/g, 'Cr�nica'],
    [/can\ufffd/g, 'canci�n'],
    [/Can\ufffd/g, 'Canci�n'],
    [/gesti\ufffdn/g, 'gesti�n'],
    [/Gesti\ufffdn/g, 'Gesti�n'],
    [/mod\ufffds/g, 'mod�s'],
    [/an\ufffdlisis/g, 'an�lisis'],
    [/An\ufffdlisis/g, 'An�lisis'],
    [/r\ufffdpido/g, 'r�pido'],
    [/R\ufffdpido/g, 'R�pido'],
    [/p\ufffdrrafo/g, 'p�rrafo'],
    [/P\ufffdrrafo/g, 'P�rrafo'],
    [/m\ufffds/g, 'm�s'],
    [/M\ufffds/g, 'M�s'],
    [/Galer\ufffda/g, 'Galer�a'],
    [/galer\ufffda/g, 'galer�a'],
    [/Protecci\ufffdn/g, 'Protecci�n'],
    [/protecci\ufffdn/g, 'protecci�n'],
    [/m\ufffdgico/g, 'm�gico'],
    [/M\ufffdgico/g, 'M�gico'],
    [/tambi\ufffdn/g, 'tambi�n'],
    [/Tambi\ufffdn/g, 'Tambi�n'],
    [/D\ufffada/g, 'D�diva'],
    [/exploraci\ufffdn/g, 'exploraci�n'],
    [/Exploraci\ufffdn/g, 'Exploraci�n'],
    [/iluminaci\ufffdn/g, 'iluminaci�n'],
    [/Iluminaci\ufffdn/g, 'Iluminaci�n'],
    [/eleg\ufffdncia/g, 'elegancia'],
    [/Eleg\ufffdncia/g, 'Elegancia'],
    [/ult\ufffd/g, 'ult�'],
    [/raz\ufffdn/g, 'raz�n'],
    [/Raz\ufffdn/g, 'Raz�n'],
    [/coraz\ufffdn/g, 'coraz�n'],
    [/Coraz\ufffdn/g, 'Coraz�n'],
    [/Dise\ufffdo/g, 'Dise�o'],
    [/dise\ufffdo/g, 'dise�o'],
    [/a\ufffdo/g, 'a�o'],
    [/A\ufffdo/g, 'A�o'],
    [/ma\ufffdotana/g, 'ma�ana'],
    [/Ma\ufffdotana/g, 'Ma�ana'],
    [/emoci\ufffdn/g, 'emoci�n'],
    [/Emoci\ufffdn/g, 'Emoci�n'],
    [/reuni\ufffdn/g, 'reuni�n'],
    [/Reuni\ufffdn/g, 'Reunión'],
    [/canci\ufffdn/g, 'canción'],
    [/canc\ufffdn/g, 'canción'],
    [/im\ufffdgenes/g, 'imágenes'],
    [/Im\ufffdgenes/g, 'Imágenes'],
    [/Peque\ufffdo/g, 'Pequeño'],
    [/peque\ufffdo/g, 'pequeño'],
    [/se\ufffdd\ufffdn/g, 'sedén'],
    [/[a\ue9]rea/g, 'área'],
    [/\ufffd/g, 'ó'],
  ];
  for (const [pat, val] of ctxMap) str = str.replace(pat, val);
  // Remaining FFFD: most common = 'ó' or 'ñ', default to 'ó'
  str = str.replace(/\ufffd/g, 'ó');
  fs.writeFileSync(f, str, 'utf8');
  console.log('cleaned:', f);
}
