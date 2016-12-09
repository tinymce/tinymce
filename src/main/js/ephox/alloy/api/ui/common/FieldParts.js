define(
  'ephox.alloy.api.ui.common.FieldParts',

  [
    'ephox.alloy.parts.PartType',
    'ephox.peanut.Fun'
  ],

  function (PartType, Fun) {
    return function (factory) {
      return [
        PartType.optional(
          { build: Fun.identity },
          'label',
          '<alloy.form-field.label>',
          Fun.constant({ }),
          Fun.constant({ })
        ),
        PartType.internal(
          factory,
          'field',
          '<alloy.form-field.field>',
          Fun.constant({ }),
          Fun.constant({ })
        )
      ];
    };
  }
);