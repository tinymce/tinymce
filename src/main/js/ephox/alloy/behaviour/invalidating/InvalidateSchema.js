define(
  'ephox.alloy.behaviour.invalidating.InvalidateSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Option'
  ],

  function (Fields, FieldSchema, Option) {
    return [
      FieldSchema.strict('invalidClass'),

      FieldSchema.optionObjOf('notify', [
        FieldSchema.defaulted('aria', 'alert'),
        // Maybe we should use something else.
        FieldSchema.defaulted('getContainer', Option.none),
        FieldSchema.defaulted('validHtml', ''),
        Fields.onHandler('onValid'),
        Fields.onHandler('onInvalid'),
        Fields.onHandler('onValidate')
      ]),

      FieldSchema.optionObjOf('validator', [
        FieldSchema.strict('validate'),
        FieldSchema.defaulted('onEvent', 'input')
      ])
    ];
  }
);