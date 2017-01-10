define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, Behaviour, Focusing, EventHandler, ItemEvents, FieldSchema, Objects, Merger, Fun) {
    var schema = [
      FieldSchema.strict('data'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),

      FieldSchema.optionOf('toggling', [
        FieldSchema.strict('toggling')
      ]),

      FieldSchema.defaulted('ignoreFocus', false),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      return {
        dom: Merger.deepMerge(
          info.dom(),
          {
            attributes: {
              role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem'
            }
          }
        ),
        behaviours: {
          toggling: info.toggling().getOr(Behaviour.revoke()),
          focusing: {
            ignore: info.ignoreFocus(),
            onFocus: function (component) {
              ItemEvents.onFocus(component);
            }
          },
          keying: {
            mode: 'execution'
          },
          representing: {
            store: {
              mode: 'memory',
              initialValue: info.data()
            }
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
        components: info.components()
      };
    };

    return schema;
  }
);