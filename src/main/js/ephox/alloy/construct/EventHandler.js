define(
  'ephox.alloy.construct.EventHandler',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'global!Array'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Array) {
    var nu = function (parts) {
      return ValueSchema.asRaw('Extracting event.handler', ValueSchema.objOf([
        FieldSchema.field('can', 'can', FieldPresence.defaulted(Fun.constant(true)), ValueSchema.anyValue()),
        FieldSchema.field('abort', 'abort', FieldPresence.defaulted(Fun.constant(false)), ValueSchema.anyValue()),
        FieldSchema.field('run', 'run', FieldPresence.defaulted(Fun.noop), ValueSchema.anyValue())
      ]), parts).getOrDie();
    };

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
        console.log('abort.handler', handler);
        return handler.abort;
      });

      var run = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        Arr.each(handlers, function (handler) {
          // ASSUMPTION: Return value is unimportant.
          handler.run.apply(undefined, args);
        });
      };

      return nu({
        can: can,
        abort: abort,
        run: run
      });
    };

    return {
      fuse: fuse,
      nu: nu
    };
  }
);