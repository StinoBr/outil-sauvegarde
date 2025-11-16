import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './app/dashboard/DashboardPage';
import BackupPage from './app/backup/BackupPage';
import RestorePage from './app/restore/RestorePage';
import LogsPage from './app/logs/LogsPage';
import SettingsPage from './app/settings/SettingsPage';
import DatabasesPage from './app/databases/DatabasesPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/restore" element={<RestorePage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/databases" element={<DatabasesPage />} />
      </Routes>
    </Layout>
  );
}
