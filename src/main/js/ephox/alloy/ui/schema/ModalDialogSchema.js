define(
  'ephox.alloy.ui.schema.ModalDialogSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.JSON',
    'ephox.sugar.api.search.SelectorFind',
    'global!Error'
  ],

  function (Behaviour, Dragging, Keying, SketchBehaviours, Fields, PartType, FieldSchema, Fun, Json, SelectorFind, Error) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.option('dragBlockClass'),
      FieldSchema.defaulted('useTabstopAt', Fun.constant(true)),

      SketchBehaviours.field('modalBehaviours', [ Keying ]),

      Fields.onKeyboardHandler('onExecute'),
      Fields.onStrictKeyboardHandler('onEscape')
    ];

    var basic = { sketch: Fun.identity };

    var partTypes = [
      PartType.optional({
        name: 'draghandle',
        overrides: function (detail, spec) {
          return {
            behaviours: Behaviour.derive([
              Dragging.config({
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
              })
            ])
          };
        }
      }),

      PartType.required({
        schema:  [ FieldSchema.strict('dom') ],
        name: 'title'
      }),

      PartType.required({
        factory: basic,
        schema:  [ FieldSchema.strict('dom') ],
        name: 'close'
      }),

      PartType.required({
        factory: basic,
        schema:  [ FieldSchema.strict('dom') ],
        name: 'body'
      }),

      PartType.required({
        factory: basic,
        schema:  [ FieldSchema.strict('dom') ],
        name: 'footer'
      }),

      PartType.external({
        factory: basic,
        name: 'blocker',
        defaults: Fun.constant({
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
        })
      })
    ];

    return {
      name: Fun.constant('ModalDialog'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);