import Card from '../../components/Card';
import Button from '../../components/Button';
import useStorageForm from '../../hooks/useStorageForm';
import useScheduleForm from '../../hooks/useScheduleForm';

export default function SettingsPage() {
  const { form: storageForm, handleChange: handleStorageChange, handleSubmit: submitStorage } = useStorageForm();
  const { form: scheduleForm, handleChange: handleScheduleChange, handleSubmit: submitSchedule } = useScheduleForm();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Stockage" description="Local ou Cloud" actions={<Button onClick={submitStorage}>Enregistrer</Button>}>
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <label>Provider</label>
          <select name="provider" value={storageForm.provider} onChange={handleStorageChange}>
            <option value="local">Local</option>
            <option value="aws">AWS S3</option>
            <option value="gcp">Google Cloud</option>
            <option value="azure">Azure Blob</option>
          </select>
          {storageForm.provider !== 'local' && (
            <>
              <label>Bucket / Container</label>
              <input name="bucket" value={storageForm.bucket} onChange={handleStorageChange} />
              <label>Region</label>
              <input name="region" value={storageForm.region} onChange={handleStorageChange} />
            </>
          )}
          <label>Path</label>
          <input name="path" value={storageForm.path} onChange={handleStorageChange} />
          <label>Rétention (jours)</label>
          <input name="retentionDays" type="number" value={storageForm.retentionDays} onChange={handleStorageChange} />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="encryption" checked={storageForm.encryption} onChange={handleStorageChange} />
            Encryption côté serveur
          </label>
        </form>
      </Card>

      <Card title="Planification" description="Cron & Notifications" actions={<Button onClick={submitSchedule}>Mettre à jour</Button>}>
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <label>Cron</label>
          <input name="cron" value={scheduleForm.cron} onChange={handleScheduleChange} />
          <label>Fuseau horaire</label>
          <input name="timezone" value={scheduleForm.timezone} onChange={handleScheduleChange} />
          <label>Notifications</label>
          <input
            name="notifications"
            value={scheduleForm.notifications.join(', ')}
            onChange={(event) =>
              handleScheduleChange({
                target: { name: 'notifications', value: event.target.value.split(',').map((item) => item.trim()) },
              })
            }
          />
        </form>
      </Card>
    </div>
  );
}
