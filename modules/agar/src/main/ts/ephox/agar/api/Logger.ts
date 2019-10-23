import { console } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import * as ErrorTypes from '../alien/ErrorTypes';
import { DieFn, NextFn } from '../pipe/Pipe';
import { Step } from './Step';
import { addLogEntry, popLogLevel, pushLogLevel, TestLogs } from './TestLogs';
import { TestLabel } from '@ephox/bedrock-client';

const t = <T, U>(label: string, f: Step<T, U>): Step<T, U> => {
  const enrich = (err) => ErrorTypes.enrichWith(label, err);

  return Step.raw((value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    const updatedLogs = pushLogLevel(addLogEntry(logs, label));
    const dieWith: DieFn = (err, newLogs) => die(enrich(err), popLogLevel(newLogs));
    try {
      return f.runStep(value, (v, newLogs) => next(v, popLogLevel(newLogs)), dieWith, updatedLogs);
    } catch (err) {

      dieWith(err, updatedLogs);
    }
  });
};

const sync = <T>(label: TestLabel, f: () => T): T => {
  const enrich = (err) => ErrorTypes.enrichWith(label, err);

  try {
    return f();
  } catch (err) {
    throw enrich(err);
  }
};

const ts = <T, U>(label: string, fs: Step<T, U>[]): Step<T, U>[] => {
  if (fs.length === 0) {
    return fs;
  }
  return Arr.map(fs, (f: Step<T, U>, i: number) => t(label + '(' + i + ')', f));
};

const spec = (msg): void => {
  // TMP, WIP
  // tslint:disable-next-line:no-console
  console.log(msg);
};

export {
  t,
  ts,
  sync,
  spec
};
