import { appConfig, type CloudProvider } from './appConfig';

export type StorageTarget = 'local' | CloudProvider;

export type StorageRequest = {
  localPath: string;
  provider?: CloudProvider;
  remoteKey?: string;
};

export const storageConfig = {
  supportedCompressors: ['gzip', 'zip', 'tar.gz'] as const,
  supportedBackupTypes: ['full', 'incremental', 'differential'] as const,
  defaultProvider: 'local' as StorageTarget,
  appConfig,
};
