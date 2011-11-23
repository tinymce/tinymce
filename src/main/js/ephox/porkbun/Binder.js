define(
  'ephox.porkbun.Binder',

  [
    'ephox.alchemy.AssocArray'
  ],

  function (AssocArray) {
    var create = function() {
      var registrationsAndHandlers = AssocArray();

      var bind = function(registration, handler) {
        registrationsAndHandlers.addPair(registration, handler);
        registration.bind(handler);
      };

      var unbind = function(registration) {
        registration.unbind(registrationsAndHandlers.findByKey(registration));
        registrationsAndHandlers.removeByKey(registration);
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
