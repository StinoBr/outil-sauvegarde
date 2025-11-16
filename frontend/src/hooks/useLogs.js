import { useEffect, useState } from 'react';
import useSystemStore from '../store/useSystemStore';

const DEFAULT_FILTERS = {
  status: 'ALL',
  search: '',
  page: 1,
  pageSize: 8,
};

export default function useLogs() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { logs, logsMeta, fetchLogs } = useSystemStore((state) => ({
    logs: state.logs,
    logsMeta: state.logsMeta,
    fetchLogs: state.fetchLogs,
  }));

  useEffect(() => {
    fetchLogs(filters);
  }, [fetchLogs, filters]);

  return { logs, logsMeta, filters, setFilters };
}
