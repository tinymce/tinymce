define(
  'ephox.alloy.ui.schema.FormCoupledInputsSchema',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.perhaps.Option'
  ],

  function (Composing, Toggling, Button, FormField, Input, EventHandler, Fields, PartType, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.strict('onLockedChange'),
      Fields.markers([ 'lockClass' ])
    ];

    var formInput = {
      sketch: function (spec) {
        return FormField.sketch(Input, spec);
      }
    };

    var getPart = function (comp, detail, partName) {
      return comp.getSystem().getByUid(detail.partUids()[partName]).fold(Option.none, Option.some);
    };

    var getField = function (comp, detail, partName) {
      return getPart(comp, detail, partName).bind(Composing.getCurrent);
    };

    var coupledPart = function (selfName, otherName) {
      return PartType.internal(
        formInput,
        [
          FieldSchema.strictObjOf('parts', [
            FieldSchema.strictObjOf('label', [
              FieldSchema.strict('dom')
            ]),
            FieldSchema.strict('field')
          ])
        ],
        selfName,
        '<alloy.coupled-inputs.' + selfName + '>',
        Fun.constant({ }),
        function (detail) {
          return {
            events: {
              'input': EventHandler.nu({
                run: function (self) {
                  getField(self, detail, otherName).each(function (other) {
                    getPart(self, detail, 'lock').each(function (lock) {
                      if (Toggling.isSelected(lock)) detail.onLockedChange()(self, other, lock);
                    });
                  });
                }
              })
            }
          };
        }
      );
    };

    var partTypes = [
      coupledPart('field1', 'field2'),
      coupledPart('field2', 'field1'),

      PartType.internal(
        Button,
        [
          FieldSchema.strict('dom')
        ],
        'lock',
        '<alloy.coupled-inputs.lock>',
        Fun.constant({ }),
        function (detail) {
          return {
            behaviours: {
              toggling: {
                toggleClass: detail.markers().lockClass()
              }
            }
          };
        }
      )
    ];

    return {
      name: Fun.constant('CoupledInputs'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    }
  }
);