import { basename } from 'node:path';
import { spawn } from 'node:child_process';
import { logger } from './logger';

export type CloudUploadResult = {
  provider: 's3' | 'gcp' | 'azure';
  location: string;
};

function runCli(command: string, args: string[], env: NodeJS.ProcessEnv = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: { ...process.env, ...env }, stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} s'est terminé avec le code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

export async function uploadToS3(filePath: string, key?: string) {
  const bucket = process.env.AWS_BUCKET;
  if (!bucket) {
    throw new Error('Variable AWS_BUCKET manquante.');
  }
  const targetKey = key || basename(filePath);
  await runCli('aws', ['s3', 'cp', filePath, `s3://${bucket}/${targetKey}`]);
  return { provider: 's3' as const, location: `s3://${bucket}/${targetKey}` };
}

export async function uploadToGcp(filePath: string, key?: string) {
  const bucket = process.env.GCP_BUCKET;
  if (!bucket) {
    throw new Error('Variable GCP_BUCKET manquante.');
  }
  const targetKey = key || basename(filePath);
  await runCli('gsutil', ['cp', filePath, `gs://${bucket}/${targetKey}`]);
  return { provider: 'gcp' as const, location: `gs://${bucket}/${targetKey}` };
}

export async function uploadToAzure(filePath: string, key?: string) {
  const container = process.env.AZURE_STORAGE_CONTAINER;
  const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!container || !connection) {
    throw new Error('Variables Azure STORAGE manquantes.');
  }
  const targetKey = key || basename(filePath);
  await runCli('az', ['storage', 'blob', 'upload', '--container-name', container, '--file', filePath, '--name', targetKey, '--overwrite'], {
    AZURE_STORAGE_CONNECTION_STRING: connection,
  });
  return { provider: 'azure' as const, location: `azure://${container}/${targetKey}` };
}

export async function saveLocalCopy(sourcePath: string, destinationDir: string): Promise<string> {
  logger.debug({ sourcePath, destinationDir }, 'saveLocalCopy appelé (noop)');
  return `${destinationDir}/${basename(sourcePath)}`;
}
