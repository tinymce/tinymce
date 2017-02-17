define(
  'ephox.alloy.behaviour.focusing.FocusSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    return [
      // TODO: Work out when we want to  call this. Only when it is has changed?
      FieldSchema.defaulted('onFocus', Fun.noop),
      FieldSchema.defaulted('ignore', false)
    ];
  }
);