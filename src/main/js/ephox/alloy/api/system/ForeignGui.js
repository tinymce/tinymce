define(
  'ephox.alloy.api.system.ForeignGui',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.sugar.api.dom.Insert'
  ],

  function (FieldSchema, ValueSchema, Insert) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('element'),
      FieldSchema.strictArrayOfObj('dynamics', [
        FieldSchema.strict('getTarget'),
        FieldSchema.strict('config')
      ]),
      FieldSchema.defaulted('insertion', function (root, system) {
        Insert.append(root, system.element());
      })
    ]);

    var imbue = function (spec) {
      var detail = ValueSchema.asStructOrDie('ForeignGui', schema, spec);

      return detail;
    };

    return {
      imbue: imbue
    };
  }
);
