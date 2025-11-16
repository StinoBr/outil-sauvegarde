import type { SGBDCible } from '@prisma/client';
import { BaseStrategy } from './baseStrategy';
import type { BackupVariant, CommandDescriptor } from './types';

export class MysqlStrategy extends BaseStrategy {
  async buildBackupCommand(target: SGBDCible, variant: BackupVariant): Promise<CommandDescriptor> {
    const creds = this.credentials(target);
    const args = [
      '-h', target.adresseIp,
      '-P', target.port.toString(),
      '-u', creds.username,
      '--single-transaction',
      '--routines',
      '--events',
      target.nomBaseDeDonnees,
    ];

    if (variant !== 'full') {
      args.push('--master-data=2');
    }

    return {
      command: 'mysqldump',
      args,
      env: { MYSQL_PWD: creds.password },
    };
  }

  async buildRestoreCommand(target: SGBDCible): Promise<CommandDescriptor> {
    const creds = this.credentials(target);
    return {
      command: 'mysql',
      args: [
        '-h', target.adresseIp,
        '-P', target.port.toString(),
        '-u', creds.username,
        target.nomBaseDeDonnees,
      ],
      env: { MYSQL_PWD: creds.password },
    };
  }
}
