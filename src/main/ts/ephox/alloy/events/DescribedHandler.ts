import { Fun } from '@ephox/katamari';

const nu = function (handler, purpose) {
  return {
    handler,
    purpose: Fun.constant(purpose)
  };
};

const curryArgs = function (descHandler, extraArgs) {
  return {
    handler: Fun.curry.apply(undefined, [ descHandler.handler ].concat(extraArgs)),
    purpose: descHandler.purpose
  };
};

const getHandler = function (descHandler) {
  return descHandler.handler;
};

export {
  nu,
  curryArgs,
  getHandler
};