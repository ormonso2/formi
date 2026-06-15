import path from 'path';
import fs from 'fs/promises';

export async function convertData(
  inputPath: string,
  outputDir: string,
  sourceFormat: string,
  targetFormat: string
): Promise<string> {
  const outputPath = path.join(outputDir, `output.${targetFormat}`);
  const content = await fs.readFile(inputPath, 'utf-8');

  switch (`${sourceFormat}->${targetFormat}`) {
    case 'json->csv': {
      const data = JSON.parse(content);
      const csv = jsonToCsv(Array.isArray(data) ? data : [data]);
      await fs.writeFile(outputPath, csv, 'utf-8');
      break;
    }

    case 'json->xml': {
      const data = JSON.parse(content);
      const xml = jsonToXml(data);
      await fs.writeFile(outputPath, xml, 'utf-8');
      break;
    }

    case 'json->yaml': {
      const data = JSON.parse(content);
      const yaml = jsonToYaml(data);
      await fs.writeFile(outputPath, yaml, 'utf-8');
      break;
    }

    case 'json->txt': {
      const data = JSON.parse(content);
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
      break;
    }

    case 'json->html': {
      const data = JSON.parse(content);
      const html = jsonToHtml(data);
      await fs.writeFile(outputPath, html, 'utf-8');
      break;
    }

    case 'xml->json': {
      const json = simpleXmlToJson(content);
      await fs.writeFile(outputPath, JSON.stringify(json, null, 2), 'utf-8');
      break;
    }

    case 'xml->csv': {
      const json = simpleXmlToJson(content);
      const records = Array.isArray(json) ? json : [json];
      const csv = jsonToCsv(records as Record<string, unknown>[]);
      await fs.writeFile(outputPath, csv, 'utf-8');
      break;
    }

    case 'csv->json': {
      const json = csvToJson(content);
      await fs.writeFile(outputPath, JSON.stringify(json, null, 2), 'utf-8');
      break;
    }

    case 'csv->xml': {
      const json = csvToJson(content);
      const xml = jsonToXml(json);
      await fs.writeFile(outputPath, xml, 'utf-8');
      break;
    }

    case 'yaml->json': {
      // Simple YAML to JSON (basic key: value parsing)
      const json = simpleYamlToJson(content);
      await fs.writeFile(outputPath, JSON.stringify(json, null, 2), 'utf-8');
      break;
    }

    case 'yaml->csv': {
      const json = simpleYamlToJson(content);
      const records = Array.isArray(json) ? json : [json];
      const csv = jsonToCsv(records as Record<string, unknown>[]);
      await fs.writeFile(outputPath, csv, 'utf-8');
      break;
    }

    case 'yaml->xml': {
      const json = simpleYamlToJson(content);
      const xml = jsonToXml(json);
      await fs.writeFile(outputPath, xml, 'utf-8');
      break;
    }

    case 'xml->yaml': {
      const json = simpleXmlToJson(content);
      const yaml = jsonToYaml(json);
      await fs.writeFile(outputPath, yaml, 'utf-8');
      break;
    }

    default:
      throw new Error(`Conversión de datos no soportada: ${sourceFormat} → ${targetFormat}`);
  }

  return outputPath;
}

export function isDataFormat(ext: string): boolean {
  return ['json', 'xml', 'yaml', 'yml'].includes(ext.toLowerCase());
}

function jsonToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(h => {
      const val = String(item[h] ?? '');
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function jsonToXml(data: unknown, rootTag = 'root', itemTag = 'item', indent = ''): string {
  if (Array.isArray(data)) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n`;
    for (const item of data) {
      xml += `  <${itemTag}>\n`;
      if (typeof item === 'object' && item !== null) {
        for (const [key, value] of Object.entries(item)) {
          const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
          xml += `    <${safeKey}>${escapeXml(String(value))}</${safeKey}>\n`;
        }
      } else {
        xml += `    ${escapeXml(String(item))}\n`;
      }
      xml += `  </${itemTag}>\n`;
    }
    xml += `</${rootTag}>`;
    return xml;
  }

  if (typeof data === 'object' && data !== null) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n`;
    for (const [key, value] of Object.entries(data)) {
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      if (typeof value === 'object' && value !== null) {
        xml += `  <${safeKey}>${JSON.stringify(value)}</${safeKey}>\n`;
      } else {
        xml += `  <${safeKey}>${escapeXml(String(value))}</${safeKey}>\n`;
      }
    }
    xml += `</${rootTag}>`;
    return xml;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>${escapeXml(String(data))}</${rootTag}>`;
}

function jsonToHtml(data: unknown): string {
  const jsonStr = JSON.stringify(data, null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
      const cls = /:$/.test(match) ? 'key' : 'string';
      return `<span class="${cls}">${match}</span>`;
    })
    .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
    .replace(/\b(null)\b/g, '<span class="null">$1</span>')
    .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="number">$1</span>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>JSON Data</title>
  <style>
    body{font-family:monospace;background:#1e1e1e;color:#d4d4d4;margin:0;padding:20px}
    pre{background:#252526;border:1px solid #3c3c3c;border-radius:6px;padding:20px;overflow-x:auto;font-size:14px;line-height:1.5}
    .key{color:#9cdcfe}.string{color:#ce9178}.number{color:#b5cea8}.boolean{color:#569cd6}.null{color:#569cd6}
  </style>
</head>
<body><pre>${jsonStr}</pre></body>
</html>`;
}

function jsonToYaml(data: unknown, indent = ''): string {
  if (data === null || data === undefined) return 'null\n';

  if (typeof data !== 'object') return `${data}\n`;

  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const entries = Object.entries(item);
        const first = entries[0];
        const rest = entries.slice(1);
        let result = `${indent}- ${first[0]}: ${formatYamlValue(first[1])}\n`;
        for (const [key, value] of rest) {
          result += `${indent}  ${key}: ${formatYamlValue(value)}\n`;
        }
        return result;
      }
      return `${indent}- ${item}\n`;
    }).join('');
  }

  return Object.entries(data).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `${indent}${key}:\n${jsonToYaml(value, indent + '  ')}`;
    }
    return `${indent}${key}: ${formatYamlValue(value)}\n`;
  }).join('');
}

function formatYamlValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    if (value.includes(':') || value.includes('#') || value.includes('\n')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  return String(value);
}

function csvToJson(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || '').trim();
    });
    return obj;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function simpleXmlToJson(xml: string): unknown {
  // Very basic XML parser for simple structures
  const content = xml.replace(/<\?xml[^?]*\?>/g, '').trim();
  const rootMatch = content.match(/^<(\w+)>([\s\S]*)<\/\1>$/);
  if (!rootMatch) return { raw: content };

  const inner = rootMatch[2].trim();

  // Check if it contains repeated child elements
  const childPattern = /<(\w+)>([\s\S]*?)<\/\1>/g;
  const matches = [...inner.matchAll(childPattern)];

  if (matches.length === 0) return { value: inner };

  // Check if all children have the same tag name (array-like)
  const tagNames = new Set(matches.map(m => m[1]));

  if (tagNames.size === 1) {
    // Array of items
    return matches.map(m => {
      const itemInner = m[2].trim();
      const itemMatches = [...itemInner.matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g)];
      if (itemMatches.length === 0) return itemInner;
      const obj: Record<string, string> = {};
      for (const im of itemMatches) {
        obj[im[1]] = im[2];
      }
      return obj;
    });
  }

  // Object
  const obj: Record<string, string> = {};
  for (const m of matches) {
    obj[m[1]] = m[2];
  }
  return obj;
}

function simpleYamlToJson(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let value: unknown = trimmed.substring(colonIndex + 1).trim();

    // Try to parse value types
    if (value === 'null' || value === '~') value = null;
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (!isNaN(Number(value)) && value !== '') value = Number(value);
    else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
