define(
  'ephox.alloy.events.DescribedHandler',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
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

    return {
      nu: nu,
      curryArgs: curryArgs,
      getHandler: getHandler
    }
  }
);
