import { Fun } from '@ephox/katamari';
import { CurriedHandler, UncurriedHandler } from '../events/EventRegistry';

const uncurried = (handler: Function, purpose: string): UncurriedHandler => {
  return {
    handler,
    purpose: Fun.constant(purpose)
  };
};

const curried = (handler: Function, purpose: string): CurriedHandler => {
  return {
    cHandler: handler,
    purpose: Fun.constant(purpose)
  };
};

const curryArgs = (descHandler: UncurriedHandler, extraArgs: any[]): CurriedHandler => {
  return curried(
    Fun.curry.apply(undefined, [ descHandler.handler ].concat(extraArgs)),
    descHandler.purpose()
  );
};

const getCurried = (descHandler: CurriedHandler): Function => {
  return descHandler.cHandler;
};

const getUncurried = (descHandler: UncurriedHandler): Function => {
  return descHandler.handler;
};

export {
  curried,
  uncurried,
  curryArgs,
  getCurried,
  getUncurried
};