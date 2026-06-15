import { ConversionOptions, CONVERSION_MAP } from '@/types/conversion';
import {
  convertImage,
  convertSvg,
  convertHeic,
  imageToPdf,
  svgToPdf,
  pdfToImage,
  isImageFormat,
} from './images';
import { convertDocument, isDocumentFormat } from './documents';
import { convertSpreadsheet, isSpreadsheetFormat } from './spreadsheets';
import { convertData, isDataFormat } from './data';
import {
  isPresentationFormat,
  pptxToPdf,
  pptxToImage,
  pptToPptx,
  pptToPdf,
} from './presentations';

export async function runConversion(
  inputPath: string,
  outputDir: string,
  sourceFormat: string,
  targetFormat: string,
  options?: ConversionOptions
): Promise<string> {
  const src = sourceFormat.toLowerCase();
  const tgt = targetFormat.toLowerCase();

  // Validar que la conversión esté en el mapa de conversiones soportadas
  const allowedTargets = CONVERSION_MAP[src];
  if (!allowedTargets || !allowedTargets.includes(tgt)) {
    throw new Error(`Conversión no soportada: .${src} → .${tgt}`);
  }

  // ── SVG ──────────────────────────────────────────────────────────────────
  if (src === 'svg') {
    if (tgt === 'pdf') return svgToPdf(inputPath, outputDir);
    return convertSvg(inputPath, outputDir, tgt, options);
  }

  // ── HEIC ─────────────────────────────────────────────────────────────────
  if (src === 'heic') {
    return convertHeic(inputPath, outputDir, tgt);
  }

  // ── Imagen → Imagen ───────────────────────────────────────────────────────
  if (isImageFormat(src) && isImageFormat(tgt)) {
    return convertImage(inputPath, outputDir, tgt, options);
  }

  // ── Imagen → PDF ──────────────────────────────────────────────────────────
  if (isImageFormat(src) && tgt === 'pdf') {
    return imageToPdf(inputPath, outputDir);
  }

  // ── PDF → Imagen ──────────────────────────────────────────────────────────
  if (src === 'pdf' && (tgt === 'jpg' || tgt === 'png')) {
    return pdfToImage(inputPath, outputDir, tgt);
  }

  // ── Presentaciones ────────────────────────────────────────────────────────
  if (isPresentationFormat(src)) {
    if (src === 'pptx') {
      if (tgt === 'pdf')                       return pptxToPdf(inputPath, outputDir);
      if (tgt === 'jpg' || tgt === 'png')      return pptxToImage(inputPath, outputDir, tgt);
    }
    if (src === 'ppt') {
      if (tgt === 'pptx')                      return pptToPptx(inputPath, outputDir);
      if (tgt === 'pdf')                       return pptToPdf(inputPath, outputDir);
    }
    throw new Error(`Conversión de presentación no soportada: .${src} → .${tgt}`);
  }

  // ── Documentos ────────────────────────────────────────────────────────────
  if (isDocumentFormat(src) || isDocumentFormat(tgt)) {
    return convertDocument(inputPath, outputDir, src, tgt, options);
  }

  // ── Hojas de cálculo ──────────────────────────────────────────────────────
  if (isSpreadsheetFormat(src)) {
    return convertSpreadsheet(inputPath, outputDir, src, tgt);
  }

  // ── Datos estructurados ───────────────────────────────────────────────────
  if (isDataFormat(src) || isDataFormat(tgt)) {
    return convertData(inputPath, outputDir, src, tgt);
  }

  throw new Error(`No se encontró un convertidor para: .${src} → .${tgt}`);
}


export { CONVERSION_MAP };
