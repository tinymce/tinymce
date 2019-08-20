import { console } from '@ephox/dom-globals';
import { Arr, Fun, Result } from '@ephox/katamari';

import * as AsyncActions from '../pipe/AsyncActions';
import * as GeneralActions from '../pipe/GeneralActions';
import { DieFn, NextFn, Pipe, RunFn } from '../pipe/Pipe';
import { GuardFn, addLogging } from './Guard';
import { Pipeline } from './Pipeline';
import { Step } from './Step';
import { TestLogs, addLogEntry } from './TestLogs';

export interface Wrap<T> {
  chain: T;
}

export type ChainRunFn<T, U> = RunFn<Wrap<T>, Wrap<U>>;

export interface Chain<T, U> {
  runChain: ChainRunFn<T, U>;
}

export type ChainGuard<T, U, V> = GuardFn<Wrap<T>, Wrap<U>, Wrap<V>>;

// TODO: Add generic step validation later.
const on = function <T, U>(f: (value: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => void): Chain<T, U> {
  const runChain = Pipe((input: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => {
    if (!isInput(input)) {
      // tslint:disable-next-line:no-console
      console.error('Invalid chain input: ', input);
      die(new Error('Input Value is not a chain: ' + input + '\nfunction: ' + f.toString()), logs);
    } else {
      f(input.chain, function (v: Wrap<U>, newLogs) {
        if (!isInput(v)) {
          // tslint:disable-next-line:no-console
          console.error('Invalid chain output: ', v);
          die(new Error('Output value is not a chain: ' + v), newLogs);
        } else {
          next(v, newLogs);
        }
      }, (err, newLogs) => die(err, newLogs), logs);
    }

  });

  return {
    runChain
  };
};

const control = function <T, U, V>(chain: Chain<T, U>, guard: ChainGuard<T, U, V>) {
  return on(function (input: T, next: NextFn<Wrap<V>>, die: DieFn, logs: TestLogs) {
    guard(chain.runChain, wrap(input), function (v: Wrap<V>, newLogs: TestLogs) {
      next(v, newLogs);
    }, die, logs);
  });
};

const mapper = function <T, U>(fx: (value: T) => U) {
  return on(function (input: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) {
    next(wrap(fx(input)), logs);
  });
};

const identity = mapper(Fun.identity);

const binder = function <T, U, E>(fx: (input: T) => Result<U, E>) {
  return on(function (input: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) {
    fx(input).fold(function (err) {
      die(err, logs);
    }, function (v) {
      next(wrap(v), logs);
    });
  });
};

const op = function <T>(fx: (value: T) => void): Chain<T, T> {
  return on(function (input: T, next: NextFn<Wrap<T>>, die: DieFn, logs: TestLogs) {
    fx(input);
    next(wrap(input), logs);
  });
};

const async = <T, U>(fx: (input: T, next: (v: U) => void, die: (err) => void) => void) =>
  on<T, U>((v, n, d, logs) => fx(v, (v) => n(wrap(v), logs) , (err) => d(err, logs)));

const inject = function <U>(value: U) {
  return on(function (_input: any, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) {
    next(wrap(value), logs);
  });
};

const injectThunked = <U>(f: () => U) => {
  return on((_input: any, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => {
    next(wrap(f()), logs);
  });
};

const extract = function <T, U>(chain: Chain<T, U>): ChainRunFn<T, U> {
  if (!chain.runChain) {
    throw new Error(('Step: ' + chain.toString() + ' is not a chain'));
  } else {
    return chain.runChain;
  }
};

const fromChains = function (chains: Chain<any, any>[]) {
  const cs = Arr.map(chains, extract);

  return on<any, any>((value, next, die, initLogs) => {
    Pipeline.async(wrap(value), cs, (v, newLogs) => next(v, newLogs), die, initLogs);
  });
};

const fromChainsWith = function <T>(initial: T, chains: Chain<any, any>[]) {
  return fromChains(
    [inject(initial)].concat(chains)
  );
};

const fromParent = function <T, U>(parent: Chain<T, U>, chains: Chain<U, any>[]) {
  return on(function (cvalue: T, cnext: NextFn<Wrap<U>>, cdie: DieFn, clogs: TestLogs) {
    Pipeline.async(wrap(cvalue), [parent.runChain], function (value: Wrap<U>, parentLogs: TestLogs) {
      const cs = Arr.map(chains, function (c) {
        return Pipe(function (_, next, die, logs) {
          // Replace _ with value
          c.runChain(value, next, die, logs);
        });
      });

      Pipeline.async(wrap(cvalue), cs, function (_, finalLogs) {
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
      wrap(initial),
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
  return on(function (input: T, next: NextFn<Wrap<T>>, die: DieFn, logs: TestLogs) {
    // tslint:disable-next-line:no-console
    console.log(message);
    next(wrap(input), addLogEntry(logs, message));
  });
};

const label = function <T, U>(label: string, chain: Chain<T, U>) {
  return control(chain, addLogging(label));
};

const wait = function <T>(amount: number) {
  return on<T, T>(function (input: T, next: NextFn<Wrap<T>>, die: DieFn, logs: TestLogs) {
    AsyncActions.delay(amount)(() => next(wrap(input), logs), die);
  });
};

const wrap = function <V>(v: V): Wrap<V> {
  return { chain: v };
};

const unwrap = function <V>(c: Wrap<V>): V {
  return c.chain;
};

const isInput = function (v): v is Wrap<any> {
  return Object.prototype.hasOwnProperty.call(v, 'chain');
};

const pipeline = function (chains: Chain<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, initLogs?: TestLogs) {
  Pipeline.async(wrap({}), Arr.map(chains, extract), (output, logs) => {
    onSuccess(unwrap(output), logs);
  }, onFailure, TestLogs.getOrInit(initLogs));
};

const runStepsOnValue = <I, O>(getSteps: (value: I) => Step<I, O>[]): Chain<I, O> => {
  return Chain.on((input: I, next, die, initLogs) => {
    const steps = getSteps(input);
    Pipeline.async(input, steps, (stepsOutput, newLogs) => next(Chain.wrap(stepsOutput), newLogs), die, initLogs);
  });
};

const predicate = <T> (p: (value: T) => boolean): Chain<T, T> =>
  on((input, next, die, logs) =>
    p(input) ? next(wrap(input), logs) : die('predicate did not succeed', logs));

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
  wrap,
  unwrap,
  wait,
  debugging,
  log,
  label,

  pipeline,
  predicate
};
