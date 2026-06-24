import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const BUCKET_NAME = 'conversions';

export function getAdminStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  ).storage;
}

export async function uploadFile(
  path: string,
  file: Buffer | File,
  contentType?: string
): Promise<string> {
  const storage = getAdminStorageClient();

  let body: Buffer | File;
  if (file instanceof Buffer) {
    body = file;
  } else {
    body = file;
  }

  const { data, error } = await storage.from(BUCKET_NAME).upload(path, body, {
    contentType: contentType || 'application/octet-stream',
    upsert: true,
  });

  if (error) {
    throw new Error(`Storage upload error: ${error.message}`);
  }

  return data.path;
}

export async function downloadFile(path: string): Promise<Buffer> {
  const storage = getAdminStorageClient();
  const { data, error } = await storage.from(BUCKET_NAME).download(path);

  if (error || !data) {
    throw new Error(`Storage download error: ${error?.message || 'No data'}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function downloadFileToLocal(path: string, localPath: string): Promise<void> {
  try {
    console.log('Storage: downloading', path, 'to', localPath);
    const buffer = await downloadFile(path);
    await fs.writeFile(localPath, buffer);
    console.log('Storage: download complete, size:', buffer.length);
  } catch (error) {
    console.error('Storage: downloadFileToLocal failed for path:', path, error);
    throw error;
  }
}

export async function uploadLocalFile(
  localPath: string,
  storagePath: string,
  contentType?: string
): Promise<string> {
  const buffer = await fs.readFile(localPath);
  return uploadFile(storagePath, buffer, contentType);
}

export function getPublicUrl(path: string): string {
  const storage = getAdminStorageClient();
  const { data } = storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
