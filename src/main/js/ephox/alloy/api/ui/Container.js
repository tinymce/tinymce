define(
  'ephox.alloy.api.ui.Container',

  [
    'ephox.alloy.api.ui.Sketcher',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Merger'
  ],

  function (Sketcher, FieldSchema, Merger) {
    var factory = function (detail, spec) {
      return {
        uid: detail.uid(),
        dom: Merger.deepMerge(
          {
            tag: 'div',
            attributes: {
              role: 'presentation'
            }
          },
          detail.dom()
        ),
        components: detail.components(),
        behaviours: detail.containerBehaviours(),
        events: detail.events(),
        domModification: detail.domModification(),
        eventOrder: detail.eventOrder()
      };
    };

    return Sketcher.single({
      name: 'Container',
      factory: factory,
      configFields: [
        FieldSchema.defaulted('components', [ ]),
        FieldSchema.defaulted('containerBehaviours', { }),
        FieldSchema.defaulted('events', { }),
        FieldSchema.defaulted('domModification', { }),
        FieldSchema.defaulted('eventOrder', { })
      ]
    });
  }
);