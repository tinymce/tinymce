define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, Focusing, EventHandler, ItemEvents, FieldSchema, Objects, Merger, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('base', { }),
      FieldSchema.defaulted('ignoreFocus', false),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      // info.base() can contain other things like toggling. I need to find a better way to do
      // this though. Putting all the behaviours in a single object will probably do it.
      return Merger.deepMerge(info.base(), {
        uiType: 'custom',
        dom: Merger.deepMerge(
          info.dom(),
          {
            attributes: {
              role: 'menuitem'
            }
          }
        ),
        focusing: {
          ignore: info.ignoreFocus(),
          onFocus: function (component) {
            ItemEvents.onFocus(component);
          }
        },
        events: Objects.wrapAll([
          {
            key: 'click',
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                var target = component.element();
                component.getSystem().triggerEvent(SystemEvents.execute(), target, {
                  target: Fun.constant(target)
                });
              }
            })
          },

          {
            key: 'mousedown',
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                // Like button, stop mousedown propagating up the DOM tree.
                simulatedEvent.cut();
              }
            })
          },

          {
            key: 'mouseover',
            value: ItemEvents.hoverHandler
          },
          {
            key: SystemEvents.focusItem(),
            value: EventHandler.nu({
              run: Focusing.focus
            })
          }
        ]),
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