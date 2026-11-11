import type { RollupLog } from 'rollup';

const message = (log: RollupLog) => {
  if (log.loc) {
    const loc = log.loc;
    const locText = `file: ${loc.file} line ${loc.line}:${loc.column}`;
    const frame = log.frame ? `\n${log.frame}\n\n` : '';
    return `${log.message} ${locText} ${frame}`;
  } else {
    return log.message;
  }
};

const fail = (log: RollupLog): never => {
  throw new Error(message(log));
};

const warn = (log: RollupLog) => {
  // eslint-disable-next-line no-console
  console.warn(log.code, message(log));
};

export const onwarn = (log: RollupLog): void | never => {
  if (log.code === 'EMPTY_EXPORT') {
    return;
  } else if (log.code === 'UNRESOLVED_IMPORT') {
    fail(log);
  } else if (log.code === 'CIRCULAR_DEPENDENCY') {
    fail(log);
  } else if (log.code === 'THIS_IS_UNDEFINED') {
    fail(log);
  } else if (log.code === 'MISSING_EXPORT') {
    fail(log);
  }

  warn(log);
};
