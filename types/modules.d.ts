declare module 'html-docx-js' {
  interface HtmlDocxJs {
    asBlob(html: string, options?: Record<string, unknown>): Blob;
  }
  const htmlDocx: HtmlDocxJs;
  export default htmlDocx;
}

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: Record<string, unknown>): Promise<PDFData>;
  export = pdfParse;
}

declare module 'heic-convert' {
  interface HeicConvertOptions {
    buffer: ArrayBuffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }
  function heicConvert(options: HeicConvertOptions): Promise<ArrayBuffer>;
  export default heicConvert;
}

