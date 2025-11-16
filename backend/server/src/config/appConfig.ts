import { join } from 'node:path';

export type CloudProvider = 's3' | 'gcp' | 'azure';

export const appConfig = {
  environment: process.env.NODE_ENV || 'development',
  backupRoot: process.env.BACKUP_ROOT || join(process.cwd(), 'backups'),
  defaultCompression: (process.env.DEFAULT_COMPRESSION || 'gzip') as 'gzip' | 'zip' | 'tar.gz' | 'none',
  encryptionSecret: process.env.ENCRYPTION_SECRET || 'votre-super-secret-de-32-caracteres',
  // Cloud providers credentials
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_BUCKET,
  },
  gcp: {
    bucket: process.env.GCP_BUCKET,
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    container: process.env.AZURE_STORAGE_CONTAINER,
  },
};
