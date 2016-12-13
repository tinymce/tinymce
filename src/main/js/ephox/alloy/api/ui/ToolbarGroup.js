define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (BehaviourExport, CompositeBuilder, Fields, DomModification, PartType, FieldSchema, Merger, Fun, Error) {
    var schema = [
      FieldSchema.strict('items'),
      Fields.members([ 'item' ]),
      Fields.markers([ 'itemClass' ]),
      FieldSchema.defaulted('hasTabstop', true)
    ];

    var partTypes = [
      PartType.group({ build: Fun.identity }, 'items', 'item', '<alloy.toolbar-group.items>', Fun.constant({ }), function (detail) {
        return {
          behaviours: {
            'custom.toolbar-group': { }
          },
          customBehaviours: [
            // FIX: Find a better way of doing this.
            BehaviourExport.santa([ ], 'custom.toolbar-group', {
              exhibit: function (base, info) {
                return DomModification.nu({
                  classes: [ detail.markers().itemClass() ]
                });
              }
            }, {


            }, { })
          ]
        };
      })
    ];

    var make = function (detail, components, spec, _externals) {
      return Merger.deepMerge(
        {
          dom: {
            attributes: {
              role: 'toolbar'
            }
          }
        },
        {
          uiType: 'custom',
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,

          behaviours: {
            keying: {
              mode: 'flow',
              selector: '.' + detail.markers().itemClass()
            },
            // fIX: Undefined
            tabstopping: detail.hasTabstop() ? { } : undefined
          }
        }
      );
    };

    /*
    customBehaviours: [
            // TODO: Add highlighting tab class.
            BehaviourExport.santa([ ], 'tabbar.tabbuttons', {
              exhibit: function (base, info) {
                return DomModification.nu({
                  classes: [ barDetail.markers().tabClass() ]
                });
              }
            }, {


            }, { })
            */

    var build = function (spec) {
      return CompositeBuilder.build('toolbar-group', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('toolbar-group', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);