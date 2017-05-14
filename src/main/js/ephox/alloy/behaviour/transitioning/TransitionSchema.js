define(
  'ephox.alloy.behaviour.transitioning.TransitionSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Result'
  ],

  function (Fields, FieldSchema, ValueSchema, Result) {
    return [
      FieldSchema.defaulted('destinationAttr', 'data-transitioning-destination'),
      FieldSchema.defaulted('stateAttr', 'data-transitioning-state'),
      FieldSchema.strict('initialState'),
      Fields.onHandler('onTransition'),
      Fields.onHandler('onFinish'),
      FieldSchema.strictOf(
        'routes',
        ValueSchema.setOf(
          Result.value,
          ValueSchema.setOf(
            Result.value,
            ValueSchema.objOfOnly([
              FieldSchema.optionObjOfOnly('transition', [
                FieldSchema.strict('property'),
                FieldSchema.strict('transitionClass')
              ])
            ])
          )
        )
      )
    ];
  }
);
