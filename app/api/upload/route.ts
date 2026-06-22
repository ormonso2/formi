import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import { createJob } from '@/lib/jobStore';
import { detectFileType, MAX_FILE_SIZE } from '@/lib/fileDetector';
import { getAvailableFormats } from '@/types/conversion';
import { checkConversionLimit } from '@/lib/conversionLimits';
import { getUser, getProfile } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const profile = await getProfile();
    const limitStatus = await checkConversionLimit(
      user?.id || null,
      profile?.plan || 'free'
    );

    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          error: 'Has alcanzado el límite de conversiones mensuales',
          limit: limitStatus.limit,
          used: limitStatus.used,
          plan: limitStatus.plan,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el límite de 50MB' },
        { status: 413 }
      );
    }

    const jobId = nanoid(12);
    const jobDir = path.join('/tmp', 'formi', jobId);
    await fs.mkdir(jobDir, { recursive: true });

    // Read file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect real file type
    const detectedType = await detectFileType(buffer, file.name);
    const ext = detectedType !== 'unknown' ? detectedType : file.name.split('.').pop()?.toLowerCase() || 'unknown';

    // Save file
    const inputPath = path.join(jobDir, `input.${ext}`);
    await fs.writeFile(inputPath, buffer);

    // Create job
    createJob(jobId, {
      originalName: file.name,
      originalType: ext,
      originalSize: file.size,
      targetFormat: '',
      inputPath,
    });

    // Get available formats
    const availableFormats = getAvailableFormats(ext);
    const isDocx = ext === 'docx';

    return NextResponse.json({
      jobId,
      fileName: file.name,
      fileType: ext,
      fileSizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      availableFormats,
      isDocx,
      remainingConversions: limitStatus.remaining,
      plan: limitStatus.plan,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}
