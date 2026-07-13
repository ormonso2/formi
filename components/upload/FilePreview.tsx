'use client';

import { PdfIcon, DocIcon, ImageIcon, SpreadsheetIcon, CodeIcon, JsonIcon, PresentationIcon, FileIcon } from '@/components/icons/FileIcons';

interface UploadedFileInfo {
  name: string;
  type: string;
  fileSizeMB: number;
}

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  fileSizeMB: number;
  files?: UploadedFileInfo[];
}

type IconComponent = React.ComponentType<{ size?: number; color?: string; className?: string }>;

const typeColorMap: Record<string, string> = {
  pdf: '#EF4444',
  docx: '#3B82F6',
  doc: '#3B82F6',
  txt: '#C9D1D9',
  md: '#C9D1D9',
  html: '#F97316',
  jpg: '#22C55E',
  jpeg: '#22C55E',
  png: '#8B5CF6',
  webp: '#19D3E6',
  avif: '#EC4899',
  gif: '#F59E0B',
  tiff: '#14B8A6',
  svg: '#F97316',
  heic: '#6366F1',
  xlsx: '#22C55E',
  xls: '#22C55E',
  csv: '#22C55E',
  ods: '#22C55E',
  json: '#F59E0B',
  xml: '#F97316',
  yaml: '#EC4899',
  pptx: '#F97316',
  ppt: '#F97316',
};

function getIconForType(type: string): IconComponent {
  const lowerType = type.toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'svg', 'heic', 'bmp'];
  const spreadsheetTypes = ['xlsx', 'xls', 'csv', 'ods'];
  const docTypes = ['docx', 'doc', 'odt', 'rtf'];
  const codeTypes = ['html', 'htm', 'xml'];
  const dataTypes = ['json', 'yaml', 'yml'];
  const presentationTypes = ['pptx', 'ppt', 'odp'];

  if (lowerType === 'pdf') return PdfIcon;
  if (docTypes.includes(lowerType)) return DocIcon;
  if (imageTypes.includes(lowerType)) return ImageIcon;
  if (spreadsheetTypes.includes(lowerType)) return SpreadsheetIcon;
  if (codeTypes.includes(lowerType)) return CodeIcon;
  if (dataTypes.includes(lowerType)) return JsonIcon;
  if (presentationTypes.includes(lowerType)) return PresentationIcon;
  return FileIcon;
}

export function FilePreview({ fileName, fileType, fileSizeMB, files }: FilePreviewProps) {
  const Icon = getIconForType(fileType);
  const color = typeColorMap[fileType] || '#C9D1D9';
  const isMultiFile = files && files.length > 1;

  return (
    <div className="p-4 rounded-2xl glass">
      <div className="flex items-center gap-4">
        {/* File icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={28} color={color} />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {isMultiFile ? `${files.length} archivos` : fileName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="format-badge"
              style={{
                color,
                borderColor: `${color}30`,
                background: `${color}12`,
              }}
            >
              {isMultiFile ? 'MULTI' : fileType.toUpperCase()}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {fileSizeMB} MB total
            </span>
          </div>
        </div>
      </div>

      {isMultiFile && (
        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="truncate flex-1 pr-2">{f.name}</span>
              <span className="whitespace-nowrap">{f.fileSizeMB} MB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { getIconForType, typeColorMap };
