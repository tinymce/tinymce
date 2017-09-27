define(
  'ephox.alloy.api.ui.Button',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.data.Fields',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, Keying, SketchBehaviours, Sketcher, Fields, ButtonBase, FieldSchema, Objects, Merger) {
    var factory = function (detail, spec) {
      var events = ButtonBase.events(detail.action());

      var optType = Objects.readOptFrom(detail.dom(), 'attributes').bind(Objects.readOpt('type'));
      var optTag = Objects.readOptFrom(detail.dom(), 'tag');

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
          SketchBehaviours.get(detail.buttonBehaviours())
        ),
        domModification: {
          attributes: Merger.deepMerge(
            optType.fold(function () {
              return optTag.is('button') ? { type: 'button' } : { };
            }, function (t) {
              return { };
            }),
            {
              role: detail.role().getOr('button')
            }
          )
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
        SketchBehaviours.field('buttonBehaviours', [ Focusing, Keying ]),
        FieldSchema.option('action'),
        FieldSchema.option('role'),
        FieldSchema.defaulted('eventOrder', { })
      ]
    });
  }
);