define(
  'ephox.alloy.form.CustomFieldSpec',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Representing, FormLabelSpec, FieldSchema, Merger, Fun) {
    var schema = [
      FieldSchema.state('original', Fun.identity),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      return FormLabelSpec.make(
        Merger.deepMerge(
          info.original(),
          {
            representing: {
              query: function (field) {
                var delegate = field.delegate().map(function (dlg) {
                  return dlg.get()(field);
                }).getOr(field);
                return Representing.getValue(delegate);
              },
              set: function (field, value) {
                var delegate = field.delegate().map(function (dlg) {
                  return dlg.get()(field);
                }).getOr(field);
                Representing.setValue(delegate, value);
              }
            }
          }
        )
      );
    };

    return schema;
  }
);