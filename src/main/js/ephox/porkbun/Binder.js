define(
  'ephox.porkbun.Binder',

  [
  ],

  function () {
    var create = function() {
      var registrations = [];
      var handlers = [];

      var bind = function(registration, handler) {
        var index = registrations.indexOf(registration);
        if (index !== -1) {
          throw 'Bind error: event registration has already been bound';
        }

        registration.bind(handler);

        registrations.push(registration);
        handlers.push(handler);
      };

      var unbind = function(registration) {
        var index = registrations.indexOf(registration);
        if (index === -1) {
          throw 'Unbind error: unknown event registration';
        }

        registration.unbind(handlers[index]);

        registrations.splice(index, 1);
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
