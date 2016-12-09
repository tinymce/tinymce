define(
  'ephox.alloy.api.ui.common.FieldParts',

  [
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.parts.PartType',
    'ephox.peanut.Fun'
  ],

  function (Input, PartType, Fun) {
    return [
      PartType.optional(
        { build: Fun.identity },
        'label',
        '<alloy.form-field.label>',
        Fun.constant({ }),
        Fun.constant({ })
      ),
      PartType.internal(
        Input,
        'field',
        '<alloy.form-field.field>',
        Fun.constant({ }),
        Fun.constant({ })
      )
    ];
  }
);