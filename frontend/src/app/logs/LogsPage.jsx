import Card from '../../components/Card';
import Table from '../../components/Table';
import useLogs from '../../hooks/useLogs';

const columns = [
  { header: 'Job', accessor: 'jobId' },
  { header: 'Type', accessor: 'type' },
  { header: 'Base', accessor: 'database' },
  { header: 'Durée', accessor: 'duration' },
  { header: 'Taille', accessor: 'size' },
  { header: 'Status', accessor: 'status' },
  { header: 'Date', accessor: 'createdAt' },
];

export default function LogsPage() {
  const { logs, filters, setFilters } = useLogs();

  return (
    <Card title="Journaux" description="Filtrer vos opérations">
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          placeholder="Recherche"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
        <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
          <option value="ALL">Tous</option>
          <option value="SUCCESS">Succès</option>
          <option value="ERROR">Erreurs</option>
        </select>
      </div>
      <Table rows={logs} columns={columns} />
    </Card>
  );
}
