define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, Keying, Representing, Toggling, AlloyEvents, AlloyTriggers, NativeEvents, SystemEvents, Fields, ItemEvents, FieldSchema, Merger) {
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
          info.toggling().fold(Toggling.revoke, function (tConfig) {
            return Toggling.config(
              Merger.deepMerge({
                aria: {
                  mode: 'checked'
                }
              }, tConfig)
            );
          }),
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
        events: AlloyEvents.derive([
          // Trigger execute when clicked
          AlloyEvents.runWithTarget(SystemEvents.tapOrClick(), AlloyTriggers.emitExecute),

          // Like button, stop mousedown propagating up the DOM tree.
          AlloyEvents.cutter(NativeEvents.mousedown()),

          AlloyEvents.run(NativeEvents.mouseover(), ItemEvents.onHover),

          AlloyEvents.run(SystemEvents.focusItem(), Focusing.focus)
        ]),
        components: info.components(),

        domModification: info.domModification()
      };
    };

    var schema = [
      FieldSchema.strict('data'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),

      FieldSchema.option('toggling'),

      FieldSchema.defaulted('ignoreFocus', false),
      FieldSchema.defaulted('domModification', { }),
      Fields.output('builder', builder)
    ];



    return schema;
  }
);