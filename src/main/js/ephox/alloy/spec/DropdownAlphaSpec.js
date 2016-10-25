define(
  'ephox.alloy.spec.DropdownAlphaSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (SpecSchema, FieldPresence, FieldSchema, ValueSchema) {
    var schema = [
      FieldSchema.strict('dom'),

      FieldSchema.field(
        'parts',
        'parts',
        FieldPresence.strict(),
        ValueSchema.anyValue()
      )
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('dropdown-alpha', schema, spec, [ ]);
      return {
        uiType: 'custom',
        uid: detail.uid(),
        dom: detail.dom(),
        components: detail.components()
      };
    };

    return {
      make: make
    };
  }
);