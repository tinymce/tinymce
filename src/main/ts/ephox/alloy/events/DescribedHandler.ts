import { Fun } from '@ephox/katamari';

const nu = (handler, purpose) => {
  return {
    handler,
    purpose: Fun.constant(purpose)
  };
};

const curryArgs = (descHandler, extraArgs) => {
  return {
    handler: Fun.curry.apply(undefined, [ descHandler.handler ].concat(extraArgs)),
    purpose: descHandler.purpose
  };
};

const getHandler = (descHandler) => {
  return descHandler.handler;
};

export {
  nu,
  curryArgs,
  getHandler
};