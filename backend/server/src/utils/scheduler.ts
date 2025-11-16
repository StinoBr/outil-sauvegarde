import cron, { ScheduledTask } from 'node-cron';
import { schedulerConfig } from '../config/schedulerConfig';
import { logger } from './logger';

type JobHandler = () => Promise<void> | void;

const jobs = new Map<number, ScheduledTask>();

export function scheduleJob(planId: number, expression: string, handler: JobHandler): void {
  if (!schedulerConfig.enabled) {
    logger.warn({ planId }, 'Scheduler désactivé, job ignoré');
    return;
  }

  if (jobs.has(planId)) {
    jobs.get(planId)?.stop();
    jobs.delete(planId);
  }

  const task = cron.schedule(expression, () => {
    logger.info({ planId }, 'Déclenchement planifié');
    Promise.resolve(handler()).catch((error) => {
      logger.error({ planId, error }, 'Erreur pendant le cron job');
    });
  }, {
    timezone: schedulerConfig.timezone,
  });

  jobs.set(planId, task);
}

export function stopJob(planId: number): void {
  const task = jobs.get(planId);
  if (task) {
    task.stop();
    jobs.delete(planId);
  }
}

export function stopAllJobs(): void {
  jobs.forEach((task) => task.stop());
  jobs.clear();
}
