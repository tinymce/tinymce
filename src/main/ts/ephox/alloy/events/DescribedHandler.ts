import { Fun } from '@ephox/katamari';
import { UncurriedHandler, CurriedHandler } from 'ephox/alloy/events/EventRegistry';

const nu = (handler: Function, purpose: string): UncurriedHandler => {
  return {
    handler,
    purpose: Fun.constant(purpose)
  };
};

const curryArgs = (descHandler: UncurriedHandler, extraArgs: any[]): CurriedHandler => {
  return {
    cHandler: Fun.curry.apply(undefined, [ descHandler.handler ].concat(extraArgs)),
    purpose: descHandler.purpose
  };
};

const getHandler = (descHandler: CurriedHandler) => {
  return descHandler.cHandler;
};

export {
  nu,
  curryArgs,
  getHandler
};