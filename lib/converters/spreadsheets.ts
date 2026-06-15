import path from 'path';
import fs from 'fs/promises';
import * as XLSX from 'xlsx';

export async function convertSpreadsheet(
  inputPath: string,
  outputDir: string,
  sourceFormat: string,
  targetFormat: string
): Promise<string> {
  const outputPath = path.join(outputDir, `output.${targetFormat}`);
  const buffer = await fs.readFile(inputPath);
  const workbook = XLSX.read(buffer);

  switch (targetFormat.toLowerCase()) {
    case 'csv': {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      await fs.writeFile(outputPath, csv, 'utf-8');
      break;
    }

    case 'json': {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
      break;
    }

    case 'xlsx': {
      XLSX.writeFile(workbook, outputPath);
      break;
    }

    case 'ods': {
      XLSX.writeFile(workbook, outputPath, { bookType: 'ods' });
      break;
    }

    case 'xml': {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
      const xml = jsonToXml(jsonData);
      await fs.writeFile(outputPath, xml, 'utf-8');
      break;
    }

    case 'pdf': {
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      const rows     = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

      const pdfDoc   = await PDFDocument.create();
      const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pageW    = 841.89; // A4 landscape
      const pageH    = 595.28;
      const margin   = 40;
      const rowH     = 16;
      const colW     = Math.min(120, (pageW - margin * 2) / Math.max(1, (rows[0]?.length ?? 1)));

      let page = pdfDoc.addPage([pageW, pageH]);
      let y    = pageH - margin;

      for (let r = 0; r < rows.length; r++) {
        if (y < margin + rowH) {
          page = pdfDoc.addPage([pageW, pageH]);
          y    = pageH - margin;
        }
        const rowData = rows[r] ?? [];
        for (let c = 0; c < rowData.length; c++) {
          const cellText = String(rowData[c] ?? '').substring(0, 20);
          page.drawText(cellText, {
            x: margin + c * colW,
            y,
            size: 9,
            font: r === 0 ? boldFont : font,
            color: rgb(0, 0, 0),
            maxWidth: colW - 4,
          });
        }
        // Línea separadora
        page.drawLine({
          start: { x: margin, y: y - 2 },
          end:   { x: pageW - margin, y: y - 2 },
          thickness: r === 0 ? 0.8 : 0.2,
          color: rgb(0.7, 0.7, 0.7),
        });
        y -= rowH;
      }

      await fs.writeFile(outputPath, await pdfDoc.save());
      break;
    }

    case 'yaml': {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      const yaml = sheetJsonToYaml(jsonData);
      await fs.writeFile(outputPath, yaml, 'utf-8');
      break;
    }

    case 'txt': {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      await fs.writeFile(outputPath, csv, 'utf-8');
      break;
    }

    default:
      throw new Error(`Conversión de hoja de cálculo no soportada: ${sourceFormat} → ${targetFormat}`);
  }

  return outputPath;
}

export function isSpreadsheetFormat(ext: string): boolean {
  return ['xlsx', 'xls', 'csv', 'ods'].includes(ext.toLowerCase());
}

function jsonToXml(data: Record<string, unknown>[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
  for (const item of data) {
    xml += '  <record>\n';
    for (const [key, value] of Object.entries(item)) {
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      xml += `    <${safeKey}>${escapeXml(String(value))}</${safeKey}>\n`;
    }
    xml += '  </record>\n';
  }
  xml += '</records>';
  return xml;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sheetJsonToYaml(data: unknown[]): string {
  if (data.length === 0) return '[]\n';
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const entries = Object.entries(item);
      if (entries.length === 0) return '- {}\n';
      const [first, ...rest] = entries;
      let result = `- ${first[0]}: ${formatYamlVal(first[1])}\n`;
      for (const [key, value] of rest) {
        result += `  ${key}: ${formatYamlVal(value)}\n`;
      }
      return result;
    }
    return `- ${item}\n`;
  }).join('');
}

function formatYamlVal(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    if (value.includes(':') || value.includes('#') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return value || '""';
  }
  return String(value);
}
