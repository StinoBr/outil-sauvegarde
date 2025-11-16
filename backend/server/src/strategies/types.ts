import type { SGBDCible } from '@prisma/client';

export type BackupVariant = 'full' | 'incremental' | 'differential';

export type CommandDescriptor = {
  command: string;
  args: string[];
  env?: NodeJS.ProcessEnv;
};

export interface DatabaseStrategy {
  buildBackupCommand(target: SGBDCible, variant: BackupVariant): Promise<CommandDescriptor>;
  buildRestoreCommand(target: SGBDCible): Promise<CommandDescriptor>;
}
