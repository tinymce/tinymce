define(
  'ephox.alloy.ui.schema.FormChooserSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Behaviour, Focusing, Representing, Fields, PartType, ButtonBase, FieldSchema, Fun, Option) {
    var schema = [
      Fields.members([ 'choice' ]),
      FieldSchema.strict('choices'),
      FieldSchema.defaulted('chooserBehaviours'),
      Fields.markers([ 'choiceClass', 'selectedClass' ])
    ];

    var partTypes = [
      PartType.internal(
        { sketch: Fun.identity },
        [ ],
        'legend',
        '<alloy.form-chooser.legend>',
        function (detail) {
          return {
            dom: {
              tag: 'legend'
            }
          };
        },
        Fun.constant({ })
      ),

      PartType.group(
        { sketch: Fun.identity },
        [ ],
        'choices',
        'choice',
        '<alloy.form-chooser.choices>',
        Fun.constant({ }),
        function (detail, choiceSpec) {
          return {
            dom: {
              // Consider making a domModification, although we probably do not want it overwritten.
              attributes: {
                role: 'radio'
              }
            },
            behaviours: Behaviour.derive([
              Representing.config({
                store: {
                  mode: 'memory',
                  initialValue: choiceSpec.value
                }
              }),
              Focusing.config({ })
            ]),

            domModification: {
              classes: [ detail.markers().choiceClass() ]
            },
            events: ButtonBase.events(Option.none())
          };
        }
      )
    ];

    return {
      name: Fun.constant('FormChooser'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);