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

    if (!jobId || !targetFormat) {
      return NextResponse.json(
        { error: 'Se requiere jobId y targetFormat' },
        { status: 400 }
      );
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job no encontrado' },
        { status: 404 }
      );
    }

    // Get user session for tracking
    const user = await getUser();

    // Update job status
    updateJob(jobId, {
      targetFormat,
      status: 'processing',
      progress: 10,
    });

    // Run conversion asynchronously
    (async () => {
      try {
        console.log('Starting conversion for job:', jobId);
        console.log('Storage input path:', job.inputPath);
        console.log('Source format:', job.originalType);
        console.log('Target format:', targetFormat);
        console.log('User ID:', user?.id);

        const tempDir = path.join(os.tmpdir(), 'formi', jobId);
        await fs.mkdir(tempDir, { recursive: true });

        const localInputPath = path.join(tempDir, path.basename(job.inputPath));
        console.log('Downloading from Storage:', job.inputPath, 'to:', localInputPath);
        await downloadFileToLocal(job.inputPath, localInputPath);
        console.log('Downloaded input successfully');
        
        updateJob(jobId, { progress: 30 });

        const outputPath = await runConversion(
          localInputPath,
          tempDir,
          job.originalType,
          targetFormat,
          options
        );

        console.log('Conversion completed. Local output path:', outputPath);
        updateJob(jobId, { progress: 80 });

        const userId = user?.id || 'anonymous';
        const outputStoragePath = `${userId}/${jobId}/output.${targetFormat}`;
        await uploadLocalFile(outputPath, outputStoragePath);
        console.log('Uploaded output to:', outputStoragePath);

        // Small delay to simulate optimization step
        await new Promise(r => setTimeout(r, 500));

        updateJob(jobId, {
          status: 'done',
          progress: 100,
          outputPath: outputStoragePath,
        });
        console.log('Job marked as done:', jobId);

        // Record conversion for tracking
        await recordConversion(
          user?.id || null,
          jobId,
          job.originalType,
          job.originalSize || 0
        );
      } catch (error) {
        console.error('Conversion error for job:', jobId, error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        updateJob(jobId, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    })();

    return NextResponse.json({
      jobId,
      status: 'processing',
    });
  } catch (error) {
    console.error('Convert error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar la conversión' },
      { status: 500 }
    );
  }
}
