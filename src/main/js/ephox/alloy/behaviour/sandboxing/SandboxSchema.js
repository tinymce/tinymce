define(
  'ephox.alloy.behaviour.sandboxing.SandboxSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema'
  ],

  function (Fields, FieldSchema) {
    return [
      Fields.onHandler('onOpen'),
      Fields.onHandler('onClose'),

      // TODO: async === false is untested
      FieldSchema.defaulted('async', true),

      // Maybe this should be optional
      FieldSchema.strict('isPartOf'),

      FieldSchema.strict('getAttachPoint')
    ];
  }
);