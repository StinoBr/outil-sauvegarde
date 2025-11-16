import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useSystemStore from '../../store/useSystemStore';

const TYPES = [
  { label: 'Full', value: 'full', description: 'Copie complète de la base' },
  { label: 'Incremental', value: 'incremental', description: 'Seuls les deltas récents' },
  { label: 'Differential', value: 'differential', description: 'Delta vs dernier full' },
];

export default function BackupPage() {
  const { databases, selectedDatabase, selectDatabase, triggerBackup, fetchDatabases, loading } = useSystemStore((state) => ({
    databases: state.databases,
    selectedDatabase: state.selectedDatabase,
    selectDatabase: state.selectDatabase,
    triggerBackup: state.triggerBackup,
    fetchDatabases: state.fetchDatabases,
    loading: state.loading,
  }));
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (!databases.length) {
      fetchDatabases();
    }
  }, [databases.length, fetchDatabases]);

  const handleBackup = async (type) => {
    const response = await triggerBackup(type);
    setStatusMessage(`Backup ${type} déclenché (${response.jobId})`);
  };

  return (
    <div className="space-y-6">
      <Card title="Choix de la base" description="Sélectionnez la base cible">
        <div className="grid md:grid-cols-2 gap-4">
          {databases.map((database) => (
            <button
              key={database.id}
              className={`border rounded-lg p-4 text-left transition-base ${
                selectedDatabase?.id === database.id ? 'shadow-soft bg-muted' : ''
              }`}
              onClick={() => selectDatabase(database.id)}
            >
              <p className="text-lg font-semibold">{database.name}</p>
              <p className="text-sm text-muted-foreground">{database.engine} • {database.env}</p>
              <p className="text-xs text-muted-foreground mt-2">{database.sizeGb} GB • {database.status}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Type de sauvegarde" description="Orchestrez des backups multi-stratégies">
        <div className="grid md:grid-cols-3 gap-4">
          {TYPES.map((type) => (
            <div key={type.value} className="border rounded-lg p-4 flex flex-col gap-3">
              <div>
                <p className="text-xl font-semibold">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              <Button onClick={() => handleBackup(type.value)} disabled={loading}>
                Lancer
              </Button>
            </div>
          ))}
        </div>
        {statusMessage && <p className="text-sm text-success mt-4">{statusMessage}</p>}
      </Card>
    </div>
  );
}
