define(
  'ephox.alloy.api.ui.Tabview',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Replacing, SketchBehaviours, Sketcher, Merger) {
    var factory = function (detail, spec) {
      return {
        uid: detail.uid(),
        dom: Merger.deepMerge(
          {
            tag: 'div',
            attributes: {
              role: 'tabpanel'
            }
          },
          detail.dom()
        ),

        behaviours: Merger.deepMerge(
          Behaviour.derive([
            Replacing.config({ })
          ]),
          SketchBehaviours.get(detail.tabviewBehaviours())
        )
      };
    };

    return Sketcher.single({
      name: 'Tabview',
      configFields: [
        SketchBehaviours.field('tabviewBehaviours', [ Replacing ])
      ],
      factory: factory
    });
  }
);