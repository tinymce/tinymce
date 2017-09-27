define(
  'ephox.alloy.api.ui.Container',

  [
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Merger'
  ],

  function (SketchBehaviours, Sketcher, Fields, FieldSchema, Merger) {
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
        behaviours: SketchBehaviours.get(detail.containerBehaviours()),
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
        SketchBehaviours.field('containerBehaviours', [ ]),
        // TODO: Deprecate
        FieldSchema.defaulted('events', { }),
        FieldSchema.defaulted('domModification', { }),
        FieldSchema.defaulted('eventOrder', { })
      ]
    });
  }
);