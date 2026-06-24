import { ConversionJob, ConversionStatus } from '@/types/conversion';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function rowToJob(row: any): ConversionJob {
  return {
    id: row.id,
    originalName: row.original_name,
    originalType: row.original_type,
    originalSize: row.original_size,
    targetFormat: row.target_format,
    status: row.status as ConversionStatus,
    progress: row.progress,
    inputPath: row.input_path,
    outputPath: row.output_path ?? undefined,
    error: row.error ?? undefined,
    createdAt: new Date(row.created_at),
    expiresAt: new Date(row.expires_at),
  };
}

export function createJob(id: string, data: Omit<ConversionJob, 'id' | 'status' | 'progress' | 'createdAt' | 'expiresAt'>): ConversionJob {
  const job: ConversionJob = {
    id,
    ...data,
    status: 'idle',
    progress: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  };

  // Fire-and-forget insert to Supabase
  getAdminClient().from('jobs').insert({
    id: job.id,
    original_name: job.originalName,
    original_type: job.originalType,
    original_size: job.originalSize,
    target_format: job.targetFormat,
    status: job.status,
    progress: job.progress,
    input_path: job.inputPath,
    output_path: job.outputPath ?? null,
    error: job.error ?? null,
    expires_at: job.expiresAt.toISOString(),
  }).then(({ error }) => {
    if (error) console.error('jobStore: insert error', error);
  });

  return job;
}

export async function getJob(id: string): Promise<ConversionJob | undefined> {
  const { data, error } = await getAdminClient()
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return rowToJob(data);
}

export async function updateJob(id: string, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined> {
  const patch: Record<string, any> = {};
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.progress !== undefined) patch.progress = updates.progress;
  if (updates.targetFormat !== undefined) patch.target_format = updates.targetFormat;
  if (updates.outputPath !== undefined) patch.output_path = updates.outputPath;
  if (updates.error !== undefined) patch.error = updates.error;

  const { data, error } = await getAdminClient()
    .from('jobs')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return undefined;
  return rowToJob(data);
}

export async function updateJobStatus(id: string, status: ConversionStatus, progress?: number): Promise<void> {
  await updateJob(id, { status, ...(progress !== undefined ? { progress } : {}) });
}

export async function deleteJob(id: string): Promise<boolean> {
  const { error } = await getAdminClient().from('jobs').delete().eq('id', id);
  return !error;
}

export async function getAllJobs(): Promise<ConversionJob[]> {
  const { data, error } = await getAdminClient().from('jobs').select('*');
  if (error || !data) return [];
  return data.map(rowToJob);
}
