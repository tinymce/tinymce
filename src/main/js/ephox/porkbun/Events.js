define(
  'ephox.porkbun.Events',

  [
    'ephox.wrap._'
  ],

  function (_) {
    var create = function (typeDefs) {
      var registry = {};
      var trigger = {};

      _.each(typeDefs, function (struct, type) {
        var handlers = [];

        var bind = function (handler) {
          if (handler === undefined) {
            throw 'Event bind error: undefined handler bound for event type "' + type + '"';
          }
          handlers.push(handler);
        };

        var unbind = function (handler) {
          var index = _.indexOf(handlers, handler);
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
          _.each(handlers, function (handler) {
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
