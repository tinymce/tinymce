define(
  'ephox.alloy.api.events.AlloyEvents',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun'
  ],

  function (EventHandler, Objects, Fun) {
    var derive = Objects.wrapAll;

    var abort = function (name) {
      return {
        key: name,
        value: EventHandler.nu({
          abort: Fun.constant(true)
        })
      };
    };

    var run = function (name, handler) {
      return {
        key: name,
        value: EventHandler.nu({
          run: handler
        })
      };
    };

    return {
      derive: derive,
      run: run,
      abort: abort
    };
  }
);
