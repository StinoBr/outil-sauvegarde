import type { SGBDCible } from '@prisma/client';
import { decrypt } from '../utils/crypto';
import type { BackupVariant, CommandDescriptor, DatabaseStrategy } from './types';

export abstract class BaseStrategy implements DatabaseStrategy {
  abstract buildBackupCommand(target: SGBDCible, variant: BackupVariant): Promise<CommandDescriptor>;
  abstract buildRestoreCommand(target: SGBDCible): Promise<CommandDescriptor>;

  protected credentials(target: SGBDCible): { username: string; password: string } {
    return {
      username: target.nomUtilisateur,
      password: decrypt(target.motDePasse),
    };
  }
}
