import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createJob } from '@/lib/jobStore';
import { detectFileType, MAX_FILE_SIZE } from '@/lib/fileDetector';
import { getAvailableFormats, getAvailableFormatsMultiFile, isImageFormat } from '@/types/conversion';
import { checkConversionLimit } from '@/lib/conversionLimits';
import { getUser, getProfile } from '@/lib/supabase/server';
import { uploadFile } from '@/lib/supabase/storage';

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
    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const allFiles = rawFiles.length > 0 ? rawFiles : singleFile ? [singleFile] : [];

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    for (const file of allFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `El archivo ${file.name} excede el límite de 50MB` },
          { status: 413 }
        );
      }
    }

    const jobId = nanoid(12);
    const userId = user?.id || 'anonymous';

    // Process each file
    const filesInfo: { name: string; type: string; size: number; inputPath: string }[] = [];
    let totalSize = 0;

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const detectedType = await detectFileType(buffer, file.name);
      const ext = detectedType !== 'unknown' ? detectedType : file.name.split('.').pop()?.toLowerCase() || 'unknown';
      const storagePath = `${userId}/${jobId}/${i}.${ext}`;

      await uploadFile(storagePath, buffer, file.type || 'application/octet-stream');

      filesInfo.push({ name: file.name, type: ext, size: file.size, inputPath: storagePath });
      totalSize += file.size;
    }

    const primaryFile = filesInfo[0];
    const isMultiFile = filesInfo.length > 1;

    // Build summary
    const summaryName = isMultiFile
      ? `${filesInfo.length} archivos (${filesInfo.map(f => f.type.toUpperCase()).join(', ')})`
      : primaryFile.name;

    // Create job with files array
    await createJob(jobId, {
      originalName: summaryName,
      originalType: primaryFile.type,
      originalSize: totalSize,
      targetFormat: '',
      inputPath: primaryFile.inputPath,
      files: filesInfo,
    });

    // Determine available formats
    let availableFormats = isMultiFile
      ? getAvailableFormatsMultiFile(filesInfo.map(f => f.type))
      : getAvailableFormats(primaryFile.type);

    // For now restrict to PDF/ZIP for multi-file images; other combos unsupported
    if (isMultiFile && !availableFormats.length) {
      return NextResponse.json(
        { error: 'No se pueden combinar estos tipos de archivo en una sola conversión' },
        { status: 400 }
      );
    }

    const isDocx = !isMultiFile && primaryFile.type === 'docx';

    return NextResponse.json({
      jobId,
      fileName: summaryName,
      fileType: primaryFile.type,
      fileSizeMB: parseFloat((totalSize / (1024 * 1024)).toFixed(2)),
      files: filesInfo.map(f => ({
        name: f.name,
        type: f.type,
        fileSizeMB: parseFloat((f.size / (1024 * 1024)).toFixed(2)),
      })),
      isMultiFile,
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
