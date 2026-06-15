import { NextRequest, NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/jobStore';
import { runConversion } from '@/lib/converters';
import path from 'path';

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
        console.log('Input path:', job.inputPath);
        console.log('Source format:', job.originalType);
        console.log('Target format:', targetFormat);
        
        updateJob(jobId, { progress: 30 });

        const outputDir = path.dirname(job.inputPath);
        console.log('Output dir:', outputDir);
        
        const outputPath = await runConversion(
          job.inputPath,
          outputDir,
          job.originalType,
          targetFormat,
          options
        );

        console.log('Conversion completed. Output path:', outputPath);
        updateJob(jobId, { progress: 80 });

        // Small delay to simulate optimization step
        await new Promise(r => setTimeout(r, 500));

        updateJob(jobId, {
          status: 'done',
          progress: 100,
          outputPath,
        });
        console.log('Job marked as done:', jobId);
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
