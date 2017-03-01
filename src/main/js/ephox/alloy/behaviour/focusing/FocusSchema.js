define(
  'ephox.alloy.behaviour.focusing.FocusSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema'
  ],

  function (Fields, FieldSchema) {
    return [
      // TODO: Work out when we want to  call this. Only when it is has changed?
      Fields.onHandler('onFocus'),
      FieldSchema.defaulted('ignore', false)
    ];
  }
);