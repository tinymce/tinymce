define(
  'ephox.porkbun.Events',

  [
    'ephox.wrap.D'
  ],

  function (D) {
    var create = function (types) {
      var registry = {};
      var trigger = {};

      D(types).each(function (type) {
        var handlers = [];

        var bind = function (handler) {
          if (handler === undefined) {
            throw 'Event bind error: undefined handler bound for event type "' + type + '"';
          }
          handlers.push(handler);
        };

        var unbind = function (handler) {
          if (handler !== undefined) {
            var index = handlers.indexOf(handler);
            if (index !== -1) {
              handlers.splice(index, 1);
            }
          } else {
            handlers = [];
          }
        };

        registry[type] = {
          bind: bind,
          unbind: unbind
        };

        trigger[type] = function (event) {
          D(handlers).each(function (handler) {
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
