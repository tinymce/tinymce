define(
  'ephox.alloy.form.SelectInputSpec',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.sugar.api.Value'
  ],

  function (Fields, FormLabelSpec, SpecSchema, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Value) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('label'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),

      FieldSchema.strict('options'),

      Fields.members([ 'option' ]),

      FieldSchema.state('builder', function () {
        return builder;
      })
    ].concat(
      SpecSchema.getPartsSchema([
        'field'
      ])
    );

    // '<alloy.form.field-input>': UiSubstitutes.single(
    //       detail.parts().field()
    //     ),
    //     '<alloy.form.field-label>': UiSubstitutes.single(
    //       Merger.deepMerge(

    var builder = function (info) {

      var options = Arr.map(info.options(), function (option) {
        return Merger.deepMerge(
          info.members().option().munge(option),
          {
            uiType: 'custom',
            dom: {
              tag: 'option'
            }
          }
        );
      });

      return FormLabelSpec.make({
        uid: info.uid(),
        prefix: 'select-input',
        label: {
          text: info.label()
        },
        parts: {
          field: Merger.deepMerge(
            info.parts().field(),
            {
              uiType: 'custom',
              dom: {
                tag: 'select'
              },
              representing: { 
                query: function (input) {
                  return Value.get(input.element());
                },
                set: function (input, value) {
                  Value.set(input.element(), value);
                }
              },
              components: options
            }
          ),
          label: { }
        },
        dom: info.dom(),
        components: info.components()
      });
    };

    return schema;
  }
);