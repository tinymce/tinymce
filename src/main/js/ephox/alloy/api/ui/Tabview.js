define(
  'ephox.alloy.api.ui.Tabview',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Replacing, Sketcher, Merger) {
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

        behaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      };
    };

    return Sketcher.single({
      name: 'Tabview',
      configFields: [ ],
      factory: factory
    });
  }
);