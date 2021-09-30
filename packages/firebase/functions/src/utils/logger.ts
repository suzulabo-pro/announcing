import { logger as fnLogger } from 'firebase-functions';

export const logger = {
  debug: (message: string, v?: Record<string, any>) => {
    fnLogger.write({ severity: 'DEBUG', message, ...v });
  },
  info: (message: string, v?: Record<string, any>) => {
    fnLogger.write({ severity: 'INFO', message, ...v });
  },
  warn: (message: string, v?: Record<string, any>) => {
    fnLogger.write({ severity: 'WARNING', message, ...v });
  },
  error: (message: string, v?: Record<string, any>) => {
    fnLogger.write({ severity: 'ERROR', message, ...v });
  },
  critical: (message: string, v?: Record<string, any>) => {
    fnLogger.write({ severity: 'CRITICAL', message, ...v });
  },
};
