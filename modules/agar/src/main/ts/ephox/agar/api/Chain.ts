import { Failure } from '@ephox/bedrock-common';
import { Arr, Fun, Result } from '@ephox/katamari';

import * as AsyncActions from '../pipe/AsyncActions';
import * as GeneralActions from '../pipe/GeneralActions';
import { DieFn, NextFn, Pipe, RunFn } from '../pipe/Pipe';
import { addLogging, GuardFn } from './Guard';
import { Pipeline } from './Pipeline';
import { Step } from './Step';
import { addLogEntry, TestLogs } from './TestLogs';

export interface Chain<T, U> {
  runChain: RunFn<T, U>;
}

export type ChainGuard<T, U, V> = GuardFn<T, U, V>;

const on = <T, U>(f: (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void): Chain<T, U> => {
  const runChain = Pipe((input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    f(input, (v: U, newLogs) => {
      next(v, newLogs);
    }, (err, newLogs) => die(err, newLogs), logs);
  });

  return {
    runChain
  };
};

const control = <T, U, V>(chain: Chain<T, U>, guard: ChainGuard<T, U, V>): Chain<T, V> =>
  on((input: T, next: NextFn<V>, die: DieFn, logs: TestLogs) => {
    guard(chain.runChain, input, (v: V, newLogs: TestLogs) => {
      next(v, newLogs);
    }, die, logs);
  });

const mapper = <T, U>(fx: (value: T) => U): Chain<T, U> =>
  on((input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    next(fx(input), logs);
  });

const identity = mapper(Fun.identity);

const binder = <T, U, E>(fx: (input: T) => Result<U, E>): Chain<T, U> =>
  on((input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    fx(input).fold((err) => {
      die(err, logs);
    }, (v) => {
      next(v, logs);
    });
  });

const op = <T>(fx: (value: T) => void): Chain<T, T> =>
  on((input: T, next: NextFn<T>, die: DieFn, logs: TestLogs) => {
    fx(input);
    next(input, logs);
  });

const async = <T, U>(fx: (input: T, next: (v: U) => void, die: (err) => void) => void): Chain<T, U> =>
  on<T, U>((v, n, d, logs) => fx(v, (v) => n(v, logs), (err) => d(err, logs)));

const inject = <T, U>(value: U): Chain<T, U> =>
  on((_input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    next(value, logs);
  });

const injectThunked = <T, U>(f: () => U): Chain<T, U> =>
  on((_input: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    next(f(), logs);
  });

const extract = <T, U>(chain: Chain<T, U>): Step<T, U> => ({
  runStep: chain.runChain
});

const fromChains = <T = any, U = any>(chains: Chain<any, any>[]): Chain<T, U> => {
  const cs = Arr.map(chains, extract);

  return on<T, U>((value, next, die, initLogs) => {
    Pipeline.async(value, cs, (v, newLogs) => next(v, newLogs), die, initLogs);
  });
};

const fromChainsWith = <T, U = any, V = any>(initial: T, chains: Chain<any, any>[]): Chain<U, V> =>
  fromChains<U, V>(
    [ inject(initial) ].concat(chains)
  );

const fromIsolatedChains = <T = any>(chains: Chain<any, any>[]): Chain<T, T> => {
  const cs = Arr.map(chains, extract);

  return on<T, T>((value, next, die, initLogs) => {
    Pipeline.async(value, cs, (_v, newLogs) => {
      // Ignore the output value and use the original value instead
      next(value, newLogs);
    }, die, initLogs);
  });
};

const fromIsolatedChainsWith = <T, U = any>(initial: T, chains: Chain<any, any>[]): Chain<U, U> =>
  fromIsolatedChains<U>(
    [ inject(initial) ].concat(chains)
  );

// Find the first chain which doesn't fail, and use its value. Fails if no chain passes.
const exists = <T, U>(chains: Chain<T, U>[]): Chain<T, U> => {
  const cs = Arr.map(chains, extract);
  let index = 0;

  const attempt = (value: T, next: NextFn<U>, die: DieFn, initLogs: TestLogs): void => {
    let replacementDie = die;
    if (index + 1 < cs.length) {
      replacementDie = () => {
        index += 1;
        attempt(value, next, die, initLogs);
      };
    }

    Pipeline.runStep(value, cs[index], next, replacementDie, initLogs);
  };

  return on(attempt);
};

const fromParent = <T, U, V>(parent: Chain<T, U>, chains: Chain<U, V>[]): Chain<T, U> =>
  on((cvalue: T, cnext: NextFn<U>, cdie: DieFn, clogs: TestLogs) => {
    Pipeline.async(cvalue, [ extract(parent) ], (value: U, parentLogs: TestLogs) => {
      const cs = Arr.map(chains, (c) =>
        Step.raw((_, next, die, logs) => {
          // Replace _ with value
          c.runChain(value, next, die, logs);
        }));

      Pipeline.async(cvalue, cs, (_, finalLogs) => {
        // Ignore all the values and use the original
        cnext(value, finalLogs);
      }, cdie, parentLogs);
    }, cdie, clogs);
  });

/**
 * @deprecated Use isolate() instead
 * TODO: remove
 */
const asStep = <T, U>(initial: U, chains: Chain<any, any>[]): Step<T, T> =>
  Step.raw<T, T>((initValue, next, die, logs) => {
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

/**
 * Wrap a Chain into an "isolated" Step, with its own local state.
 * The state of the outer Step is passed-through.
 * Use the functions in ChainSequence to compose multiple Chains.
 *
 * @param initial
 * @param chain
 */
const isolate = <T, U, V>(initial: U, chain: Chain<U, V>): Step<T, T> =>
  Step.raw<T, T>((initValue, next, die, logs) => {
    Pipeline.runStep(
      initial,
      extract(chain),
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
  on((input: T, next: NextFn<T>, die: DieFn, logs: TestLogs) => {
    // eslint-disable-next-line no-console
    console.log(message);
    next(input, addLogEntry(logs, message));
  });

const label = <T, U>(label: string, chain: Chain<T, U>): Chain<T, U> =>
  control(chain, addLogging(label));

const wait = <T>(amount: number): Chain<T, T> =>
  on<T, T>((input: T, next: NextFn<T>, die: DieFn, logs: TestLogs) => {
    AsyncActions.delay(amount)(() => next(input, logs), die);
  });

const pipeline = (chains: Chain<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, initLogs?: TestLogs): void => {
  Pipeline.async({}, Arr.map(chains, extract), (output, logs) => {
    onSuccess(output, logs);
  }, onFailure, TestLogs.getOrInit(initLogs));
};

const runStepsOnValue = <I, O>(getSteps: (value: I) => Step<I, O>[]): Chain<I, O> =>
  Chain.on((input: I, next, die, initLogs) => {
    const steps = getSteps(input);
    Pipeline.async(input, steps, (stepsOutput, newLogs) => next(stepsOutput, newLogs), die, initLogs);
  });

const predicate = <T>(p: (value: T) => boolean): Chain<T, T> =>
  on((input, next, die, logs) =>
    p(input) ? next(input, logs) : die('predicate did not succeed', logs));

const toPromise = <A, B>(c: Chain<A, B>) => (a: A): Promise<B> =>
  new Promise((resolve, reject) => {
    c.runChain(a,
      (b, _logs) => {
        // TODO: What to do with logs? We lose them.
        resolve(b);
      }, (err, logs) => {
        reject(Failure.prepFailure(err, logs));
      },
      TestLogs.init()
    );
  });

const fromPromise = <A, B>(f: (a: A) => Promise<B>): Chain<A, B> => Chain.async((input, next, die) => {
  f(input).then(next, die);
});

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
  fromIsolatedChains,
  fromIsolatedChainsWith,
  exists,
  fromParent,
  asStep,
  isolate,
  wait,
  debugging,
  log,
  label,

  toPromise,
  fromPromise,

  pipeline,
  predicate
};
