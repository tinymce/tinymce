import { Arr } from "@ephox/katamari";

export type NextFn<T> = (value: T, logs: AgarLogs) => void;
export type DieFn = (err: any, logs: AgarLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: AgarLogs) => void;

export enum AgarLogEntryState { Original, Started, Finished }

export interface AgarLogEntry {
  message: string;
  entries: AgarLogEntry[ ];
  state: AgarLogEntryState,
  trace: any;
}

export interface AgarLogs {
  history: AgarLogEntry[ ]
};

const DISABLE_LOGGING = false;

// Pop level needs to change the parent. This would be so much easier with zippers.
const modifyStartedEntryTo = (entries: AgarLogEntry[], f): AgarLogEntry[] => {
  return Arr.last(entries).fold(
    () => entries,
    (lastEntry) => {
      // If the last entry has started, and has entries,
      if (lastEntry.state === AgarLogEntryState.Started) {
        return Arr.last(lastEntry.entries).fold(
          () => {
            // We have no entries, so just modify us
            return entries.slice(0, entries.length - 1).concat([ f(lastEntry) ]);
          },
          // Great name!
          (lastEntryLastEntry) => {
            if (lastEntryLastEntry.state == AgarLogEntryState.Started) {
              // Need to keep going.
              return entries.slice(0, entries.length - 1).concat([ {
                message: lastEntry.message,
                state: lastEntry.state,
                trace: lastEntry.trace,
                entries: modifyStartedEntryTo(lastEntry.entries, f)
              } ]);
            } else {
              // We have no further nesteing, so just modify us
              return entries.slice(0, entries.length - 1).concat([ f(lastEntry) ]);
            }
          }
        );
      } else {
        return entries.slice(0, entries.length - 1).concat([ f(lastEntry) ]);
      }
    }
  )
};


const modifyStartedEntry = (logs: AgarLogs, f): AgarLogs => {
  return {
    history: modifyStartedEntryTo(logs.history, f)
  };
}

const modifyLastEntryTo = (entries: AgarLogEntry[], f): AgarLogEntry[] => {
  // DUPE :(
  return Arr.last(entries).fold(
    () => entries,
    (lastEntry) => {
      if (lastEntry.state === AgarLogEntryState.Started) {
        return entries.slice(0, entries.length - 1).concat([{
          message: lastEntry.message,
          state: lastEntry.state,
          entries: modifyLastEntryTo(lastEntry.entries, f),
          trace: lastEntry.trace
        }]);
      } else {
        return entries.slice(0, entries.length - 1).concat([ f(lastEntry) ]);
      }
    }
  );
}

const modifyLastEntry = (logs: AgarLogs, f): AgarLogs => {
  return {
    history: modifyLastEntryTo(logs.history, f)
  };
}

// Determine if we are inside a subentry
const addLogEntryTo = (entries: AgarLogEntry[], newEntry: AgarLogEntry): AgarLogEntry[] => {
  if (entries.length === 0) {
    return [ newEntry ];
  } else {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry.state === AgarLogEntryState.Started) {
      const before = entries.slice(0, entries.length - 1);
      const newLastEntries = addLogEntryTo(lastEntry.entries, newEntry);
      return before.concat([{
        message: lastEntry.message,
        entries: newLastEntries,
        state: lastEntry.state,
        trace: lastEntry.trace
      }]);
    } else {
      return entries.concat([ newEntry ]);
    }
  }
};

// TODO: Make a Cons List for efficiency
export const addLogEntry = (logs: AgarLogs, message: string): AgarLogs => {
  if (DISABLE_LOGGING) return logs;
  const newEntry = {
    message,
    trace: null,
    state: AgarLogEntryState.Original,
    entries: [ ]
  };

  return {
    history: addLogEntryTo(logs.history, newEntry)
  };
}

export const pushLogLevel = (logs: AgarLogs): AgarLogs => {
  if (DISABLE_LOGGING) return logs;
  return modifyLastEntry(logs, (entry) => {
    return {
      message: entry.message,
      entries: entry.entries,
      state: AgarLogEntryState.Started,
      trace: entry.trace
    };
  })
};

export const popLogLevel = (logs: AgarLogs): AgarLogs => {
  if (DISABLE_LOGGING) return logs;
  return modifyStartedEntry(logs, (entry) => {
    return {
      message: entry.message,
      entries: entry.entries,
      state: AgarLogEntryState.Finished,
      trace: entry.trace
    };
  })
};

export const addStackTrace = (logs: AgarLogs, err): AgarLogs => {
  if (DISABLE_LOGGING) return logs;
  return modifyLastEntry(logs, (entry) => {
    return {
      message: entry.message,
      trace: err.stack,
      state: entry.state,
      entries: entry.entries
    };
  });
}

const initLogsWith = (history: AgarLogEntry[]) => {
  return {
    history: history
  };
}

export const AgarLogs = {
  getOrInit: (logs: AgarLogs): AgarLogs => logs !== undefined ? logs : initLogsWith([ ]),
  init: (): AgarLogs => initLogsWith([ ])
}

export const Pipe = function <T, U>(f: RunFn<T, U>): RunFn<T, U> {
  return function (value: T, next: NextFn<U>, die: DieFn, logs: AgarLogs) {
    try {
      f(value, next, die, logs);
    } catch (err) {
      const logsWithTrace = addStackTrace(logs, err);
      die(err, logsWithTrace);
    }
  };
};