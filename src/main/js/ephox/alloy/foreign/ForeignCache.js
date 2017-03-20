define(
  'ephox.alloy.foreign.ForeignCache',

  [
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id'
  ],

  function (Dragging, Toggling, ComponentEvents, FieldSchema, Objects, ValueSchema, Fun, Id) {
    return function () {
      var magicAttribute = Id.generate('alloy-state');
      
      var getEvents = function (elem, spec) {
        var existing = Objects.readOptFrom(elem.dom(), magicAttribute);
        var elemEvents = existing.getOrThunk(function () {
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

          var evts = ComponentEvents.combine(info, [ Toggling, Dragging ], baseEvents).getOrDie();
          elem.dom()[magicAttribute] = evts;
          return evts;
        });

        return {
          elem: Fun.constant(elem),
          evts: Fun.constant(elemEvents)
        };
      };

      return {
        getEvents: getEvents
      };
    };
  }
);
