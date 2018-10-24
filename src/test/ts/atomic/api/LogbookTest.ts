import { UnitTest } from "@ephox/bedrock";
import { AgarLogs, addLogEntry, pushLogLevel, popLogLevel, AgarLogEntryState } from "../../../../main/ts/ephox/agar/pipe/Pipe";
import { Arr } from "@ephox/katamari";
import { RawAssertions } from "../../../../main/ts/ephox/agar/api/Main";

UnitTest.test('Name', () => {

  const logs = AgarLogs.init();

  const addToLog = (s: string) => (logs) => {
    return addLogEntry(logs, s);
  };
  const assertLog = (expected) => (logs) => {
    RawAssertions.assertEq('Checking logs', expected, logs.history);
    return logs;
  };

  Arr.foldl([
    addToLog('alpha'),
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null }
    ]),
    addToLog('beta'),
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      { message: 'beta', entries: [ ], state: AgarLogEntryState.Original, trace: null }
    ]),
    pushLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Started,
        entries: [ ],
        trace: null
      }
    ]),
    addToLog('beta-1'),
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Started,
        entries: [
          { message: 'beta-1', entries: [ ], state: AgarLogEntryState.Original, trace: null }
        ],
        trace: null
      }
    ]),
    pushLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: AgarLogEntryState.Started,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    addToLog('beta-1-1'),
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: AgarLogEntryState.Started,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: AgarLogEntryState.Original, trace: null },
            ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    popLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: AgarLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: AgarLogEntryState.Original, trace: null },
            ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    addToLog('beta-2'),
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: AgarLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: AgarLogEntryState.Original, trace: null },
            ],
            trace: null
          },
          {
            message: 'beta-2',
            state: AgarLogEntryState.Original,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    popLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Finished,
        entries: [
          {
            message: 'beta-1',
            state: AgarLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: AgarLogEntryState.Original, trace: null },
            ],
            trace: null
          },
          {
            message: 'beta-2',
            state: AgarLogEntryState.Original,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    addToLog('gamma'),
    assertLog([
      { message: 'alpha', entries: [ ], state: AgarLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: AgarLogEntryState.Finished,
        entries: [
          {
            message: 'beta-1',
            state: AgarLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: AgarLogEntryState.Original, trace: null },
            ],
            trace: null
          },
          {
            message: 'beta-2',
            state: AgarLogEntryState.Original,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      },
      { message: 'gamma', entries: [ ], state: AgarLogEntryState.Original, trace: null }
    ]),
  ], (b, a) => {
    const next = a(b);
    return next;
  }, logs);
});