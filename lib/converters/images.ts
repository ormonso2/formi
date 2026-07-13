import sharp from 'sharp';
import { ConversionOptions } from '@/types/conversion';
import path from 'path';
import fs from 'fs/promises';

type SharpFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff';

const FORMAT_MAP: Record<string, SharpFormat> = {
  'jpg': 'jpeg',
  'jpeg': 'jpeg',
  'png': 'png',
  'webp': 'webp',
  'avif': 'avif',
  'gif': 'gif',
  'tiff': 'tiff',
};

// SVG se convierte a raster con sharp (soportado nativamente)
const SVG_RASTER_TARGETS: SharpFormat[] = ['jpeg', 'png', 'webp', 'avif'];

export async function convertImage(
  inputPath: string,
  outputDir: string,
  targetFormat: string,
  options?: ConversionOptions
): Promise<string> {
  const sharpFormat = FORMAT_MAP[targetFormat.toLowerCase()];

  if (!sharpFormat) {
    throw new Error(`Formato de imagen no soportado: ${targetFormat}`);
  }

  const outputPath = path.join(outputDir, `output.${targetFormat}`);

  let pipeline = sharp(inputPath);

  // Apply resize options if provided
  if (options?.width || options?.height) {
    pipeline = pipeline.resize({
      width: options.width || undefined,
      height: options.height || undefined,
      fit: options.fit || 'contain',
    });
  }

  // Apply format-specific options
  const quality = options?.quality || 85;

  switch (sharpFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality, compressionLevel: 6 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'gif':
      pipeline = pipeline.gif();
      break;
    case 'tiff':
      pipeline = pipeline.tiff({ quality });
      break;
  }

  await pipeline.toFile(outputPath);
  return outputPath;
}

export function isImageFormat(ext: string): boolean {
  const lower = ext.toLowerCase();
  return lower in FORMAT_MAP || lower === 'svg' || lower === 'heic';
}

/** SVG → png / jpg / webp usando sharp (renderizado nativo sin deps del sistema) */
export async function convertSvg(
  inputPath: string,
  outputDir: string,
  targetFormat: string,
  options?: ConversionOptions
): Promise<string> {
  const sharpFormat = FORMAT_MAP[targetFormat.toLowerCase()];
  if (!sharpFormat || !SVG_RASTER_TARGETS.includes(sharpFormat)) {
    throw new Error(`Conversión SVG → ${targetFormat} no soportada`);
  }

  const outputPath = path.join(outputDir, `output.${targetFormat}`);
  const quality = options?.quality ?? 90;

  let pipeline = sharp(inputPath, { density: 150 }); // 150 DPI para buena resolución

  if (options?.width || options?.height) {
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: options.fit ?? 'contain',
    });
  }

  switch (sharpFormat) {
    case 'jpeg': pipeline = pipeline.jpeg({ quality, mozjpeg: true }); break;
    case 'png':  pipeline = pipeline.png({ quality, compressionLevel: 6 }); break;
    case 'webp': pipeline = pipeline.webp({ quality }); break;
    case 'avif': pipeline = pipeline.avif({ quality }); break;
  }

  await pipeline.toFile(outputPath);
  return outputPath;
}

/** SVG → PDF: rasteriza a PNG y luego incrusta en PDF con pdf-lib */
export async function svgToPdf(inputPath: string, outputDir: string): Promise<string> {
  const { PDFDocument } = await import('pdf-lib');

  // Renderizar SVG a PNG en memoria
  const pngBuffer = await sharp(inputPath, { density: 150 }).png().toBuffer();
  const metadata = await sharp(pngBuffer).metadata();
  const width  = metadata.width  ?? 794; // A4 aprox
  const height = metadata.height ?? 1123;

  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([width, height]);
  const pngImg = await pdfDoc.embedPng(pngBuffer);
  page.drawImage(pngImg, { x: 0, y: 0, width, height });

  const outputPath = path.join(outputDir, 'output.pdf');
  await fs.writeFile(outputPath, await pdfDoc.save());
  return outputPath;
}

/** HEIC → jpg / png usando heic-convert (puro JS, sin API) */
export async function convertHeic(
  inputPath: string,
  outputDir: string,
  targetFormat: string
): Promise<string> {
  const heicConvert = (await import('heic-convert')).default;
  const inputBuffer = await fs.readFile(inputPath);

  const format = targetFormat.toLowerCase() === 'png' ? 'PNG' : 'JPEG';
  const outputBuffer = await heicConvert({
    buffer: inputBuffer as unknown as ArrayBuffer,
    format,
    quality: 0.92,
  });

  const outputPath = path.join(outputDir, `output.${targetFormat}`);
  await fs.writeFile(outputPath, Buffer.from(outputBuffer));
  return outputPath;
}

/** PDF → jpg / png usando pdfjs-dist + @napi-rs/canvas (renderizado sin API) */
export async function pdfToImage(
  inputPath: string,
  outputDir: string,
  targetFormat: string,
  pageNumber = 1
): Promise<string> {
  const pdfjsLib  = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');

  // Deshabilitar worker en entorno Node.js
  (pdfjsLib as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = '';

  const data = new Uint8Array(await fs.readFile(inputPath));
  const pdfDoc  = await pdfjsLib.getDocument({
    data,
    verbosity: 0,
    useWorkerFetch: false,
    disableFontFace: true,
  }).promise;

  const page     = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2.0 });
  const width    = Math.round(viewport.width);
  const height   = Math.round(viewport.height);

  const canvas  = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // Fondo blanco
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  await page.render({
    canvasContext: context as unknown as CanvasRenderingContext2D,
    canvas: canvas as unknown as HTMLCanvasElement,
    viewport,
  }).promise;

  const mimeType  = targetFormat === 'jpg' || targetFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
  const buffer    = canvas.toBuffer(mimeType as Parameters<typeof canvas.toBuffer>[0]);
  const outputPath = path.join(outputDir, `output.${targetFormat}`);
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

export async function imageToPdf(inputPath: string, outputDir: string): Promise<string> {
  return imagesToPdf([inputPath], outputDir);
}

export async function imagesToPdf(inputPaths: string[], outputDir: string): Promise<string> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  for (const inputPath of inputPaths) {
    const imageBuffer = await sharp(inputPath).png().toBuffer();
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    const page = pdfDoc.addPage([width, height]);
    const pngImage = await pdfDoc.embedPng(imageBuffer);
    page.drawImage(pngImage, { x: 0, y: 0, width, height });
  }

  const outputPath = path.join(outputDir, 'output.pdf');
  await fs.writeFile(outputPath, await pdfDoc.save());
  return outputPath;
}
