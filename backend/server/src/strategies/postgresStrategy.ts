import type { SGBDCible } from '@prisma/client';
import { BaseStrategy } from './baseStrategy';
import type { BackupVariant, CommandDescriptor } from './types';

async function findBinary(): Promise<string> {
  const binary = process.env.PGDUMP_PATH;
  if (binary) {
    return binary;
  }
  return 'pg_dump';
}

async function findRestoreBinary(): Promise<string> {
  return process.env.PGRESTORE_PATH || 'pg_restore';
}

export class PostgresStrategy extends BaseStrategy {
  async buildBackupCommand(target: SGBDCible, variant: BackupVariant): Promise<CommandDescriptor> {
    const creds = this.credentials(target);
    const connString = `postgresql://${creds.username}:${encodeURIComponent(creds.password)}@${target.adresseIp}:${target.port}/${target.nomBaseDeDonnees}`;
    const args = ['-F', 'c', '-d', connString];

    if (variant === 'incremental') {
      args.push('--section=pre-data');
    }
    if (variant === 'differential') {
      args.push('--section=pre-data', '--section=data');
    }

    return {
      command: await findBinary(),
      args,
      env: { PGPASSWORD: creds.password },
    };
  }

  async buildRestoreCommand(target: SGBDCible): Promise<CommandDescriptor> {
    const creds = this.credentials(target);
    const connString = `postgresql://${creds.username}:${encodeURIComponent(creds.password)}@${target.adresseIp}:${target.port}/${target.nomBaseDeDonnees}`;
    return {
      command: await findRestoreBinary(),
      args: ['--clean', '--if-exists', '-d', connString],
      env: { PGPASSWORD: creds.password },
    };
  }
}
