import path from 'path';
import fs from 'fs/promises';
import { ConversionOptions } from '@/types/conversion';

export async function convertDocument(
  inputPath: string,
  outputDir: string,
  sourceFormat: string,
  targetFormat: string,
  _options?: ConversionOptions
): Promise<string> {
  const outputPath = path.join(outputDir, `output.${targetFormat}`);

  switch (`${sourceFormat}->${targetFormat}`) {
    case 'docx->html': {
      const mammoth = await import('mammoth');
      const result = await mammoth.convertToHtml({ path: inputPath });
      await fs.writeFile(outputPath, result.value, 'utf-8');
      return outputPath;
    }

    case 'docx->txt': {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: inputPath });
      await fs.writeFile(outputPath, result.value, 'utf-8');
      return outputPath;
    }

    case 'docx->md': {
      const mammoth = await import('mammoth');
      const htmlResult = await mammoth.convertToHtml({ path: inputPath });
      // Simple HTML to Markdown conversion
      const md = htmlToMarkdown(htmlResult.value);
      await fs.writeFile(outputPath, md, 'utf-8');
      return outputPath;
    }

    case 'docx->pdf': {
      // Use mammoth to get HTML, then create a styled PDF
      const mammoth = await import('mammoth');
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const htmlResult = await mammoth.extractRawText({ path: inputPath });

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const margin = 50;

      const lines = wrapText(htmlResult.value, font, fontSize, 500);
      let page = pdfDoc.addPage([612, 792]); // Letter size
      let y = 792 - margin;

      for (const line of lines) {
        if (y < margin) {
          page = pdfDoc.addPage([612, 792]);
          y = 792 - margin;
        }
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= fontSize * 1.5;
      }

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(outputPath, pdfBytes);
      return outputPath;
    }

    case 'pdf->txt': {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const buffer = await fs.readFile(inputPath);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdfDocument = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      await fs.writeFile(outputPath, fullText, 'utf-8');
      return outputPath;
    }

    case 'txt->md': {
      const content = await fs.readFile(inputPath, 'utf-8');
      await fs.writeFile(outputPath, content, 'utf-8');
      return outputPath;
    }

    case 'txt->docx':
    case 'md->docx': {
      const content = await fs.readFile(inputPath, 'utf-8');
      const htmlDocx = (await import('html-docx-js')).default;
      const html = `<html><body><pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${escapeHtml(content)}</pre></body></html>`;
      const docxBuffer = htmlDocx.asBlob(html);
      const arrayBuffer = await docxBuffer.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
      return outputPath;
    }

    case 'txt->pdf':
    case 'md->pdf': {
      const content = await fs.readFile(inputPath, 'utf-8');
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 50;

      const lines = wrapText(content, font, fontSize, 500);
      let page = pdfDoc.addPage([612, 792]);
      let y = 792 - margin;

      for (const line of lines) {
        if (y < margin) {
          page = pdfDoc.addPage([612, 792]);
          y = 792 - margin;
        }
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= fontSize * 1.5;
      }

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(outputPath, pdfBytes);
      return outputPath;
    }

    case 'html->txt': {
      const content = await fs.readFile(inputPath, 'utf-8');
      const text = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      await fs.writeFile(outputPath, text, 'utf-8');
      return outputPath;
    }

    case 'html->docx': {
      const content = await fs.readFile(inputPath, 'utf-8');
      const htmlDocx = (await import('html-docx-js')).default;
      const docxBuffer = htmlDocx.asBlob(content);
      const arrayBuffer = await docxBuffer.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
      return outputPath;
    }

    case 'html->pdf':
    case 'md->html': {
      const content = await fs.readFile(inputPath, 'utf-8');
      if (targetFormat === 'html') {
        // Markdown to HTML - basic conversion
        const html = markdownToHtml(content);
        await fs.writeFile(outputPath, html, 'utf-8');
      } else {
        // HTML to PDF
        const text = content.replace(/<[^>]*>/g, '');
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const lines = wrapText(text, font, 11, 500);
        let page = pdfDoc.addPage([612, 792]);
        let y = 742;
        for (const line of lines) {
          if (y < 50) { page = pdfDoc.addPage([612, 792]); y = 742; }
          page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0, 0, 0) });
          y -= 16;
        }
        await fs.writeFile(outputPath, await pdfDoc.save());
      }
      return outputPath;
    }

    case 'pdf->docx': {
      // Extrae texto con pdfjs-dist y genera docx con html-docx-js
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const buffer = await fs.readFile(inputPath);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdfDocument = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      const htmlDocx = (await import('html-docx-js')).default;
      const html = `<html><body><pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${escapeHtml(fullText)}</pre></body></html>`;
      const docxBuffer = htmlDocx.asBlob(html);
      const arrayBuffer = await docxBuffer.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
      return outputPath;
    }

    case 'doc->txt': {
      // Extracción best-effort del formato .doc binario (secuencias ASCII)
      const raw = await fs.readFile(inputPath);
      const text = extractDocText(raw);
      await fs.writeFile(outputPath, text, 'utf-8');
      return outputPath;
    }

    case 'doc->pdf': {
      const raw  = await fs.readFile(inputPath);
      const text = extractDocText(raw);
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin   = 50;
      const lines    = wrapText(text, font, fontSize, 500);
      let page = pdfDoc.addPage([612, 792]);
      let y = 742;
      for (const line of lines) {
        if (y < margin) { page = pdfDoc.addPage([612, 792]); y = 742; }
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= fontSize * 1.5;
      }
      await fs.writeFile(outputPath, await pdfDoc.save());
      return outputPath;
    }

    case 'doc->docx': {
      const raw  = await fs.readFile(inputPath);
      const text = extractDocText(raw);
      const htmlDocx = (await import('html-docx-js')).default;
      const html = `<html><body><pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${escapeHtml(text)}</pre></body></html>`;
      const docxBuffer = htmlDocx.asBlob(html);
      const arrayBuffer = await docxBuffer.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
      return outputPath;
    }

    case 'txt->html': {
      const content = await fs.readFile(inputPath, 'utf-8');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:20px}pre{white-space:pre-wrap;word-wrap:break-word;background:#f5f5f5;padding:16px;border-radius:4px}</style></head><body><pre>${escapeHtml(content)}</pre></body></html>`;
      await fs.writeFile(outputPath, html, 'utf-8');
      return outputPath;
    }

    case 'html->md': {
      const content = await fs.readFile(inputPath, 'utf-8');
      const md = htmlToMarkdown(content);
      await fs.writeFile(outputPath, md, 'utf-8');
      return outputPath;
    }

    case 'pdf->html': {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const buffer = await fs.readFile(inputPath);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdfDocument = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:20px}pre{white-space:pre-wrap;word-wrap:break-word}</style></head><body><pre>${escapeHtml(fullText)}</pre></body></html>`;
      await fs.writeFile(outputPath, html, 'utf-8');
      return outputPath;
    }

    case 'md->txt': {
      const content = await fs.readFile(inputPath, 'utf-8');
      const text = content
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, '').trim())
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/^>\s+/gm, '')
        .replace(/^---+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      await fs.writeFile(outputPath, text, 'utf-8');
      return outputPath;
    }

    default:
      throw new Error(`Conversión no soportada: ${sourceFormat} → ${targetFormat}`);
  }
}

export function isDocumentFormat(ext: string): boolean {
  return ['docx', 'doc', 'pdf', 'txt', 'md', 'html'].includes(ext.toLowerCase());
}

/**
 * Extracción best-effort de texto de archivos .doc binarios (formato Word 97-2003).
 * Lee secuencias de caracteres imprimibles del stream de datos sin necesitar LibreOffice.
 */
function extractDocText(buffer: Buffer): string {
  const chars: string[] = [];
  let run = '';
  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    // Caracteres ASCII imprimibles o saltos de línea/tab
    if ((b >= 0x20 && b <= 0x7e) || b === 0x09 || b === 0x0a || b === 0x0d) {
      run += String.fromCharCode(b);
    } else {
      if (run.length >= 4) chars.push(run);
      run = '';
    }
  }
  if (run.length >= 4) chars.push(run);

  // Unir y limpiar: quitar basura binaria corta y cadenas repetidas
  return chars
    .join(' ')
    .replace(/\s{3,}/g, '\n\n')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '')
    .trim();
}

// Helper functions
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body><p>${html}</p></body></html>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const result: string[] = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      result.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      try {
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth && currentLine) {
          result.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      } catch {
        // If we can't measure, just add word
        currentLine = testLine;
      }
    }
    if (currentLine) result.push(currentLine);
  }

  return result;
}
