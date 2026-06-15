import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createJob } from '@/lib/jobStore';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, originalJobId, filename } = body;

    if (!html) {
      return NextResponse.json({ error: 'Se requiere contenido HTML' }, { status: 400 });
    }

    const savedJobId = nanoid(12);
    const jobDir = path.join('/tmp', 'formi', savedJobId);
    await fs.mkdir(jobDir, { recursive: true });

    // Convert HTML to DOCX using html-docx-js
    const htmlDocx = (await import('html-docx-js')).default;
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename || 'Document'}</title></head><body>${html}</body></html>`;
    const docxBlob = htmlDocx.asBlob(fullHtml);
    const arrayBuffer = await docxBlob.arrayBuffer();

    const outputPath = path.join(jobDir, `output.docx`);
    await fs.writeFile(outputPath, Buffer.from(arrayBuffer));

    createJob(savedJobId, {
      originalName: filename || 'edited-document.docx',
      originalType: 'html',
      originalSize: arrayBuffer.byteLength,
      targetFormat: 'docx',
      inputPath: outputPath,
    });

    // Mark as done immediately since we already have the output
    const { updateJob } = await import('@/lib/jobStore');
    updateJob(savedJobId, {
      status: 'done',
      progress: 100,
      outputPath,
    });

    return NextResponse.json({ savedJobId });
  } catch (error) {
    console.error('DOCX save error:', error);
    return NextResponse.json({ error: 'Error al guardar el documento' }, { status: 500 });
  }
}
