import { triggerBackup } from '~/server/src/api/backupController';

export default defineEventHandler(async (event) => {
  return triggerBackup(event);
});
