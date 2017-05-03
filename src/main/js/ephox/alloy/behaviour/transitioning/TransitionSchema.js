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
      FieldSchema.strict('property'),
      FieldSchema.strict('transitionClass'),
      FieldSchema.strict('destinationAttr'),
      FieldSchema.strict('stateAttr'),
      Fields.onHandler('onTransition'),
      FieldSchema.strictOf(
        'routes', 
        ValueSchema.setOf(
          Result.value,
          ValueSchema.setOf(
            Result.value,
            ValueSchema.objOfOnly([
              FieldSchema.strict('property')
            ])
          )
        )
      )
    ];
  }
);
