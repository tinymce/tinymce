define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.PartType',
    'ephox.peanut.Fun',
    'ephox.sugar.api.SelectorFind'
  ],

  function (CompositeBuilder, PartType, Fun, SelectorFind) {
    var schema = [
      
    ];

    var basic = { build: Fun.identity };

    var partTypes = [
      PartType.optional(basic, 'handle', '<alloy.dialog.draghandle>', Fun.constant({}), 
        function (detail) {
          return {
            behaviours: {
              dragging: {
                mode: 'mouse',
                getTarget: function (handle) {
                  return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
                }
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
      return {
        uiType: 'container',
        dom: detail.dom(),
        components: components
      };
    };

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);