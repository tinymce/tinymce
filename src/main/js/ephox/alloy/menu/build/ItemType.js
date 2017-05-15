define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, Keying, Representing, Toggling, SystemEvents, EventHandler, Fields, ItemEvents, FieldSchema, Objects, Fun, Merger) {
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
        behaviours: Behaviour.derive([
          info.toggling().fold(Toggling.revoke, Toggling.config),
          Focusing.config({
            ignore: info.ignoreFocus(),
            onFocus: function (component) {
              ItemEvents.onFocus(component);
            }
          }),
          Keying.config({
            mode: 'execution'
          }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: info.data()
            }
          })
        ]),
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
        components: info.components(),

        domModification: info.domModification()
      };
    };

    var schema = [
      FieldSchema.strict('data'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),

      FieldSchema.optionOf('toggling', [
        FieldSchema.strict('toggling')
      ]),

      FieldSchema.defaulted('ignoreFocus', false),
      FieldSchema.defaulted('domModification', { }),
      Fields.output('builder', builder)
    ];



    return schema;
  }
);