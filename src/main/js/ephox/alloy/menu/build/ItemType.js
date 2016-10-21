define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, Behaviour, EventHandler, ItemEvents, MenuMarkers, FieldPresence, FieldSchema, Merger, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('base', { }),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      // info.base() can contain other things like toggling. I need to find a better way to do
      // this though. Putting all the behaviours in a single object will probably do it.
      return Merger.deepMerge(info.base(), {
        uiType: 'custom',
        dom: info.dom(),
        focusing: {
          onFocus: function (component) {
            ItemEvents.onFocus(component);
          }
        },
        events: {
          'click': EventHandler.nu({
            run: function (component) {
              var target = component.element();
              component.getSystem().triggerEvent(SystemEvents.execute(), target, {
                target: Fun.constant(target)
              });
            }
          }),
          'mouseover': ItemEvents.hoverHandler
        },
        keying: {
          mode: 'execution'
        },
        representing: {
          query: function () {
            return info.value();
          },
          set: function () { }
        },
        components: info.components()
      });
    };

    return schema;
  }
);