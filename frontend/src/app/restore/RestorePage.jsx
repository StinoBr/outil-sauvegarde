import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import useSystemStore from '../../store/useSystemStore';

export default function RestorePage() {
  const { databases, triggerRestore, fetchDatabases } = useSystemStore((state) => ({
    databases: state.databases,
    triggerRestore: state.triggerRestore,
    fetchDatabases: state.fetchDatabases,
  }));
  const [file, setFile] = useState(null);
  const [database, setDatabase] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!databases.length) {
      fetchDatabases();
    }
  }, [databases.length, fetchDatabases]);

  const handleFile = (event) => {
    const nextFile = event.target.files?.[0];
    setFile(nextFile);
    if (nextFile) {
      setDatabase(nextFile.name.includes('prod') ? databases[0]?.name : databases[1]?.name);
    }
  };

  const handleRestore = async () => {
    if (!file || !database) return;
    const response = await triggerRestore({ filename: file.name, database });
    setFeedback(`Restauration démarrée (${response.jobId}) vers ${database}`);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card title="Importer une sauvegarde" description="Choisissez votre fichier .tar.gz">
        <div className="space-y-4">
          <input type="file" onChange={handleFile} />
          <select value={database} onChange={(event) => setDatabase(event.target.value)}>
            <option value="">Sélectionner une base</option>
            {databases.map((db) => (
              <option key={db.id} value={db.name}>
                {db.name}
              </option>
            ))}
          </select>
          <Button disabled={!file || !database} onClick={() => setConfirmOpen(true)}>
            Restore Now
          </Button>
          {feedback && <p className="text-sm text-success">{feedback}</p>}
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmer la restauration"
        description="L'opération va écraser les données existantes"
        actions={
          <Button variant="primary" onClick={handleRestore}>
            Confirmer
          </Button>
        }
      >
        <p className="text-sm">
          Fichier <strong>{file?.name}</strong> → Base <strong>{database}</strong>
        </p>
      </Modal>
    </div>
  );
}
