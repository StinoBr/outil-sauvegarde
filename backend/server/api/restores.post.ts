import { triggerRestore } from '~/server/src/api/backupController';

export default defineEventHandler(async (event) => {
  return triggerRestore(event);
});
