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
const on = <T, U>(f: (value: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => void): Chain<T, U> => {
  const runChain = Pipe((input: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => {
    if (!isInput(input)) {
      // tslint:disable-next-line:no-console
      console.error('Invalid chain input: ', input);
      die(new Error('Input Value is not a chain: ' + input + '\nfunction: ' + f.toString()), logs);
    } else {
      f(input.chain, (v: Wrap<U>, newLogs) => {
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

const control = <T, U, V>(chain: Chain<T, U>, guard: ChainGuard<T, U, V>): Chain<T, V> =>
  on((input: T, next: NextFn<Wrap<V>>, die: DieFn, logs: TestLogs) => {
    guard(chain.runChain, wrap(input), (v: Wrap<V>, newLogs: TestLogs) => {
      next(v, newLogs);
    }, die, logs);
  });

const mapper = <T, U>(fx: (value: T) => U): Chain<T, U> =>
  on((input: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => {
    next(wrap(fx(input)), logs);
  });

const identity = mapper(Fun.identity);

const binder = <T, U, E>(fx: (input: T) => Result<U, E>): Chain<T, U> =>
  on((input: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => {
    fx(input).fold((err) => {
      die(err, logs);
    }, (v) => {
      next(wrap(v), logs);
    });
  });

const op = <T>(fx: (value: T) => void): Chain<T, T> =>
  on((input: T, next: NextFn<Wrap<T>>, die: DieFn, logs: TestLogs) => {
    fx(input);
    next(wrap(input), logs);
  });

const async = <T, U>(fx: (input: T, next: (v: U) => void, die: (err) => void) => void): Chain<T, U> =>
  on<T, U>((v, n, d, logs) =>
    fx(v, (v) => n(wrap(v), logs), (err) => d(err, logs))
  );

const inject = <T, U>(value: U): Chain<T, U> =>
  on((_input: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => {
    next(wrap(value), logs);
  });

const injectThunked = <T, U>(f: () => U): Chain<T, U> =>
  on((_input: T, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => {
    next(wrap(f()), logs);
  });

const extract = <T, U>(chain: Chain<T, U>): ChainRunFn<T, U> => {
  if (!chain.runChain) {
    throw new Error(('Step: ' + chain.toString() + ' is not a chain'));
  } else {
    return chain.runChain;
  }
};

const fromChains = <T = any, U = any>(chains: Chain<any, any>[]): Chain<T, U> => {
  const cs = Arr.map(chains, extract);

  return on<T, U>((value, next, die, initLogs) => {
    Pipeline.async(wrap(value), cs, (v, newLogs) => next(v, newLogs), die, initLogs);
  });
};

const fromChainsWith = <T, U = any, V = any>(initial: T, chains: Chain<any, any>[]): Chain<U, V> =>
  fromChains<U, V>(
    [inject(initial)].concat(chains)
  );

const fromParent = <T, U>(parent: Chain<T, U>, chains: Chain<U, any>[]): Chain<T, U> =>
  on((cvalue: T, cnext: NextFn<Wrap<U>>, cdie: DieFn, clogs: TestLogs) => {
    Pipeline.async(wrap(cvalue), [parent.runChain], (value: Wrap<U>, parentLogs: TestLogs) => {
      const cs = Arr.map(chains, (c) =>
        Pipe((_, next, die, logs) => {
          // Replace _ with value
          c.runChain(value, next, die, logs);
        }));

      Pipeline.async(wrap(cvalue), cs, (_, finalLogs) => {
        // Ignore all the values and use the original
        cnext(value, finalLogs);
      }, cdie, parentLogs);
    }, cdie, clogs);
  });

const asStep = <T, U>(initial: U, chains: Chain<any, any>[]): Step<T, T> =>
  Step.raw<T, T>((initValue, next, die, logs) => {
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

// Convenience functions
const debugging = op(GeneralActions.debug);

const log = <T>(message: string): Chain<T, T> =>
  on((input: T, next: NextFn<Wrap<T>>, die: DieFn, logs: TestLogs) => {
    // tslint:disable-next-line:no-console
    console.log(message);
    next(wrap(input), addLogEntry(logs, message));
  });

const label = <T, U>(label: string, chain: Chain<T, U>): Chain<T, U> =>
  control(chain, addLogging(label));

const wait = <T>(amount: number): Chain<T, T> =>
  on<T, T>((input: T, next: NextFn<Wrap<T>>, die: DieFn, logs: TestLogs) => {
    AsyncActions.delay(amount)(() => next(wrap(input), logs), die);
  });

const wrap = <V>(v: V): Wrap<V> => ({
  chain: v
});

const unwrap = <V>(c: Wrap<V>): V =>
  c.chain;

const isInput = (v): v is Wrap<any> =>
  Object.prototype.hasOwnProperty.call(v, 'chain');

const pipeline = (chains: Chain<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, initLogs?: TestLogs): void => {
  Pipeline.async(wrap({}), Arr.map(chains, extract), (output, logs) => {
    onSuccess(unwrap(output), logs);
  }, onFailure, TestLogs.getOrInit(initLogs));
};

const runStepsOnValue = <I, O>(getSteps: (value: I) => Step<I, O>[]): Chain<I, O> =>
  Chain.on((input: I, next, die, initLogs) => {
    const steps = getSteps(input);
    Pipeline.async(input, steps, (stepsOutput, newLogs) => next(Chain.wrap(stepsOutput), newLogs), die, initLogs);
  });

const predicate = <T>(p: (value: T) => boolean): Chain<T, T> =>
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
