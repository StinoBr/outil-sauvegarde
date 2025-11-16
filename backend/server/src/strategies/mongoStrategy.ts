import type { SGBDCible } from '@prisma/client';
import { BaseStrategy } from './baseStrategy';
import type { BackupVariant, CommandDescriptor } from './types';

export class MongoStrategy extends BaseStrategy {
  async buildBackupCommand(target: SGBDCible, variant: BackupVariant): Promise<CommandDescriptor> {
    const creds = this.credentials(target);
    const args = [
      `--uri=mongodb://${creds.username}:${encodeURIComponent(creds.password)}@${target.adresseIp}:${target.port}/${target.nomBaseDeDonnees}`,
      '--archive',
      '--gzip',
    ];

    if (variant !== 'full') {
      args.push('--oplog');
    }

    return {
      command: 'mongodump',
      args,
    };
  }

  async buildRestoreCommand(target: SGBDCible): Promise<CommandDescriptor> {
    const creds = this.credentials(target);
    const uri = `mongodb://${creds.username}:${encodeURIComponent(creds.password)}@${target.adresseIp}:${target.port}/${target.nomBaseDeDonnees}`;
    return {
      command: 'mongorestore',
      args: [`--uri=${uri}`, '--archive', '--gzip', '--drop'],
    };
  }
}
