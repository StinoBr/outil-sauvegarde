const now = new Date();

export const mockStatus = {
  overallHealth: 'healthy',
  runningJobs: 1,
  throughput: '128 MB/s',
  uptime: '47h 13m',
  lastBackupAt: new Date(now.getTime() - 1000 * 60 * 42).toISOString(),
  storageUsed: 62,
  alerts: [
    { id: 'alert-1', type: 'info', message: 'Full backup completed successfully', createdAt: new Date(now - 1000 * 60 * 60).toISOString() },
    { id: 'alert-2', type: 'warning', message: 'Incremental job slightly delayed due to IO throttling', createdAt: new Date(now - 1000 * 60 * 130).toISOString() },
  ],
};

export const mockLogs = Array.from({ length: 32 }).map((_, idx) => ({
  id: `log-${idx + 1}`,
  jobId: `JOB-${2200 + idx}`,
  type: idx % 3 === 0 ? 'full' : idx % 3 === 1 ? 'incremental' : 'differential',
  database: idx % 2 === 0 ? 'customers' : 'payments',
  status: idx % 4 === 0 ? 'ERROR' : 'SUCCESS',
  duration: `${14 + idx}m`,
  size: `${(45 + idx * 1.6).toFixed(1)} GB`,
  createdAt: new Date(now - idx * 3600 * 1000).toISOString(),
}));

export const mockDatabases = [
  { id: 'db-1', name: 'customers', engine: 'PostgreSQL', sizeGb: 320, status: 'online', env: 'Production' },
  { id: 'db-2', name: 'payments', engine: 'MySQL', sizeGb: 210, status: 'online', env: 'Production' },
  { id: 'db-3', name: 'analytics', engine: 'BigQuery', sizeGb: 780, status: 'online', env: 'Analytics' },
  { id: 'db-4', name: 'warehouse', engine: 'Snowflake', sizeGb: 1420, status: 'maintenance', env: 'BI' },
];

export const mockStorageSettings = {
  provider: 'aws',
  bucket: 'backup-vault-prod',
  region: 'eu-west-3',
  path: 'databases/prod',
  retentionDays: 30,
  encryption: true,
};

export const mockSchedule = {
  cron: '0 2 * * *',
  timezone: 'Europe/Paris',
  notifications: ['ops@company.com'],
};
