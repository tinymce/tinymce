define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.schema.ToolbarGroupSchema',
    'ephox.katamari.api.Merger',
    'global!Error'
  ],

  function (Behaviour, Keying, Tabstopping, Sketcher, ToolbarGroupSchema, Merger, Error) {
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
              }),
              detail.hasTabstop() ? Tabstopping.config({ }) : Tabstopping.revoke()
            ]),
            detail.tgroupBehaviours()
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