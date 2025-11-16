import createStore from './createStore';
import { BackupService, DatabaseService, LogsService, RestoreService, SettingsService, StatusService } from '../services/apiClient';
import { mockSchedule, mockStorageSettings } from '../services/mockData';

const useSystemStore = createStore((set, get) => ({
  status: null,
  logs: [],
  logsMeta: { total: 0, page: 1, pageSize: 10 },
  databases: [],
  selectedDatabase: null,
  storageSettings: mockStorageSettings,
  schedule: mockSchedule,
  lastOperation: null,
  loading: false,
  fetchStatus: async () => {
    const status = await StatusService.fetch();
    set({ status });
  },
  fetchLogs: async (filters = {}) => {
    const response = await LogsService.fetch(filters);
    let items = response.items;
    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((item) => item.status === filters.status);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      items = items.filter((item) => item.database.toLowerCase().includes(query) || item.jobId.toLowerCase().includes(query));
    }
    set({ logs: items, logsMeta: response.meta });
  },
  fetchDatabases: async () => {
    const databases = await DatabaseService.fetch();
    set({ databases, selectedDatabase: databases[0] });
  },
  triggerBackup: async (type) => {
    set({ loading: true });
    const payload = { type, database: get().selectedDatabase?.name };
    const response = await BackupService.trigger(payload);
    set({
      loading: false,
      lastOperation: { kind: 'backup', type, at: new Date().toISOString(), target: payload.database },
    });
    await get().fetchLogs();
    await get().fetchStatus();
    return response;
  },
  triggerRestore: async ({ filename, database }) => {
    set({ loading: true });
    const response = await RestoreService.trigger({ filename, database });
    set({
      loading: false,
      lastOperation: { kind: 'restore', at: new Date().toISOString(), target: database },
    });
    return response;
  },
  updateStorageSettings: async (payload) => {
    set({ loading: true });
    const storageSettings = await SettingsService.saveStorage(payload);
    set({ loading: false, storageSettings });
  },
  updateSchedule: async (payload) => {
    set({ loading: true });
    const schedule = await SettingsService.saveSchedule(payload);
    set({ loading: false, schedule });
  },
  selectDatabase: (databaseId) => {
    const database = get().databases.find((db) => db.id === databaseId) || null;
    set({ selectedDatabase: database });
  },
}));

export default useSystemStore;
