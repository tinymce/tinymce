import { console } from '@ephox/dom-globals';
import { Arr, Fun, Result } from '@ephox/katamari';

import * as AsyncActions from '../pipe/AsyncActions';
import * as GeneralActions from '../pipe/GeneralActions';
import { DieFn, NextFn, Pipe, RunFn } from '../pipe/Pipe';
import { GuardFn, addLogging } from './Guard';
import { Pipeline } from './Pipeline';
import { Step } from './Step';
import { TestLogs, addLogEntry } from './TestLogs';

export type ChainRunFn<T, U> = RunFn<T, U>;

export interface Chain<T, U> {
  runChain: ChainRunFn<T, U>;
}

export type ChainGuard<T, U, V> = GuardFn<T, U, V>;

// TODO: Add generic step validation later.
const on = function <T, U>(f: (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void): Chain<T, U> {
  const runChain = Pipe((input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    f(input, function (v: U, newLogs) {
      next(v, newLogs);
    }, (err, newLogs) => die(err, newLogs), logs);
  });

  return {
    runChain
  };
};

const control = function <T, U, V>(chain: Chain<T, U>, guard: ChainGuard<T, U, V>) {
  return on(function (input: T, next: NextFn<V>, die: DieFn, logs: TestLogs) {
    guard(chain.runChain, input, function (v: V, newLogs: TestLogs) {
      next(v, newLogs);
    }, die, logs);
  });
};

const mapper = function <T, U>(fx: (value: T) => U) {
  return on(function (input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    next(fx(input), logs);
  });
};

const identity = mapper(Fun.identity);

const binder = function <T, U, E>(fx: (input: T) => Result<U, E>) {
  return on(function (input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    fx(input).fold(function (err) {
      die(err, logs);
    }, function (v) {
      next(v, logs);
    });
  });
};

const op = function <T>(fx: (value: T) => void): Chain<T, T> {
  return on(function (input: T, next: NextFn<T>, die: DieFn, logs: TestLogs) {
    fx(input);
    next(input, logs);
  });
};

const async = <T, U>(fx: (input: T, next: (v: U) => void, die: (err) => void) => void) =>
  on<T, U>((v, n, d, logs) => fx(v, (v) => n(v, logs) , (err) => d(err, logs)));

const inject = function <T, U>(value: U): Chain<T, U> {
  return on(function (_input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    next(value, logs);
  });
};

const injectThunked = <T, U>(f: () => U): Chain<T, U> => {
  return on((_input: any, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    next(f(), logs);
  });
};

const extract = function <T, U>(chain: Chain<T, U>): Step<T, U> {
  if (!chain.runChain) {
    throw new Error(('Step: ' + chain.toString() + ' is not a chain'));
  } else {
    return Step.raw(chain.runChain);
  }
};

const fromChains = function <T = any, U = any>(chains: Chain<any, any>[]) {
  const cs = Arr.map(chains, extract);

  return on<T, U>((value, next, die, initLogs) => {
    Pipeline.async(value, cs, (v, newLogs) => next(v, newLogs), die, initLogs);
  });
};

const fromChainsWith = function <T, U = any, V = any>(initial: T, chains: Chain<any, any>[]) {
  return fromChains<U, V>(
    [inject(initial)].concat(chains)
  );
};

const fromParent = function <T, U>(parent: Chain<T, U>, chains: Chain<U, any>[]) {
  return on(function (cvalue: T, cnext: NextFn<U>, cdie: DieFn, clogs: TestLogs) {
    Pipeline.async(cvalue, [Step.raw(parent.runChain)], function (value: U, parentLogs: TestLogs) {
      const cs = Arr.map(chains, function (c) {
        return Step.raw(function (_, next, die, logs) {
          // Replace _ with value
          c.runChain(value, next, die, logs);
        });
      });

      Pipeline.async(cvalue, cs, function (_, finalLogs) {
        // Ignore all the values and use the original
        cnext(value, finalLogs);
      }, cdie, parentLogs);
    }, cdie, clogs);
  });
};

const asStep = function <T, U>(initial: U, chains: Chain<any, any>[]) {
  return Step.raw<T, T>((initValue, next, die, logs) => {
    const cs = Arr.map(chains, extract);

    Pipeline.async(
      initial,
      cs,
      // Ignore all the values and use the original
      (_v, ls) => {
        next(initValue, ls);
      },
      die,
      logs
    );
  });
};

// Convenience functions
const debugging = op(GeneralActions.debug);

const log = function <T>(message: string) {
  return on(function (input: T, next: NextFn<T>, die: DieFn, logs: TestLogs) {
    // tslint:disable-next-line:no-console
    console.log(message);
    next(input, addLogEntry(logs, message));
  });
};

const label = function <T, U>(label: string, chain: Chain<T, U>) {
  return control(chain, addLogging(label));
};

const wait = function <T>(amount: number) {
  return on<T, T>(function (input: T, next: NextFn<T>, die: DieFn, logs: TestLogs) {
    AsyncActions.delay(amount)(() => next(input, logs), die);
  });
};

const pipeline = function (chains: Chain<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, initLogs?: TestLogs) {
  Pipeline.async({}, Arr.map(chains, extract), (output, logs) => {
    onSuccess(output, logs);
  }, onFailure, TestLogs.getOrInit(initLogs));
};

const runStepsOnValue = <I, O>(getSteps: (value: I) => Step<I, O>[]): Chain<I, O> => {
  return Chain.on((input: I, next, die, initLogs) => {
    const steps = getSteps(input);
    Pipeline.async(input, steps, (stepsOutput, newLogs) => next(stepsOutput, newLogs), die, initLogs);
  });
};

const predicate = <T> (p: (value: T) => boolean): Chain<T, T> =>
  on((input, next, die, logs) =>
    p(input) ? next(input, logs) : die('predicate did not succeed', logs));

export const Chain = {
  on,
  op,
  async,
  control,
  mapper,
  identity,
  binder,

  runStepsOnValue,

  inject,
  injectThunked,
  fromChains,
  fromChainsWith,
  fromParent,
  asStep,
  wait,
  debugging,
  log,
  label,

  pipeline,
  predicate
};
