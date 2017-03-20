define(
  'ephox.alloy.behaviour.sandboxing.SandboxSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Option'
  ],

  function (Fields, FieldSchema, Cell, Option) {
    return [
      FieldSchema.state('state', function () {
        return Cell(Option.none());
      }),
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