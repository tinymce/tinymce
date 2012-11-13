define(
  'ephox.porkbun.Binder',

  [
    'ephox.flute.AssocArray'
  ],

  function (AssocArray) {
    var create = function() {
      var registrations = AssocArray();

      var bind = function(registration, handler) {
        registrations.put(registration, handler);
        registration.bind(handler);
      };

      var unbind = function(registration) {
        var handler = registrations.remove(registration)
        registration.unbind(handler);
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
