import { SchedulerService } from '../src/services/SchedulerService';
import { logger } from '../src/utils/logger';

export default defineNitroPlugin(async () => {
  const scheduler = new SchedulerService();
  try {
    await scheduler.bootstrap();
    logger.info('Scheduler initialisé');
  } catch (error) {
    logger.error({ error }, 'Impossible de démarrer le scheduler');
  }
});
