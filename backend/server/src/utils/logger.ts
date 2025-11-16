export const logger = {
  info: (meta: any, message?: string) => {
    if (typeof meta === 'string') {
      console.log(`[INFO] ${meta}`);
    } else {
      console.log('[INFO]', meta, message || '');
    }
  },
  warn: (meta: any, message?: string) => {
    if (typeof meta === 'string') {
      console.warn(`[WARN] ${meta}`);
    } else {
      console.warn('[WARN]', meta, message || '');
    }
  },
  error: (meta: any, message?: string) => {
    if (typeof meta === 'string') {
      console.error(`[ERROR] ${meta}`);
    } else {
      console.error('[ERROR]', meta, message || '');
    }
  },
  debug: (meta: any, message?: string) => {
    if (process.env.NODE_ENV === 'development') {
      if (typeof meta === 'string') {
        console.debug(`[DEBUG] ${meta}`);
      } else {
        console.debug('[DEBUG]', meta, message || '');
      }
    }
  },
};
