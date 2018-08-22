import { console } from '@ephox/dom-globals';
import { Arr, Fun, Result } from '@ephox/katamari';

import * as AsyncActions from '../pipe/AsyncActions';
import * as GeneralActions from '../pipe/GeneralActions';
import { DieFn, NextFn, Pipe, RunFn } from '../pipe/Pipe';
import { GuardFn } from './Guard';
import { Pipeline } from './Pipeline';
import { Step } from './Step';

export interface Wrap<T> {
  chain: T;
}

export type ChainRunFn<T, U> = RunFn<Wrap<T>, Wrap<U>>;

export interface Chain<T, U> {
  runChain: ChainRunFn<T, U>;
}

export type ChainGuard<T, U, V> = GuardFn<Wrap<T>, Wrap<U>, Wrap<V>>;

// TODO: Add generic step validation later.
const on = function <T, U>(f: (value: T, next: NextFn<Wrap<U>>, die: DieFn) => void): Chain<T, U> {
  const runChain = Pipe(function (input: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn) {
    if (!isInput(input)) {
      console.error('Invalid chain input: ', input);
      die(new Error('Input Value is not a chain: ' + input + '\nfunction: ' + f.toString()));
    }
    else {
      f(input.chain, function (v: Wrap<U>) {
        if (!isInput(v)) {
          console.error('Invalid chain output: ', v);
          die(new Error('Output value is not a chain: ' + v));
        }
        else next(v);
      }, die);
    }

  });

  return {
    runChain: runChain
  };
};

const control = function <T, U, V>(chain: Chain<T, U>, guard: ChainGuard<T, U, V>) {
  return on(function (input: T, next: NextFn<Wrap<V>>, die: DieFn) {
    guard(chain.runChain, wrap(input), function (v: Wrap<V>) {
      next(v);
    }, die);
  });
};

const mapper = function <T, U>(fx: (value: T) => U) {
  return on(function (input: T, next: NextFn<Wrap<U>>, die: DieFn) {
    next(wrap(fx(input)));
  });
};

const identity = mapper(Fun.identity);

const binder = function <T, U, E>(fx: (input: T) => Result<U, E>) {
  return on(function (input: T, next: NextFn<Wrap<U>>, die: DieFn) {
    fx(input).fold(function (err) {
      die(err);
    }, function (v) {
      next(wrap(v));
    });
  });
};

const op = function <T>(fx: (value: T) => void) {
  return on(function (input: T, next: NextFn<Wrap<T>>, die: DieFn) {
    fx(input);
    next(wrap(input));
  });
};

const inject = function <U>(value: U) {
  return on(function (_input: any, next: NextFn<Wrap<U>>, die: DieFn) {
    next(wrap(value));
  });
};

const extract = function <T, U>(chain: Chain<T, U>): ChainRunFn<T, U> {
  if (!chain.runChain) throw ('Step: ' + chain.toString() + ' is not a chain');
  else return chain.runChain;
};

const fromChains = function (chains: Chain<any, any>[]) {
  const cs = Arr.map(chains, extract);

  return on<any, any>(function (value, next, die) {
    Pipeline.async(wrap(value), cs, next, die);
  });
};

const fromChainsWith = function <T>(initial: T, chains: Chain<any, any>[]) {
  return fromChains(
    [inject(initial)].concat(chains)
  );
};

const fromParent = function <T, U>(parent: Chain<T, U>, chains: Chain<U, any>[]) {
  return on(function (cvalue: T, cnext: NextFn<Wrap<U>>, cdie: DieFn) {
    Pipeline.async(wrap(cvalue), [parent.runChain], function (value: Wrap<U>) {
      const cs = Arr.map(chains, function (c) {
        return Pipe(function (_, next, die) {
          // Replace _ with value
          c.runChain(value, next, die);
        });
      });

      Pipeline.async(wrap(cvalue), cs, function () {
        // Ignore all the values and use the original
        cnext(value);
      }, cdie);
    }, cdie);
  });
};

const asStep = function <T, U>(initial: U, chains: Chain<any, any>[]) {
  return Step.async<T>(function (next, die) {
    const cs = Arr.map(chains, extract);

    Pipeline.async(wrap(initial), cs, function () {
      // Ignore all the values and use the original
      next();
    }, die);
  });
};

// Convenience functions
const debugging = op(GeneralActions.debug);

const log = function <T>(message: string) {
  return op<T>(GeneralActions.log(message));
};

const wait = function <T>(amount: number) {
  return on<T, T>(function (input: T, next: NextFn<Wrap<T>>, die: DieFn) {
    AsyncActions.delay(amount)(function () {
      next(wrap(input));
    }, die);
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

const pipeline = function (chains: Chain<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, delay_doNotUse?: number) {
  Pipeline.async(wrap({}), Arr.map(chains, extract), function (input) {
    onSuccess(unwrap(input));
  }, onFailure, delay_doNotUse);
};

export const Chain = {
  on,
  op,
  control,
  mapper,
  identity,
  binder,

  inject,
  fromChains,
  fromChainsWith,
  fromParent,
  asStep,
  wrap,
  unwrap,
  wait,
  debugging,
  log,

  pipeline
};