export const cn = (...classes) =>
  classes
    .flat()
    .filter(Boolean)
    .join(' ');

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

export const wait = (duration = 1200) => new Promise((resolve) => setTimeout(resolve, duration));
