define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (Behaviour, UiBuilder, Fields, DomModification, PartType, FieldSchema, Merger, Fun, Error) {
    var schema = [
      FieldSchema.strict('items'),
      Fields.members([ 'item' ]),
      Fields.markers([ 'itemClass' ]),
      FieldSchema.defaulted('hasTabstop', true)
    ];

    var partTypes = [
      PartType.group({ build: Fun.identity }, 'items', 'item', '<alloy.toolbar-group.items>', Fun.constant({ }), function (detail) {
        return {
          'debug.label': 'ToolbarGroup.item',
          domModification: {
            classes: [ detail.markers().itemClass() ]
          }
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
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,

          behaviours: {
            keying: {
              mode: 'flow',
              selector: '.' + detail.markers().itemClass()
            },
            // fIX: Undefined
            tabstopping: detail.hasTabstop() ? { } : Behaviour.revoke()
          }
        }
      );
    };

    var build = function (spec) {
      return UiBuilder.composite('toolbar-group', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('toolbar-group', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);