define(
  'ephox.alloy.foreign.ForeignCache',

  [
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare'
  ],

  function (Dragging, Toggling, ComponentEvents, FieldSchema, ValueSchema, Arr, Fun, Compare) {
    return function () {
      // We can't index these without hashing some particular part of it.
      var cache = [ ];

      var findEvents = function (elem) {
        return Arr.find(cache, function (c) {
          return Compare.eq(c.elem(), elem);
        });
      };

      var getEvents = function (elem, spec) {
        return findEvents(elem).getOrThunk(function () {
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
          
          var r = {
            elem: Fun.constant(elem),
            evts: Fun.constant(evts)
          };

          cache.push(r);
          return r;
        });
      };

      return {
        getEvents: getEvents
      };
    };
  }
);
