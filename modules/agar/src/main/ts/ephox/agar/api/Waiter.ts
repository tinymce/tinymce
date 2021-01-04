import { Chain } from './Chain';
import * as Guard from './Guard';
import { Step } from './Step';

const defaultAmount = 3000;
const defaultInterval = 10;

const toStep = <T, R>(p: (input: T) => R): Step<T, R> => Step.stateful((input, next) => {
  next(p(input));
});

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

const pTryUntilPredicate = <T>(label: string, p: () => boolean, interval: number = defaultInterval, amount: number = defaultAmount): Promise<T> =>
  Step.toPromise(sTryUntilPredicate<T>(label, p, interval, amount))(undefined);

const pTryUntil = <T, R>(label: string, p: () => R, interval: number = defaultInterval, amount: number = defaultAmount): Promise<R> =>
  Step.toPromise(sTryUntil<T, R>(label, toStep(p), interval, amount))(undefined);

const pTryUntilNot = <T, R>(label: string, p: () => R, interval: number = defaultInterval, amount: number = defaultAmount): Promise<T> =>
  Step.toPromise(sTryUntilNot<T, T>(label, Step.sync(p), interval, amount))(undefined);

const pTimeout = <T, R>(label: string, p: () => R, limit: number = defaultAmount): Promise<R> =>
  Step.toPromise(sTimeout<T, R>(label, toStep(p), limit))(undefined);

const pWait = (time: number): Promise<void> => Step.toPromise(Step.wait<void>(time))(undefined);

export {
  sTryUntilPredicate,
  sTryUntil,
  sTryUntilNot,
  sTimeout,
  cTryUntilPredicate,
  cTryUntil,
  cTryUntilNot,
  cTimeout,
  pTryUntilPredicate,
  pTryUntil,
  pTryUntilNot,
  pTimeout,
  pWait
};
