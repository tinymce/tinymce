define(
  'ephox.alloy.construct.EventFusion',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.compass.Arr',
    'global!Array'
  ],

  function (EventHandler, Arr, Array) {
    var all = function (listeners, f) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return Arr.foldl(listeners, function (acc, listener) {
          return acc && f(listener).apply(undefined, args);
        }, true);
      };
    };

    var any = function (listeners, f) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return Arr.foldl(listeners, function (acc, listener) {
          return acc || f(listener).apply(undefined, args);
        }, false);
      };
    };

    var fuse = function (listeners) {
      var can = all(listeners, function (listener) {
        return listener.can;
      });

      var abort = any(listeners, function (listener) {
        return listener.abort;
      });

      var run = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        Arr.each(listeners, function (listener) {
          // ASSUMPTION: Return value is unimportant.
          listener.run.apply(undefined, args);
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