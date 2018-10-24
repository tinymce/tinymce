import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';

import { RawAssertions } from '../../../../main/ts/ephox/agar/api/Main';
import { addLogEntry, popLogLevel, pushLogLevel, TestLogs, TestLogEntryState } from '../../../../main/ts/ephox/agar/api/TestLogs';

UnitTest.test('Name', () => {

  const logs = TestLogs.init();

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
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null }
    ]),
    addToLog('beta'),
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      { message: 'beta', entries: [ ], state: TestLogEntryState.Original, trace: null }
    ]),
    pushLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Started,
        entries: [ ],
        trace: null
      }
    ]),
    addToLog('beta-1'),
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Started,
        entries: [
          { message: 'beta-1', entries: [ ], state: TestLogEntryState.Original, trace: null }
        ],
        trace: null
      }
    ]),
    pushLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: TestLogEntryState.Started,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    addToLog('beta-1-1'),
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: TestLogEntryState.Started,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: TestLogEntryState.Original, trace: null },
            ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    popLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: TestLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: TestLogEntryState.Original, trace: null },
            ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    addToLog('beta-2'),
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Started,
        entries: [
          {
            message: 'beta-1',
            state: TestLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: TestLogEntryState.Original, trace: null },
            ],
            trace: null
          },
          {
            message: 'beta-2',
            state: TestLogEntryState.Original,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    popLogLevel,
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Finished,
        entries: [
          {
            message: 'beta-1',
            state: TestLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: TestLogEntryState.Original, trace: null },
            ],
            trace: null
          },
          {
            message: 'beta-2',
            state: TestLogEntryState.Original,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      }
    ]),
    addToLog('gamma'),
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: null },
      {
        message: 'beta',
        state: TestLogEntryState.Finished,
        entries: [
          {
            message: 'beta-1',
            state: TestLogEntryState.Finished,
            entries: [
              { message: 'beta-1-1', entries: [ ], state: TestLogEntryState.Original, trace: null },
            ],
            trace: null
          },
          {
            message: 'beta-2',
            state: TestLogEntryState.Original,
            entries: [ ],
            trace: null
          }
        ],
        trace: null
      },
      { message: 'gamma', entries: [ ], state: TestLogEntryState.Original, trace: null }
    ]),
  ], (b, a) => {
    const next = a(b);
    return next;
  }, logs);
});