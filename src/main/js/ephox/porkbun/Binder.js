define(
  'ephox.porkbun.Binder',

  [
    'ephox.flute.AssocArray'
  ],

  function (AssocArray) {
    var create = function() {
      var registrations = AssocArray();

      var bind = function (registration, handler) {
        registrations.put(registration, handler);
        registration.bind(handler);
      };

      var unbind = function (registration) {
        var handler = registrations.remove(registration);
        registration.unbind(handler);
      };

      var unbindAll = function () {
        registrations.each(function (handler, registration) {
          registration.unbind(handler);
        });
        registrations.reset();
      };

      return {
        bind: bind,
        unbind: unbind,
        unbindAll: unbindAll
      };
    };

    return {
      create: create
    };
  }
);
