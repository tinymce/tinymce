define(
  'ephox.alloy.foreign.ForeignCache',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Compare'
  ],

  function (Arr, Compare) {
    return function () {
      // We can't index these without hashing some particular part of it.
      var cache = [ ];


      var findEvents = function (elem) {
        return Arr.find(cache, function (c) {
          return Compare.eq(c.elem(), elem);
        });
      };

      var getEvents = function (elem, delegation) {
        return findEvents(elem).getOrThunk(function () {
          var info = ValueSchema.asStructOrDie('catBehaviours', ValueSchema.objOf([
            FieldSchema.defaulted('events', { }),
            FieldSchema.optionObjOf('behaviours', [
              Toggling.schema(),
              Dragging.schema(),
              Pinching.schema()
            ]),
            FieldSchema.defaulted('eventOrder', {})

          ]), delegation);

          var baseEvents = {
            'alloy.base.behaviour': info.events()
          };

          var evts = ComponentEvents.combine(info, [ Toggling, Dragging, Pinching ], baseEvents).getOrDie();
          
          var r = {
            elem: Fun.constant(elem),
            evts: Fun.constant(evts)
          };

          cache.push(r);
          return r;
        });
      };
    };
  }
);
