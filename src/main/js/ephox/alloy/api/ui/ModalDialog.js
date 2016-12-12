define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.SelectorFind'
  ],

  function (CompositeBuilder, PartType, FieldSchema, Merger, Fun, SelectorFind) {
    var schema = [
      FieldSchema.strict('blockerClass')
    ];

    var basic = { build: Fun.identity };

    var partTypes = [
      PartType.optional(basic, 'draghandle', '<alloy.dialog.draghandle>', Fun.constant({}), 
        function (detail) {
          return {
            behaviours: {
              dragging: {
                mode: 'mouse',
                getTarget: function (handle) {
                  return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
                },
                blockerClass: detail.blockerClass()
              }
            }
          };
        }
      ),
      PartType.internal(basic, 'title', '<alloy.dialog.title>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'close', '<alloy.dialog.close>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'body', '<alloy.dialog.body>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'footer', '<alloy.dialog.footer>', Fun.constant({}), Fun.constant({}))
    ];

    var build = function (spec) {
      return CompositeBuilder.build('modal-dialog', schema, partTypes, make, spec);
    };

    var parts = PartType.generate('modal-dialog', partTypes);

    var make = function (detail, components, spec, externals) {
      return Merger.deepMerge(
        {
          dom: {
            attributes: {
              role: 'dialog'
            }
          }
        },
        {
          uiType: 'container',
          dom: detail.dom(),
          components: components
        }
      );
    };

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);