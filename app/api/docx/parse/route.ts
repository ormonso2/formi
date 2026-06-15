import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 });
    }

    if (job.originalType !== 'docx') {
      return NextResponse.json({ error: 'Solo archivos DOCX pueden ser editados' }, { status: 400 });
    }

    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ path: job.inputPath });

    // Extract simple metadata
    const text = result.value.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      html: result.value,
      metadata: {
        title: job.originalName.replace('.docx', ''),
        wordCount,
        pageCount: Math.max(1, Math.ceil(wordCount / 300)),
      },
    });
  } catch (error) {
    console.error('DOCX parse error:', error);
    return NextResponse.json({ error: 'Error al parsear el documento' }, { status: 500 });
  }
}
