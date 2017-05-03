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
      FieldSchema.strict('transitionClass'),
      FieldSchema.strict('destinationAttr'),
      FieldSchema.strict('stateAttr'),
      FieldSchema.strict('initialState'),
      Fields.onHandler('onTransition'),
      FieldSchema.strictOf(
        'routes', 
        ValueSchema.setOf(
          Result.value,
          ValueSchema.setOf(
            Result.value,
            ValueSchema.objOfOnly([
              FieldSchema.option('transition')
            ])
          )
        )
      )
    ];
  }
);
