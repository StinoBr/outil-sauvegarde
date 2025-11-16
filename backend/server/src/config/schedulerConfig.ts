export const schedulerConfig = {
  enabled: process.env.SCHEDULER_ENABLED !== 'false',
  timezone: process.env.SCHEDULER_TIMEZONE || 'Europe/Paris',
};
