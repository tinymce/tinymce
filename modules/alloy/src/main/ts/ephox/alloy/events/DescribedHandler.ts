import { Fun } from '@ephox/katamari';

import { CurriedHandler, UncurriedHandler } from './EventRegistry';

const uncurried = (handler: Function, purpose: string): UncurriedHandler => ({
  handler,
  purpose
});

const curried = (handler: Function, purpose: string): CurriedHandler => ({
  cHandler: handler,
  purpose
});

const curryArgs = (descHandler: UncurriedHandler, extraArgs: any[]): CurriedHandler => curried(
  Fun.curry.apply(undefined, ([ descHandler.handler ] as any).concat(extraArgs)),
  descHandler.purpose
);

const getCurried = (descHandler: CurriedHandler): Function => descHandler.cHandler;

const getUncurried = (descHandler: UncurriedHandler): Function => descHandler.handler;

export {
  curried,
  uncurried,
  curryArgs,
  getCurried,
  getUncurried
};
