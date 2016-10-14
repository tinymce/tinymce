define(
  'ephox.alloy.spec.HtmlSelectSpec',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Arr, Merger) {
    // FIX: Test me
    var choiceSchema = ValueSchema.objOf([
      FieldSchema.strict('value'),
      FieldSchema.strict('text')
    ]);

    var schema = ValueSchema.objOf([
      FieldSchema.field(
        'choices',
        'choices',
        FieldPresence.strict(),
        ValueSchema.arrOf(choiceSchema)
      )
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('select.spec', schema, spec);

      return Merger.deepMerge(spec, {
        uiType: 'custom',
        dom: {
          tag: 'select'
        },
        focusing: true,
        components: Arr.map(detail.choices(), function (choice) {
          return {
            uiType: 'custom',
            dom: {
              tag: 'option',
              value: choice.value(),
              innerHtml: choice.text()
            },
            focusing: true,
            components: [ ]
          };
        })
      });
    };

    return {
      make: make
    };
  }
);