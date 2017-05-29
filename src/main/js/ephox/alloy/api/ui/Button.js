define(
  'ephox.alloy.api.ui.Button',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, Keying, Sketcher, ButtonBase, FieldSchema, Merger) {
    var factory = function (detail, spec) {
      var events = ButtonBase.events(detail.action());

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: detail.components(),
        events: events,
        behaviours: Merger.deepMerge(
          Behaviour.derive([
            Focusing.config({ }),
            Keying.config({
              mode: 'execution',
              useSpace: true,
              useEnter: true
            })
          ]),
          detail.buttonBehaviours()
        ),
        domModification: {
          attributes: {
            type: 'button',
            role: detail.role().getOr('button')
          }
        },
        eventOrder: detail.eventOrder()
      };
    };

    return Sketcher.single({
      name: 'Button',
      factory: factory,
      configFields: [
        FieldSchema.defaulted('uid', undefined),
        FieldSchema.strict('dom'),
        FieldSchema.defaulted('components', [ ]),
        FieldSchema.defaulted('buttonBehaviours', { }),
        FieldSchema.option('action'),
        FieldSchema.option('role'),
        FieldSchema.defaulted('eventOrder', { })
      ]
    });
  }
);