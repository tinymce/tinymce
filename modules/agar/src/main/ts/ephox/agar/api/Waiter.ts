import * as Guard from './Guard';
import { Step } from './Step';
import { Chain } from './Chain';

const defaultAmount = 3000;
const defaultInterval = 10;

const sTryUntilPredicate = <T>(label: string, p: (value: T) => boolean, interval: number = defaultInterval, amount: number = defaultAmount): Step<T, T> =>
  sTryUntil(label, Step.predicate(p), interval, amount);

const sTryUntil = <T, U>(label: string, step: Step<T, U>, interval: number = defaultInterval, amount: number = defaultAmount): Step<T, U> =>
  Step.control(step, Guard.tryUntil<T, U>(label, interval, amount));

const sTryUntilNot = <T, U>(label: string, step: Step<T, U>, interval: number = defaultInterval, amount: number = defaultAmount): Step<T, T> =>
  Step.control(step, Guard.tryUntilNot<T, U>(label, interval, amount));

const sTimeout = <T, U>(label: string, step: Step<T, U>, limit: number = defaultAmount): Step<T, U> =>
  Step.control(step, Guard.timeout<T, U>(label, limit));

const cTryUntilPredicate = <T>(label: string, p: (value: T) => boolean, interval: number = defaultInterval, amount: number = defaultAmount): Chain<T, T> =>
  cTryUntil(label, Chain.predicate(p), interval, amount);

const cTryUntil = <T, U>(label: string, chain: Chain<T, U>, interval: number = defaultInterval, amount: number = defaultAmount): Chain<T, U> =>
  Chain.control(chain, Guard.tryUntil<T, U>(label, interval, amount));

const cTryUntilNot = <T, U>(label: string, chain: Chain<T, U>, interval: number = defaultInterval, amount: number = defaultAmount): Chain<T, T> =>
  Chain.control(chain, Guard.tryUntilNot<T, U>(label, interval, amount));

const cTimeout = <T, U>(label: string, chain: Chain<T, U>, limit: number = defaultAmount): Chain<T, U> =>
  Chain.control(chain, Guard.timeout<T, U>(label, limit));

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
