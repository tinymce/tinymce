define(
  'ephox.alloy.ui.schema.FormCoupledInputsSchema',

  [
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (AddEventsBehaviour, Behaviour, Composing, Toggling, AlloyEvents, NativeEvents, Button, FormField, Fields, AlloyParts, PartType, FieldSchema, Fun) {
    var schema = [
      Fields.onStrictHandler('onLockedChange'),
      Fields.markers([ 'lockClass' ])
    ];

    var getField = function (comp, detail, partName) {
      return AlloyParts.getPart(comp, detail, partName).bind(Composing.getCurrent);
    };

    var coupledPart = function (selfName, otherName) {
      return PartType.required({
        factory: FormField,
        name: selfName,
        overrides: function (detail) {
          return {
            fieldBehaviours: Behaviour.derive([
              AddEventsBehaviour.config('coupled-input-behaviour', [
                AlloyEvents.run(NativeEvents.input(), function (me) {
                  getField(me, detail, otherName).each(function (other) {
                    AlloyParts.getPart(me, detail, 'lock').each(function (lock) {
                      if (Toggling.isOn(lock)) detail.onLockedChange()(me, other, lock);
                    });
                  });
                })
              ])
            ])
          };
        }
      });
    };

    var partTypes = [
      coupledPart('field1', 'field2'),
      coupledPart('field2', 'field1'),

      PartType.required({
        factory: Button,
        schema: [
          FieldSchema.strict('dom')
        ],
        name: 'lock',
        overrides: function (detail) {
          return {
            buttonBehaviours: Behaviour.derive([
              Toggling.config({
                toggleClass: detail.markers().lockClass(),
                aria: {
                  mode: 'pressed'
                }
              })
            ])
          };
        }
      })
    ];

    return {
      name: Fun.constant('CoupledInputs'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);