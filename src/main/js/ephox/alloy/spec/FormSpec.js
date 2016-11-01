define(
  'ephox.alloy.spec.FormSpec',

  [
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (RadioGroupSpec, TextInputSpec, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('uis'),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('ui')
        ])
      )
    ];

    var uiSchema = ValueSchema.choose(
      'type',
      {
        'text-input': TextInputSpec,
        'radio-group': RadioGroupSpec
      }
    );

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('Form', schema, spec, [

      ]);

      var placeholders = {
        '<alloy.form.fields>': UiSubstitutes.multiple(
          Arr.map(detail.uis(), function (ui) {
            var uiSpec = detail.members().ui().munge(ui);
            var itemInfo = ValueSchema.asStructOrDie('ui.spec item', uiSchema, uiSpec);
            return itemInfo.builder()(itemInfo);
          })
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('form'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(spec, {
        dom: detail.dom(),
        uid: detail.uid(),
        uiType: 'container',
        components: components
      });
    };

    return {
      make: make
    };
  }
);