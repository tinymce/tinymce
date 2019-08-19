import * as Guard from './Guard';
import { Step } from './Step';
import { Chain, Wrap } from './Chain';

const sTryUntilPredicate = <T>(label: string, p: (value: T) => boolean, interval: number = 10, amount: number = 1000): Step<T, T> =>
  sTryUntil(label, Step.predicate(p), interval, amount);

const sTryUntil = <T, U>(label: string, step: Step<T, U>, interval: number = 10, amount: number = 1000): Step<T, U> =>
  Step.control(step, Guard.tryUntil<T, U>(label, interval, amount));

const sTryUntilNot = <T, U>(label: string, step: Step<T, U>, interval: number = 10, amount: number = 1000): Step<T, T> =>
  Step.control(step, Guard.tryUntilNot<T, U>(label, interval, amount));

const sTimeout = <T, U>(label: string, step: Step<T, U>, limit: number = 1000): Step<T, U> =>
  Step.control(step, Guard.timeout<T, U>(label, limit));

const cTryUntilPredicate = <T>(label: string, p: (value: T) => boolean, interval: number = 10, amount: number = 1000): Chain<T, T> =>
  cTryUntil(label, Chain.predicate(p), interval, amount);

const cTryUntil = <T, U>(label: string, chain: Chain<T, U>, interval: number = 10, amount: number = 1000): Chain<T, U> =>
  Chain.control(chain, Guard.tryUntil<Wrap<T>, Wrap<U>>(label, interval, amount));

const cTryUntilNot = <T, U>(label: string, chain: Chain<T, U>, interval: number = 10, amount: number = 1000): Chain<T, T> =>
  Chain.control(chain, Guard.tryUntilNot<Wrap<T>, Wrap<U>>(label, interval, amount));

const cTimeout = <T, U>(label: string, chain: Chain<T, U>, limit: number = 1000): Chain<T, U> =>
  Chain.control(chain, Guard.timeout<Wrap<T>, Wrap<U>>(label, limit));

export {
  sTryUntilPredicate,
  sTryUntil,
  sTryUntilNot,
  sTimeout,
  cTryUntilPredicate,
  cTryUntil,
  cTryUntilNot,
  cTimeout
};
