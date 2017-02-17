define(
  'ephox.alloy.behaviour.invalidating.InvalidateSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (FieldSchema, Fun, Option) {
    return [
      FieldSchema.strict('invalidClass'),
      
      FieldSchema.optionObjOf('notify', [
        FieldSchema.defaulted('aria', 'alert'),
        // Maybe we should use something else.
        FieldSchema.defaulted('getContainer', Option.none),
        FieldSchema.defaulted('validHtml', ''),
        FieldSchema.defaulted('onValid', Fun.noop),
        FieldSchema.defaulted('onInvalid', Fun.noop),
        FieldSchema.defaulted('onValidate', Fun.noop)
      ]),

      FieldSchema.optionObjOf('validator', [
        FieldSchema.strict('validate'),
        FieldSchema.defaulted('onEvent', 'input')
      ])
    ];
  }
);