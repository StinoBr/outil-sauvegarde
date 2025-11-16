import type { H3Event } from 'h3';
import { BackupService, type BackupOptions } from '../services/BackupService';
import { RestoreService, type RestoreOptions } from '../services/RestoreService';

const backupService = new BackupService();
const restoreService = new RestoreService();

export async function triggerBackup(event: H3Event) {
  const body = await readBody<{ planId: number; options?: BackupOptions }>(event);
  if (!body.planId) {
    throw createError({ statusCode: 400, statusMessage: 'planId manquant' });
  }
  backupService.executeBackup(body.planId, body.options).catch((error) => {
    console.error('Backup async error', error);
  });
  return { success: true, message: `Sauvegarde lancée pour le plan ${body.planId}` };
}

export async function triggerRestore(event: H3Event) {
  const body = await readBody<{ journalId: number; options?: RestoreOptions }>(event);
  if (!body.journalId) {
    throw createError({ statusCode: 400, statusMessage: 'journalId manquant' });
  }
  restoreService.executeRestore(body.journalId, body.options).catch((error) => {
    console.error('Restore async error', error);
  });
  return { success: true, message: `Restauration lancée pour le journal ${body.journalId}` };
}
