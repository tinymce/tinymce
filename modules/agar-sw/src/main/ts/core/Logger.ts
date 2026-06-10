import type { LogLevel } from './Shared';

let logLevel: LogLevel = 'debug';
const logPrefix = '[AGAR-SW]:';

export const setLevel = (level: LogLevel): void => {
  logLevel = level;
};

export const debug = (...args: any[]): void => {
  if (logLevel === 'debug') {
    // eslint-disable-next-line no-console
    console.log(logPrefix, ...args);
  }
};

export const error = (...args: any[]): void => {
  // eslint-disable-next-line no-console
  console.error(logPrefix, ...args);
};
