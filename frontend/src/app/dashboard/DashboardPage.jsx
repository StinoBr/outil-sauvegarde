import { useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import useSystemStore from '../../store/useSystemStore';
import useRealtimeStatus from '../../hooks/useRealtimeStatus';
import { formatDateTime } from '../../lib/utils';

const quickActions = [
  { label: 'Full Backup', type: 'full' },
  { label: 'Incremental', type: 'incremental' },
  { label: 'Differential', type: 'differential' },
];

export default function DashboardPage() {
  const { status, logs, databases, triggerBackup, fetchLogs, fetchDatabases } = useSystemStore((state) => ({
    status: state.status,
    logs: state.logs,
    databases: state.databases,
    triggerBackup: state.triggerBackup,
    fetchLogs: state.fetchLogs,
    fetchDatabases: state.fetchDatabases,
  }));

  useRealtimeStatus();

  useEffect(() => {
    fetchLogs({ pageSize: 5 });
    fetchDatabases();
  }, [fetchLogs, fetchDatabases]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Santé globale" description="Synthèse des jobs actifs">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{status?.overallHealth ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{status?.runningJobs || 0} jobs en file</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {status?.lastBackupAt && `Dernier backup ${formatDateTime(status.lastBackupAt)}`}
            </div>
          </div>
        </Card>
        <Card title="Throughput" description="Débit moyen">
          <p className="text-3xl font-bold">{status?.throughput ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Storage utilisé {status?.storageUsed}%</p>
        </Card>
        <Card title="Alertes" description="Dernières notifications">
          <div className="space-y-3 max-h-44 overflow-auto">
            {status?.alerts?.map((alert) => (
              <div key={alert.id} className="border border-dashed border-muted rounded-md p-3">
                <p className="text-sm font-semibold">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(alert.createdAt)}</p>
              </div>
            )) || <p className="text-sm text-muted-foreground">Aucune alerte</p>}
          </div>
        </Card>
      </section>

      <Card
        title="Actions rapides"
        description="Choisissez le type de sauvegarde à déclencher sur la base sélectionnée"
        actions={<span className="text-xs text-muted-foreground">Base active: {databases[0]?.name || '—'}</span>}
      >
        <div className="flex flex-wrap gap-4">
          {quickActions.map((action) => (
            <Button key={action.type} onClick={() => triggerBackup(action.type)}>
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Top bases" description="Surveillance des capacités">
          <div className="space-y-3">
            {databases.slice(0, 3).map((database) => (
              <div key={database.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{database.name}</p>
                  <p className="text-xs text-muted-foreground">{database.engine} • {database.env}</p>
                </div>
                <span className="text-sm text-muted-foreground">{database.sizeGb} GB</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Logs récents" description="5 derniers événements">
          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{log.database}</p>
                  <p className="text-xs text-muted-foreground">{log.type} • {formatDateTime(log.createdAt)}</p>
                </div>
                <span className={log.status === 'SUCCESS' ? 'badge badge-success' : 'badge badge-danger'}>{log.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
