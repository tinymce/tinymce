define(
  'ephox.alloy.foreign.ForeignCache',

  [
    'ephox.alloy.alien.DomState',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun'
  ],

  function (DomState, Dragging, Toggling, ComponentEvents, FieldSchema, ValueSchema, Fun) {
    return function () { 
      var getEvents = function (elem, spec) {
        var evts = DomState.getOrCreate(elem, function () {
          // If we haven't already setup this particular element, then generate any state and config
          // required by its behaviours and put it in the cache.
          var info = ValueSchema.asStructOrDie('foreign.cache.configuration', ValueSchema.objOf([
            FieldSchema.defaulted('events', { }),
            FieldSchema.optionObjOf('behaviours', [
              Toggling.schema(),
              Dragging.schema()
            ]),
            FieldSchema.defaulted('eventOrder', {})

          ]), spec);

          var baseEvents = {
            'alloy.base.behaviour': info.events()
          };

          return ComponentEvents.combine(info, [ Toggling, Dragging ], baseEvents).getOrDie();
        });

        return {
          elem: Fun.constant(elem),
          evts: Fun.constant(evts)
        };
      };

      return {
        getEvents: getEvents
      };
    };
  }
);
