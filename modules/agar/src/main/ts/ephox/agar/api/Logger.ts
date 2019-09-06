import { console } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';

import * as ErrorTypes from '../alien/ErrorTypes';
import { DieFn, NextFn } from '../pipe/Pipe';
import { Step } from './Step';
import { addLogEntry, popLogLevel, pushLogLevel, TestLogs } from './TestLogs';
import { TestLabel } from '@ephox/bedrock';

const t = function <T, U>(label: string, f: Step<T, U>): Step<T, U> {
  const enrich = function (err) {
    return ErrorTypes.enrichWith(label, err);
  };

  return function (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    const updatedLogs = pushLogLevel(addLogEntry(logs, label));
    const dieWith: DieFn = (err, newLogs) => die(enrich(err), popLogLevel(newLogs));
    try {
      return f(value, (v, newLogs) => next(v, popLogLevel(newLogs)), dieWith, updatedLogs);
    } catch (err) {

      dieWith(err, updatedLogs);
    }
  };
};

const sync = function <T>(label: TestLabel, f: () => T): T {
  const enrich = function (err) {
    return ErrorTypes.enrichWith(label, err);
  };

  try {
    return f();
  } catch (err) {
    throw enrich(err);
  }
};

const ts = function <T, U>(label: string, fs: Step<T, U>[]) {
  if (fs.length === 0) {
    return fs;
  }
  return Arr.map(fs, function (f: Step<T, U>, i: number) {
    return t(label + '(' + i + ')', f);
  });
};

const spec = function (msg) {
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
