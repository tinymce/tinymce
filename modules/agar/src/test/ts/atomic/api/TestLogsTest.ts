import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';

import * as RawAssertions from 'ephox/agar/api/RawAssertions';
import { addLogEntry, popLogLevel, pushLogLevel, TestLogs, TestLogEntryState, addStackTrace } from 'ephox/agar/api/TestLogs';

UnitTest.test('TestLogsTest', () => {

  const logs = TestLogs.init();

  const addToLog = (s: string) => (logs) => {
    return addLogEntry(logs, s);
  };
  const assertLog = (expected) => (logs) => {
    RawAssertions.assertEq('Checking logs', expected, logs.history);
    return logs;
  };

  const addTraceToLog = (trace: { stack: any }) => (logs) => {
    return addStackTrace(logs, trace);
  };

  Arr.foldl([
    addToLog('alpha'),
    addTraceToLog({ stack: 'alpha-first' }),
    assertLog([
      { message: 'alpha', entries: [ ], state: TestLogEntryState.Original, trace: 'alpha-first' }
    ]),
    addTraceToLog({ stack: null }),
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
    addTraceToLog({ stack: 'during beta-2' }),
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
            trace: 'during beta-2'
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
            trace: 'during beta-2'
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
            trace: 'during beta-2'
          }
        ],
        trace: null
      },
      { message: 'gamma', entries: [ ], state: TestLogEntryState.Original, trace: null },
    ]),

    addTraceToLog({ stack: 'gamma-trace!' }),
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
            trace: 'during beta-2'
          }
        ],
        trace: null
      },
      { message: 'gamma', entries: [ ], state: TestLogEntryState.Original, trace: 'gamma-trace!' },
    ]),
  ], (b, a) => {
    const next = a(b);
    return next;
  }, logs);
});
