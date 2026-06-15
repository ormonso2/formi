import { ConversionJob, ConversionStatus } from '@/types/conversion';

const jobs = new Map<string, ConversionJob>();

export function createJob(id: string, data: Omit<ConversionJob, 'id' | 'status' | 'progress' | 'createdAt' | 'expiresAt'>): ConversionJob {
  const job: ConversionJob = {
    id,
    ...data,
    status: 'idle',
    progress: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
  };
  jobs.set(id, job);

  // Auto-cleanup after 1 hour
  setTimeout(() => {
    jobs.delete(id);
  }, 3600000);

  return job;
}

export function getJob(id: string): ConversionJob | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, updates: Partial<ConversionJob>): ConversionJob | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  const updated = { ...job, ...updates };
  jobs.set(id, updated);
  return updated;
}

export function updateJobStatus(id: string, status: ConversionStatus, progress?: number): void {
  const job = jobs.get(id);
  if (job) {
    job.status = status;
    if (progress !== undefined) job.progress = progress;
    jobs.set(id, job);
  }
}

export function deleteJob(id: string): boolean {
  return jobs.delete(id);
}

export function getAllJobs(): ConversionJob[] {
  return Array.from(jobs.values());
}
