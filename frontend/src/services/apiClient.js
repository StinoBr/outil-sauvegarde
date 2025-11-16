import { mockDatabases, mockLogs, mockSchedule, mockStatus, mockStorageSettings } from './mockData';
import { wait } from '../lib/utils';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 12000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

const withMock = async (promise, fallback) => {
  try {
    return await promise;
  } catch (error) {
    console.warn('[api] fallback to mock data for', fallback.name || 'anonymous', error.message);
    return fallback();
  }
};

export const StatusService = {
  fetch: () =>
    withMock(
      request('/status'),
      () => ({ ...mockStatus, lastSyncAt: new Date().toISOString() })
    ),
};

export const LogsService = {
  fetch: (params = {}) =>
    withMock(
      (() => {
        const query = new URLSearchParams(params).toString();
        const url = query ? `/logs?${query}` : '/logs';
        return request(url);
      })(),
      () => ({
        items: mockLogs,
        meta: { total: mockLogs.length, page: 1, pageSize: mockLogs.length },
      })
    ),
};

export const DatabaseService = {
  fetch: () => withMock(request('/databases'), () => mockDatabases),
};

export const BackupService = {
  trigger: (payload) =>
    withMock(
      request('/backup', { method: 'POST', body: payload }),
      async () => {
        await wait(800);
        return { jobId: `backup-${Date.now()}`, status: 'QUEUED', type: payload.type };
      }
    ),
};

export const RestoreService = {
  trigger: (payload) =>
    withMock(
      request('/restore', { method: 'POST', body: payload }),
      async () => {
        await wait(1000);
        return { jobId: `restore-${Date.now()}`, status: 'RUNNING' };
      }
    ),
};

export const SettingsService = {
  saveStorage: (payload) =>
    withMock(
      request('/settings/storage', { method: 'POST', body: payload }),
      async () => {
        await wait(600);
        return { ...mockStorageSettings, ...payload };
      }
    ),
  saveSchedule: (payload) =>
    withMock(
      request('/settings/schedule', { method: 'POST', body: payload }),
      async () => {
        await wait(600);
        return { ...mockSchedule, ...payload };
      }
    ),
};
