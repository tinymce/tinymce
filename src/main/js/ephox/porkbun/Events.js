define(
  'ephox.porkbun.Events',

  [
    'ephox.compass.Obj'
  ],

  function (Obj) {

    /** :: {name : Event} -> Events */
    var create = function (typeDefs) {
      var registry = Obj.map(typeDefs, function (event) {
        return {
          bind: event.bind,
          unbind: event.unbind
        };
      });

      var trigger = Obj.map(typeDefs, function (event) {
        return event.trigger;
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
