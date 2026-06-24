import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';
import { getMimeType } from '@/lib/fileDetector';
import { downloadFile } from '@/lib/supabase/storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = await getJob(jobId);

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
    const buffer = await downloadFile(job.outputPath);
    const ext = job.targetFormat;
    const mimeType = getMimeType(ext);

    // Build output filename
    const baseName = job.originalName.split('.').slice(0, -1).join('.') || job.originalName;
    const outputFilename = `${baseName}.${job.targetFormat}`;

    return new NextResponse(new Uint8Array(buffer), {
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
