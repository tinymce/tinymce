import { Arr } from '@ephox/katamari';

export enum TestLogEntryState { Original, Started, Finished }

export interface TestLogEntry {
  message: string;
  entries: TestLogEntry[ ];
  state: TestLogEntryState;
  trace: any;
}

export interface TestLogs {
  history: TestLogEntry[ ];
}

const DISABLE_LOGGING = false;

// Pop level needs to change the parent. This would be so much easier with zippers.
const modifyStartedEntryTo = (entries: TestLogEntry[], f): TestLogEntry[] => Arr.last(entries).fold(
  () => entries,
  (lastEntry) => {
    // If the last entry has started, and has entries,
    if (lastEntry.state === TestLogEntryState.Started) {
      return Arr.last(lastEntry.entries).fold(
        // We have no entries, so just modify us
        () => entries.slice(0, entries.length - 1).concat([ f(lastEntry) ]),
        // Great name!
        (lastEntryLastEntry) => {
          if (lastEntryLastEntry.state === TestLogEntryState.Started) {
            // Need to keep going.
            return entries.slice(0, entries.length - 1).concat([{
              message: lastEntry.message,
              state: lastEntry.state,
              trace: lastEntry.trace,
              entries: modifyStartedEntryTo(lastEntry.entries, f)
            }]);
          } else {
            // We have no further nesting, so just modify us
            return entries.slice(0, entries.length - 1).concat([ f(lastEntry) ]);
          }
        }
      );
    } else {
      return entries.slice(0, entries.length - 1).concat([ f(lastEntry) ]);
    }
  }
);

const modifyStartedEntry = (logs: TestLogs, f): TestLogs => ({
  history: modifyStartedEntryTo(logs.history, f)
});

const modifyLastEntryTo = (entries: TestLogEntry[], f): TestLogEntry[] =>
  // Consider consolidating with modifyStartedEntryTo
  Arr.last(entries).fold(
    () => [
      f({
        message: 'Unknown',
        state: TestLogEntryState.Original,
        entries: [ ],
        trace: null
      })
    ],
    (lastEntry) => {
      if (lastEntry.state === TestLogEntryState.Started) {
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

const modifyLastEntry = (logs: TestLogs, f): TestLogs => ({
  history: modifyLastEntryTo(logs.history, f)
});

// Determine if we are inside a subentry
const addLogEntryTo = (entries: TestLogEntry[], newEntry: TestLogEntry): TestLogEntry[] => {
  if (entries.length === 0) {
    return [ newEntry ];
  } else {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry.state === TestLogEntryState.Started) {
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
export const addLogEntry = (logs: TestLogs, message: string): TestLogs => {
  if (DISABLE_LOGGING) {
    return logs;
  }
  const newEntry = {
    message,
    trace: null,
    state: TestLogEntryState.Original,
    entries: [ ]
  };

  return {
    history: addLogEntryTo(logs.history, newEntry)
  };
};

export const pushLogLevel = (logs: TestLogs): TestLogs => {
  if (DISABLE_LOGGING) {
    return logs;
  }
  return modifyLastEntry(logs, (entry) => ({
    message: entry.message,
    entries: entry.entries,
    state: TestLogEntryState.Started,
    trace: entry.trace
  }));
};

export const popLogLevel = (logs: TestLogs): TestLogs => {
  if (DISABLE_LOGGING) {
    return logs;
  }
  return modifyStartedEntry(logs, (entry) => ({
    message: entry.message,
    entries: entry.entries,
    state: TestLogEntryState.Finished,
    trace: entry.trace
  }));
};

export const addStackTrace = (logs: TestLogs, err: { stack: any }): TestLogs => {
  if (DISABLE_LOGGING) {
    return logs;
  }
  return modifyLastEntry(logs, (entry) => ({
    message: entry.message,
    trace: err.stack,
    state: entry.state,
    entries: entry.entries
  }));
};

const init = (): TestLogs => initLogsWith([ ]);

const initLogsWith = (history: TestLogEntry[]) => ({
  history
});

const concat = (logs1: TestLogs, logs2: TestLogs): TestLogs =>
  initLogsWith(Arr.flatten([ logs1.history, logs2.history ]));

const single = (message: string): TestLogs =>
  addLogEntry(init(), message);

export const TestLogs = {
  getOrInit: (logs?: TestLogs): TestLogs => logs !== undefined ? logs : initLogsWith([ ]),
  init,
  initLogsWith,
  concat,
  addLogEntry,
  single
};
