define(
  'ephox.alloy.api.ui.DataField',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Option'
  ],

  function (Behaviour, Composing, Representing, AlloyEvents, Sketcher, FieldSchema, Option) {
    var factory = function (detail, spec) {
      return {
        uid: detail.uid(),
        dom: detail.dom(),
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.getInitialValue()()
            }
          }),
          Composing.config({
            find: Option.some
          })
        ]),
        events: AlloyEvents.derive([
          AlloyEvents.runOnAttached(function (component, simulatedEvent) {
            Representing.setValue(component, detail.getInitialValue()());
          })
        ])
      };
    };

    return Sketcher.single({
      name: 'DataField',
      factory: factory,
      configFields: [
        FieldSchema.strict('uid'),
        FieldSchema.strict('dom'),
        FieldSchema.strict('getInitialValue')
      ]
    });
  }
);