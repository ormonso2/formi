/**
 * Conversiones de presentaciones (PPTX / PPT) sin dependencia de APIs externas.
 *
 * PPTX es un archivo ZIP con XML dentro (OpenXML).
 * Se extrae el texto de cada diapositiva con JSZip + regex y se genera
 * el archivo de salida con pdf-lib o sharp.
 *
 * PPT (formato binario Word 97-2003) se maneja con extracción best-effort
 * de texto (igual que .doc) ya que no existe parser puro-JS completo.
 */

import path from 'path';
import fs from 'fs/promises';

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface SlideContent {
  title: string;
  bullets: string[];
  notes: string;
}

// ─── Utilidades internas ────────────────────────────────────────────────────

/**
 * Extrae texto de un bloque XML de DrawingML (<a:t> tags).
 * Funciona para slides, notas y títulos.
 */
function extractXmlText(xml: string): string {
  // Primero intenta capturar párrafos separados
  const paragraphs: string[] = [];
  const paraMatches = xml.matchAll(/<a:p[^>]*>([\s\S]*?)<\/a:p>/g);
  for (const pMatch of paraMatches) {
    const paraXml = pMatch[1];
    const texts   = [...paraXml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map(m => m[1]);
    const joined  = texts.join('').trim();
    if (joined) paragraphs.push(joined);
  }
  return paragraphs.join('\n');
}

/**
 * Parsea un archivo PPTX (ZIP + XML) y devuelve el contenido de cada slide.
 */
async function parsePptx(inputPath: string): Promise<SlideContent[]> {
  const JSZip = (await import('jszip')).default;
  const data  = await fs.readFile(inputPath);
  const zip   = await JSZip.loadAsync(data);

  // Ordenar slides numéricamente
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const nA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
      const nB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
      return nA - nB;
    });

  const slides: SlideContent[] = [];

  for (const slideFile of slideFiles) {
    const xml = await zip.files[slideFile].async('text');

    // Título: elemento con idx="0" o tipo "title" / "ctrTitle"
    let title = '';
    const titleMatch = xml.match(/<p:sp>[\s\S]*?<p:ph[^>]*(?:idx="0"|type="(?:title|ctrTitle)")[\s\S]*?<\/p:sp>/);
    if (titleMatch) title = extractXmlText(titleMatch[0]);

    // Bullets / cuerpo del slide (excluye el bloque del título)
    const bodyXml = titleMatch ? xml.replace(titleMatch[0], '') : xml;
    const bullets = extractXmlText(bodyXml)
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Notas del presentador (archivo separado en ppt/notesSlides/)
    const slideNum   = slideFile.match(/slide(\d+)/)?.[1] ?? '';
    const notesFile  = `ppt/notesSlides/notesSlide${slideNum}.xml`;
    let notes = '';
    if (zip.files[notesFile]) {
      const notesXml = await zip.files[notesFile].async('text');
      notes = extractXmlText(notesXml);
    }

    slides.push({ title, bullets, notes });
  }

  return slides;
}

/**
 * Extracción best-effort de texto de archivos PPT binarios (Word 97-2003).
 * Lee secuencias ASCII del stream de datos.
 */
function extractPptText(buffer: Buffer): string {
  const runs: string[] = [];
  let current = '';
  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    if ((b >= 0x20 && b <= 0x7e) || b === 0x09 || b === 0x0a || b === 0x0d) {
      current += String.fromCharCode(b);
    } else {
      if (current.length >= 4) runs.push(current);
      current = '';
    }
  }
  if (current.length >= 4) runs.push(current);
  return runs.join(' ').replace(/\s{3,}/g, '\n\n').trim();
}

// ─── Exportaciones públicas ─────────────────────────────────────────────────

export function isPresentationFormat(ext: string): boolean {
  return ['pptx', 'ppt'].includes(ext.toLowerCase());
}

/** PPTX → PDF: renderiza cada diapositiva como página A4 con pdf-lib */
export async function pptxToPdf(inputPath: string, outputDir: string): Promise<string> {
  const slides = await parsePptx(inputPath);
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const pdfDoc   = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageW  = 841.89; // A4 landscape
  const pageH  = 595.28;
  const margin = 50;
  const slideColor   = rgb(0.95, 0.95, 0.98);
  const titleColor   = rgb(0.12, 0.18, 0.45);
  const contentColor = rgb(0.15, 0.15, 0.15);
  const noteColor    = rgb(0.45, 0.45, 0.45);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const page  = pdfDoc.addPage([pageW, pageH]);

    // Fondo suave
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: slideColor });

    // Número de diapositiva
    page.drawText(`${i + 1} / ${slides.length}`, {
      x: pageW - margin - 40,
      y: margin / 2,
      size: 8,
      font: fontReg,
      color: noteColor,
    });

    // Línea superior decorativa
    page.drawRectangle({ x: 0, y: pageH - 8, width: pageW, height: 8, color: titleColor });

    let y = pageH - margin - 10;

    // Título
    const titleText = slide.title || `Diapositiva ${i + 1}`;
    page.drawText(titleText.substring(0, 80), {
      x: margin,
      y,
      size: 24,
      font: fontBold,
      color: titleColor,
      maxWidth: pageW - margin * 2,
    });
    y -= 36;

    // Línea divisoria
    page.drawLine({
      start: { x: margin, y },
      end:   { x: pageW - margin, y },
      thickness: 1,
      color: titleColor,
    });
    y -= 20;

    // Bullets / contenido
    for (const bullet of slide.bullets.slice(0, 15)) {
      if (y < margin + 40) break;
      const line = bullet.substring(0, 100);
      page.drawText(`• ${line}`, {
        x: margin + 10,
        y,
        size: 14,
        font: fontReg,
        color: contentColor,
        maxWidth: pageW - margin * 2 - 20,
      });
      y -= 22;
    }

    // Notas del presentador (si existen)
    if (slide.notes) {
      const notesY = margin + 10;
      page.drawLine({
        start: { x: margin, y: notesY + 16 },
        end:   { x: pageW - margin, y: notesY + 16 },
        thickness: 0.5,
        color: noteColor,
      });
      page.drawText(`Notas: ${slide.notes.substring(0, 120)}`, {
        x: margin,
        y: notesY,
        size: 9,
        font: fontReg,
        color: noteColor,
        maxWidth: pageW - margin * 2,
      });
    }
  }

  const outputPath = path.join(outputDir, 'output.pdf');
  await fs.writeFile(outputPath, await pdfDoc.save());
  return outputPath;
}

/** PPTX → jpg/png: renderiza la primera diapositiva como imagen */
export async function pptxToImage(
  inputPath: string,
  outputDir: string,
  targetFormat: string
): Promise<string> {
  // Genera un PDF temporal con la primera slide y lo convierte a imagen
  const tmpDir = outputDir;
  const pdfPath = path.join(tmpDir, '_slide_tmp.pdf');

  const slides = await parsePptx(inputPath);
  const slide  = slides[0] ?? { title: '', bullets: [], notes: '' };

  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc   = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageW = 1280;
  const pageH = 720;
  const margin = 60;

  const page = pdfDoc.addPage([pageW, pageH]);
  page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(0.95, 0.95, 0.98) });
  page.drawRectangle({ x: 0, y: pageH - 10, width: pageW, height: 10, color: rgb(0.12, 0.18, 0.45) });

  let y = pageH - margin - 20;
  const titleText = slide.title || 'Diapositiva 1';
  page.drawText(titleText.substring(0, 60), { x: margin, y, size: 36, font: fontBold, color: rgb(0.12, 0.18, 0.45), maxWidth: pageW - margin * 2 });
  y -= 55;
  page.drawLine({ start: { x: margin, y }, end: { x: pageW - margin, y }, thickness: 1.5, color: rgb(0.12, 0.18, 0.45) });
  y -= 30;

  for (const bullet of slide.bullets.slice(0, 10)) {
    if (y < margin + 40) break;
    page.drawText(`• ${bullet.substring(0, 80)}`, { x: margin + 10, y, size: 20, font: fontReg, color: rgb(0.15, 0.15, 0.15), maxWidth: pageW - margin * 2 - 20 });
    y -= 32;
  }

  await fs.writeFile(pdfPath, await pdfDoc.save());

  // Rasterizar con pdfjs + @napi-rs/canvas
  const { pdfToImage } = await import('./images');
  const result = await pdfToImage(pdfPath, tmpDir, targetFormat);

  // Renombrar al nombre final si el temporal fue generado con otro nombre
  const finalPath = path.join(outputDir, `output.${targetFormat}`);
  if (result !== finalPath) await fs.rename(result, finalPath).catch(() => null);

  // Limpiar PDF temporal
  await fs.unlink(pdfPath).catch(() => null);
  return finalPath;
}

/** PPT (binario) → PPTX: no se puede reconstruir semánticamente;
 *  devuelve un PPTX con el texto extraído en una sola diapositiva */
export async function pptToPptx(inputPath: string, outputDir: string): Promise<string> {
  // Extraemos texto y creamos un PPTX mínimo válido usando JSZip
  const buffer = await fs.readFile(inputPath);
  const text   = extractPptText(buffer);

  // Plantilla PPTX mínima (1 slide con texto)
  const outputPath = await buildMinimalPptx(text, outputDir, 'output.pptx');
  return outputPath;
}

/** PPT → PDF: extrae texto y genera PDF */
export async function pptToPdf(inputPath: string, outputDir: string): Promise<string> {
  const buffer = await fs.readFile(inputPath);
  const text   = extractPptText(buffer);

  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pageW  = 841.89;
  const pageH  = 595.28;
  const margin = 50;
  const lineH  = 16;

  const lines  = text.split('\n').flatMap(l => wrapLine(l, 100));
  let page = pdfDoc.addPage([pageW, pageH]);
  let y    = pageH - margin;

  for (const line of lines) {
    if (y < margin) { page = pdfDoc.addPage([pageW, pageH]); y = pageH - margin; }
    page.drawText(line.substring(0, 120), { x: margin, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= lineH;
  }

  const outputPath = path.join(outputDir, 'output.pdf');
  await fs.writeFile(outputPath, await pdfDoc.save());
  return outputPath;
}

// ─── Helpers privados ────────────────────────────────────────────────────────

function wrapLine(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    result.push(text.substring(i, i + maxChars));
    i += maxChars;
  }
  return result;
}

/**
 * Genera un archivo PPTX mínimo válido con el texto dado en la primera diapositiva.
 * Construye la estructura ZIP de OpenXML manualmente con JSZip.
 */
async function buildMinimalPptx(text: string, outputDir: string, filename: string): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const zip   = new JSZip();

  // Escapa caracteres XML
  const safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Crear párrafos: una línea = un párrafo
  const paragraphs = safe
    .split('\n')
    .filter(l => l.trim())
    .map(l => `<a:p><a:r><a:t>${l.substring(0, 200)}</a:t></a:r></a:p>`)
    .join('\n');

  // [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
</Types>`);

  // _rels/.rels
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  // ppt/presentation.xml
  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldSz cx="9144000" cy="5143500"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst>
</p:presentation>`);

  zip.file('ppt/_rels/presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`);

  // Slide principal
  zip.file('ppt/slides/slide1.xml', `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld><p:spTree>
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="1" name="TextBox"/>
        <p:cNvSpPr txBox="1"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm><a:off x="457200" y="457200"/><a:ext cx="8229600" cy="4228800"/></a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square"/>
        <a:lstStyle/>
        ${paragraphs}
      </p:txBody>
    </p:sp>
  </p:spTree></p:cSld>
</p:sld>`);

  zip.file('ppt/slides/_rels/slide1.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);

  // SlideMaster y SlideLayout mínimos
  zip.file('ppt/slideMasters/slideMaster1.xml', `<?xml version="1.0" encoding="UTF-8"?>
<p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld><p:spTree/></p:cSld>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`);

  zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);

  zip.file('ppt/slideLayouts/slideLayout1.xml', `<?xml version="1.0" encoding="UTF-8"?>
<p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld><p:spTree/></p:cSld>
</p:sldLayout>`);

  zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`);

  const outputPath = path.join(outputDir, filename);
  const buffer     = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}
