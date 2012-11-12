define(
  'ephox.porkbun.Events',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.porkbun.Event'
  ],

  function (Arr, Obj, Event) {

    var base = function () {
      var registry = {};
      var trigger = {};

      var add = function (e) {
        registry[e.name] = {
          bind: e.bind,
          unbind: e.unbind
        };
        trigger[e.name] = e.trigger
      };

      return {
        api: {
          registry: registry,
          trigger: trigger
        },
        add: add
      };
    };

    /** create :: {name : Struct.immutable(...)} -> Events */
    var create = function (typeDefs) {
      var es = base();

      Obj.each(typeDefs, function (struct, name) {
        es.add(Event.simple(name, struct));
      });

      return es.api;
    };

    /** createFromArray :: [Event] -> Events */
    var createFromArray = function (events) {
      var es = base();
      Arr.each(events, function(evt) {
        es.add(evt);
      });
      return es.api;
    };

    return {
      create: create,
      createFromArray: createFromArray
    };
  }
);
