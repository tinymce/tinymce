import { console } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';

import * as ErrorTypes from '../alien/ErrorTypes';
import { DieFn, NextFn, AgarLogs, addLogEntry } from '../pipe/Pipe';
import { Step } from './Step';

const t = function <T, U>(label: string, f: Step<T, U>): Step<T, U> {
  const enrich = function (err) {
    return ErrorTypes.enrichWith(label, err);
  };

  return function (value: T, next: NextFn<U>, die: DieFn, logs: AgarLogs) {
    const updatedLogs = addLogEntry(logs, label);
    const dieWith: DieFn = (err, newLogs) => die(enrich(err), newLogs);
    try {
      return f(value, next, dieWith, updatedLogs);
    } catch (err) {

      dieWith(err, updatedLogs);
    }
  };
};

const sync = function <T>(label: string, f: () => T): T {
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
  if (fs.length === 0) return fs;
  return Arr.map(fs, function (f: Step<T, U>, i: number) {
    return t(label + '(' + i + ')', f);
  });
};

const suite = function () {
  // TMP, WIP
};

const spec = function (msg) {
  // TMP, WIP
  console.log(msg);
};

export {
  t,
  ts,
  sync,
  suite,
  spec
};