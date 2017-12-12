import { Fun } from '@ephox/katamari';

var nu = function (handler, purpose) {
  return {
    handler: handler,
    purpose: Fun.constant(purpose)
  };
};

var curryArgs = function (descHandler, extraArgs) {
  return {
    handler: Fun.curry.apply(undefined, [ descHandler.handler ].concat(extraArgs)),
    purpose: descHandler.purpose
  };
};

var getHandler = function (descHandler) {
  return descHandler.handler;
};

export default <any> {
  nu: nu,
  curryArgs: curryArgs,
  getHandler: getHandler
};