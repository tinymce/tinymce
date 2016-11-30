define(
  'ephox.alloy.construct.EventHandler',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'global!Array',
    'global!Error'
  ],

  function (FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Json, Fun, Array, Error) {
    var nu = function (parts) {
      if (! Objects.hasKey(parts, 'can') && !Objects.hasKey(parts, 'abort') && !Objects.hasKey(parts, 'run')) throw new Error(
        'EventHandler defined by: ' + Json.stringify(parts, null, 2) + ' does not have can, abort, or run!'
      );
      return ValueSchema.asRawOrDie('Extracting event.handler', ValueSchema.objOf([
        FieldSchema.defaulted('can', Fun.constant(true)),
        FieldSchema.defaulted('abort', Fun.constant(false)),
        FieldSchema.defaulted('run', Fun.noop)
      ]), parts);
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