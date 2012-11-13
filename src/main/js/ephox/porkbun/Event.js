define(
  'ephox.porkbun.Event',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct'
  ],
  function (Arr, Struct) {

    /** :: ([String]) -> Event */
    return function (fields) {
      var struct = Struct.immutable.apply(null, fields);

      var handlers = [];

      var bind = function (handler) {
        if (handler === undefined) {
          throw 'Event bind error: undefined handler';
        }
        handlers.push(handler);
      };

      var unbind = function(handler) {
        var index = Arr.indexOf(handlers, handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      };

      var mkevent = function (fields) {
        try {
          return struct.apply(null, fields);
        } catch (e) {
          throw 'Unable to create struct for event type ' + e;
        }
      };

      var trigger = function (/* fields */) {
        var fields = Array.prototype.slice.call(arguments);
        var event = mkevent(fields);
        Arr.each(handlers, function (handler) {
          handler(event);
        });
      };

      return {
        bind: bind,
        unbind: unbind,
        trigger: trigger
      };
    };
  }
);
