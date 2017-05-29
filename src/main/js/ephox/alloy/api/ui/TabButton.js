define(
  'ephox.alloy.api.ui.TabButton',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, Keying, Representing, Sketcher, ButtonBase, FieldSchema, Id, Merger) {
    var factory = function (detail, spec) {
      var events = ButtonBase.events(detail.action());

      return {
        dom: Merger.deepMerge(
          detail.dom(),
          {
            attributes: {
              // Really (type=button?)
              type: 'button',
              id: Id.generate('aria'),
              role: detail.role().getOr('tab')
            }
          }
        ),
        components: detail.components(),
        events: events,
        behaviours: Behaviour.derive([
          Focusing.config({ }),
          Keying.config({
            mode: 'execution',
            useSpace: true,
            useEnter: true
          }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.value()
            }
          })
        ]),

        domModification: detail.domModification()
      };
    };

    return Sketcher.single({
      name: 'TabButton',
      configFields: [
        FieldSchema.strict('value'),
        FieldSchema.strict('dom'),
        FieldSchema.option('action'),
        FieldSchema.option('role'),
        FieldSchema.defaulted('domModification', { }),

        // TODO: Move view out of the resultant object.
        FieldSchema.strict('view')         
      ],
      factory: factory
    });
  }
);