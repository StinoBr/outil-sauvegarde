import { useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import useSystemStore from '../../store/useSystemStore';

export default function DatabasesPage() {
  const { databases, selectedDatabase, fetchDatabases, selectDatabase } = useSystemStore((state) => ({
    databases: state.databases,
    selectedDatabase: state.selectedDatabase,
    fetchDatabases: state.fetchDatabases,
    selectDatabase: state.selectDatabase,
  }));

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  return (
    <Card title="Bases" description="Inventaire multi-SGBD">
      <div className="grid md:grid-cols-2 gap-4">
        {databases.map((database) => (
          <div key={database.id} className="border rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{database.name}</p>
                <p className="text-xs text-muted-foreground">{database.engine}</p>
              </div>
              <span className={`badge ${database.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                {database.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{database.env}</p>
            <p className="text-xs text-muted-foreground">{database.sizeGb} GB</p>
            <Button variant={selectedDatabase?.id === database.id ? 'primary' : 'outline'} onClick={() => selectDatabase(database.id)}>
              {selectedDatabase?.id === database.id ? 'Sélectionnée' : 'Utiliser pour backup'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
