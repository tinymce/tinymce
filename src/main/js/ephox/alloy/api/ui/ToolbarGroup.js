define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.schema.ToolbarGroupSchema',
    'ephox.katamari.api.Merger',
    'global!Error'
  ],

  function (Behaviour, Keying, SketchBehaviours, Sketcher, ToolbarGroupSchema, Merger, Error) {
    var factory = function (detail, components, spec, _externals) {
      return Merger.deepMerge(
        {
          dom: {
            attributes: {
              role: 'toolbar'
            }
          }
        },
        {
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,

          behaviours: Merger.deepMerge(
            Behaviour.derive([
              Keying.config({
                mode: 'flow',
                selector: '.' + detail.markers().itemClass()
              })
            ]),
            SketchBehaviours.get(detail.tgroupBehaviours())
          ),

          'debug.sketcher': spec['debug.sketcher']
        }
      );
    };

    return Sketcher.composite({
      name: 'ToolbarGroup',
      configFields: ToolbarGroupSchema.schema(),
      partFields: ToolbarGroupSchema.parts(),
      factory: factory
    });
  }
);