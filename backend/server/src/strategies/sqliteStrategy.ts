import type { SGBDCible } from '@prisma/client';
import { BaseStrategy } from './baseStrategy';
import type { BackupVariant, CommandDescriptor } from './types';

export class SqliteStrategy extends BaseStrategy {
  async buildBackupCommand(target: SGBDCible, _variant: BackupVariant): Promise<CommandDescriptor> {
    return {
      command: 'sqlite3',
      args: [target.nomBaseDeDonnees, '.dump'],
    };
  }

  async buildRestoreCommand(target: SGBDCible): Promise<CommandDescriptor> {
    return {
      command: 'sqlite3',
      args: [target.nomBaseDeDonnees],
    };
  }
}
