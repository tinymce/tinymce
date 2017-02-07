define(
  'ephox.alloy.ui.schema.ModalDialogSchema',

  [
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.SelectorFind'
  ],

  function (PartType, FieldSchema, Json, Fun, Option, SelectorFind) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.option('dragBlockClass'),

      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('onEscape')
    ];

    var basic = { sketch: Fun.identity };

    var partTypes = [
      PartType.optional(basic, 'draghandle', '<alloy.dialog.draghandle>', Fun.constant({}), 
        function (detail, spec) {
          return {
            behaviours: {
              dragging: {
                mode: 'mouse',
                getTarget: function (handle) {
                  return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
                },
                blockerClass: detail.dragBlockClass().getOrDie(
                  new Error(
                    'The drag blocker class was not specified for a dialog with a drag handle: \n' + 
                    Json.stringify(spec, null, 2)
                  )
                )
              }
            }
          };
        }
      ),
      PartType.internal(basic, 'title', '<alloy.dialog.title>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'close', '<alloy.dialog.close>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'body', '<alloy.dialog.body>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'footer', '<alloy.dialog.footer>', Fun.constant({}), Fun.constant({})),

      PartType.external(basic, 'blocker', Fun.constant({
        dom: {
          tag: 'div',
          styles: {
            position: 'fixed',
            left: '0px',
            top: '0px',
            right: '0px',
            bottom: '0px'
          }
        }
      }), Fun.constant({ }))
    ];

    return {
      name: Fun.constant('ModalDialog'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);