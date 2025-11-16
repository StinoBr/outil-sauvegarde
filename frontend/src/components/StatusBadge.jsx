import { cn } from '../lib/utils';

const STATUS_COLORS = {
  SUCCESS: 'badge badge-success',
  ERROR: 'badge badge-danger',
  WARNING: 'badge badge-warning',
  INFO: 'badge badge-info',
};

export default function StatusBadge({ status }) {
  const label = status?.toUpperCase();
  return <span className={cn(STATUS_COLORS[label] || 'badge badge-info')}>{label}</span>;
}
