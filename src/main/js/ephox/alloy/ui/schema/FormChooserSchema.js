define(
  'ephox.alloy.ui.schema.FormChooserSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Behaviour, Composing, Focusing, Highlighting, Keying, Representing, SketchBehaviours, Fields, PartType, ButtonBase, FieldSchema, Objects, Fun, Option) {
    var schema = [
      FieldSchema.strict('choices'),
      SketchBehaviours.field('chooserBehaviours', [ Keying, Highlighting, Composing, Representing ]),
      Fields.markers([ 'choiceClass', 'selectedClass' ])
    ];

    var partTypes = [
      PartType.required({
        name: 'legend',
        defaults: function (detail) {
          return {
            dom: {
              tag: 'legend'
            }
          };
        }
      }),

      PartType.group({
        factory: {
          sketch: function (spec) {
            return Objects.exclude(spec, [ 'value' ]);
          }
        },
        name: 'choices',
        unit: 'choice',
        overrides: function (detail, choiceSpec) {
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
      })
    ];

    return {
      name: Fun.constant('FormChooser'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);