import { NextRequest, NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/jobStore';
import { runConversion } from '@/lib/converters';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { recordConversion } from '@/lib/conversionLimits';
import { getUser } from '@/lib/supabase/server';
import { downloadFileToLocal, uploadLocalFile } from '@/lib/supabase/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, targetFormat, options } = body;

    console.log('[convert] START jobId:', jobId, 'targetFormat:', targetFormat);

    if (!jobId || !targetFormat) {
      return NextResponse.json({ error: 'Se requiere jobId y targetFormat' }, { status: 400 });
    }

    console.log('[convert] STEP 1: getJob');
    const job = await getJob(jobId);
    if (!job) {
      console.error('[convert] Job not found:', jobId);
      return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 });
    }
    console.log('[convert] STEP 1 OK - inputPath:', job.inputPath, 'type:', job.originalType);

    // Get user session for tracking (non-blocking)
    let user = null;
    try { user = await getUser(); } catch (_) {}
    console.log('[convert] STEP 2: user:', (user as any)?.id || 'anonymous');

    console.log('[convert] STEP 3: updateJob processing');
    await updateJob(jobId, { targetFormat, status: 'processing', progress: 10 });

    try {
      const tempDir = path.join(os.tmpdir(), 'formi', jobId);
      await fs.mkdir(tempDir, { recursive: true });
      console.log('[convert] STEP 4: tempDir created:', tempDir);

      const localInputPath = path.join(tempDir, `input.${job.originalType}`);
      console.log('[convert] STEP 5: downloading from storage:', job.inputPath);
      await downloadFileToLocal(job.inputPath, localInputPath);
      console.log('[convert] STEP 5 OK: downloaded to', localInputPath);

      console.log('[convert] STEP 6: running conversion', job.originalType, '->', targetFormat);
      const outputPath = await runConversion(localInputPath, tempDir, job.originalType, targetFormat, options);
      console.log('[convert] STEP 6 OK: outputPath:', outputPath);

      const userId = (user as any)?.id || 'anonymous';
      const outputStoragePath = `${userId}/${jobId}/output.${targetFormat}`;
      console.log('[convert] STEP 7: uploading to storage:', outputStoragePath);
      await Promise.all([
        uploadLocalFile(outputPath, outputStoragePath),
        updateJob(jobId, { status: 'done', progress: 100, outputPath: outputStoragePath }),
      ]);
      console.log('[convert] STEP 7 OK: done');

      recordConversion((user as any)?.id || null, jobId, job.originalType, job.originalSize || 0).catch(console.error);

    } catch (convError) {
      console.error('[convert] CONV ERROR at job:', jobId, convError);
      await updateJob(jobId, {
        status: 'error',
        error: convError instanceof Error ? convError.message : 'Error desconocido',
      });
      return NextResponse.json(
        { error: convError instanceof Error ? convError.message : 'Error en la conversión' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobId, status: 'done' });
  } catch (error) {
    console.error('[convert] OUTER ERROR:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al iniciar la conversión' },
      { status: 500 }
    );
  }
}
