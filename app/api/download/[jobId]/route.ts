import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';
import { getMimeType } from '@/lib/fileDetector';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: 'Job no encontrado' },
      { status: 404 }
    );
  }

  if (job.status !== 'done' || !job.outputPath) {
    return NextResponse.json(
      { error: 'El archivo aún no está listo' },
      { status: 400 }
    );
  }

  try {
    const buffer = await fs.readFile(job.outputPath);
    const ext = path.extname(job.outputPath).replace('.', '') || job.targetFormat;
    const mimeType = getMimeType(ext);

    // Build output filename
    const baseName = path.parse(job.originalName).name;
    const outputFilename = `${baseName}.${job.targetFormat}`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Error al descargar el archivo' },
      { status: 500 }
    );
  }
}
