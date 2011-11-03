define(
  'ephox.porkbun.Binder',

  [
  ],

  function () {
    var create = function() {
      var types = [];
      var handlers = [];

      var bind = function(bund, handler) {
        var index = types.indexOf(bund);
        if (index !== -1) {
          throw 'Bind error: event type has already been bound';
        }

        bund.bind(handler);

        types.push(bund);
        handlers.push(handler);
      };

      var unbind = function(bund) {
        var index = types.indexOf(bund);
        if (index === -1) {
          throw 'Unbind error: unknown event type';
        }

        bund.unbind(handlers[index]);

        types.splice(index, 1);
        handlers.splice(index, 1);
      };

      return {
        bind: bind,
        unbind: unbind
      };
    };

    return {
      create: create
    };
  }
);
