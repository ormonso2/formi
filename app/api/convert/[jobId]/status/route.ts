import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

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

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    error: job.error ?? undefined,
    originalName: job.originalName,
    originalType: job.originalType,
    targetFormat: job.targetFormat,
    isMultiFile: (job.files?.length ?? 0) > 1,
    fileCount: job.files?.length ?? 1,
    files: job.files?.map(f => ({ name: f.name, type: f.type })) ?? undefined,
  });
}
