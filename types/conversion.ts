export type ConversionStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export interface ConversionJob {
  id: string;
  originalName: string;
  originalType: string;
  originalSize: number;
  targetFormat: string;
  status: ConversionStatus;
  progress: number;
  inputPath: string;
  outputPath?: string;
  error?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
  includeImages?: boolean;
  preserveFormatting?: boolean;
  compression?: 'none' | 'low' | 'medium' | 'high';
}

export interface UploadResponse {
  jobId: string;
  fileName: string;
  fileType: string;
  fileSizeMB: number;
  availableFormats: FormatOption[];
  isDocx: boolean;
}

export interface FormatOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface RecentConversion {
  id: string;
  fileName: string;
  originalFormat: string;
  targetFormat: string;
  status: 'Completado' | 'Error' | 'Procesando';
  sizeMB: number;
  timeAgo: string;
}

export const CONVERSION_MAP: Record<string, string[]> = {
  'docx': ['pdf', 'txt', 'html', 'md'],
  'doc':  ['pdf', 'docx', 'txt'],
  'pdf':  ['docx', 'txt', 'jpg', 'png', 'html'],
  'txt':  ['pdf', 'docx', 'md', 'html'],
  'md':   ['pdf', 'html', 'docx', 'txt'],
  'html': ['pdf', 'docx', 'txt', 'md'],
  'jpg':  ['png', 'webp', 'avif', 'gif', 'tiff', 'pdf'],
  'jpeg': ['png', 'webp', 'avif', 'gif', 'tiff', 'pdf'],
  'png':  ['jpg', 'webp', 'avif', 'gif', 'tiff', 'pdf'],
  'webp': ['jpg', 'png', 'avif', 'gif', 'tiff'],
  'avif': ['jpg', 'png', 'webp', 'gif', 'tiff'],
  'gif':  ['jpg', 'png', 'webp', 'avif', 'tiff'],
  'tiff': ['jpg', 'png', 'pdf', 'webp', 'avif', 'gif'],
  'svg':  ['png', 'jpg', 'pdf', 'webp', 'avif'],
  'heic': ['jpg', 'png'],
  'xlsx': ['csv', 'json', 'ods', 'pdf', 'xml', 'txt'],
  'xls':  ['xlsx', 'csv', 'json', 'pdf'],
  'csv':  ['xlsx', 'json', 'xml', 'yaml', 'pdf'],
  'ods':  ['xlsx', 'csv', 'json', 'pdf'],
  'json': ['csv', 'xml', 'yaml', 'txt', 'html'],
  'xml':  ['json', 'csv', 'yaml'],
  'yaml': ['json', 'csv', 'xml'],
  'pptx': ['pdf', 'jpg', 'png'],
  'ppt':  ['pptx', 'pdf'],
};

export const FORMAT_INFO: Record<string, { label: string; color: string; bgColor: string; icon: string; description: string }> = {
  pdf:  { label: 'PDF',  color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.12)', icon: 'FileText', description: 'Documento PDF' },
  docx: { label: 'DOCX', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.12)', icon: 'FileText', description: 'Documento Word' },
  doc:  { label: 'DOC',  color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.12)', icon: 'FileText', description: 'Documento Word (legacy)' },
  txt:  { label: 'TXT',  color: '#C9D1D9', bgColor: 'rgba(201, 209, 217, 0.12)', icon: 'FileText', description: 'Texto plano' },
  md:   { label: 'MD',   color: '#C9D1D9', bgColor: 'rgba(201, 209, 217, 0.12)', icon: 'FileText', description: 'Markdown' },
  html: { label: 'HTML', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.12)', icon: 'Code', description: 'Página HTML' },
  jpg:  { label: 'JPG',  color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)', icon: 'Image', description: 'Imagen JPEG' },
  jpeg: { label: 'JPEG', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)', icon: 'Image', description: 'Imagen JPEG' },
  png:  { label: 'PNG',  color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.12)', icon: 'Image', description: 'Imagen PNG' },
  webp: { label: 'WebP', color: '#19D3E6', bgColor: 'rgba(25, 211, 230, 0.12)', icon: 'Image', description: 'Imagen WebP' },
  avif: { label: 'AVIF', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.12)', icon: 'Image', description: 'Imagen AVIF' },
  gif:  { label: 'GIF',  color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.12)', icon: 'Image', description: 'Imagen GIF' },
  tiff: { label: 'TIFF', color: '#14B8A6', bgColor: 'rgba(20, 184, 166, 0.12)', icon: 'Image', description: 'Imagen TIFF' },
  svg:  { label: 'SVG',  color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.12)', icon: 'Image', description: 'Imagen vectorial SVG' },
  heic: { label: 'HEIC', color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.12)', icon: 'Image', description: 'Imagen HEIC (Apple)' },
  xlsx: { label: 'XLSX', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)', icon: 'Table', description: 'Hoja de cálculo Excel' },
  xls:  { label: 'XLS',  color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)', icon: 'Table', description: 'Hoja de cálculo (legacy)' },
  csv:  { label: 'CSV',  color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)', icon: 'Table', description: 'Valores separados por comas' },
  ods:  { label: 'ODS',  color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)', icon: 'Table', description: 'Hoja LibreOffice' },
  json: { label: 'JSON', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.12)', icon: 'Braces', description: 'Datos JSON' },
  xml:  { label: 'XML',  color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.12)', icon: 'Code', description: 'Datos XML' },
  yaml: { label: 'YAML', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.12)', icon: 'FileText', description: 'Datos YAML' },
  pptx: { label: 'PPTX', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.12)', icon: 'Presentation', description: 'Presentación PowerPoint' },
  ppt:  { label: 'PPT',  color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.12)', icon: 'Presentation', description: 'Presentación (legacy)' },
};

export function getAvailableFormats(sourceType: string): FormatOption[] {
  const ext = sourceType.toLowerCase().replace('.', '');
  const targets = CONVERSION_MAP[ext] || [];
  return targets.map(t => {
    const info = FORMAT_INFO[t];
    return {
      value: t,
      label: info?.label || t.toUpperCase(),
      icon: info?.icon || 'FileText',
      description: info?.description || `Formato ${t.toUpperCase()}`,
      color: info?.color || '#C9D1D9',
      bgColor: info?.bgColor || 'rgba(201, 209, 217, 0.12)',
    };
  });
}
