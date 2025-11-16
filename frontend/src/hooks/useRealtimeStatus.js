import { useEffect } from 'react';
import useSystemStore from '../store/useSystemStore';

const POLLING_INTERVAL = 15000;

export default function useRealtimeStatus() {
  const fetchStatus = useSystemStore((state) => state.fetchStatus);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);
}
