define(
  'ephox.porkbun.Events',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj'
  ],

  function (Arr, Obj) {
    var create = function (typeDefs) {
      var registry = {};
      var trigger = {};

      Obj.each(typeDefs, function (struct, type) {
        var handlers = [];

        var bind = function (handler) {
          if (handler === undefined) {
            throw 'Event bind error: undefined handler bound for event type "' + type + '"';
          }
          handlers.push(handler);
        };

        var unbind = function (handler) {
          var index = Arr.indexOf(handlers, handler);
          if (index !== -1) {
            handlers.splice(index, 1);
          }
        };

        registry[type] = {
          bind: bind,
          unbind: unbind
        };

        var mkevent = function (fields) {
          try {
            return struct.apply(null, fields);
          } catch (e) {
            throw 'Unable to create struct for event type "' + type + '": ' + e;
          }
        };

        trigger[type] = function (/* fields */) {
          var fields = Array.prototype.slice.call(arguments);
          var event = mkevent(fields);
          Arr.each(handlers, function (handler) {
            handler(event);
          });
        };
      });

      return {
        registry: registry,
        trigger: trigger
      };
    };

    return {
      create: create
    };
  }
);
