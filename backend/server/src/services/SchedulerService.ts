import type { PlanSauvegarde } from '@prisma/client';
import { db } from '../utils/db';
import { scheduleJob, stopJob } from '../utils/scheduler';
import { BackupService } from './BackupService';
import { logger } from '../utils/logger';

export class SchedulerService {
  private backupService = new BackupService();

  async bootstrap(): Promise<void> {
    const plans = await db.planSauvegarde.findMany({ where: { actif: true } });
    await Promise.all(plans.map((plan) => this.schedule(plan)));
  }

  async schedule(plan: PlanSauvegarde): Promise<void> {
    if (!plan.actif) {
      stopJob(plan.id);
      return;
    }
    scheduleJob(plan.id, plan.frequenceCron, async () => {
      await this.backupService.executeBackup(plan.id);
    });
    logger.info({ planId: plan.id }, 'Plan ajouté au scheduler');
  }
}
