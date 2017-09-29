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

      // Maybe this should be optional
      FieldSchema.strict('isPartOf'),

      FieldSchema.strict('getAttachPoint'),

      FieldSchema.defaulted('cloakVisibilityAttr', 'data-precloak-visibility')
    ];
  }
);