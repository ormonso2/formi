import { CONVERSION_MAP } from '@/types/conversion';

const EXTENSION_TO_MIME: Record<string, string> = {
  'pdf':  'application/pdf',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'doc':  'application/msword',
  'txt':  'text/plain',
  'md':   'text/markdown',
  'html': 'text/html',
  'jpg':  'image/jpeg',
  'jpeg': 'image/jpeg',
  'png':  'image/png',
  'webp': 'image/webp',
  'avif': 'image/avif',
  'gif':  'image/gif',
  'tiff': 'image/tiff',
  'svg':  'image/svg+xml',
  'heic': 'image/heic',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xls':  'application/vnd.ms-excel',
  'csv':  'text/csv',
  'ods':  'application/vnd.oasis.opendocument.spreadsheet',
  'json': 'application/json',
  'xml':  'application/xml',
  'yaml': 'application/x-yaml',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'ppt':  'application/vnd.ms-powerpoint',
  'zip':  'application/zip',
};

const MIME_TO_EXTENSION: Record<string, string> = {};
for (const [ext, mime] of Object.entries(EXTENSION_TO_MIME)) {
  if (!MIME_TO_EXTENSION[mime]) {
    MIME_TO_EXTENSION[mime] = ext;
  }
}

export function getExtensionFromFilename(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1];
}

export async function detectFileType(buffer: Buffer, filename: string): Promise<string> {
  // Try file-type detection from buffer magic bytes
  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const result = await fileTypeFromBuffer(buffer);
    if (result) {
      const ext = result.ext;
      if (CONVERSION_MAP[ext]) return ext;
    }
  } catch {
    // file-type couldn't detect, fall back to extension
  }

  // Fallback: use extension
  const ext = getExtensionFromFilename(filename);
  if (ext && CONVERSION_MAP[ext]) return ext;

  return ext || 'unknown';
}

export function getMimeType(ext: string): string {
  return EXTENSION_TO_MIME[ext.toLowerCase()] || 'application/octet-stream';
}

export function isSupported(ext: string): boolean {
  return ext.toLowerCase() in CONVERSION_MAP;
}

export function getAcceptedMimeTypes(): string[] {
  return Object.values(EXTENSION_TO_MIME);
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
