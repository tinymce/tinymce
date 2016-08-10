define(
  'ephox.alloy.construct.EventFusion',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.compass.Arr',
    'global!Array'
  ],

  function (EventHandler, Arr, Array) {
    var all = function (handlers, f) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return Arr.foldl(handlers, function (acc, handler) {
          return acc && f(handler).apply(undefined, args);
        }, true);
      };
    };

    var any = function (handlers, f) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return Arr.foldl(handlers, function (acc, handler) {
          return acc || f(handler).apply(undefined, args);
        }, false);
      };
    };

    var fuse = function (handlers) {
      var can = all(handlers, function (handler) {
        return handler.can;
      });

      var abort = any(handlers, function (handler) {
        return handler.abort;
      });

      var run = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        Arr.each(handlers, function (handler) {
          // ASSUMPTION: Return value is unimportant.
          handler.run.apply(undefined, args);
        });
      };

      return EventHandler({
        can: can,
        abort: abort,
        run: run
      });
    };

    return {
      fuse: fuse
    };
  }
);