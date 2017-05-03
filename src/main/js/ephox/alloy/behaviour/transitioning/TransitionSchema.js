define(
  'ephox.alloy.behaviour.transitioning.TransitionSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema'
  ],

  function (Fields, FieldSchema) {
    return [
      FieldSchema.strict('transitionClass'),
      FieldSchema.strict('destinationAttr'),
      Fields.onHandler('onTransition')
    ];
  }
);
